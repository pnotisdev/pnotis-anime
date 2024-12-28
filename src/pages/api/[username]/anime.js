import db from '../../../../database';
import { verify } from 'jsonwebtoken';
import axios from 'axios';

export default async function handler(req, res) {
  const { username } = req.query;

  if (req.method === 'GET' && (req.query.q || req.query.malId)) {
    try {
      if (req.query.malId) {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${req.query.malId}`);
        return res.status(200).json(response.data);
      }
      if (req.query.q) {
        const response = await axios.get('https://api.jikan.moe/v4/anime', {
          params: { q: req.query.q },
        });
        return res.status(200).json(response.data);
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch from Jikan' });
    }
  }

  if (req.method === 'GET') {
    db.get("SELECT id FROM users WHERE username = ?", [username], (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      db.all("SELECT * FROM anime WHERE user_id = ?", [user.id], (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        return res.status(200).json(rows);
      });
    });
    return;
  }

  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const { userId } = verify(token, 'secret');

    // Verify that the token belongs to the requested username
    db.get("SELECT * FROM users WHERE id = ? AND username = ?", [userId, username], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (req.method === 'POST') {
        const { title, status, currentEpisode, totalEpisodes, malId, jikanStatus } = req.body;
        
        if (!title || !status || !malId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        db.run(
          "INSERT INTO anime (title, status, current_episode, total_episodes, mal_id, jikan_status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [title, status, currentEpisode, totalEpisodes, malId, jikanStatus, userId],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Internal server error', details: err.message });
            }
            return res.status(201).json({ id: this.lastID, title, status, currentEpisode, totalEpisodes, malId, jikanStatus });
          }
        );
      } else if (req.method === 'DELETE') {
        const animeId = req.query.id;
        db.run("DELETE FROM anime WHERE id = ? AND user_id = ?", [animeId, userId], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Internal server error' });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Anime not found or not owned by user' });
          }
          return res.status(200).json({ message: 'Anime removed successfully' });
        });
      } else if (req.method === 'PUT') {
        const animeId = req.query.id;
        const { title, status, currentEpisode } = req.body;
        db.run(
          "UPDATE anime SET title = ?, status = ?, current_episode = ? WHERE id = ? AND user_id = ?", 
          [title, status, currentEpisode, animeId, userId], 
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Internal server error' });
            }
            if (this.changes === 0) {
              return res.status(404).json({ error: 'Anime not found or not owned by user' });
            }
            return res.status(200).json({ id: animeId, title, status, currentEpisode });
          }
        );
      } else {
        return res.status(405).json({ error: 'Method not allowed' });
      }
    });
  } catch (error) {
    console.error('Error in anime API:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
