// src/components/layout/AuthGuard.jsx
//
// Premium AuthGuard component with enhanced loading animations
// Features glass morphism aesthetics and smooth transitions
// Inspired by Somewhere Good, Glass, Polywork, Nike and Apple design

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/animations.css';

/**
 * Premium Loading Component
 * 
 * Displays an enhanced loading animation with glass morphism aesthetics
 */
const PremiumLoading = () => (
  <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
    {/* Background blur effects */}
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[120px] opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[30vw] h-[30vw] rounded-full bg-cyan-600/10 blur-[100px] opacity-40"></div>
    </div>
    
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 flex flex-col items-center"
    >
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-serif italic mb-8"
      >
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
          UniShare
        </span>
      </motion.div>
      
      {/* Premium animated loader */}
      <div className="relative w-20 h-20 mb-6">
        {/* Outer ring */}
        <motion.div 
          animate={{ 
            rotate: 360,
            boxShadow: ['0 0 0 rgba(34, 211, 238, 0)', '0 0 20px rgba(34, 211, 238, 0.3)', '0 0 0 rgba(34, 211, 238, 0)'],
          }}
          transition={{ 
            rotate: { duration: 8, ease: "linear", repeat: Infinity },
            boxShadow: { duration: 2, repeat: Infinity }
          }}
          className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
        />
        
        {/* Middle ring */}
        <motion.div 
          animate={{ 
            rotate: -360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 6, ease: "linear", repeat: Infinity },
            scale: { duration: 3, repeat: Infinity }
          }}
          className="absolute inset-[15%] rounded-full border-2 border-cyan-500/40"
        />
        
        {/* Inner spinner */}
        <motion.div 
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            duration: 1.5, 
            ease: "linear", 
            repeat: Infinity 
          }}
          className="absolute inset-[35%] flex justify-center items-center"
        >
          <svg className="w-full h-full text-cyan-400" viewBox="0 0 24 24">
            <motion.path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="60"
              strokeDashoffset="60"
              fill="none"
              animate={{ strokeDashoffset: [60, 0, 60] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </svg>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="glass-reveal bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-8 py-4 shadow-xl"
      >
        <motion.p 
          animate={{ 
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity 
          }}
          className="text-white/80"
        >
          Authenticating your experience...
        </motion.p>
      </motion.div>
    </motion.div>
  </div>
);

/**
 * Enhanced NotVerified Component
 * 
 * Displays a premium UI for users who need to verify their email
 */
const NotVerified = () => (
  <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
    {/* Background blur effects */}
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-amber-600/10 blur-[120px] opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[30vw] h-[30vw] rounded-full bg-orange-600/10 blur-[100px] opacity-40"></div>
    </div>
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 max-w-md w-full mx-4"
    >
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8 shadow-xl">
        <div className="flex justify-center mb-6">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "mirror"
            }}
            className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.div>
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">Email Verification Required</h2>
        <p className="text-white/70 text-center mb-6">
          Please verify your email address to access this page. Check your inbox for a verification link.
        </p>
        <motion.div
          className="flex justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <a 
            href="/verify-email" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-medium shadow-lg shadow-amber-500/20"
          >
            Go to Verification Page
          </a>
        </motion.div>
      </div>
    </motion.div>
  </div>
);

/**
 * AuthGuard component - Premium version
 * 
 * Protects routes by checking authentication status
 * Features enhanced loading animations and transitions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {boolean} props.requireVerification - Whether email verification is required
 */
export function AuthGuard({ children, requireVerification = true }) {
  const { isAuthenticated, isVerified, isLoading, user } = useAuth();
  const location = useLocation();

  // Debug info for development
  if (process.env.NODE_ENV === 'development') {
    console.log('AuthGuard:', { 
      isAuthenticated, 
      isVerified, 
      isLoading,
      requireVerification,
      path: location.pathname,
      user: user?.email
    });
  }

  // Show enhanced loading state while checking auth
  if (isLoading) {
    return <PremiumLoading />;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if email verification is required and user is not verified
  if (requireVerification && !isVerified) {
    return <NotVerified />;
  }

  // User is authenticated (and verified if required), render children
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default AuthGuard;