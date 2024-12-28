import db from '../../../../database';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  db.get("SELECT id FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the watch history for the last 365 days
    const query = `
      SELECT DATE(updated_at) as date, COUNT(*) as count
      FROM anime_history
      WHERE user_id = ? 
      AND updated_at >= DATE('now', '-365 days')
      GROUP BY DATE(updated_at)
    `;

    db.all(query, [user.id], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Convert to object with dates as keys
      const history = rows.reduce((acc, row) => {
        acc[row.date] = row.count;
        return acc;
      }, {});

      return res.status(200).json(history);
    });
  });
}
