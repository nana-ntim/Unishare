// src/utils/index.js
//
// Consolidated utility functions
// A central place for all application utility functions
// Combines optimization and validation utilities

/**
 * PERFORMANCE OPTIMIZATION UTILITIES
 */

/**
 * Debounces a function to limit how often it can be called
 * Useful for expensive operations triggered by user input
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait before invoking
 * @param {boolean} immediate - Whether to invoke on the leading edge
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300, immediate = false) => {
    let timeout;
    
    return function executedFunction(...args) {
      const context = this;
      
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      
      const callNow = immediate && !timeout;
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func.apply(context, args);
    };
  };
  
  /**
   * Throttles a function to limit how often it can be called
   * Useful for frequent events like scrolling or resizing
   * 
   * @param {Function} func - Function to throttle
   * @param {number} limit - Milliseconds to wait between invocations
   * @returns {Function} Throttled function
   */
  export const throttle = (func, limit = 300) => {
    let inThrottle;
    
    return function executedFunction(...args) {
      const context = this;
      
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  };
  
  /**
   * Simple memoization function to cache results of expensive calculations
   * 
   * @param {Function} func - Function to memoize
   * @returns {Function} Memoized function
   */
  export const memoize = (func) => {
    const cache = new Map();
    
    return function memoized(...args) {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func.apply(this, args);
      cache.set(key, result);
      
      return result;
    };
  };
  
  /**
   * Creates a function that will only execute once
   * Useful for initialization code
   * 
   * @param {Function} func - Function to execute once
   * @returns {Function} Function that will only execute once
   */
  export const once = (func) => {
    let called = false;
    let result;
    
    return function executedOnce(...args) {
      if (!called) {
        result = func.apply(this, args);
        called = true;
      }
      return result;
    };
  };
  
  /**
   * Checks if an element is in the viewport
   * Useful for lazy loading images or content
   * 
   * @param {HTMLElement} element - DOM element to check
   * @param {number} offset - Offset to trigger before element enters viewport
   * @returns {boolean} Whether element is in viewport
   */
  export const isInViewport = (element, offset = 0) => {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    
    return (
      rect.top - offset <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom + offset >= 0 &&
      rect.left - offset <= (window.innerWidth || document.documentElement.clientWidth) &&
      rect.right + offset >= 0
    );
  };
  
  /**
   * Image preloading utility to improve perceived performance
   * 
   * @param {string} src - Image URL to preload
   * @returns {Promise} Promise that resolves when image is loaded
   */
  export const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = resolve;
      img.onerror = reject;
    });
  };
  
  /**
   * Format a file size in a human-readable way
   * 
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted file size
   */
  export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  /**
   * Format a date in a human-readable way
   * 
   * @param {string|Date} date - Date to format
   * @param {boolean} includeTime - Whether to include time
   * @returns {string} Formatted date
   */
  export const formatDate = (date, includeTime = false) => {
    if (!date) return '';
    
    const d = new Date(date);
    
    if (isNaN(d.getTime())) return '';
    
    const formattedDate = d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    if (!includeTime) return formattedDate;
    
    const formattedTime = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${formattedDate} at ${formattedTime}`;
  };
  
  /**
   * Format a date as relative time (e.g., "2 hours ago")
   * 
   * @param {string|Date} date - Date to format
   * @returns {string} Relative time
   */
  export const formatRelativeTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const d = new Date(date);
    
    if (isNaN(d.getTime())) return '';
    
    const diffMs = now - d;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks}w ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths}mo ago`;
    } else {
      return `${diffYears}y ago`;
    }
  };
  
  /**
   * Truncate text if it exceeds a certain length
   * 
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} suffix - Suffix to add to truncated text
   * @returns {string} Truncated text
   */
  export const truncateText = (text, maxLength = 100, suffix = '...') => {
    if (!text) return '';
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - suffix.length) + suffix;
  };
  
  /**
   * VALIDATION UTILITIES
   */
  
  /**
   * Validate an email address
   * 
   * @param {string} email - Email to validate
   * @returns {boolean} Whether email is valid
   */
  export const isValidEmail = (email) => {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate a password
   * 
   * @param {string} password - Password to validate
   * @returns {Object} Validation result with valid flag and message
   */
  export const validatePassword = (password) => {
    if (!password) {
      return { valid: false, message: 'Password is required' };
    }
    
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
    
    return { valid: true, message: 'Password is valid' };
  };
  
  /**
   * Calculate password strength on a scale of 0-5
   * 
   * @param {string} password - Password to check
   * @returns {number} Strength score (0-5)
   */
  export const getPasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };
  
  /**
   * Validate a username
   * 
   * @param {string} username - Username to validate
   * @returns {Object} Validation result with valid flag and message
   */
  export const validateUsername = (username) => {
    if (!username) {
      return { valid: false, message: 'Username is required' };
    }
    
    if (username.length < 3) {
      return { valid: false, message: 'Username must be at least 3 characters long' };
    }
    
    if (username.length > 20) {
      return { valid: false, message: 'Username must be at most 20 characters long' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }
    
    return { valid: true, message: 'Username is valid' };
  };
  
  /**
   * Validate a URL
   * 
   * @param {string} url - URL to validate
   * @returns {boolean} Whether URL is valid
   */
  export const isValidUrl = (url) => {
    if (!url) return false;
    
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Validate a file type
   * 
   * @param {File} file - File to validate
   * @param {Array} allowedTypes - Allowed MIME types
   * @returns {boolean} Whether file type is valid
   */
  export const isValidFileType = (file, allowedTypes = []) => {
    if (!file || !allowedTypes.length) return false;
    
    return allowedTypes.includes(file.type);
  };
  
  /**
   * Validate a file size
   * 
   * @param {File} file - File to validate
   * @param {number} maxSizeInBytes - Maximum file size in bytes
   * @returns {boolean} Whether file size is valid
   */
  export const isValidFileSize = (file, maxSizeInBytes) => {
    if (!file || !maxSizeInBytes) return false;
    
    return file.size <= maxSizeInBytes;
  };
  
  /**
   * Validate an image file
   * 
   * @param {File} file - File to validate
   * @param {number} maxSizeInMB - Maximum file size in MB
   * @returns {Object} Validation result with valid flag and message
   */
  export const validateImageFile = (file, maxSizeInMB = 5) => {
    if (!file) {
      return { valid: false, message: 'No file provided' };
    }
    
    // Check file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      return { 
        valid: false, 
        message: 'Unsupported file type. Please upload a JPEG, PNG, GIF, or WebP image.' 
      };
    }
    
    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return { 
        valid: false, 
        message: `File size exceeds the ${maxSizeInMB}MB limit.` 
      };
    }
    
    return { valid: true, message: 'File is valid' };
  };
  
  /**
   * Sanitize HTML to prevent XSS attacks
   * Basic implementation - for critical applications use DOMPurify
   * 
   * @param {string} html - HTML to sanitize
   * @returns {string} Sanitized HTML
   */
  export const sanitizeHtml = (html) => {
    if (!html) return '';
    
    // Replace problematic characters
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  /**
   * DOM UTILITIES
   */
  
  /**
   * Safely get an element by ID with type checking
   * 
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} Element or null
   */
  export const getElement = (id) => {
    if (!id || typeof id !== 'string') return null;
    
    return document.getElementById(id);
  };
  
  /**
   * Add a class to an element
   * 
   * @param {HTMLElement} element - Element to modify
   * @param {string} className - Class to add
   */
  export const addClass = (element, className) => {
    if (!element || !className) return;
    
    element.classList.add(className);
  };
  
  /**
   * Remove a class from an element
   * 
   * @param {HTMLElement} element - Element to modify
   * @param {string} className - Class to remove
   */
  export const removeClass = (element, className) => {
    if (!element || !className) return;
    
    element.classList.remove(className);
  };
  
  /**
   * Toggle a class on an element
   * 
   * @param {HTMLElement} element - Element to modify
   * @param {string} className - Class to toggle
   */
  export const toggleClass = (element, className) => {
    if (!element || !className) return;
    
    element.classList.toggle(className);
  };
  
  /**
   * DATA MANIPULATION UTILITIES
   */
  
  /**
   * Group an array of objects by a key
   * 
   * @param {Array} array - Array to group
   * @param {string} key - Key to group by
   * @returns {Object} Grouped object
   */
  export const groupBy = (array, key) => {
    if (!array || !Array.isArray(array) || !key) return {};
    
    return array.reduce((result, item) => {
      const keyValue = item[key];
      if (keyValue === undefined) return result;
      
      (result[keyValue] = result[keyValue] || []).push(item);
      return result;
    }, {});
  };
  
  /**
   * Sort an array of objects by a key
   * 
   * @param {Array} array - Array to sort
   * @param {string} key - Key to sort by
   * @param {string} direction - Sort direction ('asc' or 'desc')
   * @returns {Array} Sorted array
   */
  export const sortBy = (array, key, direction = 'asc') => {
    if (!array || !Array.isArray(array) || !key) return array;
    
    const sortMultiplier = direction === 'desc' ? -1 : 1;
    
    return [...array].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      
      if (aValue === bValue) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      return ((aValue > bValue) ? 1 : -1) * sortMultiplier;
    });
  };
  
  /**
   * Filter an array of objects by a condition
   * 
   * @param {Array} array - Array to filter
   * @param {Function} predicate - Filter function
   * @returns {Array} Filtered array
   */
  export const filterBy = (array, predicate) => {
    if (!array || !Array.isArray(array) || !predicate) return array;
    
    return array.filter(predicate);
  };
  
  /**
   * Deep clone an object
   * 
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      console.error('Deep clone error:', error);
      return obj;
    }
  };
  
  /**
   * Get a value from an object by path
   * 
   * @param {Object} obj - Object to get value from
   * @param {string} path - Path to value (e.g., 'user.profile.name')
   * @param {*} defaultValue - Default value if path doesn't exist
   * @returns {*} Value at path or default value
   */
  export const getValueByPath = (obj, path, defaultValue = undefined) => {
    if (!obj || !path) return defaultValue;
    
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return defaultValue;
      }
      
      result = result[key];
    }
    
    return result === undefined ? defaultValue : result;
  };