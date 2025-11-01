import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Chip,
  Box,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const HospitalDetailsDialog = ({ open, onClose, hospital }) => {
  if (!hospital) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{hospital.name}</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={hospital.address}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={hospital.phone}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Departments */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Departments
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {hospital.departments?.map((dept, index) => (
                <Chip key={index} label={dept} />
              ))}
            </Box>
          </Grid>

          {/* Capacity */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Capacity
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Beds"
                  value={hospital.beds?.total || 0}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Available Beds"
                  value={hospital.beds?.available || 0}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Staff */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Staff
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Doctors"
                  value={hospital.staff?.doctors || 0}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Nurses"
                  value={hospital.staff?.nurses || 0}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Other Staff"
                  value={hospital.staff?.other || 0}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Additional Information */}
          {hospital.additionalInfo && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Additional Information
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={hospital.additionalInfo}
                InputProps={{ readOnly: true }}
                variant="filled"
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HospitalDetailsDialog;