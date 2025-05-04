// src/components/ui/CardComponents.jsx
//
// Consolidated card components for various card types

import React, { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Avatar from './Avatar';

/**
 * Base Card Component
 */
export const Card = ({ 
  children, 
  className = '',
  noBorder = false,
  noPadding = false,
  isInteractive = false,
  variant = 'default',
  accent = 'none',
  onClick,
  ...props 
}) => {
  // Base styles
  const baseClasses = "bg-black rounded-xl overflow-hidden";
  
  // Border styles
  const borderClasses = noBorder 
    ? '' 
    : variant === 'elevated' 
      ? 'border border-white/10' 
      : 'border border-[#222222]';
  
  // Padding classes
  const paddingClasses = noPadding ? '' : 'p-4';
  
  // Variant-specific classes
  const variantClasses = {
    default: '',
    elevated: 'shadow-lg shadow-black/20',
    filled: 'bg-[#111111]'
  };
  
  // Accent classes
  const accentClasses = {
    none: '',
    left: 'border-l-2 border-l-cyan-500',
    top: 'border-t-2 border-t-cyan-500',
    right: 'border-r-2 border-r-cyan-500'
  };
  
  // Interactive styles for hover effects
  const interactiveClasses = isInteractive 
    ? 'cursor-pointer transition-all duration-300' 
    : '';
  
  // Determine if we should use motion.div for animations
  const Component = isInteractive ? motion.div : 'div';
  
  // Animation props
  const animationProps = isInteractive ? {
    whileHover: { 
      y: -4,
      backgroundColor: 'rgba(17, 17, 17, 1)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      transition: { duration: 0.3 }
    },
    whileTap: { 
      y: -2,
      transition: { duration: 0.1 }
    }
  } : {};

  return (
    <Component 
      className={`
        ${baseClasses}
        ${borderClasses}
        ${paddingClasses}
        ${variantClasses[variant] || ''}
        ${accentClasses[accent] || ''}
        ${interactiveClasses}
        ${className}
      `}
      onClick={onClick}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  noBorder: PropTypes.bool,
  noPadding: PropTypes.bool,
  isInteractive: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'elevated', 'filled']),
  accent: PropTypes.oneOf(['none', 'left', 'top', 'right']),
  onClick: PropTypes.func
};

/**
 * Feed Card Component
 */
export const FeedCard = ({ post }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [saved, setSaved] = useState(post.isSaved || false);
  
  // Format timestamp to relative time (e.g., "2h ago")
  const formatTimestamp = (timestamp) => {
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
      if (diffMinutes < 60) return `${diffMinutes}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (error) {
      return timestamp;
    }
  };
  
  // Handle like action
  const handleLike = useCallback((e) => {
    e.stopPropagation();
    setLiked(prev => !prev);
    setLikesCount(prev => liked ? Math.max(0, prev - 1) : prev + 1);
  }, [liked]);
  
  // Handle save/bookmark action
  const handleSave = useCallback((e) => {
    e.stopPropagation();
    setSaved(prev => !prev);
  }, []);
  
  // Handle profile click
  const handleProfileClick = useCallback((e) => {
    e.stopPropagation();
    navigate(`/profile/${post.author?.username}`);
  }, [navigate, post.author?.username]);
  
  // Handle post click
  const handlePostClick = useCallback(() => {
    navigate(`/post/${post.id}`);
  }, [navigate, post.id]);
  
  // Parse hashtags in content
  const renderContent = (text) => {
    if (!text) return '';
    
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const parts = text.split(hashtagRegex);
    const hashtags = text.match(hashtagRegex) || [];
    
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {hashtags[index] && (
          <span 
            className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
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
  };
  
  return (
    <div
      className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden transition-colors hover:bg-white/10 mb-6 max-w-md mx-auto cursor-pointer"
      onClick={handlePostClick}
    >
      {/* Header - User info */}
      <div className="flex items-center p-3 border-b border-white/5">
        <div className="h-8 w-8 rounded-full overflow-hidden border border-white/20 cursor-pointer" onClick={handleProfileClick}>
          {post.author?.avatar ? (
            <img 
              src={post.author.avatar} 
              alt={post.author.name || 'User'} 
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {post.author?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        
        <div className="ml-2 flex-1 min-w-0 cursor-pointer" onClick={handleProfileClick}>
          <div className="flex items-center">
            <p className="text-sm font-medium text-white truncate">{post.author?.name || 'User'}</p>
            <span className="mx-1 text-white/30 text-xs">•</span>
            <p className="text-xs text-white/50">{formatTimestamp(post.timestamp)}</p>
          </div>
          
          <div className="flex items-center text-white/60 text-xs">
            <p className="truncate">
              {post.author?.username && `@${post.author.username}`} 
              {post.author?.university && post.author?.username && ' • '} 
              {post.author?.university}
            </p>
          </div>
        </div>
      </div>
      
      {/* Image - Instagram-style 4:5 aspect ratio */}
      {post.images && post.images.length > 0 && (
        <div className="aspect-[4/5] bg-black/30 w-full">
          <img 
            src={post.images[0]} 
            alt="Post content" 
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center justify-between p-3 border-t border-b border-white/5">
        <div className="flex items-center space-x-4">
          {/* Like button */}
          <button 
            onClick={handleLike}
            className="flex items-center space-x-1.5 transition-colors"
          >
            <div className={liked ? 'text-pink-500' : 'text-white/60 hover:text-white/90'}>
              {liked ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </div>
            <span className={`text-xs font-medium ${liked ? 'text-pink-500' : 'text-white/60'}`}>
              {likesCount}
            </span>
          </button>
          
          {/* Comment button */}
          <button className="flex items-center space-x-1.5 text-white/60 hover:text-white/90 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-medium">{post.comments || 0}</span>
          </button>
          
          {/* Share button */}
          <button className="text-white/60 hover:text-white/90 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
        
        {/* Bookmark button */}
        <button 
          onClick={handleSave}
          className={saved ? 'text-cyan-400' : 'text-white/60 hover:text-white/90 transition-colors'}
        >
          {saved ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Content */}
      {post.content && (
        <div className="p-3">
          <p className="text-white/90 text-sm">
            {renderContent(post.content)}
          </p>
          
          {/* Location if available */}
          {post.location && (
            <div className="flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-white/40 ml-1">{post.location}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Trending Card Component
 */
export const TrendingCard = ({
  title = 'Trending',
  hashtags = [],
  topics = [],
  variant = 'mixed',
  onTagSelect,
  onTopicSelect,
  selectedTag = null
}) => {
  // TrendingHashtag Component
  const TrendingHashtag = ({ tag, count, isActive = false, onClick }) => {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`
          px-4 py-2.5 rounded-full text-sm transition-all duration-300 
          flex items-center whitespace-nowrap
          ${isActive 
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20' 
            : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/15'
          }
        `}
      >
        <span className={isActive ? 'text-white' : 'text-cyan-400'}>
          #
        </span>
        <span className="ml-1">{tag}</span>
        
        {count !== undefined && (
          <span className={`
            ml-2 text-xs px-2 py-0.5 rounded-full
            ${isActive ? 'bg-white/20' : 'bg-white/10'}
          `}>
            {count > 999 ? `${(count / 1000).toFixed(1)}K` : count}
          </span>
        )}
      </motion.button>
    );
  };

  // TrendingTopic Component
  const TrendingTopic = ({ 
    topic, 
    category,
    count, 
    icon = null,
    onClick 
  }) => {
    return (
      <div 
        className="p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        onClick={onClick}
      >
        <div className="flex justify-between items-start">
          <div>
            {category && (
              <p className="text-white/40 text-xs mb-1 flex items-center">
                {icon && <span className="mr-1">{icon}</span>}
                {category}
              </p>
            )}
            <h4 className="text-white font-medium hover:text-cyan-400 transition-colors line-clamp-1">
              {topic}
            </h4>
          </div>
          
          {count !== undefined && (
            <span className="text-xs text-white/50 ml-2 bg-white/10 px-2 py-0.5 rounded-full">
              {count > 999 ? `${(count / 1000).toFixed(1)}K posts` : `${count} posts`}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Handle tag selection
  const handleTagClick = (tag) => {
    if (onTagSelect) {
      onTagSelect(tag === selectedTag ? null : tag);
    }
  };
  
  // Handle topic selection
  const handleTopicClick = (topicId) => {
    if (onTopicSelect) {
      onTopicSelect(topicId);
    }
  };

  return (
    <Card>
      <div className="p-5">
        <h3 className="text-lg font-medium text-white mb-4">{title}</h3>
        
        {/* Hashtags section */}
        {(variant === 'hashtags' || variant === 'mixed') && hashtags.length > 0 && (
          <div className="mb-4">
            {variant === 'mixed' && (
              <h4 className="text-white/60 text-sm mb-3">Popular Tags</h4>
            )}
            
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <TrendingHashtag 
                  key={tag.id || tag.name}
                  tag={tag.name}
                  count={tag.post_count || tag.count}
                  isActive={selectedTag === `#${tag.name}`}
                  onClick={() => handleTagClick(`#${tag.name}`)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Topics section */}
        {(variant === 'topics' || variant === 'mixed') && topics.length > 0 && (
          <div>
            {variant === 'mixed' && hashtags.length > 0 && (
              <h4 className="text-white/60 text-sm mb-2 mt-4">Trending Topics</h4>
            )}
            
            <div className="space-y-1">
              {topics.map((topic) => (
                <TrendingTopic 
                  key={topic.id}
                  topic={topic.name || topic.title}
                  category={topic.category}
                  count={topic.post_count || topic.count}
                  icon={
                    topic.category === 'University' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    ) : null
                  }
                  onClick={() => handleTopicClick(topic.id)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {((variant === 'hashtags' && hashtags.length === 0) || 
           (variant === 'topics' && topics.length === 0) ||
           (variant === 'mixed' && hashtags.length === 0 && topics.length === 0)) && (
          <div className="text-center py-4">
            <p className="text-white/50 text-sm">No trending content available</p>
          </div>
        )}
        
        {/* Show more link */}
        {((variant === 'hashtags' && hashtags.length > 0) || 
           (variant === 'topics' && topics.length > 0) ||
           (variant === 'mixed' && (hashtags.length > 0 || topics.length > 0))) && (
          <Link 
            to="/explore" 
            className="block text-center text-cyan-400 hover:text-cyan-300 text-sm mt-4 transition-colors"
          >
            Show more
          </Link>
        )}
      </div>
    </Card>
  );
};

// Export individual components and a default Card export
export default Card;