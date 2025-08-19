import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Jika sedang loading, tampilkan spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Jika belum terautentikasi, redirect ke login
  if (!isAuthenticated()) {
    window.location.href = '/login';
    return null;
  }

  return children;
}
