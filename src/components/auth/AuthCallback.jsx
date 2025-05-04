// src/components/auth/AuthCallback.jsx
//
// Auth callback handler for OAuth redirects and email actions
// Processes authentication callbacks and redirects users

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  AuthContainer, 
  AuthLogo, 
  AuthCard,
  LoadingSpinner
} from '../AuthUI';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSession } = useAuth();
  
  const [message, setMessage] = useState('Processing your authentication...');
  const [isError, setIsError] = useState(false);
  
  // Process the auth callback
  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for error parameter
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          setIsError(true);
          setMessage(`Authentication error: ${errorDescription || error}`);
          
          // Redirect with error message
          setTimeout(() => navigate('/login', { 
            state: { errorMessage: errorDescription || error } 
          }), 3000);
          return;
        }
        
        // Get action type
        const type = searchParams.get('type');
        
        // Manually refresh the session to update auth state
        // FIXED: Handle the case where refreshSession might not return {success, error}
        try {
          const result = await refreshSession();
          // Only try to destructure if result exists and has expected structure
          if (result && typeof result === 'object') {
            const { error: refreshError } = result;
            if (refreshError) throw refreshError;
          }
        } catch (refreshError) {
          throw refreshError || new Error('Failed to refresh session');
        }
        
        // Handle different action types
        switch (type) {
          case 'recovery':
            // Password reset flow
            navigate('/reset-password');
            break;
          case 'signup':
            // Signup verification
            setMessage('Email verified successfully!');
            setTimeout(() => navigate('/login', { 
              state: { successMessage: 'Your email has been verified. You can now sign in.' } 
            }), 3000);
            break;
          default:
            // General success
            setMessage('Authentication successful!');
            setTimeout(() => navigate('/home'), 2000);
            break;
        }
      } catch (error) {
        console.error('Error processing auth callback:', error);
        setIsError(true);
        setMessage(`Authentication error: ${error.message}`);
        setTimeout(() => navigate('/login', { 
          state: { errorMessage: error.message } 
        }), 3000);
      }
    };
    
    processCallback();
  }, [navigate, refreshSession, searchParams]);
  
  return (
    <AuthContainer>
      <AuthLogo />
      
      <AuthCard>
        <div className="text-center py-8" data-testid="auth-callback-content">
          <div className="flex justify-center mb-6">
            {isError ? (
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <LoadingSpinner size="md" color="cyan" />
              </div>
            )}
          </div>
          
          <h2 className={`text-xl font-bold mb-2 ${isError ? 'text-red-400' : 'text-white'}`} data-testid="auth-callback-title">
            {isError ? 'Authentication Error' : 'Processing Authentication'}
          </h2>
          
          <p className="text-white/70" data-testid="auth-callback-message">
            {message}
          </p>
          
          {!isError && (
            <p className="text-white/50 text-sm mt-4">
              You'll be redirected automatically...
            </p>
          )}
        </div>
      </AuthCard>
    </AuthContainer>
  );
};

export default AuthCallback;