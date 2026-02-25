import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  Bars3Icon
} from "@heroicons/react/24/outline";

import { clearAllAdminCache } from "../../hooks/useAdminCache";

const AdminHeader = ({ toggleSidebar, isSidebarOpen }) => {
  const { admin, adminLogout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    clearAllAdminCache();
    adminLogout();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Dashboard</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage your application content and users</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link
            to="/"
            className="hidden sm:flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-1.5" />
            View Site
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <SunIcon className="w-6 h-6 text-yellow-500" />
            ) : (
              <MoonIcon className="w-6 h-6 text-slate-700" />
            )}
          </button>

          <div className="h-6 w-px bg-gray-200 dark:border-slate-800 mx-2 sm:mx-4" />

          {/* User Profile Dropdown / Logout */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{admin?.full_name || "Admin"}</p>
              {admin?.is_superuser && (
                <span className="text-[10px] uppercase tracking-wider font-bold text-orange-600 dark:text-orange-500">
                  Super Admin
                </span>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all duration-200"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
