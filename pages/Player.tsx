import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Layers, X, ChevronDown, ChevronRight, Server, Check } from 'lucide-react';
import { fetchDetails } from '../services/api';
import { MovieDetails } from '../types';

const SERVERS = [
  { id: 'vidsrc-cc', name: 'VidSrc 1 (Fast)', url: 'https://vidsrc.cc/v2/embed' },
  { id: 'vidsrc-xyz', name: 'VidSrc 2 (Backup)', url: 'https://vidsrc.xyz/embed' },
  { id: 'vidsrc-pro', name: 'VidSrc 3 (Alt)', url: 'https://vidsrc.pro/embed' },
  { id: 'superembed', name: 'SuperEmbed (Multi)', url: 'https://multiembed.mov' },
];

const Player: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isServerMenuOpen, setServerMenuOpen] = useState(false);
  const [currentServer, setCurrentServer] = useState(SERVERS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (type && id) {
        // We fetch details to get the season/episode count and title
        const data = await fetchDetails(parseInt(id), type as 'movie' | 'tv');
        setMovie(data);
        setLoading(false);
      }
    };
    loadData();
  }, [type, id]);

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
      if (currentServer.id === 'superembed') {
          if (type === 'movie') {
              return `${currentServer.url}/?video_id=${id}&tmdb=1`;
          } else {
              return `${currentServer.url}/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
          }
      }
      
      // Standard VidSrc path structure: /embed/type/id or /embed/type/id/s/e
      // Note: vidsrc.cc uses /v2/embed/movie/id
      if (currentServer.id === 'vidsrc-cc') {
           if (type === 'movie') {
              return `${currentServer.url}/movie/${id}`;
          } else {
              return `${currentServer.url}/tv/${id}/${season}/${episode}`;
          }
      }

      // Others usually /embed/movie/id
      if (type === 'movie') {
          return `${currentServer.url}/movie/${id}`;
      } else {
          return `${currentServer.url}/tv/${id}/${season}/${episode}`;
      }
  };

  const videoUrl = getVideoUrl();

  return (
    <div className="bg-black h-screen w-screen overflow-hidden flex flex-col relative">
       {/* Top Controls */}
       <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start z-50 pointer-events-none">
           {/* Back Button */}
           <button 
             onClick={() => navigate(-1)}
             className="pointer-events-auto group flex items-center justify-center bg-black/40 hover:bg-red-600 w-12 h-12 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 shadow-lg hover:scale-110"
           >
             <ArrowLeft className="w-6 h-6 text-white" />
           </button>

           {/* Server Select Button */}
           <button 
             onClick={() => setServerMenuOpen(true)}
             className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 bg-black/40 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-full backdrop-blur-md border border-white/10 transition-all shadow-lg"
           >
             <Server className="w-4 h-4" />
             <span className="text-sm font-medium hidden sm:inline">{currentServer.name}</span>
           </button>
       </div>

       {/* Server Selection Overlay */}
       {isServerMenuOpen && (
           <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 animate-in fade-in duration-200">
               <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setServerMenuOpen(false)} />
               
               <div className="relative bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
                   <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                       <h3 className="text-lg font-bold text-white flex items-center gap-2">
                           <Server className="w-5 h-5 text-red-600" /> 
                           Select Server
                       </h3>
                       <button 
                           onClick={() => setServerMenuOpen(false)}
                           className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                       >
                           <X className="w-5 h-5" />
                       </button>
                   </div>
                   
                   <div className="p-2">
                       {SERVERS.map((server) => (
                           <button
                               key={server.id}
                               onClick={() => {
                                   setCurrentServer(server);
                                   setServerMenuOpen(false);
                               }}
                               className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 mb-1 group
                                   ${currentServer.id === server.id 
                                       ? 'bg-red-600/10 border border-red-600/20' 
                                       : 'hover:bg-zinc-800 border border-transparent'
                                   }
                               `}
                           >
                               <div className="flex flex-col items-start">
                                   <span className={`font-medium ${currentServer.id === server.id ? 'text-red-500' : 'text-zinc-200 group-hover:text-white'}`}>
                                       {server.name}
                                   </span>
                                   <span className="text-xs text-zinc-500">
                                       {server.id === 'superembed' ? 'Best for older content' : 'Fast streaming'}
                                   </span>
                               </div>
                               {currentServer.id === server.id && (
                                   <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                       <Check className="w-3.5 h-3.5 text-white" />
                                   </div>
                               )}
                           </button>
                       ))}
                   </div>
                   
                   <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 text-center">
                       <p className="text-xs text-zinc-500">
                           If a video doesn't load, try switching servers.
                       </p>
                   </div>
               </div>
           </div>
       )}

       {/* Sidebar Toggle (TV Only) */}
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

       {/* Sidebar Backdrop (Episodes) */}
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
                    <p className="text-zinc-600 text-[10px] font-mono mt-2">{currentServer.name}</p>
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