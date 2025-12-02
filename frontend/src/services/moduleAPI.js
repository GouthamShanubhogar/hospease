/**
 * API Service Functions for Profile, Notifications, and Settings
 * Provides centralized API calls for the new modules
 */

// Get the base API URL from existing configuration
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

/**
 * Helper function to make authenticated API calls
 */
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };
  
  const response = await fetch(`${baseURL}${url}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// ===========================
// PROFILE API FUNCTIONS
// ===========================

export const profileAPI = {
  /**
   * Get user profile information
   * @param {number} userId - User ID
   */
  getProfile: async (userId) => {
    return apiCall(`/api/profile/${userId}`);
  },

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} profileData - Profile data to update
   */
  updateProfile: async (userId, profileData) => {
    return apiCall(`/api/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {Object} passwordData - Password change data
   */
  changePassword: async (userId, passwordData) => {
    return apiCall(`/api/profile/${userId}/password`, {
      method: 'PATCH',
      body: JSON.stringify(passwordData)
    });
  }
};

// ===========================
// SETTINGS API FUNCTIONS
// ===========================

export const settingsAPI = {
  /**
   * Get user settings
   * @param {number} userId - User ID
   */
  getSettings: async (userId) => {
    return apiCall(`/api/settings/${userId}`);
  },

  /**
   * Update user settings
   * @param {number} userId - User ID
   * @param {Object} settings - Settings to update
   */
  updateSettings: async (userId, settings) => {
    return apiCall(`/api/settings/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
};

// ===========================
// COMBINED API OBJECT
// ===========================

export const moduleAPI = {
  profile: profileAPI,
  settings: settingsAPI
};

// Default export for backward compatibility
export default moduleAPI;