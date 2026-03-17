import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-orange-600">404</h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition duration-300"
          >
            Go Back Home
          </Link>

          {/* <div className="text-sm text-gray-500">
            <Link
              to="/business/admin/login"
              className="text-orange-600 hover:text-orange-700"
            >
              Admin Login
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
