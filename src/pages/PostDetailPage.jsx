// src/pages/PostDetailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useFollowStatus } from '../services/followService';
import { supabase } from '../lib/supabase';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/FormComponents';
import UserFollowButton from '../components/ui/UserFollowButton';

/**
 * PostDetailPage Component
 * 
 * Displays a post with comments and interactions
 */
const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Refs
  const commentInputRef = useRef(null);
  
  // State
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Check if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        navigate('/404');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch post details
        const { data, error } = await supabase
          .from('post_details')
          .select('*')
          .eq('id', postId)
          .single();
          
        if (error) {
          console.error('Error fetching post:', error);
          navigate('/404');
          return;
        }
        
        setPost(data);
        setLikesCount(data.likes_count || 0);
        setIsOwner(user?.id === data.user_id);
        
        // Check if user has liked or bookmarked this post
        if (user) {
          // Check likes
          const { data: likeData } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();
            
          setIsLiked(!!likeData);
          
          // Check bookmarks
          const { data: bookmarkData } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();
            
          setIsBookmarked(!!bookmarkData);
        }
      } catch (error) {
        console.error('Error in post fetch:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [postId, navigate, user]);
  
  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;
      
      try {
        setCommentsLoading(true);
        
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            user_id,
            profiles:user_id (
              id,
              username, 
              avatar_url
            )
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: false });
          
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
        setCommentsLoading(false);
      }
    };
    
    fetchComments();
    
    // Set up real-time subscription for new comments
    const commentsSubscription = supabase
      .channel('comments-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`
      }, payload => {
        // Fetch the user info for the new comment
        const fetchCommentUser = async () => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', payload.new.user_id)
            .single();
            
          // Add comment to state
          const newComment = {
            id: payload.new.id,
            text: payload.new.content,
            created_at: payload.new.created_at,
            user_id: payload.new.user_id,
            username: userData?.username || 'User',
            avatar_url: userData?.avatar_url
          };
          
          setComments(prev => [newComment, ...prev]);
        };
        
        fetchCommentUser();
      })
      .subscribe();
      
    // Clean up subscription
    return () => {
      supabase.removeChannel(commentsSubscription);
    };
  }, [postId]);
  
  // Get follow status for post author (if not the current user)
  const authorFollowStatus = useFollowStatus(post?.user_id);
  
  // Handle like
  const handleLike = async () => {
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
            post_id: postId,
            user_id: user.id,
            created_at: new Date().toISOString()
          });
          
        // Increment like count
        await supabase.rpc('increment_like_count', { post_id: postId });
      } else {
        // Unlike the post
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        // Decrement like count
        await supabase.rpc('decrement_like_count', { post_id: postId });
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
            post_id: postId,
            user_id: user.id,
            created_at: new Date().toISOString()
          });
      } else {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert UI on error
      setIsBookmarked(!newBookmarkedState);
    }
  };
  
  // Handle adding a comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!user || !commentText.trim() || submittingComment) return;
    
    try {
      setSubmittingComment(true);
      
      // Add comment to database
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: commentText.trim(),
          created_at: new Date().toISOString()
        })
        .select();
        
      if (error) throw error;
      
      // Reset input
      setCommentText('');
      
      // Update comment count on the post
      try {
        await supabase.rpc('increment_comment_count', { post_id: postId });
      } catch (rpcError) {
        console.error('RPC error:', rpcError);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
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
  
  // Handle post deletion
  const handleDeletePost = async () => {
    if (!post || !user || user.id !== post.user_id) return;
    
    try {
      // Delete the post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);
        
      if (error) throw error;
      
      // Close modal
      setDeleteModalOpen(false);
      
      // Navigate back to profile after deletion
      navigate('/profile');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };
  
  // Format timestamp as relative time
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
    } catch {
      return '';
    }
  };
  
  // Parse hashtags in text
  const formatText = (text) => {
    if (!text) return '';
    
    // Replace hashtags with styled spans
    return text.split(/(#\w+)/g).map((part, index) => 
      part.startsWith('#') ? (
        <span key={index} className="text-cyan-400 hover:underline cursor-pointer" 
              onClick={() => navigate(`/explore?tag=${part.substring(1)}`)}>
          {part}
        </span>
      ) : part
    );
  };
  
  // Comment Component
  const CommentItem = ({ comment }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const isOwn = user?.id === comment.user_id;
    
    return (
      <div className="flex p-3 hover:bg-white/5 transition-colors rounded-lg">
        <Link to={`/profile/${comment.username}`} className="flex-shrink-0">
          <Avatar 
            src={comment.avatar_url} 
            name={comment.username}
            size="sm"
          />
        </Link>
        
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <Link to={`/profile/${comment.username}`} className="font-medium text-white hover:text-cyan-400 transition-colors">
                {comment.username}
              </Link>
              <p className="text-white/80 whitespace-pre-wrap break-words text-sm mt-1">
                {formatText(comment.text)}
              </p>
              <p className="text-xs text-white/40 mt-1">
                {formatRelativeTime(comment.created_at)}
              </p>
            </div>
            
            {isOwn && (
              <div className="relative ml-2">
                <button 
                  className="p-1 text-white/40 hover:text-white/80 rounded-full transition-colors"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-black border border-white/10 rounded-lg shadow-xl overflow-hidden z-10">
                    <button 
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center"
                      onClick={() => {
                        setMenuOpen(false);
                        handleDeleteComment(comment.id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
  
  // Share Modal Component
  const ShareModal = () => {
    const [copied, setCopied] = useState(false);
    const shareUrl = `${window.location.origin}/post/${postId}`;
    
    const handleCopyLink = () => {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
          onClick={() => setShareModalOpen(false)}
        ></div>
        
        {/* Modal */}
        <div className="relative z-10 bg-black border border-white/10 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Share Post</h3>
            <button 
              onClick={() => setShareModalOpen(false)}
              className="text-white/70 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
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
          
          {/* Copy link */}
          <div className="mb-4">
            <div className="relative">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white pr-24"
              />
              <button
                onClick={handleCopyLink}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-1 rounded-md transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          
          {/* Share options */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                window.open(`mailto:?subject=Check out this post on UniShare&body=I thought you might like this: ${shareUrl}`);
                setShareModalOpen(false);
              }}
              className="flex items-center p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-white">Email</span>
            </button>
            
            <button
              onClick={() => {
                window.open(`https://twitter.com/intent/tweet?text=Check out this post on UniShare&url=${encodeURIComponent(shareUrl)}`);
                setShareModalOpen(false);
              }}
              className="flex items-center p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3 text-white">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </div>
              <span className="text-white">Twitter</span>
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={() => setDeleteModalOpen(false)}
      ></div>
      
      {/* Modal */}
      <div className="relative z-10 bg-black border border-white/10 rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Delete Post</h3>
          <p className="text-white/70 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
          <div className="flex space-x-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeletePost}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Loading state
  if (loading) {
    return <AppLayout loading={true} />;
  }
  
  // Post not found state
  if (!post) {
    return (
      <AppLayout>
        <div className="py-12 text-center">
          <div className="bg-white/5 border border-white/10 p-8 rounded-xl max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500/20 to-amber-500/20 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Post Not Found</h2>
            <p className="text-white/60 mb-8">The post you're looking for doesn't exist or has been removed.</p>
            <Button variant="primary" onClick={() => navigate('/home')}>
              Return Home
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className={`${isMobile ? 'block' : 'md:flex'} bg-black border border-white/10 rounded-xl overflow-hidden`}>
          {/* Left side - Image */}
          <div className={`${isMobile ? 'w-full' : 'md:w-3/5'} bg-black/50 ${isMobile ? '' : 'md:border-r md:border-white/10'}`}>
            {post.image_url ? (
              <div className="relative aspect-square md:aspect-auto md:h-full">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="w-10 h-10 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin"></div>
                  </div>
                )}
                
                <img
                  src={post.image_url}
                  alt={post.caption || "Post content"}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            ) : (
              <div className="aspect-square md:aspect-auto md:h-full bg-gradient-to-tr from-black to-gray-900 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Right side - Post content */}
          <div className={`${isMobile ? 'w-full' : 'md:w-2/5'} flex flex-col`}>
            {/* Post header with user info */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center">
                <Link to={`/profile/${post.username}`}>
                  <Avatar 
                    src={post.avatar_url} 
                    name={post.full_name || post.username}
                    size="sm"
                  />
                </Link>
                <div className="ml-3">
                  <div className="flex items-center">
                    <Link to={`/profile/${post.username}`} className="font-medium text-white hover:text-cyan-400 transition-colors">
                      {post.full_name || post.username}
                    </Link>
                    {!isOwner && user?.id !== post.user_id && (
                      <div className="ml-2">
                        <UserFollowButton
                          userId={post.user_id}
                          variant="secondary"
                          size="small"
                          showState={false}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-white/50 text-xs">
                    {formatRelativeTime(post.created_at)}
                    {post.location && (
                      <>
                        <span className="mx-1">•</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {post.location}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-black border border-white/10 rounded-lg shadow-xl overflow-hidden z-10">
                    <button 
                      className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors flex items-center"
                      onClick={() => {
                        setMenuOpen(false);
                        setShareModalOpen(true);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share Post
                    </button>
                    
                    {isOwner && (
                      <>
                        <button 
                          className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors flex items-center"
                          onClick={() => {
                            setMenuOpen(false);
                            navigate(`/create?edit=${post.id}`);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Post
                        </button>
                        
                        <button 
                          className="w-full px-4 py-3 text-left text-sm hover:bg-red-500/10 transition-colors flex items-center"
                          onClick={() => {
                            setMenuOpen(false);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Post
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Post caption (only visible if it exists) */}
            {post.caption && (
              <div className="p-4 border-b border-white/10">
                <div className="flex">
                  <Link to={`/profile/${post.username}`} className="flex-shrink-0">
                    <Avatar 
                      src={post.avatar_url} 
                      name={post.full_name || post.username}
                      size="sm"
                    />
                  </Link>
                  
                  <div className="ml-3">
                    <Link to={`/profile/${post.username}`} className="font-medium text-white hover:text-cyan-400 transition-colors">
                      {post.full_name || post.username}
                    </Link>
                    <p className="text-white/80 whitespace-pre-wrap text-sm mt-1">
                      {formatText(post.caption)}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {formatRelativeTime(post.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Comments section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
              {commentsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <p className="text-white/50 mb-2">No comments yet</p>
                  <p className="text-white/40 text-sm">Be the first to add a comment!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </AnimatePresence>
              )}
            </div>
            
            {/* Post actions */}
            <div className="p-4 border-t border-white/10">
              <div className="flex justify-between mb-4">
                <div className="flex space-x-4">
                  {/* Like button */}
                  <button 
                    onClick={handleLike}
                    className="text-2xl focus:outline-none"
                  >
                    {isLiked ? (
                      <svg className="w-6 h-6 text-red-500 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white hover:text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Comment button */}
                  <button 
                    onClick={() => commentInputRef.current?.focus()}
                    className="text-2xl focus:outline-none"
                  >
                    <svg className="w-6 h-6 text-white hover:text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  
                  {/* Share button */}
                  <button 
                    onClick={() => setShareModalOpen(true)}
                    className="text-2xl focus:outline-none"
                  >
                    <svg className="w-6 h-6 text-white hover:text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
                
                {/* Bookmark button */}
                <button 
                  onClick={handleBookmark}
                  className="text-2xl focus:outline-none"
                >
                  {isBookmarked ? (
                    <svg className="w-6 h-6 text-white fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white hover:text-white/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Likes count */}
              {likesCount > 0 && (
                <p className="font-medium text-white text-sm mb-2">
                  {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
                </p>
              )}
              
              {/* Add comment form */}
              <form onSubmit={handleAddComment} className="mt-3 flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <Avatar
                    src={user?.user_metadata?.avatar_url}
                    size="sm"
                  />
                </div>
                <div className="flex-1 relative">
                  <input
                    ref={commentInputRef}
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 placeholder-white/40"
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submittingComment}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      commentText.trim() && !submittingComment
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }`}
                  >
                    {submittingComment ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Share modal */}
        <AnimatePresence>
          {shareModalOpen && <ShareModal />}
        </AnimatePresence>
        
        {/* Delete confirmation modal */}
        <AnimatePresence>
          {deleteModalOpen && <DeleteConfirmationModal />}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default PostDetailPage;