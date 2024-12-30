import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import '../../app/globals.css';
import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating';
import ContributionCalendar from '../../components/ContributionCalendar';

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
  const [watchHistory, setWatchHistory] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchLoggedInUser(token);
    }
  }, []);

  useEffect(() => {
    if (username) {
      fetchAnimeList(username);
      fetchWatchHistory(username);
    }
  }, [username, router]);

  useEffect(() => {
    if (searchQuery && username) {
      fetchSearchResults(username, searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, username]);

  const fetchLoggedInUser = async (token) => {
    try {
      const response = await axios.get('/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoggedInUser(response.data.username);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      setLoggedInUser(null);
    }
  };

  const fetchAnimeList = async (username) => {
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

  const fetchSearchResults = async (username, query) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`/api/${username}/anime`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWatchHistory = async (username) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`/api/${username}/watch-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch watch history:', error);
    }
  };

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
        jikanStatus: jikanData.status,
        imageUrl: anime.images?.jpg?.image_url
      };

      await axios.post(`/api/${username}/anime`, animeData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchAnimeList(username);
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
      const response = await axios.put(`/api/${username}/anime`, 
        { ...editingAnime, image_url: editingAnime.image_url },
        { headers: { Authorization: `Bearer ${token}` },
          params: { id: editingAnime.id }
        }
      );
      setAnimeList(animeList.map(anime => anime.id === editingAnime.id ? response.data : anime));
      setEditingAnime(null);
    } catch (error) {
      console.error('Failed to update anime:', error);
      setError('Failed to update anime. Please try again.');
    }
  };

  const handleRatingChange = async (animeId, rating) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`/api/${username}/anime`, 
        { id: animeId, rating: rating * 2 },
        { headers: { Authorization: `Bearer ${token}` },
          params: { id: animeId }
        }
      );
      setAnimeList(animeList.map(anime => 
        anime.id === animeId ? { ...anime, rating: rating * 2 } : anime
      ));
    } catch (error) {
      console.error('Failed to update rating:', error);
      setError('Failed to update rating. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-200">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl mb-6 text-text-100">{username} animelista</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="mb-8 bg-bg-300 rounded-lg p-4">
          <h2 className="text-xl mb-4 text-text-100">Aktivitet</h2>
          <ContributionCalendar watchHistory={watchHistory} />
        </div>

        <a href={`/${username}/favorites`} className="text-blue-500 hover:text-blue-700">
          View Favorites
        </a>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {searchResults.map((anime) => (
            <div key={anime.mal_id} className="bg-bg-300 rounded-lg shadow-lg overflow-hidden">
              {anime.images?.jpg?.image_url && (
                <Image
                  src={anime.images.jpg.image_url}
                  alt={anime.title || 'Anime cover'}
                  width={300}
                  height={400}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
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
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {animeList.map((anime) => (
            <div key={anime.id} className="bg-bg-300 rounded-lg shadow-lg overflow-hidden">
              {editingAnime && editingAnime.id === anime.id ? (
                <form onSubmit={handleUpdate} className="flex flex-col p-4">
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
                  {anime.image_url && (
                    <Image
                      src={anime.image_url}
                      alt={anime.title || 'Anime cover'}
                      width={300}
                      height={400}
                      className="w-full h-48 object-cover"
                      priority
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg">{anime.title}</h3>
                    <p>Status: {anime.status}</p>
                    {anime.status === 'watching' && (
                      <p>Episode: {anime.currentEpisode} / {anime.totalEpisodes}</p>
                    )}
                    <StarRating
                      rating={anime.rating ? anime.rating / 2 : 0}
                      onRatingChange={(newRating) => handleRatingChange(anime.id, newRating)}
                      editable={loggedInUser === username}
                    />
                    {loggedInUser === username && (
                      <div className="mt-2">
                        <button onClick={() => handleEdit(anime)} className="bg-yellow-500 text-white p-1 rounded mr-2">Edit</button>
                        <button onClick={() => handleRemove(anime.id)} className="bg-red-500 text-white p-1 rounded">Remove</button>
                      </div>
                    )}
                  </div>
                </form>
              ) : (
                <>
                  {anime.image_url && (
                    <Image
                      src={anime.image_url}
                      alt={anime.title || 'Anime cover'}
                      width={300}
                      height={400}
                      className="w-full h-48 object-cover"
                      priority
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg">{anime.title}</h3>
                    <p>Status: {anime.status}</p>
                    {anime.status === 'watching' && (
                      <p>Episode: {anime.currentEpisode} / {anime.totalEpisodes}</p>
                    )}
                    <StarRating
                      rating={anime.rating ? anime.rating / 2 : 0}
                      onRatingChange={(newRating) => handleRatingChange(anime.id, newRating)}
                      editable={loggedInUser === username}
                    />
                    {loggedInUser === username && (
                      <div className="mt-2">
                        <button onClick={() => handleEdit(anime)} className="bg-yellow-500 text-white p-1 rounded mr-2">Edit</button>
                        <button onClick={() => handleRemove(anime.id)} className="bg-red-500 text-white p-1 rounded">Remove</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
