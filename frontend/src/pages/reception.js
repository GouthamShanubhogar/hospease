import React, { useEffect, useState } from 'react';
import { doctors } from '../services/api';
import Layout from '../components/Layout';
import { Typography, Card, CardContent, Grid, Button, TextField } from '@mui/material';

const ReceptionPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    doctors.list()
      .then(res => {
        if (mounted) setList(res.data || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const updateToken = async (id, value) => {
    try {
      await doctors.updateToken(id, { current_token: value });
      // update local list
      setList(prev => prev.map(d => d.doctor_id === id ? { ...d, current_token: value } : d));
    } catch (err) {
      console.error('Failed to update token', err);
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <Typography variant="h4" gutterBottom>Reception / Admin - Doctors</Typography>
        {loading && <div>Loading...</div>}

        <Grid container spacing={2}>
          {list.map(d => (
            <Grid item xs={12} sm={6} md={4} key={d.doctor_id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Dr. {d.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Hospital: {d.hospital_name}</Typography>
                  <div className="mt-3">
                    <TextField
                      type="number"
                      label="Current Token"
                      value={d.current_token || 0}
                      onChange={(e) => setList(prev => prev.map(item => item.doctor_id === d.doctor_id ? { ...item, current_token: parseInt(e.target.value || '0') } : item))}
                    />
                    <Button className="ml-2" variant="contained" onClick={() => updateToken(d.doctor_id, d.current_token || 0)}>Update</Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </Layout>
  );
};

export default ReceptionPage;
