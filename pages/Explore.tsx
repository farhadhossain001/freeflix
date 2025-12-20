import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { fetchMovies, fetchSeries } from '../services/api';
import { Movie } from '../types';

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
      
      // Remove duplicates
      const uniqueItems = Array.from(new Map(data.map(item => [item.id, item])).values());
      setItems(uniqueItems);
      setLoading(false);
    };

    loadData();
  }, [type, location.pathname]);

  return (
    <div className="bg-zinc-950 min-h-screen pt-24 px-4 md:px-12 pb-24">
      <h1 className="text-3xl font-bold text-white mb-8">
        {type === 'movie' ? 'Movies' : 'TV Series'}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-6">
          {items.map((item) => (
             <div key={item.id} className="flex justify-center">
                <MovieCard movie={{...item, media_type: type}} />
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;