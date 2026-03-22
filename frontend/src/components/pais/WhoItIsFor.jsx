import React from 'react';
import { motion } from 'framer-motion';

const WhoItIsFor = () => {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      <div className="text-center mb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="text-[#00BCFF] font-bold uppercase tracking-[0.2em] text-xs">
            Who This Is For
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.2] max-w-3xl mx-auto">
            PAIS is ideal for students who want an edge
          </h2>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Students who want better marks",
            desc: "Turn effort into visible academic improvement through better practice, revision, and performance analysis."
          },
          {
            title: "Students who want stronger discipline",
            desc: "Stay consistent with attendance tracking, activity monitoring, and measurable academic progress."
          },
          {
            title: "Parents who want real visibility",
            desc: "See what is actually happening in your child's learning journey instead of waiting for a disappointing result."
          }
        ].map((target, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-[#0A111E]/60 border border-white/5 p-10 rounded-[32px] hover:border-[#00BCFF]/20 hover:bg-[#0A111E] transition-all group flex flex-col justify-between min-h-[320px]"
          >
            <div className="space-y-6">
              <h3 className="text-2xl font-bold leading-tight group-hover:text-[#00BCFF] transition-colors">
                {target.title}
              </h3>
              <p className="text-slate-400 text-md leading-relaxed">
                {target.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhoItIsFor;
