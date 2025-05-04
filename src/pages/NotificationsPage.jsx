// src/pages/NotificationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import notificationService from '../services/notificationService';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/CardComponents';
import Button from '../components/ui/FormComponents';

/**
 * NotificationItem Component
 * 
 * Displays a single notification with appropriate styling
 */
const NotificationItem = ({ notification, onRead }) => {
  const navigate = useNavigate();
  const { type, created_at, data, read } = notification;
  
  // Format the timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSeconds < 60) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Recently';
    }
  };

  // Parse data with error handling
  const getParsedData = () => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data || {};
    } catch (error) {
      console.error('Error parsing notification data:', error);
      return {};
    }
  };
  
  const parsedData = getParsedData();

  // Get notification content based on type
  const getContent = () => {
    try {
      switch (type) {
        case 'like':
          return (
            <>
              <span className="font-medium">{parsedData.username || 'Someone'}</span> liked your post
            </>
          );
        case 'comment':
          return (
            <>
              <span className="font-medium">{parsedData.username || 'Someone'}</span> commented on your post
              {parsedData.content && (
                <span className="text-white/70 italic ml-1 line-clamp-1">
                  "{parsedData.content}"
                </span>
              )}
            </>
          );
        case 'follow':
          return (
            <>
              <span className="font-medium">{parsedData.username || 'Someone'}</span> started following you
            </>
          );
        case 'mention':
          return (
            <>
              <span className="font-medium">{parsedData.username || 'Someone'}</span> mentioned you
            </>
          );
        case 'system':
          return <>{parsedData.message || 'New notification'}</>;
        default:
          return <>{parsedData.message || 'New notification'}</>;
      }
    } catch (error) {
      console.error('Error generating notification content:', error);
      return 'New notification';
    }
  };
  
  // Get appropriate icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'like':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        );
      case 'mention':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-cyan-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </div>
        );
    }
  };
  
  // Handle notification click
  const handleClick = () => {
    if (!read) {
      onRead(notification.id);
    }
    
    try {
      // Navigate based on notification type
      switch (type) {
        case 'like':
        case 'comment':
          if (parsedData.post_id) {
            navigate(`/post/${parsedData.post_id}`);
          }
          break;
        case 'follow':
          if (parsedData.username) {
            navigate(`/profile/${parsedData.username}`);
          } else if (notification.actor_id) {
            navigate(`/profile/${notification.actor_id}`);
          }
          break;
        default:
          // Do nothing for other types
          break;
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
      className={`p-4 flex items-center gap-3 border-b border-white/10 cursor-pointer transition-colors ${
        read ? 'bg-transparent' : 'bg-gradient-to-r from-blue-500/5 to-transparent'
      }`}
      onClick={handleClick}
    >
      {/* Icon */}
      {getIcon()}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm">{getContent()}</p>
        <p className="text-xs text-white/50 mt-1">{formatTime(created_at)}</p>
      </div>
      
      {/* Unread indicator */}
      {!read && (
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
      )}
    </motion.div>
  );
};

/**
 * EmptyState Component
 */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
    <p className="text-white/60 max-w-md">
      You have no notifications at the moment. When you get notifications, they'll appear here.
    </p>
  </div>
);

/**
 * NotificationsPage Component
 */
const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!user) return;
    
    try {
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update in database using the service
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert if there's an error
      fetchNotifications();
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Update in database using the service
      await notificationService.markAllAsRead(user.id);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert if there's an error
      fetchNotifications();
    }
  };
  
  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const notificationChannel = supabase
      .channel('notifications-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, payload => {
        // Add new notification to the top of the list
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [fetchNotifications, user?.id]);
  
  // Check if there are unread notifications
  const hasUnread = notifications.some(notification => !notification.read);

  return (
    <AppLayout title="Notifications">
      <div className="max-w-3xl mx-auto">
        {/* Header section with Mark All as Read button */}
        {hasUnread && (
          <div className="flex justify-between items-center mb-4 px-4">
            <h2 className="text-lg font-medium text-white">Recent Notifications</h2>
            <Button 
              variant="secondary" 
              size="small"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          </div>
        )}
        
        {/* Notifications list */}
        <Card noPadding>
          {loading ? (
            // Loading state
            <div className="p-8">
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : notifications.length > 0 ? (
            // Notifications list
            <div className="divide-y divide-white/10">
              {notifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onRead={markAsRead}
                />
              ))}
            </div>
          ) : (
            // Empty state
            <EmptyState />
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;