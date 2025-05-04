// src/components/ui/NotificationIndicator.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

/**
 * NotificationIndicator Component
 * Shows a badge with the number of unread notifications
 */
const NotificationIndicator = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch unread notifications count on mount
  useEffect(() => {
    if (!user) return;

    // Function to fetch unread count
    const fetchUnreadCount = async () => {
      try {
        setLoading(true);
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);

        if (error) throw error;
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Set up real-time subscription for new notifications
    const notificationChannel = supabase
      .channel('notification-count')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        // Increment count when a new notification is received
        setUnreadCount(prev => prev + 1);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        // If a notification was marked as read, decrement the count
        if (payload.old.read === false && payload.new.read === true) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [user]);

  // Don't render anything if there are no unread notifications or still loading
  if (loading || unreadCount === 0) return null;

  return (
    <div className="absolute -top-1 -right-1 flex items-center justify-center">
      <div className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
        {unreadCount > 99 ? '99+' : unreadCount}
      </div>
    </div>
  );
};

export default NotificationIndicator;