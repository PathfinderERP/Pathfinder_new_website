import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { coursesAPI, studentAuthAPI } from "../services/api";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  MapPin, 
  School, 
  ShieldCheck, 
  ArrowLeft, 
  Target, 
  CheckCircle2,
  Lock,
  BookOpen
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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

    let activeUser = user;

    // Create user account with registration details before proceeding to payment if not logged in
    if (!activeUser) {
      if (!registrationData.fullName || !registrationData.email || !registrationData.phone || !registrationData.password || !registrationData.studentClass || !registrationData.area) {
        setError("Please fill all required fields (Name, Email, Phone, Class, Area, Password)");
        return;
      }
      if (registrationData.password !== registrationData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      setLoading(true);
      try {
        const regRes = await studentAuthAPI.register({
          fullName: registrationData.fullName,
          email: registrationData.email,
          phone: registrationData.phone,
          student_class: registrationData.studentClass,
          area: registrationData.area,
          school: registrationData.school,
          board: registrationData.board,
          parentName: registrationData.parentName,
          password: registrationData.password
        });

        if (regRes.data && regRes.data.token && regRes.data.user) {
          setAuthenticatedUser(regRes.data.user, regRes.data.token);
          activeUser = regRes.data.user;
        } else {
          // If already registered or login returned without direct token, attempt login via axios directly to avoid interceptor 401 redirect
          const loginRes = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
            email: registrationData.email,
            password: registrationData.password
          });
          if (loginRes.data && loginRes.data.token) {
            setAuthenticatedUser(loginRes.data.user, loginRes.data.token);
            activeUser = loginRes.data.user;
          }
        }
      } catch (regErr) {
        console.error("Pre-payment registration notice:", regErr);
        // If user already exists, try logging in via raw axios to avoid interceptor 401 redirect to /login
        try {
          const loginRes = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
            email: registrationData.email,
            password: registrationData.password
          });
          if (loginRes.data && loginRes.data.token) {
            setAuthenticatedUser(loginRes.data.user, loginRes.data.token);
            activeUser = loginRes.data.user;
          } else {
            setError(regErr.response?.data?.error || regErr.response?.data?.details || "Account setup failed. Check credentials.");
            setLoading(false);
            return;
          }
        } catch (loginErr) {
          console.error("Pre-payment login error:", loginErr);
          const errDetail = loginErr.response?.data?.error || regErr.response?.data?.error || "Account exists or password incorrect. Check credentials.";
          setError(errDetail);
          setLoading(false);
          return;
        }
      }
    }

    setLoading(true);

    try {
      /* =========================================================
         RAZORPAY INTEGRATION (COMMENTED OUT FOR ICICI SWITCH)
         =========================================================
      // 1. Create Razorpay Order on Backend
      const orderRes = await coursesAPI.createRazorpayOrder(courseInfo.id);
      const orderData = orderRes.data;

      if (!orderData.success || !orderData.order_id) {
        throw new Error("Failed to generate order from server.");
      }

      // 2. Open Razorpay Checkout Dialog
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Pathfinder Academy",
        description: courseInfo.name,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            setLoading(true);
            
            // 3. Verify Payment on Backend
            const verifyPayload = {
              courseId: courseInfo.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user: !user ? registrationData : undefined
            };
            
            const verifyRes = await coursesAPI.verifyRazorpayPayment(verifyPayload);
            
            if (verifyRes.data.success && verifyRes.data.token && verifyRes.data.user) {
              setAuthenticatedUser(verifyRes.data.user, verifyRes.data.token);
              navigate("/my-courses");
            } else {
              setError("Payment signature verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Signature verification failed:", err);
            setError(err.response?.data?.error || "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user ? user.fullName : registrationData.fullName,
          email: user ? user.email : registrationData.email,
          contact: user ? user.phone : registrationData.phone,
        },
        theme: {
          color: "#66090D",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      ========================================================= */

      // ICICI PAYMENT GATEWAY INTEGRATION
      const merchantId = "100000000007164";
      const aggregatorID = "A100000000007164";
      const secretKey = "db06cca0-838b-4e01-8b20-6ac446ffb6bd";
      const saleUrl = "https://pgpayuat.icici.bank.in/tsp/pg/api/v2/initiateSale";

      const merchantTxnNo = `TXN${Date.now()}`;
      const txnDate = new Date().toISOString().replace(/[-T:\.Z]/g, "").slice(0, 14);
      const amount = totalAmount ? totalAmount.toFixed(2) : "0.00";
      const customerName = activeUser ? (activeUser.fullName || activeUser.full_name) : registrationData.fullName;
      const customerEmailID = activeUser ? activeUser.email : registrationData.email;
      const customerMobileNo = activeUser ? (activeUser.phone || "9876543210") : registrationData.phone;
      const returnURL = `${API_BASE_URL}/api/courses/icici/callback/`;

      const params = {
        merchantId,
        aggregatorID,
        merchantTxnNo,
        amount,
        currencyCode: "356",
        payType: "0", // Standard 3DS Redirection
        customerEmailID,
        transactionType: "SALE",
        returnURL,
        txnDate,
        customerMobileNo,
        customerName,
        addlParam1: courseInfo ? courseInfo.id : "",
        addlParam2: selectedEmiOption
      };

      // Generate HMAC-SHA256 secure hash from backend proxy service
      const hashRes = await axios.post(`${API_BASE_URL}/api/courses/icici/generate-hash/`, {
        mode: "v1",
        secretKey,
        params
      });

      if (!hashRes.data || !hashRes.data.success) {
        throw new Error("Failed to calculate payment security hash.");
      }

      const secureHash = hashRes.data.secureHash;
      const fullPayload = {
        ...params,
        secureHash
      };

      // Call ICICI Initiate Sale API via backend proxy
      const proxyRes = await axios.post(`${API_BASE_URL}/api/courses/icici/proxy/`, {
        target_url: saleUrl,
        payload_type: "json",
        payload: fullPayload
      });

      const resData = proxyRes.data;
      const responseContent = resData.data || resData;

      if (responseContent.redirectURI && responseContent.tranCtx) {
        // Direct to payment gateway redirection URL with tranCtx parameter
        window.location.href = `${responseContent.redirectURI}?tranCtx=${encodeURIComponent(responseContent.tranCtx)}`;
      } else if (responseContent.redirectURI) {
        window.location.href = responseContent.redirectURI;
      } else if (responseContent.targetUrl || responseContent.redirectUrl) {
        window.location.href = responseContent.targetUrl || responseContent.redirectUrl;
      } else {
        // Fallback: If gateway returned response status/message or details
        console.log("ICICI Response:", responseContent);
        throw new Error(responseContent.responseMessage || responseContent.message || "Payment initiation processed.");
      }

    } catch (err) {
      console.error("Payment initiation failed:", err);
      setError(err.response?.data?.error || err.message || "Failed to start payment process. Please try again.");
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
          <div className="text-lg font-semibold text-slate-700">Loading course details...</div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-slate-50 py-8 md:py-12 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={handleBackToHome}
          className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-800 transition mb-6 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">
          Complete Your Purchase
        </h2>

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm flex items-center gap-3 shadow-sm">
            <Lock className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Student Registration (If Not Logged In) */}
            {!user ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2.5">
                    <span className="p-2 bg-emerald-100/70 text-emerald-700 rounded-xl">
                      <User className="w-5 h-5" />
                    </span>
                    Student Registration & Account Setup
                  </h3>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                    Account created automatically before checkout
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="fullName"
                        value={registrationData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter student's full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        name="email"
                        value={registrationData.email}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="phone"
                        value={registrationData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter 10-digit number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Class *</label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        name="studentClass"
                        value={registrationData.studentClass}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Board</label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        name="board"
                        value={registrationData.board}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Select Board</option>
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State Board">State Board</option>
                        <option value="WBCSE">WBCSE</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Area/Locality *</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="area"
                        value={registrationData.area}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter area/locality"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">School Name</label>
                    <div className="relative">
                      <School className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="school"
                        value={registrationData.school}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter school/college name"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Parent's/Guardian's Name</label>
                    <input
                      type="text"
                      name="parentName"
                      value={registrationData.parentName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter parent's/guardian's name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={registrationData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={registrationData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
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
            ) : (
              /* Profile Card (If Already Registered & Logged In) */
              <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                      {(user.fullName || user.full_name || "S").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        {user.fullName || user.full_name || "Student"}
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </h3>
                      <p className="text-xs text-slate-500">Logged In Account</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Student
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                    <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{user.phone || user.mobile || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                    <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Class: {user.studentClass || user.student_class || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Area: {user.area || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Course Summary */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              {courseInfo.thumbnail_url && (
                <div className="mb-6 rounded-xl overflow-hidden h-48 border border-slate-100 shadow-sm">
                  <img src={courseInfo.thumbnail_url} alt={courseInfo.name} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                <span className="p-2 bg-emerald-100/70 text-emerald-700 rounded-xl">
                  <Target className="w-5 h-5" />
                </span>
                Course Details
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-900 font-bold text-xl">{courseInfo.name}</p>
                      <p className="text-emerald-700 font-medium text-sm mt-1">{courseInfo.goal} • {courseInfo.mode}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Location: {courseInfo.location}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between">
                    <div>
                      <p className="text-emerald-700 font-extrabold text-2xl">{courseInfo.price}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================
               FLEXIBLE PAYMENT OPTIONS (COMMENTED OUT AS REQUESTED)
               =========================================================
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
            ========================================================= */}

          </div>

          {/* Sidebar Payment Summary */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl sticky top-24 shadow-xl border border-slate-800">
              <h3 className="text-xl font-extrabold mb-6 border-b border-slate-800 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Payment Summary
              </h3>
              <div className="space-y-4 mb-6 text-sm">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Student Name</p>
                  <p className="font-semibold text-slate-100">
                    {user ? (user.fullName || user.full_name) : (registrationData.fullName || "-")}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Course</p>
                  <p className="font-semibold text-slate-100">{courseInfo.name}</p>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-slate-400 text-xs mb-1">Total Amount</p>
                  <p className="font-extrabold text-3xl text-emerald-400">{formatCurrency(totalAmount)}</p>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Pay Now"}
              </button>

              <div className="mt-3 text-center">
                <span className="text-[11px] font-mono text-emerald-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full inline-block">
                  Build Version: v1.0.4 (Live ICICI Gateway)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Buynow;
