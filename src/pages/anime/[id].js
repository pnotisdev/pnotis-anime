import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating';

export default function AnimeDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [anime, setAnime] = useState(null);
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [status, setStatus] = useState('');
  const [watchCount, setWatchCount] = useState({ watched: 0, watching: 0, wantToWatch: 0 });

  useEffect(() => {
    if (!id) return;
    const fetchAnime = async () => {
      try {
        const response = await axios.get(`/api/anime/${id}`);
        setAnime(response.data);
        setRating(response.data.rating);
        setWatchCount(response.data.watchCount);
      } catch (error) {
        console.error('Failed to fetch anime details:', error);
      }
    };
    fetchAnime();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`/api/anime/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus(newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleRatingChange = async (newRating) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`/api/anime/${id}/rating`, { rating: newRating }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRating(newRating);
    } catch (error) {
      console.error('Failed to update rating:', error);
    }
  };

  if (!anime) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-bg-200">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl mb-4 text-text-100">{anime.title}</h1>
        <p className="mb-4 text-text-100">{anime.summary}</p>
        <p className="mb-4 text-text-100">Episodes: {anime.episodes}</p>
        <p className="mb-4 text-text-100">Genres: {anime.genres.join(', ')}</p>
        <div className="mb-4">
          <button onClick={() => handleStatusChange('watched')} className={`mr-2 ${status === 'watched' ? 'bg-primary-300' : 'bg-primary-200'} text-bg-100 px-4 py-2 rounded`}>
            Watched
          </button>
          <button onClick={() => handleStatusChange('watching')} className={`mr-2 ${status === 'watching' ? 'bg-primary-300' : 'bg-primary-200'} text-bg-100 px-4 py-2 rounded`}>
            Watching
          </button>
          <button onClick={() => handleStatusChange('want_to_watch')} className={`${status === 'want_to_watch' ? 'bg-primary-300' : 'bg-primary-200'} text-bg-100 px-4 py-2 rounded`}>
            Want to Watch
          </button>
        </div>
        <div className="mb-4">
          <StarRating rating={userRating} onRatingChange={handleRatingChange} editable />
        </div>
        <p className="mb-4 text-text-100">Average Rating: {rating} stars</p>
        <p className="mb-4 text-text-100">Watched by: {watchCount.watched} users</p>
        <p className="mb-4 text-text-100">Watching: {watchCount.watching} users</p>
        <p className="mb-4 text-text-100">Want to Watch: {watchCount.wantToWatch} users</p>
      </div>
    </div>
  );
}
