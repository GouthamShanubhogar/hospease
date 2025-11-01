import React from 'react';
import { Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useSocket } from '../services/socket';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const { notifications } = useSocket();
  const unreadCount = notifications.length;

  return (
    <IconButton
      component={Link}
      to="/notifications"
      color="inherit"
      aria-label={`${unreadCount} notifications`}
    >
      <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationBell;