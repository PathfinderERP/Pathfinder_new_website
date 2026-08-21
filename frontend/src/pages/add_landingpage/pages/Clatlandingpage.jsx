import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon, PhoneIcon, BookOpenIcon, TrophyIcon, ShieldCheckIcon, AcademicCapIcon, UserGroupIcon, StarIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import Header from '../common/Header';
import Footer from '../../../components/Footer';

import { landingAPI } from "../../../services/api";

// Seeded Success Carousel (matching the image carousel block)
const successSlides = [
  {
    name: "Moumita Saha",
    role: "CLAT Topper, NALSAR Hyderabad",
    tagline: "Secured Admission in Top NLU",
    achievement: "AIR 45",
    label: "CLAT Rank"
  },
  {
    name: "Devduttya Majhi",
    role: "CLAT Topper, NUJS Kolkata",
    tagline: "NLU Admissions Achiever",
    achievement: "AIR 89",
    label: "CLAT Rank"
  }
];

export const Clatlandingpage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    course: "",
    timeline: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Countdown timer logic
  useEffect(() => {
    const targetDate = new Date("2026-12-06T00:00:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Success slides interval rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % successSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await landingAPI.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        student_class: formData.qualification,
        course_type: formData.course ? `CLAT - ${formData.course}` : "CLAT Program",
        page_source: "CLAT Landing Page"
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting registration to database:", err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden font-sans">
      <Header />
      
      {/* 1. Hero Split Section */}
      <section className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 pt-[72px] pb-20 border-b border-white/5">
        {/* Full-screen width square banner image */}
        <div className="w-full overflow-hidden border-b border-white/10 shadow-xl mb-12">
          <img
            src="/images/clat-banner.jpg"
            alt="CLAT Exam 2026 Banner"
            className="w-full h-auto object-cover rounded-none"
          />
        </div>

        {/* Glow Accents */}
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-orange-600 opacity-5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-indigo-600 opacity-5 rounded-full blur-[120px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-start relative z-10">
          
          {/* Hero Left Content - Countdown & Success Carousel */}
          <div className="lg:col-span-7 space-y-6 text-white">
            {/* Countdown / Urgency Block */}
            <div className="space-y-4 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 shadow-xl">
              <p className="text-orange-500 text-xs font-black uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                🚨 CLAT 2026 Exam is coming... Are you ready?
              </p>
              <div className="flex justify-center sm:justify-start">
                <div className="flex gap-2 sm:gap-3 text-center">
                  <div className="bg-slate-800/80 px-3 py-2 sm:px-4 sm:py-2 rounded-xl min-w-[54px] sm:min-w-[64px] border border-white/5">
                    <span className="block text-lg sm:text-xl font-black text-white">{timeLeft.days}</span>
                    <span className="text-[8px] sm:text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Days</span>
                  </div>
                  <div className="bg-slate-800/80 px-3 py-2 sm:px-4 sm:py-2 rounded-xl min-w-[54px] sm:min-w-[64px] border border-white/5">
                    <span className="block text-lg sm:text-xl font-black text-white">{timeLeft.hours}</span>
                    <span className="text-[8px] sm:text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Hours</span>
                  </div>
                  <div className="bg-slate-800/80 px-3 py-2 sm:px-4 sm:py-2 rounded-xl min-w-[54px] sm:min-w-[64px] border border-white/5">
                    <span className="block text-lg sm:text-xl font-black text-white">{timeLeft.minutes}</span>
                    <span className="text-[8px] sm:text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Mins</span>
                  </div>
                  <div className="bg-slate-800/80 px-3 py-2 sm:px-4 sm:py-2 rounded-xl min-w-[54px] sm:min-w-[64px] border border-white/5">
                    <span className="block text-lg sm:text-xl font-black text-white">{timeLeft.seconds}</span>
                    <span className="text-[8px] sm:text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Secs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Card Mock Block (matching design image style) */}
            <div className="relative bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
              
              {/* Profile Image Mock (using initial text badge) */}
              <div className="relative flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-indigo-600 flex items-center justify-center border-2 border-white/20 shadow-xl shadow-black/30">
                <span className="text-3xl font-black text-white">NLU</span>
                
                {/* Ranking Badge overlay */}
                <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg border border-white/10 shadow-lg">
                  {successSlides[currentSlide].achievement}
                </div>
              </div>

              {/* Text detail */}
              <div className="flex-1 text-center md:text-left space-y-1">
                <div className="text-[10px] text-orange-500 font-extrabold uppercase tracking-widest">
                  {successSlides[currentSlide].label}
                </div>
                <h4 className="text-lg font-black text-white">{successSlides[currentSlide].name}</h4>
                <p className="text-xs text-slate-300 font-bold">{successSlides[currentSlide].role}</p>
                <p className="text-xs text-slate-400 font-semibold">{successSlides[currentSlide].tagline}</p>
              </div>

              {/* Slide Dots */}
              <div className="absolute bottom-4 right-6 flex gap-1.5">
                {successSlides.map((_, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => setCurrentSlide(sIdx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentSlide === sIdx ? "bg-orange-500 w-4" : "bg-slate-700 hover:bg-slate-600"
                    }`}
                  ></button>
                ))}
              </div>
            </div>

          </div>

          {/* Hero Right Content - Start Application Form Container */}
          <div id="landing-registration-form" className="lg:col-span-5 flex justify-center">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-white">
              <h3 className="text-xl font-black text-center tracking-wide uppercase border-b border-white/5 pb-4 mb-6">
                Start Application
              </h3>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto" />
                  <h4 className="text-lg font-black text-white">Application Received!</h4>
                  <p className="text-xs text-slate-400 font-semibold">
                    Thank you for applying. A CLAT Career Advisor from IntelVerse will contact you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-300">
                  <div className="space-y-1">
                    <label className="uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter Full Name"
                      className="w-full px-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@email.com"
                      className="w-full px-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase tracking-wider">Phone Number</label>
                    <div className="flex bg-slate-800/80 border border-white/10 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-orange-500">
                      <span className="px-3 py-3 border-r border-white/10 text-slate-500 font-semibold bg-slate-800/50">+91</span>
                      <input
                        type="tel"
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Mobile Number"
                        className="w-full px-4 py-3 bg-transparent text-white focus:outline-none placeholder-slate-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="uppercase tracking-wider">Highest Qualification</label>
                      <select
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-300 font-semibold"
                      >
                        <option value="">Select Class</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11">Class 11</option>
                        <option value="Class 12">Class 12</option>
                        <option value="Passed">12th Passed</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="uppercase tracking-wider">Program Selected</label>
                      <select
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-300 font-semibold"
                      >
                        <option value="">Select Course</option>
                        <option value="2-Year">2-Year Program</option>
                        <option value="1-Year">1-Year Program</option>
                        <option value="Crash Course">Crash Course</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase tracking-wider">How soon are you looking to join?</label>
                    <select
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-300 font-semibold"
                    >
                      <option value="">Select timeline</option>
                      <option value="Immediately">Immediately</option>
                      <option value="Next Batch">Next Batch</option>
                      <option value="Exploring">Just Exploring</option>
                    </select>
                  </div>

                  {/* Submit button group */}
                  <div className="pt-4 flex items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 text-white font-extrabold rounded-xl uppercase tracking-wider text-center transition"
                    >
                      {isSubmitting ? "Submitting..." : "Apply NOW"}
                    </button>
                    
                    <a
                      href="https://wa.me/919147395147"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center transition font-extrabold flex items-center justify-center gap-1.5"
                    >
                      WhatsApp
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 2. Programmes Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-orange-500 text-xs font-black tracking-widest uppercase">Target NLUs</span>
            <h2 className="text-3xl font-black text-slate-900 uppercase">Programmes Available</h2>
            <div className="w-16 h-1 bg-[#66090D] mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 1 YEAR COURSE */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col justify-between hover:shadow-xl transition relative overflow-hidden">
              <div className="space-y-4">
                <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-extrabold tracking-wider uppercase">Intensive</span>
                <h3 className="text-xl font-black text-slate-800 uppercase">1 Year Course</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Targeted & rigorous 1-year program designed for Class 12 students aiming for top NLUs.
                </p>
              </div>
              <div className="border-t border-slate-200/80 pt-6 mt-6 space-y-2 text-xs font-bold text-slate-700">
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 300+ hrs of classroom course</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 50+ Mock Tests</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Exclusive sectional exams</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Monthly GK compendiums</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Study Materials</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Sectional Tests</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Mock tests with analysis</p>
              </div>
            </div>

            {/* 2 YEAR COURSE */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col justify-between hover:shadow-xl transition relative overflow-hidden">
              <div className="space-y-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-extrabold tracking-wider uppercase">Foundation</span>
                <h3 className="text-xl font-black text-slate-800 uppercase">2 Year Course</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Comprehensive 2-year foundation program for Class 11 students to master legal concepts early.
                </p>
              </div>
              <div className="border-t border-slate-200/80 pt-6 mt-6 space-y-2 text-xs font-bold text-slate-700">
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 500+ hrs of classroom course</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 100+ Mock Tests</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Exclusive sectional exams</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Monthly GK compendiums</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Study Materials</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Sectional Tests</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Mock tests with analysis</p>
              </div>
            </div>

            {/* 3 MONTH COURSE / CRASH COURSE */}
            <div className="bg-gradient-to-br from-orange-50/40 to-white border-2 border-orange-500 rounded-3xl p-8 flex flex-col justify-between shadow-md hover:shadow-xl transition relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                USP Crash Course
              </div>
              <div className="space-y-4">
                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-extrabold tracking-wider uppercase">Sprint Prep</span>
                <h3 className="text-xl font-black text-slate-800 uppercase">3 Month Course</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Focused 3-month crash course tailored for rapid revision, intensive practice, and score maximization.
                </p>
              </div>
              <div className="border-t border-slate-200/80 pt-6 mt-6 space-y-2 text-xs font-bold text-slate-700">
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-orange-600 flex-shrink-0" /> 180+ hrs of classroom course</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-orange-600 flex-shrink-0" /> 24+ Mock Test</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-orange-600 flex-shrink-0" /> Exclusive sectional exams</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-orange-600 flex-shrink-0" /> Monthly GK compendiums</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-orange-600 flex-shrink-0" /> Study Materials</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-orange-600 flex-shrink-0" /> Sectional Tests</p>
                <p className="flex items-center gap-2 text-slate-700"><CheckIcon className="w-4 h-4 text-orange-600 flex-shrink-0" /> Mock tests with analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Advantages / Why Choose Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-orange-500 text-xs font-black tracking-widest uppercase">The Edge</span>
            <h2 className="text-3xl font-black text-slate-900 uppercase">Advantages</h2>
            <div className="w-16 h-1 bg-[#66090D] mx-auto"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                <UserGroupIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Personalised Study Plans</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Tailored study roadmaps to fit individual student schedules and speed.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                <TrophyIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Revision Marathons</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">High-intensity revision marathons right before key exam dates.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                <BookOpenIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Exclusive Mock Series</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Simulated exam hall mocks strictly patterned on latest CLAT formats.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                <StarIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Regular Performance Analysis</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Deep diagnostic reports tracking accuracy, timing, and score improvements.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-black text-xs">
                COMPACT
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Comprehensive Prep</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">All core subjects and current affairs packed into focused modules.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-black text-xs">
                NUJS
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Scholar-Led Classes</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Interactive sessions led by NUJS scholars and top NLU rankers.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-black text-xs">
                EXPERT
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Mentorship</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">One-on-one strategy sessions and continuous guidance throughout.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 font-black text-xs">
                24×7
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">Doubt Support</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Round-the-clock query resolution and study group access.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Curriculum Coverage */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto space-y-10 text-center">
          <div className="space-y-3">
            <span className="text-orange-500 text-xs font-black tracking-widest uppercase">Curriculum</span>
            <h2 className="text-3xl font-black text-slate-900 uppercase">Subjects Covered</h2>
            <div className="w-16 h-1 bg-[#66090D] mx-auto"></div>
          </div>
          <p className="text-slate-600 font-semibold text-sm max-w-xl mx-auto leading-relaxed">
            IntelVerse's modules are designed by academic scholars to thoroughly cover all CLAT test sections.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {["English Language", "Legal Reasoning", "Logical Reasoning", "Quantitative Techniques", "Current Affairs & GK"].map((subject, idx) => (
              <span key={idx} className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-extrabold text-slate-700 shadow-sm">
                📚 {subject}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA banner */}
      <section className="py-16 bg-[#66090D] text-white text-center px-4 relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl font-black uppercase tracking-wide">Prepare for CLAT 2027–2028</h2>
          <p className="text-sm text-red-100 font-medium">
            Lock in your admission seat at India's top National Law Universities. Speak with an expert mentor today!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <a
              href="tel:9147395147"
              className="px-6 py-4 bg-white text-slate-900 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 hover:bg-slate-100 transition"
            >
              <PhoneIcon className="w-4 h-4 text-orange-600 animate-pulse" />
              Call 9147395147
            </a>
            <a
              href="#landing-registration-form"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('landing-registration-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-4 bg-slate-900 border border-white/10 hover:bg-slate-800 text-white font-black rounded-xl text-xs uppercase tracking-wider transition"
            >
              Start Registration
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
