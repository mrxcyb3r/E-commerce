import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const FullscreenLoader: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-muted-foreground">Sessiya tekshirilmoqda…</p>
    </div>
  </div>
);

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, blocked, sessionChecked } = useAuth();
  const location = useLocation();

  if (!sessionChecked) {
    // Cold load: the DB identity check has not resolved yet. Show a loader
    // instead of redirecting to /login (that would flash the login page).
    return <FullscreenLoader />;
  }

  if (blocked) {
    return <Navigate to="/login?denied=1" state={{ from: location }} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;