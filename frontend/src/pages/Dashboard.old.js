import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  EventNote as AppointmentIcon,
  People as PatientsIcon,
  Person as DoctorIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useEffect } from 'react';

const StatCard = ({ title, value, icon, linkTo }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <Typography variant="h6" component="div" ml={1}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
    <CardActions>
      <Button component={Link} to={linkTo} size="small">
        View Details
      </Button>
    </CardActions>
  </Card>
);

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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard' } });
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // These would be real API calls in production
        const statsData = await api.get('/api/dashboard/stats');
        const activityData = await api.get('/api/dashboard/activity');
        
        setStats(statsData.data);
        setRecentActivity(activityData.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  // Default values are now handled in useState

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

      {/* Recent Activity Section */}
      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        {/* Add recent activity list here */}
      </Paper>
    </Box>
    </Layout>
  );
};

export default Dashboard;