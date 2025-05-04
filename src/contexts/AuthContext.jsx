// src/contexts/AuthContext.jsx
//
// Enhanced Auth Context using the unified services approach
// This provides authentication state and functions to components

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService, dataService } from '../services';
import followService from '../services/followService';

// Default auth context state
const defaultContextValue = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  isVerified: false,
  authError: null,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => ({}),
  resetPassword: async () => ({}),
  forgotPassword: async () => ({}),
  updateProfile: async () => ({}),
  refreshSession: async () => ({}),
  resendVerificationEmail: async () => ({})
};

// Create context
const AuthContext = createContext(defaultContextValue);

/**
 * AuthProvider component
 * Uses our new consolidated authService
 */
export const AuthProvider = ({ children }) => {
  // Navigation
  const navigate = useNavigate();
  const location = useLocation();

  // Core state
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [lastOperationTime, setLastOperationTime] = useState(0);

  // Debug flag - set to true to enable verbose debugging
  const debug = process.env.NODE_ENV === 'development';
  
  // Debug logger
  const logDebug = (message, data) => {
    if (debug) {
      if (data) {
        console.log(`🔒 AuthContext: ${message}`, data);
      } else {
        console.log(`🔒 AuthContext: ${message}`);
      }
    }
  };

  // Fetch or create user profile - using dataService
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null;
    
    try {
      logDebug(`Fetching profile for user: ${userId}`);
      
      // Get profile from dataService
      return await dataService.getUserProfile(userId);
    } catch (error) {
      // If profile doesn't exist, create one
      if (error.message && error.message.includes('not found')) {
        logDebug('Profile not found, creating one');
        return await createProfile(userId);
      }
      
      console.error('Error fetching profile:', error);
      setAuthError(`Profile error: ${error.message}`);
      return null;
    }
  }, [debug]);
  
  // Create a new profile - using dataService
  const createProfile = async (userId) => {
    try {
      logDebug(`Creating profile for user: ${userId}`);
      
      // Get the user data from auth service
      const currentUser = user;
      
      if (!currentUser) {
        throw new Error('No user found when creating profile');
      }
      
      // Create profile with dataService
      const profileData = {
        id: userId,
        username: `user${Math.floor(Math.random() * 1000000)}`,
        full_name: currentUser.user_metadata?.full_name || 'New User',
        university: currentUser.user_metadata?.university || 'Unknown University',
        avatar_url: currentUser.user_metadata?.avatar_url || null
      };
      
      return await dataService.upsertProfile(userId, profileData);
    } catch (error) {
      console.error('Error creating profile:', error);
      setAuthError(`Profile creation error: ${error.message}`);
      return null;
    }
  };
  
  // Set up observer for auth state changes from our new authService
  useEffect(() => {
    let isMounted = true;
    
    logDebug('Setting up auth service subscription');
    
    // Subscribe to auth state changes 
    const unsubscribe = authService.subscribe(async ({ user: authUser, isAuthenticated, loading }) => {
      if (!isMounted) return;
      
      logDebug('Auth state changed', { 
        isAuthenticated, 
        userEmail: authUser?.email, 
        loading
      });
      
      setUser(authUser);
      setIsLoading(loading);
      
      // If user is authenticated, fetch their profile
      if (authUser && isAuthenticated) {
        // Determine if we need to handle navigation
        const currentTime = Date.now();
        const timeSinceLastOperation = currentTime - lastOperationTime;
        const isRecentOperation = timeSinceLastOperation < 2000; // Within 2 seconds
        
        logDebug('Auth state is authenticated', { 
          timeSinceLastOperation,
          isRecentOperation,
          currentLocation: location.pathname
        });

        // Handle navigation for routes that require authentication status
        if (!isRecentOperation) {
          // Handle verified users
          if (authUser.email_confirmed_at) {
            logDebug('User is verified');
            
            // If on an auth page, redirect to home
            if (['/login', '/signup', '/', '/verify-email'].includes(location.pathname)) {
              logDebug('Redirecting to home from protected auth page');
              navigate('/home', { replace: true });
            }
          } 
          // Handle unverified users
          else if (authUser.confirmation_sent_at && location.pathname !== '/verify-email') {
            logDebug('User needs verification, redirecting to verification page');
            navigate('/verify-email', { replace: true });
          }
        }
        
        // Fetch user profile
        const userProfile = await fetchProfile(authUser.id);
        if (isMounted) {
          setProfile(userProfile);
        }
      } else if (!isAuthenticated && !loading) {
        setProfile(null);
        
        // Determine if we need to handle navigation
        const currentTime = Date.now();
        const timeSinceLastOperation = currentTime - lastOperationTime;
        const isRecentOperation = timeSinceLastOperation < 2000; // Within 2 seconds
        
        logDebug('Auth state is not authenticated', { 
          timeSinceLastOperation,
          isRecentOperation,
          currentLocation: location.pathname
        });

        // Only handle navigation if not a recent auth operation (prevents navigation loops)
        if (!isRecentOperation) {
          // Redirect from protected routes to login
          const protectedRoutes = ['/home', '/profile', '/settings'];
          const isProtectedRoute = protectedRoutes.some(route => 
            location.pathname === route || location.pathname.startsWith(`${route}/`)
          );
          
          if (isProtectedRoute) {
            logDebug('Redirecting from protected route to login');
            
            // Remember the current location to redirect back after login
            navigate('/login', { 
              replace: true,
              state: { from: location.pathname }
            });
          }
        }
      }
    });
    
    // Cleanup function
    return () => {
      logDebug('Cleaning up auth subscription');
      isMounted = false;
      unsubscribe();
    };
  }, [fetchProfile, navigate, location, lastOperationTime, debug]);
  
  // Sign in function - using authService
  const signIn = async (email, password) => {
    try {
      logDebug(`Signing in user: ${email}`);
      setIsLoading(true);
      setAuthError(null);
      setLastOperationTime(Date.now());
      
      return await authService.signIn(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError(`Sign in error: ${error.message}`);
      return { data: null, error };
    } finally {
      // Loading state will be updated by the auth observer
    }
  };
  
  // Sign up function - using authService
  const signUp = async (email, password, metadata = {}) => {
    try {
      logDebug(`Signing up user: ${email}`);
      setIsLoading(true);
      setAuthError(null);
      setLastOperationTime(Date.now());
      
      // Store the email for verification page
      localStorage.setItem('lastSignupEmail', email);
      
      return await authService.signUp(email, password, metadata);
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthError(`Sign up error: ${error.message}`);
      return { data: null, error };
    } finally {
      // Loading state will be updated by the auth observer
    }
  };
  
  // Sign out function - using authService
  const signOut = async () => {
    try {
      logDebug('Signing out user');
      setIsLoading(true);
      setAuthError(null);
      setLastOperationTime(Date.now());
      
      // Clear any stored auth data
      localStorage.removeItem('lastSignupEmail');
      
      return await authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthError(`Sign out error: ${error.message}`);
      return { error };
    }
  };
  
  // Forgot password function - using authService
  const forgotPassword = async (email) => {
    try {
      logDebug(`Sending password reset email to: ${email}`);
      setIsLoading(true);
      setAuthError(null);
      setLastOperationTime(Date.now());
      
      return await authService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      setAuthError(`Forgot password error: ${error.message}`);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset password function - using authService
  const resetPassword = async (newPassword) => {
    try {
      logDebug('Resetting password');
      setIsLoading(true);
      setAuthError(null);
      setLastOperationTime(Date.now());
      
      return await authService.resetPassword(newPassword);
    } catch (error) {
      console.error('Reset password error:', error);
      setAuthError(`Reset password error: ${error.message}`);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resend verification email function - using authService
  const resendVerificationEmail = async (email) => {
    try {
      logDebug(`Resending verification email to: ${email}`);
      setIsLoading(true);
      setAuthError(null);
      
      return await authService.resendVerificationEmail(email);
    } catch (error) {
      console.error('Resend verification error:', error);
      setAuthError(`Resend verification error: ${error.message}`);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update profile function - using dataService
  const updateProfile = async (profileData) => {
    if (!user) {
      return { error: new Error('No authenticated user') };
    }
    
    try {
      logDebug('Updating user profile', profileData);
      setIsLoading(true);
      setAuthError(null);
      
      const data = await dataService.updateProfile(user.id, profileData);
      logDebug('Profile updated successfully', data);
      setProfile(data);
      
      return { data, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      setAuthError(`Profile update error: ${error.message}`);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Force a session refresh - using authService
  const refreshSession = async () => {
    try {
      logDebug('Manually refreshing session');
      setIsLoading(true);
      setAuthError(null);
      
      return await authService.refreshSession();
    } catch (error) {
      console.error('Session refresh error:', error);
      setAuthError(`Session refresh error: ${error.message}`);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  // The value provided to consuming components
  const value = {
    user,
    profile,
    isAuthenticated: !!user,
    isVerified: user ? !!user.email_confirmed_at : false,
    isLoading,
    authError,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    resendVerificationEmail,
    updateProfile,
    refreshSession
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;