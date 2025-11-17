import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faHospital } from "@fortawesome/free-solid-svg-icons";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [errors, setErrors] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess("");
    setValidationErrors({});

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/auth/register", {
        name,
        email,
        password,
        role,
      });
      setSuccess(response.data.message || "Registered successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setErrors([err.response.data.message]);
      } else {
        setErrors(["An error occurred during registration. Please try again."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <FontAwesomeIcon icon={faHospital} className="text-black text-xl" />
            <span className="text-lg font-normal text-black">Hospease</span>
          </div>
          <h2 className="text-3xl font-bold text-black mb-2">Create Account</h2>
          <p className="text-sm text-gray-700">Please enter your details to register</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-xs font-medium">{success}</p>
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-red-700 text-xs">{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-normal text-black mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 text-sm border ${
                  validationErrors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all bg-white placeholder-gray-400`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationErrors.name) {
                    setValidationErrors({ ...validationErrors, name: "" });
                  }
                }}
                disabled={loading}
              />
              {validationErrors.name && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-normal text-black mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                className={`w-full px-4 py-3 text-sm border ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all bg-white placeholder-gray-400`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: "" });
                  }
                }}
                disabled={loading}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-normal text-black mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a strong password"
                className={`w-full px-4 py-3 text-sm border ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all bg-white placeholder-gray-400`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) {
                    setValidationErrors({ ...validationErrors, password: "" });
                  }
                }}
                disabled={loading}
              />
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
              )}
              {!validationErrors.password && password && (
                <p className="text-xs text-gray-500 mt-1">Min. 8 chars with uppercase, lowercase & number</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-normal text-black mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Re-enter your password"
                className={`w-full px-4 py-3 text-sm border ${
                  validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all bg-white placeholder-gray-400`}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (validationErrors.confirmPassword) {
                    setValidationErrors({ ...validationErrors, confirmPassword: "" });
                  }
                }}
                disabled={loading}
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-normal text-black mb-2">
                Role
              </label>
              <select
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all bg-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Hospital Admin</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-sky-300 text-white text-base rounded-lg font-normal hover:bg-sky-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin h-5 w-5 mr-2" />
                Creating Account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <RouterLink to="/login" className="text-blue-400 hover:text-blue-500 font-medium">
              Login here
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  );
}
