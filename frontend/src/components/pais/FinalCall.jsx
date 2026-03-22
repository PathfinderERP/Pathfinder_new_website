import React, { useState } from 'react';
import { motion } from 'framer-motion';
import EnrollmentModal from './EnrollmentModal';

const FinalCall = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative rounded-[40px] px-10 py-16 md:px-20 md:py-20 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0A111E 0%, #050B14 60%, #091520 100%)',
          border: '1px solid rgba(0,188,255,0.12)',
          boxShadow: '0 0 60px rgba(0,188,255,0.06)',
        }}
      >
        {/* Glow orbs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#00BCFF]/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-emerald-500/8 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">

          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00BCFF]/25 bg-[#00BCFF]/8 text-[#00BCFF] text-[10px] font-bold uppercase tracking-[0.25em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00BCFF] animate-pulse" />
            Final Call
          </div>

          {/* Headline — medium size */}
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.25] text-white">
            Your marks can improve.{' '}
            <span style={{
              background: 'linear-gradient(90deg, #00BCFF 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              But only if your progress is tracked.
            </span>
          </h2>

          <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto">
            Choose PAIS and turn studying into a smarter, more disciplined,
            measurable journey for Physics, Chemistry, Mathematics and Biology.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setModalOpen(true)}
              className="group px-9 py-3.5 font-bold rounded-xl text-white text-sm transition-all hover:-translate-y-0.5 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #00BCFF, #009ED9)',
                boxShadow: '0 0 24px rgba(0,188,255,0.35)',
              }}
            >
              Buy Now →
            </button>

            <button
              onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-9 py-3.5 font-bold rounded-xl text-white text-sm border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              Compare Packages
            </button>
          </div>

          {/* Main website link */}
          <p className="text-[11px] text-slate-600 pt-2">
            A product by{' '}
            <a
              href="/"
              className="text-slate-400 hover:text-[#00BCFF] font-semibold transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-[#00BCFF]/40"
            >
              Pathfinder Academy
            </a>
            {' '}· Helping students grow since 2010
          </p>

        </div>
      </motion.div>

      <EnrollmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialPackage=""
      />
    </section>
  );
};

export default FinalCall;
