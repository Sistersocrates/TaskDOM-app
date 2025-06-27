import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission 
}) => {
  const { isAuthenticated, hasPermission, isLoading, initialize } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      initialize();
    }
  }, [isAuthenticated, isLoading, initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-primary-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Redirect to home page for unauthorized access
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;