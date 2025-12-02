import React from 'react';

/**
 * SettingsToggle Component
 * Toggle switch for boolean settings with labels and descriptions
 */
const SettingsToggle = ({ 
  label, 
  description, 
  checked, 
  onChange, 
  disabled = false,
  className = '' 
}) => {
  return (
    <div className={`flex items-start justify-between py-3 ${className}`}>
      <div className="flex-1 min-w-0 mr-4">
        <label 
          htmlFor={`toggle-${label.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-sm font-medium text-gray-900 cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        )}
      </div>
      
      {/* Toggle Switch */}
      <div className="flex-shrink-0">
        <button
          type="button"
          id={`toggle-${label.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${checked ? 'bg-blue-600' : 'bg-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          role="switch"
          aria-checked={checked}
          aria-labelledby={`toggle-${label.toLowerCase().replace(/\s+/g, '-')}-label`}
        >
          <span
            aria-hidden="true"
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
    </div>
  );
};

export default SettingsToggle;