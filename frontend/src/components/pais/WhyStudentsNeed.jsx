import React from 'react';
import { motion } from 'framer-motion';

const WhyStudentsNeed = () => {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4 max-w-5xl"
        >
          <div className="text-[#00BCFF] font-bold uppercase tracking-[0.2em] text-xs" id="why-students-tag">
            Why Students Need This
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.2]">
            Why do some students improve <br className="hidden md:block" />
            faster than others?
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
            Because the best students do not only study. They track mistakes, revise consistently,
            practice smartly, understand weak areas, and improve every week. PAIS helps you
            do exactly that for Physics, Chemistry, Mathematics and Biology.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Know your exact weak chapters",
            desc: "Stop guessing which parts are holding you back. PAIS shows where improvement is actually needed."
          },
          {
            title: "Practice without limits",
            desc: "The more you practice the right way, the sharper your concepts and exam performance become."
          },
          {
            title: "Revise anytime",
            desc: "Recorded lectures and revision modules make it easier to go back, reinforce, and master difficult topics."
          },
          {
            title: "Track growth week by week",
            desc: "See visible proof of progress through dashboards, analytics, and consistency tracking."
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-[#0A111E]/50 border border-white/5 p-8 rounded-[24px] hover:border-[#00BCFF]/20 hover:bg-[#0A111E] transition-all group"
          >
            <h3 className="text-lg font-bold mb-4 group-hover:text-[#00BCFF] transition-colors">
              {feature.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhyStudentsNeed;
