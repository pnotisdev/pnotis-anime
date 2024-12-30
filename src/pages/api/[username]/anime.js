import db from '../../../../database';
import { verify } from 'jsonwebtoken';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';

// Initialize cache with 30 minutes TTL
const cache = new NodeCache({ stdTTL: 1800 });

// Create rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

async function searchAnime(query, malId) {
  if (!query && !malId) {
    throw new Error('Query or MAL ID required');
  }

  const cacheKey = malId || `search-${query}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await axios.get(
      malId 
        ? `https://api.jikan.moe/v4/anime/${malId}`
        : 'https://api.jikan.moe/v4/anime', {
          params: malId ? {} : { q: query }
        }
    );

    cache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Jikan API error:', error.response?.data);
    throw error;
  }
}

export default async function handler(req, res) {
  // Add logging to debug
  console.log('Search query:', req.query);

  // Apply rate limiting
  await new Promise((resolve) => limiter(req, res, resolve));

  const { username } = req.query;

  if (req.method === 'GET' && (req.query.q || req.query.malId)) {
    try {
      const data = await searchAnime(req.query.q, req.query.malId);
      // Add logging to see response
      console.log('Search results:', data);
      return res.status(200).json(data);
    } catch (error) {
      console.error('Search error:', error);
      return res.status(500).json({ 
        error: error.message,
        details: error.response?.data 
      });
    }
  }

  if (req.method === 'GET') {
    const { sort, filter, order = 'asc' } = req.query;

    db.get("SELECT id FROM users WHERE username = ?", [username], (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let query = "SELECT * FROM anime WHERE user_id = ?";
      const params = [user.id];

      // Add filtering
      if (filter) {
        query += " AND status = ?";
        params.push(filter);
      }

      // Add sorting
      if (sort) {
        query += ` ORDER BY ${sort} ${order.toUpperCase()}`;
      }

      db.all(query, params, (err, rows) => {
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
        const { title, status, currentEpisode, totalEpisodes, malId, jikanStatus, imageUrl, rating } = req.body;

        if (!title || !status || !malId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        db.run(
          "INSERT INTO anime (title, status, current_episode, total_episodes, mal_id, jikan_status, image_url, rating, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [title, status, currentEpisode, totalEpisodes, malId, jikanStatus, imageUrl, rating, userId],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Internal server error', details: err.message });
            }
            
            // Log history when adding a new anime
            db.run(
              "INSERT INTO anime_history (user_id, anime_id, episode_count) VALUES (?, ?, ?)",
              [userId, this.lastID, currentEpisode || 1]
            );

            return res.status(201).json({ 
              id: this.lastID, 
              title, 
              status, 
              currentEpisode, 
              totalEpisodes, 
              malId, 
              jikanStatus,
              imageUrl,
              rating
            });
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
        const { title, status, currentEpisode, imageUrl, rating } = req.body;
        let query, params;

        if (rating !== undefined) {
          query = "UPDATE anime SET rating = ? WHERE id = ? AND user_id = ?";
          params = [rating, animeId, userId];
        } else {
          query = "UPDATE anime SET title = ?, status = ?, current_episode = ?, image_url = ? WHERE id = ? AND user_id = ?";
          params = [title, status, currentEpisode, imageUrl, animeId, userId];
        }

        db.run(query, params, function(err) {
          if (err) {
            return res.status(500).json({ error: 'Internal server error' });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Anime not found or not owned by user' });
          }

          // Log history when updating episodes
          if (currentEpisode !== undefined) {
            db.run(
              "INSERT INTO anime_history (user_id, anime_id) VALUES (?, ?)",
              [userId, animeId]
            );
          }

          return res.status(200).json({ id: animeId, title, status, currentEpisode, imageUrl, rating });
        });
      } else {
        return res.status(405).json({ error: 'Method not allowed' });
      }
    });
  } catch (error) {
    console.error('Error in anime API:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
