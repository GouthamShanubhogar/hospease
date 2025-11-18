import axios from 'axios';

// Frontend will call backend at port 5001
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

console.log('API Base URL:', baseURL); // Debug log

// Enhanced axios configuration with retry logic
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Function to check if backend is accessible
const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${baseURL}/health`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Function to show user-friendly error messages
const showConnectionError = () => {
  console.error('🚨 Backend Connection Error:', {
    message: 'Cannot connect to the HospEase backend server.',
    solutions: [
      '1. Make sure the backend server is running on port 5001',
      '2. Run: cd backend && npm start',
      '3. Check if port 5001 is blocked by firewall',
      '4. Verify database connection is working'
    ],
    troubleshooting: 'Check the browser console and backend logs for more details'
  });
  
  // Show user notification
  const event = new CustomEvent('backendConnectionError', {
    detail: {
      message: 'Backend server is not responding. Please contact support or try again later.',
      type: 'error'
    }
  });
  window.dispatchEvent(event);
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with retry logic
api.interceptors.response.use(
  (response) => {
    // Check for new token in response header
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors with retry logic
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || 
        error.message === 'Network Error' || !error.response) {
      
      // Check if we haven't exceeded retry attempts
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0;
      }
      
      if (originalRequest._retryCount < MAX_RETRIES) {
        originalRequest._retryCount += 1;
        
        console.warn(`🔄 Retrying request (${originalRequest._retryCount}/${MAX_RETRIES}) to ${originalRequest.url}`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * originalRequest._retryCount));
        
        // Check backend health before retrying
        const isHealthy = await checkBackendHealth();
        if (isHealthy || originalRequest._retryCount < MAX_RETRIES) {
          return api(originalRequest);
        }
      }
      
      // All retries failed
      console.error('🚨 Backend server connection failed after all retries');
      showConnectionError();
      
      // Return a user-friendly error
      return Promise.reject({
        ...error,
        userMessage: 'Unable to connect to the server. Please try again in a moment.',
        isConnectionError: true
      });
    }
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      const currentPath = window.location.pathname;
      const isAuthPath = currentPath === '/login' || currentPath === '/register' || currentPath === '/';
      const isVerifyRequest = error.config?.url?.includes('/api/auth/verify');
      
      // Don't redirect on verify requests - let AuthContext handle it
      if (!isVerifyRequest) {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        
        // Only redirect if not already on an auth page
        if (!isAuthPath) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// If a token is present in localStorage, set default Authorization header
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export const auth = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout')
};

export const hospitals = {
  list: () => api.get('/api/hospitals'),
  create: (data) => api.post('/api/hospitals', data),
  get: (id) => api.get(`/api/hospitals/${id}`)
};

export const doctors = {
  list: () => api.get('/api/doctors'),
  create: (data) => api.post('/api/doctors', data),
  get: (id) => api.get(`/api/doctors/${id}`),
  updateToken: (id, data) => api.put(`/api/doctors/${id}/token`, data),
};

export const appointments = {
  list: (params) => api.get('/api/appointments/all', { params }),
  create: (data) => api.post('/api/appointments/create', data),
  get: (id) => api.get(`/api/appointments/detail/${id}`),
  update: (id, data) => api.put(`/api/appointments/${id}`, data),
  cancel: (id) => api.post(`/api/appointments/${id}/cancel`),
  confirm: (id) => api.post(`/api/appointments/${id}/confirm`),
  complete: (id) => api.post(`/api/appointments/${id}/complete`),
  remove: (id) => api.delete(`/api/appointments/${id}`),
  getByDate: (date) => api.get(`/api/appointments/date/${date}`),
  getDoctorAppointments: (doctorId, params) => api.get(`/api/appointments/doctor/${doctorId}`, { params }),
};

export const patients = {
  list: () => api.get('/api/patients'),
  create: (data) => api.post('/api/patients', data),
  get: (id) => api.get(`/api/patients/${id}`),
  update: (id, data) => api.put(`/api/patients/${id}`, data),
  remove: (id) => api.delete(`/api/patients/${id}`),
  getStats: () => api.get('/api/patients/stats'),
};

export const beds = {
  list: (params) => api.get('/api/beds', { params }),
  get: (id) => api.get(`/api/beds/${id}`),
  create: (data) => api.post('/api/beds', data),
  update: (id, data) => api.put(`/api/beds/${id}`, data),
  remove: (id) => api.delete(`/api/beds/${id}`),
  assign: (id, data) => api.post(`/api/beds/${id}/assign`, data),
  release: (id) => api.post(`/api/beds/${id}/release`),
  getStats: () => api.get('/api/beds/stats'),
};

export const admissions = {
  list: (params) => api.get('/api/admissions', { params }),
  get: (id) => api.get(`/api/admissions/${id}`),
  create: (data) => api.post('/api/admissions', data),
  update: (id, data) => api.put(`/api/admissions/${id}`, data),
  discharge: (id, data) => api.post(`/api/admissions/${id}/discharge`, data),
  remove: (id) => api.delete(`/api/admissions/${id}`),
  getStats: () => api.get('/api/admissions/stats'),
};

export const payments = {
  list: (params) => api.get('/api/payments', { params }),
  get: (id) => api.get(`/api/payments/${id}`),
  create: (data) => api.post('/api/payments', data),
  update: (id, data) => api.put(`/api/payments/${id}`, data),
  remove: (id) => api.delete(`/api/payments/${id}`),
  getStats: () => api.get('/api/payments/stats'),
  getMonthlyRevenue: () => api.get('/api/payments/monthly-revenue'),
  getPatientPayments: (patientId) => api.get(`/api/payments/patient/${patientId}`),
};

export const prescriptions = {
  list: (params) => api.get('/api/prescriptions', { params }),
  get: (id) => api.get(`/api/prescriptions/${id}`),
  create: (data) => api.post('/api/prescriptions', data),
  update: (id, data) => api.put(`/api/prescriptions/${id}`, data),
  remove: (id) => api.delete(`/api/prescriptions/${id}`),
  getPatientPrescriptions: (patientId) => api.get(`/api/prescriptions/patient/${patientId}`),
  getDoctorPrescriptions: (doctorId) => api.get(`/api/prescriptions/doctor/${doctorId}`),
};

export const labReports = {
  list: (params) => api.get('/api/lab-reports', { params }),
  get: (id) => api.get(`/api/lab-reports/${id}`),
  create: (data) => api.post('/api/lab-reports', data),
  update: (id, data) => api.put(`/api/lab-reports/${id}`, data),
  remove: (id) => api.delete(`/api/lab-reports/${id}`),
  getStats: () => api.get('/api/lab-reports/stats'),
  getPatientReports: (patientId) => api.get(`/api/lab-reports/patient/${patientId}`),
  getByStatus: (status) => api.get(`/api/lab-reports/status/${status}`),
};

export const departments = {
  list: (params) => api.get('/api/departments', { params }),
  get: (id) => api.get(`/api/departments/${id}`),
  create: (data) => api.post('/api/departments', data),
  update: (id, data) => api.put(`/api/departments/${id}`, data),
  remove: (id) => api.delete(`/api/departments/${id}`),
};

export const dashboard = {
  getStats: () => api.get('/api/dashboard/stats'),
  getRecentActivity: () => api.get('/api/dashboard/recent-activity'),
};

// Token queue management
export const queue = {
  getCurrentToken: (doctorId, params) => api.get(`/api/appointments/doctor/${doctorId}/current-token`, { params }),
  advanceToken: (doctorId, params) => api.post(`/api/appointments/doctor/${doctorId}/advance-token`, null, { params }),
  resetToken: (doctorId) => api.post(`/api/appointments/doctor/${doctorId}/reset-token`),
};

export const wards = {
  list: () => api.get('/api/wards'),
  get: (id) => api.get(`/api/wards/${id}`),
  updateBed: (wardId, bedId, data) => api.put(`/api/wards/${wardId}/beds/${bedId}`, data),
};

export const billing = {
  createInvoice: (data) => api.post('/api/billing', data),
  getInvoices: () => api.get('/api/billing'),
};

export default api;
