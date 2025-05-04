// src/components/auth/SignUp.jsx
//
// SignUp page with optimized UI using shared components
// Allows users to create a new account

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
  AuthDivider,
  AuthLink,
  AuthFooter,
  PasswordStrengthIndicator
} from '../AuthUI';

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp, isAuthenticated } = useAuth();
  
  // State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);
  
  // Generate username suggestions from full name
  useEffect(() => {
    if (fullName && !username) {
      // Generate username from full name (lowercase, no spaces, add random digits)
      const baseUsername = fullName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 12);
        
      // Add random digits for uniqueness
      const randomDigits = Math.floor(Math.random() * 1000);
      setUsername(baseUsername + randomDigits);
    }
  }, [fullName, username]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fullName || !username || !email || !university || !password || !confirmPassword || loading) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Validate inputs
      if (username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, and underscores');
      }
      
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Create user metadata
      const metadata = {
        full_name: fullName,
        university,
        username
      };
      
      // Sign up user
      const { data, error } = await signUp(email, password, metadata);
      
      if (error) throw error;
      
      // Redirect to verification page
      navigate('/verify-email');
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContainer>
      <AuthLogo />
      
      <AuthCard>
        <AuthTitle 
          title="Create Your Account"
          subtitle="Join the university community"
        />
        
        <AnimatePresence>
          {error && <AuthError error={error} />}
        </AnimatePresence>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <AuthInput
            id="fullName"
            label="Full Name"
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          
          <AuthInput
            id="username"
            label="Username"
            type="text"
            placeholder="Choose a unique username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
            required
            disabled={loading}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />
          
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          
          <AuthInput
            id="university"
            label="University"
            type="text"
            placeholder="Your university name"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            required
            disabled={loading}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          
          <AuthInput
            id="password"
            label="Password"
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
          
          <div className="mt-2">
            <p className="text-xs text-white/60">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
          
          <AuthButton
            type="submit"
            disabled={!fullName || !username || !email || !university || !password || !confirmPassword || password !== confirmPassword || loading}
            isLoading={loading}
            loadingText="Creating Account..."
          >
            Create Account
          </AuthButton>
        </form>
        
        <AuthDivider />
        
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Already have an account? <AuthLink to="/login">Sign in</AuthLink>
          </p>
        </div>
      </AuthCard>
      
      <AuthFooter />
    </AuthContainer>
  );
};

export default SignUp;