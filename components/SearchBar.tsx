
import React, { useState, useEffect, useCallback } from 'react';
import { searchTMDB, getGenres, getTrending } from '../services/tmdbService';
import { TMDBSearchResultItem, Genre, SearchFilters } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { TMDB_IMAGE_BASE_URL, PRIMARY_COLOR_BG, PRIMARY_COLOR_FOCUS_RING, BG_DARK_TERTIARY, BORDER_DARK_PRIMARY, TEXT_LIGHT_SECONDARY } from '../constants';

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}

const SearchBar: React.FC = () => {
  const { addSuggestion, state: { suggestions: currentSuggestions, currentUser } } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBSearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({ type: 'multi', year: '', genreId: '' });
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [fetchedMovieGenres, fetchedTvGenres, trendingItems] = await Promise.all([
          getGenres('movie'),
          getGenres('tv'),
          getTrending('all', 'week')
        ]);
        setMovieGenres(fetchedMovieGenres);
        setTvGenres(fetchedTvGenres);
        // Set trending as initial results if query is empty
        if (!query.trim() && currentUser) { // only show trending if user logged in and no query
           setResults(trendingItems.results.slice(0, 10)); // Show top 10 trending
        }
      } catch (err) {
        setError('Failed to load genres or trending items.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // Re-fetch trending if user logs in/out and query is empty


  const performSearch = useCallback(async (currentQuery: string, currentFilters: SearchFilters) => {
    if (!currentQuery.trim()) {
      // If query is empty, show trending items or clear results
      try {
        setIsLoading(true);
        const trendingItems = await getTrending(currentFilters.type === 'multi' ? 'all' : currentFilters.type, 'week');
        let filteredTrending = trendingItems.results;
        if (currentFilters.genreId && currentFilters.genreId !== "0") {
          filteredTrending = filteredTrending.filter(item => item.genre_ids?.includes(Number(currentFilters.genreId)));
        }
        if (currentFilters.year) {
          const year = parseInt(currentFilters.year);
          filteredTrending = filteredTrending.filter(item => {
             const itemYear = item.release_date?.substring(0,4) || item.first_air_date?.substring(0,4);
             return itemYear ? parseInt(itemYear) === year : false;
          });
        }
        setResults(filteredTrending.slice(0,10));
      } catch (err) {
        setError("Failed to fetch trending items.");
      } finally {
        setIsLoading(false);
      }
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchTMDB(currentQuery, currentFilters);
      setResults(data.results.slice(0, 10)); // Show top 10 results
    } catch (err) {
      setError('Failed to fetch search results.');
      console.error(err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(performSearch, 500), [performSearch]);

  useEffect(() => {
    debouncedSearch(query, filters);
  }, [query, filters, debouncedSearch]);

  const handleAddSuggestion = (item: TMDBSearchResultItem) => {
    const success = addSuggestion(item);
    if (!success) {
      // Optionally notify user it's already added or user not logged in
      console.log("Item already suggested or user not logged in.");
    }
    setQuery(''); // Clear search query
    setResults([]); // Clear results dropdown
    setShowResultsDropdown(false); // Hide dropdown
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const relevantGenres = filters.type === 'movie' ? movieGenres : filters.type === 'tv' ? tvGenres : [...movieGenres, ...tvGenres].filter((g, i, self) => i === self.findIndex(s => s.id === g.id));

  return (
    <div className="mb-8 relative">
      <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Find Movies & TV Shows</h2>
      <div className={`p-4 rounded-lg shadow-md ${BG_DARK_TERTIARY}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResultsDropdown(true);
            }}
            onFocus={() => setShowResultsDropdown(true)}
            // onBlur={() => setTimeout(() => setShowResultsDropdown(false), 100)} // Delayed hide
            placeholder="Search for movies or TV shows..."
            className={`w-full p-3 rounded-md ${BG_DARK_TERTIARY} ${BORDER_DARK_PRIMARY} border ${PRIMARY_COLOR_FOCUS_RING} focus:border-yellow-400 outline-none transition-colors duration-200 sm:col-span-2 lg:col-span-4`}
          />
          
          <div>
            <label htmlFor="type" className={`block text-sm font-medium mb-1 ${TEXT_LIGHT_SECONDARY}`}>Type</label>
            <select id="type" name="type" value={filters.type} onChange={handleFilterChange} className={`w-full p-3 rounded-md ${BG_DARK_TERTIARY} ${BORDER_DARK_PRIMARY} border ${PRIMARY_COLOR_FOCUS_RING} focus:border-yellow-400 outline-none`}>
              <option value="multi">All</option>
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
            </select>
          </div>

          <div>
            <label htmlFor="genreId" className={`block text-sm font-medium mb-1 ${TEXT_LIGHT_SECONDARY}`}>Genre</label>
            <select id="genreId" name="genreId" value={filters.genreId} onChange={handleFilterChange} className={`w-full p-3 rounded-md ${BG_DARK_TERTIARY} ${BORDER_DARK_PRIMARY} border ${PRIMARY_COLOR_FOCUS_RING} focus:border-yellow-400 outline-none`}>
              <option value="">All Genres</option>
              {relevantGenres.map(genre => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="year" className={`block text-sm font-medium mb-1 ${TEXT_LIGHT_SECONDARY}`}>Year</label>
            <input type="number" id="year" name="year" value={filters.year} onChange={handleFilterChange} placeholder="e.g. 2023" className={`w-full p-3 rounded-md ${BG_DARK_TERTIARY} ${BORDER_DARK_PRIMARY} border ${PRIMARY_COLOR_FOCUS_RING} focus:border-yellow-400 outline-none`} />
          </div>
        </div>
      </div>

      {isLoading && <p className="mt-4 text-center text-yellow-400">Searching...</p>}
      {error && <p className="mt-4 text-center text-red-400">{error}</p>}

      {showResultsDropdown && results.length > 0 && (
         <div className={`absolute w-full mt-1 ${BG_DARK_TERTIARY} border ${BORDER_DARK_PRIMARY} rounded-md shadow-lg z-20 max-h-96 overflow-y-auto`}>
          <ul onClick={() => setTimeout(() => setShowResultsDropdown(false), 0)}> {/* Hide on click inside list but allow item click to register */}
            {results.map(item => {
              const isAlreadySuggested = currentSuggestions.some(s => s.id === item.id);
              const year = item.release_date?.substring(0,4) || item.first_air_date?.substring(0,4);
              return (
                <li key={item.id} className={`p-3 hover:bg-gray-600 cursor-pointer border-b ${BORDER_DARK_PRIMARY} last:border-b-0 flex items-center space-x-3`}>
                  <img 
                    src={item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : 'https://picsum.photos/50/75?grayscale'} 
                    alt={item.title || item.name || 'Poster'} 
                    className="w-10 h-15 object-cover rounded-sm"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold">{item.title || item.name}{year ? ` (${year})` : ''}</p>
                    <p className="text-xs text-gray-400 capitalize">{item.media_type}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddSuggestion(item); }}
                    disabled={isAlreadySuggested}
                    className={`ml-auto px-3 py-1 text-xs rounded-md font-semibold transition-colors duration-200 ${
                      isAlreadySuggested 
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                        : `${PRIMARY_COLOR_BG} text-gray-900 hover:bg-yellow-500`
                    }`}
                  >
                    {isAlreadySuggested ? 'Added' : 'Add'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
       {showResultsDropdown && !isLoading && query.length > 0 && results.length === 0 && (
        <div className={`absolute w-full mt-1 ${BG_DARK_TERTIARY} border ${BORDER_DARK_PRIMARY} rounded-md shadow-lg z-20 p-4 text-center text-gray-400`}>
            No results found for "{query}".
        </div>
      )}
    </div>
  );
};

export default SearchBar;

    