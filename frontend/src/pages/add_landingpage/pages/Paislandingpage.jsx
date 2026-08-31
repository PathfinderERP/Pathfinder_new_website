import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrophyIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  SparklesIcon,
  CalendarIcon,
  ComputerDesktopIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  CheckIcon,
  ArrowRightIcon,
  XMarkIcon,
  ClockIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import Header from "../common/Header";
import Footer from "../../../components/Footer";
import { landingAPI, paisAPI } from "../../../services/api";

const CENTRES = [
  "Hazra (Head Office)",
  "Salt Lake (BF-142)",
  "Garia",
  "Howrah (Maidan)",
  "Siliguri",
  "Durgapur",
  "Asansol",
  "Malda",
  "Kharagpur",
  "Berhampore",
  "Burdwan",
  "Midnapore",
  "Barasat",
  "Suri",
];

const TOPPERS = [
  {
    name: "Sourav Roy",
    exam: "WBJEE 2025",
    air: "Rank 1",
    score: "PAIS Scholar 100%",
    image: "/images/icon/logo-1.svg",
    course: "JEE 2-Year Program",
  },
  {
    name: "Debaki Mukhopadhyay",
    exam: "NEET UG 2025",
    air: "710 / 720",
    score: "PAIS Gold Winner",
    image: "/images/icon/logo-1.svg",
    course: "NEET Classroom Program",
  },
  {
    name: "Ankan Sarkar",
    exam: "JEE Advanced 2025",
    air: "AIR 84",
    score: "PAIS Scholar 100%",
    image: "/images/icon/logo-1.svg",
    course: "JEE 2-Year Program",
  },
  {
    name: "Sritama Dutta",
    exam: "WBJEE 2025",
    air: "Rank 3",
    score: "PAIS Cash Awardee",
    image: "/images/icon/logo-1.svg",
    course: "WBJEE Classroom",
  },
];

const FAQS = [
  {
    q: "What is PAIS 2026 (Pathfinder Academic Talent Hunt)?",
    a: "PAIS 2026 is Pathfinder's premier national-level scholarship exam for students in Class VII, VIII, IX, X, XI, XII & 12th Pass. It provides up to 100% scholarship on coaching fees and over ₹1 Crore in cash awards to meritorious students.",
  },
  {
    q: "Is registration for PAIS 2026 free?",
    a: "Yes! Registration for PAIS 2026 is 100% FREE for all eligible students.",
  },
  {
    q: "What is the mode of examination for PAIS 2026?",
    a: "Students can choose either Online mode (from the safety and comfort of home using a laptop, tablet, or smartphone) or Offline mode at their nearest Pathfinder Centre.",
  },
  {
    q: "What is the exam pattern and duration?",
    a: "The exam duration is 60 Minutes (1 Hour). It consists of 90 Marks with Multiple Choice Questions (MCQs) covering Physics, Chemistry, Biology/Mathematics, and Mental Ability. There is NO negative marking.",
  },
  {
    q: "When will the results be declared?",
    a: "Results for PAIS 2026 will be announced within 10 days of completion of the exam series. Detailed performance analytics and rank cards will be available online.",
  },
  {
    q: "How do I claim my scholarship and cash awards?",
    a: "Qualified rankers will be invited to Pathfinder's felicitation ceremony or can visit their selected Pathfinder Centre with their PAIS 2026 admit card and rank card.",
  },
];

export const Paislandingpage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    student_class: "Class X",
    exam_mode: "Online Exam (From Home)",
    centre: "Hazra (Head Office)",
    course_type: "Engineering (JEE / WBJEE)",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await paisAPI.register(formData);
      if (res.data && res.data.user) {
        localStorage.setItem("pais_student_user", JSON.stringify(res.data.user));
        navigate("/pais/dashboard");
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Error submitting PAIS registration:", err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />

      {/* Top Highlight Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 py-2.5 text-center text-slate-950 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm">
        <SparklesIcon className="w-4 h-4 text-slate-900 animate-pulse" />
        <span>PNTSE 2026 Registration Open • Up to 100% Scholarship + ₹1 Crore Cash Awards for Class VII to XII!</span>
      </div>

      {/* Hero Banner Section (ANTHE Layout in Pathfinder Crimson Maroon & Gold) */}
      <section id="register" className="relative bg-gradient-to-br from-[#3b0407] via-[#66090D] to-[#800b11] text-white py-12 lg:py-16 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase text-amber-300">
                <TrophyIcon className="w-4 h-4 text-amber-300" />
                <span>Pathfinder National Talent Search Examination 2026</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-tight text-white">
                  PNTSE 2026
                </h1>
                <p className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                  Talent Ka <span className="text-white bg-amber-500/30 px-3 py-1 rounded-xl border border-amber-400/30">Sabse Bada Exam</span>
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-xl leading-relaxed">
                Take the premier Pathfinder National Talent Search Examination (PNTSE) to discover your true potential, win up to 100% scholarship, and secure cash prizes worth ₹1 Crore+!
              </p>

              {/* Stats Bar (2x2 Grid on Mobile / 4 Grid Desktop) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
                <div className="text-center p-2 border-r border-white/10 last:border-0">
                  <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">5 Lakh+*</div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-300">Students Registered</div>
                </div>

                <div className="text-center p-2 border-r border-white/10 last:border-0">
                  <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">Up to 100%*</div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-300">Scholarship</div>
                </div>

                <div className="text-center p-2 sm:border-r border-white/10 last:border-0">
                  <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">₹1 Cr+*</div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-300">Cash Awards</div>
                </div>

                <div className="text-center p-2">
                  <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono flex items-center justify-center gap-1">
                    <TrophyIcon className="w-5 h-5 text-amber-300" />
                    <span>State Rank</span>
                  </div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-300">All India & WB</div>
                </div>
              </div>

              {/* Exam Dates Box */}
              <div className="bg-slate-900/60 border border-white/20 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-300 tracking-wider">
                  <CalendarIcon className="w-4 h-4 text-sky-400" />
                  <span>PNTSE 2026 Exam Schedule</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                    <ComputerDesktopIcon className="w-6 h-6 text-sky-400 shrink-0" />
                    <div>
                      <span className="font-extrabold text-white block uppercase text-[10px]">Online Exam (From Home):</span>
                      <span className="text-amber-200 font-bold">27 Oct – 01 Nov 2026</span>
                      <span className="text-[10px] text-slate-300 block font-mono">(Slot: 10:00 AM – 10:00 PM)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                    <BuildingOffice2Icon className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-extrabold text-white block uppercase text-[10px]">Offline Exam (At Centre):</span>
                      <span className="text-amber-200 font-bold">11 Oct, 25 Oct & 01 Nov 2026</span>
                      <span className="text-[10px] text-slate-300 block font-mono">(10:30 AM & 04:00 PM)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Registration Form Column */}
            <div className="lg:col-span-5">
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/40 relative">
                <div className="bg-[#66090D] text-white -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-4 sm:p-5 rounded-t-3xl text-center space-y-1 mb-6 flex flex-col items-center justify-between">
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-400/20 px-3 py-0.5 rounded-full border border-amber-400/30">
                      100% Free Registration
                    </span>
                    <Link
                      to="/pntse/login"
                      className="text-[11px] font-extrabold uppercase text-white hover:text-amber-300 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/20 transition"
                    >
                      Already Registered? Login
                    </Link>
                  </div>
                  <h3 className="text-xl font-black uppercase text-white">Register for PNTSE 2026</h3>
                  <p className="text-[11px] text-slate-300 font-semibold">
                    Fill in your details below to instantly book your scholarship test slot.
                  </p>
                </div>

                {submitted ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                      <CheckCircleIcon className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900">Registration Successful!</h4>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      Thank you <strong className="text-slate-900">{formData.name}</strong>! Your registration for <strong className="text-[#66090D]">PNTSE 2026</strong> has been received. Our academic team will contact you at <strong>{formData.phone}</strong> with your Admit Card and slot confirmation.
                    </p>
                    <Link
                      to="/pntse/dashboard"
                      className="inline-block px-6 py-3 bg-[#66090D] text-white font-extrabold text-xs rounded-xl uppercase tracking-wider shadow"
                    >
                      Go to Student Dashboard
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
                    <div className="space-y-1">
                      <label className="uppercase tracking-wider">Student's Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter Student Name"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="uppercase tracking-wider">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="10-digit Phone"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="uppercase tracking-wider">Set Password *</label>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Password for login"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="uppercase tracking-wider">Current Class *</label>
                        <select
                          value={formData.student_class}
                          onChange={(e) => setFormData({ ...formData, student_class: e.target.value })}
                          className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                        >
                          <option value="Class VII">Class VII</option>
                          <option value="Class VIII">Class VIII</option>
                          <option value="Class IX">Class IX</option>
                          <option value="Class X">Class X</option>
                          <option value="Class XI">Class XI</option>
                          <option value="Class XII">Class XII</option>
                          <option value="12th Pass">12th Pass</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="uppercase tracking-wider">Mode of Exam *</label>
                        <select
                          value={formData.exam_mode}
                          onChange={(e) => setFormData({ ...formData, exam_mode: e.target.value })}
                          className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                        >
                          <option value="Online Exam (From Home)">Online Exam (From Home)</option>
                          <option value="Offline Exam (At Centre)">Offline Exam (At Centre)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase tracking-wider">Target Stream / Goal *</label>
                      <select
                        value={formData.course_type}
                        onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                      >
                        <option value="Engineering (JEE / WBJEE)">Engineering (JEE Main & Adv / WBJEE)</option>
                        <option value="Medical (NEET UG)">Medical (NEET UG)</option>
                        <option value="Foundation & Olympiad (Class 7 to 10)">Foundation & Olympiads (Class 7-10)</option>
                        <option value="Board Exams Excellence">Board Exams (ICSE / CBSE / Madhyamik / HS)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase tracking-wider">Nearest Pathfinder Centre *</label>
                      <select
                        value={formData.centre}
                        onChange={(e) => setFormData({ ...formData, centre: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                      >
                        {CENTRES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-300 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                    >
                      {submitting ? "Registering..." : "Register for FREE Now"}
                      <ArrowRightIcon className="w-4 h-4 text-slate-950" />
                    </button>

                    <p className="text-[10px] text-center text-slate-400 font-semibold">
                      By registering, you agree to receive exam details & admit card notifications via SMS/WhatsApp.
                    </p>

                    <div className="border-t border-slate-200 pt-4 text-center">
                      <p className="text-xs text-slate-600 font-semibold">
                        Already registered for PNTSE 2026?{" "}
                        <Link
                          to="/pntse/login"
                          className="text-[#66090D] font-black hover:underline inline-flex items-center gap-1"
                        >
                          Login to PNTSE Dashboard →
                        </Link>
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Key Highlights Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[#66090D] text-xs font-black uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
            Why Take PNTSE 2026?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase">
            Unlock Unlimited Academic Opportunities
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto font-medium">
            PNTSE 2026 is designed to evaluate your analytical thinking, grant financial rewards, and guide you towards top ranks in JEE, NEET, WBJEE & Boards.
          </p>
          <div className="w-16 h-1 bg-[#66090D] mx-auto rounded-full"></div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
              <TrophyIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Up to 100% Scholarship</h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Get 100% fee waiver on Pathfinder’s classroom courses for JEE, NEET, WBJEE, and Foundation batches.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-black">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">₹1 Crore+ Cash Awards</h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Substantial cash prizes and merit recognition awards distributed to top state and national rankers.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
              <AcademicCapIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">All India & WB Rank</h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Benchmark your performance against 5 Lakh+ students across West Bengal and Eastern India.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Diagnostic Analysis Report</h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Receive subject-wise, topic-wise diagnostic reports highlighting your strengths and improvement areas.
            </p>
          </div>
        </div>
      </section>

      {/* Exam Details & Eligibility Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[#66090D] text-xs font-black uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
              Exam Details
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase">
              Everything You Need to Know
            </h2>
            <div className="w-16 h-1 bg-[#66090D] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                <UserGroupIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Eligibility</h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Students currently studying in <strong>Class VII, VIII, IX, X, XI, XII & 12th Pass</strong> across all recognised boards (CBSE, ICSE, WBBSE, WBCHSE).
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-black">
                <ClockIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Exam Duration & Marks</h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                <strong>60 Minutes (1 Hour)</strong> consisting of 90 Marks (Multiple Choice Questions - MCQs). There is <strong>NO Negative Marking</strong>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                <ComputerDesktopIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Syllabus & Mode</h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Covers Physics, Chemistry, Mathematics/Biology & Mental Ability. Mode: <strong>Online (Home)</strong> or <strong>Offline (Pathfinder Centre)</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Simple Steps to Register */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[#66090D] text-xs font-black uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase">
            3 Steps to Win Your Scholarship
          </h2>
          <div className="w-16 h-1 bg-[#66090D] mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm text-center space-y-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-[#66090D] text-amber-300 font-black text-2xl flex items-center justify-center mx-auto shadow-md">
              1
            </div>
            <h3 className="text-lg font-black text-slate-900">Fill Basic Details</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Enter your name, mobile number, current class, and target stream in the registration form.
            </p>
          </div>

          <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm text-center space-y-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-[#66090D] text-amber-300 font-black text-2xl flex items-center justify-center mx-auto shadow-md">
              2
            </div>
            <h3 className="text-lg font-black text-slate-900">Select Exam Mode</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Choose Online exam slot from home or select your nearest Pathfinder classroom centre.
            </p>
          </div>

          <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm text-center space-y-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-[#66090D] text-amber-300 font-black text-2xl flex items-center justify-center mx-auto shadow-md">
              3
            </div>
            <h3 className="text-lg font-black text-slate-900">Appear & Claim Award</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Take the 60-minute test, unlock your state rank, and claim up to 100% scholarship + cash rewards!
            </p>
          </div>
        </div>
      </section>

      {/* Pathfinder Toppers & Rankers Carousel */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-amber-400 text-xs font-black uppercase tracking-widest bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
              Legacy of Rankers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase">
              Pathfinder PNTSE Champions
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
              Join thousands of past PNTSE scholars who transformed their career aspirations into top All India & State Ranks.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOPPERS.map((top, idx) => (
              <div key={idx} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 text-center space-y-3 hover:border-amber-400 transition">
                <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-amber-400 mx-auto overflow-hidden p-1 flex items-center justify-center">
                  <img src={top.image} alt={top.name} className="w-full h-full object-contain" />
                </div>
                <h4 className="font-black text-base text-white">{top.name}</h4>
                <div className="text-xs font-black text-amber-300 bg-amber-400/10 py-1 px-3 rounded-full border border-amber-400/20 inline-block font-mono">
                  {top.air} • {top.exam}
                </div>
                <p className="text-[11px] text-slate-300 font-semibold">{top.course}</p>
                <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">{top.score}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <span className="text-[#66090D] text-xs font-black uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
            Got Questions?
          </span>
          <h2 className="text-3xl font-black text-slate-900 uppercase">
            Frequently Asked Questions
          </h2>
          <div className="w-16 h-1 bg-[#66090D] mx-auto rounded-full"></div>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left font-black text-sm text-slate-900 flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 shrink-0 transition-transform ${openFaq === idx ? "rotate-180 text-[#66090D]" : ""}`} />
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Helpline Contact Card */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-[#4a0609] via-[#66090D] to-[#800b11] text-white rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-amber-300 tracking-wider">Need Registration Help?</span>
            <h3 className="text-2xl font-black text-white">We're Here to Guide You</h3>
            <p className="text-xs text-slate-200 font-medium">Our counselors are available 7 days a week to answer your queries.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:9147178886"
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-2xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
            >
              <PhoneIcon className="w-4 h-4 text-slate-950" />
              91471 78886
            </a>
            <a
              href="mailto:support@pathfinder.edu.in"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs rounded-2xl uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              <EnvelopeIcon className="w-4 h-4 text-amber-300" />
              Email Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
