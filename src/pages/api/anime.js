import db from '../../../database';
import { verify } from 'jsonwebtoken';
import axios from 'axios';

export default async function handler(req, res) {
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

  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const { userId } = verify(token, 'secret');

    if (req.method === 'GET') {
      db.all("SELECT * FROM anime WHERE user_id = ?", [userId], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(rows);
      });
    } else if (req.method === 'POST') {
      const { title, status, currentEpisode, totalEpisodes, malId } = req.body;
      db.run("INSERT INTO anime (title, status, current_episode, total_episodes, mal_id, user_id) VALUES (?, ?, ?, ?, ?, ?)", 
        [title, status, currentEpisode, totalEpisodes, malId, userId], 
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Internal server error' });
          }
          res.status(201).json({ id: this.lastID, title, status, currentEpisode, totalEpisodes, malId });
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
        res.status(200).json({ message: 'Anime removed successfully' });
      });
    } else if (req.method === 'PUT') {
      const animeId = req.query.id;
      const { title, status, currentEpisode } = req.body;
      db.run("UPDATE anime SET title = ?, status = ?, current_episode = ? WHERE id = ? AND user_id = ?", 
        [title, status, currentEpisode, animeId, userId], 
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Internal server error' });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Anime not found or not owned by user' });
          }
          res.status(200).json({ id: animeId, title, status, currentEpisode });
        }
      );
    }
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
