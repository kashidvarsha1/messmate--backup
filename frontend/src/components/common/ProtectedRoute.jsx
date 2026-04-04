import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Still loading user from localStorage — wait
  if (loading) {
    return <Loader />;
  }

  // Not logged in — redirect to login, remember where they came from
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check — support single role string or array of roles
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user?.role)) {
      console.warn(`Access denied: user role "${user?.role}" not in [${allowedRoles}]`);
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
