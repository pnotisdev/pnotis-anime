import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import db from '../../../database';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }
  console.log(`Login attempt for username: ${username}`);

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      console.error(`Database error: ${err.message}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      console.warn(`User not found: ${username}`);
      return res.status(200).json({ error: 'User not found, please register first' });
    }

    compare(password, user.password, (err, result) => {
      if (err) {
        console.error(`Bcrypt error: ${err.message}`);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (result) {
        const token = sign({ userId: user.id }, 'secret', { expiresIn: '1h' });
        console.log(`Login successful for username: ${username}`);
        return res.status(200).json({ message: 'Login successful', token });
      } else {
        console.warn(`Invalid password for username: ${username}`);
        return res.status(401).json({ error: 'Invalid username or password' });
      }
    });
  });
}
