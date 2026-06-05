import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Redirects unauthenticated users to /login.
 * Shows a loading spinner while the token is being validated on mount.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
