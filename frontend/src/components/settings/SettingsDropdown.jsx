import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

/**
 * SettingsDropdown Component
 * Dropdown select for settings with options
 */
const SettingsDropdown = ({ 
  label, 
  description, 
  value, 
  options, 
  onChange, 
  disabled = false,
  className = '' 
}) => {
  return (
    <div className={`py-3 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 mr-4">
          <label 
            htmlFor={`dropdown-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            {label}
          </label>
          {description && (
            <p className="text-sm text-gray-500 mb-2">
              {description}
            </p>
          )}
        </div>
        
        {/* Dropdown */}
        <div className="flex-shrink-0 w-48">
          <div className="relative">
            <select
              id={`dropdown-${label.toLowerCase().replace(/\s+/g, '-')}`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={`
                block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
                appearance-none
              `}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* Dropdown Arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <FaChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDropdown;