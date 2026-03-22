import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="relative pt-16 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#00BCFF]/30 bg-[#00BCFF]/5 text-[#00BCFF] text-xs font-bold uppercase tracking-[0.2em]" id="hero-pais-tag">
            Pathfinder Academic Intelligence System (PAIS)
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.2]" id="hero-headline">
            Study smarter. <span className="text-[#00BCFF]">Track</span> <br />
            <span className="text-[#00BCFF]">better.</span> Improve <br />
            faster.
          </h1>

          <div className="space-y-4 max-w-xl">
            <p className="text-slate-400 text-lg leading-relaxed">
              PAIS is a smart academic growth portal for students of Classes 7–10
              focused on Physics, Chemistry, Mathematics and Biology. It helps you stay
              consistent, practice more, revise smarter, and improve with visible proof of progress.
            </p>
            <p className="text-emerald-400 font-bold text-lg">
              Don't just study hard. Study with clarity, structure, and proof of progress.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-[#00BCFF] hover:bg-[#009ED9] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,188,255,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-95" 
              id="hero-cta-main"
            >
              Choose Your Package
            </button>
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all" 
              id="hero-cta-secondary"
            >
              See How PAIS Works
            </button>
          </div>

          <div className="flex flex-wrap gap-3 pt-6">
            {[
              "For Classes 7-10",
              "Physics • Chemistry • Mathematics • Biology",
              "Unlimited Practice",
              "Recorded Lectures",
              "Parent Visibility"
            ].map((tag, i) => (
              <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right Content - Dashboard UI Preview */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative"
        >
          {/* Fixed Backdrop Glow Effect (Stable) */}
          <div className="absolute inset-x-[-15%] inset-y-[-15%] bg-[#00BCFF]/10 blur-[100px] rounded-full -z-10" />

          {/* Double Border Outer Container */}
          <div className="p-3 bg-[#00BCFF]/5 border border-[#00BCFF]/10 rounded-[40px] backdrop-blur-sm relative z-10">

            {/* Dashboard Glass Card (Inner Border) */}
            <div className="bg-[#0A111E] border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
              {/* Internal Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00BCFF]/10 rounded-full blur-3xl" />

              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-slate-500 text-xs font-semibold mb-1">Student Dashboard Preview</div>
                  <h3 className="text-xl font-bold">Aarav Roy — <span className="text-slate-400 font-medium">Class 8</span></h3>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                  Improving
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-3">Attendance</div>
                  <div className="text-3xl font-black mb-3">93%</div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#00BCFF] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '93%' }}
                      transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-3">Practice Completion</div>
                  <div className="text-3xl font-black mb-3">86%</div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '86%' }}
                      transition={{ duration: 1.2, delay: 0.7, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Subject Performance</div>
                    <h4 className="text-md font-bold text-slate-200">PCM-B Accuracy Snapshot</h4>
                  </div>
                  <div className="text-[10px] text-[#00BCFF] font-bold uppercase animate-pulse">Live</div>
                </div>

                <div className="space-y-5">
                  {[
                    { s: 'Physics',     p: 82, c: 'bg-emerald-500' },
                    { s: 'Chemistry',  p: 79, c: 'bg-emerald-500' },
                    { s: 'Mathematics', p: 88, c: 'bg-[#00BCFF]'  },
                    { s: 'Biology',    p: 84, c: 'bg-cyan-500'    }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400">{item.s}</span>
                        <span>{item.p}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${item.c} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.p}%` }}
                          transition={{ duration: 1.1, delay: 0.8 + i * 0.15, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">SWOT Insight</div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Strong in Biology retention. Needs better accuracy and speed in Physics numericals and Chemistry application.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">Parent Visibility</div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Parents can see attendance, subject trends, revision consistency, and performance updates in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
