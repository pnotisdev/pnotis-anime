import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function Discover() {
  const [popularFavorites, setPopularFavorites] = useState([]);

  useEffect(() => {
    fetchPopularFavorites();
  }, []);

  const fetchPopularFavorites = async () => {
    try {
      const response = await axios.get('/api/discover');
      setPopularFavorites(response.data);
    } catch (error) {
      console.error('Failed to fetch popular favorites:', error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-200">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl mb-6 text-text-100">Discover Popular Favorites</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularFavorites.map(anime => (
            <Link href={`/anime/${anime.mal_id}`} key={anime.mal_id}>
              <div className="bg-bg-300 rounded-lg shadow-lg overflow-hidden cursor-pointer">
                <img src={anime.image_url} alt={anime.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-text-100">{anime.title}</h3>
                  <p className="text-text-200">Favorited by {anime.favorite_count} users</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
