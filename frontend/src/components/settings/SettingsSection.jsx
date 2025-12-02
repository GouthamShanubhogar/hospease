import React from 'react';

/**
 * SettingsSection Component
 * Wrapper component for settings sections with title and description
 */
const SettingsSection = ({ 
  icon, 
  title, 
  description, 
  children, 
  className = '',
  isLast = false 
}) => {
  const IconComponent = icon;
  
  return (
    <div className={`${!isLast ? 'border-b border-gray-200 pb-8 mb-8' : ''} ${className}`}>
      {/* Section Header */}
      <div className="flex items-start space-x-3 mb-6">
        {IconComponent && (
          <div className="flex-shrink-0 mt-1">
            <IconComponent className="w-5 h-5 text-blue-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Section Content */}
      <div className="ml-8">
        {children}
      </div>
    </div>
  );
};

export default SettingsSection;