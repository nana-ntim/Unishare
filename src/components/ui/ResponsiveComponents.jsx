// src/components/ui/ResponsiveComponents.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * ResponsiveContainer Component - Smart container that adapts to screen size
 * 
 * Features:
 * - Automatically adjusts padding and max-width based on screen size
 * - Provides smooth transitions between breakpoints
 * - Optimizes layout for mobile, tablet, and desktop
 */
export const ResponsiveContainer = ({ 
  children, 
  className = "", 
  fluid = false,
  noPadding = false
}) => {
  // Get base container styles
  const baseClasses = "mx-auto transition-all duration-300";
  
  // Get width classes based on fluid prop
  const widthClasses = fluid ? "w-full" : "w-full max-w-7xl";
  
  // Get padding classes
  const paddingClasses = noPadding ? "" : "px-4 sm:px-6 lg:px-8";
  
  return (
    <div className={`${baseClasses} ${widthClasses} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
};

ResponsiveContainer.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  fluid: PropTypes.bool,
  noPadding: PropTypes.bool
};

/**
 * ResponsiveGrid Component - Grid layout that responsively adapts
 * 
 * Features:
 * - Configurable number of columns at different breakpoints
 * - Automatic responsive behavior with clean CSS Grid
 * - Optional gap configuration
 */
export const ResponsiveGrid = ({
  children,
  cols = { base: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className = ""
}) => {
  // Convert gap value to appropriate Tailwind class
  const gapClass = `gap-${gap}`;
  
  // Build grid template columns classes
  const gridColsClasses = `
    grid-cols-${cols.base} 
    ${cols.sm ? `sm:grid-cols-${cols.sm}` : ''} 
    ${cols.md ? `md:grid-cols-${cols.md}` : ''} 
    ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''}
    ${cols.xl ? `xl:grid-cols-${cols.xl}` : ''}
  `;
  
  return (
    <div className={`grid ${gridColsClasses} ${gapClass} ${className}`}>
      {children}
    </div>
  );
};

ResponsiveGrid.propTypes = {
  children: PropTypes.node,
  cols: PropTypes.shape({
    base: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number,
  }),
  gap: PropTypes.number,
  className: PropTypes.string
};

/**
 * Modal Component - Premium glass-morphism modal
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnOverlayClick = true,
  showCloseButton = true
}) => {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Modal size classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full",
  };
  
  const selectedSize = sizeClasses[size] || sizeClasses.md;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center px-4 py-6 sm:px-0">
          {/* Overlay backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />
          
          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
            className={`relative w-full ${selectedSize} bg-black/90 border border-white/10 rounded-xl overflow-hidden shadow-xl z-10`}
          >
            {/* Modal header */}
            {(title || showCloseButton) && (
              <div className="border-b border-white/10 p-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">
                  {title}
                </h3>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            
            {/* Modal body */}
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'full']),
  closeOnOverlayClick: PropTypes.bool,
  showCloseButton: PropTypes.bool
};

/**
 * Responsive device detector hook
 */
export const useResponsiveDevice = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false
  });
  
  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    
    setDevice({
      isMobile: width < 640,  // < sm breakpoint
      isTablet: width >= 640 && width < 1024, // sm to md
      isDesktop: width >= 1024 && width < 1280, // lg
      isLargeDesktop: width >= 1280 // xl and up
    });
  }, []);
  
  useEffect(() => {
    // Initial check
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  
  return device;
};

/**
 * LoadingSpinner Component - Premium loading animation
 */
export const LoadingSpinner = ({ size = "md", color = "blue", className = "" }) => {
  // Size classes
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };
  
  // Color classes
  const colorClasses = {
    blue: "border-blue-500 border-t-transparent",
    cyan: "border-cyan-500 border-t-transparent",
    white: "border-white border-t-transparent",
    purple: "border-purple-500 border-t-transparent",
    pink: "border-pink-500 border-t-transparent"
  };
  
  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const selectedColor = colorClasses[color] || colorClasses.blue;
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${selectedSize} rounded-full border-2 ${selectedColor} animate-spin`}></div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['blue', 'cyan', 'white', 'purple', 'pink']),
  className: PropTypes.string
};

/**
 * ResponsiveImage - Premium responsive image component
 */
export const ResponsiveImage = ({
  src,
  alt,
  className = "",
  aspectRatio = "square",
  objectFit = "cover",
  lazy = true,
  onLoad,
  onError,
  imgClassName = ""
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Aspect ratio classes
  const aspectRatioClasses = {
    square: "aspect-square", // 1:1
    video: "aspect-video",   // 16:9
    portrait: "aspect-[3/4]", // 3:4
    wide: "aspect-[21/9]"     // 21:9
  };
  
  // Object fit classes
  const objectFitClasses = {
    contain: "object-contain",
    cover: "object-cover",
    fill: "object-fill",
    none: "object-none"
  };
  
  const selectedAspectRatio = aspectRatioClasses[aspectRatio] || "aspect-square";
  const selectedObjectFit = objectFitClasses[objectFit] || "object-cover";
  
  const handleLoad = (e) => {
    setLoading(false);
    if (onLoad) onLoad(e);
  };
  
  const handleError = (e) => {
    setLoading(false);
    setError(true);
    if (onError) onError(e);
  };
  
  return (
    <div className={`relative overflow-hidden ${selectedAspectRatio} ${className}`}>
      {/* Placeholder/skeleton during loading */}
      {loading && !error && (
        <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
          <svg className="w-10 h-10 text-white/20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full transition-opacity duration-300 ${selectedObjectFit} ${loading ? 'opacity-0' : 'opacity-100'} ${imgClassName}`}
        loading={lazy ? "lazy" : "eager"}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

ResponsiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  aspectRatio: PropTypes.oneOf(['square', 'video', 'portrait', 'wide']),
  objectFit: PropTypes.oneOf(['contain', 'cover', 'fill', 'none']),
  lazy: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  imgClassName: PropTypes.string
};

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  Modal,
  useResponsiveDevice,
  LoadingSpinner,
  ResponsiveImage
};