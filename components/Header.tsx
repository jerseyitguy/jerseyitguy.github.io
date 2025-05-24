
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
// Fix: Added PRIMARY_COLOR_BORDER to imports
import { PRIMARY_COLOR_BG, PRIMARY_COLOR_TEXT, BG_DARK_SECONDARY, PRIMARY_COLOR_BORDER } from '../constants';

const PlexFlixLogo: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className={PRIMARY_COLOR_TEXT}>
    <path d="M10 15.064V8.936L14.099 12L10 15.064zM5.333 2C4.045 2 3 3.045 3 4.333v15.334C3 20.955 4.045 22 5.333 22h13.334C19.955 22 21 20.955 21 19.667V4.333C21 3.045 19.955 2 18.667 2H5.333zm0 1.333h13.334c.008.001.219.014.313.101S19 3.757 19 4.333v15.334c0 .576-.042.885-.101.98s-.212.1-.313.1H5.333c-.008 0-.219-.014-.313-.101S5 20.243 5 19.667V4.333c0-.576.042-.885.101-.98s.212-.1.313-.1z"/>
  </svg>
);

const Header: React.FC = () => {
  const { state, logoutUser } = useAppContext();
  const { currentUser } = state;

  return (
    <header className={`fixed top-0 left-0 right-0 ${BG_DARK_SECONDARY} shadow-lg z-50 border-b ${PRIMARY_COLOR_BORDER} border-opacity-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <PlexFlixLogo />
            <h1 className="ml-3 text-2xl font-bold text-yellow-400">PlexFlix</h1>
          </div>
          {currentUser && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300 hidden sm:block">
                Hi, <span className="font-semibold text-yellow-400">{currentUser.username}</span>
              </span>
              <button
                onClick={logoutUser}
                className={`px-4 py-2 text-sm font-medium rounded-md ${PRIMARY_COLOR_BG} text-gray-900 hover:bg-yellow-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50`}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;