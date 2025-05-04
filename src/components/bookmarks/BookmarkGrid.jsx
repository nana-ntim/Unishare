// src/components/bookmarks/BookmarkGrid.jsx
//
// Premium BookmarkGrid component for displaying saved posts
// Features elegant masonry layout and animations

import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PostCard from '../ui/PostCard';
import Card from '../ui/Card';
import Button from '../ui/Button';

/**
 * BookmarkGrid Component
 * 
 * An elegant grid layout for displaying bookmarked posts:
 * - Masonry-style layout on larger screens
 * - Smooth animations for added/removed items
 * - Empty state with helpful guidance
 * 
 * @param {Object} props
 * @param {Array} props.bookmarks - Array of bookmark objects
 * @param {boolean} props.loading - Whether bookmarks are loading
 * @param {Function} props.onRemoveBookmark - Function to remove a bookmark
 */
const BookmarkGrid = ({
  bookmarks = [],
  loading = false,
  onRemoveBookmark
}) => {
  // Animation settings
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  // Format bookmark data for PostCard
  const formatBookmark = (bookmark) => ({
    id: bookmark.post_id,
    author: {
      name: bookmark.username || 'User',
      username: bookmark.username || 'username',
      avatar: bookmark.avatar_url || null
    },
    content: bookmark.caption || '',
    images: bookmark.image_url ? [bookmark.image_url] : [],
    timestamp: bookmark.post_created_at || bookmark.bookmarked_at,
    location: bookmark.location || null
  });

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={`skeleton-${i}`} className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 p-5 animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-full"></div>
              <div className="ml-3 space-y-1">
                <div className="h-2.5 w-24 bg-white/10 rounded"></div>
                <div className="h-2 w-16 bg-white/10 rounded"></div>
              </div>
            </div>
            <div className="h-3 w-full bg-white/10 rounded mb-3"></div>
            <div className="h-48 w-full bg-white/10 rounded-lg mb-4"></div>
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-white/10 rounded"></div>
              <div className="h-4 w-4 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Empty state
  if (bookmarks.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No bookmarks yet</h3>
          <p className="text-white/60 max-w-md mx-auto mb-6">
            Save posts you want to revisit later by clicking the bookmark icon on posts you find interesting.
          </p>
          
          <Link to="/explore">
            <Button 
              variant="primary"
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            >
              Explore Content
            </Button>
          </Link>
        </div>
      </Card>
    );
  }
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {bookmarks.map((bookmark) => (
        <div key={bookmark.bookmark_id} className="relative group">
          {/* Bookmark ribbon indicator */}
          <div className="absolute top-0 right-0 z-10 transform translate-x-2 -translate-y-1 transition-transform group-hover:scale-110">
            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M5 5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L12 17.5L5 21V5Z" 
                fill="#0ea5e9" 
                fillOpacity="0.9" 
              />
            </svg>
          </div>
          
          {/* Post card */}
          <PostCard post={formatBookmark(bookmark)} />
          
          {/* Remove bookmark button - appears on hover */}
          {onRemoveBookmark && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              whileHover={{ 
                opacity: 1, 
                scale: 1,
                transition: { duration: 0.2 }
              }}
              className="absolute top-12 right-3 bg-black/70 backdrop-blur-md rounded-full p-2 text-white/80 hover:text-white group-hover:opacity-100 opacity-0 transition-opacity"
              onClick={() => onRemoveBookmark(bookmark.bookmark_id)}
              aria-label="Remove bookmark"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          )}
        </div>
      ))}
    </motion.div>
  );
};

// Optimize with memo
export default memo(BookmarkGrid);