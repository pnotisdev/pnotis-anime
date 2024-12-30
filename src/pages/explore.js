import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';
import '../app/globals.css';
import Navbar from '../components/Navbar';

export default function Explore() {
  const [animeList, setAnimeList] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');

  const genres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Sci-Fi', 'Romance', 'Fantasy', 'Sports'];
  const years = [...Array(30)].map((_, i) => 2023 - i);
  const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
  const formats = ['TV', 'Movie', 'OVA', 'ONA', 'Special'];

  useEffect(() => {
    fetchAnime();
  }, [searchQuery, selectedGenres, selectedYear, selectedSeason, selectedFormat]);

  const fetchAnime = async () => {
    try {
      let url = 'https://api.jikan.moe/v4/anime';
      const params = new URLSearchParams({
        q: searchQuery,
        genres: selectedGenres.join(','),
        year: selectedYear,
        season: selectedSeason,
        type: selectedFormat,
      });

      const response = await axios.get(`${url}?${params}`);
      setAnimeList(response.data.data);
    } catch (error) {
      console.error('Failed to fetch anime:', error);
      setError('Failed to fetch anime. Please try again.');
    }
  };

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Explore Anime</h1>
        
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded-md text-white"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-4">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => handleGenreToggle(genre)}
              className={`px-4 py-2 rounded-full ${
                selectedGenres.includes(genre) ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="mb-8 flex gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-2 bg-gray-800 rounded-md text-white"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="p-2 bg-gray-800 rounded-md text-white"
          >
            <option value="">All Seasons</option>
            {seasons.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>

          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="p-2 bg-gray-800 rounded-md text-white"
          >
            <option value="">All Formats</option>
            {formats.map(format => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {animeList.map((anime) => (
            <Link href={`/anime/${anime.mal_id}`} key={anime.mal_id}>
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-105 cursor-pointer">
                <div className="relative h-64">
                  <Image
                    src={anime.images.jpg.large_image_url}
                    alt={anime.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 truncate">{anime.title}</h3>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{anime.type}</span>
                    <span>{anime.year}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}