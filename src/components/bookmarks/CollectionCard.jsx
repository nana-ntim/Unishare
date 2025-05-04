// src/components/bookmarks/CollectionCard.jsx
//
// Premium CollectionCard component for bookmark collections
// Features elegant design and interactive states

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

/**
 * CollectionCard Component
 * 
 * An elegant card for bookmark collections:
 * - Clean, modern design with subtle animations
 * - Selected state styling
 * - Multiple variants for different contexts
 * 
 * @param {Object} props
 * @param {Object} props.collection - Collection data
 * @param {Function} props.onSelect - Function called when collection is selected
 * @param {boolean} props.isSelected - Whether collection is currently selected
 * @param {string} props.variant - Display variant (default, compact)
 * @param {Function} props.onEdit - Optional function for editing collection
 * @param {Function} props.onDelete - Optional function for deleting collection
 */
const CollectionCard = ({
  collection,
  onSelect,
  isSelected = false,
  variant = 'default',
  onEdit,
  onDelete
}) => {
  // Verify collection data
  if (!collection) return null;
  
  // Animation settings
  const animations = {
    whileHover: { y: -3 },
    whileTap: { y: -1 },
    transition: { duration: 0.2 }
  };
  
  // Generate gradient colors based on collection name
  // This creates a unique but consistent color for each collection
  const getGradientColors = (name) => {
    if (!name) return 'from-cyan-500/20 to-blue-500/20';
    
    // Simple hash function to generate a number from string
    const hash = Array.from(name).reduce(
      (hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0
    );
    
    // Use hash to pick from predetermined gradients
    const gradients = [
      'from-cyan-500/20 to-blue-500/20',
      'from-purple-500/20 to-pink-500/20',
      'from-rose-500/20 to-orange-500/20',
      'from-teal-500/20 to-green-500/20',
      'from-blue-500/20 to-indigo-500/20',
      'from-amber-500/20 to-red-500/20'
    ];
    
    return gradients[Math.abs(hash) % gradients.length];
  };
  
  // Compact variant
  if (variant === 'compact') {
    return (
      <motion.button
        onClick={() => onSelect(collection.id)}
        className={`
          w-full text-left rounded-lg px-3 py-2.5 transition-colors
          ${isSelected 
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-white' 
            : 'text-white/80 hover:bg-white/5'
          }
        `}
        {...animations}
      >
        <span className="flex items-center">
          <span className={`
            mr-2 w-2 h-2 rounded-full
            ${isSelected ? 'bg-cyan-400' : 'bg-white/40'}
          `}></span>
          {collection.name}
          {collection.bookmark_count > 0 && (
            <span className={`
              ml-auto text-xs px-1.5 py-0.5 rounded-full
              ${isSelected ? 'bg-white/20' : 'bg-white/10'}
            `}>
              {collection.bookmark_count}
            </span>
          )}
        </span>
      </motion.button>
    );
  }
  
  // Default variant
  return (
    <div 
      onClick={() => onSelect(collection.id)}
      className="cursor-pointer"
    >
      <Card
        isInteractive
        variant={isSelected ? 'elevated' : 'default'}
        accent={isSelected ? 'left' : 'none'}
        className={`
          transition-all duration-300
          ${isSelected 
            ? 'border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/5' 
            : 'hover:border-white/20'
          }
        `}
      >
        <div className="p-4">
          <div className="flex items-center">
            {/* Collection icon */}
            <div className={`
              mr-3 w-10 h-10 rounded-lg flex items-center justify-center
              bg-gradient-to-br ${getGradientColors(collection.name)}
            `}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            
            {/* Collection details */}
            <div className="flex-1">
              <h3 className="text-white font-medium">{collection.name}</h3>
              <div className="flex items-center">
                <p className="text-white/60 text-xs">
                  {collection.bookmark_count || 0} {collection.bookmark_count === 1 ? 'item' : 'items'}
                </p>
                
                {collection.created_at && (
                  <>
                    <span className="mx-1.5 text-white/30 text-xs">•</span>
                    <p className="text-white/60 text-xs">
                      {new Date(collection.created_at).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            {(onEdit || onDelete) && (
              <div className="flex space-x-1">
                {onEdit && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(collection);
                    }}
                    className="p-1.5 text-white/50 hover:text-white/90 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
                
                {onDelete && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(collection.id);
                    }}
                    className="p-1.5 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Optimize with memo
export default memo(CollectionCard);