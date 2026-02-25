import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const AdminProtectedRoute = ({ children, requiredPermission }) => {
  const { isAdminAuthenticated, admin, isLoading } = useAuth();
  const location = useLocation();

  // Helper to find the first available route for this admin
  const getFirstAvailableRoute = (adminObj) => {
    if (!adminObj) return "/admin/login";
    if (adminObj.is_superuser) return "/admin/dashboard";

    const permissions = adminObj.permissions || [];

    // Mapping of permissions to routes in priority order
    const permissionRoutes = [
      { perm: "view_dashboard", route: "/admin/dashboard" },
      { perm: "manage_courses", route: "/admin/courses" },
      { perm: "manage_blogs", route: "/admin/blog" },
      { perm: "manage_applications", route: "/admin/course-applications" },
      { perm: "manage_users", route: "/admin/users" },
    ];

    const firstAvailable = permissionRoutes.find(pr => permissions.includes(pr.perm));
    return firstAvailable ? firstAvailable.route : "/admin/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-slate-600 dark:text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Permission check
  if (requiredPermission) {
    const permissions = admin?.permissions || [];
    const isSuperuser = admin?.is_superuser || false;

    if (!isSuperuser && !permissions.includes(requiredPermission)) {
      console.warn(`Access denied for ${admin?.email}. Missing permission: ${requiredPermission}`);

      const targetRoute = getFirstAvailableRoute(admin);

      // Prevent redirect loops
      if (location.pathname === targetRoute) {
        // This shouldn't happen if getFirstAvailableRoute is correct, but safety first
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
              <p className="text-gray-600">You do not have permission to view any administrative modules.</p>
            </div>
          </div>
        );
      }

      return <Navigate to={targetRoute} replace />;
    }
  }

  return children;
};

export default AdminProtectedRoute;
