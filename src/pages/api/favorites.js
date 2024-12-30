import db from '../../../database';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const { userId } = verify(token, 'secret');

    if (req.method === 'POST') {
      const { animeId } = req.body;
      db.run("INSERT OR IGNORE INTO favorites (user_id, anime_id) VALUES (?, ?)", [userId, animeId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to add favorite' });
        }
        return res.status(200).json({ message: 'Anime added to favorites' });
      });
    } else if (req.method === 'DELETE') {
      const { animeId } = req.query;
      db.run("DELETE FROM favorites WHERE user_id = ? AND anime_id = ?", [userId, animeId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to remove favorite' });
        }
        return res.status(200).json({ message: 'Anime removed from favorites' });
      });
    } else if (req.method === 'GET') {
      db.all("SELECT a.* FROM anime a INNER JOIN favorites f ON a.id = f.anime_id WHERE f.user_id = ?", [userId], (err, favorites) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch favorites' });
        }
        return res.status(200).json(favorites);
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in favorites API:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
