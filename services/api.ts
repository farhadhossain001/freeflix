import { Movie, MovieDetails, CastMember, FetchType } from '../types';

// NOTE: In a real production app, this key should be in an environment variable.
// If you have a TMDB key, replace the empty string below.
// If left empty, the app will use high-fidelity mock data.
const API_KEY = '0dd1f6130aeb52d239896d571a9aa9aa'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// --- MOCK DATA GENERATORS (Used if no API Key) ---

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574375927938-d5a98e8efe85?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?q=80&w=800&auto=format&fit=crop"
];

const generateMockMovies = (count: number, type: 'movie' | 'tv'): Movie[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 100,
    title: type === 'movie' ? `Epic Movie Title ${i + 1}` : undefined,
    name: type === 'tv' ? `Awesome Series ${i + 1}` : undefined,
    poster_path: null, // Will trigger fallback in component
    backdrop_path: null, // Will trigger fallback in component
    overview: "In a world where artificial intelligence rules, one hero rises to challenge the system. Experience the thrill, the drama, and the spectacular visuals in this critically acclaimed masterpiece.",
    vote_average: 7 + (Math.random() * 2),
    release_date: "2023-11-15",
    first_air_date: "2023-09-01",
    media_type: type,
    genre_ids: [28, 878]
  }));
};

const MOCK_DATA: Record<string, Movie[]> = {
  trending: generateMockMovies(10, 'movie'),
  topRated: generateMockMovies(10, 'movie'),
  popular: generateMockMovies(10, 'tv'),
  action: generateMockMovies(10, 'movie'),
};

// --- HELPER FUNCTIONS ---

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500'): string => {
  if (!path) return ''; 
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// --- API METHODS ---

export const fetchTrending = async (): Promise<Movie[]> => {
  if (!API_KEY) return new Promise(resolve => setTimeout(() => resolve(MOCK_DATA.trending), 500));
  
  try {
    const response = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("API Error", error);
    return MOCK_DATA.trending;
  }
};

export const fetchMovies = async (category: string): Promise<Movie[]> => {
  if (!API_KEY) return new Promise(resolve => setTimeout(() => resolve(MOCK_DATA.topRated), 500));

  try {
    const response = await fetch(`${BASE_URL}/movie/${category}?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    return MOCK_DATA.topRated;
  }
};

export const fetchSeries = async (category: string): Promise<Movie[]> => {
  if (!API_KEY) return new Promise(resolve => setTimeout(() => resolve(MOCK_DATA.popular), 500));

  try {
    const response = await fetch(`${BASE_URL}/tv/${category}?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    return MOCK_DATA.popular;
  }
};

export const fetchDetails = async (id: number, type: 'movie' | 'tv'): Promise<MovieDetails | null> => {
  if (!API_KEY) {
    const mockDetail: MovieDetails = {
      ...MOCK_DATA.trending[0],
      id: id,
      title: type === 'movie' ? 'Mockbuster Movie' : undefined,
      name: type === 'tv' ? 'Mock Series' : undefined,
      genres: [{ id: 1, name: 'Action' }, { id: 2, name: 'Sci-Fi' }],
      runtime: 124,
      cast: [
        { id: 1, name: 'John Doe', character: 'The Hero', profile_path: null },
        { id: 2, name: 'Jane Smith', character: 'The Villain', profile_path: null },
      ],
      similar: generateMockMovies(5, type),
      seasons: type === 'tv' ? [
        { id: 1, name: 'Season 1', season_number: 1, episode_count: 8 },
        { id: 2, name: 'Season 2', season_number: 2, episode_count: 10 }
      ] : undefined
    };
    return new Promise(resolve => setTimeout(() => resolve(mockDetail), 300));
  }

  try {
    const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&append_to_response=credits,similar,videos`);
    const data = await response.json();
    
    return {
      ...data,
      cast: data.credits?.cast?.slice(0, 10) || [],
      similar: data.similar?.results?.slice(0, 10) || []
    };
  } catch (error) {
    return null;
  }
};

export const searchContent = async (query: string): Promise<Movie[]> => {
  if (!query) return [];
  if (!API_KEY) return new Promise(resolve => setTimeout(() => resolve(MOCK_DATA.trending.filter(m => (m.title || m.name)?.toLowerCase().includes(query.toLowerCase()))), 300));

  try {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    return [];
  }
};