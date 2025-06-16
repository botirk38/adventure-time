
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-16 h-16 border-8 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};
