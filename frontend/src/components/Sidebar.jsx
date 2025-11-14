import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { hasRole, user } = useAuth();
  const location = useLocation();

  // Define menu items with role-based access and icons
  const items = [
      { 
      to: '/dashboard', 
      label: 'Dashboard', 
      roles: [],
      icon: null
    },
    { 
      to: '/appointments', 
      label: 'Appointments', 
      roles: [],
      icon: null
    },
    { 
      to: '/patients', 
      label: 'Patients', 
      roles: ['admin', 'doctor', 'staff'],
      icon: null
    },
    { 
      to: '/doctors', 
      label: 'Doctors', 
      roles: ['admin', 'staff'],
      icon: null
    },
    { 
      to: '/hospitals', 
      label: 'Hospitals', 
      roles: [],
      icon: null
    },
    { 
      to: '/wards', 
      label: 'Wards', 
      roles: ['admin', 'staff'],
      icon: null
    },
    { 
      to: '/billing', 
      label: 'Billing', 
      roles: ['admin', 'staff'],
      icon: null
    },
    { 
      to: '/reception', 
      label: 'Reception', 
      roles: ['admin', 'staff'],
      icon: null
    },
  ];

  // Filter items based on user role
  const visibleItems = items.filter(item => 
    item.roles.length === 0 || (user && hasRole(item.roles))
  );

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen text-white fixed shadow-large z-40">
      {/* Logo/Brand */}
          <div className="px-6 py-5 border-b border-gray-700">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-6 h-6 bg-gradient-blue rounded-lg flex items-center justify-center group-hover:shadow-glow-sm transition-all duration-300"></div>
          <span className="text-sm font-display font-bold">HospEase</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group text-sm ${
                isActive 
                  ? 'bg-gradient-blue text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <span className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info Footer */}
      {user && (
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-xs">
              {user.name ? user.name[0].toUpperCase() : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{user.name}</div>
              <div className="text-xs text-gray-400 capitalize">{user.role}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
