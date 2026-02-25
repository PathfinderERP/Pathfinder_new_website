import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./common/LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const { user, isStudentAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
        <p className="ml-4 text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!isStudentAuthenticated) {
    // Redirect to register page with return url
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
