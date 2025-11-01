import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { hasRole, user } = useAuth();
  const location = useLocation();

  // Define menu items with role-based access
  const items = [
    { to: '/dashboard', label: 'Dashboard', roles: [] }, // Available to all logged in users
    { to: '/appointments', label: 'Appointments', roles: [] },
    { to: '/patients', label: 'Patients', roles: ['admin', 'doctor', 'staff'] },
    { to: '/doctors', label: 'Doctors', roles: ['admin', 'staff'] },
    { to: '/hospitals', label: 'Hospitals', roles: [] },
    { to: '/wards', label: 'Wards', roles: ['admin', 'staff'] },
    { to: '/billing', label: 'Billing', roles: ['admin', 'staff'] },
    { to: '/reception', label: 'Reception', roles: ['admin', 'staff'] },
  ];

  // Filter items based on user role
  const visibleItems = items.filter(item => 
    item.roles.length === 0 || (user && hasRole(item.roles))
  );

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-blue-600 min-h-screen text-white fixed">
      <div className="px-6 py-6 border-b border-blue-500">
        <Link to="/" className="text-lg font-bold">HospEase</Link>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {visibleItems.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className={`block px-4 py-3 rounded-md transition-colors ${
              location.pathname === it.to 
                ? 'bg-blue-700' 
                : 'hover:bg-blue-500'
            }`}
          >
            {it.label}
          </Link>
        ))}
      </nav>
      {user && (
        <div className="p-4 border-t border-blue-500">
          <div className="text-sm opacity-75">Logged in as: {user.name}</div>
          <div className="text-xs opacity-50">{user.role}</div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
