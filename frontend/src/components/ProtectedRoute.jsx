import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loading-wrapper">
        <LoadingSpinner message="Verifying authentication..." />
      </div>
    );
  }

  // Not logged in -> send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role restriction check
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If owner tries to access user page or vice versa, redirect to their home
    if (user?.role === "owner") {
      return <Navigate to="/owner" replace />;
    }
    return <Navigate to="/user" replace />;
  }

  return children;
};

export default ProtectedRoute;
