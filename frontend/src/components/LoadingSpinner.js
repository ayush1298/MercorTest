import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-700">Loading HiringSight...</h2>
        <p className="text-gray-500 mt-2">Analyzing talent intelligence</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;