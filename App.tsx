
import React from 'react';
import { useAppContext } from './hooks/useAppContext';
import UserLogin from './components/UserLogin';
import SuggestionsDashboard from './components/SuggestionsDashboard';
import Header from './components/Header';

const App: React.FC = () => {
  // Fix: Access currentUser from state object
  const { state } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center selection:bg-yellow-400 selection:text-gray-900">
      <Header />
      <main className="w-full max-w-5xl p-4 mt-16"> {/* Added mt-16 for fixed header */}
        {state.currentUser ? <SuggestionsDashboard /> : <UserLogin />}
      </main>
      <footer className="w-full text-center p-4 text-sm text-gray-500">
        PlexFlix &copy; {new Date().getFullYear()} - For demonstration purposes. Movie data by TMDB.
      </footer>
    </div>
  );
};

export default App;