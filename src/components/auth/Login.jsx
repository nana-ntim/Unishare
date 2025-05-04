// src/components/auth/Login.jsx
//
// Login page with optimized UI using shared components
// Allows users to authenticate with email/password

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { 
  AuthContainer, 
  AuthLogo, 
  AuthCard, 
  AuthTitle,
  AuthInput,
  AuthButton,
  AuthError,
  AuthDivider,
  AuthLink,
  AuthFooter,
  AuthLinkButton
} from '../AuthUI';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, isVerified, authError: contextError } = useAuth();
  
  // Get redirect path from location state
  const from = location.state?.from || '/home';
  
  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (isVerified) {
        navigate(from, { replace: true });
      } else {
        navigate('/verify-email', { replace: true });
      }
    }
  }, [isAuthenticated, isVerified, navigate, from]);
  
  // Check for error messages in context or location state
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
    
    if (location.state?.errorMessage) {
      setError(location.state.errorMessage);
    }
    
    if (location.state?.successMessage) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }
  }, [contextError, location.state]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password || loading) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Basic validation
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      const { data, error } = await signIn(email, password);
      
      if (error) throw error;
      
      // Authentication successful, redirection will happen via the useEffect
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContainer>
      <AuthLogo />
      
      <AuthCard>
        <AuthTitle 
          title="Welcome Back"
          subtitle="Sign in to your UniShare account"
        />
        
        <AnimatePresence>
          {error && <AuthError error={error} />}
          {success && location.state?.successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
            >
              <p className="text-green-400 text-sm">{location.state.successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput
            id="email"
            label="Email Address"
            type="email"
            placeholder="your.email@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />
          
          <AuthInput
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />
          
          <div className="flex justify-end">
            <AuthLink to="/forgot-password">
              Forgot password?
            </AuthLink>
          </div>
          
          <AuthButton
            type="submit"
            disabled={!email || !password || loading}
            isLoading={loading}
            loadingText="Signing In..."
          >
            Sign In
          </AuthButton>
        </form>
        
        <AuthDivider />
        
        <div className="space-y-4">
          {/* Social login buttons could be added here */}
          <p className="text-center text-white/60 text-sm">
            Don't have an account? <AuthLink to="/signup">Sign up</AuthLink>
          </p>
        </div>
      </AuthCard>
      
      <AuthFooter />
    </AuthContainer>
  );
};

export default Login;