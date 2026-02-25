import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const RegistrationPage = ({ onClose, onSwitchToLogin }) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get course data from navigation state (if coming from Buy Now)
  const { courseData } = location.state || {};

  const [formData, setFormData] = useState({
    fullName: "",
    class: "",
    area: "",
    school: "",
    phone: "",
    email: "",
    password: "",
    parentName: "",
    board: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fixed useEffect - simplified scroll behavior
  useEffect(() => {
    // Scroll to top when component mounts or course data changes
    window.scrollTo(0, 0);
  }, [courseData]); // Re-run when courseData changes

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim())
      newErrors.fullName = "Please enter your full name";
    if (!formData.class) newErrors.class = "Please select your class";
    if (!formData.area.trim()) newErrors.area = "Please enter your area";
    if (!formData.phone.trim())
      newErrors.phone = "Please enter your phone number";
    if (!formData.email.trim()) newErrors.email = "Please enter your email";
    if (!formData.password.trim())
      newErrors.password = "Please enter your password";
    if (formData.phone && !/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Please enter a valid 10-digit phone number";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email address";
    if (formData.password && formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Determine redirect destination
      let redirectTo = null;
      if (courseData) {
        // If coming from Buy Now, redirect to buynow page
        redirectTo = "/buynow";
      }

      const result = await register(
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          student_class: formData.class,
          area: formData.area,
          school: formData.school,
          parentName: formData.parentName || "",
          board: formData.board || "",
        },
        redirectTo
      );

      if (result.success) {
        console.log("Registration successful");

        if (onClose) {
          // If modal, close it
          onClose();
        } else {
          // If standalone page, handle redirect
          if (courseData) {
            // Redirect to buynow with course data
            navigate("/buynow", {
              state: { courseData },
            });
          } else {
            // Redirect to home page
            navigate("/");
          }
        }
      } else {
        alert(`Registration failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  // Format course data for display
  const getCourseDisplayInfo = () => {
    if (!courseData) return null;

    return {
      name: courseData.name,
      goal: courseData.class_level
        ? `Class ${courseData.class_level}`
        : courseData.name,
      mode: courseData.mode || "Offline",
      location: courseData.centre || courseData.location || "All Centres",
      price: `₹${courseData.course_price}`,
      duration: courseData.duration,
    };
  };

  const courseInfo = getCourseDisplayInfo();

  return (
    <section
      id="hero"
      className="bg-white pt-20 mt-14 pb-8 sm:pt-24 sm:pb-12 md:pt-28 md:pb-16"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          {/* Show back button only when not in modal */}
          {!onClose && (
            <button
              onClick={handleBackToHome}
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition mb-4 flex items-center justify-center mx-auto"
            >
              ← Back to Home
            </button>
          )}
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {courseData
              ? "Complete Registration to Enroll"
              : "Create Your Account"}
          </h1>
          <p className="text-slate-600 text-lg">
            {courseData
              ? `Register to enroll in your selected course`
              : "Join Pathfinder to access all features"}
          </p>
        </div>

        {/* Show course info if coming from Buy Now */}
        {courseInfo && (
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-6 mb-8 shadow-sm">
            <h3 className="font-semibold text-emerald-800 text-lg mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-sm">🎯</span>
              </span>
              Selected Course
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-emerald-800 font-bold text-xl">
                    {courseInfo.name}
                  </p>
                  <p className="text-emerald-600 text-sm mt-1">
                    {courseInfo.goal} • {courseInfo.mode}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-700">
                  <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs">📍</span>
                  </span>
                  Location: {courseInfo.location}
                </div>
                {courseInfo.duration && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <span className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs">⏱️</span>
                    </span>
                    Duration: {courseInfo.duration}
                  </div>
                )}
              </div>
              <div className="text-right flex flex-col justify-between">
                <div>
                  <p className="text-emerald-800 font-bold text-2xl">
                    {courseInfo.price}
                  </p>
                  <p className="text-emerald-600 text-sm mt-1">
                    One-time payment
                  </p>
                </div>
                <div className="mt-4">
                  <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
                    New Batch
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-slate-900 font-semibold mb-2"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                    errors.fullName ? "border-rose-500" : "border-slate-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-rose-600 text-sm mt-1">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Class */}
              <div>
                <label
                  htmlFor="class"
                  className="block text-slate-900 font-semibold mb-2"
                >
                  Class *
                </label>
                <select
                  id="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                    errors.class ? "border-rose-500" : "border-slate-300"
                  }`}
                >
                  <option value="">Select your class</option>
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                  <option value="Dropper">Dropper</option>
                  <option value="College">College</option>
                  <option value="Working Professional">
                    Working Professional
                  </option>
                </select>
                {errors.class && (
                  <p className="text-rose-600 text-sm mt-1">{errors.class}</p>
                )}
              </div>

              {/* Board */}
              <div>
                <label
                  htmlFor="board"
                  className="block text-slate-900 font-semibold mb-2"
                >
                  Board
                </label>
                <select
                  id="board"
                  value={formData.board}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                >
                  <option value="">Select your board</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="WBCSE">WBCSE</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-slate-900 font-semibold mb-2"
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                    errors.phone ? "border-rose-500" : "border-slate-300"
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="text-rose-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
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
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                    errors.email ? "border-rose-500" : "border-slate-300"
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-rose-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
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
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                    errors.password ? "border-rose-500" : "border-slate-300"
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-rose-600 text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Area/Locality */}
              <div>
                <label
                  htmlFor="area"
                  className="block text-slate-900 font-semibold mb-2"
                >
                  Area/Locality *
                </label>
                <input
                  type="text"
                  id="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent ${
                    errors.area ? "border-rose-500" : "border-slate-300"
                  }`}
                  placeholder="Enter your area/locality"
                />
                {errors.area && (
                  <p className="text-rose-600 text-sm mt-1">{errors.area}</p>
                )}
              </div>

              {/* School Name */}
              <div>
                <label
                  htmlFor="school"
                  className="block text-slate-900 font-semibold mb-2"
                >
                  School Name
                </label>
                <input
                  type="text"
                  id="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  placeholder="Enter your school/college name"
                />
              </div>

              {/* Parent's Name */}
              <div>
                <label
                  htmlFor="parentName"
                  className="block text-slate-900 font-semibold mb-2"
                >
                  Parent's/Guardian's Name
                </label>
                <input
                  type="text"
                  id="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  placeholder="Enter parent's/guardian's name"
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl transition font-bold text-lg shadow-lg hover:shadow-xl ${
                  isSubmitting
                    ? "bg-emerald-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                } text-white`}
              >
                {isSubmitting
                  ? "Creating Account..."
                  : courseData
                  ? "Complete Registration & Enroll"
                  : "Create Account"}
              </button>
            </div>

            {/* Show login link only when onSwitchToLogin prop exists */}
            {onSwitchToLogin && (
              <div className="mt-6 text-center">
                <p className="text-slate-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold underline"
                  >
                    Login here
                  </button>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default RegistrationPage;
