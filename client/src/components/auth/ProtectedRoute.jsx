import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { showError } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      showError('Please sign in to access this page.');
    }
  }, [user, loading, showError]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying session..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
