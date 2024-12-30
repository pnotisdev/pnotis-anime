import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import debounce from 'lodash.debounce';

export default function Navbar() {
  const [username, setUsername] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Decode token to get username
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        setUsername(payload.username);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Debounced search function
  const fetchResults = useCallback(
    debounce(async (query) => {
      if (!query) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await axios.get('/api/search', { params: { q: query } });
        setResults(response.data.data || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleAnimeSelect = (animeId) => {
    setQuery('');
    setResults([]);
    router.push(`/anime/${animeId}`);
  };

  // Trigger search when query changes
  useEffect(() => {
    fetchResults(query);
  }, [query, fetchResults]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsername(null);
    router.push('/login');
  };

  return (
    <nav className="bg-bg-300 text-text-100 p-4 shadow-lg relative">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-primary-300 hover:text-primary-200">
          Animestugan.se
        </Link>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Sök anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 bg-bg-300 text-text-100 rounded border border-primary-200 focus:outline-none focus:border-primary-300"
          />
          {isLoading && <div className="absolute right-2 top-2 text-primary-200">Loading...</div>}
          {results.length > 0 && (
            <ul className="absolute w-full bg-bg-300 border border-primary-200 rounded-md mt-1 max-h-60 overflow-y-auto z-50">
              {results.map((anime) => (
                <li 
                  key={anime.mal_id}
                  onClick={() => handleAnimeSelect(anime.mal_id)}
                  className="p-2 hover:bg-bg-400 cursor-pointer"
                >
                  <div className="font-medium">{anime.title}</div>
                  <div className="text-sm text-text-200">{anime.year}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <Link href="/explore" className="hover:text-primary-200">
            Utforska
          </Link>
          {username ? (
            <>
              <Link href={`/${username}/anime`} className="hover:text-primary-200">
                {username} profil
              </Link>
              <button
                onClick={handleLogout}
                className="bg-primary-200 hover:bg-primary-300 text-bg-100 px-4 py-2 rounded transition-colors"
              >
                Logga ut
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-primary-200">
                Logga in
              </Link>
              <Link
                href="/register"
                className="bg-primary-200 hover:bg-primary-300 text-bg-100 px-4 py-2 rounded transition-colors"
              >
                Registrera dig
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}