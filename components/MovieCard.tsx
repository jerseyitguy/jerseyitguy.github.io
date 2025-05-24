
import React from 'react';
import { SuggestedItem, UserVote } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import StarRating from './StarRating';
import { TMDB_IMAGE_BASE_URL, PRIMARY_COLOR_BG, PRIMARY_COLOR_TEXT, BG_DARK_SECONDARY, BORDER_DARK_PRIMARY, TEXT_LIGHT_SECONDARY } from '../constants';

interface MovieCardProps {
  item: SuggestedItem;
}

const UpArrowIcon: React.FC<{ className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M10 3.03L6.78 6.25a.75.75 0 01-1.06-1.06l4-4a.75.75 0 011.06 0l4 4a.75.75 0 11-1.06 1.06L10 3.03z" clipRule="evenodd" />
  </svg>
);

const DownArrowIcon: React.FC<{ className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.75a.75.75 0 011.5 0v10.5A.75.75 0 0110 17z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M10 16.97l3.22-3.22a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 011.06-1.06L10 16.97z" clipRule="evenodd" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75H4.5a.75.75 0 000 1.5h11a.75.75 0 000-1.5H14A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.533.446 1.913 1.107A.75.75 0 0012.5 5.75H7.5a.75.75 0 00.587-.643A2.001 2.001 0 0110 4z" clipRule="evenodd" />
    <path d="M3 6.75A.75.75 0 013.75 6h12.5a.75.75 0 01.75.75v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15.75v-9zM8.25 8.5a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zm3.5 0a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6z" clipRule="evenodd" />
  </svg>
);


const MovieCard: React.FC<MovieCardProps> = ({ item }) => {
  const { state, voteOnSuggestion, rateSuggestion, removeSuggestion } = useAppContext();
  const { currentUser } = state;

  const title = item.title || item.name;
  const year = item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4);

  const currentUserVote = item.userVotes.find(v => v.userId === currentUser?.id);
  const currentUserRating = item.userRatings.find(r => r.userId === currentUser?.id)?.rating || 0;

  const netVotes = item.userVotes.reduce((acc, vote) => acc + (vote.voteType === 'up' ? 1 : -1), 0);
  const averageRating = item.userRatings.length > 0
    ? item.userRatings.reduce((acc, r) => acc + r.rating, 0) / item.userRatings.length
    : 0;

  const handleVote = (voteType: 'up' | 'down') => {
    if (currentUser) {
      voteOnSuggestion(item.id, voteType);
    }
  };

  const handleRate = (rating: number) => {
    if (currentUser) {
      rateSuggestion(item.id, rating);
    }
  };

  const handleRemove = () => {
    if (currentUser && (currentUser.id === item.suggesterId /*|| currentUserIsAdminLogic */)) {
      if (window.confirm(`Are you sure you want to remove "${title}" from suggestions?`)) {
        removeSuggestion(item.id);
      }
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row ${BG_DARK_SECONDARY} rounded-lg shadow-xl overflow-hidden transition-all duration-300 hover:shadow-yellow-400/20 border ${BORDER_DARK_PRIMARY} hover:border-yellow-400/50`}>
      <img
        src={item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : `https://picsum.photos/200/300?grayscale&random=${item.id}`}
        alt={title}
        className="w-full sm:w-1/3 lg:w-1/4 h-auto sm:h-full object-cover " /* Adjusted for aspect ratio */
      />
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-1">
              {title} {year && `(${year})`}
            </h3>
            {currentUser && currentUser.id === item.suggesterId && (
              <button onClick={handleRemove} title="Remove suggestion" className="text-gray-500 hover:text-red-400 transition-colors">
                <TrashIcon />
              </button>
            )}
          </div>
          <span className={`text-xs font-medium uppercase px-2 py-0.5 rounded-full ${item.media_type === 'movie' ? 'bg-blue-500 text-blue-100' : 'bg-green-500 text-green-100'} mb-2 inline-block`}>
            {item.media_type}
          </span>
          <p className={`text-sm ${TEXT_LIGHT_SECONDARY} mb-3 line-clamp-3`}>{item.overview}</p>
          <p className="text-xs text-gray-500 mb-3">
            Suggested by: <span className="font-semibold text-yellow-500">{item.suggesterUsername}</span>
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 mb-4">
            {/* Votes */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote('up')}
                disabled={!currentUser}
                title="Upvote"
                className={`p-1.5 rounded-full transition-colors duration-200 ${
                  currentUserVote?.voteType === 'up' ? 'bg-green-500 text-white' : `bg-gray-700 hover:bg-green-600 ${TEXT_LIGHT_SECONDARY}`
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <UpArrowIcon />
              </button>
              <span className={`text-lg font-semibold w-6 text-center ${netVotes > 0 ? 'text-green-400' : netVotes < 0 ? 'text-red-400' : TEXT_LIGHT_SECONDARY}`}>
                {netVotes}
              </span>
              <button
                onClick={() => handleVote('down')}
                disabled={!currentUser}
                title="Downvote"
                className={`p-1.5 rounded-full transition-colors duration-200 ${
                  currentUserVote?.voteType === 'down' ? 'bg-red-500 text-white' : `bg-gray-700 hover:bg-red-600 ${TEXT_LIGHT_SECONDARY}`
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <DownArrowIcon />
              </button>
            </div>

            {/* TMDB Rating */}
            <div className="text-sm">
              <span className="font-semibold text-yellow-400">TMDB:</span> {item.vote_average.toFixed(1)}/10 ({item.vote_count} votes)
            </div>
          </div>
          
          {/* User Rating */}
          {currentUser && (
            <div className="mb-2">
              <p className={`text-sm mb-1 ${TEXT_LIGHT_SECONDARY}`}>Your Rating:</p>
              <StarRating currentRating={currentUserRating} onRate={handleRate} />
            </div>
          )}

          {/* Average User Rating */}
          <div className="text-sm">
            <span className="font-semibold text-yellow-400">Avg. Group Rating:</span> {averageRating > 0 ? averageRating.toFixed(1) + '/5' : 'Not rated yet'}
            {item.userRatings.length > 0 && <span className="text-xs text-gray-500"> ({item.userRatings.length} ratings)</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
    