import React from 'react';
import { motion } from 'framer-motion';

const HowItHelps = () => {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10" id="how-it-works">
      <div className="grid lg:grid-cols-2 gap-16 items-center">

        {/* Left Content - Steps */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <div className="text-[#00BCFF] font-bold uppercase tracking-[0.2em] text-xs" id="how-helps-tag">
              How PAIS Helps You Improve
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.2]">
              From confusion to <br />
              confidence
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
              PAIS helps you stop guessing and start improving with clarity,
              repetition, and measurable performance insight.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            {[
              "Learn through structured content and recorded lectures in Physics, Chemistry, Mathematics and Biology",
              "Practice through unlimited chapter-wise and topic-wise tests",
              "Get detailed analysis after every test including mistakes, speed and weak areas",
              "Understand your strengths and gaps through SWOT reports and performance dashboards",
              "Improve continuously with revision modules, repeated practice and parent visibility"
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-6 bg-white/5 border border-white/5 p-5 rounded-2xl hover:bg-white/10 transition-all group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-[#00BCFF] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(0,188,255,0.4)]">
                  {i + 1}
                </div>
                <p className="text-slate-300 text-sm font-medium leading-relaxed group-hover:text-white transition-colors">
                  {step}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Content - Growth Snapshot Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-[#0A111E] border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden relative">
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-1">Growth Snapshot</h3>
              <p className="text-slate-500 text-xs">See what your academic growth can look like over time.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: "Revision Streak", val: "14 Days" },
                { label: "Practice Sessions", val: "22 This Month" },
                { label: "Average Accuracy", val: "83%" },
                { label: "Improvement Trend", val: "+11%" }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">{stat.label}</div>
                  <div className="text-xl font-bold text-emerald-400">{stat.val}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold">This Week's Focus</h4>
                <span className="text-[9px] uppercase font-bold text-[#00BCFF] bg-[#00BCFF]/10 px-2 py-0.5 rounded border border-[#00BCFF]/20">
                  AI Suggested
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  "Physics numericals",
                  "Chemistry reactions",
                  "Mathematics speed drills",
                  "Biology recall practice"
                ].map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 bg-[#00BCFF]/5 border border-[#00BCFF]/20 rounded-full text-[10px] font-semibold text-[#00BCFF]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HowItHelps;
