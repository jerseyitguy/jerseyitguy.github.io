
import React from 'react';
import SearchBar from './SearchBar';
import SuggestionsList from './SuggestionsList';

const SuggestionsDashboard: React.FC = () => {
  return (
    <div className="w-full">
      <SearchBar />
      <SuggestionsList />
    </div>
  );
};

export default SuggestionsDashboard;
    