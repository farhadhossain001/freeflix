import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { Movie } from '../types';

interface ContentRowProps {
  title: string;
  movies: Movie[];
  isLarge?: boolean;
}

const ContentRow: React.FC<ContentRowProps> = ({ title, movies, isLarge }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const slide = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="space-y-2 my-6 md:my-8 px-4 md:px-12 group relative z-10">
      <h2 className="text-zinc-100 font-bold text-lg md:text-2xl transition-colors hover:text-white cursor-pointer flex items-center gap-2">
        {title}
        <span className="text-xs text-zinc-500 font-normal opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-block">See all</span>
      </h2>
      
      <div className="relative group/row -mx-4 md:-mx-12 px-4 md:px-12">
        <ChevronLeft 
          className="absolute top-0 bottom-0 left-2 md:left-14 z-[60] m-auto h-12 w-12 cursor-pointer opacity-0 transition-all duration-300 hover:scale-110 group-hover/row:opacity-100 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 hidden md:block border border-white/10 backdrop-blur-sm" 
          onClick={() => slide('left')}
        />
        
        <div 
          ref={rowRef}
          className="flex items-center space-x-3 md:space-x-4 overflow-x-scroll scrollbar-hide no-scrollbar py-12 px-2 scroll-smooth"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} isLarge={isLarge} />
          ))}
        </div>

        <ChevronRight 
          className="absolute top-0 bottom-0 right-2 md:right-14 z-[60] m-auto h-12 w-12 cursor-pointer opacity-0 transition-all duration-300 hover:scale-110 group-hover/row:opacity-100 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 hidden md:block border border-white/10 backdrop-blur-sm" 
          onClick={() => slide('right')}
        />
      </div>
    </div>
  );
};

export default ContentRow;