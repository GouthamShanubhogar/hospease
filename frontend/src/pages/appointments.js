import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import AppointmentList from '../components/appointments/AppointmentList';
import AppointmentForm from '../components/appointments/AppointmentForm';
import { useSocket } from '../services/socket';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { joinRoom } = useSocket();

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        const [appointmentsRes, doctorsRes, departmentsRes] = await Promise.all([
          api.get(`/api/appointments?page=${page + 1}&limit=${rowsPerPage}`),
          api.get('/api/doctors'),
          api.get('/api/departments')
        ]);

        if (mounted) {
          const appointments = appointmentsRes.data.appointments || [];
          setAppointments(appointments);
          setTotalCount(appointmentsRes.data.total || 0);
          setDoctors(doctorsRes.data || []);
          setDepartments(departmentsRes.data || []);

          // Join socket rooms for relevant users/doctors
          appointments.forEach(a => {
            if (a.patient_id) joinRoom(`user_${a.patient_id}`);
            if (a.doctor_id) joinRoom(`doctor_${a.doctor_id}`);
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load appointments');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => (mounted = false);
  }, [page, rowsPerPage, joinRoom]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setFormOpen(true);
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await api.delete(`/api/appointments/${appointmentId}`);
        setAppointments(appointments.filter(a => a.id !== appointmentId));
        setTotalCount(prev => prev - 1);
      } catch (err) {
        setError('Failed to delete appointment');
      }
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/api/appointments/${appointmentId}/status`, { status: newStatus });
      setAppointments(appointments.map(a => 
        a.id === appointmentId ? { ...a, status: newStatus } : a
      ));
    } catch (err) {
      setError('Failed to update appointment status');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedAppointment) {
        await api.put(`/api/appointments/${selectedAppointment.id}`, formData);
      } else {
        await api.post('/api/appointments', formData);
      }
      
      // Refresh the list
      const res = await api.get(`/api/appointments?page=${page + 1}&limit=${rowsPerPage}`);
      setAppointments(res.data.appointments || []);
      setTotalCount(res.data.total || 0);
      
      setFormOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      setError('Failed to save appointment');
    }
  };

  return (
    <Layout>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Appointments</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedAppointment(null);
              setFormOpen(true);
            }}
          >
            New Appointment
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <AppointmentList
          appointments={appointments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          userRole={user?.role}
        />

        <AppointmentForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedAppointment(null);
          }}
          onSubmit={handleSubmit}
          doctors={doctors}
          departments={departments}
          initialValues={selectedAppointment}
        />
      </Box>
    </Layout>
  );
};

export default AppointmentsPage;