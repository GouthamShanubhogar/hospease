import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { useSocket } from '../services/socket';
import Layout from '../components/Layout';

const NotificationsPage = () => {
  const { notifications } = useSocket();

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderNotification = (notification) => {
    switch (notification.type) {
      case 'token_update':
        return (
          <Paper key={notification.id} className="p-4 mb-3">
            <Typography variant="subtitle2" color="text.secondary">
              {formatTime(notification.timestamp)}
            </Typography>
            <Typography>
              Current token for Doctor #{notification.doctorId}: {notification.currentToken}
            </Typography>
          </Paper>
        );
      case 'new_appointment':
        return (
          <Paper key={notification.id} className="p-4 mb-3">
            <Typography variant="subtitle2" color="text.secondary">
              {formatTime(notification.timestamp)}
            </Typography>
            <Typography>
              New appointment booked! Token number: {notification.appointment.token_number}
            </Typography>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Box className="py-6">
        <Typography variant="h4" gutterBottom>
          Notifications
        </Typography>
        
        {notifications.length === 0 ? (
          <Typography color="text.secondary">
            No notifications yet
          </Typography>
        ) : (
          notifications.map(renderNotification)
        )}
      </Box>
    </Layout>
  );
};

export default NotificationsPage;