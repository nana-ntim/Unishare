// src/components/ui/FormComponents.jsx
//
// Consolidated form-related components
// Combines Button.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Button Component
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  ...props
}) => {
  // Base styles for all buttons
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50';
  
  // Variant styles - Instagram inspired
  const variantStyles = {
    primary: 'bg-neutral-100 hover:bg-neutral-200 text-black focus:ring-neutral-300',
    secondary: 'bg-[#262626] hover:bg-[#363636] text-white border border-[#363636] focus:ring-white/20',
    outline: 'bg-transparent border border-[#363636] hover:bg-[#1c1c1c] text-white focus:ring-white/20',
    text: 'bg-transparent hover:bg-[#1c1c1c] text-white focus:ring-white/20'
  };
  
  // Size styles with proper proportions
  const sizeStyles = {
    small: 'text-xs px-3 py-1.5',
    medium: 'text-sm px-4 py-2',
    large: 'text-base px-5 py-3'
  };
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';
  
  // Disabled styles
  const disabledStyles = (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : '';
  
  // Loading spinner - clean, minimalist design
  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  // Use motion.button for animations when not disabled
  const Component = (!disabled && !isLoading) ? motion.button : 'button';
  
  // Animation props only applied to non-disabled buttons
  const animationProps = (!disabled && !isLoading) ? {
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98, transition: { duration: 0.1 } }
  } : {};

  return (
    <Component
      type={type}
      disabled={disabled || isLoading}
      className={`
        ${baseStyles}
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.medium}
        ${widthStyles}
        ${disabledStyles}
        ${className}
      `}
      {...animationProps}
      {...props}
    >
      {isLoading && <LoadingSpinner />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {isLoading && loadingText ? loadingText : children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </Component>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'text']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  loadingText: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

// Export default component
export default Button;