// src/services/notificationService.js
import { supabase } from '../lib/supabase';

/**
 * Service for handling notifications
 * This provides direct methods for creating notifications
 * in case the database triggers aren't working
 */
class NotificationService {
  /**
   * Create a like notification
   * @param {string} postId - ID of the post that was liked
   * @param {string} actorId - ID of the user who performed the like
   * @param {string} actorUsername - Username of the actor
   * @returns {Promise<boolean>} Success status
   */
  async createLikeNotification(postId, actorId, actorUsername) {
    try {
      // First get post owner
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();
      
      if (postError || !postData) {
        console.error('Error getting post owner:', postError);
        return false;
      }
      
      // Don't notify if liking your own post
      if (postData.user_id === actorId) {
        return false;
      }
      
      // Create notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: postData.user_id,
          actor_id: actorId,
          type: 'like',
          entity_type: 'post',
          entity_id: postId,
          data: JSON.stringify({
            username: actorUsername,
            post_id: postId
          }),
          read: false,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating like notification:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in createLikeNotification:', error);
      return false;
    }
  }

  /**
   * Create a comment notification
   * @param {string} postId - ID of the post that was commented on
   * @param {string} commentId - ID of the comment
   * @param {string} commentText - Content of the comment
   * @param {string} actorId - ID of the user who commented
   * @param {string} actorUsername - Username of the actor
   * @returns {Promise<boolean>} Success status
   */
  async createCommentNotification(postId, commentId, commentText, actorId, actorUsername) {
    try {
      // First get post owner
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();
      
      if (postError || !postData) {
        console.error('Error getting post owner:', postError);
        return false;
      }
      
      // Don't notify if commenting on your own post
      if (postData.user_id === actorId) {
        return false;
      }
      
      // Create notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: postData.user_id,
          actor_id: actorId,
          type: 'comment',
          entity_type: 'post',
          entity_id: postId,
          data: JSON.stringify({
            username: actorUsername,
            post_id: postId,
            comment_id: commentId,
            content: commentText?.substring(0, 100) || ''
          }),
          read: false,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating comment notification:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in createCommentNotification:', error);
      return false;
    }
  }

  /**
   * Create a follow notification
   * @param {string} targetUserId - ID of the user being followed
   * @param {string} actorId - ID of the user who is following
   * @param {string} actorUsername - Username of the follower
   * @returns {Promise<boolean>} Success status
   */
  async createFollowNotification(targetUserId, actorId, actorUsername) {
    try {
      // Don't notify for self-follows
      if (targetUserId === actorId) {
        return false;
      }
      
      // Create notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          actor_id: actorId,
          type: 'follow',
          entity_type: 'profile',
          entity_id: targetUserId,
          data: JSON.stringify({
            username: actorUsername
          }),
          read: false,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating follow notification:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in createFollowNotification:', error);
      return false;
    }
  }
  
  /**
   * Mark a notification as read
   * @param {string} notificationId - ID of the notification to mark as read
   * @returns {Promise<boolean>} Success status
   */
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }
  
  /**
   * Mark all notifications as read for a user
   * @param {string} userId - ID of the user
   * @returns {Promise<boolean>} Success status
   */
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return false;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;