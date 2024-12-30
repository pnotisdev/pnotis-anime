import db from '../../../../database';
import { verify } from 'jsonwebtoken';
import axios from 'axios';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // First check our database
      db.get("SELECT * FROM anime WHERE mal_id = ?", [id], async (err, anime) => {
        if (err) {
          return res.status(500).json({ error: 'Internal server error' });
        }

        // If no anime found or missing basic info, fetch from MAL
        if (!anime || !anime.title) {
          try {
            const { data } = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
            const malData = data.data;

            // Insert or update anime data
            db.run(`
              INSERT OR REPLACE INTO anime (
                mal_id, title, synopsis, episodes, image_url, genres
              ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
              id,
              malData.title,
              malData.synopsis,
              malData.episodes,
              malData.images.jpg.large_image_url,
              JSON.stringify(malData.genres.map(g => g.name))
            ], function(err) {
              if (err) {
                console.error('Error saving anime:', err);
                return res.status(500).json({ error: 'Failed to save anime data' });
              }

              // Return the MAL data directly
              return res.status(200).json({
                mal_id: id,
                title: malData.title,
                synopsis: malData.synopsis,
                episodes: malData.episodes,
                image_url: malData.images.jpg.large_image_url,
                genres: malData.genres.map(g => g.name)
              });
            });
          } catch (error) {
            console.error('Error fetching from MAL:', error);
            return res.status(500).json({ error: 'Failed to fetch anime data' });
          }
        } else {
          // Return existing data
          anime.genres = JSON.parse(anime.genres || '[]');
          return res.status(200).json(anime);
        }
      });
    } catch (error) {
      console.error('Error in anime API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    return;
  }

  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const { userId } = verify(token, 'secret');

    if (req.method === 'PUT') {
      const { status, rating } = req.body;

      // Check if the anime exists for the user
      db.get("SELECT * FROM anime WHERE mal_id = ? AND user_id = ?", [id, userId], (err, anime) => {
        if (err) {
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!anime) {
          // If the anime doesn't exist for the user, create it
          db.run("INSERT INTO anime (mal_id, user_id) VALUES (?, ?)", [id, userId], function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create anime entry' });
            }
            // After creating, proceed with the update
            updateAnime(id, userId, status, rating, res);
          });
        } else {
          // If the anime exists, proceed with the update
          updateAnime(id, userId, status, rating, res);
        }
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in anime API:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

function updateAnime(id, userId, status, rating, res) {
  let query, params;
  if (status) {
    query = "UPDATE anime SET status = ? WHERE mal_id = ? AND user_id = ?";
    params = [status, id, userId];
  } else if (rating !== undefined) {
    query = "UPDATE anime SET rating = ? WHERE mal_id = ? AND user_id = ?";
    params = [rating, id, userId];
  } else {
    return res.status(400).json({ error: 'Invalid request' });
  }

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Anime updated successfully' });
  });
}
