export interface Movie {
  id: number;
  title: string; // For movies
  name?: string; // For TV shows
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
  genre_ids?: number[];
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date?: string;
  poster_path?: string | null;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime?: number;
  cast?: CastMember[];
  similar?: Movie[];
  seasons?: Season[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Category {
  id: string;
  title: string;
  endpoint: string;
}

export enum FetchType {
  Movie = 'movie',
  TV = 'tv',
  Multi = 'multi'
}