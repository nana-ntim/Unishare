// src/components/home/SuggestedSection.jsx
//
// Premium SuggestedSection component for HomePage
// Displays trending topics and suggested users

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import TrendingCard from '../ui/TrendingCard';
import UserSuggestion from '../ui/UserSuggestion';

/**
 * SuggestedUsers Component
 * 
 * Elegant component for displaying user suggestions
 */
const SuggestedUsers = ({ users = [], loading = false, onFollowToggle }) => {
  // Skip rendering if there are no suggestions
  if (!loading && users.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card className="mt-6">
        <div className="p-5">
          <h3 className="text-sm font-medium text-white/90 mb-4">Suggested Connections</h3>
          
          <div className="space-y-3">
            {loading ? (
              // Loading skeletons
              [...Array(3)].map((_, index) => (
                <div key={`skeleton-user-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
                    <div className="ml-3 space-y-1">
                      <div className="h-3 w-24 bg-white/10 rounded animate-pulse"></div>
                      <div className="h-2 w-16 bg-white/10 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-white/10 rounded animate-pulse"></div>
                </div>
              ))
            ) : (
              // Actual suggested users
              users.map((user) => (
                <UserSuggestion
                  key={user.id}
                  user={user}
                  variant="compact"
                  onFollow={onFollowToggle}
                />
              ))
            )}
          </div>
          
          {users.length > 0 && (
            <Link 
              to="/explore" 
              className="block text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors mt-4"
            >
              View More
            </Link>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

/**
 * SuggestedSection Component
 * 
 * Premium sidebar section with trending topics and user suggestions:
 * - Clean, elegant design with consistent aesthetics
 * - Optimized rendering for better performance
 * 
 * @param {Object} props
 * @param {Array} props.trendingTopics - Array of trending topics/hashtags
 * @param {Array} props.suggestedUsers - Array of suggested user objects
 * @param {boolean} props.loading - Whether content is loading
 * @param {Function} props.onTagSelect - Function called when a tag is selected
 * @param {Function} props.onFollowUser - Function called when follow button is clicked
 */
const SuggestedSection = ({
  trendingTopics = [],
  suggestedUsers = [],
  loading = false,
  onTagSelect,
  onFollowUser
}) => {
  return (
    <div>
      {/* User welcome card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <div className="p-5">
            <div className="flex items-center">
              <div className="mr-3">
                <Avatar 
                  src="/api/placeholder/100/100"
                  size="lg"
                  border
                />
              </div>
              <div>
                <p className="text-white/60 text-sm">Welcome back,</p>
                <h3 className="text-white font-bold text-lg">Friend</h3>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-center space-x-2">
              <Link to="/create" className="flex-1">
                <Button 
                  variant="primary" 
                  size="sm"
                  fullWidth
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Create
                </Button>
              </Link>
              
              <Link to="/profile" className="flex-1">
                <Button 
                  variant="secondary" 
                  size="sm"
                  fullWidth
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                >
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-6"
      >
        <TrendingCard 
          title="What's Trending"
          hashtags={trendingTopics.filter(tag => tag.type === 'hashtag')}
          topics={trendingTopics.filter(tag => tag.type === 'topic')}
          onTagSelect={onTagSelect}
          variant="mixed"
        />
      </motion.div>
      
      {/* Suggested Users */}
      <SuggestedUsers 
        users={suggestedUsers}
        loading={loading}
        onFollowToggle={onFollowUser}
      />
      
      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-6 text-white/40 text-xs px-2"
      >
        <div className="flex flex-wrap gap-2">
          <Link to="#" className="hover:text-white/60 transition-colors">About</Link>
          <span>•</span>
          <Link to="#" className="hover:text-white/60 transition-colors">Privacy</Link>
          <span>•</span>
          <Link to="#" className="hover:text-white/60 transition-colors">Terms</Link>
          <span>•</span>
          <Link to="#" className="hover:text-white/60 transition-colors">Help</Link>
        </div>
        <p className="mt-2">© 2025 UniShare. All rights reserved.</p>
      </motion.div>
    </div>
  );
};

// Optimize with memo
export default memo(SuggestedSection);