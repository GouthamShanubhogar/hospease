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
import HospitalCard from '../components/hospitals/HospitalCard';
import HospitalDetailsDialog from '../components/hospitals/HospitalDetailsDialog';

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const canManage = user?.role === 'admin' || user?.role === 'staff';

  useEffect(() => {
    let mounted = true;
    const fetchHospitals = async () => {
      try {
        const response = await api.get('/api/hospitals');
        if (mounted) {
          setHospitals(response.data || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load hospitals');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHospitals();
    return () => (mounted = false);
  }, []);

  const handleEdit = (hospital) => {
    navigate(`/hospitals/edit/${hospital.id}`);
  };

  const handleDelete = async (hospitalId) => {
    if (window.confirm('Are you sure you want to delete this hospital?')) {
      try {
        await api.delete(`/api/hospitals/${hospitalId}`);
        setHospitals(hospitals.filter(h => h.id !== hospitalId));
      } catch (err) {
        setError('Failed to delete hospital');
      }
    }
  };

  const handleViewDetails = (hospital) => {
    setSelectedHospital(hospital);
    setDetailsOpen(true);
  };

  return (
    <Layout>
      <Box className="py-6">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Hospitals</Typography>
          {canManage && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/hospitals/new')}
              startIcon={<AddIcon />}
            >
              Add Hospital
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {loading ? (
            Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <HospitalCard loading={true} />
              </Grid>
            ))
          ) : (
            hospitals.map((hospital) => (
              <Grid item xs={12} sm={6} md={4} key={hospital.id}>
                <HospitalCard
                  hospital={hospital}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                  canManage={canManage}
                />
              </Grid>
            ))
          )}
          {!loading && hospitals.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No hospitals found
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        <HospitalDetailsDialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          hospital={selectedHospital}
        />
      </Box>
    </Layout>
  );
};

export default HospitalsPage;