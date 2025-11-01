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
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

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
  const { joinRoom, notifications } = useSocket();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    appointments.list()
      .then(res => {
        if (mounted) {
          const data = res.data || [];
          setList(data);
          // Join socket rooms for relevant users/doctors so we receive updates
          data.forEach(a => {
            if (a.patient_id) joinRoom(`user_${a.patient_id}`);
            if (a.doctor_id) joinRoom(`doctor_${a.doctor_id}`);
          });
        }
      })
      .catch(err => setError(err.message || 'Failed to load'))
      .finally(() => mounted && setLoading(false));

    // Fetch doctors to populate currentTokens map initially
    doctors.list()
      .then(res => {
        const docs = res.data || [];
        const map = {};
        docs.forEach(d => {
          const id = d.doctor_id || d.id;
          map[id] = d.current_token || d.currentToken || 0;
          // join doctor room for live updates
          if (id) joinRoom(`doctor_${id}`);
        });
        if (mounted) setCurrentTokens(map);
      })
      .catch(() => {});

    return () => (mounted = false);
  }, []);

  // Update currentTokens map when socket token updates arrive
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    notifications.forEach(n => {
      if (n.type === 'token_update') {
        setCurrentTokens(prev => ({ ...prev, [n.doctorId]: n.currentToken }));
      }
    });
  }, [notifications]);

  return (
    <Layout>
      <div className="py-6">
        <Typography variant="h4" gutterBottom className="mb-4">Appointments</Typography>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        <Grid container spacing={2}>
          {list.map((a) => {
            const tokenNumber = a.token_number || a.tokenNumber || 0;
            const doctorId = a.doctor_id || a.doctorId;
            const patientName = a.patient_name || a.patientName || '';
            const date = a.appointment_date || a.date || '';
            const time = a.preferred_time ? new Date(a.preferred_time).toLocaleTimeString() : '';
            const doctorName = a.doctor_name || a.doctorName || '';
            const currentToken = currentTokens[doctorId] || 0;
            const remaining = tokenNumber - currentToken;
            const estimatedWait = remaining > 0 ? remaining * 10 : 0; // assume 10 min per consult

            return (
              <Grid item xs={12} sm={6} md={4} key={a.appointment_id || a.id || JSON.stringify(a)}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{patientName}</Typography>
                    <Typography variant="body2" color="text.secondary">{date} - {time}</Typography>
                    <Typography variant="body2" color="text.secondary">Doctor: {doctorName}</Typography>
                    <div className="mt-4">
                      <TokenDisplay tokenNumber={tokenNumber} currentToken={currentToken} estimatedWait={estimatedWait} />
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </div>
    </Layout>
  );
};

export default AppointmentsPage;
