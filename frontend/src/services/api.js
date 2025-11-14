import axios from 'axios';

// Frontend will call backend through proxy at port 5000 during development
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
});

// Add response interceptors for handling auth errors and token refresh
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
  (error) => {
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
  list: () => api.get('/api/appointments'),
  create: (data) => api.post('/api/appointments', data),
  get: (id) => api.get(`/api/appointments/${id}`),
};

export const patients = {
  list: () => api.get('/api/patients'),
  create: (data) => api.post('/api/patients', data),
  get: (id) => api.get(`/api/patients/${id}`),
  update: (id, data) => api.put(`/api/patients/${id}`, data),
  remove: (id) => api.delete(`/api/patients/${id}`),
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
