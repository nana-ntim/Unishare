// src/components/post/PostComponents.jsx
// This file contains all the components needed for the post detail page

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import Avatar from '../ui/Avatar';
import Button from '../ui/FormComponents';

/**
 * PostHeader Component
 */
export const PostHeader = ({ post, isOwner, onShare, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Format timestamp to relative time
  const formatRelativeTime = (timestamp) => {
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
        return `${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      return '';
    }
  };
  
  const handleAuthorClick = () => {
    navigate(`/profile/${post.username}`);
  };
  
  return (
    <div className="p-4 flex items-center border-b border-white/10">
      <div className="cursor-pointer" onClick={handleAuthorClick}>
        <Avatar 
          src={post.avatar_url} 
          name={post.full_name || post.username || 'User'}
          size="sm"
        />
      </div>
      
      <div className="ml-3 cursor-pointer" onClick={handleAuthorClick}>
        <p className="font-semibold text-white hover:underline">{post.full_name || post.username}</p>
        {post.location && (
          <p className="text-xs text-neutral-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {post.location}
          </p>
        )}
      </div>
      
      <div className="ml-auto relative">
        <button 
          className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Post menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
        
        {/* Menu dropdown */}
        {menuOpen && isOwner ? (
          <PostMenu 
            onDelete={onDelete}
            onEdit={() => navigate(`/create?edit=${post.id}`)}
            onClose={() => setMenuOpen(false)}
          />
        ) : menuOpen && (
          <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-black border border-white/10 rounded-lg shadow-xl z-10">
            <button 
              className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
              onClick={() => {
                setMenuOpen(false);
                onShare();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            <button 
              className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
              onClick={() => {
                setMenuOpen(false);
                // Report functionality
                alert('Report functionality coming soon');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * PostMenu Component
 */
export const PostMenu = ({ onEdit, onDelete, onClose }) => {
  return (
    <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-black border border-white/10 rounded-lg shadow-xl z-10">
      <button 
        className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
          onClose();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit Post
      </button>
      <button 
        className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          onClose();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Post
      </button>
    </div>
  );
};

/**
 * PostImage Component
 */
export const PostImage = ({ post }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  if (!post.image_url) {
    return (
      <div className="aspect-square w-full bg-black flex items-center justify-center text-neutral-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
  
  return (
    <div className="relative aspect-square md:aspect-auto md:h-full w-full">
      <AnimatePresence>
        {!imageLoaded && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin"></div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <img
        src={post.image_url}
        alt={post.caption || "Post content"}
        className={`w-full h-full object-contain transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
        loading="lazy"
      />
    </div>
  );
};

/**
 * PostActions Component
 */
export const PostActions = ({ post, onShare }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Check interactions status
  useEffect(() => {
    if (!user || !post) return;
    
    const checkInteractions = async () => {
      try {
        // Check if user has liked the post
        const { data: likeData } = await supabase
          .from('likes')
          .select('*')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle();
          
        setIsLiked(!!likeData);
        
        // Check if user has bookmarked the post
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle();
          
        setIsBookmarked(!!bookmarkData);
      } catch (error) {
        console.error('Error checking interactions:', error);
      }
    };
    
    checkInteractions();
  }, [post, user]);
  
  // Handle like
  const handleLike = async () => {
    if (!user || !post) return;
    
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
            post_id: post.id,
            user_id: user.id,
            created_at: new Date().toISOString()
          });
          
        // Increment like count
        await supabase.rpc('increment_like_count', { post_id: post.id });
      } else {
        // Unlike the post
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
          
        // Decrement like count
        await supabase.rpc('decrement_like_count', { post_id: post.id });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert UI on error
      setIsLiked(!newLikedState);
      setLikesCount(prev => !newLikedState ? prev + 1 : Math.max(0, prev - 1));
    }
  };
  
  // Handle bookmark
  const handleBookmark = async () => {
    if (!user || !post) return;
    
    const newBookmarkedState = !isBookmarked;
    
    // Update UI optimistically
    setIsBookmarked(newBookmarkedState);
    
    try {
      if (newBookmarkedState) {
        // Bookmark the post
        await supabase
          .from('bookmarks')
          .insert({
            post_id: post.id,
            user_id: user.id,
            created_at: new Date().toISOString()
          });
      } else {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert UI on error
      setIsBookmarked(!newBookmarkedState);
    }
  };
  
  // Focus comment input
  const focusCommentInput = () => {
    const commentInput = document.querySelector('input[placeholder="Add a comment..."]');
    if (commentInput) {
      commentInput.focus();
    }
  };
  
  // Format text with hashtags
  const formatCaption = (text) => {
    if (!text) return '';
    
    // Match hashtags
    const hashtagRegex = /#(\w+)/g;
    const parts = text.split(hashtagRegex);
    
    if (parts.length <= 1) return text;
    
    // Create an array of text and styled hashtags
    const elements = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text
        elements.push(parts[i]);
      } else {
        // Hashtag
        elements.push(
          <span key={i} className="text-cyan-400 cursor-pointer hover:underline">
            #{parts[i]}
          </span>
        );
      }
    }
    
    return <>{elements}</>;
  };
  
  return (
    <div className="p-4 border-t border-white/10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          {/* Like button */}
          <button 
            onClick={handleLike}
            className="focus:outline-none"
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
                <svg className="w-6 h-6 text-white fill-none stroke-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </motion.div>
          </button>
          
          {/* Comment button */}
          <button 
            onClick={focusCommentInput}
            className="focus:outline-none"
            aria-label="Comment"
          >
            <svg className="w-6 h-6 text-white fill-none stroke-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          
          {/* Share button */}
          <button 
            onClick={onShare}
            className="focus:outline-none"
            aria-label="Share"
          >
            <svg className="w-6 h-6 text-white fill-none stroke-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
        
        {/* Bookmark button */}
        <button 
          onClick={handleBookmark}
          className="focus:outline-none"
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1 }}
          >
            {isBookmarked ? (
              <svg className="w-6 h-6 text-white fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white fill-none stroke-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </motion.div>
        </button>
      </div>
      
      {/* Caption */}
      {post.caption && (
        <div className="mb-3">
          <p className="text-white whitespace-pre-wrap break-words text-sm">
            <span className="font-semibold mr-1.5">{post.username}</span>
            {formatCaption(post.caption)}
          </p>
        </div>
      )}
      
      {/* Likes count */}
      {likesCount > 0 && (
        <p className="font-semibold text-white mb-3">
          {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
        </p>
      )}
    </div>
  );
};

/**
 * CommentItem Component - Individual comment with edit/delete functionality
 */
export const CommentItem = ({ comment, currentUserId, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isOwnComment = currentUserId === comment.user_id;
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Unknown time';
    }
  };
  
  const handleProfileClick = () => {
    navigate(`/profile/${comment.username}`);
  };
  
  return (
    <div className="flex group hover:bg-white/5 rounded-lg transition-colors p-2">
      <div className="mr-3 flex-shrink-0">
        <Avatar 
          src={comment.avatar_url} 
          name={comment.username || 'User'}
          size="sm"
          clickable
          onClick={handleProfileClick}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start">
          <div className="flex-1">
            <div className="flex items-baseline flex-wrap">
              <span 
                className="font-semibold text-white hover:underline cursor-pointer mr-1.5"
                onClick={handleProfileClick}
              >
                {comment.username}
              </span>
              <span className="text-white/60 text-xs">{formatTime(comment.created_at)}</span>
            </div>
            <p className="text-white text-sm whitespace-pre-wrap break-words">{comment.text}</p>
          </div>
          
          {isOwnComment && (
            <div className="relative ml-2">
              <button 
                className="text-white/40 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 w-32 bg-black border border-white/10 rounded-lg shadow-xl z-10">
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 text-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete(comment.id);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * PostComments Component - Comment section with form
 */
export const PostComments = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const commentsContainerRef = useRef(null);
  
  // Load comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            user_id,
            profiles:user_id (username, avatar_url)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (error) throw error;
        
        // Format comments
        const formattedComments = (data || []).map(comment => ({
          id: comment.id,
          text: comment.content,
          created_at: comment.created_at,
          user_id: comment.user_id,
          username: comment.profiles?.username || 'User',
          avatar_url: comment.profiles?.avatar_url
        }));
        
        setComments(formattedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [postId]);
  
  // Handle adding a comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!user || !commentText.trim() || submitting) return;
    
    try {
      setSubmitting(true);
      
      // Add comment to database
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: commentText.trim(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Get user profile info from the current user object
      const newComment = {
        id: data.id,
        text: data.content,
        created_at: data.created_at,
        user_id: user.id,
        username: user.user_metadata?.username || 'User',
        avatar_url: user.user_metadata?.avatar_url
      };
      
      // Update UI
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      
      // Update comment count
      try {
        await supabase.rpc('increment_comment_count', { post_id: postId });
      } catch (rpcError) {
        console.error('RPC error:', rpcError);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    if (!user) return;
    
    try {
      // Delete from database
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
        
      if (error) throw error;
      
      // Update UI
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      // Update comment count
      try {
        await supabase.rpc('decrement_comment_count', { post_id: postId });
      } catch (rpcError) {
        console.error('RPC error:', rpcError);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  
  return (
    <div className="flex-1 flex flex-col h-[300px] md:h-full md:max-h-[60vh]">
      {/* Comments list */}
      <div 
        ref={commentsContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/30"
      >
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-2 border-white/20 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/50">No comments yet.</p>
            <p className="text-white/50 text-sm mt-1">Be the first to comment!</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>
      
      {/* Comment form */}
      <div className="p-4 border-t border-white/10 bg-black">
        <form onSubmit={handleAddComment} className="flex items-center space-x-3">
          <Avatar 
            src={user?.user_metadata?.avatar_url} 
            size="sm"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-full py-2 px-4 text-sm text-white focus:outline-none focus:border-white/20"
              maxLength={500}
            />
            
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                commentText.trim() && !submitting
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ShareModal Component - Modal for sharing posts
 */
export const ShareModal = ({ post, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/post/${post.id}`;
  
  // Share options
  const shareOptions = [
    {
      name: 'Copy Link',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      ),
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    {
      name: 'Share via Email',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      action: () => {
        const subject = "Check out this post on UniShare";
        const body = `I found this interesting post on UniShare: ${shareUrl}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        onClose();
      }
    },
    {
      name: 'Share on Twitter',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      action: () => {
        const text = `Check out this post on UniShare: ${shareUrl}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
        onClose();
      }
    },
    {
      name: 'Share on Facebook',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        onClose();
      }
    }
  ];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-black border border-white/10 rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">Share Post</h3>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {/* Post preview */}
          <div className="flex items-center mb-4 p-3 bg-white/5 rounded-lg">
            {post.image_url ? (
              <div className="w-16 h-16 bg-black/50 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                <img 
                  src={post.image_url} 
                  alt="Post" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{post.username}</p>
              <p className="text-white/70 text-sm truncate">{post.caption ? post.caption.substring(0, 50) + (post.caption.length > 50 ? '...' : '') : 'Post from UniShare'}</p>
            </div>
          </div>
          
          {/* Share link */}
          <div className="mb-4">
            <div className="relative">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white pr-24"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-1 rounded-md transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          
          {/* Share options */}
          <div className="grid grid-cols-2 gap-2">
            {shareOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.action}
                className="flex items-center p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                  {option.icon}
                </div>
                <span className="text-white">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Export individual components
export default {
  PostHeader,
  PostImage,
  PostActions,
  CommentItem,
  PostComments,
  ShareModal,
  PostMenu
};