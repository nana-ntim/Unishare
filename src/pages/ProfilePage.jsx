// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import AppLayout from '../components/layout/AppLayout';
import PostCard from '../components/ui/PostCard';
import Button from '../components/ui/FormComponents';
import Avatar from '../components/ui/Avatar';

/**
 * ProfilePage Component
 * 
 * Clean, streamlined profile page with:
 * - User details and bio
 * - Posts display
 * - Follow functionality
 * - Responsive layout
 */
const ProfilePage = () => {
  // Get route parameters and auth context
  const { username } = useParams();
  const { user, profile: currentUserProfile } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(null); // 'followers' or 'following'
  const [modalUsers, setModalUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Determine if viewing own profile
  const isOwnProfile = username ? currentUserProfile?.username === username : true;
  
  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // If no username provided or it's the current user, use the current user's profile
        if (isOwnProfile && currentUserProfile) {
          setProfile(currentUserProfile);
          
          // Get followers count
          const { count: followersCount } = await supabase
            .from('follows')
            .select('follower_id', { count: 'exact' })
            .eq('following_id', currentUserProfile.id);
          
          setFollowersCount(followersCount || 0);
          
          // Get following count
          const { count: followingCount } = await supabase
            .from('follows')
            .select('following_id', { count: 'exact' })
            .eq('follower_id', currentUserProfile.id);
          
          setFollowingCount(followingCount || 0);
        } 
        // Otherwise fetch the requested user's profile
        else if (username) {
          // Get user profile by username
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            navigate('/404');
            return;
          }
          
          setProfile(profileData);
          
          // Get followers count
          const { count: followersCount } = await supabase
            .from('follows')
            .select('follower_id', { count: 'exact' })
            .eq('following_id', profileData.id);
          
          setFollowersCount(followersCount || 0);
          
          // Get following count
          const { count: followingCount } = await supabase
            .from('follows')
            .select('following_id', { count: 'exact' })
            .eq('follower_id', profileData.id);
          
          setFollowingCount(followingCount || 0);
          
          // Check if current user is following this profile
          if (user) {
            const { data: followData } = await supabase
              .from('follows')
              .select('id')
              .eq('follower_id', user.id)
              .eq('following_id', profileData.id)
              .single();
              
            setIsFollowing(!!followData);
          }
        }
      } catch (error) {
        console.error('Error in profile fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProfile();
    }
  }, [user, username, navigate, isOwnProfile, currentUserProfile]);
  
  // Load posts for the profile
  useEffect(() => {
    const fetchPosts = async () => {
      if (!profile?.id) return;
      
      try {
        const { data } = await supabase
          .from('post_details')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });
        
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    
    fetchPosts();
  }, [profile?.id]);
  
  // Load followers or following for modal
  const loadUsers = useCallback(async (type) => {
    if (!profile?.id || modalLoading) return;
    
    try {
      setModalLoading(true);
      
      if (type === 'followers') {
        // Get followers
        const { data } = await supabase
          .from('follows')
          .select(`
            follower:profiles!follows_follower_id_fkey (
              id, 
              username, 
              full_name, 
              avatar_url
            )
          `)
          .eq('following_id', profile.id)
          .order('created_at', { ascending: false });
        
        // Format follower data
        const formattedUsers = (data || []).map(item => ({
          ...item.follower
        }));
        
        setModalUsers(formattedUsers);
      } else {
        // Get following
        const { data } = await supabase
          .from('follows')
          .select(`
            following:profiles!follows_following_id_fkey (
              id, 
              username, 
              full_name, 
              avatar_url
            )
          `)
          .eq('follower_id', profile.id)
          .order('created_at', { ascending: false });
        
        // Format following data
        const formattedUsers = (data || []).map(item => ({
          ...item.following
        }));
        
        setModalUsers(formattedUsers);
      }
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
    } finally {
      setModalLoading(false);
    }
  }, [profile?.id, modalLoading]);
  
  // Open modal and load users
  const openModal = useCallback((type) => {
    if ((type === 'followers' && followersCount > 0) ||
        (type === 'following' && followingCount > 0)) {
      setModalOpen(type);
      loadUsers(type);
    }
  }, [followersCount, followingCount, loadUsers]);
  
  // Handle profile follow toggle
  const handleFollowToggle = useCallback(async () => {
    if (!profile?.id || followLoading) return;
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id,
            created_at: new Date().toISOString()
          });
      }
      
      // Update UI state
      setIsFollowing(!isFollowing);
      setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  }, [profile?.id, followLoading, isFollowing, user?.id]);
  
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
  
  // Navigate to settings page
  const goToSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);
  
  // Modal component for followers/following
  const UsersModal = () => {
    if (!modalOpen) return null;
    
    const title = modalOpen === 'followers' ? 'Followers' : 'Following';
    const emptyMessage = modalOpen === 'followers' ? 'No followers yet' : 'Not following anyone';
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(null)}></div>
        
        {/* Modal */}
        <div className="relative z-10 bg-black border border-white/10 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button 
              onClick={() => setModalOpen(null)}
              className="text-white/70 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-64px)]">
            {modalLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin"></div>
              </div>
            ) : modalUsers.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <p className="text-white/50">{emptyMessage}</p>
              </div>
            ) : (
              <div>
                {modalUsers.map(user => (
                  <div 
                    key={user.id} 
                    className="p-4 flex items-center hover:bg-white/5 transition-colors"
                  >
                    <div 
                      className="cursor-pointer"
                      onClick={() => {
                        navigate(`/profile/${user.username}`);
                        setModalOpen(null);
                      }}
                    >
                      <Avatar
                        src={user.avatar_url}
                        name={user.full_name || user.username}
                        size="md"
                      />
                    </div>
                    <div 
                      className="ml-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        navigate(`/profile/${user.username}`);
                        setModalOpen(null);
                      }}
                    >
                      <p className="font-semibold text-white truncate">{user.full_name || user.username}</p>
                      <p className="text-white/60 text-sm truncate">@{user.username}</p>
                    </div>
                    <Button 
                      variant="primary"
                      size="small"
                    >
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Loading state
  if (loading) {
    return (
      <AppLayout loading={true} />
    );
  }
  
  // Profile not found state
  if (!profile) {
    return (
      <AppLayout>
        <div className="py-12 text-center">
          <div className="glass p-8 rounded-xl max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500/20 to-amber-500/20 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">User Not Found</h2>
            <p className="text-white/60 mb-8">The profile you're looking for doesn't exist or has been removed.</p>
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
        {/* Profile header */}
        <div className="bg-black border border-white/10 rounded-xl overflow-hidden mb-6">
          {/* Cover image with gradient overlay */}
          <div className="h-40 bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-purple-900/40 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
          </div>
          
          {/* Profile info */}
          <div className="px-4 md:px-6 pb-6 -mt-16 relative">
            {/* Avatar and action buttons */}
            <div className="flex flex-wrap items-end justify-between mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar 
                  src={profile.avatar_url} 
                  name={profile.full_name || profile.username}
                  size="xl"
                  border
                />
              </motion.div>
              
              {/* Action button */}
              {isOwnProfile ? (
                <Button
                  variant="secondary"
                  onClick={goToSettings}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant={isFollowing ? "secondary" : "primary"}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                >
                  {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
            
            {/* User info */}
            <div className="mb-4">
              <h1 className="text-xl md:text-2xl font-bold text-white">{profile.full_name || profile.username}</h1>
              <p className="text-white/60">@{profile.username}</p>
            </div>
            
            {/* Bio */}
            {profile.bio && (
              <p className="text-white/80 mb-4 whitespace-pre-wrap">
                {profile.bio.split(/(#\w+)/g).map((part, index) => 
                  part.startsWith('#') ? (
                    <span key={index} className="text-cyan-400 hover:underline cursor-pointer">
                      {part}
                    </span>
                  ) : part
                )}
              </p>
            )}
            
            {/* University and links */}
            <div className="flex flex-wrap items-center text-sm text-white/60 mb-5 gap-y-2">
              {profile.university && (
                <div className="flex items-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                  {profile.university}
                </div>
              )}
              
              {profile.website && (
                <div className="flex items-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
              <div className="flex flex-col items-center justify-center p-4 glass hover:bg-white/10 transition-colors">
                <p className="text-xl font-bold text-white">{posts.length}</p>
                <p className="text-xs text-white/60">Posts</p>
              </div>
              
              <button 
                className="flex flex-col items-center justify-center p-4 glass hover:bg-white/10 transition-colors"
                onClick={() => openModal('followers')}
                disabled={followersCount === 0}
              >
                <p className="text-xl font-bold text-white">{followersCount}</p>
                <p className="text-xs text-white/60">Followers</p>
              </button>
              
              <button 
                className="flex flex-col items-center justify-center p-4 glass hover:bg-white/10 transition-colors"
                onClick={() => openModal('following')}
                disabled={followingCount === 0}
              >
                <p className="text-xl font-bold text-white">{followingCount}</p>
                <p className="text-xs text-white/60">Following</p>
              </button>
            </div>
          </div>
        </div>
        
        {/* Content - Posts */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Posts</h2>
          
          {formattedPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {formattedPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  variant="compact"
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white/5 border border-white/10 rounded-xl">
              <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {isOwnProfile ? "You haven't posted anything yet" : "This user hasn't posted anything yet"}
              </h3>
              
              {isOwnProfile && (
                <div className="mt-4">
                  <Button 
                    variant="primary"
                    onClick={() => navigate('/create')}
                  >
                    Create Your First Post
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Followers/Following Modal */}
        <AnimatePresence>
          {modalOpen && <UsersModal />}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;