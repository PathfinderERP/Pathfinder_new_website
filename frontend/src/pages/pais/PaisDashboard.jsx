import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  PhoneIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
  PlayIcon,
  MapPinIcon,
  ClockIcon,
  AcademicCapIcon,
  XMarkIcon,
  BuildingOffice2Icon,
  BookOpenIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Header from "../add_landingpage/common/Header";
import Footer from "../../components/Footer";
import { paisAPI } from "../../services/api";

const NEARBY_BRANCHES = [
  {
    name: "Tamluk Centre",
    address: "3rd Floor, Down Town Enclave, Mechada Rd, Tamluk, West Bengal 721636",
    hours: "Open until 07:00 PM",
  },
  {
    name: "Hazra (Head Office)",
    address: "96, SP Mukherjee Road, Hazra, Kolkata 700026",
    hours: "Open until 08:00 PM",
  },
  {
    name: "Salt Lake Branch",
    address: "BF-142, Sector 1, Salt Lake City, Kolkata 700064",
    hours: "Open until 07:30 PM",
  },
  {
    name: "Siliguri Centre",
    address: "Hill Cart Road, Opp. Hotel Gateway, Siliguri 734001",
    hours: "Open until 07:00 PM",
  },
];

export const PaisDashboard = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(2); // 1: Registration, 2: Scholarship Test, 3: Admission
  const [user, setUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    student_class: "Class X",
    exam_mode: "Offline Exam (At Centre)",
    centre: "Tamluk Centre",
    exam_date: "11/10/2026",
    exam_time: "Morning 10:30 AM to 11:30 AM",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pais_student_user");
    let storedUser = null;
    if (saved) {
      try {
        storedUser = JSON.parse(saved);
      } catch (err) {
        console.error(err);
      }
    }

    if (!storedUser) {
      // Default demo student matching screenshot
      storedUser = {
        id: "PNTSE20261001",
        name: "Soumojit Saha",
        phone: "9830012345",
        student_class: "Class X",
        exam_mode: "Offline Exam (At Centre)",
        centre: "Tamluk-HUB 3rd Floor, down Town Enclave, Haldia - Tamluk - Mechada, Rd., Tamluk, West Bengal 721636",
        course_type: "Engineering (JEE / WBJEE)",
        exam_date: "11/10/2026",
        exam_time: "Morning 10:30 AM to 11:30 AM",
      };
      localStorage.setItem("pais_student_user", JSON.stringify(storedUser));
    }

    setUser(storedUser);
    setEditForm({
      name: storedUser.name,
      student_class: storedUser.student_class || "Class X",
      exam_mode: storedUser.exam_mode || "Offline Exam (At Centre)",
      centre: storedUser.centre || "Tamluk Centre",
      exam_date: storedUser.exam_date || "11/10/2026",
      exam_time: storedUser.exam_time || "Morning 10:30 AM to 11:30 AM",
    });

    // Fetch live profile from backend if available
    if (storedUser.id) {
      paisAPI.getProfile(storedUser.id).then((res) => {
        if (res.data && res.data.user) {
          setUser(res.data.user);
        }
      }).catch((err) => console.error("Profile fetch error:", err));
    }
  }, []);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      if (user?.id) {
        const res = await paisAPI.updateProfile(user.id, editForm);
        if (res.data && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem("pais_student_user", JSON.stringify(res.data.user));
        }
      }
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
      const updated = { ...user, ...editForm };
      setUser(updated);
      localStorage.setItem("pais_student_user", JSON.stringify(updated));
      setEditModalOpen(false);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleStartExam = () => {
    window.open("/pntse/exam/instructions", "_blank");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header />

      {/* Top 3-Step Stepper Bar (Matching Screenshots 1 & 2) */}
      <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>

          {/* Step 1: Registration */}
          <button
            onClick={() => setActiveStep(1)}
            className="relative z-10 flex flex-col items-center gap-1 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-md">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-700">Registration</span>
          </button>

          {/* Step 2: Scholarship Test */}
          <button
            onClick={() => setActiveStep(2)}
            className="relative z-10 flex flex-col items-center gap-1 group focus:outline-none"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md transition ${
              activeStep === 2 ? "bg-slate-900 text-white ring-4 ring-sky-100" : "bg-emerald-500 text-white"
            }`}>
              2
            </div>
            <span className={`text-xs font-black ${activeStep === 2 ? "text-[#66090D]" : "text-slate-700"}`}>
              Scholarship Test
            </span>
          </button>

          {/* Step 3: Admission (Visit Branch) */}
          <button
            onClick={() => setActiveStep(3)}
            className="relative z-10 flex flex-col items-center gap-1 group focus:outline-none"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition ${
              activeStep === 3 ? "bg-[#66090D] text-amber-300 ring-4 ring-red-100 shadow-md" : "bg-slate-200 text-slate-500"
            }`}>
              3
            </div>
            <span className={`text-xs font-bold ${activeStep === 3 ? "text-[#66090D] font-black" : "text-slate-400"}`}>
              Admission (Visit Branch)
            </span>
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* STEP 3 VIEW: ADMISSION PAGE */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#4a0609] via-[#66090D] to-[#800b11] text-white rounded-3xl p-8 shadow-xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-amber-400/20 px-3 py-1 rounded-full text-xs font-black text-amber-300 uppercase tracking-wider">
                <SparklesIcon className="w-4 h-4" />
                Step 3: Branch Admission & Fee Waiver
              </div>
              <h2 className="text-3xl font-black uppercase text-white">Congratulations {user.name}!</h2>
              <p className="text-xs sm:text-sm text-slate-200 max-w-2xl font-medium leading-relaxed">
                You are entitled to claim your scholarship discount on Pathfinder JEE, NEET, WBJEE, and Foundation classroom programs. Visit your designated branch with your admit card to complete admission.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-amber-300">Scholarship Waiver</span>
                  <p className="text-3xl font-black text-amber-300 font-mono mt-1">Up to 100%</p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-amber-300">Selected Branch</span>
                  <p className="text-sm font-bold text-white mt-2 truncate">{user.centre}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-amber-300">Helpline Callback</span>
                  <p className="text-sm font-bold text-white mt-2">9147178886</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="text-xl font-black text-slate-900">Book Branch Visit Appointment</h3>
              <p className="text-xs text-slate-500 font-semibold">
                Our academic counselors will assist you with batch timings, study material distribution, and fee structure.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => alert("Branch visit appointment confirmed! Our counselor will call you shortly.")}
                  className="py-3.5 bg-[#66090D] hover:bg-[#800b11] text-white font-black text-xs rounded-xl uppercase tracking-wider shadow"
                >
                  Confirm Branch Visit Slot
                </button>
                <a
                  href="tel:9147178886"
                  className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs rounded-xl uppercase tracking-wider text-center flex items-center justify-center gap-2"
                >
                  <PhoneIcon className="w-4 h-4 text-[#66090D]" />
                  Call Pathfinder Admission Office
                </a>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 VIEW: SCHOLARSHIP TEST & ADMIT CARD (Matching Screenshots 1 & 2) */}
        {activeStep === 2 && (
          <div className="space-y-6">

            {/* Admit Card Ticket Banner Card */}
            <div className="bg-white border border-sky-200 rounded-2xl overflow-hidden shadow-md">
              <div className="bg-sky-500 text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider text-center">
                Pathfinder National Talent Search Examination (PNTSE 2026)
              </div>

              <div className="p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                
                {/* Left Illustration / Details */}
                <div className="space-y-3 flex-1">
                  <div>
                    <span className="text-xs font-bold text-slate-500">Evening</span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{user.name}</h1>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-3 text-xs font-bold">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Date</span>
                      <span className="text-slate-900 font-mono font-black">{user.exam_date || "11/10/2026"}</span>
                      <button
                        onClick={() => setEditModalOpen(true)}
                        className="text-[11px] text-sky-600 hover:underline block font-bold mt-0.5"
                      >
                        View/Edit Details
                      </button>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Timings</span>
                      <span className="text-slate-900 font-bold">{user.exam_time || "Morning 10:30 AM to 11:30 AM"}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Duration</span>
                      <span className="text-slate-900 font-bold">1 hour</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium">
                    <span className="font-bold text-slate-800 uppercase text-[10px] block">Assigned Exam Centre:</span>
                    {user.centre || "Offline exam center - Tamluk-HUB 3rd Floor, down Town Enclave, Haldia - Tamluk - Mechada, Rd., Tamluk, West Bengal 721636"}
                  </div>
                </div>

                {/* Right Status Card */}
                <div className="w-full lg:w-64 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 text-center space-y-3 shrink-0">
                  <span className="text-xs text-slate-600 font-semibold block">Need help? Call us at <strong className="text-slate-900">9147178886</strong></span>
                  <div className="py-2.5 bg-emerald-200/80 text-emerald-800 font-black text-xs rounded-xl uppercase tracking-wider">
                    Upcoming Exam
                  </div>
                  <span className="text-[10px] text-slate-400 block font-semibold">*Terms and conditions applied</span>
                </div>

              </div>
            </div>

            {/* PAIS Practice / Sample Test & Mock Paper Cards */}
            <div className="grid lg:grid-cols-12 gap-6">

              {/* Sample Test Launcher (Left Column) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase text-slate-900 block tracking-wider">PNTSE Practice</span>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
                      <BookOpenIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-base text-slate-900">Sample Test</h3>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        60 min test • Provides all the diagnostic analysis report
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartExam}
                  className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                >
                  Start Now
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Mock Test Paper Purchase Banner (Right Column) */}
              <div className="lg:col-span-7 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                    <SparklesIcon className="w-7 h-7 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">PAIS MOCK TEST PAPER</span>
                    <h3 className="text-xl font-black text-white">Set of 4 mock test paper</h3>
                    <p className="text-xs text-purple-200 font-semibold mt-1">High chances of getting 100% scholarship</p>
                  </div>
                </div>

                <button
                  onClick={() => alert("Mock Test Paper Bundle added to cart!")}
                  className="px-6 py-3.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shrink-0"
                >
                  Buy now at just ₹50
                </button>
              </div>

            </div>

            {/* Pathfinder Advantage & Nearby Branches (Matching Screenshot 2) */}
            <div className="grid lg:grid-cols-12 gap-6">

              {/* Left Advantage Video Prospectus Block */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <span className="text-xs font-black uppercase text-slate-900 block tracking-wider">Pathfinder Advantage</span>
                <div className="relative rounded-xl overflow-hidden bg-slate-900 text-white h-48 flex items-center justify-center shadow">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                  <button
                    onClick={() => window.open("https://www.youtube.com", "_blank")}
                    className="relative z-10 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transition transform hover:scale-110"
                  >
                    <PlayIcon className="w-6 h-6 text-white translate-x-0.5" />
                  </button>
                  <span className="absolute bottom-3 left-3 text-xs font-black text-white z-10">
                    Engineering & Medical Prospectus 2026
                  </span>
                </div>
              </div>

              {/* Right Branches Near You */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <span className="text-xs font-black uppercase text-slate-900 block tracking-wider">Branches Near You</span>
                <div className="grid sm:grid-cols-2 gap-3">
                  {NEARBY_BRANCHES.slice(0, 2).map((b, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-slate-900">{b.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{b.address}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                        <span className="text-[10px] font-extrabold text-amber-700">{b.hours}</span>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(b.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-sky-600 flex items-center gap-1 hover:underline"
                        >
                          <MapPinIcon className="w-3.5 h-3.5 text-sky-500" />
                          Directions
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Edit Details Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-[#66090D] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                PAIS Admit Card Edit
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">Edit Exam Details</h3>
              <p className="text-xs text-slate-500 font-semibold">
                You can change your exam mode, date, slot, or centre details.
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs font-bold text-slate-700">
              <div className="space-y-1">
                <label className="uppercase">Student Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Exam Mode</label>
                  <select
                    value={editForm.exam_mode}
                    onChange={(e) => setEditForm({ ...editForm, exam_mode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Offline Exam (At Centre)">Offline Exam (At Centre)</option>
                    <option value="Online Exam (From Home)">Online Exam (From Home)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Current Class</label>
                  <select
                    value={editForm.student_class}
                    onChange={(e) => setEditForm({ ...editForm, student_class: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Class VII">Class VII</option>
                    <option value="Class VIII">Class VIII</option>
                    <option value="Class IX">Class IX</option>
                    <option value="Class X">Class X</option>
                    <option value="Class XI">Class XI</option>
                    <option value="Class XII">Class XII</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Exam Date</label>
                  <select
                    value={editForm.exam_date}
                    onChange={(e) => setEditForm({ ...editForm, exam_date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="11/10/2026">11 Oct 2026</option>
                    <option value="25/10/2026">25 Oct 2026</option>
                    <option value="01/11/2026">01 Nov 2026</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Exam Timing</label>
                  <select
                    value={editForm.exam_time}
                    onChange={(e) => setEditForm({ ...editForm, exam_time: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Morning 10:30 AM to 11:30 AM">Morning 10:30 AM to 11:30 AM</option>
                    <option value="Evening 04:00 PM to 05:00 PM">Evening 04:00 PM to 05:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase">Assigned Exam Centre</label>
                <input
                  type="text"
                  required
                  value={editForm.centre}
                  onChange={(e) => setEditForm({ ...editForm, centre: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-3 bg-[#66090D] hover:bg-[#800b11] text-white font-black text-xs rounded-xl uppercase shadow"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
