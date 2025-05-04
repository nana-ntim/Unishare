// src/components/ui/TabNavigation.jsx
//
// Professional TabNavigation component with refined aesthetics
// Provides consistent navigation experience across the application

import React from 'react';
import PropTypes from 'prop-types';

/**
 * TabItem Component
 * 
 * Individual tab with active state and proper styling
 */
const TabItem = ({
  label,
  icon,
  badge,
  isActive,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-4 py-3 text-sm transition-colors
        ${isActive 
          ? 'text-white font-medium' 
          : 'text-gray-400 hover:text-gray-300'
        }
      `}
      aria-selected={isActive}
      role="tab"
    >
      {/* Content container */}
      <div className="flex items-center justify-center">
        {/* Icon */}
        {icon && (
          <span className={`mr-2 ${isActive ? 'text-blue-400' : ''}`}>
            {icon}
          </span>
        )}
        
        {/* Label */}
        <span>{label}</span>
        
        {/* Badge */}
        {badge > 0 && (
          <span className={`
            ml-1.5 px-1.5 py-0.5 text-xs font-medium
            rounded-full min-w-[18px] h-[18px] flex items-center justify-center
            ${isActive 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-700 text-gray-300'
            }
          `}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
      )}
    </button>
  );
};

/**
 * TabNavigation Component
 * 
 * A professional tab navigation component:
 * - Clean, consistent styling with proper contrast
 * - Support for icons and badges
 * - Responsive design that works on all screen sizes
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects {id, label, icon, badge}
 * @param {string} props.activeTab - ID of the active tab
 * @param {Function} props.onChange - Function called when tab changes
 * @param {boolean} props.centered - Whether to center the tabs
 * @param {string} props.className - Additional classes
 */
const TabNavigation = ({
  tabs = [],
  activeTab,
  onChange,
  centered = false,
  className = '',
  ...props
}) => {
  // Handle tab change
  const handleTabChange = (tabId) => {
    if (onChange) {
      onChange(tabId);
    }
  };
  
  return (
    <div 
      className={`
        border-b border-gray-800 overflow-x-auto scrollbar-hide
        ${className}
      `}
      role="tablist"
      {...props}
    >
      <div className={`
        flex min-w-max
        ${centered ? 'justify-center' : ''}
      `}>
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            label={tab.label}
            icon={tab.icon}
            badge={tab.badge}
            isActive={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
          />
        ))}
      </div>
      
      {/* Custom scrollbar styles */}
      <style jsx="true">{`
        /* Hide scrollbar but maintain functionality */
        .scrollbar-hide::-webkit-scrollbar {
          height: 0;
          width: 0;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      badge: PropTypes.number
    })
  ),
  activeTab: PropTypes.string,
  onChange: PropTypes.func,
  centered: PropTypes.bool,
  className: PropTypes.string
};

export default TabNavigation;