import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Grid, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/api/user/profile');
        if (!mounted) return;
        if (res.data && res.data.status === 'success') {
          const u = res.data.user;
          setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '', role: u.role || '' });
          updateUser && updateUser(u);
        } else if (res.data && res.data.user) {
          // fallback for endpoints that return just the user
          const u = res.data.user || res.data;
          setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '', role: u.role || '' });
          updateUser && updateUser(u);
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        mounted && setLoading(false);
      }
    };
    // initialize from context immediately for snappy UI
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', role: user.role || '' });
      setLoading(false);
    }
    load();
    return () => (mounted = false);
  }, [user, updateUser]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = { name: form.name, phone: form.phone };
      const res = await api.put('/api/user/profile', payload);
      if (res.data && res.data.status === 'success' && res.data.user) {
        updateUser && updateUser(res.data.user);
        setSuccess('Profile updated');
      } else if (res.data) {
        // fallback
        updateUser && updateUser(res.data);
        setSuccess('Profile updated');
      } else {
        setError('Unexpected server response');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <Box className="py-6">
        <Paper className="p-6 max-w-3xl mx-auto">
          <Typography variant="h5" gutterBottom>My Profile</Typography>
          {error && <Alert severity="error" className="mb-4">{error}</Alert>}
          {success && <Alert severity="success" className="mb-4">{success}</Alert>}

          <form onSubmit={handleSave}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Name" fullWidth value={form.name} onChange={handleChange('name')} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Email" fullWidth value={form.email} disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Phone" fullWidth value={form.phone} onChange={handleChange('phone')} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Role" fullWidth value={form.role} disabled />
              </Grid>

              <Grid item xs={12} className="mt-4">
                <Button type="submit" variant="contained" color="primary" disabled={saving || loading}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Layout>
  );
};

export default ProfilePage;
