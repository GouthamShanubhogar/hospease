import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHospital, faBell, faUser, faCog } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Patient Records', path: '/patients' },
    { name: 'Doctor Profiles', path: '/doctors' },
    { name: 'Appointments', path: '/appointments' },
    { name: 'Billing', path: '/billing' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faHospital} className="text-black text-xl" />
            <span className="text-lg font-normal text-black">Hospease</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm ${
                  location.pathname === link.path
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-700 hover:text-blue-600'
                } transition-colors`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-800">
              <FontAwesomeIcon icon={faBell} className="text-lg" />
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <FontAwesomeIcon icon={faCog} className="text-lg" />
            </button>
            <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-sm text-gray-600" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
