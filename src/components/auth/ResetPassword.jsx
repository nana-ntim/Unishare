// src/components/auth/ResetPassword.jsx
//
// Reset password page with optimized UI using shared components
// Allows users to set a new password after using a reset link

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
  AuthFooter,
  PasswordStrengthIndicator
} from '../AuthUI';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetPassword, isAuthenticated } = useAuth();
  
  // State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Redirect if already authenticated but not in reset flow
  useEffect(() => {
    const isResetFlow = window.location.hash.includes('type=recovery');
    if (isAuthenticated && !isResetFlow) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);
  
  // Password validation
  const validatePassword = (password) => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }
    
    return { valid: true };
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword || loading) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Validate password strength
      const validation = validatePassword(password);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // Check if passwords match
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      const { success, error } = await resetPassword(password);
      
      if (error) throw error;
      
      setSuccess(true);
      
      // Redirect to login after success
      // Using a timeout to allow the success message to be displayed
      // IMPORTANT: Tests rely on this timeout being exactly 5000ms
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContainer>
      <AuthLogo />
      
      <AuthCard>
        <AuthTitle 
          title="Set New Password"
          subtitle="Create a strong password for your account"
          icon={
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          }
        />
        
        <AnimatePresence>
          {error && <AuthError error={error} />}
          {success && (
            <AuthSuccess message="Password reset successful! You will be redirected to the login page." />
          )}
        </AnimatePresence>
        
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="reset-password-form">
            <AuthInput
              id="password"
              label="New Password"
              type="password"
              placeholder="Create a strong password"
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
            
            {password && <PasswordStrengthIndicator password={password} />}
            
            <AuthInput
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : null}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />
            
            <AuthButton
              type="submit"
              disabled={!password || !confirmPassword || password !== confirmPassword || loading}
              isLoading={loading}
              loadingText="Resetting Password..."
              data-testid="reset-submit-button"
            >
              Reset Password
            </AuthButton>
            
            <p className="text-center text-sm text-white/60 mt-4">
              Remember your password? <AuthLink to="/login">Sign in</AuthLink>
            </p>
          </form>
        ) : (
          <div className="text-center mt-4" data-testid="reset-success">
            <p className="text-white/70 mb-4">
              Your password has been reset successfully. You will be redirected to the login page.
            </p>
            
            <div className="flex justify-center">
              <div className="animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div className="mt-4">
              <AuthLink to="/login">
                Go to Login
              </AuthLink>
            </div>
          </div>
        )}
      </AuthCard>
      
      <AuthFooter />
    </AuthContainer>
  );
};

export default ResetPassword;