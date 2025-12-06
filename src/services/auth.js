import api from './api';

// Register a new user
export const register = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed';
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    // If token is invalid, clear storage
    if (error.response?.status === 401) {
      logout();
    }
    throw error.response?.data?.message || 'Failed to get user';
  }
};

// Create tutor (admin only)
export const createTutor = async (tutorData) => {
  try {
    const response = await api.post('/api/auth/create-tutor', tutorData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create tutor';
  }
};

// Update user profile
export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/api/auth/profile', userData);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update profile';
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to change password';
  }
};

// Request password reset
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to request password reset';
  }
};

// Reset password with token
export const resetPassword = async (token, password) => {
  try {
    const response = await api.post('/api/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to reset password';
  }
};

// Verify email
export const verifyEmail = async (token) => {
  try {
    const response = await api.post('/api/auth/verify-email', { token });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to verify email';
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('persist:root');
  // Clear any other auth-related storage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('auth_') || key.startsWith('user_')) {
      localStorage.removeItem(key);
    }
  });
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Check if token is expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

// Get stored user data
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

// Refresh token
export const refreshToken = async () => {
  try {
    const response = await api.post('/api/auth/refresh-token');
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to refresh token';
  }
};

// Validate token
export const validateToken = async () => {
  try {
    const response = await api.get('/api/auth/validate-token');
    return response.data.valid;
  } catch (error) {
    return false;
  }
};

// Get user permissions
export const getPermissions = async () => {
  try {
    const response = await api.get('/api/auth/permissions');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get permissions';
  }
};

// Update user role (admin only)
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/api/auth/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update user role';
  }
};

// Get user sessions
export const getUserSessions = async () => {
  try {
    const response = await api.get('/api/auth/sessions');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get sessions';
  }
};

// Revoke session
export const revokeSession = async (sessionId) => {
  try {
    const response = await api.delete(`/api/auth/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to revoke session';
  }
};

// Revoke all sessions (except current)
export const revokeAllSessions = async () => {
  try {
    const response = await api.delete('/api/auth/sessions/all');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to revoke sessions';
  }
};

// Export as default object for convenience
const authService = {
  register,
  login,
  getCurrentUser,
  createTutor,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  logout,
  isAuthenticated,
  getStoredUser,
  refreshToken,
  validateToken,
  getPermissions,
  updateUserRole,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
};

export default authService;