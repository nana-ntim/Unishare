// src/App.jsx (Updated)
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { FollowProvider } from './services/followService.jsx';

// Eager loaded components
import AuthGuard from './components/layout/AuthGuard';

// Premium loading fallback with animation
const PageLoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center">
      {/* Animated Logo */}
      <div className="text-3xl font-serif italic mb-4 relative">
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
          UniShare
        </span>
        <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]"></span>
      </div>
      
      {/* Premium loading spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute inset-[3px] rounded-full border-2 border-cyan-400/50 animate-[spin_2s_linear_infinite_reverse]"></div>
        <div className="absolute inset-[6px] rounded-full animate-pulse bg-gradient-to-r from-cyan-500/20 to-blue-500/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.7)]"></div>
        </div>
      </div>
      <p className="mt-4 text-white/50 animate-pulse">Loading Experience...</p>
    </div>
  </div>
);

// Lazy load pages for better performance
// Auth pages
const UniSharePage = lazy(() => import('./components/UniSharePage'));
const EmailVerification = lazy(() => import('./components/auth/EmailVerification'));
const AuthCallback = lazy(() => import('./components/auth/AuthCallback'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const ResendVerification = lazy(() => import('./components/auth/ResendVerification'));

// Main pages - using direct imports from pages folder
const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const CreatePage = lazy(() => import('./pages/CreatePage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

/**
 * NotFound component for handling 404 pages with premium design
 */
const NotFoundPage = () => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 overflow-hidden">
    {/* Background accent */}
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[120px] opacity-30"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[30vw] h-[30vw] rounded-full bg-cyan-600/10 blur-[100px] opacity-20"></div>
    </div>
    
    {/* Content */}
    <div className="relative z-10 text-center bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8 shadow-xl max-w-md w-full">
      <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">404</h1>
      <p className="text-xl mb-8 text-white/70">Oops! We can't find the page you're looking for.</p>
      <a 
        href="/"
        className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300"
      >
        Return Home
      </a>
    </div>
  </div>
);

/**
 * RouteManager Component - Handles route persistence
 */
const RouteManager = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    // Save current location to session storage when it changes
    const currentPath = location.pathname + location.search;
    sessionStorage.setItem('lastLocation', currentPath);
  }, [location]);
  
  return null;
};

/**
 * Main App component with optimized routing and providers
 */
function App() {
  // Get the last location from session storage on initial load
  const initialLocation = sessionStorage.getItem('lastLocation') || '/home';
  
  return (
    <Router>
      <RouteManager />
      <AuthProvider>
        <FollowProvider>
          <Suspense fallback={<PageLoadingFallback />}>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Auth routes - unchanged */}
                <Route path="/" element={<UniSharePage />} />
                <Route path="/login" element={<UniSharePage />} />
                <Route path="/signup" element={<UniSharePage />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/resend-verification" element={<ResendVerification />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                
                {/* Protected routes - Home */}
                <Route 
                  path="/home" 
                  element={
                    <AuthGuard requireVerification={true}>
                      <HomePage />
                    </AuthGuard>
                  } 
                />
                
                {/* Protected routes - Explore */}
                <Route 
                  path="/explore" 
                  element={
                    <AuthGuard requireVerification={true}>
                      <ExplorePage />
                    </AuthGuard>
                  } 
                />
                
                {/* Protected routes - Create */}
                <Route 
                  path="/create" 
                  element={
                    <AuthGuard requireVerification={true}>
                      <CreatePage />
                    </AuthGuard>
                  } 
                />
                
                {/* Protected routes - Notifications */}
                <Route 
                  path="/notifications" 
                  element={
                    <AuthGuard requireVerification={true}>
                      <NotificationsPage />
                    </AuthGuard>
                  } 
                />
                
                {/* Protected routes - Profile */}
                <Route 
                  path="/profile" 
                  element={
                    <AuthGuard requireVerification={true}>
                      <ProfilePage />
                    </AuthGuard>
                  } 
                />
                
                {/* Profile page with username parameter */}
                <Route 
                  path="/profile/:username" 
                  element={
                    <AuthGuard requireVerification={true}>
                      <ProfilePage />
                    </AuthGuard>
                  } 
                />
                
                {/* Post detail page */}
                <Route 
                  path="/post/:postId" 
                  element={
                    <AuthGuard requireVerification={true}>
                      <PostDetailPage />
                    </AuthGuard>
                  } 
                />
                
                {/* Protected routes - Bookmarks */}
                <Route 
                  path="/bookmarks" 
                  element={
                    <AuthGuard requireVerification={true}>
                      <BookmarksPage />
                    </AuthGuard>
                  } 
                />
                
                {/* Protected routes - Settings */}
                <Route 
                  path="/settings" 
                  element={
                    <AuthGuard requireVerification={true}>
                      <SettingsPage />
                    </AuthGuard>
                  } 
                />
                
                {/* 404 handler */}
                <Route path="/404" element={<NotFoundPage />} />
                
                {/* Redirect to last location if authenticated, or home if it's the first visit */}
                <Route path="*" element={<Navigate to={initialLocation} replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </FollowProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;