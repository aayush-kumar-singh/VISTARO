import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const { showError } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        showError('Please sign in with administrator credentials.');
      } else if (user.role !== 'admin') {
        showError('Access denied. Administrator privileges required.');
      }
    }
  }, [user, loading, showError]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying administrator credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
