// src/components/LoginModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  KeyIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { landingAPI } from "../services/api";

const LoginModal = ({ isOpen, onClose, onSuccess, initialTab = "login" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Login Form State
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  
  // Register Form State
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    phone: "",
    student_class: "",
    area: "",
    school: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  // OTP Verification State for Register Tab
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Reset forms on tab switch
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setApiError("");
    setApiSuccess("");
    setIsVerifyingOtp(false);
    setOtpCode("");
  };

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (isVerifyingOtp && resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVerifyingOtp, resendCountdown]);

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
  };

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
  };

  const validateLoginForm = () => {
    const newErrors = {};
    if (!loginData.email.trim()) newErrors.email = "Please enter your email";
    if (!loginData.password.trim()) newErrors.password = "Please enter your password";
    if (loginData.email && !/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors = {};
    if (!registerData.fullName.trim()) newErrors.fullName = "Please enter your name";
    
    if (!registerData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!registerData.phone.trim()) {
      newErrors.phone = "Please enter your phone number";
    } else if (!/^\d{10}$/.test(registerData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }
    
    if (!registerData.student_class) newErrors.student_class = "Please select your class";
    if (!registerData.area.trim()) newErrors.area = "Please enter your area/city";
    if (!registerData.school.trim()) newErrors.school = "Please enter your school name";
    
    if (!registerData.password) {
      newErrors.password = "Please enter a password";
    } else if (registerData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isResending) return;
    setIsResending(true);
    setApiError("");
    setApiSuccess("");
    try {
      const otpRes = await landingAPI.sendOTP({
        email: registerData.email.trim(),
        name: registerData.fullName.trim(),
      });
      if (otpRes.data.success) {
        setResendCountdown(60);
        setOtpCode("");
        setApiSuccess("New verification code sent! Check your inbox & spam folder.");
      } else {
        setApiError(otpRes.data.message || "Failed to resend verification code.");
      }
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to resend verification code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === "login") {
      if (!validateLoginForm()) return;
      setIsSubmitting(true);
      setApiError("");
      try {
        const result = await login({
          email: loginData.email.trim(),
          password: loginData.password,
        });

        if (result.success) {
          setLoginData({ email: "", password: "" });
          setIsSubmitting(false);
          onClose();
          if (onSuccess) onSuccess();
        } else {
          setApiError(result.error || "Login failed. Please try again.");
        }
      } catch (error) {
        setApiError("Network error. Please check your connection.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // REGISTER TAB
      if (!isVerifyingOtp) {
        // Step 1: Validate form and send OTP
        if (!validateRegisterForm()) return;
        setIsSubmitting(true);
        setApiError("");
        setApiSuccess("");
        try {
          const otpRes = await landingAPI.sendOTP({
            email: registerData.email.trim(),
            name: registerData.fullName.trim(),
          });
          if (otpRes.data.success) {
            setIsVerifyingOtp(true);
            setResendCountdown(60);
            setOtpCode("");
            setApiSuccess("Verification code sent to your email!");
          } else {
            setApiError(otpRes.data.message || "Failed to send verification code.");
          }
        } catch (err) {
          setApiError(err.response?.data?.message || "Could not send verification code. Please check your email.");
        } finally {
          setIsSubmitting(false);
        }
      } else {
        // Step 2: Verify OTP and complete registration
        const cleanOtp = otpCode.trim();
        if (cleanOtp.length !== 6) {
          setApiError("Please enter the complete 6-digit verification code.");
          return;
        }

        setIsSubmitting(true);
        setApiError("");
        try {
          // 1. Verify OTP
          const verifyRes = await landingAPI.verifyOTP({
            email: registerData.email.trim(),
            otp: cleanOtp,
          });

          if (!verifyRes.data.success) {
            setApiError(verifyRes.data.message || "Invalid verification code.");
            setIsSubmitting(false);
            return;
          }

          // 2. Complete student account registration
          const result = await register({
            fullName: registerData.fullName.trim(),
            email: registerData.email.trim(),
            phone: registerData.phone.trim(),
            student_class: registerData.student_class,
            area: registerData.area.trim(),
            school: registerData.school.trim(),
            password: registerData.password,
            otp: cleanOtp,
          });

          if (result.success) {
            setRegisterData({
              fullName: "",
              email: "",
              phone: "",
              student_class: "",
              area: "",
              school: "",
              password: "",
            });
            setIsVerifyingOtp(false);
            setIsSubmitting(false);
            onClose();
            if (onSuccess) onSuccess();
          } else {
            setApiError(result.error || "Registration failed. Please try again.");
          }
        } catch (error) {
          setApiError(error.response?.data?.message || "Registration failed. Please try again.");
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const handleClose = () => {
    setLoginData({ email: "", password: "" });
    setRegisterData({
      fullName: "",
      email: "",
      phone: "",
      student_class: "",
      area: "",
      school: "",
      password: "",
    });
    setErrors({});
    setApiError("");
    setApiSuccess("");
    setIsVerifyingOtp(false);
    setOtpCode("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[99999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal Wrapper */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[99999] p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col max-h-[90vh] border border-gray-150">
              
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-[#66090D] to-red-700 text-white p-6 pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {activeTab === "login" ? "Welcome Back" : "Get Started"}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6 text-white" />
                  </button>
                </div>
                <p className="text-orange-100/90 text-sm mt-1">
                  {activeTab === "login"
                    ? "Sign in to access your admission dashboard"
                    : "Create a lifetime student profile to continue"
                  }
                </p>
              </div>

              {/* Tab Selector Buttons */}
              <div className="flex border-b border-gray-100 bg-gray-50/50 p-1">
                <button
                  type="button"
                  onClick={() => handleTabChange("login")}
                  className={`flex-1 py-3 text-center font-bold text-sm transition-all duration-200
                    ${activeTab === "login"
                      ? "text-[#66090D] border-b-2 border-[#66090D] bg-white rounded-t-xl"
                      : "text-gray-500 hover:text-gray-700"
                    }
                  `}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("register")}
                  className={`flex-1 py-3 text-center font-bold text-sm transition-all duration-200
                    ${activeTab === "register"
                      ? "text-[#66090D] border-b-2 border-[#66090D] bg-white rounded-t-xl"
                      : "text-gray-500 hover:text-gray-700"
                    }
                  `}
                >
                  Create Account
                </button>
              </div>

              {/* Form Content Area */}
              <div className="overflow-y-auto p-6 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style]:none [scrollbar-width]:none">
                
                {/* API Error Message */}
                {apiError && (
                  <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 font-semibold text-xs leading-snug">{apiError}</p>
                  </div>
                )}

                {/* API Success Message */}
                {apiSuccess && (
                  <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2.5">
                    <InformationCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-green-800 font-semibold text-xs leading-snug">{apiSuccess}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {activeTab === "login" ? (
                    /* LOGIN FORM FIELDS */
                    <>
                      <div>
                        <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={loginData.email}
                          onChange={handleLoginInputChange}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold transition-all ${
                            errors.email ? "border-red-400" : "border-gray-200"
                          }`}
                          placeholder="your.email@example.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={loginData.password}
                          onChange={handleLoginInputChange}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold transition-all ${
                            errors.password ? "border-red-400" : "border-gray-200"
                          }`}
                          placeholder="••••••••"
                        />
                        {errors.password && (
                          <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.password}</p>
                        )}
                      </div>
                    </>
                  ) : isVerifyingOtp ? (
                    /* OTP VERIFICATION VIEW */
                    <div className="space-y-4 py-1">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-orange-500/20">
                          <KeyIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 mb-1">Verify Your Email</h3>
                        <p className="text-gray-500 text-xs">
                          Enter the 6-digit verification code sent to your email
                        </p>
                      </div>

                      {/* Email Badge with Change Email Button */}
                      <div className="flex items-center justify-between p-3 bg-orange-50/70 border border-orange-200/60 rounded-xl">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <EnvelopeIcon className="w-4 h-4 text-orange-600 shrink-0" />
                          <span className="text-xs font-bold text-gray-800 truncate">{registerData.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsVerifyingOtp(false);
                            setApiError("");
                            setApiSuccess("");
                          }}
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 underline flex items-center gap-1 shrink-0 ml-2"
                        >
                          <ArrowLeftIcon className="w-3 h-3" />
                          Change
                        </button>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2 text-center">
                          Enter 6-Digit Code
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="• • • • • •"
                          autoFocus
                          className="w-full text-center text-2xl font-black tracking-[10px] px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 font-mono transition-all"
                        />
                      </div>

                      {/* Resend Timer & Action */}
                      <div className="flex items-center justify-between text-xs px-1 text-gray-500">
                        <span>Didn't receive email?</span>
                        {resendCountdown > 0 ? (
                          <span className="text-gray-500">
                            Resend in <strong className="text-orange-600 font-mono">{resendCountdown}s</strong>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isResending}
                            onClick={handleResendOtp}
                            className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <ArrowPathIcon className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                            {isResending ? "Sending..." : "Resend Code"}
                          </button>
                        )}
                      </div>

                      {/* SPAM / JUNK FOLDER PROMINENT CALLOUT */}
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-left">
                        <InformationCircleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[11.5px] text-amber-900 leading-snug">
                          <strong>Check Junk & Spam Folder:</strong> If you don't see the email in your inbox, please check your spam or junk folder.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* REGISTER FORM FIELDS */
                    <>
                      <div>
                        <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={registerData.fullName}
                          onChange={handleRegisterInputChange}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold transition-all ${
                            errors.fullName ? "border-red-400" : "border-gray-200"
                          }`}
                          placeholder="John Doe"
                        />
                        {errors.fullName && (
                          <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.fullName}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={registerData.email}
                            onChange={handleRegisterInputChange}
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold transition-all ${
                              errors.email ? "border-red-400" : "border-gray-200"
                            }`}
                            placeholder="john@example.com"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={registerData.phone}
                            onChange={handleRegisterInputChange}
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold transition-all ${
                              errors.phone ? "border-red-400" : "border-gray-200"
                            }`}
                            placeholder="10-digit mobile"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.phone}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                            Class Level
                          </label>
                          <select
                            name="student_class"
                            value={registerData.student_class}
                            onChange={handleRegisterInputChange}
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold bg-white text-gray-900 transition-all ${
                              errors.student_class ? "border-red-400" : "border-gray-200"
                            }`}
                          >
                            <option value="">Select Class</option>
                            <option value="Class 8">Class 8</option>
                            <option value="Class 9">Class 9</option>
                            <option value="Class 10">Class 10</option>
                            <option value="Class 11">Class 11</option>
                            <option value="Class 12">Class 12</option>
                            <option value="Repeater (12+)">Repeater (12+)</option>
                          </select>
                          {errors.student_class && (
                            <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.student_class}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                            Area / City
                          </label>
                          <input
                            type="text"
                            name="area"
                            value={registerData.area}
                            onChange={handleRegisterInputChange}
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold transition-all ${
                              errors.area ? "border-red-400" : "border-gray-200"
                            }`}
                            placeholder="e.g. Kolkata"
                          />
                          {errors.area && (
                            <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.area}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                          School Name
                        </label>
                        <input
                          type="text"
                          name="school"
                          value={registerData.school}
                          onChange={handleRegisterInputChange}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold transition-all ${
                            errors.school ? "border-red-400" : "border-gray-200"
                          }`}
                          placeholder="Your school name"
                        />
                        {errors.school && (
                          <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.school}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                          Create Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={registerData.password}
                          onChange={handleRegisterInputChange}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold transition-all ${
                            errors.password ? "border-red-400" : "border-gray-200"
                          }`}
                          placeholder="Min 6 characters"
                        />
                        {errors.password && (
                          <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.password}</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || (activeTab === "register" && isVerifyingOtp && otpCode.trim().length !== 6)}
                      className="w-full py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? (activeTab === "login" ? "Signing In..." : isVerifyingOtp ? "Verifying..." : "Sending Code...")
                        : (activeTab === "login" ? "Sign In" : isVerifyingOtp ? "Verify & Create Account" : "Proceed to Email Verification")
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
