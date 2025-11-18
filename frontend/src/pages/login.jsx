import React, { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faHospital, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import ConnectionError from "../components/ConnectionError";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showConnectionError, setShowConnectionError] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error details:', err);
      
      // Handle connection errors specifically
      if (err.isConnectionError || err.code === 'ERR_NETWORK' || 
          err.message?.includes('connect') || err.message?.includes('server')) {
        setShowConnectionError(true);
        setError('Unable to connect to the server. Please check your connection and try again.');
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setError(err.response.data.errors[0]);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message && !err.message.includes('Network Error')) {
        setError(err.message);
      } else {
        setError('Failed to login. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionRetry = async () => {
    try {
      // Test connection to backend
      const response = await fetch('http://localhost:5001/health');
      if (response.ok) {
        setShowConnectionError(false);
        setError('');
        return true;
      }
      throw new Error('Server not responding');
    } catch (error) {
      console.error('Connection retry failed:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <FontAwesomeIcon icon={faHospital} className="text-black text-xl" />
            <span className="text-lg font-normal text-black">Hospease</span>
          </div>
          <h2 className="text-3xl font-bold text-black mb-2">Welcome Back</h2>
          <p className="text-sm text-gray-700">Please enter your login details to continue</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-xs">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="space-y-5">
            {/* Username/Email Input */}
            <div>
              <label className="block text-sm font-normal text-black mb-2">Username</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: "" });
                  }
                }}
                className={`w-full px-4 py-3 text-sm border ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all bg-white placeholder-gray-400`}
                placeholder="Enter your username"
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-normal text-black mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (validationErrors.password) {
                    setValidationErrors({ ...validationErrors, password: "" });
                  }
                }}
                className={`w-full px-4 py-3 text-sm border ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all bg-white placeholder-gray-400`}
                placeholder="Enter your password"
              />
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-400 border-gray-300 rounded focus:ring-blue-400"
                />
                <span className="ml-2 text-sm text-black">Remember Me</span>
              </label>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-500">Forgot Password?</a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-300 text-white text-base rounded-lg font-normal hover:bg-sky-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin h-5 w-5 mr-2" />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <RouterLink to="/register" className="text-blue-400 hover:text-blue-500 font-medium">
              Sign up here
            </RouterLink>
          </p>
        </div>
      </div>
      
      {/* Connection Error Modal */}
      <ConnectionError 
        isVisible={showConnectionError}
        onRetry={handleConnectionRetry}
        onClose={() => setShowConnectionError(false)}
      />
    </div>
  );
}
