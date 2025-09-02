import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 rounded-2xl animate-spin mx-auto"></div>
        </div>
        
        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading HiringSight...</h2>
        <p className="text-gray-600 mb-6">Preparing your hiring intelligence dashboard</p>
        
        {/* Progress Steps */}
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Loading candidate data...</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse delay-75"></div>
            <span>Initializing AI insights...</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-150"></div>
            <span>Setting up analytics engine...</span>
          </div>
        </div>
        
        {/* Spinner */}
        <div className="mt-8">
          <div className="spinner mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;