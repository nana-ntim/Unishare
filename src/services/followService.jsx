// src/services/followService.js
import { supabase } from '../lib/supabase';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create a context for follow state
const FollowContext = createContext(null);

// Follow cache - Map userId -> Set of userIds they follow
const followCache = new Map();
// Subscription to real-time follow changes
let followSubscription = null;

/**
 * FollowProvider component to wrap your app
 * This provides follow state to all components
 */
export function FollowProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Initialize follow service when user ID changes
  useEffect(() => {
    const initializeFollowSystem = async (userId) => {
      if (!userId) return;

      // Clear existing subscription
      if (followSubscription) {
        supabase.removeChannel(followSubscription);
      }

      // Initialize cache for this user
      if (!followCache.has(userId)) {
        followCache.set(userId, new Set());
        
        // Fetch and cache current follow relationships
        try {
          const { data } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', userId);
            
          if (data && data.length > 0) {
            const userFollowing = followCache.get(userId) || new Set();
            data.forEach(item => userFollowing.add(item.following_id));
            followCache.set(userId, userFollowing);
          }
        } catch (error) {
          console.error('Error fetching follow data:', error);
        }
      }

      // Set up real-time subscription
      followSubscription = supabase
        .channel('follow_changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${userId}`
        }, (payload) => {
          const followingId = payload.new.following_id;
          // Add to cache
          const userFollowing = followCache.get(userId) || new Set();
          userFollowing.add(followingId);
          followCache.set(userId, userFollowing);
          
          // Force update in components
          document.dispatchEvent(new CustomEvent('follow-update', { 
            detail: { followerId: userId, followingId, isFollowing: true }
          }));
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${userId}`
        }, (payload) => {
          const followingId = payload.old.following_id;
          // Remove from cache
          const userFollowing = followCache.get(userId);
          if (userFollowing) {
            userFollowing.delete(followingId);
          }
          
          // Force update in components
          document.dispatchEvent(new CustomEvent('follow-update', { 
            detail: { followerId: userId, followingId, isFollowing: false }
          }));
        })
        .subscribe();

      setInitialized(true);
    };

    // Get current user from auth if available
    const getAuthUser = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      if (userId) {
        setCurrentUserId(userId);
        initializeFollowSystem(userId);
      } else {
        setInitialized(true); // Still mark as initialized even if no user
      }
    };

    getAuthUser();

    // Cleanup function
    return () => {
      if (followSubscription) {
        supabase.removeChannel(followSubscription);
      }
    };
  }, []);

  /**
   * Check if a user is following another user
   */
  const isFollowing = useCallback(async (followerId, followingId) => {
    if (!followerId || !followingId) return false;
    
    // Check cache first
    if (followCache.has(followerId)) {
      return followCache.get(followerId).has(followingId);
    }
    
    // If not in cache, query the database
    try {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();
        
      // Add to cache  
      const userFollowing = followCache.get(followerId) || new Set();
      if (data) {
        userFollowing.add(followingId);
      }
      followCache.set(followerId, userFollowing);
      
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }, []);

  /**
   * Follow a user
   */
  const followUser = useCallback(async (followingId) => {
    if (!currentUserId || !followingId || currentUserId === followingId) return false;
    
    try {
      // Optimistic update
      const userFollowing = followCache.get(currentUserId) || new Set();
      userFollowing.add(followingId);
      followCache.set(currentUserId, userFollowing);
      
      // Notify components
      document.dispatchEvent(new CustomEvent('follow-update', { 
        detail: { followerId: currentUserId, followingId, isFollowing: true }
      }));
      
      // Update database
      await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: followingId,
          created_at: new Date().toISOString()
        });
        
      return true;
    } catch (error) {
      // Revert optimistic update on error
      const userFollowing = followCache.get(currentUserId);
      if (userFollowing) {
        userFollowing.delete(followingId);
      }
      
      // Notify components of reversion
      document.dispatchEvent(new CustomEvent('follow-update', { 
        detail: { followerId: currentUserId, followingId, isFollowing: false }
      }));
      
      console.error('Error following user:', error);
      return false;
    }
  }, [currentUserId]);

  /**
   * Unfollow a user
   */
  const unfollowUser = useCallback(async (followingId) => {
    if (!currentUserId || !followingId) return false;
    
    try {
      // Optimistic update
      const userFollowing = followCache.get(currentUserId);
      if (userFollowing) {
        userFollowing.delete(followingId);
      }
      
      // Notify components
      document.dispatchEvent(new CustomEvent('follow-update', { 
        detail: { followerId: currentUserId, followingId, isFollowing: false }
      }));
      
      // Update database
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', followingId);
        
      return true;
    } catch (error) {
      // Revert optimistic update on error
      const userFollowing = followCache.get(currentUserId) || new Set();
      userFollowing.add(followingId);
      
      // Notify components of reversion
      document.dispatchEvent(new CustomEvent('follow-update', { 
        detail: { followerId: currentUserId, followingId, isFollowing: true }
      }));
      
      console.error('Error unfollowing user:', error);
      return false;
    }
  }, [currentUserId]);

  /**
   * Toggle follow state
   */
  const toggleFollow = useCallback(async (followingId) => {
    if (!currentUserId || !followingId) return;
    
    const isCurrentlyFollowing = await isFollowing(currentUserId, followingId);
    
    if (isCurrentlyFollowing) {
      return unfollowUser(followingId);
    } else {
      return followUser(followingId);
    }
  }, [currentUserId, isFollowing, followUser, unfollowUser]);

  // Create context value
  const contextValue = {
    isFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    initialized,
    currentUserId
  };

  return (
    <FollowContext.Provider value={contextValue}>
      {children}
    </FollowContext.Provider>
  );
}

// Custom hook to use follow functionality
export function useFollow() {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
}

// Hook to check if current user is following a specific user
export function useFollowStatus(userId) {
  const { isFollowing, currentUserId } = useFollow();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const checkFollowStatus = async () => {
      if (!currentUserId || !userId) {
        setLoading(false);
        return;
      }
      
      const status = await isFollowing(currentUserId, userId);
      if (isMounted) {
        setFollowing(status);
        setLoading(false);
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

  return { following, loading };
}

// Also export a version of the old followService API for backwards compatibility
const followService = {
  initializeFollowSystem: async function(userId) {
    // This is a no-op now as initialization happens in the provider
    console.warn('initializeFollowSystem is deprecated. Use <FollowProvider> instead.');
    return true;
  },
  
  refreshFollowCache: async function(userId) {
    console.warn('refreshFollowCache is deprecated. Follow state is managed automatically.');
    // Just return the cached data or fetch it
    if (!userId) return [];
    
    if (followCache.has(userId)) {
      return Array.from(followCache.get(userId));
    }
    
    try {
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);
        
      const followingIds = data?.map(f => f.following_id) || [];
      followCache.set(userId, new Set(followingIds));
      return followingIds;
    } catch (error) {
      console.error('Error fetching follows:', error);
      return [];
    }
  },
  
  isFollowing: async function(followerId, followingId) {
    if (!followerId || !followingId) return false;
    
    // Reuse the implementation from the hook
    return await isFollowing(followerId, followingId);
  },
  
  followUser: async function(followerId, followingId) {
    console.warn('followService.followUser is deprecated. Use useFollow().followUser instead.');
    if (!followerId || !followingId) return false;
    
    try {
      // Add to cache
      const userFollowing = followCache.get(followerId) || new Set();
      userFollowing.add(followingId);
      followCache.set(followerId, userFollowing);
      
      // Update DB
      await supabase
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: followingId,
          created_at: new Date().toISOString()
        });
      
      // Trigger event
      document.dispatchEvent(new CustomEvent('follow-update', { 
        detail: { followerId, followingId, isFollowing: true }
      }));
      
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  },
  
  unfollowUser: async function(followerId, followingId) {
    console.warn('followService.unfollowUser is deprecated. Use useFollow().unfollowUser instead.');
    if (!followerId || !followingId) return false;
    
    try {
      // Remove from cache
      const userFollowing = followCache.get(followerId);
      if (userFollowing) {
        userFollowing.delete(followingId);
      }
      
      // Update DB
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      
      // Trigger event
      document.dispatchEvent(new CustomEvent('follow-update', { 
        detail: { followerId, followingId, isFollowing: false }
      }));
      
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  },
  
  toggleFollow: async function(followerId, followingId) {
    console.warn('followService.toggleFollow is deprecated. Use useFollow().toggleFollow instead.');
    if (!followerId || !followingId) return false;
    
    const isCurrentlyFollowing = await this.isFollowing(followerId, followingId);
    
    if (isCurrentlyFollowing) {
      return this.unfollowUser(followerId, followingId);
    } else {
      return this.followUser(followerId, followingId);
    }
  },
  
  subscribeToFollowStatus: function(targetUserId, callback) {
    console.warn('subscribeToFollowStatus is deprecated. Use useFollowStatus() hook instead.');
    if (!targetUserId || typeof callback !== 'function') {
      return () => {};
    }
    
    const handleFollowUpdate = (event) => {
      const { followingId, isFollowing } = event.detail;
      if (followingId === targetUserId) {
        callback(followerId, isFollowing);
      }
    };
    
    document.addEventListener('follow-update', handleFollowUpdate);
    
    return () => {
      document.removeEventListener('follow-update', handleFollowUpdate);
    };
  },
  
  cleanup: function() {
    console.warn('followService.cleanup is deprecated. Cleanup is managed automatically.');
    if (followSubscription) {
      supabase.removeChannel(followSubscription);
      followSubscription = null;
    }
  }
};

// Export default for backwards compatibility
export default followService;