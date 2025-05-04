// src/hooks/useAuth.js
//
// Custom hook to access auth functionality throughout the app
// This provides a simple interface to authentication methods and state

import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

/**
 * Custom hook to use the auth context
 * @returns The auth context value with user data and auth methods
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth;