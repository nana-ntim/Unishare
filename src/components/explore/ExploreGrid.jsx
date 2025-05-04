// src/components/explore/ExploreGrid.jsx
//
// Premium ExploreGrid component for content discovery
// Features elegant grid layout with consistent aesthetics

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PostCard from '../ui/PostCard';
import UserSuggestion from '../ui/UserSuggestion';
import Card from '../ui/Card';
import Button from '../ui/Button';

/**
 * ExploreGrid Component
 * 
 * An elegant grid layout for content discovery:
 * - Responsive layout with adaptive content
 * - Multiple content types (posts, users, hashtags)
 * - Smooth animations and transitions
 * 
 * @param {Object} props
 * @param {Array} props.posts - Array of post objects
 * @param {Array} props.users - Array of user objects
 * @param {string} props.contentType - Type of content to display (posts, users, mixed)
 * @param {boolean} props.loading - Whether content is loading
 * @param {Function} props.onFollowToggle - Function called when follow button is clicked
 */
const ExploreGrid = ({
  posts = [],
  users = [],
  contentType = 'posts',
  loading = false,
  onFollowToggle
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`skeleton-${index}`} className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 animate-pulse">
            <div className="h-48 bg-white/10"></div>
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                <div className="ml-3 space-y-1">
                  <div className="h-2.5 w-24 bg-white/10 rounded"></div>
                  <div className="h-2 w-16 bg-white/10 rounded"></div>
                </div>
              </div>
              <div className="h-2.5 w-full bg-white/10 rounded mb-2"></div>
              <div className="h-2.5 w-2/3 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Empty state
  if ((contentType === 'posts' && posts.length === 0) || 
      (contentType === 'users' && users.length === 0) ||
      (contentType === 'mixed' && posts.length === 0 && users.length === 0)) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No content found</h3>
          <p className="text-white/60 max-w-md mx-auto mb-6">
            {contentType === 'posts' 
              ? "We couldn't find any posts matching your search criteria." 
              : contentType === 'users'
                ? "No users found matching your search criteria."
                : "No content found. Try adjusting your filters or search terms."}
          </p>
          
          <Link to="/">
            <Button variant="primary">
              Return Home
            </Button>
          </Link>
        </div>
      </Card>
    );
  }
  
  // Posts grid
  if (contentType === 'posts') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {posts.map((post) => (
          <div key={post.id} className="h-full">
            <PostCard post={post} type="compact" />
          </div>
        ))}
      </motion.div>
    );
  }
  
  // Users grid
  if (contentType === 'users') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {users.map((user) => (
          <div key={user.id}>
            <UserSuggestion 
              user={user} 
              variant="profile"
              isFollowing={user.isFollowing}
              onFollow={onFollowToggle}
            />
          </div>
        ))}
      </motion.div>
    );
  }
  
  // Mixed content grid (default)
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {/* First show some users */}
      {users.slice(0, 2).map((user) => (
        <div key={`user-${user.id}`}>
          <UserSuggestion 
            user={user} 
            variant="profile"
            isFollowing={user.isFollowing}
            onFollow={onFollowToggle}
          />
        </div>
      ))}
      
      {/* Then show posts */}
      {posts.map((post) => (
        <div key={`post-${post.id}`} className="h-full">
          <PostCard post={post} type="compact" />
        </div>
      ))}
      
      {/* Show remaining users */}
      {users.slice(2).map((user) => (
        <div key={`user-${user.id}`}>
          <UserSuggestion 
            user={user} 
            variant="profile"
            isFollowing={user.isFollowing}
            onFollow={onFollowToggle}
          />
        </div>
      ))}
    </motion.div>
  );
};

// Optimize with memo
export default memo(ExploreGrid);