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
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [animeRes, reviewsRes] = await Promise.all([
          axios.get(`/api/anime/${id}`),
          axios.get(`/api/anime/${id}/reviews`)
        ]);

        setAnime(animeRes.data);
        setRating(animeRes.data.rating || 0);
        setWatchCount(animeRes.data.watchCount || { watched: 0, watching: 0, wantToWatch: 0 });
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`/api/anime/${id}`, { status: newStatus }, {
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
      await axios.put(`/api/anime/${id}`, { rating: newRating }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRating(newRating);
    } catch (error) {
      console.error('Failed to update rating:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      await axios.post(`/api/anime/${id}/reviews`, 
        { content: newReview },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { data } = await axios.get(`/api/anime/${id}/reviews`);
      setReviews(data);
      setNewReview('');
    } catch (error) {
      console.error('Failed to post review:', error);
    }
  };

  if (!anime) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-bg-200">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Image */}
          <div>
            <img src={anime.image_url} alt={anime.title} className="w-full rounded-lg shadow-lg" />
          </div>
          
          {/* Middle column - Details */}
          <div className="md:col-span-2">
            <h1 className="text-3xl mb-4 text-text-100">{anime.title}</h1>
            <p className="mb-4 text-text-100">{anime.synopsis}</p>
            <p className="mb-4 text-text-100">Episodes: {anime.episodes}</p>
            <p className="mb-4 text-text-100">Status: {anime.status}</p>
            <p className="mb-4 text-text-100">Genres: {anime.genres?.map(g => g.name).join(', ') || 'Unknown'}</p>
            
            {/* Status buttons and ratings */}
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
            <div className="mt-6">
              <h3 className="text-xl mb-2 text-text-100">Statistics</h3>
              <p className="mb-2 text-text-100">Site Rating: {rating} stars</p>
              <p className="mb-2 text-text-100">Watched by: {watchCount?.watched ?? 0} users</p>
              <p className="mb-2 text-text-100">Watching: {watchCount?.watching ?? 0} users</p>
              <p className="mb-2 text-text-100">Want to Watch: {watchCount?.wantToWatch ?? 0} users</p>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="mt-8">
          <h2 className="text-2xl mb-4 text-text-100">Reviews</h2>
          
          {/* Review Form */}
          <form onSubmit={handleSubmitReview} className="mb-6">
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              className="w-full p-2 bg-bg-300 text-text-100 rounded border border-primary-200 focus:outline-none focus:border-primary-300"
              rows="4"
              placeholder="Write your review..."
            />
            <button
              type="submit"
              className="mt-2 bg-primary-200 hover:bg-primary-300 text-bg-100 px-4 py-2 rounded"
            >
              Post Review
            </button>
          </form>

          {/* Reviews List */}
          <div className="grid grid-cols-1 gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-bg-300 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <strong className="text-text-100">{review.username}</strong>
                  <span className="text-text-200">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-text-100">{review.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
