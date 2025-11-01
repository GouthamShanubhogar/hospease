import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip
} from '@mui/material';
import {
  Event as EventIcon,
  Notifications as NotificationIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const getActivityIcon = (type) => {
  switch (type) {
    case 'appointment':
      return <EventIcon color="primary" />;
    case 'notification':
      return <NotificationIcon color="info" />;
    default:
      return <UpdateIcon color="action" />;
  }
};

const getActivityColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const RecentActivity = ({ activities = [], loading = false }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>Recent Activity</Typography>
        <List>
          {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <ListItem>
                <ListItemIcon>
                  <UpdateIcon color="disabled" />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ width: '60%', bgcolor: 'grey.100', height: 10 }} />}
                  secondary={<Typography sx={{ width: '40%', bgcolor: 'grey.50', height: 8, mt: 1 }} />}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Recent Activity</Typography>
      <List>
        {activities.map((activity, index) => (
          <React.Fragment key={activity.id || index}>
            <ListItem>
              <ListItemIcon>
                {getActivityIcon(activity.type)}
              </ListItemIcon>
              <ListItemText
                primary={activity.description}
                secondary={format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
              />
              {activity.status && (
                <Chip
                  label={activity.status}
                  color={getActivityColor(activity.status)}
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </ListItem>
            {index < activities.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        {activities.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No recent activity"
              secondary="New activities will appear here"
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default RecentActivity;