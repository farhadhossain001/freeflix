import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Play, Plus, X, Share2, ChevronDown, MonitorPlay, ChevronLeft, ChevronRight, Film, Tv } from 'lucide-react';
import { fetchDetails, getImageUrl } from '../services/api';
import { MovieDetails } from '../types';
import ContentRow from '../components/ContentRow';

interface Server {
  name: string;
  getUrl: (id: number, type: 'movie' | 'tv', season?: number, episode?: number) => string;
}

const SERVERS: Server[] = [
  {
    name: "VidSrc",
    getUrl: (id, type, s, e) => type === 'movie'
      ? `https://vidsrc.to/embed/movie/${id}`
      : `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
  },
  {
    name: "MultiEmbed",
    getUrl: (id, type, s, e) => type === 'movie'
      ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`
      : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}`
  },
  {
    name: "MultiServer", 
    getUrl: (id, type, s, e) => type === 'movie'
      ? `https://vidsrc.cc/v2/embed/movie/${id}`
      : `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`
  },
  {
    name: "VidSrc Pro",
    getUrl: (id, type, s, e) => type === 'movie'
      ? `https://vidsrc.pro/embed/movie/${id}`
      : `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`
  },
  {
     name: "SmashyStream",
     getUrl: (id, type, s, e) => type === 'movie'
       ? `https://embed.smashystream.com/playere.php?tmdb=${id}`
       : `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`
  }
];

const Details: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Player state
  const [serverIndex, setServerIndex] = useState(0);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

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
        setServerIndex(0);
        setSeason(1);
        setEpisode(1);
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
  const currentSeasonData = seasons.find(s => s.season_number === season);
  const episodeCount = currentSeasonData?.episode_count || 1;
  const episodes = Array.from({ length: episodeCount }, (_, i) => i + 1);

  const activeServer = SERVERS[serverIndex];
  const videoUrl = activeServer.getUrl(movie.id, type as 'movie' | 'tv', season, episode);

  const handleNextEpisode = () => {
    if (episode < episodeCount) {
        setEpisode(episode + 1);
    } else {
        // Try next season
        const nextSeason = seasons.find(s => s.season_number === season + 1);
        if (nextSeason) {
            setSeason(nextSeason.season_number);
            setEpisode(1);
        }
    }
  };

  const handlePrevEpisode = () => {
    if (episode > 1) {
        setEpisode(episode - 1);
    } else {
        // Try prev season
        const prevSeason = seasons.find(s => s.season_number === season - 1);
        if (prevSeason) {
            setSeason(prevSeason.season_number);
            setEpisode(prevSeason.episode_count);
        }
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen pb-20 overflow-x-hidden">
      {/* Video Player Overlay */}
      {isPlaying && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
           {/* Header */}
           <div className="flex justify-between items-center p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10 pointer-events-none">
             <div className="pointer-events-auto flex flex-col">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsPlaying(false)} className="md:hidden text-white/80 hover:text-white mr-2">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-white font-bold text-lg md:text-2xl drop-shadow-md line-clamp-1">
                        {movie.title || movie.name}
                    </h2>
                </div>
                {type === 'tv' && (
                    <p className="text-zinc-300 text-sm font-medium ml-0 md:ml-0 mt-1 flex items-center gap-2">
                         <span className="bg-red-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">S{season}</span>
                         <span className="bg-zinc-700/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">E{episode}</span>
                    </p>
                )}
             </div>
             
             <button 
               onClick={() => setIsPlaying(false)}
               className="pointer-events-auto group bg-zinc-800/50 hover:bg-red-600/80 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 border border-white/10 hover:border-red-500 hover:rotate-90"
             >
               <X className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" />
             </button>
           </div>
           
           {/* Player Stage */}
           <div className="flex-1 flex items-center justify-center p-0 md:p-4 lg:p-10 relative">
             <div className="relative w-full h-full max-w-[1600px] flex items-center bg-black shadow-2xl md:rounded-xl overflow-hidden border border-zinc-900/50">
                {/* Loader / Placeholder behind iframe */}
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-0">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                        <div className="w-10 h-10 border-4 border-zinc-700 border-t-red-600 rounded-full animate-spin"></div>
                        <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase">Loading Stream</p>
                    </div>
                </div>
                
                <iframe
                    key={`${videoUrl}-${serverIndex}`} 
                    src={videoUrl}
                    className="relative z-10 w-full h-full aspect-video"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="origin"
                    sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
                    title="Video Player"
                />
             </div>
           </div>
           
           {/* Controls Bar */}
           <div className="bg-zinc-900/90 border-t border-white/5 backdrop-blur-lg p-4 pb-8 md:pb-6 transition-transform duration-300">
             <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 justify-between items-center">
                
                {/* Server Selector */}
                <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <div className="flex items-center gap-2 text-zinc-400 mb-1">
                        <MonitorPlay className="w-3 h-3" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Source</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide w-full">
                        {SERVERS.map((server, idx) => (
                            <button
                                key={idx}
                                onClick={() => setServerIndex(idx)}
                                className={`whitespace-nowrap px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 border ${
                                    serverIndex === idx 
                                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/20' 
                                    : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-700 hover:text-white hover:border-zinc-600'
                                }`}
                            >
                                {server.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TV Controls */}
                {type === 'tv' && (
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto bg-zinc-950/30 p-2 rounded-xl border border-white/5">
                         {/* Season Select */}
                         <div className="relative group w-full sm:w-auto">
                            <select 
                                value={season} 
                                onChange={(e) => {
                                    setSeason(Number(e.target.value));
                                    setEpisode(1);
                                }}
                                className="w-full sm:w-40 appearance-none bg-zinc-900 border border-zinc-700 text-white py-2.5 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition-all cursor-pointer hover:bg-zinc-800"
                            >
                                {seasons.map((s) => (
                                    <option key={s.id} value={s.season_number}>
                                        Season {s.season_number}
                                    </option>
                                ))}
                                {seasons.length === 0 && <option value={1}>Season 1</option>}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none group-hover:text-white transition-colors" />
                         </div>

                         {/* Episode Navigation */}
                         <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button 
                                onClick={handlePrevEpisode}
                                disabled={episode <= 1 && season <= 1}
                                className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white border border-zinc-700"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="relative flex-1 sm:w-48 group">
                                <select
                                    value={episode}
                                    onChange={(e) => setEpisode(Number(e.target.value))}
                                    className="w-full appearance-none bg-zinc-900 border border-zinc-700 text-white py-2.5 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition-all cursor-pointer hover:bg-zinc-800"
                                >
                                    {episodes.map((ep) => (
                                        <option key={ep} value={ep}>Episode {ep}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none group-hover:text-white transition-colors" />
                            </div>

                            <button 
                                onClick={handleNextEpisode}
                                disabled={episode >= episodeCount && season >= (seasons.length || 1)}
                                className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white border border-zinc-700"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                         </div>
                    </div>
                )}
             </div>
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