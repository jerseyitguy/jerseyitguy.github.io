
import React, { createContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { User, SuggestedItem, TMDBSearchResultItem, UserVote, UserRating } from '../types';
import { LOCAL_STORAGE_USERS_KEY, LOCAL_STORAGE_SUGGESTIONS_KEY, LOCAL_STORAGE_CURRENT_USER_KEY } from '../constants';

interface AppState {
  users: User[];
  suggestions: SuggestedItem[];
  currentUser: User | null;
}

type AppAction =
  | { type: 'ADD_USER'; payload: User }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'ADD_SUGGESTION'; payload: SuggestedItem }
  | { type: 'VOTE_SUGGESTION'; payload: { itemId: number; userId: string; voteType: 'up' | 'down' } }
  | { type: 'RATE_SUGGESTION'; payload: { itemId: number; userId: string; rating: number } }
  | { type: 'REMOVE_SUGGESTION'; payload: { itemId: number } }
  | { type: 'LOAD_STATE'; payload: AppState };

const initialState: AppState = {
  users: [],
  suggestions: [],
  currentUser: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;
    case 'ADD_USER':
      if (state.users.find(u => u.id === action.payload.id)) return state; // Already exists
      return { ...state, users: [...state.users, action.payload] };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_SUGGESTION':
      if (state.suggestions.find(s => s.id === action.payload.id)) return state; // Already suggested
      return { ...state, suggestions: [action.payload, ...state.suggestions] }; // Add to top
    case 'VOTE_SUGGESTION': {
      const { itemId, userId, voteType } = action.payload;
      return {
        ...state,
        suggestions: state.suggestions.map(item => {
          if (item.id === itemId) {
            const existingVoteIndex = item.userVotes.findIndex(v => v.userId === userId);
            let newUserVotes = [...item.userVotes];
            if (existingVoteIndex > -1) {
              // User is changing vote or removing vote
              if (newUserVotes[existingVoteIndex].voteType === voteType) { // Clicked same vote type again (remove vote)
                newUserVotes.splice(existingVoteIndex, 1);
              } else { // Switched vote
                newUserVotes[existingVoteIndex] = { userId, voteType };
              }
            } else { // New vote
              newUserVotes.push({ userId, voteType });
            }
            return { ...item, userVotes: newUserVotes };
          }
          return item;
        }),
      };
    }
    case 'RATE_SUGGESTION': {
      const { itemId, userId, rating } = action.payload;
      return {
        ...state,
        suggestions: state.suggestions.map(item => {
          if (item.id === itemId) {
            const existingRatingIndex = item.userRatings.findIndex(r => r.userId === userId);
            let newUserRatings = [...item.userRatings];
            if (existingRatingIndex > -1) {
              if (newUserRatings[existingRatingIndex].rating === rating) { // Clicked same rating (remove rating)
                 newUserRatings.splice(existingRatingIndex, 1);
              } else {
                newUserRatings[existingRatingIndex] = { userId, rating };
              }
            } else {
              newUserRatings.push({ userId, rating });
            }
            return { ...item, userRatings: newUserRatings };
          }
          return item;
        }),
      };
    }
    case 'REMOVE_SUGGESTION': {
        return {
            ...state,
            suggestions: state.suggestions.filter(item => item.id !== action.payload.itemId)
        };
    }
    default:
      return state;
  }
};

export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addUser: (username: string) => boolean;
  setCurrentUser: (username: string | null) => void;
  addSuggestion: (item: TMDBSearchResultItem) => boolean;
  voteOnSuggestion: (itemId: number, voteType: 'up' | 'down') => void;
  rateSuggestion: (itemId: number, rating: number) => void;
  removeSuggestion: (itemId: number) => void;
  logoutUser: () => void;
}>({
  state: initialState,
  dispatch: () => null,
  addUser: () => false,
  setCurrentUser: () => {},
  addSuggestion: () => false,
  voteOnSuggestion: () => {},
  rateSuggestion: () => {},
  removeSuggestion: () => {},
  logoutUser: () => {},
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      const storedSuggestions = localStorage.getItem(LOCAL_STORAGE_SUGGESTIONS_KEY);
      const storedCurrentUser = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
      
      const loadedState: AppState = {
        users: storedUsers ? JSON.parse(storedUsers) : [],
        suggestions: storedSuggestions ? JSON.parse(storedSuggestions) : [],
        currentUser: storedCurrentUser ? JSON.parse(storedCurrentUser) : null,
      };
      dispatch({ type: 'LOAD_STATE', payload: loadedState });
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
      // Initialize with default empty state if localStorage is corrupt or unavailable
      dispatch({ type: 'LOAD_STATE', payload: initialState });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(state.users));
    localStorage.setItem(LOCAL_STORAGE_SUGGESTIONS_KEY, JSON.stringify(state.suggestions));
    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(state.currentUser));
  }, [state.users, state.suggestions, state.currentUser]);

  const addUser = useCallback((username: string): boolean => {
    if (state.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return false; // User already exists
    }
    const newUser: User = { id: username, username };
    dispatch({ type: 'ADD_USER', payload: newUser });
    return true;
  }, [state.users]);

  const setCurrentUser = useCallback((username: string | null) => {
    if (username === null) {
      dispatch({ type: 'SET_CURRENT_USER', payload: null });
    } else {
      const user = state.users.find(u => u.username === username);
      if (user) {
        dispatch({ type: 'SET_CURRENT_USER', payload: user });
      }
    }
  }, [state.users]);

  const logoutUser = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
  }, []);

  const addSuggestion = useCallback((item: TMDBSearchResultItem): boolean => {
    if (!state.currentUser) return false;
    if (state.suggestions.find(s => s.id === item.id)) return false; // Already suggested
    
    const newSuggestion: SuggestedItem = {
      ...item,
      suggesterId: state.currentUser.id,
      suggesterUsername: state.currentUser.username,
      userVotes: [],
      userRatings: [],
      addedAt: Date.now(),
    };
    dispatch({ type: 'ADD_SUGGESTION', payload: newSuggestion });
    return true;
  }, [state.currentUser, state.suggestions]);

  const voteOnSuggestion = useCallback((itemId: number, voteType: 'up' | 'down') => {
    if (!state.currentUser) return;
    dispatch({ type: 'VOTE_SUGGESTION', payload: { itemId, userId: state.currentUser.id, voteType } });
  }, [state.currentUser]);

  const rateSuggestion = useCallback((itemId: number, rating: number) => {
    if (!state.currentUser) return;
    dispatch({ type: 'RATE_SUGGESTION', payload: { itemId, userId: state.currentUser.id, rating } });
  }, [state.currentUser]);
  
  const removeSuggestion = useCallback((itemId: number) => {
     if (!state.currentUser) return;
     // Optional: check if current user is suggester or admin
     dispatch({ type: 'REMOVE_SUGGESTION', payload: { itemId } });
  }, [state.currentUser]);

  return (
    <AppContext.Provider value={{ state, dispatch, addUser, setCurrentUser, addSuggestion, voteOnSuggestion, rateSuggestion, removeSuggestion, logoutUser }}>
      {children}
    </AppContext.Provider>
  );
};
    