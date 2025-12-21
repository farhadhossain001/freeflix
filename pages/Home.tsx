import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import ContentRow from '../components/ContentRow';
import { fetchTrending, fetchMovies, fetchSeries } from '../services/api';
import { Movie } from '../types';

const Home: React.FC = () => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [popularSeries, setPopularSeries] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [trend, top, action, popSeries] = await Promise.all([
        fetchTrending(),
        fetchMovies('top_rated'),
        fetchMovies('now_playing'), // Using now_playing for variety
        fetchSeries('popular')
      ]);

      setTrending(trend);
      setTopRated(top);
      setActionMovies(action);
      setPopularSeries(popSeries);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Pick a random movie from trending for Hero
  const heroMovie = trending[Math.floor(Math.random() * trending.length)];

  return (
    <div className="bg-zinc-950 min-h-screen pb-20 md:pb-10">
      <Hero movie={heroMovie} />
      
      <div className="relative z-10 -mt-10 md:-mt-32">
        <ContentRow title="Trending Now" movies={trending} linkPath="/latest" />
        <ContentRow title="Top Rated Movies" movies={topRated} isLarge linkPath="/movies" />
        <ContentRow title="Popular Series" movies={popularSeries} linkPath="/series" />
        <ContentRow title="New Releases" movies={actionMovies} linkPath="/movies" />
      </div>
    </div>
  );
};

export default Home;