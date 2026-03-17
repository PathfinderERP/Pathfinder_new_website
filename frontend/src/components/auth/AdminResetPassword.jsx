import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { adminAuthAPI } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const AdminResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setValidToken(false);
        setError("No reset token provided");
        setVerifying(false);
        return;
      }

      try {
        const response = await adminAuthAPI.verifyResetToken(token);
        setValidToken(response.data.valid);
        if (!response.data.valid) {
          setError(response.data.error);
        }
      } catch (error) {
        setValidToken(false);
        setError("Invalid or expired reset token");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await adminAuthAPI.resetPassword({
        token,
        new_password: formData.new_password,
      });

      setMessage(response.data.message || "Password reset successfully");
      setTimeout(() => {
        navigate("/business/admin/login");
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
        <span className="ml-2 text-gray-600">Verifying reset token...</span>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={() => navigate("/business/admin/forgot-password")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {message}
              </div>
            )}

            <div>
              <label
                htmlFor="new_password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="mt-1">
                <input
                  id="new_password"
                  name="new_password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.new_password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your new password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? <LoadingSpinner size="small" /> : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminResetPassword;
