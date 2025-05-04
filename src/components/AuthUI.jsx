// src/components/auth/components/AuthUI.jsx
//
// Shared UI elements for authentication screens
// Provides consistent styling and behavior across auth components

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * AuthContainer - Main container for auth screens
 */
export const AuthContainer = ({ children, isLoaded = true }) => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden">
    <div className={`
      w-full max-w-md
      transition-all duration-700 ease-out
      ${isLoaded ? 'opacity-100' : 'opacity-0 translate-y-4'}
    `}>
      {children}
    </div>
  </div>
);

/**
 * AuthLogo - Animated logo for auth screens
 */
export const AuthLogo = () => (
  <motion.div 
    className="text-4xl font-serif italic text-center mb-8"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
      UniShare
    </span>
  </motion.div>
);

/**
 * AuthCard - Container for auth forms
 */
export const AuthCard = ({ children }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
    {children}
  </div>
);

/**
 * AuthTitle - Title and subtitle for auth screens
 */
export const AuthTitle = ({ title, subtitle, icon = null }) => (
  <div className="text-center mb-6">
    {icon && (
      <div className="flex justify-center mb-4">
        {icon}
      </div>
    )}
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    {subtitle && <p className="text-white/70">{subtitle}</p>}
  </div>
);

/**
 * AuthInput - Styled input field for auth forms
 */
export const AuthInput = ({ 
  id, 
  label, 
  type = 'text',
  placeholder, 
  value, 
  onChange, 
  error = null,
  icon = null,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const actualType = type === 'password' && showPassword ? 'text' : type;
  
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-white/80 text-sm mb-1 font-medium">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={actualType}
          value={value}
          onChange={onChange}
          className={`w-full bg-white/5 border-b-2 rounded-lg ${icon ? 'pl-10' : 'pl-4'} pr-${type === 'password' ? '10' : '4'} py-3 text-white 
            focus:outline-none transition-all duration-300
            group-hover:bg-white/10 placeholder-white/40
            ${error ? 'border-red-500' : 'border-white/20 focus:border-cyan-400'}`}
          placeholder={placeholder}
          {...props}
        />
        <div className={`absolute bottom-0 left-0 h-[2px] w-0 
          transition-all duration-300 group-hover:w-1/4 group-focus-within:w-full rounded-full
          ${error ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}></div>
        
        {type === 'password' && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-1 text-red-400 text-xs"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

/**
 * AuthButton - Styled button for auth forms
 */
export const AuthButton = ({ 
  children, 
  isLoading = false, 
  loadingText = 'Loading...',
  ...props 
}) => (
  <motion.button
    whileHover={{ scale: isLoading ? 1 : 1.02 }}
    whileTap={{ scale: isLoading ? 1 : 0.98 }}
    className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white 
      rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all focus:outline-none 
      focus:ring-2 focus:ring-cyan-400/50 focus:ring-opacity-50 disabled:opacity-70"
    {...props}
  >
    {isLoading ? (
      <div className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{loadingText}</span>
      </div>
    ) : children}
  </motion.button>
);

/**
 * AuthLinkButton - Styled link button for auth forms
 */
export const AuthLinkButton = ({ 
  children, 
  ...props 
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="w-full py-3 px-4 bg-transparent border border-white/20 text-white 
      rounded-lg hover:bg-white/5 transition-all focus:outline-none"
    {...props}
  >
    {children}
  </motion.button>
);

/**
 * AuthError - Error message for auth forms
 */
export const AuthError = ({ error }) => {
  if (!error) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
    >
      <p className="text-red-400 text-sm">{error}</p>
    </motion.div>
  );
};

/**
 * AuthSuccess - Success message for auth forms
 */
export const AuthSuccess = ({ message }) => {
  if (!message) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
    >
      <p className="text-green-400 text-sm">{message}</p>
    </motion.div>
  );
};

/**
 * AuthInfo - Info message for auth forms
 */
export const AuthInfo = ({ children }) => (
  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 mb-6">
    <p className="text-white/90 text-sm">{children}</p>
  </div>
);

/**
 * AuthFooter - Footer with copyright text
 */
export const AuthFooter = () => (
  <div className="mt-8 text-center text-sm text-white/50">
    <p>© {new Date().getFullYear()} UniShare. All rights reserved.</p>
  </div>
);

/**
 * AuthDivider - Divider with optional text
 */
export const AuthDivider = ({ text = 'or' }) => (
  <div className="flex items-center my-4">
    <div className="flex-1 h-px bg-white/10"></div>
    {text && <div className="px-3 text-white/40 text-sm">{text}</div>}
    <div className="flex-1 h-px bg-white/10"></div>
  </div>
);

/**
 * AuthLink - Styled link for auth pages
 */
export const AuthLink = ({ to, children }) => (
  <Link to={to} className="text-cyan-400 hover:text-cyan-300 transition-colors">
    {children}
  </Link>
);

/**
 * LoadingSpinner - Simple loading spinner
 */
export const LoadingSpinner = ({ size = 'md', color = 'cyan' }) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size] || 'h-8 w-8';
  
  const colorClass = {
    cyan: 'text-cyan-500',
    white: 'text-white',
    blue: 'text-blue-500'
  }[color] || 'text-cyan-500';
  
  return (
    <svg className={`animate-spin ${sizeClass} ${colorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
};

/**
 * PasswordStrengthIndicator - Visual indicator for password strength
 */
export const PasswordStrengthIndicator = ({ password }) => {
  // Calculate password strength (0-5)
  const getStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };
  
  const strength = getStrength(password);
  
  // Get label and color based on strength
  const getLabel = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
      case 3:
        return 'Medium';
      case 4:
      case 5:
        return 'Strong';
      default:
        return 'Weak';
    }
  };
  
  const getColor = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
      case 3:
        return 'bg-yellow-500';
      case 4:
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-red-500';
    }
  };
  
  const label = getLabel(strength);
  const color = getColor(strength);
  
  if (!password) return null;
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/60">Password Strength:</span>
        <span className={`text-xs ${
          label === 'Strong' ? 'text-green-400' : 
          label === 'Medium' ? 'text-yellow-400' : 
          'text-red-400'
        }`}>{label}</span>
      </div>
      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-300`}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
      <ul className="mt-1 text-xs text-white/60 space-y-1">
        <li className={password.length >= 8 ? 'text-green-400' : ''}>
          • At least 8 characters
        </li>
        <li className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>
          • At least 1 uppercase letter
        </li>
        <li className={/[a-z]/.test(password) ? 'text-green-400' : ''}>
          • At least 1 lowercase letter
        </li>
        <li className={/[0-9]/.test(password) ? 'text-green-400' : ''}>
          • At least 1 number
        </li>
        <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-400' : ''}>
          • At least 1 special character
        </li>
      </ul>
    </div>
  );
};