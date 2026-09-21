import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  PhoneIcon,
  AcademicCapIcon,
  BookOpenIcon,
  TrophyIcon,
  SparklesIcon,
  XMarkIcon,
  CreditCardIcon,
  LockClosedIcon,
  BuildingStorefrontIcon
} from "@heroicons/react/24/outline";
import Header from "../add_landingpage/common/Header";
import Footer from "../../components/Footer";
import { PROGRAMS, getProgram } from "./ShikshaBandhuData";
import { landingAPI, shikshaBandhuAPI, studentAuthAPI, coursesAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import env from "../../config/env";

const PATHFINDER_CENTRES = [
  "Hazra (Head Office, Kolkata)",
  "Barasat (North 24 Pgs, Kolkata)",
  "Behala (Manton Crossing, Kolkata)",
  "Dumdum (Dum Dum Road, Kolkata)",
  "Garia (South Kolkata)",
  "Jodhpur Park (Kolkata)",
  "Salt Lake (Sector V, Kolkata)",
  "Shyambazar (Kolkata)",
  "Baruipur (South 24 Pgs)",
  "Bagnan (Howrah)",
  "Bally (Howrah)",
  "Howrah (Maidan)",
  "Arambagh (Hooghly)",
  "Chandannagar (Hooghly)",
  "Chinsurah (Hooghly)",
  "Tarakeswar (Hooghly)",
  "Asansol (GT Road, Paschim Bardhaman)",
  "Burdwan (Dhaldighi, Purba Bardhaman)",
  "Durgapur (City Centre, Paschim Bardhaman)",
  "Kharagpur (Paschim Medinipur)",
  "Midnapore (Station Rd, Paschim Medinipur)",
  "Malda (English Bazar)",
  "Ranaghat (Nadia)",
  "Siliguri (College Para, Hill Cart Rd)",
  "Cooch Behar",
  "Jalpaiguri",
  "Raiganj (Uttar Dinajpur)",
  "Berhampore (Murshidabad)",
  "Purulia",
  "Bankura",
  "Tamluk (Purba Medinipur)",
  "Contai (Purba Medinipur)"
];

export const PublicReferralLanding = () => {
  const { referralId = "SB004", programSlug } = useParams();
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useAuth();

  const [availablePrograms, setAvailablePrograms] = useState(PROGRAMS);

  const findProgram = (idOrSlug) => {
    return availablePrograms.find(p => p.slug === idOrSlug || p.id === idOrSlug) || getProgram(idOrSlug);
  };

  const featuredProgram = (programSlug && findProgram(programSlug))
    || availablePrograms.find(p => p.featured) 
    || availablePrograms[0] 
    || PROGRAMS[0];

  const otherPrograms = availablePrograms.filter(p => (p.slug || p.id) !== (featuredProgram.slug || featuredProgram.id));

  useEffect(() => {
    if (referralId) {
      shikshaBandhuAPI.trackClick({ partner_id: referralId, program_slug: programSlug || "" })
        .catch((err) => console.error("Click tracking error:", err));
    }

    shikshaBandhuAPI.getItems(false).then((res) => {
      if (res.data && res.data.products && res.data.products.length > 0) {
        setAvailablePrograms(res.data.products);
      }
    }).catch((err) => console.warn("Notice: Using fallback static programs", err));
  }, [referralId, programSlug]);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeEnquiryProgram, setActiveEnquiryProgram] = useState(featuredProgram);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    student_class: "Class X",
    school_name: "",
    target_exam: "Madhyamik / Board Exam",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Buy Now Modal & Payment State
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [activeBuyProgram, setActiveBuyProgram] = useState(featuredProgram);

  useEffect(() => {
    if (featuredProgram) {
      setActiveEnquiryProgram(featuredProgram);
      setActiveBuyProgram(featuredProgram);
    }
  }, [programSlug, availablePrograms]);
  const [buyFormData, setBuyFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    centre: PATHFINDER_CENTRES[0],
  });
  const [centreSearch, setCentreSearch] = useState("");
  const [centreDropdownOpen, setCentreDropdownOpen] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState("");

  const filteredCentres = PATHFINDER_CENTRES.filter(c =>
    c.toLowerCase().includes(centreSearch.toLowerCase())
  );

  const openEnquiry = (program) => {
    setActiveEnquiryProgram(program);
    setSubmitted(false);
    setModalOpen(true);
  };

  const openBuyModal = (program) => {
    setActiveBuyProgram(program);
    setBuyError("");
    setCentreSearch("");
    setCentreDropdownOpen(false);
    setBuyFormData(prev => ({ ...prev, centre: PATHFINDER_CENTRES[0] }));
    setBuyModalOpen(true);
  };

  const handleSubmitEnquiry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await landingAPI.register({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        student_class: formData.student_class,
        school_name: formData.school_name,
        target_exam: formData.target_exam,
        course_type: activeEnquiryProgram ? activeEnquiryProgram.name : "Pathfinder Mock Test",
        page_source: `Shiksha Bandhu Referral (${referralId})`,
        referral_id: referralId,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting enquiry:", err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyNowSubmit = async (e) => {
    e.preventDefault();
    setBuyError("");
    setBuyLoading(true);
    const baseUrl = env.API_BASE_URL || env.apiBaseUrl || "";

    try {
      // 1. Auto-register or authenticate student
      let authUser = null;
      let authToken = null;

      try {
        const regRes = await studentAuthAPI.register({
          fullName: buyFormData.fullName,
          phone: buyFormData.phone,
          email: buyFormData.email,
          password: buyFormData.password || "student123",
          area: buyFormData.centre,
          referred_by: referralId
        });

        if (regRes.data && regRes.data.user && regRes.data.token) {
          authUser = regRes.data.user;
          authToken = regRes.data.token;
        }
      } catch (regErr) {
        // If account already exists, attempt login directly
        try {
          const loginRes = await axios.post(`${baseUrl}/api/auth/login/`, {
            email: buyFormData.email || buyFormData.phone,
            password: buyFormData.password
          });
          if (loginRes.data && loginRes.data.token) {
            authUser = loginRes.data.user;
            authToken = loginRes.data.token;
          }
        } catch (lErr) {
          console.warn("Pre-payment login notice:", lErr);
        }
      }

      // If user profile created or logged in, set auth context with 365 days persistence
      if (authUser && authToken) {
        setAuthenticatedUser(authUser, authToken);
        localStorage.setItem("pathfinder_token", authToken);
        localStorage.setItem("pathfinder_user", JSON.stringify(authUser));
        localStorage.setItem("pathfinder_session_365", "true");
      }

      // 2. Pre-save course purchase intent in local storage
      const merchantTxnNo = `TXN${Date.now()}`;
      const amountPaid = activeBuyProgram.price || 4500;
      const purchaseIntent = {
        id: activeBuyProgram.id || `CRS-${merchantTxnNo}`,
        name: activeBuyProgram.name,
        mode: "classroom",
        enrolled_at: new Date().toISOString(),
        payment_info: {
          amount_paid: amountPaid,
          payment_id: merchantTxnNo,
          status: "completed",
          date: new Date().toISOString()
        }
      };

      const existingCourses = JSON.parse(localStorage.getItem("pathfinder_my_courses") || "[]");
      if (!existingCourses.some(c => c.payment_info?.payment_id === merchantTxnNo)) {
        existingCourses.unshift(purchaseIntent);
        localStorage.setItem("pathfinder_my_courses", JSON.stringify(existingCourses));
        localStorage.setItem("pathfinder_purchases", JSON.stringify(existingCourses));
      }

      // 3. Initiate ICICI Payment Gateway
      let gatewayConfig = {
        merchantId: "100000000007164",
        aggregatorID: "A100000000007164",
        secretKey: "db06cca0-838b-4e01-8b20-6ac446ffb6bd",
        saleUrl: "https://pgpayuat.icici.bank.in/tsp/pg/api/v2/initiateSale"
      };

      try {
        const configRes = await axios.get(`${baseUrl}/api/courses/icici/config/`);
        if (configRes.data && configRes.data.merchantId) {
          gatewayConfig = configRes.data;
        }
      } catch (cfgErr) {
        console.warn("Using default ICICI config fallback", cfgErr);
      }

      const { merchantId, aggregatorID, secretKey, saleUrl } = gatewayConfig;
      const txnDate = new Date().toISOString().replace(/[-T:\.Z]/g, "").slice(0, 14);
      const returnURL = `${baseUrl}/api/courses/icici/callback/`;

      const params = {
        merchantId,
        aggregatorID,
        merchantTxnNo,
        amount: amountPaid.toFixed(2),
        currencyCode: "356",
        payType: "0",
        customerEmailID: buyFormData.email,
        transactionType: "SALE",
        returnURL,
        txnDate,
        customerMobileNo: buyFormData.phone,
        customerName: buyFormData.fullName,
        addlParam1: activeBuyProgram.id,
        addlParam2: referralId // Passes referral ID for 10% bonus calculation
      };

      const hashRes = await axios.post(`${baseUrl}/api/courses/icici/generate-hash/`, {
        mode: "v1",
        secretKey,
        params
      });

      if (!hashRes.data || !hashRes.data.success) {
        throw new Error("Failed to calculate payment security hash.");
      }

      const secureHash = hashRes.data.secureHash;
      const fullPayload = { ...params, secureHash };

      const proxyRes = await axios.post(`${baseUrl}/api/courses/icici/proxy/`, {
        target_url: saleUrl,
        payload_type: "json",
        payload: fullPayload
      });

      const responseContent = proxyRes.data.data || proxyRes.data;
      const targetRedirect = responseContent.redirectURI || responseContent.redirectUrl || responseContent.targetUrl || responseContent.url;
      const tranCtx = responseContent.tranCtx || responseContent.tran_ctx;

      if (targetRedirect && tranCtx) {
        window.location.href = targetRedirect.includes('?') 
          ? `${targetRedirect}&tranCtx=${encodeURIComponent(tranCtx)}`
          : `${targetRedirect}?tranCtx=${encodeURIComponent(tranCtx)}`;
      } else if (targetRedirect) {
        window.location.href = targetRedirect;
      } else {
        // Fallback to my-courses with success parameter if gateway proxy in dev
        navigate(`/my-courses?txnNo=${merchantTxnNo}&status=SUCCESS`);
      }

    } catch (err) {
      console.error("Buy Now process error:", err);
      setBuyError(err.response?.data?.error || err.message || "Payment initiation failed. Please try again.");
      setBuyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#4a0609] via-[#66090D] to-[#8a0e14] pt-[84px] pb-16 text-white overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-300/30 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase text-amber-300">
            <SparklesIcon className="w-4 h-4 text-amber-300" />
            <span>Pathfinder Shiksha Bandhu Recommended • Partner {referralId}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            Prepare Smarter. Perform Better.
          </h1>
          <p className="text-base sm:text-xl font-bold text-amber-200/90 max-w-2xl mx-auto">
            Pathfinder Mock Tests 2026–27
          </p>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
            Get actual board-pattern mock papers, expert checked answer scripts, presentation guidance, and the exclusive Key to Success booklet.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => openBuyModal(featuredProgram)}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl transition transform hover:scale-105 flex items-center gap-2"
            >
              <CreditCardIcon className="w-4 h-4" />
              Buy Now (₹{featuredProgram.price ? featuredProgram.price.toLocaleString("en-IN") : "0"})
            </button>
            <button
              onClick={() => openEnquiry(featuredProgram)}
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl transition transform hover:scale-105"
            >
              Enquire Now for {featuredProgram.name || featuredProgram.title || "Mock Tests"}
            </button>
            <a
              href="tel:9147178886"
              className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <PhoneIcon className="w-4 h-4 text-amber-300" />
              Call Pathfinder
            </a>
          </div>
        </div>
      </section>

      {/* Featured Main Program Card */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="max-w-4xl mx-auto bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Primary Featured Package
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">{featuredProgram.name || featuredProgram.title}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Package Price</span>
              <span className="text-3xl font-black text-[#66090D]">₹{featuredProgram.price ? featuredProgram.price.toLocaleString("en-IN") : "0"}</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-800 text-sm">Key Benefits Included:</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-700">
                {(featuredProgram.includes || [
                  "Full-length board pattern Mock Tests",
                  "Checked Answer Scripts by Senior Examiners",
                  "Answer Writing Techniques & Guidance",
                  "Presentation & Time Management Tips",
                  "Key to Success Booklet"
                ]).map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {featuredProgram.description || "Empower your exam preparation with checked answer scripts from Pathfinder’s top ranker faculty."}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => openBuyModal(featuredProgram)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                >
                  <CreditCardIcon className="w-4 h-4" />
                  Buy Now (₹{featuredProgram.price ? featuredProgram.price.toLocaleString("en-IN") : "0"})
                </button>
                <button
                  onClick={() => openEnquiry(featuredProgram)}
                  className="w-full py-3 bg-[#66090D] hover:bg-[#800b11] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Enquire for {featuredProgram.name || featuredProgram.title}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Available Mock Tests Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-orange-600 text-xs font-black uppercase tracking-widest">All Available Options</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase">Pathfinder Board Mock Series</h2>
          <div className="w-16 h-1 bg-[#66090D] mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherPrograms.map((prog) => (
            <div key={prog.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-lg transition">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  {prog.board} • {prog.className || prog.class_name}
                </span>
                <h3 className="text-lg font-black text-slate-900">{prog.title || prog.name}</h3>
                <p className="text-xs text-slate-500 font-semibold">{prog.description}</p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Price</span>
                  <span className="text-lg font-black text-[#66090D]">₹{prog.price.toLocaleString("en-IN")}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openBuyModal(prog)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl uppercase tracking-wider transition flex items-center justify-center gap-1"
                  >
                    <CreditCardIcon className="w-3.5 h-3.5" />
                    Buy Now
                  </button>
                  <button
                    onClick={() => openEnquiry(prog)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition"
                  >
                    Enquire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Pathfinder Mock Tests */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto space-y-10 text-center">
          <div className="space-y-2">
            <span className="text-orange-600 text-xs font-black uppercase tracking-widest">The Advantage</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase">Why Pathfinder Mock Tests?</h2>
            <div className="w-16 h-1 bg-[#66090D] mx-auto"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <TrophyIcon className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Exam-Like Conditions</h4>
              <p className="text-xs text-slate-500 font-semibold">Simulated hall experience with strict time limits to build real exam stamina.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <AcademicCapIcon className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Checked Answer Scripts</h4>
              <p className="text-xs text-slate-500 font-semibold">Every paper checked line-by-line by expert examiners with detailed score correction.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <BookOpenIcon className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Answer Writing Hacks</h4>
              <p className="text-xs text-slate-500 font-semibold">Learn essential answer presentation skills to capture maximum step marks.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Key to Success Booklet</h4>
              <p className="text-xs text-slate-500 font-semibold">Includes topper model answers, scoring formula, and last-minute revision notes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto" />
                <h3 className="text-xl font-black text-slate-900">Enquiry Received!</h3>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  Thank you! Pathfinder team will contact you shortly regarding <strong className="text-slate-900">{activeEnquiryProgram.name}</strong>.
                </p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-900 text-white font-black text-xs rounded-xl uppercase tracking-wider"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Ref Partner: {referralId}
                  </span>
                  <h3 className="text-xl font-black text-[#66090D] mt-2">Submit Enquiry</h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {activeEnquiryProgram.name} (₹{activeEnquiryProgram.price.toLocaleString("en-IN")})
                  </p>
                </div>

                <form onSubmit={handleSubmitEnquiry} className="space-y-3 text-xs font-bold text-slate-700">
                  <div className="space-y-1">
                    <label className="uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter Student Name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="uppercase tracking-wider">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="10-digit Phone Number"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com (Optional)"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="uppercase tracking-wider">Current Class</label>
                      <select
                        value={formData.student_class}
                        onChange={(e) => setFormData((prev) => ({ ...prev, student_class: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                      >
                        <option value="Class IX">Class IX</option>
                        <option value="Class X">Class X</option>
                        <option value="Class XI">Class XI</option>
                        <option value="Class XII">Class XII</option>
                        <option value="12th Passed">12th Passed</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase tracking-wider">Target Exam</label>
                      <select
                        value={formData.target_exam}
                        onChange={(e) => setFormData((prev) => ({ ...prev, target_exam: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                      >
                        <option value="Madhyamik / Board Exam">Madhyamik / Board Exam</option>
                        <option value="CBSE / ICSE / ISC">CBSE / ICSE / ISC</option>
                        <option value="NEET (UG)">NEET (UG)</option>
                        <option value="JEE (Main & Advanced)">JEE (Main & Advanced)</option>
                        <option value="WBJEE">WBJEE</option>
                        <option value="Foundation (IX/X)">Foundation (IX/X)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase tracking-wider">School / Institution Name</label>
                    <input
                      type="text"
                      value={formData.school_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, school_name: e.target.value }))}
                      placeholder="Enter School or Institution Name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase tracking-wider">Selected Program</label>
                    <select
                      value={activeEnquiryProgram.id || activeEnquiryProgram.slug}
                      onChange={(e) => {
                        const p = findProgram(e.target.value);
                        if (p) setActiveEnquiryProgram(p);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                    >
                      {availablePrograms.map((p) => (
                        <option key={p.id || p.slug} value={p.id || p.slug}>
                          {p.title || p.name} (₹{Number(p.price || 0).toLocaleString("en-IN")})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#66090D] hover:bg-[#800b11] text-white font-black rounded-xl uppercase tracking-wider text-center transition shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Buy Now Registration & ICICI Payment Modal */}
      {buyModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => { setBuyModalOpen(false); setCentreDropdownOpen(false); }}>
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 my-auto max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 pr-8">
              <div>
                <h3 className="text-xl font-black text-[#66090D] uppercase tracking-tight">Mock Test Registration & Payment</h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  {activeBuyProgram.name} • <strong className="text-emerald-700 font-black">₹{activeBuyProgram.price.toLocaleString("en-IN")}</strong>
                </p>
              </div>
              <button
                onClick={() => { setBuyModalOpen(false); setCentreDropdownOpen(false); }}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {buyError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
                {buyError}
              </div>
            )}

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto pr-1 space-y-3.5 text-xs font-bold text-slate-700 flex-1">
              <form id="buy-modal-form" onSubmit={handleBuyNowSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="uppercase tracking-wider text-[11px] text-slate-500">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={buyFormData.fullName}
                    onChange={(e) => setBuyFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter Student Name"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="uppercase tracking-wider text-[11px] text-slate-500">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={buyFormData.phone}
                      onChange={(e) => setBuyFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="10-digit Phone Number"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase tracking-wider text-[11px] text-slate-500">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={buyFormData.email}
                      onChange={(e) => setBuyFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="uppercase tracking-wider text-[11px] text-slate-500">Password (For Student Portal) *</label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={buyFormData.password}
                    onChange={(e) => setBuyFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create Account Password"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900 font-bold"
                  />
                </div>

                {/* Searchable Pathfinder Centre Dropdown */}
                <div className="space-y-1 relative">
                  <label className="uppercase tracking-wider text-[11px] text-slate-500 flex items-center gap-1">
                    <BuildingStorefrontIcon className="w-3.5 h-3.5 text-orange-600" />
                    Select Preferred Pathfinder Centre *
                  </label>
                  
                  <div
                    onClick={() => setCentreDropdownOpen(!centreDropdownOpen)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer flex items-center justify-between text-slate-900 font-bold text-xs hover:border-slate-300"
                  >
                    <span className="truncate">{buyFormData.centre || "Select Centre"}</span>
                    <span className="text-slate-400 text-xs">▼</span>
                  </div>

                  {centreDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-2 max-h-56 overflow-hidden flex flex-col">
                      <input
                        type="text"
                        autoFocus
                        value={centreSearch}
                        onChange={(e) => setCentreSearch(e.target.value)}
                        placeholder="Type to search centre name or location..."
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#66090D]"
                      />
                      <div className="overflow-y-auto max-h-40 divide-y divide-slate-50">
                        {filteredCentres.length === 0 ? (
                          <div className="p-3 text-center text-slate-400 text-xs">No matching centre found</div>
                        ) : (
                          filteredCentres.map((c, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setBuyFormData(prev => ({ ...prev, centre: c }));
                                setCentreDropdownOpen(false);
                              }}
                              className={`p-2.5 text-xs font-bold rounded-lg cursor-pointer transition ${
                                buyFormData.centre === c ? "bg-[#66090D] text-white" : "hover:bg-slate-100 text-slate-800"
                              }`}
                            >
                              {c}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="uppercase tracking-wider text-[11px] text-slate-500">Selected Mock Test Program</label>
                  <select
                    value={activeBuyProgram.id || activeBuyProgram.slug}
                    onChange={(e) => {
                      const p = findProgram(e.target.value);
                      if (p) setActiveBuyProgram(p);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900 font-bold"
                  >
                    {availablePrograms.map((p) => (
                      <option key={p.id || p.slug} value={p.id || p.slug}>
                        {p.title || p.name} (₹{Number(p.price || 0).toLocaleString("en-IN")})
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>

            {/* Footer Button fixed inside Modal */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="submit"
                form="buy-modal-form"
                disabled={buyLoading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl uppercase tracking-wider text-center transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
              >
                <CreditCardIcon className="w-4 h-4" />
                {buyLoading ? "Initiating Gateway..." : `Proceed to Pay ₹${activeBuyProgram.price.toLocaleString("en-IN")}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
