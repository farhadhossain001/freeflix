import React, { useEffect, useState } from 'react';
import * as _ReactRouterDOM from 'react-router-dom';
import { Play, Plus, Share2, Film, ArrowLeft, X, Star, Calendar, Clock } from 'lucide-react';
import { fetchDetails, getImageUrl } from '../services/api';
import { MovieDetails } from '../types';
import ContentRow from '../components/ContentRow';

// Fix: Cast react-router-dom to any to avoid type errors with missing members
const { useParams, useNavigate, useLocation } = _ReactRouterDOM as any;

const Details: React.FC = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);

  useEffect(() => {
    if (location.state && (location.state as any).autoplay) {
        navigate(`/player/${type}/${id}`);
    }
  }, [location.state, type, id, navigate]);

  useEffect(() => {
    const loadDetails = async () => {
      if (type && id) {
        setLoading(true);
        const data = await fetchDetails(parseInt(id), type as 'movie' | 'tv');
        setMovie(data);
        setLoading(false);
      }
    };
    loadDetails();
  }, [type, id]);

  const handleBack = () => {
      // Check if there's history to go back to, otherwise go home
      if (window.history.length > 1) {
          navigate(-1);
      } else {
          navigate('/');
      }
  };

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!movie) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Content not found</div>;

  const backdropUrl = movie.backdrop_path 
    ? getImageUrl(movie.backdrop_path, 'original') 
    : `https://picsum.photos/seed/${movie.id}/1920/1080`;

  const posterUrl = getImageUrl(movie.poster_path, 'w500');

  const handlePlay = () => {
    navigate(`/player/${type}/${id}`);
  };

  return (
    <div className="bg-zinc-950 min-h-screen pb-20 overflow-x-hidden font-sans">
      
      {/* Navigation Buttons - Positioned below the main Navbar (approx top-20 / top-24) */}
      <div className="fixed top-20 md:top-24 left-4 md:left-12 z-40">
          <button 
             onClick={handleBack} 
             className="group flex items-center gap-2 bg-black/40 hover:bg-black/70 px-4 py-2 rounded-full text-white backdrop-blur-md border border-white/10 transition-all hover:border-white/30"
          >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden md:inline">Back</span>
          </button>
      </div>

      {/* Main Visual Header */}
      <div className="relative w-full h-[70vh] md:h-[85vh]">
        <div className="absolute inset-0">
             <img 
                src={backdropUrl} 
                alt={movie.title} 
                className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-transparent to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 w-full px-4 md:px-16 pb-12 flex items-end">
            <div className="flex flex-col md:flex-row gap-8 items-end w-full max-w-7xl">
                
                {/* Poster (Hidden on mobile, visible on desktop for classic layout) */}
                <div className="hidden md:block w-48 lg:w-64 flex-shrink-0 rounded-lg shadow-2xl overflow-hidden border border-white/10 relative -mb-20 z-20">
                    <img src={posterUrl} alt="Poster" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 space-y-6 mb-4">
                     <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-xl leading-none">
                        {movie.title || movie.name}
                     </h1>

                     {/* Metadata Tags */}
                     <div className="flex flex-wrap items-center gap-4 text-zinc-300 font-medium text-sm md:text-base">
                         <div className="flex items-center gap-1 text-yellow-400">
                             <Star className="w-4 h-4 fill-current" />
                             <span>{movie.vote_average.toFixed(1)}</span>
                         </div>
                         <div className="flex items-center gap-1">
                             <Calendar className="w-4 h-4" />
                             <span>{new Date(movie.release_date || movie.first_air_date || Date.now()).getFullYear()}</span>
                         </div>
                         {movie.runtime && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                            </div>
                         )}
                         <span className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded text-xs border border-zinc-700">HD</span>
                         <span className="bg-red-600/20 text-red-400 px-2 py-0.5 rounded text-xs border border-red-600/30 uppercase font-bold tracking-wide">
                            {type === 'movie' ? 'Movie' : 'TV Series'}
                         </span>
                     </div>

                     {/* Action Bar */}
                     <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button 
                            onClick={handlePlay}
                            className="flex items-center gap-2 bg-red-600 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(220,38,38,0.4)]"
                        >
                            <Play className="w-5 h-5 fill-white" /> 
                            <span className="text-lg">Watch Now</span>
                        </button>

                        <button 
                            onClick={() => setInList(!inList)}
                            className={`flex items-center gap-2 px-6 py-3.5 rounded-lg font-semibold transition-all backdrop-blur-md border 
                            ${inList ? 'bg-white text-black border-white' : 'bg-zinc-800/60 text-white border-white/20 hover:bg-zinc-700'}`}
                        >
                            {inList ? <CheckIcon /> : <Plus className="w-5 h-5" />}
                            <span>My List</span>
                        </button>
                        
                        <button className="p-3.5 rounded-lg border border-zinc-600/50 bg-black/40 hover:bg-black/60 hover:border-white/50 transition-all text-zinc-300 hover:text-white">
                            <Share2 className="w-5 h-5" />
                        </button>
                     </div>
                </div>
            </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="max-w-7xl mx-auto px-4 md:px-16 pt-24 md:pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Left Column: Synopsis & Cast */}
              <div className="lg:col-span-2 space-y-10">
                  <div className="glass p-6 rounded-2xl">
                      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                         Storyline
                      </h3>
                      <p className="text-zinc-300 leading-relaxed text-lg font-light">
                          {movie.overview}
                      </p>
                  </div>

                  <div>
                      <h3 className="text-white font-bold text-xl mb-6">Top Cast</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {movie.cast?.map(actor => (
                          <div key={actor.id} className="flex items-center gap-3 bg-zinc-900/40 p-3 rounded-xl border border-white/5 hover:bg-zinc-800/60 transition-colors group">
                             <div className="w-12 h-12 flex-shrink-0 bg-zinc-800 rounded-full overflow-hidden shadow-md">
                               <img 
                                 src={actor.profile_path ? getImageUrl(actor.profile_path) : `https://ui-avatars.com/api/?name=${actor.name}&background=random`} 
                                 alt={actor.name}
                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                               />
                             </div>
                             <div className="overflow-hidden">
                                 <p className="text-white text-sm font-semibold truncate group-hover:text-red-400 transition-colors">{actor.name}</p>
                                 <p className="text-zinc-500 text-xs truncate">{actor.character}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                  </div>
              </div>

              {/* Right Column: Info Panel */}
              <div className="space-y-6">
                 <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl backdrop-blur-sm space-y-6">
                    <div>
                         <span className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Genres</span>
                         <div className="flex flex-wrap gap-2">
                             {movie.genres.map(g => (
                                <span key={g.id} className="text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1 rounded-full text-sm transition-colors cursor-default">
                                    {g.name}
                                </span>
                             ))}
                         </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div>
                        <span className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Status</span>
                        <span className="text-white">{(movie as any).status || 'Released'}</span>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div>
                        <span className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Language</span>
                        <span className="text-white uppercase">{(movie as any).original_language || 'EN'}</span>
                    </div>

                    {type === 'tv' && movie.seasons && (
                        <>
                            <div className="h-px bg-white/5" />
                            <div>
                                <span className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Seasons</span>
                                <span className="text-white text-lg font-semibold">{movie.seasons.length} Seasons</span>
                            </div>
                        </>
                    )}
                 </div>
              </div>
          </div>
      </div>

      {movie.similar && movie.similar.length > 0 && (
        <div className="mt-20 border-t border-zinc-900 pt-10">
          <ContentRow title="More Like This" movies={movie.similar} />
        </div>
      )}
    </div>
  );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
)

export default Details;