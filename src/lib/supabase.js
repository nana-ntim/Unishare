// src/lib/supabase.js
//
// Supabase client setup with enhanced configuration
// This is a singleton instance to be used throughout the app

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Check your .env file.'
  );
}

// Set up persistent storage
const persistStorage = {
  getItem: (key) => {
    try {
      const itemValue = localStorage.getItem(key);
      // Return false if not found to avoid returning null
      return itemValue || false;
    } catch (error) {
      // In case localStorage is not available
      console.error('Error accessing localStorage:', error);
      return false;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }
};

// Enhanced Supabase client options
const clientOptions = {
  auth: {
    persistSession: true, // Enable session persistence
    storageKey: 'unishare-auth-token', // Custom storage key for better visibility
    autoRefreshToken: true, // Auto refresh token before expiry
    detectSessionInUrl: true, // Detect OAuth tokens in URL
    storage: persistStorage, // Custom storage implementation
    debug: process.env.NODE_ENV === 'development', // Debug mode in development
    flowType: 'pkce' // Use PKCE flow for better security (recommended by Supabase)
  },
  db: {
    schema: 'public' // Default schema
  },
  global: {
    headers: {
      'x-client-info': 'UniShare Web Client',
    },
  }
};

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, clientOptions);

// Export for usage throughout the app
export default supabase;