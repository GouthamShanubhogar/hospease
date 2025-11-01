import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
      <div className="text-center">
        <CircularProgress size={48} className="text-blue-600" />
        <div className="mt-4 text-gray-600">Loading HospEase...</div>
      </div>
    </div>
  );
};

export default LoadingScreen;