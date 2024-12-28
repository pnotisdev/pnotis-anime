const axios = require('axios');

async function fetchAnimeData() {
  try {
    const response = await axios.get('https://api.jikan.moe/v4/anime');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching data from Jikan API:', error);
    return [];
  }
}

module.exports = fetchAnimeData;
