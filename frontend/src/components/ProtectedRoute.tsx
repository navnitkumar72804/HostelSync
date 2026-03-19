import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  // Check if there's a token and saved user data - this helps on page refresh
  const hasToken = localStorage.getItem('authToken');
  const savedUser = localStorage.getItem('userData');
  
  // If we have token and saved user data, user should be authenticated
  // This prevents logout on refresh
  if (hasToken && savedUser && (!user || !isAuthenticated)) {
    try {
      const parsedUser = JSON.parse(savedUser);
      // User will be restored by AuthContext, allow access temporarily
      return <>{children}</>;
    } catch (e) {
      // If parsing fails, continue to normal check
    }
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Only check roles if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;