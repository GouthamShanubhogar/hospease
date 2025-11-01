import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  EventNote as AppointmentIcon,
  People as PatientsIcon,
  Person as DoctorIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    hospitals: 0,
    appointments: 0,
    patients: 0,
    doctors: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard' } });
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/dashboard/activity')
        ]);
        
        setStats(statsRes.data);
        setRecentActivity(activityRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box p={3}>
          <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
            <Typography color="error" variant="h6">
              {error}
            </Typography>
          </Paper>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name || 'User'}
        </Typography>
        
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Hospitals"
              value={stats.hospitals}
              icon={<HospitalIcon color="primary" />}
              linkTo="/hospitals"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Appointments"
              value={stats.appointments}
              icon={<AppointmentIcon color="primary" />}
              linkTo="/appointments"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Patients"
              value={stats.patients}
              icon={<PatientsIcon color="primary" />}
              linkTo="/patients"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Doctors"
              value={stats.doctors}
              icon={<DoctorIcon color="primary" />}
              linkTo="/doctors"
            />
          </Grid>
        </Grid>

        <RecentActivity activities={recentActivity} />
      </Box>
    </Layout>
  );
};

export default Dashboard;