import db from '../../../database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    db.all(`
      SELECT a.*, COUNT(f.id) as favorite_count
      FROM anime a
      INNER JOIN favorites f ON a.id = f.anime_id
      GROUP BY a.id
      ORDER BY favorite_count DESC
      LIMIT 20
    `, (err, popularFavorites) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch popular favorites' });
      }
      return res.status(200).json(popularFavorites);
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
