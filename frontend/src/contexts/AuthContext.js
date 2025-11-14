import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token with backend
          const response = await api.get('/api/auth/verify');
          
          if (response.data.status === 'success') {
            // Check for token refresh
            const newToken = response.headers['x-new-token'];
            if (newToken) {
              localStorage.setItem('token', newToken);
              api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            }
            setUser(parsedUser);
          } else {
            throw new Error('Token verification failed');
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
          // Token invalid/expired - clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      
      if (res.data.status === "success" && res.data.token && res.data.user) {
        const { token, user } = res.data;
        
        // Save in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update api header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(user);
        return user;
      } else {
        throw new Error(res.data.message || 'Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err.response?.data || err;
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/api/auth/register', userData);
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  // Update stored user data both in state and localStorage
  const updateUser = (newUser) => {
    setUser(newUser);
    try {
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (err) {
      console.error('Failed to persist user to localStorage', err);
    }
  };

  const hasRole = (requiredRoles) => {
    if (!user || !user.role) return false;
    if (!requiredRoles) return true;
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Admin has access to everything
    if (user.role === 'admin') return true;
    
    return roles.includes(user.role);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
    hasRole,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;