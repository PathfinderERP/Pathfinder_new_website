import React from 'react';
import { motion } from 'framer-motion';

const WhatYouGet = () => {
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
          <div className="text-[#00BCFF] font-bold uppercase tracking-[0.2em] text-xs" id="what-you-get-tag">
            What You Get Inside PAIS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.2] max-w-2xl mx-auto">
            Everything you need in one smart portal
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Built specifically for Classes 7–10 with focus on Physics, Chemistry, Mathematics and Biology.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {[
          {
            title: "Attendance Tracking",
            desc: "Know how consistent you are across your academic journey and build stronger study discipline from the start."
          },
          {
            title: "Unlimited Practice Exams",
            desc: "Practice Physics, Chemistry, Mathematics and Biology chapter-wise and topic-wise as many times as needed."
          },
          {
            title: "Detailed Test Analysis",
            desc: "See where you lost marks, which concepts are weak, how much time you used, and what to improve next."
          },
          {
            title: "Personalized SWOT Analysis",
            desc: "Understand your academic strengths, weaknesses, opportunities, and risk zones with a clear improvement path."
          },
          {
            title: "Recorded Lecture Library",
            desc: "Revise concepts anytime through recorded lectures so missed classes or weak chapters do not hold you back."
          },
          {
            title: "Digital Study Material",
            desc: "Get one place for notes, worksheets, concept sheets, question banks, and practice support."
          },
          {
            title: "Progress Dashboard",
            desc: "Track your improvement visually across subjects, tests, revisions, and accuracy patterns week after week."
          },
          {
            title: "Revision Modules",
            desc: "Quickly revisit key concepts before school exams, Olympiads, unit tests, and foundation milestones."
          },
          {
            title: "Performance Benchmarking",
            desc: "See how you compare with peers and understand where you need to push harder to stay ahead."
          },
          {
            title: "Parent Visibility",
            desc: "Parents can clearly track attendance, progress, subject performance, and academic consistency without confusion."
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="bg-[#0A111E]/40 border border-white/5 p-6 rounded-[20px] hover:border-[#00BCFF]/20 hover:bg-[#0A111E] transition-all group flex flex-col items-start h-full"
          >
            <span className="inline-block px-3 py-1 bg-[#00BCFF]/10 border border-[#00BCFF]/20 text-[#00BCFF] text-[10px] font-bold rounded-full mb-4">
              Feature
            </span>
            <h3 className="text-md font-bold mb-3 group-hover:text-[#00BCFF] transition-colors">
              {feature.title}
            </h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhatYouGet;
