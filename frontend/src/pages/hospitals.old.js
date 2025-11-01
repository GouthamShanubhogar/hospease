import React, { useEffect, useState } from 'react';
import { hospitals } from '../services/api';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const HospitalsPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    hospitals.list()
      .then(res => {
        if (mounted) setList(res.data || []);
      })
      .catch(err => setError(err.message || 'Failed to load'))
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/hospitals' } });
      return;
    }

    let mounted = true;
    hospitals.list()
      .then(res => {
        if (mounted) setList(res.data || []);
      })
      .catch(err => setError(err.message || 'Failed to load'))
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [isAuthenticated, navigate]);

  return (
    <Layout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4" className="mb-4">Hospitals</Typography>
          {user?.role === 'admin' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/hospitals/new')}
            >
              Add Hospital
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center">
            <CircularProgress />
          </div>
        ) : error ? (
          <div className="p-4 text-red-600 bg-red-50 rounded">
            {error}
          </div>
        ) : (
          <Grid container spacing={3}>
            {list.map((h) => (
              <Grid item xs={12} sm={6} md={4} key={h.id || h._id}>
                <Card className="h-full">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{h.name}</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>{h.address}</Typography>
                    {h.departments && (
                      <Typography variant="body2">
                        Departments: {h.departments.join(', ')}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {list.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" align="center">
                  No hospitals found.
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </div>
    </Layout>
  );
};

export default HospitalsPage;
