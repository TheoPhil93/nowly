'use client';

import React from 'react';

/**
 * Loading state component to show during data fetching
 * 
 * @param {Object} props - Component props
 * @param {string} [props.text='Loading...'] - Text to display during loading
 * @param {string} [props.size='default'] - Size variant ('small', 'default', 'large')
 */
const LoadingState = ({ text = 'Loading...', size = 'default' }) => {
  // Determine spinner size based on prop
  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 'h-4 w-4';
      case 'large':
        return 'h-10 w-10';
      default:
        return 'h-6 w-6';
    }
  };
  
  // Determine text size based on prop
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-lg';
      default:
        return 'text-sm';
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <svg
        className={`animate-spin text-blue-600 ${getSpinnerSize()}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      
      {text && (
        <p className={`mt-3 text-gray-600 ${getTextSize()}`}>{text}</p>
      )}
    </div>
  );
};

export default LoadingState;