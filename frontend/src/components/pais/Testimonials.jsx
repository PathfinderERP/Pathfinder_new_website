import React from 'react';
import { motion } from 'framer-motion';

const Testimonials = () => {
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
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.2] max-w-3xl mx-auto">
            What students and parents <br className="hidden md:block" />
            would say
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Real outcomes matter. That is why both students and parents connect with PAIS so quickly.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            quote: "I started taking practice much more seriously after I could see my weak chapters clearly in Maths and Science.",
            author: "Ritwik",
            role: "Class 8 Student"
          },
          {
            quote: "For the first time, I could actually understand where my child was struggling and where improvement was happening.",
            author: "Parent of Aarohi",
            role: "Class 9 Guardian"
          },
          {
            quote: "The dashboard and recorded lectures made revision much easier before exams, especially in Physics and Chemistry.",
            author: "Sneha",
            role: "Class 10 Student"
          }
        ].map((testimonial, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-[#0A111E]/40 border border-white/5 p-10 rounded-[32px] hover:border-[#00BCFF]/20 hover:bg-[#0A111E] transition-all group flex flex-col justify-between"
          >
            <div className="space-y-8">
              <p className="text-slate-300 text-lg italic leading-relaxed font-medium">
                "{testimonial.quote}"
              </p>
              <div className="pt-4 border-t border-white/5">
                <h4 className="text-md font-bold text-white mb-1">{testimonial.author}</h4>
                <p className="text-slate-500 text-xs font-semibold">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
