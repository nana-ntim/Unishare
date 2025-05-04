// src/components/ui/NotificationsBadge.jsx
//
// NotificationsBadge component for sidebar and navigation
// Shows accurate notification count from Supabase

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

/**
 * NotificationsBadge Component
 * 
 * A component that shows the current unread notification count:
 * - Pulls real notification data from Supabase
 * - Updates in real-time when new notifications arrive
 * - Optimized for performance with subscription
 * 
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 */
const NotificationsBadge = ({ className = '' }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      // Check if notifications table exists
      const { error: tableError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);
      
      // If table doesn't exist, return 0
      if (tableError && tableError.code === '42P01') {
        setUnreadCount(0);
        return;
      }
      
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('read', false);
        
      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    // Fetch initial count
    fetchUnreadCount();
    
    // Set up subscription for real-time updates
    let subscription;
    
    if (user) {
      // Subscribe to new notifications
      subscription = supabase
        .channel('notifications_badge')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          // Increment count if the notification is unread
          if (!payload.new.read) {
            setUnreadCount(prev => prev + 1);
          }
        })
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          // If notification was marked as read, decrement count
          if (payload.old.read === false && payload.new.read === true) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
          // If notification was marked as unread, increment count
          else if (payload.old.read === true && payload.new.read === false) {
            setUnreadCount(prev => prev + 1);
          }
        })
        .subscribe();
    }
    
    // Clean up subscription
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user, fetchUnreadCount]);
  
  // Don't render anything if there are no unread notifications
  if (unreadCount === 0) {
    return null;
  }
  
  return (
    <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-xs font-medium rounded-full bg-red-500 text-white ${className}`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};

export default NotificationsBadge;