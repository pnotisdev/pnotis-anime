
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../app/globals.css';

export default function SearchAnime() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/anime', { params: { q: query } });
        setResults(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [query]);

  return (
    <div>
      <input
        type="text"
        placeholder="Sök anime..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {results.map((anime) => (
          <li key={anime.mal_id}>{anime.title}</li>
        ))}
      </ul>
    </div>
  );
}