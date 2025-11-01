import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import Layout from '../components/Layout';
import {
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Alert,
  Link,
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState({ email: '', password: '' });

  const validateForm = () => {
    const newValidation = { email: '', password: '' };
    let isValid = true;

    if (!form.email) {
      newValidation.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newValidation.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!form.password) {
      newValidation.password = 'Password is required';
      isValid = false;
    } else if (form.password.length < 6) {
      newValidation.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setValidation(newValidation);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (validation[name]) {
      setValidation(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const res = await auth.login(form);
      if (res.data) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box
        className="max-w-md mx-auto mt-8 px-4"
        component="main"
      >
        <Paper elevation={3} className="p-8">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                m: 1,
                bgcolor: 'secondary.main',
                p: 2,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <LockOutlinedIcon className="text-white" />
            </Box>

            <Typography component="h1" variant="h5" className="mb-4">
              Sign in to HospEase
            </Typography>

            {error && (
              <Alert severity="error" className="mb-4 w-full">
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} className="w-full space-y-4">
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={form.email}
                onChange={handleChange}
                error={!!validation.email}
                helperText={validation.email}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                error={!!validation.password}
                helperText={validation.password}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="mt-4 py-3"
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
              <Box className="mt-4 text-center">
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Login;
