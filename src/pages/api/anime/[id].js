import db from '../../../../database';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    db.get("SELECT * FROM anime WHERE mal_id = ?", [id], (err, anime) => {
      if (err || !anime) {
        return res.status(404).json({ error: 'Anime not found' });
      }

      db.all("SELECT status, COUNT(*) as count FROM anime WHERE mal_id = ? GROUP BY status", [id], (err, counts) => {
        if (err) {
          return res.status(500).json({ error: 'Internal server error' });
        }

        const watchCount = counts.reduce((acc, row) => {
          acc[row.status] = row.count;
          return acc;
        }, { watched: 0, watching: 0, wantToWatch: 0 });

        return res.status(200).json({ ...anime, watchCount });
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

    if (req.method === 'PUT') {
      const { status, rating } = req.body;

      if (status) {
        db.run("UPDATE anime SET status = ? WHERE mal_id = ? AND user_id = ?", [status, id, userId], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Internal server error' });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Anime not found or not owned by user' });
          }
          return res.status(200).json({ message: 'Status updated successfully' });
        });
      } else if (rating !== undefined) {
        db.run("UPDATE anime SET rating = ? WHERE mal_id = ? AND user_id = ?", [rating, id, userId], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Internal server error' });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Anime not found or not owned by user' });
          }
          return res.status(200).json({ message: 'Rating updated successfully' });
        });
      } else {
        return res.status(400).json({ error: 'Invalid request' });
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in anime API:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
