import React, { useEffect, useState } from 'react';
import * as _ReactRouterDOM from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { fetchMovies, fetchSeries } from '../services/api';
import { Movie } from '../types';

// Fix: Cast react-router-dom to any to avoid type errors with missing members
const { useLocation } = _ReactRouterDOM as any;

interface ExploreProps {
  type: 'movie' | 'tv';
}

const Explore: React.FC<ExploreProps> = ({ type }) => {
  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    setItems([]);
    
    const loadData = async () => {
      let data: Movie[] = [];
      if (type === 'movie') {
        const [popular, top] = await Promise.all([fetchMovies('popular'), fetchMovies('top_rated')]);
        data = [...popular, ...top];
      } else {
        const [popular, top] = await Promise.all([fetchSeries('popular'), fetchSeries('top_rated')]);
        data = [...popular, ...top];
      }
      
      const uniqueItems = Array.from(new Map(data.map(item => [item.id, item])).values());
      setItems(uniqueItems);
      setLoading(false);
    };

    loadData();
  }, [type, location.pathname]);

  return (
    <div className="bg-zinc-950 min-h-screen pt-28 px-4 md:px-14 pb-24">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight">
        {type === 'movie' ? 'Movies' : 'TV Series'}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
          {items.map((item) => (
             <div key={item.id} className="flex justify-center w-full">
                <MovieCard movie={{...item, media_type: type}} />
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;