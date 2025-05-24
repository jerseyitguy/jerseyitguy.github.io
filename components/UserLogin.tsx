
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { User } from '../types';
// Fix: Added BG_DARK_TERTIARY to imports
import { PRIMARY_COLOR_BG, PRIMARY_COLOR_FOCUS_RING, BG_DARK_SECONDARY, BG_DARK_TERTIARY, BORDER_DARK_PRIMARY, TEXT_LIGHT_SECONDARY, BG_DARK_PRIMARY } from '../constants';

const UserLogin: React.FC = () => {
  const { state, addUser, setCurrentUser } = useAppContext();
  const [usernameInput, setUsernameInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreateUser = () => {
    if (!usernameInput.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    if (usernameInput.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    const success = addUser(usernameInput.trim());
    if (success) {
      setCurrentUser(usernameInput.trim());
      setUsernameInput('');
      setError(null);
    } else {
      setError('Username already exists. Try logging in or choose a different name.');
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user.username);
    setError(null);
  };

  return (
    <div className={`p-6 sm:p-8 rounded-lg shadow-xl max-w-md mx-auto ${BG_DARK_SECONDARY}`}>
      <h2 className="text-3xl font-bold text-center mb-6 text-yellow-400">Welcome to PlexFlix</h2>
      
      {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4 text-sm">{error}</p>}

      <div className="mb-6">
        <label htmlFor="username" className={`block mb-2 text-sm font-medium ${TEXT_LIGHT_SECONDARY}`}>
          Create New User or Enter Existing Username
        </label>
        <input
          id="username"
          type="text"
          value={usernameInput}
          onChange={(e) => {
            setUsernameInput(e.target.value);
            if(error) setError(null);
          }}
          placeholder="Enter username (min 3 chars)"
          className={`w-full p-3 rounded-md ${BG_DARK_TERTIARY} ${BORDER_DARK_PRIMARY} border ${PRIMARY_COLOR_FOCUS_RING} focus:border-yellow-400 outline-none transition-colors duration-200`}
        />
      </div>
      <button
        onClick={handleCreateUser}
        className={`w-full ${PRIMARY_COLOR_BG} text-gray-900 font-semibold py-3 px-4 rounded-md hover:bg-yellow-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50`}
      >
        Create User & Login
      </button>

      {state.users.length > 0 && (
        <div className="mt-8">
          <h3 className={`text-lg font-semibold mb-3 ${TEXT_LIGHT_SECONDARY}`}>Or quick login as:</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {state.users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleLogin(user)}
                className={`w-full text-left p-3 rounded-md ${BG_DARK_TERTIARY} hover:bg-gray-600 transition-colors duration-200`}
              >
                {user.username}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLogin;