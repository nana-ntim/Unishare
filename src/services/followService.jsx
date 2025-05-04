// src/services/followService.jsx
import { supabase } from '../lib/supabase';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from './notificationService';

// Create a context for follow state
const FollowContext = createContext(null);

// Follow cache - Map userId -> Set of userIds they follow
const followCache = new Map();
// Subscription to real-time follow changes
let followSubscription = null;

/**
 * Debug logging for follow service
 */
const debug = (message, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[FollowService] ${message}`, data || '');
  }
};

/**
 * Centralized helper to update follow cache and notify components
 */
const updateFollowCache = (followerId, followingId, isFollowing) => {
  debug(`Updating follow cache: ${followerId} -> ${followingId} (${isFollowing ? 'follow' : 'unfollow'})`);
  
  if (!followCache.has(followerId)) {
    followCache.set(followerId, new Set());
  }
  
  const userFollowing = followCache.get(followerId);
  
  if (isFollowing) {
    userFollowing.add(followingId);
  } else {
    userFollowing.delete(followingId);
  }
  
  // Notify all components using the hook
  const event = new CustomEvent('follow-update', { 
    detail: { followerId, followingId, isFollowing }
  });
  document.dispatchEvent(event);
};

/**
 * FollowProvider component to wrap your app
 * This provides follow state to all components
 */
export function FollowProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Force a refresh of follow state
  const refreshFollowState = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Initialize follow service when user ID changes
  useEffect(() => {
    let isMounted = true;
    
    const initializeFollowSystem = async (userId) => {
      if (!userId) return;
      debug(`Initializing follow system for user ${userId}`);

      // Clear existing subscription
      if (followSubscription) {
        supabase.removeChannel(followSubscription);
      }

      // Always refresh cache on initialization
      if (!followCache.has(userId)) {
        followCache.set(userId, new Set());
      }
      
      // Fetch current username
      const { data: userData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
        
      if (userData?.username) {
        setCurrentUsername(userData.username);
      }
      
      // Fetch and cache current follow relationships
      try {
        const { data, error } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          debug(`Found ${data.length} following relationships`);
          const userFollowing = followCache.get(userId);
          data.forEach(item => userFollowing.add(item.following_id));
        } else {
          debug('No following relationships found');
        }
      } catch (error) {
        console.error('Error fetching follow data:', error);
      }

      // Set up real-time subscription
      followSubscription = supabase
        .channel('follow-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${userId}`
        }, (payload) => {
          debug('Real-time: New follow detected', payload);
          const followingId = payload.new.following_id;
          updateFollowCache(userId, followingId, true);
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${userId}`
        }, (payload) => {
          debug('Real-time: Unfollow detected', payload);
          const followingId = payload.old.following_id;
          updateFollowCache(userId, followingId, false);
        })
        .subscribe(status => {
          debug(`Subscription status: ${status}`);
          if (status === 'SUBSCRIBED' && isMounted) {
            setInitialized(true);
          }
        });

      if (isMounted) setInitialized(true);
    };

    // Get current user from auth if available
    const getAuthUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const userId = data?.session?.user?.id;
        if (userId) {
          debug(`Current user: ${userId}`);
          setCurrentUserId(userId);
          initializeFollowSystem(userId);
        } else {
          debug('No authenticated user found');
          setInitialized(true); // Still mark as initialized even if no user
        }
      } catch (error) {
        console.error('Error getting auth session:', error);
        setInitialized(true);
      }
    };

    getAuthUser();

    // Cleanup function
    return () => {
      isMounted = false;
      if (followSubscription) {
        supabase.removeChannel(followSubscription);
      }
    };
  }, [refreshTrigger]);

  /**
   * Check if a user is following another user
   */
  const isFollowing = useCallback(async (followerId, followingId) => {
    if (!followerId || !followingId) return false;
    
    debug(`Checking if ${followerId} is following ${followingId}`);
    
    // Check cache first
    if (followCache.has(followerId)) {
      const following = followCache.get(followerId).has(followingId);
      debug(`Cache result: ${following}`);
      return following;
    }
    
    // If not in cache, check database
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .maybeSingle();
        
      if (error) throw error;
      
      // Initialize cache if needed
      if (!followCache.has(followerId)) {
        followCache.set(followerId, new Set());
      }
      
      // Update cache with result
      const userFollowing = followCache.get(followerId);
      if (data) {
        userFollowing.add(followingId);
      }
      
      debug(`Database result: ${!!data}`);
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }, []);

  /**
   * Follow a user with notification
   */
  const followUser = useCallback(async (followingId) => {
    if (!currentUserId || !followingId || currentUserId === followingId) {
      debug(`Cannot follow: Invalid IDs (${currentUserId}, ${followingId})`);
      return { success: false, error: new Error('Invalid user IDs') };
    }
    
    debug(`Following user: ${followingId}`);
    
    try {
      // Optimistic update
      updateFollowCache(currentUserId, followingId, true);
      
      // Update database
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: followingId,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        // Revert optimistic update
        updateFollowCache(currentUserId, followingId, false);
        throw error;
      }
      
      // Create notification (as a fallback if trigger fails)
      await notificationService.createFollowNotification(
        followingId,
        currentUserId,
        currentUsername || 'User'
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error following user:', error);
      return { success: false, error };
    }
  }, [currentUserId, currentUsername]);

  /**
   * Unfollow a user
   */
  const unfollowUser = useCallback(async (followingId) => {
    if (!currentUserId || !followingId) {
      debug(`Cannot unfollow: Invalid IDs (${currentUserId}, ${followingId})`);
      return { success: false, error: new Error('Invalid user IDs') };
    }
    
    debug(`Unfollowing user: ${followingId}`);
    
    try {
      // Optimistic update
      updateFollowCache(currentUserId, followingId, false);
      
      // Update database
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', followingId);
      
      if (error) {
        // Revert optimistic update
        updateFollowCache(currentUserId, followingId, true);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return { success: false, error };
    }
  }, [currentUserId]);

  /**
   * Toggle follow state
   */
  const toggleFollow = useCallback(async (followingId) => {
    debug(`Toggling follow: ${followingId}`);
    const following = await isFollowing(currentUserId, followingId);
    
    if (following) {
      return unfollowUser(followingId);
    } else {
      return followUser(followingId);
    }
  }, [currentUserId, isFollowing, unfollowUser, followUser]);

  // Create context value
  const contextValue = {
    isFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    initialized,
    currentUserId,
    currentUsername,
    refreshFollowState
  };

  return (
    <FollowContext.Provider value={contextValue}>
      {children}
    </FollowContext.Provider>
  );
}

/**
 * Custom hook to use follow functionality
 */
export function useFollow() {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
}

/**
 * Hook to check if current user is following a specific user
 */
export function useFollowStatus(userId) {
  const { isFollowing, currentUserId, followUser, unfollowUser, currentUsername } = useFollow();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const checkFollowStatus = async () => {
      if (!currentUserId || !userId) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }
      
      try {
        const status = await isFollowing(currentUserId, userId);
        if (isMounted) {
          setFollowing(status);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkFollowStatus();
    
    // Listen for follow status changes
    const handleFollowUpdate = (event) => {
      const { followerId, followingId, isFollowing } = event.detail;
      if (followerId === currentUserId && followingId === userId) {
        setFollowing(isFollowing);
      }
    };
    
    document.addEventListener('follow-update', handleFollowUpdate);
    
    return () => {
      isMounted = false;
      document.removeEventListener('follow-update', handleFollowUpdate);
    };
  }, [currentUserId, userId, isFollowing]);

  // Handle follow action
  const handleFollow = async () => {
    if (following) {
      const result = await unfollowUser(userId);
      if (result.success) {
        setFollowing(false);
      }
      return result;
    } else {
      const result = await followUser(userId);
      if (result.success) {
        setFollowing(true);
        
        // Explicitly create a follow notification
        notificationService.createFollowNotification(
          userId,
          currentUserId,
          currentUsername || 'User'
        );
      }
      return result;
    }
  };

  // Return follow status and direct actions for this specific user
  return { 
    following, 
    loading,
    toggleFollow: handleFollow 
  };
}

// Legacy API for backward compatibility
export default {
  isFollowing: async (followerId, followingId) => {
    try {
      if (!followerId || !followingId) return false;
      
      // Check cache first
      if (followCache.has(followerId)) {
        return followCache.get(followerId).has(followingId);
      }
      
      // Otherwise check database
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .maybeSingle();
      
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },
  followUser: async (followerId, followingId) => {
    try {
      if (followerId === followingId) return false;
      
      // Update cache
      if (!followCache.has(followerId)) {
        followCache.set(followerId, new Set());
      }
      followCache.get(followerId).add(followingId);
      
      // Update database
      await supabase.from('follows').insert({
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString()
      });
      
      // Get username for notification
      const { data: userData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', followerId)
        .single();
        
      // Create notification
      await notificationService.createFollowNotification(
        followingId,
        followerId,
        userData?.username || 'User'
      );
      
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      // Revert cache on error
      if (followCache.has(followerId)) {
        followCache.get(followerId).delete(followingId);
      }
      return false;
    }
  },
  unfollowUser: async (followerId, followingId) => {
    try {
      // Update cache
      if (followCache.has(followerId)) {
        followCache.get(followerId).delete(followingId);
      }
      
      // Update database
      await supabase.from('follows').delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      // Revert cache on error
      if (followCache.has(followerId)) {
        followCache.get(followerId).add(followingId);
      }
      return false;
    }
  }
};