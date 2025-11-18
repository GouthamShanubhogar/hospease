import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography, 
  TextField,
  Grid,
  MenuItem,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const steps = ['Patient Information', 'Appointment Booking', 'Confirmation'];

const PatientRegistrationAndBooking = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [registeredPatient, setRegisteredPatient] = useState(null);
  
  // Doctors and departments state
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Patient form data
  const [patientData, setPatientData] = useState({
    patientName: '',
    dateOfBirth: null,
    gender: '',
    contact: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyContactName: '',
    bloodGroup: '',
    patientType: 'Outpatient',
    insurance: '',
    insuranceProvider: '',
    insuranceNumber: '',
    notes: ''
  });

  // Appointment form data
  const [appointmentData, setAppointmentData] = useState({
    doctorId: '',
    department: '',
    appointmentDate: null,
    appointmentTime: null,
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchDoctorsAndDepartments();
  }, []);

  const fetchDoctorsAndDepartments = async () => {
    try {
      const [doctorsRes, departmentsRes] = await Promise.all([
        api.get('/api/doctors'),
        api.get('/api/departments')
      ]);
      
      setDoctors(doctorsRes.data.success ? doctorsRes.data.data : []);
      setDepartments(departmentsRes.data.success ? departmentsRes.data.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const validatePatientForm = () => {
    const newErrors = {};
    
    if (!patientData.patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!patientData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!patientData.gender) newErrors.gender = 'Gender is required';
    if (!patientData.contact.trim()) newErrors.contact = 'Contact is required';
    if (!patientData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAppointmentForm = () => {
    const newErrors = {};
    
    if (!appointmentData.doctorId) newErrors.doctorId = 'Please select a doctor';
    if (!appointmentData.department) newErrors.department = 'Please select a department';
    if (!appointmentData.appointmentDate) newErrors.appointmentDate = 'Please select appointment date';
    if (!appointmentData.appointmentTime) newErrors.appointmentTime = 'Please select appointment time';
    if (!appointmentData.reason.trim()) newErrors.reason = 'Please provide reason for visit';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePatientSubmit = async () => {
    if (!validatePatientForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/api/patients/register', {
        name: patientData.patientName,
        email: patientData.email,
        phone: patientData.contact,
        date_of_birth: patientData.dateOfBirth ? format(patientData.dateOfBirth, 'yyyy-MM-dd') : null,
        gender: patientData.gender,
        address: patientData.address,
        blood_group: patientData.bloodGroup,
        emergency_contact: patientData.emergencyContact,
        emergency_contact_name: patientData.emergencyContactName,
        patient_type: patientData.patientType,
        insurance_provider: patientData.insuranceProvider,
        insurance_number: patientData.insuranceNumber,
        notes: patientData.notes
      });

      if (response.data.success) {
        setRegisteredPatient(response.data.data);
        setActiveStep(1); // Move to appointment booking
        setSuccess('Patient registered successfully! Now let\'s book an appointment.');
      }
    } catch (error) {
      console.error('Error registering patient:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Error registering patient. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentSubmit = async () => {
    if (!validateAppointmentForm()) {
      return;
    }

    if (!registeredPatient) {
      setErrors({ submit: 'Patient registration required first.' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Combine date and time
      const appointmentDate = new Date(appointmentData.appointmentDate);
      const appointmentTime = appointmentData.appointmentTime;
      
      // Set hours and minutes from time picker
      appointmentDate.setHours(appointmentTime.getHours());
      appointmentDate.setMinutes(appointmentTime.getMinutes());

      const response = await api.post('/api/appointments', {
        patient_id: registeredPatient.id,
        doctor_id: appointmentData.doctorId,
        appointment_datetime: appointmentDate.toISOString(),
        reason: appointmentData.reason,
        notes: appointmentData.notes,
        status: 'scheduled'
      });

      if (response.data.success) {
        setActiveStep(2); // Move to confirmation
        setSuccess('Appointment booked successfully!');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Error booking appointment. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      handlePatientSubmit();
    } else if (activeStep === 1) {
      handleAppointmentSubmit();
    } else {
      // Final step - redirect to appointments
      navigate('/appointments');
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setErrors({});
  };

  const renderPatientForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Patient Name"
          value={patientData.patientName}
          onChange={(e) => setPatientData({ ...patientData, patientName: e.target.value })}
          error={!!errors.patientName}
          helperText={errors.patientName}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={patientData.email}
          onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
          error={!!errors.email}
          helperText={errors.email}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Phone Number"
          value={patientData.contact}
          onChange={(e) => setPatientData({ ...patientData, contact: e.target.value })}
          error={!!errors.contact}
          helperText={errors.contact}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date of Birth"
            value={patientData.dateOfBirth}
            onChange={(newValue) => setPatientData({ ...patientData, dateOfBirth: newValue })}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                required
              />
            )}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.gender} required>
          <InputLabel>Gender</InputLabel>
          <Select
            value={patientData.gender}
            onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
            label="Gender"
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
          {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Blood Group"
          value={patientData.bloodGroup}
          onChange={(e) => setPatientData({ ...patientData, bloodGroup: e.target.value })}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          multiline
          rows={2}
          value={patientData.address}
          onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Emergency Contact Name"
          value={patientData.emergencyContactName}
          onChange={(e) => setPatientData({ ...patientData, emergencyContactName: e.target.value })}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Emergency Contact Phone"
          value={patientData.emergencyContact}
          onChange={(e) => setPatientData({ ...patientData, emergencyContact: e.target.value })}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Additional Notes"
          multiline
          rows={3}
          value={patientData.notes}
          onChange={(e) => setPatientData({ ...patientData, notes: e.target.value })}
        />
      </Grid>
    </Grid>
  );

  const renderAppointmentForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info">
          Patient {patientData.patientName} has been registered successfully. Now let's book an appointment.
        </Alert>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.department} required>
          <InputLabel>Department</InputLabel>
          <Select
            value={appointmentData.department}
            onChange={(e) => setAppointmentData({ ...appointmentData, department: e.target.value })}
            label="Department"
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
          {errors.department && <FormHelperText>{errors.department}</FormHelperText>}
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.doctorId} required>
          <InputLabel>Doctor</InputLabel>
          <Select
            value={appointmentData.doctorId}
            onChange={(e) => setAppointmentData({ ...appointmentData, doctorId: e.target.value })}
            label="Doctor"
          >
            {doctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                Dr. {doctor.name} - {doctor.specialization}
              </MenuItem>
            ))}
          </Select>
          {errors.doctorId && <FormHelperText>{errors.doctorId}</FormHelperText>}
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Appointment Date"
            value={appointmentData.appointmentDate}
            onChange={(newValue) => setAppointmentData({ ...appointmentData, appointmentDate: newValue })}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={!!errors.appointmentDate}
                helperText={errors.appointmentDate}
                required
              />
            )}
            minDate={new Date()}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <TimePicker
            label="Appointment Time"
            value={appointmentData.appointmentTime}
            onChange={(newValue) => setAppointmentData({ ...appointmentData, appointmentTime: newValue })}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={!!errors.appointmentTime}
                helperText={errors.appointmentTime}
                required
              />
            )}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Reason for Visit"
          value={appointmentData.reason}
          onChange={(e) => setAppointmentData({ ...appointmentData, reason: e.target.value })}
          error={!!errors.reason}
          helperText={errors.reason}
          required
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Additional Notes"
          multiline
          rows={3}
          value={appointmentData.notes}
          onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
        />
      </Grid>
    </Grid>
  );

  const renderConfirmation = () => (
    <Box textAlign="center">
      <Alert severity="success" sx={{ mb: 3 }}>
        Appointment booked successfully!
      </Alert>
      
      <Typography variant="h6" gutterBottom>
        Appointment Details
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Typography><strong>Patient:</strong> {patientData.patientName}</Typography>
        <Typography><strong>Email:</strong> {patientData.email}</Typography>
        <Typography><strong>Phone:</strong> {patientData.contact}</Typography>
        <Typography><strong>Doctor:</strong> {doctors.find(d => d.id === appointmentData.doctorId)?.name}</Typography>
        <Typography><strong>Department:</strong> {departments.find(d => d.id === appointmentData.department)?.name}</Typography>
        <Typography><strong>Date:</strong> {appointmentData.appointmentDate ? format(appointmentData.appointmentDate, 'yyyy-MM-dd') : ''}</Typography>
        <Typography><strong>Time:</strong> {appointmentData.appointmentTime ? format(appointmentData.appointmentTime, 'HH:mm') : ''}</Typography>
        <Typography><strong>Reason:</strong> {appointmentData.reason}</Typography>
      </Paper>
    </Box>
  );

  return (
    <Layout>
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Patient Registration & Appointment Booking
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errors.submit}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {activeStep === 0 && renderPatientForm()}
          {activeStep === 1 && renderAppointmentForm()}
          {activeStep === 2 && renderConfirmation()}

          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button
              onClick={handleNext}
              disabled={loading}
              variant="contained"
            >
              {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
              {activeStep === steps.length - 1 ? 'Go to Appointments' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default PatientRegistrationAndBooking;