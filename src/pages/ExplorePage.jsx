// src/pages/ExplorePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import AppLayout from '../components/layout/AppLayout';
import PostCard from '../components/ui/PostCard';
import Button from '../components/ui/FormComponents';
import Avatar from '../components/ui/Avatar';
import UserFollowButton from '../components/ui/UserFollowButton';

/**
 * ExplorePage Component
 * 
 * Displays search results, trending posts, and user suggestions
 */
const ExplorePage = () => {
  // Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get search params from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q');
  const tagQuery = searchParams.get('tag');
  
  // State
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState(searchQuery || '');
  
  // Load content based on search/tag
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // Searching for specific content
        if (searchQuery) {
          console.log('Searching for:', searchQuery);
          
          // Search for posts
          const { data: posts, error: postsError } = await supabase
            .from('post_details')
            .select('*')
            .ilike('caption', `%${searchQuery}%`)
            .order('created_at', { ascending: false })
            .limit(30);
          
          if (postsError) throw postsError;
          
          setPosts(posts || []);
          
          // Search for users
          const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('*')
            .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
            .limit(8);
          
          if (usersError) throw usersError;
          
          setUsers(users || []);
        } 
        // Searching by tag
        else if (tagQuery) {
          console.log('Searching for tag:', tagQuery);
          
          // First get hashtag id
          const { data: hashtagData } = await supabase
            .from('hashtags')
            .select('id')
            .eq('name', tagQuery)
            .single();
          
          if (hashtagData?.id) {
            // Then get posts with this hashtag
            const { data: taggedPosts } = await supabase
              .from('post_hashtags')
              .select('post_id')
              .eq('hashtag_id', hashtagData.id);
            
            if (taggedPosts && taggedPosts.length > 0) {
              const postIds = taggedPosts.map(p => p.post_id);
              
              const { data: posts } = await supabase
                .from('post_details')
                .select('*')
                .in('id', postIds)
                .order('created_at', { ascending: false });
              
              setPosts(posts || []);
            } else {
              setPosts([]);
            }
          } else {
            setPosts([]);
          }
          
          // No users for tag search
          setUsers([]);
        } 
        // Default explore content
        else {
          console.log('Loading default explore content');
          
          // Get trending posts
          const { data: trendingPosts, error: trendingError } = await supabase
            .from('post_details')
            .select('*')
            .order('likes_count', { ascending: false })
            .limit(30);
          
          if (trendingError) throw trendingError;
          
          setPosts(trendingPosts || []);
          
          // Get suggested users
          const { data: suggestedUsers, error: usersError } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', user?.id || '')
            .limit(8);
          
          if (usersError) throw usersError;
          
          setUsers(suggestedUsers || []);
          
          // Get trending hashtags
          const { data: trendingTags, error: tagsError } = await supabase
            .from('trending_hashtags')
            .select('*')
            .order('post_count', { ascending: false })
            .limit(5);
          
          if (tagsError) throw tagsError;
          
          setTrending(trendingTags || []);
        }
      } catch (error) {
        console.error('Error fetching explore content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [searchQuery, tagQuery, user?.id]);
  
  // Handle user follow status change
  const handleFollowStatusChange = useCallback((userId, isFollowing) => {
    console.log(`User ${userId} follow status changed to ${isFollowing}`);
    // Optional: Update UI or fetch new data
  }, []);
  
  // Handle search submission
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchValue.trim())}`);
    }
  }, [searchValue, navigate]);
  
  // Format posts for display
  const formattedPosts = posts.map(post => ({
    id: post.id,
    author: {
      name: post.full_name,
      username: post.username,
      avatar: post.avatar_url,
      university: post.university
    },
    content: post.caption,
    images: post.image_url ? [post.image_url] : [],
    likes: post.likes_count,
    comments: post.comments_count,
    timestamp: post.created_at,
    location: post.location
  }));
  
  // Get page title based on search context
  const getPageTitle = useCallback(() => {
    if (searchQuery) {
      return `Search results for "${searchQuery}"`;
    } else if (tagQuery) {
      return `#${tagQuery}`;
    } else {
      return 'Explore';
    }
  }, [searchQuery, tagQuery]);
  
  // Get page subtitle based on search context
  const getPageSubtitle = useCallback(() => {
    if (searchQuery) {
      return `${posts.length} posts found`;
    } else if (tagQuery) {
      return `${posts.length} posts with this hashtag`;
    } else {
      return 'Discover new content and people';
    }
  }, [searchQuery, tagQuery, posts.length]);
  
  return (
    <AppLayout title={getPageTitle()} subtitle={getPageSubtitle()}>
      <div className="max-w-6xl mx-auto">
        {/* Search bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search people, hashtags, or posts..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400/50 focus:border-cyan-400/50"
            />
            <button 
              type="submit" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
        
        {/* Current tag indicator */}
        {tagQuery && (
          <div className="mb-6">
            <div className="p-4 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-white/10 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mr-3">
                    <span className="text-xl font-semibold">#</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">#{tagQuery}</h3>
                    <p className="text-white/60">{posts.length} posts</p>
                  </div>
                </div>
                
                <Button 
                  variant="secondary"
                  size="small"
                  onClick={() => navigate('/explore')}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="mb-8">
          <AnimatePresence mode="wait">
            {loading ? (
              // Loading skeleton
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-lg"></div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* No results state */}
                {posts.length === 0 && users.length === 0 ? (
                  <div className="p-8 text-center bg-white/5 border border-white/10 rounded-xl">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium text-white mb-2">No results found</h3>
                      <p className="text-white/60 mb-6">
                        {searchQuery
                          ? `We couldn't find any results for "${searchQuery}"`
                          : tagQuery
                            ? `No posts found for #${tagQuery}`
                            : "No content available. Check back later."}
                      </p>
                      
                      <Button 
                        variant="primary"
                        onClick={() => navigate('/explore')}
                      >
                        Explore All Content
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Show user results if present */}
                    {users.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold text-white">
                            {searchQuery ? 'People' : 'Suggested People'}
                          </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {users.slice(0, 8).map(user => (
                            <div key={user.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                              <div className="flex flex-col items-center text-center">
                                <Avatar
                                  src={user.avatar_url}
                                  name={user.full_name}
                                  size="lg"
                                  clickable
                                  onClick={() => navigate(`/profile/${user.username}`)}
                                  className="mb-3"
                                />
                                <h3 
                                  className="font-semibold text-white mb-1 cursor-pointer hover:text-cyan-400 transition-colors"
                                  onClick={() => navigate(`/profile/${user.username}`)}
                                >
                                  {user.full_name}
                                </h3>
                                <p className="text-white/60 text-sm mb-3">@{user.username}</p>
                                <UserFollowButton
                                  userId={user.id}
                                  variant="primary"
                                  size="small"
                                  className="w-full"
                                  onFollowChange={(isFollowing) => handleFollowStatusChange(user.id, isFollowing)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Post grid */}
                    {posts.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold text-white">
                            {searchQuery ? 'Posts' : tagQuery ? `#${tagQuery}` : 'Trending Posts'}
                          </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {formattedPosts.map(post => (
                            <PostCard
                              key={post.id}
                              post={post}
                              variant="compact"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Trending hashtags - only on main explore page */}
                    {!searchQuery && !tagQuery && trending.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold text-white">Trending Hashtags</h2>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          {trending.map(tag => (
                            <Button
                              key={tag.id}
                              variant="secondary"
                              onClick={() => navigate(`/explore?tag=${tag.name}`)}
                            >
                              #{tag.name}
                              <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                                {tag.post_count}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
};

export default ExplorePage;