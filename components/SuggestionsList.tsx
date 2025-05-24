
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import MovieCard from './MovieCard';
import { SuggestedItem, SortOption } from '../types';
import { BG_DARK_TERTIARY, BORDER_DARK_PRIMARY, TEXT_LIGHT_SECONDARY, PRIMARY_COLOR_FOCUS_RING } from '../constants';


const SortIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path d="M2.5 3A1.5 1.5 0 001 4.5V5a.75.75 0 001.5 0V4.5A.5.5 0 013 4h2.5a.75.75 0 000-1.5H3a.5.5 0 01-.5-.5zM2.5 7A1.5 1.5 0 001 8.5V9a.75.75 0 001.5 0V8.5A.5.5 0 013 8h5.5a.75.75 0 000-1.5H3a.5.5 0 01-.5-.5zM2.5 11A1.5 1.5 0 001 12.5V13a.75.75 0 001.5 0v-.5a.5.5 0 01.5-.5h8.5a.75.75 0 000-1.5H3a.5.5 0 01-.5-.5zM2.5 15A1.5 1.5 0 001 16.5V17a.75.75 0 001.5 0v-.5a.5.5 0 01.5-.5h11.5a.75.75 0 000-1.5H3a.5.5 0 01-.5-.5z" />
  </svg>
);


const SuggestionsList: React.FC = () => {
  const { state } = useAppContext();
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.NEWEST_ADDED);

  const sortedSuggestions = useMemo(() => {
    let sorted = [...state.suggestions];
    switch (sortOption) {
      case SortOption.MOST_UPVOTES:
        sorted.sort((a, b) => {
          const votesA = a.userVotes.reduce((acc, v) => acc + (v.voteType === 'up' ? 1 : -1), 0);
          const votesB = b.userVotes.reduce((acc, v) => acc + (v.voteType === 'up' ? 1 : -1), 0);
          return votesB - votesA;
        });
        break;
      case SortOption.HIGHEST_RATED:
        sorted.sort((a, b) => {
          const avgRatingA = a.userRatings.length > 0 ? a.userRatings.reduce((acc, r) => acc + r.rating, 0) / a.userRatings.length : 0;
          const avgRatingB = b.userRatings.length > 0 ? b.userRatings.reduce((acc, r) => acc + r.rating, 0) / b.userRatings.length : 0;
          return avgRatingB - avgRatingA;
        });
        break;
      case SortOption.NEWEST_ADDED:
        sorted.sort((a,b) => b.addedAt - a.addedAt);
        break;
      case SortOption.OLDEST_ADDED:
        sorted.sort((a,b) => a.addedAt - b.addedAt);
        break;
    }
    return sorted;
  }, [state.suggestions, sortOption]);

  if (!state.currentUser) { // Should not happen if SuggestionsDashboard is shown, but as a safeguard
    return <p className="text-center text-gray-400">Please log in to see suggestions.</p>;
  }
  
  if (state.suggestions.length === 0) {
    return <p className="text-center text-gray-400 py-8">No suggestions yet. Be the first to add one!</p>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-yellow-400 mb-4 sm:mb-0">Group Suggestions ({sortedSuggestions.length})</h2>
        <div className="flex items-center space-x-2">
          <SortIcon className="text-gray-400" />
          <label htmlFor="sort" className={`text-sm font-medium ${TEXT_LIGHT_SECONDARY}`}>Sort by:</label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className={`p-2 rounded-md ${BG_DARK_TERTIARY} ${BORDER_DARK_PRIMARY} border ${PRIMARY_COLOR_FOCUS_RING} focus:border-yellow-400 outline-none text-sm`}
          >
            <option value={SortOption.NEWEST_ADDED}>Newest Added</option>
            <option value={SortOption.OLDEST_ADDED}>Oldest Added</option>
            <option value={SortOption.MOST_UPVOTES}>Most Upvotes</option>
            <option value={SortOption.HIGHEST_RATED}>Highest Rated</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {sortedSuggestions.map((item: SuggestedItem) => (
          <MovieCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default SuggestionsList;
    