// src/components/UniSharePage.jsx
//
// Premium UniSharePage component with glass morphism aesthetics
// Features smooth animations, parallax effects, and premium styling
// Inspired by Somewhere Good, Glass, Polywork, Nike and Apple design

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { validateLoginForm, validateSignupForm } from '../utils/validation';
import '../styles/animations.css'; // Import custom animations

/**
 * Premium UniSharePage Component
 * 
 * Enhanced landing page with login/signup functionality
 * Features glass morphism, premium animations, and a luxury feel
 */
const UniSharePage = () => {
  // States for handling form data and UI
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  
  // Auth context
  const { signIn, signUp, authError, isAuthenticated } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Reset form when tab changes
  useEffect(() => {
    setEmail('');
    setPassword('');
    setFullName('');
    setUniversity('');
    setFormErrors({});
  }, [activeTab]);
  
  // Animation effect when page loads
  useEffect(() => {
    // Short delay for animation effect
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Dynamic page title - updates based on current route and tab
  useEffect(() => {
    let pageTitle = 'UniShare';
    
    // Add specific section to title based on route/state
    if (location.pathname === '/') {
      pageTitle += activeTab === 'login' ? ' - Sign In' : ' - Create Account';
    } else if (location.pathname === '/login') {
      pageTitle = 'UniShare - Sign In';
    } else if (location.pathname === '/signup') {
      pageTitle = 'UniShare - Create Account';
    }
    
    // Update document title
    document.title = pageTitle;
  }, [location.pathname, activeTab]);
  
  // Redirect to home if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);
  
  // Parallax effect for background elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Calculate offset based on mouse position
      const xOffset = (clientX - windowWidth / 2) / 100;
      const yOffset = (clientY - windowHeight / 2) / 100;
      
      setParallaxOffset({ x: xOffset, y: yOffset });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Array of premium campus photo links
  const campusPhotos = [
    'https://i.pinimg.com/736x/8d/71/99/8d7199565648661533825132c10b7297.jpg',
    'https://i.pinimg.com/736x/55/20/71/55207128062af742bcf8ff91820a84bb.jpg',
    'https://i.pinimg.com/736x/b8/0e/c2/b80ec23531c3356778f651ca678b46cc.jpg',
    'https://i.pinimg.com/736x/2e/54/28/2e542812e6bc0b055729950fd2c36a6c.jpg',
    'https://i.pinimg.com/736x/94/49/ea/9449ea363131de252ede366c072edee7.jpg',
    'https://i.pinimg.com/736x/1b/a7/ad/1ba7ad1471e78a2dbc6f1822ee552735.jpg',
    'https://i.pinimg.com/736x/ff/aa/5d/ffaa5d3d2dcef47a55c34065f8dcfc1a.jpg',
    'https://i.pinimg.com/736x/e3/17/07/e31707526aa5dede0563375b5b6eb171.jpg',
    'https://i.pinimg.com/736x/d6/dc/ca/d6dcca848c85e9ef0b56dc65b2fa8236.jpg',
  ];
  
  // Handle form submission - memoized to prevent unnecessary re-renders
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate form based on active tab
    let validationResult;
    
    if (activeTab === 'login') {
      validationResult = validateLoginForm({ email, password });
    } else {
      validationResult = validateSignupForm({ email, password, fullName, university });
    }
    
    // If validation fails, set errors and return
    if (!validationResult.isValid) {
      setFormErrors(validationResult.errors);
      return;
    }
    
    // Clear previous errors
    setFormErrors({});
    
    // Set local loading state
    setLocalLoading(true);
    
    try {
      if (activeTab === 'login') {
        // Attempt login
        const { data, error } = await signIn(email, password);
        
        if (error) {
          // Set specific error message
          if (error.message?.includes('Invalid login')) {
            setFormErrors({ form: 'Invalid email or password' });
          } else if (error.message?.includes('Email not confirmed')) {
            setLocalLoading(false); // Reset loading before navigation
            navigate('/verify-email');
            return;
          } else {
            // Show a generic error message to users
            setFormErrors({ form: 'Login failed. Please try again.' });
            // Log the actual error for debugging
            console.error('Login error details:', error.message);
          }
        } else if (data?.user) {
          // Force a short delay to ensure the auth state is updated
          setTimeout(() => {
            setLocalLoading(false); // Reset loading state
            navigate('/home');
          }, 500);
          return;
        }
      } else {
        // Prepare metadata object for signup
        const metadataObj = {
          full_name: fullName,
          university: university
        };
        
        // Attempt signup
        const { error } = await signUp(email, password, metadataObj);
        
        if (error) {
          // Show a user-friendly error message
          if (error.message?.includes('already registered')) {
            setFormErrors({ form: 'This email is already registered. Try logging in instead.' });
          } else {
            // Generic error for other cases
            setFormErrors({ form: 'Could not create account. Please try again.' });
            // Log the actual error for debugging
            console.error('Signup error details:', error.message);
          }
        } else {
          // Redirect to verification page
          setLocalLoading(false); // Reset loading before navigation
          navigate('/verify-email');
          return;
        }
      }
    } catch (error) {
      // Show a generic error message to users
      setFormErrors({ form: 'An unexpected error occurred. Please try again.' });
      // Log the actual error for debugging
      console.error('Auth error details:', error);
    }
    
    // Always reset local loading state if we reach this point
    setLocalLoading(false);
  }, [activeTab, email, password, fullName, university, signIn, signUp, navigate]);
  
  // Toggle between login and signup forms - memoized for performance
  const toggleTab = useCallback((tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      // Clear errors when switching tabs
      setFormErrors({});
    }
  }, [activeTab]);
  
  // Password visibility toggle - memoized to prevent re-renders
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);
  
  // Variants for page animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        damping: 20, 
        stiffness: 100 
      }
    }
  };
  
  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center overflow-hidden">
      {/* Background effect with parallax */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Large gradient orbs - parallax effect */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[120px] opacity-50"
          animate={{ 
            x: parallaxOffset.x * -20, 
            y: parallaxOffset.y * -20
          }}
          transition={{ type: "spring", stiffness: 20 }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/3 w-[30vw] h-[30vw] rounded-full bg-cyan-600/10 blur-[100px] opacity-40"
          animate={{ 
            x: parallaxOffset.x * 15, 
            y: parallaxOffset.y * 15
          }}
          transition={{ type: "spring", stiffness: 15 }}
        />
      </div>
      
      {/* Main container with grid layout */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`grid grid-cols-1 lg:grid-cols-2 w-full max-w-7xl z-10 relative`}
      >
        {/* Left side - Visual elements */}
        <motion.div 
          variants={itemVariants}
          className="hidden lg:flex flex-col items-center justify-center p-10 relative"
        >
          {/* Brand logo at the top */}
          <motion.div 
            variants={itemVariants}
            className="text-4xl font-serif italic text-center mb-10"
          >
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              UniShare
            </span>
          </motion.div>
          
          {/* Premium photo gallery effect */}
          <motion.div 
            variants={itemVariants}
            className="relative max-w-md"
          >
            <div className="grid grid-cols-3 gap-3">
              {campusPhotos.map((photoUrl, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.05, rotate: (Math.random() * 6 - 3) }}
                  className="aspect-square rounded-xl overflow-hidden shadow-lg backdrop-blur-sm border border-white/10"
                  style={{ 
                    transform: `rotate(${Math.random() * 6 - 3}deg)`,
                  }}
                  variants={{
                    hidden: { opacity: 0, y: 20, rotate: Math.random() * 10 - 5 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      rotate: Math.random() * 6 - 3,
                      transition: { 
                        delay: 0.2 + (i * 0.05),
                        duration: 0.5,
                        type: "spring",
                        damping: 15
                      }
                    }
                  }}
                >
                  <img 
                    src={photoUrl} 
                    alt={`Campus moment ${i+1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
                    loading={i < 4 ? "eager" : "lazy"} // Load only first 4 eagerly for better performance
                  />
                </motion.div>
              ))}
            </div>
            
            {/* Animated tagline below photos */}
            <motion.p 
              variants={itemVariants}
              className="text-white/80 text-center mt-10 text-lg"
            >
              Capture & share your university journey
            </motion.p>
          </motion.div>
        </motion.div>
        
        {/* Right side - Authentication forms */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-center justify-center p-6 lg:p-10"
        >
          {/* Logo (visible only on mobile) */}
          <motion.div 
            variants={itemVariants}
            className="lg:hidden text-4xl font-serif italic text-center mb-8"
          >
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              UniShare
            </span>
          </motion.div>
          
          {/* Auth components */}
          <div className="w-full max-w-md">
            {/* Premium tab switcher */}
            <motion.div 
              variants={itemVariants}
              className="flex mb-8 bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10"
            >
              <motion.button
                onClick={() => toggleTab('login')}
                className={`flex-1 py-3 text-center rounded-lg transition-all duration-300 ${
                  activeTab === 'login' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: activeTab === 'login' ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Log In
              </motion.button>
              <motion.button
                onClick={() => toggleTab('signup')}
                className={`flex-1 py-3 text-center rounded-lg transition-all duration-300 ${
                  activeTab === 'signup' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: activeTab === 'signup' ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign Up
              </motion.button>
            </motion.div>
            
            {/* Display form errors */}
            <AnimatePresence>
              {(formErrors.form || authError) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl"
                >
                  <p className="text-red-400 text-sm">{formErrors.form || authError}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Form container */}
            <div className="relative">
              {/* Login Form with premium glass morphism */}
              <AnimatePresence mode="wait">
                {activeTab === 'login' && (
                  <motion.form 
                    key="login-form"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit}
                    className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-xl"
                    data-testid="login-form"
                  >
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="login-email" className="block text-white/80 text-sm mb-2 font-medium">Email</label>
                        <div className="relative group">
                          <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full bg-white/5 backdrop-blur-sm border-b-2 rounded-lg px-4 py-3 text-white 
                              focus:outline-none transition-all duration-300
                              group-hover:bg-white/10 placeholder-white/40
                              ${formErrors.email ? 'border-red-500' : 'border-white/20 focus:border-cyan-400'}`}
                            placeholder="your.email@university.edu"
                            required
                            data-testid="login-email"
                          />
                          <div className={`absolute bottom-0 left-0 h-[2px] w-0 
                            transition-all duration-300 group-hover:w-1/4 group-focus-within:w-full rounded-full
                            ${formErrors.email ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}></div>
                        </div>
                        <AnimatePresence>
                          {formErrors.email && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-1 text-red-400 text-xs"
                            >
                              {formErrors.email}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div>
                        <label htmlFor="login-password" className="block text-white/80 text-sm mb-2 font-medium">Password</label>
                        <div className="relative group">
                          <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full bg-white/5 backdrop-blur-sm border-b-2 rounded-lg px-4 py-3 text-white 
                              focus:outline-none transition-all duration-300
                              group-hover:bg-white/10 placeholder-white/40
                              ${formErrors.password ? 'border-red-500' : 'border-white/20 focus:border-cyan-400'}`}
                            placeholder="••••••••"
                            required
                            data-testid="login-password"
                          />
                          <div className={`absolute bottom-0 left-0 h-[2px] w-0 
                            transition-all duration-300 group-hover:w-1/4 group-focus-within:w-full rounded-full
                            ${formErrors.password ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}></div>
                          <motion.button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors"
                            onClick={togglePasswordVisibility}
                            whileTap={{ scale: 0.9 }}
                            data-testid="toggle-password"
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
                          </motion.button>
                        </div>
                        <AnimatePresence>
                          {formErrors.password && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-1 text-red-400 text-xs"
                            >
                              {formErrors.password}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="text-right">
                        <Link 
                          to="/forgot-password" 
                          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      
                      <motion.button
                        type="submit"
                        disabled={localLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white 
                          rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300
                          focus:outline-none disabled:opacity-70"
                        whileHover={{ scale: localLoading ? 1 : 1.02 }}
                        whileTap={{ scale: localLoading ? 1 : 0.98 }}
                        data-testid="login-submit"
                      >
                        {localLoading ? (
                          <div className="flex items-center justify-center">
                            <motion.svg 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 mr-2 text-white" 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </motion.svg>
                            <span>Signing In...</span>
                          </div>
                        ) : 'Sign In'}
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              
                {/* Signup Form with premium glass morphism */}
                {activeTab === 'signup' && (
                  <motion.form 
                    key="signup-form"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit}
                    className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-xl"
                    data-testid="signup-form"
                  >
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="signup-email" className="block text-white/80 text-sm mb-2 font-medium">Email</label>
                        <div className="relative group">
                          <input
                            id="signup-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full bg-white/5 backdrop-blur-sm border-b-2 rounded-lg px-4 py-3 text-white 
                              focus:outline-none transition-all duration-300
                              group-hover:bg-white/10 placeholder-white/40
                              ${formErrors.email ? 'border-red-500' : 'border-white/20 focus:border-cyan-400'}`}
                            placeholder="your.email@university.edu"
                            required
                            data-testid="signup-email"
                          />
                          <div className={`absolute bottom-0 left-0 h-[2px] w-0 
                            transition-all duration-300 group-hover:w-1/4 group-focus-within:w-full rounded-full
                            ${formErrors.email ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}></div>
                        </div>
                        <AnimatePresence>
                          {formErrors.email && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-1 text-red-400 text-xs"
                            >
                              {formErrors.email}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div>
                        <label htmlFor="full-name" className="block text-white/80 text-sm mb-2 font-medium">Full Name</label>
                        <div className="relative group">
                          <input
                            id="full-name"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={`w-full bg-white/5 backdrop-blur-sm border-b-2 rounded-lg px-4 py-3 text-white 
                              focus:outline-none transition-all duration-300
                              group-hover:bg-white/10 placeholder-white/40
                              ${formErrors.fullName ? 'border-red-500' : 'border-white/20 focus:border-cyan-400'}`}
                            placeholder="Your full name"
                            required
                            data-testid="signup-fullname"
                          />
                          <div className={`absolute bottom-0 left-0 h-[2px] w-0 
                            transition-all duration-300 group-hover:w-1/4 group-focus-within:w-full rounded-full
                            ${formErrors.fullName ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}></div>
                        </div>
                        <AnimatePresence>
                          {formErrors.fullName && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-1 text-red-400 text-xs"
                            >
                              {formErrors.fullName}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div>
                        <label htmlFor="university" className="block text-white/80 text-sm mb-2 font-medium">University</label>
                        <div className="relative group">
                          <input
                            id="university"
                            type="text"
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            className={`w-full bg-white/5 backdrop-blur-sm border-b-2 rounded-lg px-4 py-3 text-white 
                              focus:outline-none transition-all duration-300
                              group-hover:bg-white/10 placeholder-white/40
                              ${formErrors.university ? 'border-red-500' : 'border-white/20 focus:border-cyan-400'}`}
                            placeholder="Your university"
                            required
                            data-testid="signup-university"
                          />
                          <div className={`absolute bottom-0 left-0 h-[2px] w-0 
                            transition-all duration-300 group-hover:w-1/4 group-focus-within:w-full rounded-full
                            ${formErrors.university ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}></div>
                        </div>
                        <AnimatePresence>
                          {formErrors.university && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-1 text-red-400 text-xs"
                            >
                              {formErrors.university}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div>
                        <label htmlFor="signup-password" className="block text-white/80 text-sm mb-2 font-medium">Password</label>
                        <div className="relative group">
                          <input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full bg-white/5 backdrop-blur-sm border-b-2 rounded-lg px-4 py-3 text-white 
                              focus:outline-none transition-all duration-300
                              group-hover:bg-white/10 placeholder-white/40
                              ${formErrors.password ? 'border-red-500' : 'border-white/20 focus:border-cyan-400'}`}
                            placeholder="Create a password"
                            required
                            data-testid="signup-password"
                          />
                          <div className={`absolute bottom-0 left-0 h-[2px] w-0 
                            transition-all duration-300 group-hover:w-1/4 group-focus-within:w-full rounded-full
                            ${formErrors.password ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}></div>
                          <motion.button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors"
                            onClick={togglePasswordVisibility}
                            whileTap={{ scale: 0.9 }}
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
                          </motion.button>
                        </div>
                        <AnimatePresence>
                          {formErrors.password && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-1 text-red-400 text-xs"
                            >
                              {formErrors.password}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-white/60">
                          By signing up, you agree to our <Link to="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Terms of Service</Link> and <Link to="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Privacy Policy</Link>.
                        </p>
                      </div>
                      
                      <motion.button
                        type="submit"
                        disabled={localLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white 
                          rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300
                          focus:outline-none disabled:opacity-70"
                        whileHover={{ scale: localLoading ? 1 : 1.02 }}
                        whileTap={{ scale: localLoading ? 1 : 0.98 }}
                        data-testid="signup-submit"
                      >
                        {localLoading ? (
                          <div className="flex items-center justify-center">
                            <motion.svg 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 mr-2 text-white" 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </motion.svg>
                            <span>Creating Account...</span>
                          </div>
                        ) : 'Create Account'}
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Footer */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 text-center text-sm text-white/50"
          >
            <p>© {new Date().getFullYear()} UniShare. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Export memorized component for better performance
export default memo(UniSharePage);