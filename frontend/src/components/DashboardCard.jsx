import React from 'react';

const DashboardCard = ({ title, value, subtitle, icon }) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-5 flex items-center space-x-4 hover:shadow-xl transition-shadow">
      <div className="p-3 rounded-lg bg-blue-50 text-blue-600">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
      </div>
    </div>
  );
};

export default DashboardCard;
