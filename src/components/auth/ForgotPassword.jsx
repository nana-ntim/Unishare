// src/components/auth/ForgotPassword.jsx
//
// Forgot password page with optimized UI using shared components
// Allows users to request a password reset link

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  AuthSuccess,
  AuthLink,
  AuthFooter
} from '../AuthUI';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { forgotPassword, isAuthenticated } = useAuth();
  
  // State
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);
  
  // Check for error message in location state (e.g. from expired token)
  useEffect(() => {
    if (location.state?.errorMessage) {
      setError(location.state.errorMessage);
    }
  }, [location]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || loading) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }
      
      const { success, error } = await forgotPassword(email);
      
      if (error) throw error;
      
      setSuccess(true);
    } catch (err) {
      console.error('Error in password reset request:', err);
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContainer>
      <AuthLogo />
      
      <AuthCard>
        <AuthTitle 
          title="Reset Your Password"
          subtitle="Enter your email to receive a reset link"
          icon={
            <div className="w-16 h-16 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          }
        />
        
        <AnimatePresence>
          {error && <AuthError error={error} />}
          {success && (
            <AuthSuccess message="Password reset link sent! Please check your email inbox." />
          )}
        </AnimatePresence>
        
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="forgot-password-form">
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
            
            <AuthButton
              type="submit"
              disabled={!email || loading}
              isLoading={loading}
              loadingText="Sending Reset Link..."
              data-testid="reset-submit-button"
            >
              Send Reset Link
            </AuthButton>
            
            <div className="text-center">
              <p className="text-sm text-white/60 mt-4">
                Remember your password? <AuthLink to="/login">Sign in</AuthLink>
              </p>
              <p className="text-sm text-white/60 mt-2">
                Don't have an account? <AuthLink to="/signup">Sign up</AuthLink>
              </p>
            </div>
          </form>
        ) : (
          <div className="text-center mt-6">
            <p className="text-white/70 mb-6">
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your email inbox and follow the instructions to reset your password.
            </p>
            
            <AuthButton
              onClick={() => setSuccess(false)}
              data-testid="try-another-button"
            >
              Try Another Email
            </AuthButton>
          </div>
        )}
      </AuthCard>
      
      <AuthFooter />
    </AuthContainer>
  );
};

export default ForgotPassword;