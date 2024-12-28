import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import '../../app/globals.css';

export default function UserAnime() {
  const router = useRouter();
  const { username } = router.query;
  const [animeList, setAnimeList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [editingAnime, setEditingAnime] = useState(null);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [error, setError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch logged-in user info
      axios.get('/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(response => {
        setLoggedInUser(response.data.username);
      }).catch(error => {
        console.error('Failed to fetch user info:', error);
        setLoggedInUser(null); // Ensure loggedInUser is null if the request fails
      });
    }
  }, []);

  useEffect(() => {
    if (!username) return;
    const fetchAnimeList = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`/api/${username}/anime`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnimeList(response.data);
      } catch (error) {
        console.error('Failed to fetch anime list:', error);
        if (error.response && error.response.status === 401) {
          router.push('/login');
        }
      }
    };

    fetchAnimeList();
  }, [username, router]);

  useEffect(() => {
    if (!searchQuery || !username) {
      setSearchResults([]);
      return;
    }
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/${username}/anime`, {
          params: { q: searchQuery },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSearchResults(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [searchQuery, username]);

  const handleStatusChange = (e, anime) => {
    const status = e.target.value;
    let currentEpisode = null;
    if (status === 'watching') {
      currentEpisode = 1;
    } else if (status === 'watched') {
      currentEpisode = anime.episodes || 0;
    }
    setSelectedAnime({ ...selectedAnime, status, currentEpisode });
  };

  const handleSubmit = async (anime) => {
    const token = localStorage.getItem('token');
    try {
      const jikanResponse = await axios.get(`https://api.jikan.moe/v4/anime/${anime.mal_id}`);
      const jikanData = jikanResponse.data.data;
      
      const animeData = {
        title: anime.title,
        status: selectedAnime.status,
        currentEpisode: selectedAnime.currentEpisode,
        totalEpisodes: jikanData.episodes,
        malId: anime.mal_id,
        jikanStatus: jikanData.status
      };

      const response = await axios.post(`/api/${username}/anime`, animeData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const listResponse = await axios.get(`/api/${username}/anime`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnimeList(listResponse.data);
      setSelectedAnime(null);
      setError('');
    } catch (error) {
      setError(`Failed to add anime: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleRemove = async (animeId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/${username}/anime`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { id: animeId }
      });
      setAnimeList(animeList.filter(anime => anime.id !== animeId));
    } catch (error) {
      console.error('Failed to remove anime:', error);
      setError('Failed to remove anime. Please try again.');
    }
  };

  const handleEdit = (anime) => {
    setEditingAnime(anime);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`/api/${username}/anime`, editingAnime, {
        headers: { Authorization: `Bearer ${token}` },
        params: { id: editingAnime.id }
      });
      setAnimeList(animeList.map(anime => anime.id === editingAnime.id ? response.data : anime));
      setEditingAnime(null);
    } catch (error) {
      console.error('Failed to update anime:', error);
      setError('Failed to update anime. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl mb-6">{username}&apos;s Anime List</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loggedInUser === username && (
        <input
          type="text"
          placeholder="Search Anime..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 rounded max-w-md"
        />
      )}
      
      <div className="w-full max-w-md mb-8">
        <h2 className="text-xl mb-2">Search Results:</h2>
        <ul>
          {searchResults.map((anime) => (
            <li key={anime.mal_id} className="bg-gray-800 p-4 mb-2 rounded shadow-md">
              <span>{anime.title}</span>
              {loggedInUser === username && (
                <div className="mt-2">
                  <select 
                    onChange={(e) => handleStatusChange(e, anime)}
                    className="mr-2 p-1 text-black"
                  >
                    <option value="">Select Status</option>
                    <option value="watched">Watched</option>
                    <option value="watching">Watching</option>
                    <option value="want_to_watch">Want to Watch</option>
                  </select>
                  {selectedAnime && selectedAnime.status === 'watching' && (
                    <input
                      type="number"
                      placeholder="Current Episode"
                      value={selectedAnime.currentEpisode || ''}
                      onChange={(e) => setSelectedAnime({...selectedAnime, currentEpisode: parseInt(e.target.value)})}
                      className="mr-2 p-1 text-black"
                      min="1"
                      max={anime.episodes}
                    />
                  )}
                  <button 
                    onClick={() => handleSubmit(anime)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    disabled={!selectedAnime || !selectedAnime.status}
                  >
                    Add
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-xl mb-2">Anime List:</h2>
        <ul>
          {animeList.map((anime) => (
            <li key={anime.id} className="bg-gray-800 p-4 mb-2 rounded shadow-md">
              {editingAnime && editingAnime.id === anime.id ? (
                <form onSubmit={handleUpdate} className="flex flex-col">
                  <input
                    type="text"
                    value={editingAnime.title}
                    onChange={(e) => setEditingAnime({...editingAnime, title: e.target.value})}
                    className="mb-2 p-1 text-black"
                  />
                  <select
                    value={editingAnime.status}
                    onChange={(e) => setEditingAnime({...editingAnime, status: e.target.value})}
                    className="mb-2 p-1 text-black"
                  >
                    <option value="watched">Watched</option>
                    <option value="watching">Watching</option>
                    <option value="want_to_watch">Want to Watch</option>
                  </select>
                  {editingAnime.status === 'watching' && (
                    <input
                      type="number"
                      value={editingAnime.currentEpisode}
                      onChange={(e) => setEditingAnime({...editingAnime, currentEpisode: parseInt(e.target.value)})}
                      className="mb-2 p-1 text-black"
                      min="1"
                      max={editingAnime.totalEpisodes}
                    />
                  )}
                  <button type="submit" className="bg-green-500 text-white p-1 rounded">Save</button>
                </form>
              ) : (
                <>
                  <h3 className="text-lg">{anime.title}</h3>
                  <p>Status: {anime.status}</p>
                  {anime.status === 'watching' && (
                    <p>Episode: {anime.currentEpisode} / {anime.totalEpisodes}</p>
                  )}
                  {loggedInUser === username && (
                    <div className="mt-2">
                      <button onClick={() => handleEdit(anime)} className="bg-yellow-500 text-white p-1 rounded mr-2">Edit</button>
                      <button onClick={() => handleRemove(anime.id)} className="bg-red-500 text-white p-1 rounded">Remove</button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
