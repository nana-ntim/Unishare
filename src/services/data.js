// src/services/data.js
//
// Centralized data service for database operations
// Provides a consistent API for all data operations

import { supabase } from '../lib/supabase';

class DataService {
  /**
   * Fetch a user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Fetch a user profile by username
   * @param {string} username - Username
   * @returns {Promise<Object>} - User profile
   */
  async getUserProfileByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile by username:', error);
      throw error;
    }
  }

  /**
   * Update a user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Updated profile
   */
  async updateProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Create or update a user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} - Created/updated profile
   */
  async upsertProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting profile:', error);
      throw error;
    }
  }

  /**
   * Get posts for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Posts
   */
  async getUserPosts(userId, options = { limit: 10, offset: 0 }) {
    try {
      const { data, error } = await supabase
        .from('post_details')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(options.offset, options.offset + options.limit - 1);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  }

  /**
   * Get feed posts (from followed users and own posts)
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Feed posts
   */
  async getFeedPosts(userId, options = { limit: 10, offset: 0 }) {
    try {
      // Get users that the current user follows
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);
        
      if (followingError) throw followingError;
      
      // Extract IDs of followed users and include own ID
      const followedIds = followingData?.map(item => item.following_id) || [];
      followedIds.push(userId); // Include own posts
      
      // Query posts from these users
      const { data, error } = await supabase
        .from('post_details')
        .select('*')
        .in('user_id', followedIds)
        .order('created_at', { ascending: false })
        .range(options.offset, options.offset + options.limit - 1);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching feed posts:', error);
      throw error;
    }
  }

  /**
   * Get posts by university
   * @param {string} university - University name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Posts
   */
  async getUniversityPosts(university, options = { limit: 10, offset: 0 }) {
    try {
      const { data, error } = await supabase
        .from('post_details')
        .select('*')
        .eq('university', university)
        .order('created_at', { ascending: false })
        .range(options.offset, options.offset + options.limit - 1);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching university posts:', error);
      throw error;
    }
  }

  /**
   * Get trending posts
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Trending posts
   */
  async getTrendingPosts(options = { limit: 10, offset: 0 }) {
    try {
      const { data, error } = await supabase
        .from('post_details')
        .select('*')
        .order('likes_count', { ascending: false })
        .range(options.offset, options.offset + options.limit - 1);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      throw error;
    }
  }

  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @returns {Promise<Object>} - Created post
   */
  async createPost(postData) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * Get a single post by ID
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} - Post
   */
  async getPost(postId) {
    try {
      const { data, error } = await supabase
        .from('post_details')
        .select('*')
        .eq('id', postId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  /**
   * Like a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Like result
   */
  async likePost(postId, userId) {
    try {
      const { data, error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  /**
   * Unlike a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Unlike result
   */
  async unlikePost(postId, userId) {
    try {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
        
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  /**
   * Check if user has liked a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Whether user has liked post
   */
  async hasLikedPost(postId, userId) {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return !!data;
    } catch (error) {
      console.error('Error checking if post is liked:', error);
      throw error;
    }
  }

  /**
   * Get comments for a post
   * @param {string} postId - Post ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Comments
   */
  async getComments(postId, options = { limit: 20, offset: 0 }) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .range(options.offset, options.offset + options.limit - 1);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  /**
   * Add a comment to a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @param {string} content - Comment content
   * @returns {Promise<Object>} - Created comment
   */
  async addComment(postId, userId, content) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content,
          created_at: new Date().toISOString()
        })
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Get trending hashtags
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Trending hashtags
   */
  async getTrendingHashtags(options = { limit: 10, university: null }) {
    try {
      let query = supabase
        .from('trending_hashtags')
        .select('*')
        .order('post_count', { ascending: false })
        .limit(options.limit);
        
      // Filter by university if provided
      if (options.university) {
        query = query.eq('university', options.university);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      throw error;
    }
  }

  /**
   * Get posts by hashtag
   * @param {string} tagName - Hashtag name (without # symbol)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Posts
   */
  async getPostsByHashtag(tagName, options = { limit: 10, offset: 0 }) {
    try {
      // Get hashtag ID
      const { data: hashtagData, error: hashtagError } = await supabase
        .from('hashtags')
        .select('id')
        .eq('name', tagName)
        .single();
        
      if (hashtagError && hashtagError.code !== 'PGRST116') throw hashtagError;
      
      if (!hashtagData) return [];
      
      // Get posts with this hashtag
      const { data: taggedPostsData, error: taggedError } = await supabase
        .from('post_hashtags')
        .select('post_id')
        .eq('hashtag_id', hashtagData.id);
        
      if (taggedError) throw taggedError;
      
      if (!taggedPostsData || taggedPostsData.length === 0) return [];
      
      // Get post details
      const postIds = taggedPostsData.map(p => p.post_id);
      const { data, error } = await supabase
        .from('post_details')
        .select('*')
        .in('id', postIds)
        .order('created_at', { ascending: false })
        .range(options.offset, options.offset + options.limit - 1);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching posts by hashtag:', error);
      throw error;
    }
  }

  /**
   * Get user bookmarks
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Bookmarked posts
   */
  async getUserBookmarks(userId, options = { limit: 20, offset: 0 }) {
    try {
      const { data, error } = await supabase
        .from('user_bookmarked_posts')
        .select('*')
        .eq('user_id', userId)
        .order('bookmarked_at', { ascending: false })
        .range(options.offset, options.offset + options.limit - 1);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      throw error;
    }
  }

  /**
   * Bookmark a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Bookmark result
   */
  async bookmarkPost(postId, userId) {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString()
        })
        .select();
        
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error bookmarking post:', error);
      throw error;
    }
  }

  /**
   * Remove a bookmark
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Unbookmark result
   */
  async unbookmarkPost(postId, userId) {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
        
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }

  /**
   * Check if a post is bookmarked
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Whether post is bookmarked
   */
  async isPostBookmarked(postId, userId) {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking if post is bookmarked:', error);
      throw error;
    }
  }

  /**
   * Get user collections
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Collections
   */
  async getUserCollections(userId) {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Get bookmark count for each collection
      const collectionsWithCount = await Promise.all(
        (data || []).map(async (collection) => {
          const { count, error: countError } = await supabase
            .from('collection_bookmarks')
            .select('bookmark_id', { count: 'exact' })
            .eq('collection_id', collection.id);
            
          return {
            ...collection, 
            bookmark_count: countError ? 0 : count
          };
        })
      );
      
      return collectionsWithCount;
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  }

  /**
   * Create a collection
   * @param {string} userId - User ID
   * @param {string} name - Collection name
   * @returns {Promise<Object>} - Created collection
   */
  async createCollection(userId, name) {
    try {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: userId,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (error) throw error;
      return { ...data[0], bookmark_count: 0 };
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  /**
   * Follow a user
   * @param {string} followerId - Follower user ID (current user)
   * @param {string} followingId - User ID to follow
   * @returns {Promise<Object>} - Follow result
   */
  async followUser(followerId, followingId) {
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: followerId,
          following_id: followingId,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  /**
   * Unfollow a user
   * @param {string} followerId - Follower user ID (current user)
   * @param {string} followingId - User ID to unfollow
   * @returns {Promise<Object>} - Unfollow result
   */
  async unfollowUser(followerId, followingId) {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
        
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  /**
   * Check if a user is following another user
   * @param {string} followerId - Follower user ID (current user)
   * @param {string} followingId - User ID to check
   * @returns {Promise<boolean>} - Whether user is following
   */
  async isFollowing(followerId, followingId) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      throw error;
    }
  }

  /**
   * Get user's followers
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Followers
   */
  async getUserFollowers(userId, options = { limit: 10, offset: 0 }) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          created_at,
          follower:follower_id (
            id,
            username,
            full_name,
            avatar_url,
            university
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(options.offset, options.offset + options.limit - 1);
        
      if (error) throw error;
      return (data || []).map(item => ({
        ...item.follower,
        followed_at: item.created_at
      }));
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  }

  /**
   * Get users that a user is following
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Following users
   */
  async getUserFollowing(userId, options = { limit: 10, offset: 0 }) {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          created_at,
          following:following_id (
            id,
            username,
            full_name,
            avatar_url,
            university
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(options.offset, options.offset + options.limit - 1);
        
      if (error) throw error;
      return (data || []).map(item => ({
        ...item.following,
        followed_at: item.created_at
      }));
    } catch (error) {
      console.error('Error fetching following:', error);
      throw error;
    }
  }

  /**
   * Get user suggestions (people to follow)
   * @param {string} userId - Current user ID
   * @param {string} university - Optional university to filter by
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - User suggestions
   */
  async getUserSuggestions(userId, university = null, options = { limit: 5 }) {
    try {
      // Get users the current user is already following
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);
      
      // Extract IDs of followed users
      const followingIds = followingData ? followingData.map(item => item.following_id) : [];
      
      // Add current user's ID to exclude from suggestions
      followingIds.push(userId);
      
      // Build query
      let query = supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${followingIds.join(',')})`)
        .limit(options.limit);
      
      // Filter by university if provided
      if (university) {
        query = query.eq('university', university);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
      throw error;
    }
  }

  /**
   * Search for content
   * @param {string} query - Search query
   * @param {Array} types - Content types to search ('users', 'posts', 'hashtags')
   * @param {Object} options - Search options
   * @returns {Promise<Object>} - Search results
   */
  async search(query, types = ['users', 'posts', 'hashtags'], options = { limit: 5 }) {
    try {
      const results = {};
      const searchPromises = [];
      
      // Search for users
      if (types.includes('users')) {
        searchPromises.push(
          supabase
            .from('profiles')
            .select('*')
            .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,university.ilike.%${query}%`)
            .limit(options.limit)
            .then(({ data, error }) => {
              if (error) throw error;
              results.users = data || [];
            })
        );
      }
      
      // Search for posts
      if (types.includes('posts')) {
        searchPromises.push(
          supabase
            .from('post_details')
            .select('*')
            .ilike('caption', `%${query}%`)
            .limit(options.limit)
            .then(({ data, error }) => {
              if (error) throw error;
              results.posts = data || [];
            })
        );
      }
      
      // Search for hashtags
      if (types.includes('hashtags')) {
        searchPromises.push(
          supabase
            .from('hashtags')
            .select('*')
            .ilike('name', `%${query}%`)
            .limit(options.limit)
            .then(({ data, error }) => {
              if (error) throw error;
              results.hashtags = data || [];
            })
        );
      }
      
      // Wait for all search operations to complete
      await Promise.all(searchPromises);
      
      return results;
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Unread count
   */
  async getUnreadNotificationsCount(userId) {
    try {
      // Check if notifications table exists
      const { error: tableError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);
      
      // If table doesn't exist, return 0
      if (tableError && tableError.code === '42P01') {
        return 0;
      }
      
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('read', false);
        
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread notifications count:', error);
      return 0; // Default to 0 on error
    }
  }
}

// Create and export a singleton instance
const dataService = new DataService();
export default dataService;