// src/components/ui/Avatar.jsx
//
// Instagram-inspired Avatar component with modern aesthetics
// Provides clean circular user representation with perfect sizing

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Avatar Component
 * 
 * A premium avatar component with Instagram aesthetics:
 * - Clean, modern circular design
 * - Intelligent fallbacks for missing images
 * - Proper scaling and proportions
 * - Optional animations and indicators
 * 
 * @param {Object} props
 * @param {string} props.src - Image URL
 * @param {string} props.alt - Alternative text for accessibility
 * @param {string} props.name - User name for initials fallback
 * @param {string} props.size - Avatar size (xs, sm, md, lg, xl, 2xl)
 * @param {string} props.status - User status (online, offline, away, busy)
 * @param {boolean} props.isActive - Whether to show active status ring
 * @param {boolean} props.border - Whether to show border
 * @param {boolean} props.clickable - Whether avatar is clickable
 * @param {string} props.className - Additional classes
 */
const Avatar = ({
  src,
  alt,
  name = '',
  size = 'md',
  status,
  isActive = false,
  border = false,
  clickable = false,
  className = '',
  ...props
}) => {
  // State to handle image loading failures
  const [imageError, setImageError] = useState(false);
  
  // Get initials from name
  const getInitials = () => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Instagram-inspired size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-32 h-32 text-2xl'
  };
  
  // Status indicator styles - Instagram colors
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-400',
    busy: 'bg-red-500'
  };
  
  // Status indicator size relative to avatar size
  const statusSize = (size === 'xs' || size === 'sm') 
    ? 'w-2 h-2' 
    : 'w-3 h-3';
  
  // Border styles
  const borderStyles = border 
    ? 'ring-1 ring-[#363636]' 
    : '';
    
  // Active status styles - Instagram story ring
  const activeStyles = isActive 
    ? 'ring-2 ring-offset-black ring-offset-2 ring-gradient-to-br from-purple-500 via-pink-500 to-yellow-500' 
    : '';
  
  // Determine if we should use motion.div for animations
  const Component = clickable ? motion.div : 'div';
  
  // Animation props for clickable avatars
  const animationProps = clickable ? {
    whileHover: { scale: 1.05, transition: { duration: 0.2 } },
    whileTap: { scale: 0.95, transition: { duration: 0.1 } }
  } : {};
  
  return (
    <Component 
      className={`relative inline-flex ${className}`}
      {...animationProps}
      {...props}
    >
      <div
        className={`
          ${sizeClasses[size] || sizeClasses.md}
          rounded-full overflow-hidden flex items-center justify-center
          ${borderStyles}
          ${activeStyles}
          ${clickable ? 'cursor-pointer' : ''}
          bg-[#262626]
        `}
      >
        {/* Image if available and no loading error */}
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          /* Fallback to initials */
          <div className="w-full h-full bg-gradient-to-br from-purple-600/40 to-blue-600/40 flex items-center justify-center text-white font-medium">
            {getInitials()}
          </div>
        )}
      </div>
      
      {/* Status indicator */}
      {status && (
        <div
          className={`
            absolute bottom-0 right-0 
            ${statusSize}
            ${statusColors[status] || 'bg-gray-400'}
            rounded-full ring-2 ring-black
          `}
          aria-hidden="true"
        />
      )}
      
      {/* Active indicator (for Instagram-style stories) */}
      {isActive && (
        <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full opacity-0" />
      )}
    </Component>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  status: PropTypes.oneOf(['online', 'offline', 'away', 'busy']),
  isActive: PropTypes.bool,
  border: PropTypes.bool,
  clickable: PropTypes.bool,
  className: PropTypes.string
};

export default Avatar;