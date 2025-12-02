import React, { useState } from 'react';
import { 
  FaDesktop, 
  FaMobile, 
  FaTabletAlt, 
  FaGlobe, 
  FaSignOutAlt,
  FaClock,
  FaSpinner
} from 'react-icons/fa';

/**
 * DeviceList Component
 * Displays list of user devices with logout functionality
 */
const DeviceList = ({ 
  devices = [], 
  loading = false, 
  onLogoutDevice, 
  onLogoutAll,
  className = '' 
}) => {
  const [actionLoading, setActionLoading] = useState(null);

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <FaMobile className="w-5 h-5 text-blue-500" />;
      case 'tablet':
        return <FaTabletAlt className="w-5 h-5 text-green-500" />;
      case 'desktop':
      default:
        return <FaDesktop className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatLastActive = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const handleLogoutDevice = async (deviceId) => {
    setActionLoading(deviceId);
    try {
      await onLogoutDevice(deviceId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Are you sure you want to log out from all other devices?')) {
      return;
    }
    
    setActionLoading('all');
    try {
      await onLogoutAll();
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="w-6 h-6 text-blue-500 animate-spin mr-3" />
          <span className="text-gray-500">Loading devices...</span>
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <FaDesktop className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No devices found</p>
          <p className="text-sm text-gray-400 mt-1">
            Devices will appear here when you log in from different locations.
          </p>
        </div>
      </div>
    );
  }

  const activeDevices = devices.filter(device => device.is_active);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Active Devices</h3>
            <p className="text-sm text-gray-500 mt-1">
              Devices where you're currently logged in
            </p>
          </div>
          
          {activeDevices.length > 1 && (
            <button
              onClick={handleLogoutAll}
              disabled={actionLoading === 'all'}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              {actionLoading === 'all' ? (
                <FaSpinner className="w-4 h-4 animate-spin" />
              ) : (
                <FaSignOutAlt className="w-4 h-4" />
              )}
              <span>Logout All Others</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Devices */}
      <div className="divide-y divide-gray-200">
        {activeDevices.map((device) => (
          <div key={device.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getDeviceIcon(device.device_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {device.device_name || 'Unknown Device'}
                    </p>
                    
                    {device.is_current && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <FaGlobe className="w-3 h-3" />
                      <span>{device.ip_address || 'Unknown IP'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <FaClock className="w-3 h-3" />
                      <span>Last active: {formatLastActive(device.last_active)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Logout button (don't show for current device) */}
              {!device.is_current && (
                <button
                  onClick={() => handleLogoutDevice(device.id)}
                  disabled={actionLoading === device.id}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-50"
                  title="Logout from this device"
                >
                  {actionLoading === device.id ? (
                    <FaSpinner className="w-3 h-3 animate-spin" />
                  ) : (
                    <FaSignOutAlt className="w-3 h-3" />
                  )}
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500">
          For security, regularly review your devices and log out from devices you don't recognize.
        </p>
      </div>
    </div>
  );
};

export default DeviceList;