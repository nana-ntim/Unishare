// src/services/auth.js
//
// Simplified authentication service that centralizes all auth functionality
// Implements an Observable pattern for auth state management

import { supabase } from '../lib/supabase';

class AuthService {
  constructor() {
    this.subscribers = [];
    this.user = null;
    this.session = null;
    this.isLoading = true;
    
    // Initialize auth state
    this.init();
  }

  /**
   * Initialize the auth service and fetch initial session
   */
  async init() {
    try {
      // Get initial session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      this.session = data.session || null;
      this.user = data.session?.user || null;
      
      // Set up auth state change listener
      this.setupAuthListener();
      
      this.isLoading = false;
      this.notifySubscribers();
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.isLoading = false;
      this.notifySubscribers();
    }
  }

  /**
   * Set up auth state change listener
   */
  setupAuthListener() {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        
        // Update auth state based on event
        this.session = session;
        this.user = session?.user || null;
        
        // Notify subscribers of state change
        this.notifySubscribers();
      }
    );
    
    // Save reference to unsubscribe function
    this.authUnsubscribe = subscription.unsubscribe;
  }

  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Function to call when auth state changes
   * @returns {Function} - Function to unsubscribe
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      console.error('Callback must be a function');
      return () => {};
    }
    
    this.subscribers.push(callback);
    
    // Immediately call with current state
    callback({
      user: this.user,
      session: this.session,
      isAuthenticated: !!this.user,
      loading: this.isLoading
    });
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all subscribers of the current auth state
   */
  notifySubscribers() {
    const state = {
      user: this.user,
      session: this.session,
      isAuthenticated: !!this.user,
      loading: this.isLoading
    };
    
    this.subscribers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  /**
   * Sign in with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Auth result
   */
  async signIn(email, password) {
    try {
      return await supabase.auth.signInWithPassword({
        email,
        password
      });
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  }

  /**
   * Sign up a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {Object} metadata - User metadata
   * @returns {Promise} - Auth result
   */
  async signUp(email, password, metadata = {}) {
    try {
      return await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise} - Sign out result
   */
  async signOut() {
    try {
      return await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }

  /**
   * Request password reset for an email
   * @param {string} email - User's email
   * @returns {Promise} - Reset result
   */
  async forgotPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`
      });
      
      return { success: !error, error };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error };
    }
  }

  /**
   * Update user's password
   * @param {string} newPassword - New password
   * @returns {Promise} - Update result
   */
  async resetPassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      return { success: !error, error };
    } catch (error) {
      console.error('Password update error:', error);
      return { success: false, error };
    }
  }

  /**
   * Resend verification email
   * @param {string} email - User's email
   * @returns {Promise} - Resend result
   */
  async resendVerificationEmail(email) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      return { success: !error, error };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, error };
    }
  }

  /**
   * Manually refresh the session
   * @returns {Promise} - Refresh result
   */
  async refreshSession() {
    try {
      this.isLoading = true;
      this.notifySubscribers();
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      this.session = data.session;
      this.user = data.user;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Session refresh error:', error);
      return { success: false, error };
    } finally {
      this.isLoading = false;
      this.notifySubscribers();
    }
  }

  /**
   * Clean up any listeners when service is destroyed
   */
  cleanup() {
    if (this.authUnsubscribe && typeof this.authUnsubscribe === 'function') {
      this.authUnsubscribe();
    }
    
    this.subscribers = [];
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;