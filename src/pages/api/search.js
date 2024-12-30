import axios from 'axios';

export default async function handler(req, res) {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  try {
    const response = await axios.get(`https://api.jikan.moe/v4/anime`, {
      params: { q, limit: 5 }
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
}
