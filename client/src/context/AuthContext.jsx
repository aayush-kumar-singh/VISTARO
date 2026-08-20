import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { showSuccess, showError } = useToast();

  const checkAuth = useCallback(async () => {
    try {
      const data = await authApi.getCurrentUser();
      if (data.user) {
        setUser(data.user);
        setUnreadCount(data.unreadCount || 0);
      } else {
        setUser(null);
        setUnreadCount(0);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      setUser(data.user);
      showSuccess(data.message || 'Welcome back to Vistaro!');
      return data.user;
    } catch (err) {
      showError(err.message);
      throw err;
    }
  };

  const signup = async (userData) => {
    try {
      const data = await authApi.signup(userData);
      setUser(data.user);
      showSuccess(data.message || 'Welcome to Vistaro!');
      return data.user;
    } catch (err) {
      showError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setUnreadCount(0);
      showSuccess('Logged out successfully.');
    } catch (err) {
      showError(err.message);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        unreadCount,
        setUnreadCount,
        login,
        signup,
        logout,
        checkAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
