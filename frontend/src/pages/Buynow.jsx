import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { coursesAPI } from "../services/api";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Buynow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setAuthenticatedUser } = useAuth();
  const [selectedEmiOption, setSelectedEmiOption] = useState("full");
  const [emiAmount, setEmiAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Registration Form State
  const [registrationData, setRegistrationData] = useState({
    fullName: "",
    email: "",
    phone: "",
    studentClass: "",
    area: "",
    school: "",
    parentName: "",
    board: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get course data from navigation state
  const { courseData } = location.state || {};

  // EMIOptions
  const emiOptions = [
    { value: "full", label: "One-time Payment", months: 1 },
    { value: "3", label: "3 Months", months: 3 },
    { value: "6", label: "6 Months", months: 6 },
    { value: "9", label: "9 Months", months: 9 },
    { value: "12", label: "1 Year", months: 12 },
    { value: "24", label: "2 Years", months: 24 },
  ];

  const parseCurrency = (currencyString) => {
    if (!currencyString) return 0;
    let cleanString = currencyString.toString().trim();
    cleanString = cleanString.replace(/[₹$,]/g, "");
    if (cleanString.toLowerCase().includes("k")) {
      return parseFloat(cleanString.toLowerCase().replace("k", "")) * 1000;
    } else if (cleanString.toLowerCase().includes("l")) {
      return parseFloat(cleanString.toLowerCase().replace("l", "")) * 100000;
    } else {
      return parseFloat(cleanString) || 0;
    }
  };

  const getCourseDisplayInfo = () => {
    if (!courseData) return null;
    return {
      name: courseData.name,
      goal: courseData.class_level ? `Class ${courseData.class_level}` : courseData.name,
      mode: courseData.mode || "Offline",
      location: courseData.centre || courseData.location || "All Centres",
      price: `₹${courseData.course_price}`,
      duration: courseData.duration,
      start_date: courseData.start_date,
      thumbnail_url: courseData.thumbnail_url,
      id: courseData.id || courseData._id
    };
  };

  const courseInfo = getCourseDisplayInfo();

  useEffect(() => {
    if (!courseData) {
      navigate("/");
    }
    window.scrollTo(0, 0);
  }, [courseData, navigate]);

  useEffect(() => {
    if (courseData && courseData.course_price) {
      const price = parseCurrency(courseData.course_price);
      if (selectedEmiOption === "full") {
        setEmiAmount(price);
        setTotalAmount(price);
      } else {
        const selectedOption = emiOptions.find((option) => option.value === selectedEmiOption);
        if (selectedOption) {
          const monthlyAmount = price / selectedOption.months;
          setEmiAmount(monthlyAmount);
          setTotalAmount(price);
        }
      }
    }
  }, [courseData, selectedEmiOption]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleProceedToPayment = async () => {
    setError(null);

    // Validate Registration if not logged in
    if (!user) {
      if (!registrationData.fullName || !registrationData.email || !registrationData.phone || !registrationData.password || !registrationData.studentClass || !registrationData.area) {
        setError("Please fill all required fields (Name, Email, Phone, Class, Area, Password)");
        return;
      }
      if (registrationData.password !== registrationData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Simulate Payment Gateway
      // await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Prepare Payload
      const payload = {
        courseId: courseInfo.id,
        payment: {
          amount: totalAmount,
          method: 'card', // Mock
          emiOption: selectedEmiOption
        },
        user: !user ? registrationData : undefined
      };

      // 3. Call API
      
      const response = await coursesAPI.purchase(payload);
      

      // 4. Handle Success
      if (response.data.token && response.data.user) {
        setAuthenticatedUser(response.data.user, response.data.token);
        navigate("/my-courses");
      }
      else {
        console.warn("No token in purchase response, redirecting anyway", response.data);
        // If user was already logged in, normal navigation
        if (user) {
          navigate("/my-courses");
        } else {
          // Fallback for new user without token (should not happen if backend correct)
          navigate("/login", { state: { message: "Purchase successful! Please login." } });
        }
      }

    } catch (err) {
      console.error("Purchase failed:", err);
      setError(err.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const getSelectedEmiLabel = () => {
    const option = emiOptions.find((opt) => opt.value === selectedEmiOption);
    return option ? option.label : "One-time Payment";
  };

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white pt-20 mt-14 pb-8 sm:pt-24 sm:pb-12 md:pt-28 md:pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={handleBackToHome}
          className="text-emerald-600 font-semibold hover:text-emerald-700 transition mb-6"
        >
          ← Back to Home
        </button>

        <h2 className="text-4xl font-bold text-slate-900 mb-8">
          Complete Your Purchase
        </h2>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Registration Form (Only if not logged in) */}
            {!user && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-emerald-800 text-lg mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 text-sm">👤</span>
                  </span>
                  Student Registration
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={registrationData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter student's full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={registrationData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={registrationData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter 10-digit number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Class *</label>
                    <select
                      name="studentClass"
                      value={registrationData.studentClass}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select Class</option>
                      <option value="6">Class 6</option>
                      <option value="7">Class 7</option>
                      <option value="8">Class 8</option>
                      <option value="9">Class 9</option>
                      <option value="10">Class 10</option>
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                      <option value="Dropper">Dropper</option>
                      <option value="College">College</option>
                      <option value="Working Professional">Working Professional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Board</label>
                    <select
                      name="board"
                      value={registrationData.board}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select Board</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                      <option value="WBCSE">WBCSE</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Area/Locality *</label>
                    <input
                      type="text"
                      name="area"
                      value={registrationData.area}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter area/locality"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
                    <input
                      type="text"
                      name="school"
                      value={registrationData.school}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter school/college name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Parent's/Guardian's Name</label>
                    <input
                      type="text"
                      name="parentName"
                      value={registrationData.parentName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter parent's/guardian's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Create Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={registrationData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                        placeholder="Min. 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={registrationData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Course Summary */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
              {courseInfo.thumbnail_url && (
                <div className="mb-6 rounded-xl overflow-hidden h-48 border border-emerald-100 shadow-sm">
                  <img src={courseInfo.thumbnail_url} alt={courseInfo.name} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="font-semibold text-emerald-800 text-lg mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 text-sm">🎯</span>
                </span>
                Course Details
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-emerald-800 font-bold text-xl">{courseInfo.name}</p>
                      <p className="text-emerald-600 text-sm mt-1">{courseInfo.goal} • {courseInfo.mode}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-emerald-700">
                      <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs">📍</span>
                      </span>
                      Location: {courseInfo.location}
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between">
                    <div>
                      <p className="text-emerald-800 font-bold text-2xl">{courseInfo.price}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* EMI Options */}
            <div className="bg-slate-50 p-6 rounded-2xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Flexible Payment Options</h3>
              <div className="mb-6">
                <label className="block text-slate-900 font-semibold mb-3">Choose Payment Plan</label>
                <select
                  value={selectedEmiOption}
                  onChange={(e) => setSelectedEmiOption(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                >
                  {emiOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* EMI Breakdown */}
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3">Payment Breakdown</h4>
                {selectedEmiOption === "full" ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">One-time Payment</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(emiAmount)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex justify-between text-lg">
                        <span className="font-bold text-slate-900">Total Amount</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Monthly Installment</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(emiAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Duration</span>
                      <span className="font-semibold text-slate-900">{getSelectedEmiLabel()}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex justify-between text-lg">
                        <span className="font-bold text-slate-900">Total Amount</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-emerald-600 text-white p-6 rounded-2xl sticky top-24">
              <h3 className="text-2xl font-bold mb-6">Payment Summary</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Student Name</p>
                  <p className="font-semibold">{user ? user.fullName : (registrationData.fullName || "-")}</p>
                </div>
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Course</p>
                  <p className="font-semibold">{courseInfo.name}</p>
                </div>
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Total</p>
                  <p className="font-bold text-2xl">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
              <button
                onClick={handleProceedToPayment}
                disabled={loading}
                className="w-full py-3 bg-white text-emerald-600 rounded-lg font-bold hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : (selectedEmiOption === "full" ? "Pay Now" : "Start EMI Process")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Buynow;
