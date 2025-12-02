import React from 'react';

const NotificationCard = ({ notification }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h4 className="font-medium">{notification.title}</h4>
      <p className="text-gray-600">{notification.message}</p>
    </div>
  );
};

export default NotificationCard;