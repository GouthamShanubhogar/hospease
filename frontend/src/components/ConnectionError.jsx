import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRefresh, faServer } from '@fortawesome/free-solid-svg-icons';

const ConnectionError = ({ onRetry, isVisible = false, onClose }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await onRetry();
      onClose && onClose();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const troubleshootingSteps = [
    'Check if the backend server is running on port 5001',
    'Run "npm start" in the backend directory',
    'Verify your internet connection',
    'Check if port 5001 is blocked by firewall',
    'Contact support if the issue persists'
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <FontAwesomeIcon 
            icon={faServer} 
            className="text-red-500 text-2xl mr-3" 
          />
          <h2 className="text-xl font-bold text-gray-800">
            Connection Error
          </h2>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <FontAwesomeIcon 
              icon={faExclamationTriangle} 
              className="text-yellow-500 text-sm mr-2" 
            />
            <p className="text-gray-700">
              Unable to connect to the HospEase backend server.
            </p>
          </div>
          
          {retryCount > 0 && (
            <p className="text-sm text-gray-600 mb-2">
              Retry attempts: {retryCount}
            </p>
          )}
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Troubleshooting:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {troubleshootingSteps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="font-mono text-xs bg-gray-100 px-1 rounded mr-2 mt-0.5">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
          >
            <FontAwesomeIcon 
              icon={faRefresh} 
              className={`mr-2 ${isRetrying ? 'animate-spin' : ''}`} 
            />
            {isRetrying ? 'Retrying...' : 'Retry Connection'}
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Close
            </button>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            If this problem continues, please contact system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionError;