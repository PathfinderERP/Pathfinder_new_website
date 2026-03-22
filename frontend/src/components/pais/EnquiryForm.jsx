import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EnquiryForm = ({ selectedPackage, setSelectedPackage }) => {
  const [formData, setFormData] = useState({
    name: "",
    className: "",
    area: "",
    school: "",
    parentName: "",
    mobile: "",
    email: ""
  });
  const [isOpen, setIsOpen] = useState(false);
  const [mobileError, setMobileError] = useState("");

  const packages = [
    { id: "digital", name: "PAIS Digital – ₹3,999", color: "text-[#00BCFF]" },
    { id: "complete", name: "PAIS Complete – ₹4,999", color: "text-emerald-500" }
  ];

  const selectedData = packages.find(p => p.id === selectedPackage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "mobile") {
      const valid = /^[6-9]\d{9}$/.test(value.trim());
      setMobileError(value && !valid ? "Enter a valid 10-digit Indian mobile number" : "");
    }
  };

  const handleWhatsAppSend = (e) => {
    e.preventDefault();
    const valid = /^[6-9]\d{9}$/.test(formData.mobile.trim());
    if (!valid) {
      setMobileError("Enter a valid 10-digit Indian mobile number");
      return;
    }

    const message = encodeURIComponent(
      `*New PAIS Enrollment Inquiry*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `*Student Details*\n` +
      `- *Name:* ${formData.name}\n` +
      `- *Class:* ${formData.className}\n` +
      `- *School:* ${formData.school || "N/A"}\n` +
      `- *Area:* ${formData.area}\n\n` +
      `*Parent/Contact Details*\n` +
      `- *Name:* ${formData.parentName || "N/A"}\n` +
      `- *Mobile:* ${formData.mobile}\n` +
      `- *Email:* ${formData.email}\n\n` +
      `*Selected Package*\n` +
      `- ${selectedData ? selectedData.name : "Not Selected"}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━`
    );

    // Pathfinder WhatsApp number (set via VITE_WHATSAPP_NUMBER in .env)
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919147178886";
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10" id="enquiry-section">
      <div className="grid lg:grid-cols-2 gap-16 items-start">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-10 max-w-2xl"
        >
          <div className="space-y-4">
            <div className="text-[#00BCFF] font-bold uppercase tracking-[0.2em] text-xs" id="enquiry-tag">
              Start Your PAIS Journey Today
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.2]">
              Fill in your details, choose <br />
              your package, and get <br />
              started.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              The earlier your tracking starts, the stronger your academic growth becomes.
              Choose your package and take the first step toward a more disciplined,
              measurable, and smarter study journey in Physics, Chemistry, Mathematics
              and Biology.
            </p>
          </div>

          <div className="bg-[#0A111E]/50 border border-[#00BCFF]/20 p-8 rounded-[24px]">
            <h4 className="text-lg font-bold mb-6 text-white">Why buy now?</h4>
            <ul className="space-y-4 text-xs font-semibold text-slate-300">
              {[
                "Early discipline compounds over time",
                "Weaknesses identified early are easier to fix",
                "Better practice now leads to stronger board and competitive foundations later",
                "Tracked students usually outperform untracked students over time"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#00BCFF] mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Right Content - Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-[#0A111E] border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl overflow-hidden relative">
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-1">Purchase / Enquiry Form</h3>
              <p className="text-slate-500 text-xs">Complete the details below to proceed.</p>
            </div>

            <form className="space-y-4" onSubmit={handleWhatsAppSend}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Student Name *"
                  required
                  className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#00BCFF]/50 transition-all font-medium"
                />
                <input
                  type="text"
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  placeholder="Class *"
                  required
                  className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#00BCFF]/50 transition-all font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Area *"
                  required
                  className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#00BCFF]/50 transition-all font-medium"
                />
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  placeholder="School Name (optional)"
                  className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#00BCFF]/50 transition-all font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  placeholder="Parent / Guardian (optional)"
                  className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#00BCFF]/50 transition-all font-medium"
                />
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="Mobile Number *"
                    required
                    maxLength={10}
                    className={`bg-white/5 border ${mobileError ? 'border-red-500/60' : 'border-white/5'} rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#00BCFF]/50 transition-all font-medium`}
                  />
                  {mobileError && (
                    <p className="text-red-400 text-[11px] px-1">{mobileError}</p>
                  )}
                </div>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address *"
                required
                className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#00BCFF]/50 transition-all font-medium"
              />

              {/* Custom Dropdown */}
              <div className="relative">
                <div
                  onClick={() => setIsOpen(!isOpen)}
                  className={`w-full bg-white/5 border ${isOpen ? 'border-[#00BCFF]/50' : 'border-white/5'} rounded-xl px-5 py-4 text-sm flex items-center justify-between cursor-pointer transition-all font-medium ${selectedData ? selectedData.color : 'text-slate-400'}`}
                >
                  <span>{selectedData ? selectedData.name : "Select Package"}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="text-slate-500 text-[10px]"
                  >
                    ▼
                  </motion.span>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-[#111827] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                    >
                      <div
                        onClick={() => { setSelectedPackage(""); setIsOpen(false); }}
                        className="px-5 py-3 text-sm text-slate-400 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        Select Package
                      </div>
                      {packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          onClick={() => { setSelectedPackage(pkg.id); setIsOpen(false); }}
                          className={`px-5 py-3 text-sm ${pkg.color} hover:bg-white/5 cursor-pointer transition-colors font-semibold`}
                        >
                          {pkg.name}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 bg-white/5 border border-white/10 rounded accent-[#00BCFF]"
                />
                <label>I agree to be contacted by Pathfinder regarding my PAIS enrollment.</label>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-[#00BCFF] to-[#009ED9] hover:from-[#009ED9] hover:to-[#007AB8] text-white font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 text-sm uppercase tracking-wider"
              >
                Proceed to Purchase
              </button>
              <p className="text-center text-[10px] text-slate-500 italic">
                A counselor may contact you to guide you through activation and onboarding.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EnquiryForm;
