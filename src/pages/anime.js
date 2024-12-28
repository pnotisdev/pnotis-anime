import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Anime() {
  const [animeList, setAnimeList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [editingAnime, setEditingAnime] = useState(null);
  const [selectedAnime, setSelectedAnime] = useState(null);

  useEffect(() => {
    // Fetch anime list from the server
    const fetchAnimeList = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/anime', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnimeList(response.data);
    };

    fetchAnimeList();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/anime', {
          params: { q: searchQuery },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSearchResults(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [searchQuery]);

  const handleSubmit = async (anime) => {
    const token = localStorage.getItem('token');
    try {
      const jikanResponse = await axios.get(`https://api.jikan.moe/v4/anime/${anime.mal_id}`);
      const totalEpisodes = jikanResponse.data.data.episodes;
      
      await axios.post('/api/anime', { 
        title: anime.title,
        status: selectedAnime.status,
        currentEpisode: selectedAnime.currentEpisode || 0,
        totalEpisodes,
        malId: anime.mal_id
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh the anime list
      const response = await axios.get('/api/anime', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnimeList(response.data);
      setSelectedAnime(null);
    } catch (error) {
      console.error('Failed to add anime:', error);
    }
  };

  const handleRemove = async (animeId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/anime`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { id: animeId }
      });
      setAnimeList(animeList.filter(anime => anime.id !== animeId));
    } catch (error) {
      console.error('Failed to remove anime:', error);
      alert('Failed to remove anime. Please try again.');
    }
  };

  const handleEdit = (anime) => {
    setEditingAnime(anime);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`/api/anime`, editingAnime, {
        headers: { Authorization: `Bearer ${token}` },
        params: { id: editingAnime.id }
      });
      setAnimeList(animeList.map(anime => anime.id === editingAnime.id ? response.data : anime));
      setEditingAnime(null);
    } catch (error) {
      console.error('Failed to update anime:', error);
      alert('Failed to update anime. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl mb-6">My Anime List</h1>
      <input
        type="text"
        placeholder="Search Anime..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-700 rounded max-w-md"
      />
      <div className="w-full max-w-md mb-8">
        <h2 className="text-xl mb-2">Search Results:</h2>
        <ul>
          {searchResults.map((anime) => (
            <li key={anime.mal_id} className="bg-gray-800 p-4 mb-2 rounded shadow-md">
              <span>{anime.title}</span>
              <div className="mt-2">
                <select 
                  onChange={(e) => setSelectedAnime({...selectedAnime, status: e.target.value})}
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
                    onChange={(e) => setSelectedAnime({...selectedAnime, currentEpisode: e.target.value})}
                    className="mr-2 p-1 text-black"
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
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full max-w-md">
        <h2 className="text-xl mb-2">My Anime:</h2>
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
                      onChange={(e) => setEditingAnime({...editingAnime, currentEpisode: e.target.value})}
                      className="mb-2 p-1 text-black"
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
                  <div className="mt-2">
                    <button onClick={() => handleEdit(anime)} className="bg-yellow-500 text-white p-1 rounded mr-2">Edit</button>
                    <button onClick={() => handleRemove(anime.id)} className="bg-red-500 text-white p-1 rounded">Remove</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
