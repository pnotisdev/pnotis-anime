import { hash } from 'bcrypt';
import db from '../../../database';

export default function handler(req, res) {
  const { username, password } = req.body;

  hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
      if (err) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      res.status(201).json({ message: 'User registered successfully' });
    });
  });
}
