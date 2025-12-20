import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { Movie } from '../types';
import { getImageUrl } from '../services/api';

interface HeroProps {
  movie: Movie | null;
}

const Hero: React.FC<HeroProps> = ({ movie }) => {
  const navigate = useNavigate();

  if (!movie) {
    return (
        <div className="w-full h-[60vh] md:h-[80vh] bg-zinc-900 animate-pulse" />
    );
  }

  const backdropUrl = movie.backdrop_path 
    ? getImageUrl(movie.backdrop_path, 'original') 
    : `https://picsum.photos/seed/${movie.id + 'hero'}/1920/1080`;

  const handlePlay = () => {
    const type = movie.media_type || (movie.title ? 'movie' : 'tv');
    navigate(`/player/${type}/${movie.id}`);
  };

  const handleInfo = () => {
    const type = movie.media_type || (movie.title ? 'movie' : 'tv');
    navigate(`/details/${type}/${movie.id}`);
  };

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={backdropUrl} 
          alt={movie.title || movie.name} 
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full px-4 md:px-12 pb-16 md:pb-24 flex flex-col items-start gap-4">
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold max-w-2xl drop-shadow-lg">
          {movie.title || movie.name}
        </h1>
        
        {/* Metadata (Year, Rating) */}
        <div className="flex items-center gap-4 text-zinc-300 text-sm md:text-base font-medium">
          <span className="text-green-400 font-bold">{Math.round(movie.vote_average * 10)}% Match</span>
          <span>{new Date(movie.release_date || movie.first_air_date || Date.now()).getFullYear()}</span>
          <span className="border border-zinc-600 px-1 rounded text-xs">HD</span>
        </div>

        {/* Overview (Desktop only) */}
        <p className="hidden md:block text-zinc-200 text-lg max-w-xl line-clamp-3 drop-shadow-md">
          {movie.overview}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-2">
          <button 
            onClick={handlePlay}
            className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded hover:bg-zinc-200 transition font-bold"
          >
            <Play className="w-5 h-5 fill-black" />
            Play
          </button>
          <button 
            onClick={handleInfo}
            className="flex items-center gap-2 bg-zinc-600/80 text-white px-6 md:px-8 py-2 md:py-3 rounded hover:bg-zinc-600 transition font-bold backdrop-blur-sm"
          >
            <Info className="w-5 h-5" />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;