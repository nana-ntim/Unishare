// src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import AppLayout from '../components/layout/AppLayout';
import PostCard from '../components/ui/PostCard';
import Button from '../components/ui/FormComponents';
import Avatar from '../components/ui/Avatar';

/**
 * HomePage Component
 * 
 * Unified, streamlined homepage with:
 * - Feed tabs (Following, Discover, University)
 * - Responsive layout with sidebar for large screens
 * - Suggested users and trending topics
 */
const HomePage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState('following');
  const [posts, setPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  
  // Detect screen size
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial detection
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Tabs configuration
  const tabs = [
    { id: 'following', label: 'Following' },
    { id: 'discover', label: 'For You' },
    { id: 'university', label: 'University' }
  ];
  
  // Load feed data
  useEffect(() => {
    const fetchFeed = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Different query based on active tab
        let query;
        
        if (activeTab === 'following') {
          // Get posts from users that the current user follows
          const { data: followingData } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);
          
          // Extract the IDs of followed users
          const followingIds = followingData ? followingData.map(item => item.following_id) : [];
          
          // Include the user's own posts in the feed
          followingIds.push(user.id);
          
          if (followingIds.length === 0) {
            setPosts([]);
            setLoading(false);
            return;
          }
          
          // Query posts from these users
          query = supabase
            .from('post_details')
            .select('*')
            .in('user_id', followingIds)
            .order('created_at', { ascending: false })
            .limit(10);
        } else if (activeTab === 'university' && profile?.university) {
          // Get posts from users at the same university
          query = supabase
            .from('post_details')
            .select('*')
            .eq('university', profile.university)
            .order('created_at', { ascending: false })
            .limit(10);
        } else {
          // Discover tab - get popular posts
          query = supabase
            .from('post_details')
            .select('*')
            .order('likes_count', { ascending: false })
            .limit(10);
        }
        
        const { data: postsData } = await query;
        setPosts(postsData || []);
      } catch (error) {
        console.error('Error fetching feed:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeed();
  }, [user, profile, activeTab]);
  
  // Load sidebar content
  useEffect(() => {
    const fetchSidebar = async () => {
      if (!user) return;
      
      try {
        setSidebarLoading(true);
        
        // Fetch users to follow
        const { data: followingIds } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        // Create an array of IDs to exclude from suggestions (user's own ID + followed IDs)
        const excludeIds = [user.id, ...(followingIds?.map(f => f.following_id) || [])];
        
        const { data: usersData } = await supabase
          .from('profiles')
          .select('*')
          .not('id', 'in', `(${excludeIds.join(',')})`)
          .limit(5);
          
        setSuggestedUsers(usersData || []);
        
        // Fetch trending hashtags
        const { data: hashtagsData } = await supabase
          .from('trending_hashtags')
          .select('*')
          .order('post_count', { ascending: false })
          .limit(5);
          
        setTrendingTopics(hashtagsData || []);
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setSidebarLoading(false);
      }
    };
    
    fetchSidebar();
  }, [user]);
  
  // Handle following a user
  const handleFollowUser = useCallback(async (userId) => {
    if (!user) return;
    
    try {
      await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
          created_at: new Date().toISOString()
        });
      
      // Update UI optimistically by removing from suggestions
      setSuggestedUsers(prev => 
        prev.filter(u => u.id !== userId)
      );
    } catch (error) {
      console.error('Error following user:', error);
    }
  }, [user]);
  
  // Handle selecting a hashtag
  const handleTagSelect = useCallback((tagName) => {
    navigate(`/explore?tag=${tagName}`);
  }, [navigate]);
  
  // Format posts for PostCard component
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
  
  // Empty feed component
  const EmptyFeed = () => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
      <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-white mb-2">Your feed is empty</h3>
      <p className="text-white/60 mb-6 max-w-md mx-auto">
        {activeTab === 'following' 
          ? "Start following people to see their posts in your feed" 
          : activeTab === 'university' 
            ? "No posts from your university yet" 
            : "Discover new content and people to follow"}
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button 
          variant="primary"
          onClick={() => navigate('/explore')}
        >
          Explore Content
        </Button>
        
        <Button 
          variant="secondary"
          onClick={() => navigate('/create')}
        >
          Create Post
        </Button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content column */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-6 overflow-x-auto hide-scrollbar">
              <div className="flex space-x-1 min-w-max">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Feed */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {loading ? (
                  // Loading skeleton
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={`skeleton-${i}`} className="bg-white/5 border border-white/10 rounded-xl p-0 overflow-hidden animate-pulse">
                        <div className="p-4 flex items-center border-b border-white/5">
                          <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                          <div className="ml-3 space-y-1">
                            <div className="h-3 w-24 bg-white/10 rounded"></div>
                            <div className="h-2 w-16 bg-white/10 rounded"></div>
                          </div>
                        </div>
                        <div className="h-96 bg-white/5"></div>
                        <div className="p-4">
                          <div className="h-4 w-full bg-white/10 rounded mb-2"></div>
                          <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : formattedPosts.length === 0 ? (
                  // Empty feed state
                  <EmptyFeed />
                ) : (
                  // Posts feed
                  <div className="space-y-6">
                    {formattedPosts.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={post}
                      />
                    ))}
                    
                    {/* Load more button */}
                    {formattedPosts.length >= 10 && (
                      <div className="text-center py-4">
                        <Button variant="secondary">
                          Load More
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Sidebar - hidden on mobile */}
          <div className="hidden lg:block space-y-6">
            {/* User profile card */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6">
              <div className="p-4 flex items-center">
                <Link to="/profile">
                  <Avatar
                    src={profile?.avatar_url}
                    name={profile?.full_name || user?.email}
                    size="lg"
                    border
                  />
                </Link>
                <div className="ml-3">
                  <Link to="/profile" className="block text-white font-bold hover:text-cyan-400 transition-colors">
                    {profile?.full_name || 'User'}
                  </Link>
                  <p className="text-neutral-400 text-sm">@{profile?.username || 'username'}</p>
                </div>
                <Link to="/profile" className="ml-auto text-sm text-cyan-400 hover:text-cyan-300">
                  View
                </Link>
              </div>
            </div>
            
            {/* Suggested users */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6">
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-medium text-white">Suggested for you</h3>
                <Link to="/explore" className="text-sm text-cyan-400">See All</Link>
              </div>
              
              <div className="p-4">
                {sidebarLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center animate-pulse">
                        <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                        <div className="ml-3 flex-1">
                          <div className="h-3 w-24 bg-white/10 rounded"></div>
                          <div className="h-2 w-16 bg-white/10 rounded mt-1"></div>
                        </div>
                        <div className="w-16 h-8 bg-white/10 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestedUsers.slice(0, 3).map(user => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => navigate(`/profile/${user.username}`)}
                        >
                          <Avatar
                            src={user.avatar_url}
                            name={user.full_name || user.username}
                            size="sm"
                          />
                          <div className="ml-3 min-w-0">
                            <p className="font-medium text-white text-sm truncate">{user.full_name || user.username}</p>
                            <p className="text-white/60 text-xs truncate">@{user.username}</p>
                          </div>
                        </div>
                        
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleFollowUser(user.id)}
                        >
                          Follow
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Trending topics */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-medium text-white">Trending Hashtags</h3>
              </div>
              
              <div className="p-4">
                {sidebarLoading ? (
                  <div className="flex flex-wrap gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-8 w-20 bg-white/10 rounded-full animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {trendingTopics.map(tag => (
                      <Button 
                        key={tag.id}
                        variant="secondary"
                        size="small"
                        onClick={() => handleTagSelect(tag.name)}
                      >
                        #{tag.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-neutral-500 text-xs">
              <div className="flex flex-wrap gap-x-2 gap-y-1 mb-2">
                <Link to="#" className="hover:text-neutral-300">About</Link>
                <Link to="#" className="hover:text-neutral-300">Help</Link>
                <Link to="#" className="hover:text-neutral-300">Privacy</Link>
                <Link to="#" className="hover:text-neutral-300">Terms</Link>
              </div>
              <p>© 2025 UniShare</p>
            </div>
          </div>
        </div>
        
        {/* Mobile: Suggested users row (horizontal scrolling) - only shown on mobile */}
        {isMobile && suggestedUsers.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-white">Suggested for you</h3>
              <Link to="/explore" className="text-sm text-cyan-400">See All</Link>
            </div>
            
            <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
              {suggestedUsers.map(user => (
                <div 
                  key={user.id} 
                  className="flex-shrink-0 w-32 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center"
                >
                  <Avatar
                    src={user.avatar_url}
                    name={user.full_name || user.username}
                    size="md"
                    className="mb-2"
                    onClick={() => navigate(`/profile/${user.username}`)}
                  />
                  <p className="text-white text-sm font-medium truncate w-full text-center">
                    {user.full_name || user.username}
                  </p>
                  <p className="text-white/60 text-xs truncate w-full text-center mb-2">
                    @{user.username}
                  </p>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleFollowUser(user.id)}
                    fullWidth
                  >
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Custom scrollbar styles */}
      <style jsx="true">{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </AppLayout>
  );
};

export default HomePage;