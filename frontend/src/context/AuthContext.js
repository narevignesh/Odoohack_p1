import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on component mount
    const checkAuth = async () => {
      try {
        if (authAPI.isAuthenticated()) {
          const storedUser = authAPI.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Try to get current user from API
            const currentUser = await authAPI.getCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(currentUser));
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        authAPI.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const newUser = await authAPI.register(userData);
      // After successful registration, automatically log in
      const loginResponse = await authAPI.login(userData.email, userData.password);
      setUser(loginResponse.user);
      setIsAuthenticated(true);
      return { success: true, user: loginResponse.user };
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle structured error responses from backend
      let errorMessage = error.message;
      if (error.response && error.response.data && error.response.data.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'object' && detail.message) {
          errorMessage = detail.message;
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authAPI.updateUser(user.id, userData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};