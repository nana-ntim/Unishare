// src/components/ui/UserFollowButton.jsx
import React, { useState } from 'react';
import { useFollowStatus } from '../../services/followService';
import Button from './FormComponents';

/**
 * UserFollowButton - Reusable component for follow/unfollow functionality
 * 
 * @param {Object} props - Component props
 * @param {string} props.userId - ID of the user to follow/unfollow
 * @param {string} [props.variant='primary'] - Button variant ('primary' or 'secondary')
 * @param {string} [props.size='default'] - Button size ('small', 'default', or 'large')
 * @param {Function} [props.onFollowChange] - Callback when follow status changes
 * @param {boolean} [props.showState=true] - Whether to show "Following" text when followed
 */
const UserFollowButton = ({ 
  userId,
  variant = 'primary',
  size = 'default',
  onFollowChange,
  showState = true,
  ...props
}) => {
  // Use the hook to get follow status and actions
  const { following, loading, toggleFollow } = useFollowStatus(userId);
  
  // Local loading state to handle UI during action
  const [actionLoading, setActionLoading] = useState(false);
  
  // Choose button text based on status and props
  const getButtonText = () => {
    if (actionLoading) {
      return 'Loading...';
    }
    
    if (following && showState) {
      return 'Following';
    }
    
    return 'Follow';
  };
  
  // Handle follow action
  const handleFollowAction = async () => {
    if (loading || actionLoading || !userId) return;
    
    try {
      setActionLoading(true);
      
      // Call the toggle function from the hook
      const result = await toggleFollow();
      
      // Call the callback if provided
      if (onFollowChange && result.success) {
        onFollowChange(!following);
      }
    } catch (error) {
      console.error('Error in follow action:', error);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Determine button variant
  const buttonVariant = following && showState ? 'secondary' : variant;
  
  return (
    <Button
      variant={buttonVariant}
      size={size}
      onClick={handleFollowAction}
      disabled={loading || actionLoading}
      {...props}
    >
      {getButtonText()}
    </Button>
  );
};

export default UserFollowButton;