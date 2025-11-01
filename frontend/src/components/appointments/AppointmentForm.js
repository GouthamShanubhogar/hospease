import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const AppointmentForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  doctors = [], 
  departments = [],
  initialValues = {},
  loading = false
}) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    doctorId: '',
    department: '',
    date: null,
    time: null,
    notes: '',
    ...initialValues
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    setErrors({ ...errors, [field]: '' });
  };

  const handleDateChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientName) newErrors.patientName = 'Required';
    if (!formData.patientPhone) newErrors.patientPhone = 'Required';
    if (!formData.doctorId) newErrors.doctorId = 'Required';
    if (!formData.department) newErrors.department = 'Required';
    if (!formData.date) newErrors.date = 'Required';
    if (!formData.time) newErrors.time = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialValues?.id ? 'Edit Appointment' : 'New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient Name"
                value={formData.patientName}
                onChange={handleChange('patientName')}
                error={!!errors.patientName}
                helperText={errors.patientName}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient Phone"
                value={formData.patientPhone}
                onChange={handleChange('patientPhone')}
                error={!!errors.patientPhone}
                helperText={errors.patientPhone}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.department}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  onChange={handleChange('department')}
                  label="Department"
                  disabled={loading}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.department_id || dept.id} value={dept.department_id || dept.id}>
                      {dept.department_name || dept.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.department && (
                  <FormHelperText>{errors.department}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.doctorId}>
                <InputLabel>Doctor</InputLabel>
                <Select
                  value={formData.doctorId}
                  onChange={handleChange('doctorId')}
                  label="Doctor"
                  disabled={loading}
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.doctor_id || doctor.id} value={doctor.doctor_id || doctor.id}>
                      {doctor.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.doctorId && (
                  <FormHelperText>{errors.doctorId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={handleDateChange('date')}
                disabled={loading}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Time"
                value={formData.time}
                onChange={handleDateChange('time')}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.time,
                    helperText: errors.time
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleChange('notes')}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentForm;