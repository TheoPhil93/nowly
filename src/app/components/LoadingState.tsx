// src/app/components/LoadingState.tsx
'use client';

import React from 'react';

export interface LoadingStateProps {
  text?: string; // Make the text prop optional
}

const LoadingState: React.FC<LoadingStateProps> = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  );
};

export default LoadingState;