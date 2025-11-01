import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CardActions,
  Button,
  Skeleton
} from '@mui/material';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, linkTo, loading = false }) => {
  return (
  <Card sx={{ 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    '&:hover': {
      boxShadow: 6,
      transform: 'translateY(-2px)',
      transition: 'all 0.2s'
    }
  }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <Typography variant="h6" component="div" ml={1}>
          {title}
        </Typography>
      </Box>
      {loading ? (
        <Skeleton variant="rectangular" width="60%" height={40} />
      ) : (
        <Typography variant="h3" component="div" color="primary">
          {value}
        </Typography>
      )}
    </CardContent>
    <CardActions>
      <Button 
        component={Link} 
        to={linkTo} 
        size="small" 
        color="primary"
        disabled={loading}
      >
        View Details
      </Button>
    </CardActions>
  </Card>
);

export default StatCard;
);