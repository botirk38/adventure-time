
import React from 'react';

export const ApiKeyMissingBanner: React.FC = () => {
  return (
    <div 
      className="bg-red-500 text-white p-3 text-center fixed top-0 left-0 right-0 z-50 shadow-lg"
      role="alert"
    >
      <p className="font-semibold">
        <span role="img" aria-label="Warning" className="mr-2">⚠️</span>
        Attention Administrator: The AI is not connected! 
        Story generation will not work until the API_KEY environment variable is configured.
      </p>
    </div>
  );
};
