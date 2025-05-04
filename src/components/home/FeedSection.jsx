// src/components/home/FeedSection.jsx
//
// Premium FeedSection component for HomePage
// Renders posts with elegant layout and smooth transitions

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import PostCard from '../ui/PostCard';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { containerAnimations, itemAnimations } from '../../styles/animations';

/**
 * EmptyFeed Component
 * 
 * Elegant empty state for when no posts are available
 */
const EmptyFeed = ({ activeTab }) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <div className="p-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">No posts yet</h3>
        <p className="text-white/60 mb-6 max-w-md mx-auto">
          {activeTab === 'following' 
            ? "Start following other university students to see their posts in your feed"
            : activeTab === 'university'
              ? "No posts from your university yet. Be the first to share!"
              : "No posts available. Check back later for new content."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="primary"
            onClick={() => navigate('/explore')}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          >
            Explore Users
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => navigate('/create')}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Create Post
          </Button>
        </div>
      </div>
    </Card>
  );
};

/**
 * LoadingFeed Component
 * 
 * Elegant loading state for feed posts
 */
const LoadingFeed = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((item) => (
        <div key={`skeleton-${item}`} className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 p-5">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"></div>
            <div className="ml-3 space-y-2">
              <div className="h-3 w-24 bg-white/10 rounded animate-pulse"></div>
              <div className="h-2 w-16 bg-white/10 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-3 w-full bg-white/10 rounded animate-pulse mb-3"></div>
          <div className="h-3 w-4/5 bg-white/10 rounded animate-pulse mb-3"></div>
          <div className="h-48 w-full bg-white/10 rounded-lg animate-pulse mb-4"></div>
          <div className="flex justify-between">
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * FeedSection Component
 * 
 * Premium feed section for displaying posts:
 * - Clean, elegant post card design
 * - Smooth transitions between tabs
 * - Loading and empty states
 * 
 * @param {Object} props
 * @param {Array} props.posts - Array of post objects
 * @param {boolean} props.loading - Whether posts are loading
 * @param {string} props.activeTab - Current active tab
 * @param {Function} props.onInteraction - Optional callback for post interactions
 */
const FeedSection = ({
  posts = [],
  loading = false,
  activeTab = 'following',
  onInteraction
}) => {
  // Handle likes, comments, shares, bookmarks
  const handleInteraction = (postId, type) => {
    if (onInteraction) {
      onInteraction(postId, type);
    }
  };

  if (loading) {
    return <LoadingFeed />;
  }
  
  if (posts.length === 0) {
    return <EmptyFeed activeTab={activeTab} />;
  }

  return (
    <motion.div
      variants={containerAnimations}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <AnimatePresence>
        {posts.map((post) => (
          <motion.div 
            key={post.id}
            variants={itemAnimations}
            layout
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {posts.length > 0 && (
        <div className="flex justify-center pt-4 pb-8">
          <Button 
            variant="secondary"
            className="mx-auto"
          >
            Load More
          </Button>
        </div>
      )}
    </motion.div>
  );
};

// Optimize with memo
export default memo(FeedSection);