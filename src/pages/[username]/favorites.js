import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function UserFavorites() {
  const router = useRouter();
  const { username } = router.query;
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (username) {
      fetchFavorites();
    }
  }, [username]);

  const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-200">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl mb-6 text-text-100">{username}&apos;s Favorite Anime</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map(anime => (
            <Link href={`/anime/${anime.mal_id}`} key={anime.mal_id}>
              <div className="bg-bg-300 rounded-lg shadow-lg overflow-hidden cursor-pointer">
                <img src={anime.image_url} alt={anime.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-text-100">{anime.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
