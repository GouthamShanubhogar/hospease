import React, { useEffect, useState } from 'react';
import { doctors } from '../services/api';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Layout from '../components/Layout';

const DoctorsPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    doctors.list()
      .then(res => {
        if (mounted) setList(res.data || []);
      })
      .catch(err => setError(err.message || 'Failed to load'))
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, []);

  return (
    <Layout>
      <div className="py-6">
        <Typography variant="h4" gutterBottom className="mb-4">Doctors</Typography>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        <Grid container spacing={2}>
          {list.map((d) => (
            <Grid item xs={12} sm={6} md={4} key={d.id || d._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Dr. {d.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{d.specialty}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </Layout>
  );
};

export default DoctorsPage;
