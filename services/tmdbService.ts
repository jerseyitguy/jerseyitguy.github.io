
import { TMDB_API_KEY, TMDB_BASE_URL } from '../constants';
import { TMDBSearchResultItem, Genre, SearchFilters } from '../types';

interface TMDBListResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface TMDBGenresResponse {
  genres: Genre[];
}

const fetchTMDB = async <T,>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<T> => {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'en-US');

  for (const key in params) {
    if (params[key] !== undefined) {
      url.searchParams.append(key, String(params[key]));
    }
  }
  
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('TMDB API Error:', errorData);
      throw new Error(errorData.message || `TMDB API request failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  } catch (error) {
    console.error('Network or parsing error:', error);
    throw error; // Re-throw to be caught by caller
  }
};

export const searchTMDB = async (query: string, filters: SearchFilters, page: number = 1): Promise<TMDBListResponse<TMDBSearchResultItem>> => {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  const endpoint = `/search/${filters.type === 'multi' ? 'multi' : filters.type}`;
  const params: Record<string, string | number | undefined> = { 
    query, 
    page,
    include_adult: 'false', // Explicitly exclude adult content
  };

  if (filters.type !== 'multi' && filters.year) {
    const yearKey = filters.type === 'movie' ? 'primary_release_year' : 'first_air_date_year';
    params[yearKey] = filters.year;
  }
  
  // Note: TMDB search endpoint does not directly support genre filtering.
  // Genre filtering is typically done on discover endpoints.
  // For search, we'd have to filter client-side or use /discover endpoint if query is empty.
  // This implementation will return all genre results for the search query.
  // If genreId is provided, we could filter results client-side after fetching.
  
  const response = await fetchTMDB<TMDBListResponse<TMDBSearchResultItem>>(endpoint, params);
  // Filter out people results if media_type is 'multi'
  if (filters.type === 'multi') {
    response.results = response.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  }
  
  // Client-side genre filtering if genreId is provided
  if (filters.genreId && filters.genreId !== "0") {
    response.results = response.results.filter(item => item.genre_ids?.includes(Number(filters.genreId)));
  }

  return response;
};

export const getGenres = async (type: 'movie' | 'tv'): Promise<Genre[]> => {
  const response = await fetchTMDB<TMDBGenresResponse>(`/genre/${type}/list`);
  return response.genres;
};

export const getTrending = async (mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<TMDBListResponse<TMDBSearchResultItem>> => {
  const response = await fetchTMDB<TMDBListResponse<TMDBSearchResultItem>>(`/trending/${mediaType}/${timeWindow}`);
   // Filter out people results if media_type is 'all'
  if (mediaType === 'all') {
    response.results = response.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  }
  return response;
}
    