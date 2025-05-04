// src/components/ui/SearchBar.jsx
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { supabase } from '../../lib/supabase';
import Avatar from './Avatar';

/**
 * Debounce function to limit API calls
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * SearchResult Component - Individual search result item
 */
const SearchResult = memo(({ type, data, onSelect }) => {
  // Format timestamp as a helper function
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  switch (type) {
    case 'user':
      return (
        <div 
          className="flex items-center p-3 hover:bg-white/5 cursor-pointer transition-colors"
          onClick={() => onSelect(`/profile/${data.username}`)}
        >
          <Avatar src={data.avatar_url} name={data.full_name || data.username} size="sm" />
          <div className="ml-3 min-w-0">
            <p className="text-white font-medium truncate">{data.full_name}</p>
            <p className="text-neutral-400 text-sm truncate">@{data.username}</p>
          </div>
        </div>
      );
    
    case 'post':
      return (
        <div 
          className="flex items-center p-3 hover:bg-white/5 cursor-pointer transition-colors"
          onClick={() => onSelect(`/post/${data.id}`)}
        >
          <div className={`w-10 h-10 rounded bg-white/5 ${data.image_url ? "overflow-hidden" : "flex items-center justify-center"} flex-shrink-0`}>
            {data.image_url ? (
              <img src={data.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-white font-medium truncate">{data.caption || "Post"}</p>
            <p className="text-neutral-400 text-sm truncate">
              by @{data.username} • {formatTime(data.created_at)}
            </p>
          </div>
        </div>
      );
    
    case 'hashtag':
      return (
        <div 
          className="flex items-center p-3 hover:bg-white/5 cursor-pointer transition-colors"
          onClick={() => onSelect(`/explore?tag=${data.name}`)}
        >
          <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
            <span className="text-lg text-cyan-400 font-medium">#</span>
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-white font-medium truncate">#{data.name}</p>
            <p className="text-neutral-400 text-sm truncate">
              {data.post_count || data.count || 0} posts
            </p>
          </div>
        </div>
      );
      
    default:
      return null;
  }
});

/**
 * SearchBar Component
 * 
 * A centralized search component with premium design:
 * - Real-time search results with proper debouncing
 * - Support for users, posts, and hashtags
 * - Responsive design for all screen sizes
 * - Optimized rendering with memo
 */
const SearchBar = ({
  placeholder = 'Search...',
  className = '',
  onSearch,
  onResultSelect,
  showDropdown = true,
  autoFocus = false,
  size = 'md',
  searchTypes = ['users', 'posts', 'hashtags'],
  maxResults = 5,
  debounceTime = 300,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [], hashtags: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  
  // Size classes
  const sizeClasses = {
    sm: 'h-9 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg'
  };
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults({ users: [], posts: [], hashtags: [] });
        setLoading(false);
        return;
      }
      
      try {
        const results = { users: [], posts: [], hashtags: [] };
        
        // Search for users
        if (searchTypes.includes('users')) {
          const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
            .limit(maxResults);
          
          if (!usersError) results.users = users || [];
        }
        
        // Search for posts
        if (searchTypes.includes('posts')) {
          const { data: posts, error: postsError } = await supabase
            .from('post_details')
            .select('id, caption, image_url, username, created_at')
            .ilike('caption', `%${searchQuery}%`)
            .limit(maxResults);
          
          if (!postsError) results.posts = posts || [];
        }
        
        // Search for hashtags
        if (searchTypes.includes('hashtags')) {
          const { data: hashtags, error: hashtagsError } = await supabase
            .from('hashtags')
            .select('id, name, post_count')
            .ilike('name', `%${searchQuery}%`)
            .order('post_count', { ascending: false })
            .limit(maxResults);
          
          if (!hashtagsError) results.hashtags = hashtags || [];
        }
        
        setResults(results);
        
        // Call onSearch callback if provided
        if (onSearch) {
          onSearch(searchQuery, results);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults({ users: [], posts: [], hashtags: [] });
      } finally {
        setLoading(false);
      }
    }, debounceTime),
    [onSearch, searchTypes, maxResults, debounceTime]
  );
  
  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      setLoading(true);
      setIsOpen(true);
      debouncedSearch(value);
    } else {
      setResults({ users: [], posts: [], hashtags: [] });
      setIsOpen(false);
    }
  };
  
  // Handle result selection
  const handleResultSelect = (path) => {
    setIsOpen(false);
    
    if (onResultSelect) {
      onResultSelect(path);
    } else {
      navigate(path);
    }
  };
  
  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Reset state
    setIsOpen(false);
    
    // Navigate to search results
    navigate(`/explore?q=${encodeURIComponent(query)}`);
  };
  
  // Handle clicks outside of search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Focus input when autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Check if there are any results
  const hasResults = results.users.length > 0 || results.posts.length > 0 || results.hashtags.length > 0;
  
  // Show dropdown only if showDropdown is true, isOpen is true, and there are results or it's loading
  const shouldShowDropdown = showDropdown && isOpen && (hasResults || loading);
  
  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.trim() && setIsOpen(true)}
            placeholder={placeholder}
            className={`w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-colors ${sizeClasses[size] || sizeClasses.md}`}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {query && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              onClick={() => {
                setQuery('');
                setResults({ users: [], posts: [], hashtags: [] });
                setIsOpen(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>
      
      {/* Search results dropdown */}
      <AnimatePresence>
        {shouldShowDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-black border border-white/10 rounded-xl shadow-xl overflow-hidden"
          >
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <div className="w-5 h-5 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-neutral-400">Searching...</span>
              </div>
            ) : hasResults ? (
              <div className="max-h-[70vh] overflow-y-auto">
                {/* Users section */}
                {results.users.length > 0 && (
                  <div>
                    <div className="px-3 pt-2 pb-1">
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        People
                      </span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {results.users.map(user => (
                        <SearchResult
                          key={`user-${user.id}`}
                          type="user"
                          data={user}
                          onSelect={handleResultSelect}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Hashtags section */}
                {results.hashtags.length > 0 && (
                  <div>
                    <div className="px-3 pt-2 pb-1">
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Hashtags
                      </span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {results.hashtags.map(hashtag => (
                        <SearchResult
                          key={`hashtag-${hashtag.id}`}
                          type="hashtag"
                          data={hashtag}
                          onSelect={handleResultSelect}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Posts section */}
                {results.posts.length > 0 && (
                  <div>
                    <div className="px-3 pt-2 pb-1">
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Posts
                      </span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {results.posts.map(post => (
                        <SearchResult
                          key={`post-${post.id}`}
                          type="post"
                          data={post}
                          onSelect={handleResultSelect}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* View all results link */}
                <div className="bg-white/5 p-3 flex justify-center">
                  <button
                    onClick={() => {
                      navigate(`/explore?q=${encodeURIComponent(query)}`);
                      setIsOpen(false);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium text-sm"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-neutral-400">No results found for "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  className: PropTypes.string,
  onSearch: PropTypes.func,
  onResultSelect: PropTypes.func,
  showDropdown: PropTypes.bool,
  autoFocus: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  searchTypes: PropTypes.arrayOf(PropTypes.oneOf(['users', 'posts', 'hashtags'])),
  maxResults: PropTypes.number,
  debounceTime: PropTypes.number
};

export default memo(SearchBar);