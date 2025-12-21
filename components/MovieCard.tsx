import React from 'react';
import * as _ReactRouterDOM from 'react-router-dom';
import { Play } from 'lucide-react';
import { Movie } from '../types';
import { getImageUrl } from '../services/api';

// Fix: Cast react-router-dom to any to avoid type errors with missing members
const { useNavigate } = _ReactRouterDOM as any;

interface MovieCardProps {
  movie: Movie;
  isLarge?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, isLarge = false }) => {
  const navigate = useNavigate();

  const navigateToDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    const type = movie.media_type || (movie.title ? 'movie' : 'tv');
    navigate(`/details/${type}/${movie.id}`);
  };

  // Images
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const backdropUrl = getImageUrl(movie.backdrop_path, 'w500');
  
  const displayImage = isLarge ? posterUrl : (window.innerWidth > 768 ? (backdropUrl || posterUrl) : posterUrl);
  // Actually, to ensure reliable images without complex resize listeners, let's stick to the poster 
  // but use object-cover to fill the aspect ratio defined in CSS.
  const imageSrc = posterUrl;

  return (
    <div 
      onClick={navigateToDetails}
      className={`
        relative flex-none group/card cursor-pointer
        transition-all duration-300 ease-out
        ${isLarge ? 'w-40 md:w-52 aspect-[2/3]' : 'w-32 md:w-64 aspect-[2/3] md:aspect-video'} 
        rounded-lg overflow-hidden bg-zinc-900
        hover:scale-105 hover:z-20 hover:shadow-xl hover:ring-2 hover:ring-white/20
      `}
    >
        {/* Image */}
        <img 
           src={imageSrc} 
           alt={movie.title || movie.name}
           className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105 opacity-90 group-hover/card:opacity-100"
           loading="lazy"
        />

        {/* Hover Overlay (Darken) */}
        <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/40 transition-colors duration-300" />

        {/* Center Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 transform scale-50 group-hover/card:scale-100">
            <div className="bg-red-600/90 rounded-full p-3 backdrop-blur-sm shadow-lg">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
        </div>

        {/* Bottom Title Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end p-3 opacity-100 group-hover/card:pb-4 transition-all duration-300">
           <h4 className="text-white text-xs md:text-sm font-bold line-clamp-1 drop-shadow-md">
             {movie.title || movie.name}
           </h4>
           {/* Optional Metadata that appears on hover */}
           <div className="h-0 group-hover/card:h-auto overflow-hidden opacity-0 group-hover/card:opacity-100 transition-all duration-300 text-[10px] text-zinc-300 mt-1 flex gap-2">
                <span className="text-green-400 font-semibold">{(movie.vote_average * 10).toFixed(0)}% Match</span>
                <span>{new Date(movie.release_date || movie.first_air_date || Date.now()).getFullYear()}</span>
           </div>
        </div>
    </div>
  );
};

export default MovieCard;