// src/components/CounsellingModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { counsellingAPI } from "../services/api";

const CounsellingModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    preferredCourse: "",
    preferredTimeSlot: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const coursesList = [
    "WBJEE + JEE Main Preparation",
    "NEET UG Preparation",
    "Foundation Program (Class 8-10)",
    "Board Exam Preparation (Class 10 & 12)"
  ];

  const timeSlots = [
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Please enter your name";
    
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter your phone number";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!formData.preferredCourse) newErrors.preferredCourse = "Please select a course";
    if (!formData.preferredTimeSlot) newErrors.preferredTimeSlot = "Please select a time slot";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      const response = await counsellingAPI.book({
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        preferred_course: formData.preferredCourse,
        preferred_time_slot: formData.preferredTimeSlot,
      });

      if (response.data && response.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setFormData({
            fullName: "",
            phone: "",
            email: "",
            preferredCourse: "",
            preferredTimeSlot: "",
          });
          onClose();
        }, 2500);
      } else {
        setApiError("Failed to book session. Please try again.");
      }
    } catch (error) {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[99999] p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh] border border-gray-150">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-[#66090D] to-red-700 text-white p-6 pb-5 relative">
                <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <h2 className="text-2xl font-bold tracking-tight">Book Free Counselling</h2>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6 text-white" />
                  </button>
                </div>
                <p className="text-orange-100/90 text-sm mt-1.5 relative z-10 font-medium">
                  Connect with our expert educators to design your personalized academic roadmap.
                </p>
              </div>

              {/* Form Content */}
              <div className="overflow-y-auto p-6 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style]:none [scrollbar-width]:none">
                
                {isSuccess ? (
                  /* SUCCESS ANIMATION BLOCK */
                  <motion.div
                    className="flex flex-col items-center justify-center py-12 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 animate-bounce shadow-md">
                      <CheckCircleIcon className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-500 font-semibold max-w-sm">
                      We have scheduled your slot. An expert academic counsellor will reach out to you shortly.
                    </p>
                  </motion.div>
                ) : (
                  /* MAIN FORM */
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {apiError && (
                      <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800 font-semibold text-xs leading-snug">{apiError}</p>
                      </div>
                    )}

                    {/* Name */}
                    <div>
                      <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold transition-all ${
                            errors.fullName ? "border-red-400 bg-red-50/10" : "border-gray-200"
                          }`}
                          placeholder="Enter your name"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Mobile and Email Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Mobile */}
                      <div>
                        <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold transition-all ${
                              errors.phone ? "border-red-400 bg-red-50/10" : "border-gray-200"
                            }`}
                            placeholder="10-digit number"
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.phone}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <EnvelopeIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold transition-all ${
                              errors.email ? "border-red-400 bg-red-50/10" : "border-gray-200"
                            }`}
                            placeholder="your.email@example.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Preferred Course */}
                    <div>
                      <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                        Preferred Course
                      </label>
                      <div className="relative">
                        <AcademicCapIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <select
                          name="preferredCourse"
                          value={formData.preferredCourse}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold bg-white text-gray-900 transition-all ${
                            errors.preferredCourse ? "border-red-400 bg-red-50/10" : "border-gray-200"
                          }`}
                        >
                          <option value="">Select a Course</option>
                          {coursesList.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      {errors.preferredCourse && (
                        <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.preferredCourse}</p>
                      )}
                    </div>

                    {/* Preferred Time Slot */}
                    <div>
                      <label className="block text-gray-700 font-bold text-xs uppercase tracking-wider mb-2">
                        Preferred Time Slot
                      </label>
                      <div className="relative">
                        <ClockIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        <select
                          name="preferredTimeSlot"
                          value={formData.preferredTimeSlot}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#66090D]/30 focus:border-[#66090D] text-sm font-semibold bg-white text-gray-900 transition-all ${
                            errors.preferredTimeSlot ? "border-red-400 bg-red-50/10" : "border-gray-200"
                          }`}
                        >
                          <option value="">Select a Time Slot</option>
                          {timeSlots.map((ts) => (
                            <option key={ts} value={ts}>{ts}</option>
                          ))}
                        </select>
                      </div>
                      {errors.preferredTimeSlot && (
                        <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.preferredTimeSlot}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider bg-[#66090D] hover:bg-[#55080b] text-white shadow-lg active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Submitting..." : "Schedule Counselling Slot"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CounsellingModal;
