import db from '../../../../../database';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    db.all(`
      SELECT r.*, u.username 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.mal_id = ?
      ORDER BY r.created_at DESC
    `, [id], (err, reviews) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch reviews' });
      return res.status(200).json(reviews);
    });
    return;
  }

  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const { userId } = verify(token, 'secret');

    if (req.method === 'POST') {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: 'Review content required' });

      db.run(`
        INSERT INTO reviews (mal_id, user_id, content, created_at) 
        VALUES (?, ?, ?, datetime('now'))
      `, [id, userId, content], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to post review' });
        return res.status(201).json({ message: 'Review posted successfully' });
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
