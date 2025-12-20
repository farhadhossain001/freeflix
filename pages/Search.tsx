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
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="bg-zinc-950 min-h-screen pt-24 px-4 md:px-12 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-10">
          <input
            type="text"
            placeholder="Movies, shows, genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-800 text-white text-lg py-4 px-12 rounded focus:outline-none focus:ring-2 focus:ring-zinc-600 placeholder-zinc-500"
            autoFocus
          />
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-6 h-6" />
        </div>

        {isSearching ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-zinc-500"></div>
          </div>
        ) : (
          <>
            {results.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {results.map((item) => (
                   // Filter out people or items without posters for cleaner UI
                   (item.poster_path || item.backdrop_path) && (
                     <div key={item.id} className="flex justify-center">
                       <MovieCard movie={item} />
                     </div>
                   )
                ))}
              </div>
            )}
            
            {query.length > 1 && results.length === 0 && !isSearching && (
              <div className="text-center text-zinc-500 mt-10">
                <p>No results found for "{query}"</p>
              </div>
            )}

            {query.length === 0 && (
              <div className="text-center text-zinc-600 mt-20">
                <p>Type to search for movies and TV shows</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;