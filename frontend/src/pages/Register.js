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
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = () => {
    const newValidation = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;

    // Name validation
    if (!formData.name) {
      newValidation.name = 'Name is required';
      isValid = false;
    } else if (formData.name.length < 2) {
      newValidation.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Email validation
    if (!formData.email) {
      newValidation.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newValidation.email = 'Please enter a valid email';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newValidation.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newValidation.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newValidation.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newValidation.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setValidation(newValidation);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const response = await auth.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.data) {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                bgcolor: 'primary.main',
                p: 2,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <PersonAddIcon className="text-white" />
            </Box>

            <Typography component="h1" variant="h5" className="mb-4">
              Create your account
            </Typography>

            {error && (
              <Alert severity="error" className="mb-4 w-full">
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} className="w-full">
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={formData.name}
                onChange={handleChange}
                error={!!validation.name}
                helperText={validation.name}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!validation.password}
                helperText={validation.password}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!validation.confirmPassword}
                helperText={validation.confirmPassword}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="mt-4 py-3"
              >
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
              <Box className="mt-4 text-center">
                <Link component={RouterLink} to="/login" variant="body2">
                  {"Already have an account? Sign In"}
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Register;