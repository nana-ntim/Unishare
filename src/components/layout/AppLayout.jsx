// src/components/layout/AppLayout.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../hooks/useAuth';

/**
 * AppLayout Component - Unified layout with sidebar and responsive design
 * 
 * Provides consistent layout across the application with:
 * - Responsive sidebar that collapses on smaller screens
 * - Mobile navigation for smaller devices
 * - Page header with title and search functionality
 */
const AppLayout = ({
  children,
  title,
  subtitle,
  loading = false,
  showSearch = true
}) => {
  // State for responsive behavior
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Auth and navigation
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Responsive behavior setup
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Mobile breakpoint
      setIsMobile(width < 768);
      
      // Auto-collapse sidebar on medium screens
      setIsSidebarCollapsed(width >= 768 && width < 1280);
    };
    
    // Initial check
    handleResize();
    
    // Add throttled event listener
    let resizeTimer;
    const throttledResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };
    
    window.addEventListener('resize', throttledResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', throttledResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []);
  
  // Generate page title based on current path
  const getPageTitle = useCallback(() => {
    if (title) return title;
    
    switch (location.pathname) {
      case '/home': return 'Home';
      case '/explore': return 'Explore';
      case '/create': return 'Create';
      case '/notifications': return 'Notifications';
      case '/profile': return 'Profile';
      case '/bookmarks': return 'Saved';
      case '/settings': return 'Settings';
      default: 
        if (location.pathname.startsWith('/profile/')) {
          return 'Profile';
        }
        if (location.pathname.startsWith('/post/')) {
          return 'Post';
        }
        return 'UniShare';
    }
  }, [location.pathname, title]);
  
  // Generate subtitle based on current path
  const getPageSubtitle = useCallback(() => {
    if (subtitle) return subtitle;
    
    switch (location.pathname) {
      case '/home': return 'See posts from people you follow';
      case '/explore': return 'Discover new content and people';
      case '/create': return 'Share something with your community';
      case '/notifications': return 'View your activity and interactions';
      case '/profile': return 'View and manage your profile';
      case '/bookmarks': return "Posts you've saved";
      case '/settings': return 'Manage your account settings';
      default: return '';
    }
  }, [location.pathname, subtitle]);
  
  // Navigation items configuration
  const navItems = [
    { 
      id: 'home',
      path: '/home', 
      label: 'Home', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'explore',
      path: '/explore', 
      label: 'Explore', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    { 
      id: 'create',
      path: '/create', 
      label: 'Create', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    { 
      id: 'notifications',
      path: '/notifications', 
      label: 'Notifications', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    { 
      id: 'profile',
      path: '/profile', 
      label: 'Profile', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'bookmarks',
      path: '/bookmarks', 
      label: 'Saved', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )
    },
    { 
      id: 'settings',
      path: '/settings', 
      label: 'Settings', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];
  
  // Handle sign out - FIXED
  const handleSignOut = useCallback(async () => {
    try {
      if (signOut) {
        await signOut();
      }
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [signOut, navigate]);
  
  // NavItem Component - Individual navigation item
  const NavItem = ({ path, label, icon, isActive, isCollapsed, onClick }) => {
    if (isCollapsed) {
      return (
        <Link
          to={path}
          className={`relative flex items-center justify-center w-12 h-12 mx-auto my-2 rounded-full hover:bg-white/5 transition-colors ${
            isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
          }`}
          aria-label={label}
          onClick={onClick}
        >
          <span>{icon}</span>
        </Link>
      );
    }
    
    return (
      <Link
        to={path}
        className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors ${
          isActive 
            ? 'font-bold bg-white/5' 
            : 'font-normal hover:bg-white/5'
        }`}
        onClick={onClick}
      >
        <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-white/50'}`}>
          {icon}
        </span>
        <span className={`ml-4 text-base ${isActive ? 'text-white' : 'text-white/50'}`}>
          {label}
        </span>
      </Link>
    );
  };
  
  // Mobile menu component
  const MobileMenu = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
  
    return (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"
          onClick={onClose}
        />
        
        {/* Side drawer */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'tween', duration: 0.25 }}
          className="fixed inset-y-0 left-0 w-[250px] bg-black border-r border-white/10 z-40 flex flex-col"
        >
          {/* Logo */}
          <div className="p-4 border-b border-white/10">
            <div className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                UniShare
              </span>
            </div>
          </div>
          
          {/* User info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center">
              <Avatar
                src={user?.user_metadata?.avatar_url || profile?.avatar_url}
                name={user?.user_metadata?.name || profile?.full_name || user?.email || 'User'}
                size="md"
              />
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {profile?.full_name || user?.user_metadata?.name || 'User'}
                </p>
                <p className="text-white/60 text-sm truncate">
                  @{profile?.username || user?.user_metadata?.username || 'username'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 ${
                  location.pathname === item.path
                    ? 'text-white font-medium bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                } transition-colors`}
                onClick={onClose}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          {/* Sign out button */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </motion.div>
      </>
    );
  };
  
  // Mobile Navigation Bar
  const MobileNavBar = () => {
    const currentPath = location.pathname;
    
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.path}
              className={`flex flex-col items-center justify-center w-full h-full text-sm ${
                currentPath === item.path ? 'text-cyan-400' : 'text-white/60'
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="mb-1">{item.icon}</span>
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Sidebar component
  const Sidebar = () => {
    return (
      <aside className={`fixed top-0 left-0 z-30 h-full bg-black transition-all duration-300 ${
        isSidebarCollapsed ? 'w-[70px]' : 'w-[240px]'
      } border-r border-white/10`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link to="/home" className="flex items-center py-6 px-4">
            {/* App icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-lg">
              U
            </div>
            
            {/* App name - hidden when collapsed */}
            {!isSidebarCollapsed && (
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                UniShare
              </span>
            )}
          </Link>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                path={item.path}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.path}
                isCollapsed={isSidebarCollapsed}
              />
            ))}
          </nav>
          
          {/* User Profile and Logout */}
          <div className="px-2 pb-6 mt-auto">
            {isSidebarCollapsed ? (
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center w-12 h-12 mx-auto my-2 rounded-full hover:bg-white/5 transition-colors"
                title="Sign out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            ) : (
              <div className="flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <Avatar 
                  src={profile?.avatar_url} 
                  name={profile?.full_name || "User"}
                  size="sm"
                />
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-white/50 text-xs truncate">
                    @{profile?.username || "username"}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-2 p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                  title="Sign out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* Toggle button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute right-0 top-4 w-8 h-8 bg-transparent flex items-center justify-center text-white/40 hover:text-white"
            style={{ transform: 'translateX(50%)' }}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      </aside>
    );
  };
  
  // Lightweight LoadingSpinner Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-cyan-400 animate-spin"></div>
    </div>
  );
  
  // Calculate page padding based on sidebar state
  const getMainContentClass = useCallback(() => {
    if (isMobile) {
      return 'pb-20'; // Bottom padding for mobile navigation
    }
    
    if (isSidebarCollapsed) {
      return 'pl-[70px]'; // Left padding for collapsed sidebar
    }
    
    return 'pl-[240px]'; // Left padding for expanded sidebar
  }, [isMobile, isSidebarCollapsed]);
  
  // PageHeader Component
  const PageHeader = () => {
    return (
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-lg border-b border-white/10 px-4 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Mobile menu button and title */}
          <div className="flex items-center">
            {isMobile && (
              <button 
                className="mr-3 text-white/70 hover:text-white"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Toggle menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">
                {getPageTitle()}
              </h1>
              {getPageSubtitle() && (
                <p className="text-sm text-white/60 mt-0.5 hidden sm:block">
                  {getPageSubtitle()}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background elements - subtle gradient */}
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000] to-[#050505]"></div>
      </div>
      
      {/* Mobile menu - only visible when open on mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu 
            isOpen={mobileMenuOpen} 
            onClose={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar - hidden on mobile */}
      {!isMobile && <Sidebar />}
      
      {/* Main Content Area */}
      <main 
        className={`relative min-h-screen ${getMainContentClass()} transition-all duration-300 ease-in-out`}
        role="main"
      >
        {/* Page header */}
        <PageHeader />
        
        {/* Page content */}
        <div className={`pt-6 ${isMobile ? 'pb-20' : 'pb-8'} px-4 md:px-6`}>
          {loading ? <LoadingSpinner /> : children}
        </div>
        
        {/* Mobile Navigation Bar - only on mobile */}
        {isMobile && <MobileNavBar />}
      </main>
    </div>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  loading: PropTypes.bool,
  showSearch: PropTypes.bool
};

export default AppLayout;