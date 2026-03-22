import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const packages = [
  { id: "digital",  name: "PAIS Digital – ₹3,999",  color: "text-[#00BCFF]",    accent: "#00BCFF",  gradient: "from-[#00BCFF] to-[#009ED9]" },
  { id: "complete", name: "PAIS Complete – ₹4,999", color: "text-emerald-400", accent: "#10b981", gradient: "from-emerald-500 to-teal-500" }
];

const EnrollmentModal = ({ isOpen, onClose, initialPackage = "" }) => {
  const [formData, setFormData] = useState({
    name: "", className: "", area: "", school: "",
    parentName: "", mobile: "", email: ""
  });
  const [selectedPackage, setSelectedPackage] = useState(initialPackage);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileError, setMobileError] = useState("");

  const selectedData = packages.find(p => p.id === selectedPackage);

  useEffect(() => {
    if (isOpen) {
      setSelectedPackage(initialPackage);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, initialPackage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "mobile") {
      const valid = /^[6-9]\d{9}$/.test(value.trim());
      setMobileError(value && !valid ? "Enter a valid 10-digit Indian mobile number" : "");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = /^[6-9]\d{9}$/.test(formData.mobile.trim());
    if (!valid) {
      setMobileError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    const message = encodeURIComponent(
      `📌 *New PAIS Enrollment Inquiry*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🎓 *Student Details*\n` +
      `- *Name:* ${formData.name}\n` +
      `- *Class:* ${formData.className}\n` +
      `- *School:* ${formData.school || "N/A"}\n` +
      `- *Area:* ${formData.area}\n\n` +
      `📞 *Parent/Contact Details*\n` +
      `- *Name:* ${formData.parentName || "N/A"}\n` +
      `- *Mobile:* ${formData.mobile}\n` +
      `- *Email:* ${formData.email}\n\n` +
      `📚 *Selected Package*\n` +
      `- ${selectedData ? selectedData.name : "Not Selected"}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━`
    );

    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919147178886";
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const inputClass =
    "w-full bg-[#0d1829] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00BCFF]/50 transition-all font-medium";

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        /* Full-screen fixed overlay — rendered directly in <body> via portal */
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal card */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative w-full max-w-md bg-[#0A111E] border border-white/10 rounded-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div
              className="px-6 pt-6 pb-5 border-b border-white/5 flex-shrink-0"
              style={{
                background: selectedData
                  ? `linear-gradient(135deg, ${selectedData.accent}18, transparent)`
                  : 'transparent'
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1"
                    style={{ color: selectedData?.accent || '#00BCFF' }}
                  >
                    PAIS Enrollment
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {selectedData ? selectedData.name : "Choose Your Package"}
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Fill in details — we'll connect you on WhatsApp
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 ml-4 flex-shrink-0 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* ── Scrollable body ── */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <form id="enrollment-form" className="space-y-3" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                    placeholder="Student Name *" required className={inputClass} />
                  <input type="text" name="className" value={formData.className} onChange={handleInputChange}
                    placeholder="Class * (e.g. 9)" required className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="area" value={formData.area} onChange={handleInputChange}
                    placeholder="Area / Location *" required className={inputClass} />
                  <input type="text" name="school" value={formData.school} onChange={handleInputChange}
                    placeholder="School Name (optional)" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="parentName" value={formData.parentName} onChange={handleInputChange}
                    placeholder="Parent / Guardian (optional)" className={inputClass} />
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="Mobile Number *"
                      required
                      maxLength={10}
                      className={`${inputClass} ${mobileError ? 'border-red-500/60 focus:border-red-500/80' : ''}`}
                    />
                    {mobileError && (
                      <p className="text-red-400 text-[11px] px-1">{mobileError}</p>
                    )}
                  </div>
                </div>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                  placeholder="Email Address *" required className={inputClass} />

                {/* Package dropdown */}
                <div className="relative">
                  <div
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`w-full bg-[#0d1829] border ${dropdownOpen ? 'border-[#00BCFF]/50' : 'border-white/10'} rounded-xl px-4 py-3 text-sm flex items-center justify-between cursor-pointer transition-all font-medium ${selectedData ? selectedData.color : 'text-slate-500'}`}
                  >
                    <span>{selectedData ? selectedData.name : "Select Package"}</span>
                    <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} className="text-slate-500 text-[10px] ml-2">
                      ▼
                    </motion.span>
                  </div>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute top-full left-0 w-full mt-1.5 bg-[#111827] border border-white/10 rounded-xl shadow-2xl py-1.5 z-10"
                      >
                        {packages.map(pkg => (
                          <div
                            key={pkg.id}
                            onClick={() => { setSelectedPackage(pkg.id); setDropdownOpen(false); }}
                            className={`px-4 py-3 text-sm ${pkg.color} hover:bg-white/5 cursor-pointer transition-colors font-semibold`}
                          >
                            {pkg.name}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-start gap-3 pt-1 text-[11px] text-slate-400">
                  <input type="checkbox" required className="mt-0.5 w-4 h-4 accent-[#00BCFF] flex-shrink-0" />
                  <label>I agree to be contacted by Pathfinder regarding my PAIS enrollment.</label>
                </div>
              </form>
            </div>

            {/* ── Sticky footer with CTA ── */}
            <div className="px-6 pb-6 pt-3 flex-shrink-0 border-t border-white/5 bg-[#0A111E]">
              <button
                type="submit"
                form="enrollment-form"
                className={`w-full py-4 bg-gradient-to-r ${selectedData ? selectedData.gradient : 'from-[#00BCFF] to-[#009ED9]'} text-white font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm uppercase tracking-wider`}
              >
                Send via WhatsApp →
              </button>
              <p className="text-center text-[10px] text-slate-500 italic mt-2">
                A counselor will contact you to guide through activation.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default EnrollmentModal;
