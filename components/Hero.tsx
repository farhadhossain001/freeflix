import React from 'react';
import * as _ReactRouterDOM from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { Movie } from '../types';
import { getImageUrl } from '../services/api';

// Fix: Cast react-router-dom to any to avoid type errors with missing members
const { useNavigate } = _ReactRouterDOM as any;

interface HeroProps {
  movie: Movie | null;
}

const Hero: React.FC<HeroProps> = ({ movie }) => {
  const navigate = useNavigate();

  if (!movie) {
    return (
        <div className="w-full h-[70vh] md:h-[95vh] bg-zinc-900 animate-pulse relative">
            <div className="absolute bottom-20 left-12 w-1/3 space-y-4">
                <div className="h-12 bg-zinc-800 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-800 rounded w-full"></div>
                <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
                <div className="flex gap-3 pt-4">
                    <div className="h-12 w-32 bg-zinc-800 rounded"></div>
                    <div className="h-12 w-32 bg-zinc-800 rounded"></div>
                </div>
            </div>
        </div>
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
    <div className="relative w-full h-[70vh] md:h-[95vh] overflow-hidden group">
      {/* Background Image with slight zoom effect */}
      <div className="absolute inset-0 transition-transform duration-[20s] ease-linear group-hover:scale-105">
        <img 
          src={backdropUrl} 
          alt={movie.title || movie.name} 
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Complex Gradients for readability and cinematic feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-zinc-950" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full px-4 md:px-14 pb-20 md:pb-32 flex flex-col items-start gap-5 md:gap-6 z-10">
        
        {/* Animated Title */}
        <h1 className="text-4xl md:text-7xl font-extrabold max-w-4xl tracking-tighter leading-[0.9] text-white text-shadow-lg animate-fade-in drop-shadow-2xl">
          {movie.title || movie.name}
        </h1>
        
        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-3 md:gap-5 text-zinc-200 text-sm md:text-base font-medium animate-fade-in delay-100">
          <span className="text-green-400 font-bold tracking-wide">{(movie.vote_average * 10).toFixed(0)}% Match</span>
          <span>{new Date(movie.release_date || movie.first_air_date || Date.now()).getFullYear()}</span>
          <span className="border border-zinc-500 px-1.5 py-0.5 rounded text-[10px] md:text-xs bg-black/30 backdrop-blur-sm">HD</span>
          <span className="hidden md:inline-block w-1 h-1 bg-zinc-500 rounded-full"></span>
          <span className="hidden md:inline-block">
             {movie.media_type === 'tv' ? 'Series' : 'Movie'}
          </span>
        </div>

        {/* Overview (Desktop only) */}
        <p className="hidden md:block text-zinc-100 text-base md:text-lg max-w-2xl line-clamp-3 leading-relaxed drop-shadow-md text-shadow-lg animate-fade-in delay-200">
          {movie.overview}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-2 animate-fade-in delay-300">
          <button 
            onClick={handlePlay}
            className="flex items-center gap-2.5 bg-white text-black px-7 py-3 md:px-10 md:py-4 rounded-lg hover:bg-zinc-200 active:scale-95 transition-all duration-200 font-bold text-base md:text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <Play className="w-5 h-5 md:w-6 md:h-6 fill-black" />
            Play
          </button>
          
          <button 
            onClick={handleInfo}
            className="flex items-center gap-2.5 bg-zinc-600/60 hover:bg-zinc-600/80 text-white px-7 py-3 md:px-10 md:py-4 rounded-lg transition-all duration-200 font-bold text-base md:text-lg backdrop-blur-md border border-white/10"
          >
            <Info className="w-5 h-5 md:w-6 md:h-6" />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;