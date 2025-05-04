// src/pages/BookmarksPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import AppLayout from '../components/layout/AppLayout';
import PostCard from '../components/ui/PostCard';
import Button from '../components/ui/FormComponents';

/**
 * BookmarksPage Component
 * 
 * Streamlined page to display user bookmarked posts with:
 * - Clean grid layout for posts
 * - Empty state for no bookmarks
 * - Loading states for better UX
 */
const BookmarksPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch bookmarked posts
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch bookmarks with post details
        const { data, error } = await supabase
          .from('bookmarks')
          .select(`
            id,
            created_at,
            post_id,
            posts:post_id (
              id,
              caption,
              image_url,
              created_at,
              location,
              user_id,
              profiles:user_id (
                username,
                full_name,
                avatar_url,
                university
              ),
              likes_count,
              comments_count
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Format bookmarks data
        const formattedBookmarks = (data || [])
          .filter(bookmark => bookmark.posts) // Filter out any null posts (deleted posts)
          .map(bookmark => ({
            id: bookmark.posts.id,
            author: {
              name: bookmark.posts.profiles.full_name,
              username: bookmark.posts.profiles.username,
              avatar: bookmark.posts.profiles.avatar_url,
              university: bookmark.posts.profiles.university
            },
            content: bookmark.posts.caption,
            images: bookmark.posts.image_url ? [bookmark.posts.image_url] : [],
            likes: bookmark.posts.likes_count,
            comments: bookmark.posts.comments_count,
            timestamp: bookmark.posts.created_at,
            location: bookmark.posts.location,
            bookmarked: true,
            bookmarkId: bookmark.id
          }));
        
        setBookmarks(formattedBookmarks);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookmarks();
  }, [user]);
  
  // Handle bookmark removal
  const handleRemoveBookmark = async (postId, bookmarkId) => {
    try {
      // Optimistically update UI
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== postId));
      
      // Remove bookmark from database
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      // Fetch bookmarks again in case of error
      // This is a simple way to ensure data consistency
      fetchBookmarks();
    }
  };
  
  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No saved posts yet</h3>
      <p className="text-white/60 max-w-md mb-6">
        When you bookmark posts, they'll appear here so you can easily find them later.
      </p>
      
      <Button 
        variant="primary"
        onClick={() => navigate('/explore')}
      >
        Explore Content
      </Button>
    </div>
  );

  return (
    <AppLayout title="Saved Posts">
      <div className="max-w-6xl mx-auto">
        {/* Header with bookmark count */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Saved Posts</h1>
          <p className="text-white/60">
            {loading ? 'Loading your saved posts...' : 
             bookmarks.length === 0 ? 'You haven\'t saved any posts yet' :
             `${bookmarks.length} post${bookmarks.length === 1 ? '' : 's'} saved`}
          </p>
        </div>
        
        {/* Content grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            // Loading skeletons
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-white/5 animate-pulse"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : bookmarks.length === 0 ? (
            // Empty state
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState />
            </motion.div>
          ) : (
            // Bookmarks grid
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {bookmarks.map(post => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <PostCard
                    post={post}
                    variant="compact"
                    onRemoveBookmark={() => handleRemoveBookmark(post.id, post.bookmarkId)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default BookmarksPage;