import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Play, Plus, Share2, Film } from 'lucide-react';
import { fetchDetails, getImageUrl } from '../services/api';
import { MovieDetails } from '../types';
import ContentRow from '../components/ContentRow';

const Details: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for autoplay passed from state and redirect immediately
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

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!movie) return <div className="text-white pt-20 text-center">Content not found</div>;

  const backdropUrl = movie.backdrop_path 
    ? getImageUrl(movie.backdrop_path, 'original') 
    : `https://picsum.photos/seed/${movie.id}/1920/1080`;

  const seasons = movie.seasons?.filter(s => s.season_number > 0) || [];
  
  const handlePlay = () => {
    navigate(`/player/${type}/${id}`);
  };

  return (
    <div className="bg-zinc-950 min-h-screen pb-20 overflow-x-hidden">
      {/* Main Banner */}
      <div className="relative w-full h-[55vh] md:h-[75vh]">
        <img 
          src={backdropUrl} 
          alt={movie.title || movie.name} 
          className="w-full h-full object-cover"
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full px-4 md:px-12 pb-10 flex flex-col gap-5 z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-2xl max-w-4xl tracking-tight leading-none">
            {movie.title || movie.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-zinc-200 font-medium">
             <span className="text-green-400 font-bold tracking-wide">{(movie.vote_average * 10).toFixed(0)}% Match</span>
             <span>{new Date(movie.release_date || movie.first_air_date || Date.now()).getFullYear()}</span>
             <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-xs border border-zinc-600">HD</span>
             {movie.runtime && <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
             {type === 'tv' && movie.seasons && <span>{movie.seasons.length} Seasons</span>}
          </div>

          <div className="flex gap-2">
            {movie.genres.map(g => (
                <span key={g.id} className="text-xs md:text-sm text-zinc-300 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  {g.name}
                </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-2">
            <button 
              onClick={handlePlay}
              className="flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-lg font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <Play className="w-5 h-5 fill-black" /> 
              <span className="text-lg">Play Now</span>
            </button>
            <button className="flex items-center gap-2 bg-zinc-600/60 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-zinc-600/80 transition-all backdrop-blur-md border border-white/10 hover:border-white/30">
              <Plus className="w-5 h-5" /> 
              <span>My List</span>
            </button>
            <button className="p-3.5 rounded-lg border border-zinc-600/50 bg-black/40 hover:bg-black/60 hover:border-white/50 transition-all backdrop-blur-sm text-zinc-300 hover:text-white">
               <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-12 mt-4">
        {/* Left Column: Description */}
        <div className="lg:col-span-2 space-y-8">
           <div>
             <h3 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
                <Film className="w-5 h-5 text-red-600" /> Overview
             </h3>
             <p className="text-zinc-300 leading-relaxed text-lg">
               {movie.overview}
             </p>
           </div>

           <div>
             <h3 className="text-white font-bold text-xl mb-4">Top Cast</h3>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
               {movie.cast?.map(actor => (
                 <div key={actor.id} className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                    <div className="w-12 h-12 flex-shrink-0 bg-zinc-800 rounded-full overflow-hidden">
                      <img 
                        src={actor.profile_path ? getImageUrl(actor.profile_path) : `https://ui-avatars.com/api/?name=${actor.name}&background=random`} 
                        alt={actor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-zinc-200 text-sm font-semibold truncate">{actor.name}</p>
                        <p className="text-zinc-500 text-xs truncate">{actor.character}</p>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        </div>

        {/* Right Column: Metadata */}
        <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800 h-fit space-y-6">
           <div>
             <span className="block text-zinc-500 text-sm font-medium mb-1 uppercase tracking-wider">Genres</span>
             <div className="flex flex-wrap gap-2">
                 {movie.genres.map(g => (
                    <span key={g.id} className="text-zinc-200 bg-zinc-800 px-2 py-1 rounded text-sm">{g.name}</span>
                 ))}
             </div>
           </div>
           
           <div className="h-px bg-zinc-800" />
           
           <div>
             <span className="block text-zinc-500 text-sm font-medium mb-1 uppercase tracking-wider">Original Language</span>
             <span className="text-white text-lg font-medium flex items-center gap-2">
                <span className="uppercase">{(movie as any).original_language || 'EN'}</span>
             </span>
           </div>

           <div className="h-px bg-zinc-800" />

           <div>
             <span className="block text-zinc-500 text-sm font-medium mb-1 uppercase tracking-wider">Status</span>
             <span className="text-white text-lg font-medium">{(movie as any).status || 'Released'}</span>
           </div>
           
           {type === 'tv' && (
              <>
                <div className="h-px bg-zinc-800" />
                <div>
                    <span className="block text-zinc-500 text-sm font-medium mb-1 uppercase tracking-wider">Total Seasons</span>
                    <span className="text-white text-lg font-medium">{seasons.length}</span>
                </div>
              </>
           )}
        </div>
      </div>

      {movie.similar && movie.similar.length > 0 && (
        <div className="mt-16 border-t border-zinc-900 pt-8">
          <ContentRow title="More Like This" movies={movie.similar} />
        </div>
      )}
    </div>
  );
};

export default Details;