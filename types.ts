
export interface User {
  id: string; // username will serve as ID
  username: string;
}

export interface TMDBSearchResultItem {
  id: number;
  title?: string; // Movies have title
  name?: string; // TV shows have name
  overview: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv';
  release_date?: string; // For movies "YYYY-MM-DD"
  first_air_date?: string; // For TV "YYYY-MM-DD"
  vote_average: number; // TMDB rating (0-10)
  vote_count: number;
  genre_ids?: number[];
  popularity?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface UserRating {
  userId: string;
  rating: number; // 1-5
}

export interface UserVote {
  userId: string;
  voteType: 'up' | 'down';
}

export interface SuggestedItem extends TMDBSearchResultItem {
  suggesterId: string;
  suggesterUsername: string;
  userVotes: UserVote[];
  userRatings: UserRating[];
  addedAt: number; // Timestamp for sorting by date added
}

export interface SearchFilters {
  type: 'movie' | 'tv' | 'multi';
  year?: string; // Changed to string to match input type
  genreId?: string; // Changed to string to match select type
}

export enum SortOption {
  MOST_UPVOTES = 'most_upvotes',
  HIGHEST_RATED = 'highest_rated',
  NEWEST_ADDED = 'newest_added',
  OLDEST_ADDED = 'oldest_added'
}
    