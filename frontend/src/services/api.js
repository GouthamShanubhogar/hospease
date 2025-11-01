import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
});

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
  get: (id) => api.get(`/api/doctors/${id}`)
};

export const appointments = {
  list: () => api.get('/api/appointments'),
  create: (data) => api.post('/api/appointments', data),
  get: (id) => api.get(`/api/appointments/${id}`)
};

export default api;
