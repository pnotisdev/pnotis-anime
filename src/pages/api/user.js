import { verify } from 'jsonwebtoken';
import db from '../../../database';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const { userId } = verify(token, 'secret');

    db.get("SELECT username FROM users WHERE id = ?", [userId], (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ username: user.username });
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
