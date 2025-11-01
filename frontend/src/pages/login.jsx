import React, { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Alert,
  Link,
  CircularProgress,
  LinearProgress
} from "@mui/material";
import Layout from '../components/Layout';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the redirect path if it exists
  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Failed to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Layout>
      <Box className="max-w-md mx-auto mt-8 px-4">
        {loading && <LinearProgress className="fixed top-0 left-0 w-full" />}
        <Paper elevation={3} className="p-8">
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <Box sx={{
              m: 1,
              bgcolor: 'secondary.main',
              p: 2,
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
            }}>
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

            <Box component="form" onSubmit={handleLogin} className="w-full space-y-4">
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="mt-4 py-3"
              >
                {loading ? (
                  <CircularProgress size={24} className="text-white" />
                ) : (
                  'Sign In'
                )}
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
}
