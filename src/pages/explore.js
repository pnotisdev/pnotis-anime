import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import '../app/globals.css';
import Navbar from '../components/Navbar';

export default function Explore() {
  const [animeList, setAnimeList] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const response = await axios.get('https://api.jikan.moe/v4/top/anime');
        setAnimeList(response.data.data);
      } catch (error) {
        console.error('Failed to fetch popular anime:', error);
        setError('Failed to fetch popular anime. Please try again.');
      }
    };

    fetchPopularAnime();
  }, []);

  return (
    <div className="min-h-screen bg-bg-200">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl mb-6 text-text-100">Explore Popular Anime</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {animeList.map((anime) => (
            <div key={anime.mal_id} className="bg-bg-300 rounded-lg shadow-lg overflow-hidden">
              <Image
                src={anime.images.jpg.image_url}
                alt={anime.title}
                width={300}
                height={400}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg">{anime.title}</h3>
                <p>{anime.synopsis}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
