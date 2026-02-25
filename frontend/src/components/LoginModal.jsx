// src/components/LoginModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(""); // New state for API errors
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // Clear API error when user starts typing
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) newErrors.email = "Please enter your email";
    if (!formData.password.trim())
      newErrors.password = "Please enter your password";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email address";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(""); // Clear previous API errors

    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result.success) {
        console.log("Login successful");
        // Reset form and close modal
        setFormData({ email: "", password: "" });
        setErrors({});
        setApiError("");
        setIsSubmitting(false);
        setTimeout(() => {
          onClose(); // Close modal after a brief delay
        }, 100);
      } else {
        // Handle API error response
        if (result.error) {
          setApiError(result.error);
        } else {
          setApiError("Login failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      setApiError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: "", password: "" });
    setErrors({});
    setApiError(""); // Clear API error on close
    onClose();
  };



  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Welcome Back</h2>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <p className="text-orange-100 mt-2">Sign in to your account</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* API Error Message */}
                {apiError && (
                  <motion.div
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-800 font-medium text-sm">
                        {apiError}
                      </p>
                      <p className="text-red-600 text-xs mt-1">
                        Please check your email and password and try again.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setApiError("")}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-slate-900 font-semibold mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${errors.email ? "border-rose-500" : "border-slate-300"
                        } ${apiError ? "border-red-300 bg-red-50" : ""}`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="text-rose-600 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-slate-900 font-semibold mb-2"
                    >
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${errors.password ? "border-rose-500" : "border-slate-300"
                        } ${apiError ? "border-red-300 bg-red-50" : ""}`}
                      placeholder="Enter your password"
                    />
                    {errors.password && (
                      <p className="text-rose-600 text-sm mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-lg transition font-bold text-lg ${isSubmitting
                        ? "bg-emerald-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700"
                      } text-white`}
                  >
                    {isSubmitting ? "Signing In..." : "Sign In"}
                  </button>
                </div>


              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
