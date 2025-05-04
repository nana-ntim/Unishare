// src/components/explore/CategoryFilters.jsx
//
// Premium CategoryFilters component for the explore page
// Provides elegant filtering options with smooth animations

import React, { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * CategoryFilters Component
 * 
 * An elegant horizontal category filter component:
 * - Smooth animations for selected state
 * - Scrollable on smaller screens
 * - Clean, minimal design
 * 
 * @param {Object} props
 * @param {Array} props.categories - Array of category objects
 * @param {string} props.activeCategory - ID of active category
 * @param {Function} props.onCategoryChange - Function called when category changes
 */
const CategoryFilters = ({
  categories = [],
  activeCategory = 'all',
  onCategoryChange
}) => {
  // Default categories if none provided
  const defaultCategories = [
    { id: 'all', name: 'All', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    },
    { id: 'university', name: 'University', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    },
    { id: 'events', name: 'Events', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    },
    { id: 'academics', name: 'Academics', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    },
    { id: 'social', name: 'Social', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    },
    { id: 'sports', name: 'Sports', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    },
    { id: 'clubs', name: 'Clubs', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    },
  ];
  
  // Use provided categories or default ones
  const displayCategories = categories.length > 0 ? categories : defaultCategories;
  
  // Animation settings
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative mb-6">
      <motion.div 
        className="flex space-x-2 pb-2 overflow-x-auto hide-scrollbar"
        variants={containerAnimation}
        initial="hidden"
        animate="show"
      >
        {displayCategories.map((category) => (
          <motion.button
            key={category.id}
            variants={itemAnimation}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={() => onCategoryChange(category.id)}
            className={`
              px-4 py-2.5 rounded-xl flex items-center whitespace-nowrap
              transition-all duration-300
              ${activeCategory === category.id 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20' 
                : 'bg-white/5 backdrop-blur-sm text-white/80 hover:bg-white/10 border border-white/10'}
            `}
          >
            {category.icon && (
              <span className="mr-2">{category.icon}</span>
            )}
            <span>{category.name}</span>
          </motion.button>
        ))}
      </motion.div>
      
      {/* Fade indicator for horizontal scroll */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent pointer-events-none opacity-50" />
      
      {/* Custom scrollbar styles */}
      <style jsx global>{`
        /* Hide scrollbar but maintain functionality */
        .hide-scrollbar::-webkit-scrollbar {
          height: 0;
          width: 0;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

// Optimize with memo
export default memo(CategoryFilters);