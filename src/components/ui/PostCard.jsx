// src/components/ui/PostCard.jsx
//
// Instagram-inspired PostCard component with modern aesthetics
// Provides clean, content-focused post display with perfect spacing

import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import Avatar from './Avatar';

/**
 * PostCard Component
 * 
 * A premium Instagram-style post card:
 * - Clean, content-focused design
 * - Optimized image display
 * - Elegant interaction states
 * - Perfect typography and spacing
 * 
 * @param {Object} props
 * @param {Object} props.post - Post data
 * @param {string} props.variant - Card display variant (standard, compact)
 * @param {Function} props.onLike - Like handler
 * @param {Function} props.onComment - Comment handler
 * @param {Function} props.onShare - Share handler
 * @param {Function} props.onBookmark - Bookmark handler
 */
const PostCard = ({
  post,
  variant = 'standard',
  className = '',
  onLike,
  onComment,
  onShare,
  onBookmark
}) => {
  // Hooks
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Local state
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [likesCount, setLikesCount] = useState(post?.likes || 0);
  const [isBookmarked, setIsBookmarked] = useState(post?.isBookmarked || false);
  
  // Destructure post data with defaults
  const {
    id,
    author = {},
    content = '',
    images = [],
    likes = 0,
    comments = 0,
    timestamp = new Date(),
    location = ''
  } = post || {};
  
  // Check if the user has liked/bookmarked the post on mount
  useEffect(() => {
    if (!user || !id) return;
    
    const checkInteractions = async () => {
      try {
        // Check if user has liked the post
        const { data: likeData } = await supabase
          .from('likes')
          .select('*')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .single();
          
        setIsLiked(!!likeData);
        
        // Check if user has bookmarked the post
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .single();
          
        setIsBookmarked(!!bookmarkData);
      } catch (error) {
        // Silent fail - just use the default values
      }
    };
    
    checkInteractions();
  }, [user, id]);
  
  // Format timestamp as relative time
  const formatRelativeTime = useCallback((timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSeconds < 60) {
        return 'Just now';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m`;
      } else if (diffHours < 24) {
        return `${diffHours}h`;
      } else if (diffDays < 7) {
        return `${diffDays}d`;
      } else {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
    } catch {
      return '';
    }
  }, []);
  
  // Parse hashtags in post content
  const renderContent = useCallback((text) => {
    if (!text) return '';
    
    // Match hashtags with regex
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const parts = text.split(hashtagRegex);
    const hashtags = text.match(hashtagRegex) || [];
    
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {hashtags[index] && (
          <span 
            className="text-blue-400 hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/explore?tag=${hashtags[index].substring(1)}`);
            }}
          >
            {hashtags[index]}
          </span>
        )}
      </React.Fragment>
    ));
  }, [navigate]);
  
  // Handle like toggle
  const handleLike = useCallback(async (e) => {
    e.stopPropagation();
    
    if (!user) return;
    
    const newLikedState = !isLiked;
    
    // Update UI optimistically
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
    
    try {
      if (newLikedState) {
        // Like the post
        await supabase
          .from('likes')
          .insert({
            post_id: id,
            user_id: user.id,
            created_at: new Date().toISOString()
          });
          
        // Increment like count
        await supabase.rpc('increment_like_count', { post_id: id });
      } else {
        // Unlike the post
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);
          
        // Decrement like count
        await supabase.rpc('decrement_like_count', { post_id: id });
      }
      
      if (onLike) {
        onLike(id, newLikedState);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert UI on error
      setIsLiked(!newLikedState);
      setLikesCount(prev => !newLikedState ? prev + 1 : Math.max(0, prev - 1));
    }
  }, [id, user, isLiked, onLike]);
  
  // Handle comment
  const handleComment = useCallback((e) => {
    e.stopPropagation();
    
    // Navigate to post detail page with comment section focused
    navigate(`/post/${id}`);
    
    if (onComment) {
      onComment(id);
    }
  }, [id, navigate, onComment]);
  
  // Handle share
  const handleShare = useCallback((e) => {
    e.stopPropagation();
    
    // Copy the post URL to clipboard
    const postUrl = `${window.location.origin}/post/${id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      // Could show a toast notification here
      console.log('Post URL copied to clipboard');
    });
    
    if (onShare) {
      onShare(id);
    }
  }, [id, onShare]);
  
  // Handle bookmark toggle
  const handleBookmark = useCallback(async (e) => {
    e.stopPropagation();
    
    if (!user) return;
    
    const newBookmarkedState = !isBookmarked;
    
    // Update UI optimistically
    setIsBookmarked(newBookmarkedState);
    
    try {
      if (newBookmarkedState) {
        // Bookmark the post
        await supabase
          .from('bookmarks')
          .insert({
            post_id: id,
            user_id: user.id,
            created_at: new Date().toISOString()
          });
      } else {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);
      }
      
      if (onBookmark) {
        onBookmark(id, newBookmarkedState);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert UI on error
      setIsBookmarked(!newBookmarkedState);
    }
  }, [id, user, isBookmarked, onBookmark]);
  
  // Handle post click to view details
  const handlePostClick = useCallback(() => {
    navigate(`/post/${id}`);
  }, [id, navigate]);
  
  // Handle author profile click
  const handleAuthorClick = useCallback((e) => {
    e.stopPropagation();
    navigate(`/profile/${author.username}`);
  }, [author.username, navigate]);
  
  // Compact variant (for grid views)
  if (variant === 'compact') {
    return (
      <motion.div
        className={`group relative overflow-hidden bg-black border border-[#262626] rounded-lg ${className}`}
        whileHover={{ 
          y: -5,
          transition: { duration: 0.3 } 
        }}
        onClick={handlePostClick}
      >
        {/* Post image */}
        <div className="aspect-square bg-black relative overflow-hidden">
          {images && images.length > 0 ? (
            <>
              <motion.img
                src={images[0]}
                alt={content?.substring(0, 20) || "Post image"}
                className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
              />
              
              {/* Loading state */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-neutral-500 border-t-transparent animate-spin"></div>
                </div>
              )}
            </>
          ) : (
            // No image fallback
            <div className="w-full h-full bg-black flex items-center justify-center">
              <span className="text-neutral-500 text-sm">{content.substring(0, 30) || "No image"}</span>
            </div>
          )}
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Post info overlay (visible on hover) */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center">
              <div className="mr-2 w-7 h-7 rounded-full overflow-hidden border border-white/20">
                <img 
                  src={author.avatar} 
                  alt={author.name || "User"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${author.name}&background=0D8ABC&color=fff`;
                  }}
                />
              </div>
              <div className="truncate">
                <p className="text-white text-sm font-medium truncate">{author.name}</p>
              </div>
              
              {/* Like/comments indicators */}
              <div className="ml-auto flex space-x-2 text-white">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                  <span className="text-xs">{likesCount}</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">{comments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Standard post card (default)
  return (
    <div 
      className={`bg-black border border-[#262626] rounded-lg overflow-hidden mb-4 ${className}`}
      onClick={handlePostClick}
    >
      {/* Post header with author info */}
      <div className="p-3 flex items-center">
        <div className="mr-3 cursor-pointer" onClick={handleAuthorClick}>
          <Avatar 
            src={author.avatar} 
            name={author.name || 'User'}
            size="sm"
            clickable
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div 
            className="flex items-center cursor-pointer group"
            onClick={handleAuthorClick}
          >
            <p className="font-medium text-white text-sm group-hover:underline">{author.name || 'User'}</p>
            <span className="mx-1 text-neutral-500 text-xs">•</span>
            <p className="text-neutral-500 text-xs">{formatRelativeTime(timestamp)}</p>
          </div>
          
          {/* Location if available */}
          {location && (
            <p className="text-neutral-500 text-xs flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </p>
          )}
        </div>
        
        {/* Options menu */}
        <button className="p-1 text-neutral-400 hover:text-white rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      </div>
      
      {/* Post image */}
      {images && images.length > 0 && (
        <div className="relative aspect-square overflow-hidden">
          <AnimatePresence>
            {!imageLoaded && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-black"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-10 h-10 rounded-full border-2 border-neutral-500 border-t-transparent animate-spin"></div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <img
            src={images[0]}
            alt={content?.substring(0, 20) || "Post content"}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>
      )}
      
      {/* Post actions */}
      <div className="p-3">
        <div className="flex justify-between mb-2">
          <div className="flex space-x-4">
            {/* Like button */}
            <button 
              onClick={handleLike}
              className="text-2xl focus:outline-none"
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <motion.div
                whileTap={{ scale: 1.2 }}
                transition={{ duration: 0.1 }}
              >
                {isLiked ? (
                  <svg className="w-6 h-6 text-red-500 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-neutral-200 hover:text-neutral-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </motion.div>
            </button>
            
            {/* Comment button */}
            <button 
              onClick={handleComment}
              className="text-2xl focus:outline-none"
              aria-label="Comment"
            >
              <svg className="w-6 h-6 text-neutral-200 hover:text-neutral-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            
            {/* Share button */}
            <button 
              onClick={handleShare}
              className="text-2xl focus:outline-none"
              aria-label="Share"
            >
              <svg className="w-6 h-6 text-neutral-200 hover:text-neutral-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          {/* Bookmark button */}
          <button 
            onClick={handleBookmark}
            className="text-2xl focus:outline-none"
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            {isBookmarked ? (
              <svg className="w-6 h-6 text-neutral-100 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-neutral-200 hover:text-neutral-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Like count */}
        {likesCount > 0 && (
          <p className="text-white text-sm font-medium mb-1">
            {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
          </p>
        )}
        
        {/* Post content */}
        {content && (
          <div className="mb-1">
            <p className="text-white text-sm">
              <span className="font-medium mr-1">{author.name || 'User'}</span>
              <span>{renderContent(content)}</span>
            </p>
          </div>
        )}
        
        {/* Comments count - link to view all */}
        {comments > 0 && (
          <button 
            className="text-neutral-400 text-sm hover:text-neutral-300 mb-1"
            onClick={handleComment}
          >
            View all {comments} comments
          </button>
        )}
        
        {/* Timestamp */}
        <p className="text-neutral-500 text-xs uppercase mt-2">
          {typeof timestamp === 'string' 
            ? formatRelativeTime(timestamp) 
            : formatRelativeTime(timestamp.toString())}
        </p>
      </div>
    </div>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    author: PropTypes.shape({
      name: PropTypes.string,
      username: PropTypes.string,
      avatar: PropTypes.string
    }),
    content: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    likes: PropTypes.number,
    comments: PropTypes.number,
    timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    location: PropTypes.string,
    isLiked: PropTypes.bool,
    isBookmarked: PropTypes.bool
  }),
  variant: PropTypes.oneOf(['standard', 'compact']),
  className: PropTypes.string,
  onLike: PropTypes.func,
  onComment: PropTypes.func,
  onShare: PropTypes.func,
  onBookmark: PropTypes.func
};

export default PostCard;