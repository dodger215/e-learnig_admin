import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  getCurrentUser,
  getStoredUser 
} from '../services/auth';

const AuthContext = createContext({});

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Try to get user from API first
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (apiError) {
          // If API fails, try to get from local storage
          console.log('API auth check failed, trying local storage:', apiError);
          const storedUser = getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      if (response.token) {
        localStorage.setItem('token', response.token);
        setUser(response);
        message.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      message.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    message.success('Logged out successfully');
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        loading,
        checkAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};