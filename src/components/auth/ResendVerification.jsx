// src/components/auth/ResendVerification.jsx
//
// Resend verification page with optimized UI using shared components
// Allows users to request a new verification email

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const ResendVerification = () => {
  const navigate = useNavigate();
  const { resendVerificationEmail, isAuthenticated, isVerified } = useAuth();
  
  // State
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Redirect if already verified
  useEffect(() => {
    if (isAuthenticated && isVerified) {
      navigate('/home');
    }
  }, [isAuthenticated, isVerified, navigate]);
  
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
        throw new Error('Please enter a valid email address');
      }
      
      const { success, error } = await resendVerificationEmail(email);
      
      if (error) throw error;
      
      // Store email for verification page
      localStorage.setItem('lastSignupEmail', email);
      
      setSuccess(true);
      
      // Redirect to verification page after success
      // Using setTimeout to allow success message to be visible
      setTimeout(() => {
        navigate('/verify-email');
      }, 2000);
    } catch (err) {
      console.error('Error resending verification email:', err);
      // Make sure error is set and visible for tests to find
      setError(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContainer>
      <AuthLogo />
      
      <AuthCard>
        <AuthTitle 
          title="Resend Verification Email"
          subtitle="Enter your email to receive a new verification link"
          icon={
            <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          }
        />
        
        <AnimatePresence>
          {error && <AuthError error={error} />}
          {success && (
            <AuthSuccess message="Verification email sent successfully! Redirecting..." />
          )}
        </AnimatePresence>
        
        {!success ? (
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
            
            <AuthButton
              type="submit"
              disabled={!email || loading}
              isLoading={loading}
              loadingText="Sending Email..."
              data-testid="resend-button"
            >
              Resend Verification Email
            </AuthButton>
            
            <div className="text-center">
              <p className="text-sm text-white/60 mt-4">
                Already verified? <AuthLink to="/login">Sign in</AuthLink>
              </p>
              <p className="text-sm text-white/60 mt-2">
                Don't have an account? <AuthLink to="/signup">Sign up</AuthLink>
              </p>
            </div>
          </form>
        ) : (
          <div className="text-center mt-6">
            <p className="text-white/70">
              We've sent a verification link to <strong>{email}</strong>. 
              Please check your email inbox and follow the instructions to verify your account.
            </p>
            
            <div className="mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-400 mx-auto animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        )}
      </AuthCard>
      
      <AuthFooter />
    </AuthContainer>
  );
};

export default ResendVerification;