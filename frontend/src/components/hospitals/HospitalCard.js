import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  CardActions,
  Button,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const HospitalCard = ({
  hospital,
  onEdit,
  onDelete,
  onViewDetails,
  canManage = false,
  loading = false
}) => {
  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ height: 200, bgcolor: 'grey.100', mb: 2 }} />
          <Box sx={{ width: '60%', mb: 1 }}>
            <LinearProgress />
          </Box>
          <Box sx={{ width: '40%', mb: 2 }}>
            <LinearProgress />
          </Box>
          <Box sx={{ width: '80%' }}>
            <LinearProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s'
        }
      }}
    >
      {hospital.imageUrl && (
        <CardMedia
          component="img"
          height="140"
          image={hospital.imageUrl}
          alt={hospital.name}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <HospitalIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            {hospital.name}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {hospital.address}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={2}>
          <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {hospital.phone}
          </Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="body2" gutterBottom>
            Bed Availability:
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="h6" color="primary">
              {hospital.beds?.available || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary" ml={1}>
              / {hospital.beds?.total || 0} beds
            </Typography>
          </Box>
        </Box>

        <Box>
          {hospital.departments?.map((dept, index) => (
            <Chip
              key={index}
              label={dept}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          size="small"
          color="primary"
          onClick={() => onViewDetails(hospital)}
        >
          View Details
        </Button>
        {canManage && (
          <Box>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => onEdit(hospital)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(hospital.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardActions>
    </Card>
  );
};

export default HospitalCard;