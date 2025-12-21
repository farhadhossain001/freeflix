import React, { useRef, useState } from 'react';
import * as _ReactRouterDOM from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { Movie } from '../types';

// Fix: Cast react-router-dom to any to avoid type errors with missing members
const { useNavigate } = _ReactRouterDOM as any;

interface ContentRowProps {
  title: string;
  movies: Movie[];
  isLarge?: boolean;
  linkPath?: string;
}

const ContentRow: React.FC<ContentRowProps> = ({ title, movies, isLarge, linkPath }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);
  const navigate = useNavigate();

  const slide = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth + 200
        : scrollLeft + clientWidth - 200;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      
      if (direction === 'right') setIsMoved(true);
      if (direction === 'left' && scrollTo <= 0) setIsMoved(false);
    }
  };

  const handleTitleClick = () => {
    if (linkPath) {
      navigate(linkPath);
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="space-y-2 my-6 px-4 md:px-14 group relative z-10">
      <h2 
        onClick={handleTitleClick}
        className={`text-zinc-200 font-semibold text-lg md:text-xl transition-colors hover:text-white flex items-end gap-3 px-2 w-fit ${linkPath ? 'cursor-pointer' : ''}`}
      >
        {title}
        {linkPath && (
            <span className="text-xs text-red-500 font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 mb-1">Explore All &gt;</span>
        )}
      </h2>
      
      <div className="relative group/row">
        {/* Left Arrow */}
        <div 
            className={`absolute top-0 bottom-0 left-0 w-14 z-40 bg-gradient-to-r from-black/80 to-transparent flex items-center justify-center cursor-pointer opacity-0 group-hover/row:opacity-100 transition duration-300 ${!isMoved && 'hidden'}`}
            onClick={() => slide('left')}
        >
            <ChevronLeft className="w-10 h-10 text-white transform hover:scale-125 transition duration-200" />
        </div>
        
        {/* Scroll Container */}
        {/* Padding adjustment: py-10 px-2 -my-6 ensures hover effects (which expand vertically) don't get clipped */}
        <div 
          ref={rowRef}
          className="flex items-center gap-2 md:gap-3 overflow-x-scroll scrollbar-hide no-scrollbar py-10 px-2 -my-6 scroll-smooth"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} isLarge={isLarge} />
          ))}
        </div>

        {/* Right Arrow */}
        <div 
            className="absolute top-0 bottom-0 right-0 w-14 z-40 bg-gradient-to-l from-black/80 to-transparent flex items-center justify-center cursor-pointer opacity-0 group-hover/row:opacity-100 transition duration-300"
            onClick={() => slide('right')}
        >
            <ChevronRight className="w-10 h-10 text-white transform hover:scale-125 transition duration-200" />
        </div>
      </div>
    </div>
  );
};

export default ContentRow;