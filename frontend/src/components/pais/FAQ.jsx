import React from 'react';
import { motion } from 'framer-motion';

const FAQ = () => {
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
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.2] max-w-3xl mx-auto">
            Frequently asked questions
          </h2>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {[
          {
            q: "Which classes is PAIS for?",
            a: "PAIS is designed for students of Classes 7 to 10."
          },
          {
            q: "Which subjects are covered?",
            a: "PAIS currently focuses on Physics, Chemistry, Mathematics and Biology."
          },
          {
            q: "Will parents get access too?",
            a: "Yes. Parent visibility is a core part of the platform so guardians can track progress clearly."
          },
          {
            q: "Are recorded lectures included?",
            a: "Yes. Recorded lecture access is included in both packages."
          },
          {
            q: "What is the difference between the two packages?",
            a: "The ₹3,999 package gives full portal access without printed study materials. The ₹4,999 package includes the same portal plus study materials."
          },
          {
            q: "How often is progress updated?",
            a: "Progress updates continuously as attendance, tests, activity and performance data are recorded."
          },
          {
            q: "Can I upgrade later from Digital to Complete?",
            a: "Yes. Students can begin with the digital plan and later upgrade to include study materials."
          }
        ].map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="bg-[#0A111E]/40 border border-white/5 p-6 md:p-8 rounded-[24px] hover:border-[#00BCFF]/20 hover:bg-[#0A111E] transition-all cursor-default"
          >
            <h4 className="text-lg font-bold mb-3 text-slate-100">{faq.q}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
