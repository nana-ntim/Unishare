// src/components/auth/EmailVerification.jsx
//
// Email verification page with optimized UI using shared components
// Displays instructions for email verification and option to resend

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { 
  AuthContainer, 
  AuthLogo, 
  AuthCard, 
  AuthTitle,
  AuthButton,
  AuthError,
  AuthSuccess,
  AuthLink,
  AuthFooter,
  LoadingSpinner
} from '../AuthUI'; // FIXED: Correct path to AuthUI

const EmailVerification = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isVerified, resendVerificationEmail } = useAuth();
  
  // State
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  // Get email from localStorage or auth context
  useEffect(() => {
    const storedEmail = localStorage.getItem('lastSignupEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);
  
  // Redirect if already verified
  useEffect(() => {
    if (isAuthenticated && isVerified) {
      navigate('/home');
      return () => {}; // Clean up function to avoid state updates after unmount
    }
  }, [isAuthenticated, isVerified, navigate]);
  
  // Handle countdown timer for resend cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);
  
  // Handle resend verification email
  const handleResend = async () => {
    if (!email || loading || countdown > 0) return;
    
    try {
      setLoading(true);
      setError('');
      
      const { success, error } = await resendVerificationEmail(email);
      
      if (error) throw error;
      
      setResendSuccess(true);
      setCountdown(60); // 60-second cooldown
    } catch (err) {
      console.error('Error resending verification email:', err);
      setError(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Email mask for privacy (show first 3 chars + domain)
  const getMaskedEmail = (email) => {
    if (!email) return '';
    
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;
    
    // Fixed format to match test expectations: first 3 chars + exactly 3 dots
    const maskedUsername = username.substring(0, 3) + '•••';
    return `${maskedUsername}@${domain}`;
  };
  
  return (
    <AuthContainer>
      <AuthLogo />
      
      <AuthCard>
        <AuthTitle 
          title="Verify Your Email"
          subtitle="We've sent a verification link to your email"
          icon={
            <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          }
        />
        
        <AnimatePresence>
          {error && <AuthError error={error} />}
          {resendSuccess && (
            <AuthSuccess message="Verification email sent successfully! Please check your inbox." />
          )}
        </AnimatePresence>
        
        <div className="text-center mb-6">
          <p className="text-white/70 mb-2">
            We've sent a verification link to:
          </p>
          <div className="bg-white/5 py-2 px-4 rounded-lg border border-white/10 text-white/90 font-medium">
            {email ? getMaskedEmail(email) : 'your email address'}
          </div>
          <p className="text-white/60 text-sm mt-4">
            Click the link in the email to activate your account. If you don't see it, check your spam folder.
          </p>
        </div>
        
        <div className="space-y-3">
          <AuthButton
            onClick={handleResend}
            disabled={loading || countdown > 0}
            isLoading={loading}
            data-testid="resend-button"
          >
            {countdown > 0 
              ? `Resend Email (${countdown}s)` 
              : 'Resend Verification Email'}
          </AuthButton>
          
          <p className="text-center text-sm text-white/60 mt-4">
            Already verified? <AuthLink to="/login">Sign in</AuthLink>
          </p>
          
          <p className="text-center text-sm text-white/60">
            Wrong email? <AuthLink to="/signup">Create a new account</AuthLink>
          </p>
        </div>
      </AuthCard>
      
      <AuthFooter />
    </AuthContainer>
  );
};

export default EmailVerification;