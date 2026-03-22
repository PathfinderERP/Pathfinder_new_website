import React, { useState } from 'react';
import { motion } from 'framer-motion';
import EnrollmentModal from './EnrollmentModal';

const PricingSection = ({ onSelectPackage }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [chosenPackage, setChosenPackage] = useState("");

  const openModal = (pkgId) => {
    setChosenPackage(pkgId);
    setModalOpen(true);
  };

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10" id="pricing-section">
      <div className="text-center mb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="text-[#00BCFF] font-bold uppercase tracking-[0.2em] text-xs" id="pricing-tag">
            Pricing and Packages
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.2] max-w-3xl mx-auto">
            Choose the package that fits <br className="hidden md:block" />
            your study style
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Same smart portal. Two choices. Pick digital-only access or go for the version with study materials.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto pb-8">
        {/* PAIS Digital */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-b from-[#00BCFF]/20 to-[#0A111E] border border-[#00BCFF]/30 rounded-[32px] p-6 md:p-8 relative flex flex-col h-full group hover:border-[#00BCFF]/50 transition-all shadow-2xl shadow-[#00BCFF]/10"
        >
          <div className="absolute -top-4 left-6 bg-[#00BCFF] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(0,188,255,0.4)]">
            Best Value
          </div>
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">PAIS Digital</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl md:text-5xl font-black text-white">₹3,999</span>
              <span className="text-slate-500 text-sm font-medium">/year</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed font-semibold">
              For students who want the full portal without printed study materials
            </p>
          </div>
          <ul className="space-y-1.5 mb-8 flex-grow">
            {[
              "Physics, Chemistry, Mathematics and Biology for Classes 7–10",
              "Attendance tracking and study consistency view",
              "Unlimited chapter-wise and topic-wise practice exams",
              "Detailed test performance analytics and mistake breakdown",
              "Personalized SWOT analysis and weak-topic detection",
              "Recorded lecture library for revision anytime",
              "Digital notes, worksheets and concept sheets",
              "Progress dashboard, revision modules and benchmarking",
              "Parent visibility and performance monitoring"
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-4 text-[13px] text-slate-300 font-medium">
                <span className="text-[#00BCFF] text-3xl mt-[-9px] flex-shrink-0">•</span>
                {feature}
              </li>
            ))}
          </ul>
          <button 
            onClick={() => openModal("digital")}
            className="w-full py-4 bg-gradient-to-r from-[#00BCFF] to-[#009ED9] hover:from-[#009ED9] hover:to-[#007AB8] text-white font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95"
          >
            Choose Digital
          </button>
        </motion.div>

        {/* PAIS Complete */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-b from-emerald-500/20 to-[#0A111E] border border-emerald-500/30 rounded-[32px] p-6 md:p-8 relative flex flex-col h-full group hover:border-emerald-500/50 transition-all shadow-2xl shadow-emerald-500/10"
        >
          <div className="absolute -top-4 left-6 bg-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            Most Popular
          </div>
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">PAIS Complete</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl md:text-5xl font-black text-white">₹4,999</span>
              <span className="text-slate-500 text-sm font-medium">/year</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed font-semibold">
              Everything in the portal plus study materials for stronger offline reinforcement
            </p>
          </div>
          <ul className="space-y-1.5 mb-8 flex-grow">
            {[
              "Everything included in PAIS Digital",
              "Printed study materials for Physics, Chemistry, Mathematics and Biology",
              "Better offline practice and physical revision support",
              "More structured home-study experience",
              "Ideal for students who prefer both screen learning and hard-copy study"
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-4 text-[13px] text-slate-300 font-medium">
                <span className="text-emerald-500 text-3xl mt-[-9px] flex-shrink-0">•</span>
                {feature}
              </li>
            ))}
          </ul>
          <button 
            onClick={() => openModal("complete")}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-black font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95"
          >
            Choose Complete
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl"
      >
        <p className="text-center text-amber-500 font-bold tracking-wide text-xs">
          Early launch pricing is limited. Once the launch allocation closes, access may move to the next slab.
        </p>
      </motion.div>
      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialPackage={chosenPackage}
      />
    </section>
  );
};

export default PricingSection;
