import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Movie } from '../types';
import { getImageUrl } from '../services/api';

interface MovieCardProps {
  movie: Movie;
  isLarge?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, isLarge = false }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    const type = movie.media_type || (movie.title ? 'movie' : 'tv');
    navigate(`/details/${type}/${movie.id}`);
  };

  // Fallback image logic
  const imageUrl = movie.poster_path 
    ? getImageUrl(movie.poster_path) 
    : `https://source.unsplash.com/random/300x450?movie,cinema,${movie.id}`;

  const demoImage = `https://picsum.photos/seed/${movie.id}/300/450`;
  const finalImage = movie.poster_path ? imageUrl : demoImage;

  return (
    <div 
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative flex-none cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
        ${isLarge ? 'w-40 md:w-56' : 'w-28 md:w-40'}
        z-10 hover:z-50 hover:scale-110
      `}
    >
      <div className={`
        relative overflow-hidden rounded-lg bg-zinc-800 aspect-[2/3] 
        transition-all duration-300
        ${isHovered ? 'shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] ring-2 ring-white/80' : 'shadow-lg ring-0 ring-transparent'}
      `}>
        {/* Main Image */}
        <img 
          src={finalImage} 
          alt={movie.title || movie.name} 
          className={`
            w-full h-full object-cover transition-transform duration-500
            ${isHovered ? 'brightness-75 scale-105' : 'brightness-100 scale-100'}
          `}
          loading="lazy"
        />
        
        {/* Hover Content Overlay */}
        <div className={`
          absolute inset-0 flex flex-col justify-between p-3
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
           {/* Gradient Background */}
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

           {/* Centered Play Button */}
           <div className="relative flex-1 flex items-center justify-center">
             <div className={`
               bg-white/90 rounded-full p-3 shadow-lg transform transition-all duration-300 delay-75
               ${isHovered ? 'scale-100 translate-y-0' : 'scale-50 translate-y-4'}
               hover:bg-white hover:scale-110
             `}>
               <Play className="w-6 h-6 text-black fill-black ml-0.5" />
             </div>
           </div>

           {/* Bottom Info */}
           <div className={`
             relative transform transition-transform duration-300
             ${isHovered ? 'translate-y-0' : 'translate-y-4'}
           `}>
             <h3 className="text-white text-sm md:text-base font-bold leading-tight drop-shadow-md mb-2 line-clamp-2">
               {movie.title || movie.name}
             </h3>
             
             <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium">
               <span className="text-green-400 font-bold">{Math.round(movie.vote_average * 10)}% Match</span>
               <span className="text-zinc-300 px-1 border border-zinc-500/50 rounded bg-black/30 backdrop-blur-sm">HD</span>
               <span className="text-zinc-300">{new Date(movie.release_date || movie.first_air_date || Date.now()).getFullYear()}</span>
             </div>
             
             {/* Genres (Mocked if real data missing in list view, but adds visual density) */}
             <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                   {movie.media_type === 'tv' ? 'Series' : 'Movie'}
                   <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                   Drama
                </span>
             </div>
           </div>
        </div>

        {/* Mobile/Default Title Overlay (Visible when NOT hovered on desktop, always visible on mobile if needed) */}
        {!isHovered && (
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 md:opacity-0 lg:opacity-0 transition-opacity duration-300 flex items-end p-2">
             {/* We hide this on desktop default to keep it clean, but you could enable it for always-on-title designs */}
           </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;