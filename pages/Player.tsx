import React, { useEffect, useState } from 'react';
import * as _ReactRouterDOM from 'react-router-dom';
import { Layers, X, ChevronDown, ChevronRight } from 'lucide-react';
import { fetchDetails } from '../services/api';
import { MovieDetails } from '../types';

// Fix: Cast react-router-dom to any to avoid type errors with missing members
const { useParams, useNavigate } = _ReactRouterDOM as any;

const SERVERS = [
  { id: 'vidsrc-cc', name: 'VidSrc 1 (Fast)', url: 'https://vidsrc.cc/v2/embed' },
  { id: 'vidfast', name: 'VidFast', url: 'https://www.vidfast.pro' },
  { id: 'embed-api', name: 'Embed API', url: 'https://player.embed-api.stream' },
  { id: 'superembed', name: 'MultiEmbed', url: 'https://multiembed.mov' },
  { id: 'vidsrc-xyz', name: 'VidSrc 2 (Backup)', url: 'https://vidsrc.xyz/embed' },
  { id: 'vidsrc-pro', name: 'VidSrc 3 (Alt)', url: 'https://vidsrc.pro/embed' },
];

const Player: React.FC = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentServer, setCurrentServer] = useState(SERVERS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (type && id) {
        const data = await fetchDetails(parseInt(id), type as 'movie' | 'tv');
        setMovie(data);
        setLoading(false);
      }
    };
    loadData();
  }, [type, id]);

  const handleBack = () => {
      if (window.history.length > 1) {
          navigate(-1);
      } else {
          navigate('/');
      }
  };

  if (loading) {
     return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!movie) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Content not found</div>;

  const seasons = movie.seasons?.filter(s => s.season_number > 0) || [];
  
  const getVideoUrl = () => {
      // Logic for VidFast
      if (currentServer.id === 'vidfast') {
          if (type === 'movie') {
              return `${currentServer.url}/movie/${id}`;
          } else {
              return `${currentServer.url}/tv/${id}/${season}/${episode}`;
          }
      }

      // Logic for Embed API
      if (currentServer.id === 'embed-api') {
          if (type === 'movie') {
              return `${currentServer.url}/?id=${id}`;
          } else {
              return `${currentServer.url}/?id=${id}&s=${season}&e=${episode}`;
          }
      }

      // Logic for MultiEmbed (SuperEmbed)
      if (currentServer.id === 'superembed') {
          if (type === 'movie') {
              return `${currentServer.url}/?video_id=${id}&tmdb=1`;
          } else {
              return `${currentServer.url}/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
          }
      }
      
      // Logic for VidSrc CC
      if (currentServer.id === 'vidsrc-cc') {
           if (type === 'movie') {
              return `${currentServer.url}/movie/${id}`;
          } else {
              return `${currentServer.url}/tv/${id}/${season}/${episode}`;
          }
      }

      // Default fallback for generic VidSrc clones (xyz, pro)
      if (type === 'movie') {
          return `${currentServer.url}/movie/${id}`;
      } else {
          return `${currentServer.url}/tv/${id}/${season}/${episode}`;
      }
  };

  const videoUrl = getVideoUrl();

  return (
    <div className="bg-black h-screen w-screen overflow-hidden flex flex-col relative group/player">
       {/* Removed Top Controls Container (Back button & Server select) to fix clickability and declutter */}

       {/* Sidebar Toggle (TV Only) - Moved to Top Right */}
       {type === 'tv' && (
         <div className="absolute top-6 right-6 z-50 transition-opacity duration-300 opacity-100 group-hover/player:opacity-100 md:opacity-0">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-105 active:scale-95 font-bold tracking-wide"
            >
              <Layers className="w-5 h-5" />
              <span className="hidden md:inline">Episodes</span>
            </button>
         </div>
       )}

       {/* Sidebar Overlay (Episodes) */}
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
                    <p className="text-xs text-zinc-400 mt-1 font-medium">{movie.title || movie.name}</p>
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
                       
                       <div className={`grid grid-cols-5 gap-2 p-3 bg-black/20 border-t border-white/5 ${season === s.season_number ? 'block' : 'hidden'}`}>
                           {Array.from({ length: s.episode_count }).map((_, i) => {
                               const epNum = i + 1;
                               const isActive = episode === epNum && season === s.season_number;
                               return (
                                   <button
                                      key={epNum}
                                      onClick={() => {
                                          setEpisode(epNum);
                                      }}
                                      className={`
                                        aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200
                                        ${isActive 
                                          ? 'bg-red-600 text-white shadow-lg shadow-red-900/30 scale-105 ring-2 ring-red-600/50' 
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

       {/* Sidebar Backdrop (Episodes) */}
       {isSidebarOpen && (
         <div className="fixed inset-0 bg-black/50 z-[65] backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
       )}

       {/* Player Container */}
       <div className="flex-1 flex items-center justify-center relative bg-black">
            {/* Loader / Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-0">
                <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
                    <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase mt-4">Establishing Connection</p>
                </div>
            </div>
            
            <iframe
                key={`${currentServer.id}-${videoUrl}`} 
                src={videoUrl}
                className="relative z-10 w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="origin"
                sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
                title="Video Player"
            />
       </div>
    </div>
  );
};

export default Player;
