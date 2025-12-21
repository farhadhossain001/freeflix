import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { searchContent } from '../services/api';
import { Movie } from '../types';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsSearching(true);
        const data = await searchContent(query);
        setResults(data);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="bg-zinc-950 min-h-screen pt-28 px-4 md:px-14 pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="relative mb-12 group">
          <input
            type="text"
            placeholder="Search titles, people, genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-900/80 text-white text-xl py-5 px-14 rounded-none border-b-2 border-zinc-700 focus:border-red-600 focus:outline-none focus:bg-zinc-900 transition-all placeholder-zinc-500 font-medium"
            autoFocus
          />
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-6 h-6 group-focus-within:text-red-500 transition-colors" />
        </div>

        {isSearching ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {results.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
                {results.map((item) => (
                   (item.poster_path || item.backdrop_path) && (
                     <div key={item.id} className="flex justify-center w-full">
                       <MovieCard movie={item} />
                     </div>
                   )
                ))}
              </div>
            )}
            
            {query.length > 1 && results.length === 0 && !isSearching && (
              <div className="text-center text-zinc-500 mt-10">
                <p className="text-lg">No matches found for "{query}"</p>
                <p className="text-sm mt-2">Try checking your spelling or use different keywords.</p>
              </div>
            )}

            {query.length === 0 && (
              <div className="flex flex-col items-center justify-center text-zinc-700 mt-20 space-y-4">
                <SearchIcon className="w-16 h-16 opacity-20" />
                <p className="text-lg font-medium">Find your next favorite story</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;