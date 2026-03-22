import React from 'react';
import { motion } from 'framer-motion';

const ComparisonSection = () => {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

        {/* Guide Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-[#00BCFF]/15 to-[#0A111E] border border-[#00BCFF]/25 rounded-[32px] p-10 md:p-12 h-full shadow-xl shadow-[#00BCFF]/5"
        >
          <div className="space-y-4 mb-10">
            <div className="text-[#00BCFF] font-bold uppercase tracking-[0.2em] text-xs">
              Which Package Should You Choose
            </div>
            <h2 className="text-3xl font-bold tracking-tight leading-[1.2]">
              Not sure which one is <br />
              right for you?
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-[#00BCFF]/10 border border-[#00BCFF]/20 p-6 rounded-2xl group hover:border-[#00BCFF]/50 hover:bg-[#00BCFF]/15 transition-all cursor-default">
              <h4 className="text-md font-bold mb-2 text-[#00BCFF] transition-colors">PAIS Digital – ₹3,999</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Best if you want the full portal experience, smart analytics, and digital
                study support without printed study materials.
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl group hover:border-emerald-500/40 hover:bg-emerald-500/15 transition-all cursor-default">
              <h4 className="text-md font-bold mb-2 text-emerald-400 transition-colors">PAIS Complete – ₹4,999</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Best if you want the full portal plus study materials for stronger
                offline practice, revision and discipline.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Parent Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500/15 to-[#0A111E] border border-emerald-500/25 rounded-[32px] p-10 md:p-12 h-full shadow-xl shadow-emerald-500/5"
        >
          <div className="space-y-4 mb-10">
            <div className="text-[#00BCFF] font-bold uppercase tracking-[0.2em] text-xs">
              Why Parents Love PAIS
            </div>
            <h2 className="text-3xl font-bold tracking-tight leading-[1.2]">
              No more guessing about <br />
              your child's progress
            </h2>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            Parents can see attendance, progress, performance, revision behavior,
            and subject-wise consistency clearly. Instead of waiting for poor results,
            they can identify issues early and support better habits.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-auto">
            {[
              "Better academic visibility",
              "Early weakness detection",
              "Stronger discipline and consistency",
              "More confidence in real progress"
            ].map((tag, i) => (
              <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-[10px] font-bold text-emerald-300 text-center flex items-center justify-center hover:bg-emerald-500/15 transition-all">
                {tag}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ComparisonSection;
