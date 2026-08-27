import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircleIcon,
  PhoneIcon,
  AcademicCapIcon,
  BookOpenIcon,
  TrophyIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Header from "../add_landingpage/common/Header";
import Footer from "../../components/Footer";
import { PROGRAMS, getProgram } from "./ShikshaBandhuData";
import { landingAPI, shikshaBandhuAPI } from "../../services/api";

export const PublicReferralLanding = () => {
  const { referralId = "SB004", programSlug } = useParams();
  const selectedProgram = programSlug ? getProgram(programSlug) : null;

  useEffect(() => {
    if (referralId) {
      shikshaBandhuAPI.trackClick({ partner_id: referralId, program_slug: programSlug || "" })
        .catch((err) => console.error("Click tracking error:", err));
    }
  }, [referralId, programSlug]);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeEnquiryProgram, setActiveEnquiryProgram] = useState(selectedProgram || PROGRAMS[0]);
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

  const openEnquiry = (program) => {
    setActiveEnquiryProgram(program);
    setSubmitted(false);
    setModalOpen(true);
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
              onClick={() => openEnquiry(selectedProgram || PROGRAMS[0])}
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl transition transform hover:scale-105"
            >
              Enquire Now for Mock Tests
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
              <h2 className="text-2xl font-black text-slate-900 mt-2">Madhyamik Mock Test 2027</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Package Price</span>
              <span className="text-3xl font-black text-[#66090D]">₹4,500</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-800 text-sm">Key Benefits Included:</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Full-length board pattern Mock Test 1 & 2</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Checked Answer Scripts by Senior Examiners</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Answer Writing Techniques & Guidance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Presentation & Time Management Tips</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Key to Success Booklet</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Empower your exam preparation with checked answer scripts from Pathfinder’s top ranker faculty.
              </p>
              <button
                onClick={() => openEnquiry(PROGRAMS[0])}
                className="w-full py-3.5 bg-[#66090D] hover:bg-[#800b11] text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md"
              >
                Enquire for Madhyamik 2027
              </button>
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
          {PROGRAMS.slice(1).map((prog) => (
            <div key={prog.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-lg transition">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  {prog.board} • {prog.className}
                </span>
                <h3 className="text-lg font-black text-slate-900">{prog.name}</h3>
                <p className="text-xs text-slate-500 font-semibold">{prog.description}</p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Price</span>
                  <span className="text-lg font-black text-[#66090D]">₹{prog.price.toLocaleString("en-IN")}</span>
                </div>
                <button
                  onClick={() => openEnquiry(prog)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition"
                >
                  Enquire Now
                </button>
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
                      value={activeEnquiryProgram.id}
                      onChange={(e) => {
                        const p = getProgram(e.target.value);
                        if (p) setActiveEnquiryProgram(p);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66090D] text-slate-900"
                    >
                      {PROGRAMS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{p.price.toLocaleString("en-IN")})
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

      <Footer />
    </div>
  );
};
