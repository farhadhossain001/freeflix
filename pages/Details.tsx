import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Play, Plus, X, Share2, ChevronDown, ChevronRight, MonitorPlay, Film, Tv, ArrowLeft, Layers } from 'lucide-react';
import { fetchDetails, getImageUrl } from '../services/api';
import { MovieDetails } from '../types';
import ContentRow from '../components/ContentRow';

const Details: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Player state
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check for autoplay passed from state
    if (location.state && (location.state as any).autoplay) {
        setIsPlaying(true);
    }
  }, [location.state]);

  useEffect(() => {
    const loadDetails = async () => {
      if (type && id) {
        setLoading(true);
        const data = await fetchDetails(parseInt(id), type as 'movie' | 'tv');
        setMovie(data);
        
        // Default to season 1 episode 1 if TV
        if (type === 'tv') {
            setSeason(1);
            setEpisode(1);
        }
        
        setLoading(false);
      }
    };
    loadDetails();
    
    // Reset player state when ID changes
    if (!location.state || !(location.state as any).keepPlayerState) {
        setIsPlaying(false);
        setSeason(1);
        setEpisode(1);
        setSidebarOpen(false);
    }
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
  
  // Enforced MultiServer (vidsrc.cc)
  const videoUrl = type === 'movie'
      ? `https://vidsrc.cc/v2/embed/movie/${movie.id}`
      : `https://vidsrc.cc/v2/embed/tv/${movie.id}/${season}/${episode}`;

  return (
    <div className="bg-zinc-950 min-h-screen pb-20 overflow-x-hidden">
      {/* Video Player Overlay */}
      {isPlaying && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in fade-in duration-300">
           
           {/* Top Left Back Button */}
           <div className="absolute top-4 left-4 md:top-6 md:left-6 z-50">
             <button 
               onClick={() => setIsPlaying(false)}
               className="group flex items-center justify-center bg-black/40 hover:bg-red-600 w-12 h-12 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 shadow-lg hover:scale-110"
             >
               <ArrowLeft className="w-6 h-6 text-white" />
             </button>
           </div>

           {/* Floating Episode List Toggle (Only for TV) */}
           {type === 'tv' && (
             <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-50">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-105 active:scale-95 font-bold tracking-wide"
                >
                  <Layers className="w-5 h-5" />
                  <span className="hidden md:inline">Episodes</span>
                </button>
             </div>
           )}

           {/* Episodes Sidebar Overlay */}
           {type === 'tv' && (
              <div 
                className={`
                    fixed inset-y-0 right-0 w-full sm:w-96 bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 z-[70] 
                    shadow-2xl transform transition-transform duration-500 ease-out flex flex-col
                    ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
              >
                  <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50">
                     <div>
                        <h2 className="text-xl font-bold text-white">Episodes</h2>
                        <p className="text-xs text-zinc-400 mt-1 font-medium">{movie.name}</p>
                     </div>
                     <button 
                       onClick={() => setSidebarOpen(false)}
                       className="p-2 hover:bg-white/10 rounded-full transition-colors"
                     >
                        <X className="w-6 h-6 text-zinc-400 hover:text-white" />
                     </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                     {seasons.map((s) => (
                        <div key={s.id} className="bg-zinc-900/40 rounded-xl overflow-hidden border border-white/5 transition-all duration-300">
                           <button 
                               onClick={() => setSeason(s.season_number)}
                               className={`w-full flex items-center justify-between p-4 text-left font-medium transition-colors ${season === s.season_number ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
                           >
                               <span className="flex items-center gap-2">
                                  Season {s.season_number}
                                  {season === s.season_number && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded">Playing</span>}
                               </span>
                               {season === s.season_number ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                           </button>
                           
                           {/* Episodes Grid - Only visible for active season */}
                           <div className={`grid grid-cols-5 gap-2 p-3 bg-black/20 border-t border-white/5 ${season === s.season_number ? 'block' : 'hidden'}`}>
                               {Array.from({ length: s.episode_count }).map((_, i) => {
                                   const epNum = i + 1;
                                   const isActive = episode === epNum && season === s.season_number;
                                   return (
                                       <button
                                          key={epNum}
                                          onClick={() => {
                                              setEpisode(epNum);
                                              // Optional: close sidebar on selection for mobile? 
                                              // setSidebarOpen(false); 
                                          }}
                                          className={`
                                            aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200
                                            ${isActive 
                                              ? 'bg-red-600 text-white shadow-lg shadow-red-900/30 scale-105' 
                                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white hover:scale-105'
                                            }
                                          `}
                                       >
                                           {epNum}
                                       </button>
                                   );
                               })}
                           </div>
                        </div>
                     ))}
                     {seasons.length === 0 && (
                        <div className="text-center text-zinc-500 py-10">
                            No season info available
                        </div>
                     )}
                  </div>
              </div>
           )}
           
           {/* Overlay backdrop for sidebar (click to close) */}
           {isSidebarOpen && (
             <div className="fixed inset-0 bg-black/50 z-[65] backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
           )}

           {/* Player Container */}
           <div className="flex-1 flex items-center justify-center relative bg-black">
                {/* Loader / Placeholder behind iframe */}
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-0">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                        <div className="w-10 h-10 border-4 border-zinc-700 border-t-red-600 rounded-full animate-spin"></div>
                        <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase">Loading Stream</p>
                    </div>
                </div>
                
                <iframe
                    key={videoUrl} 
                    src={videoUrl}
                    className="relative z-10 w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="origin"
                    sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
                    title="Video Player"
                />
           </div>
        </div>
      )}

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
              onClick={() => setIsPlaying(true)}
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
