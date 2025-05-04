// src/components/ui/UserSuggestion.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth';
import { useFollow, useFollowStatus } from '../../services/followService';
import Avatar from './Avatar';
import Button from './FormComponents';

/**
 * UserSuggestion Component
 * 
 * An elegant user suggestion component with consistent follow functionality:
 * - Clean, minimal design with proper spacing
 * - Leverages centralized follow service for consistent state
 * - Optimistic UI updates with proper error handling
 * - Multiple display variants for different contexts
 * 
 * @param {Object} props
 * @param {Object} props.user - User object with id, username, full_name, avatar_url
 * @param {string} props.variant - Display variant (compact, profile, card)
 * @param {string} props.className - Additional CSS classes
 */
const UserSuggestion = ({
  user,
  variant = 'compact',
  className = ''
}) => {
  // Hooks
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { toggleFollow } = useFollow();
  const { following: isFollowing, loading: followLoading } = useFollowStatus(user?.id);
  
  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Skip rendering if no user data
  if (!user) return null;
  
  // Variant-specific styles
  const variantStyles = {
    compact: 'flex items-center justify-between py-2',
    profile: 'flex flex-col items-center text-center p-4 bg-white/5 border border-white/10 rounded-lg',
    card: 'flex items-center p-4 bg-white/5 border border-white/10 rounded-lg'
  };
  
  // Handle following/unfollowing
  const handleFollowToggle = async () => {
    if (!currentUser || !user.id || currentUser.id === user.id || followLoading || isSubmitting) return;
    
    setIsSubmitting(true);
    await toggleFollow(user.id);
    setIsSubmitting(false);
  };
  
  // Navigate to user profile
  const goToProfile = () => {
    navigate(`/profile/${user.username}`);
  };
  
  // Compact variant (list item)
  if (variant === 'compact') {
    return (
      <div className={`${variantStyles.compact} ${className}`}>
        {/* User info */}
        <div className="flex items-center cursor-pointer" onClick={goToProfile}>
          <Avatar
            src={user.avatar_url}
            name={user.full_name || user.username}
            size="sm"
            className="mr-3"
          />
          <div className="min-w-0">
            <p className="font-medium text-white text-sm truncate">{user.full_name || user.username}</p>
            <p className="text-white/60 text-xs truncate">@{user.username}</p>
          </div>
        </div>
        
        {/* Follow button */}
        {currentUser?.id !== user.id && (
          <Button
            variant={isFollowing ? "secondary" : "primary"}
            size="small"
            onClick={handleFollowToggle}
            disabled={followLoading || isSubmitting}
          >
            {followLoading || isSubmitting ? '...' : isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>
    );
  }
  
  // Profile variant (card)
  if (variant === 'profile') {
    return (
      <motion.div 
        className={`${variantStyles.profile} ${className}`}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
      >
        {/* Avatar */}
        <div className="mb-3 cursor-pointer" onClick={goToProfile}>
          <Avatar
            src={user.avatar_url}
            name={user.full_name || user.username}
            size="xl"
          />
        </div>
        
        {/* User info */}
        <div className="mb-3 text-center min-w-0">
          <p 
            className="font-semibold text-white mb-1 truncate cursor-pointer hover:text-cyan-400 transition-colors"
            onClick={goToProfile}
          >
            {user.full_name || user.username}
          </p>
          <p className="text-white/60 text-sm truncate">@{user.username}</p>
          {user.university && (
            <p className="text-white/50 text-xs mt-1 truncate">{user.university}</p>
          )}
        </div>
        
        {/* Follow button */}
        {currentUser?.id !== user.id && (
          <Button
            variant={isFollowing ? "secondary" : "primary"}
            size="small"
            fullWidth
            onClick={handleFollowToggle}
            disabled={followLoading || isSubmitting}
          >
            {followLoading || isSubmitting ? '...' : isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </motion.div>
    );
  }
  
  // Card variant (horizontal)
  return (
    <div className={`${variantStyles.card} ${className}`}>
      {/* User info */}
      <div className="flex items-center flex-1 min-w-0 cursor-pointer" onClick={goToProfile}>
        <Avatar
          src={user.avatar_url}
          name={user.full_name || user.username}
          size="md"
          className="mr-3"
        />
        <div>
          <p className="font-medium text-white hover:text-cyan-400 transition-colors truncate">{user.full_name || user.username}</p>
          <p className="text-white/60 text-sm truncate">@{user.username}</p>
          {user.university && (
            <p className="text-white/50 text-xs mt-0.5 truncate">{user.university}</p>
          )}
        </div>
      </div>
      
      {/* Follow button */}
      {currentUser?.id !== user.id && (
        <Button
          variant={isFollowing ? "secondary" : "primary"}
          size="small"
          onClick={handleFollowToggle}
          disabled={followLoading || isSubmitting}
        >
          {followLoading || isSubmitting ? '...' : isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
};

UserSuggestion.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    full_name: PropTypes.string,
    avatar_url: PropTypes.string,
    university: PropTypes.string
  }).isRequired,
  variant: PropTypes.oneOf(['compact', 'profile', 'card']),
  className: PropTypes.string
};

export default UserSuggestion;