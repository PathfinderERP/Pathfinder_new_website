import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';

const Ribbon = () => {
  // 48 hours in seconds = 48 * 3600 = 172800
  const INITIAL_SECONDS = 172800 - (7 * 60 + 27); // Matching his screenshot starting point (roughly) or just use full 48h
  const [timeLeft, setTimeLeft] = useState(INITIAL_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return INITIAL_SECONDS; // Looping restart
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 py-2.5 px-4 text-white text-center shadow-lg relative z-[60] font-sans">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 font-bold tracking-tight text-[11px] sm:text-[13px]">
        <span className="flex items-center gap-1.5 uppercase letter-spacing-[0.05em]">
          <span className="text-sm">⌛</span> Limited Launch Window
        </span>
        <span className="hidden sm:inline opacity-50">•</span>
        <span className="tabular-nums">Ends in {formatTime(timeLeft)}</span>
        <span className="hidden sm:inline opacity-50">•</span>
        <span className="bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-md border border-white/20 font-black">
          Only 4848 seats left at launch pricing
        </span>
      </div>
    </div>
  );
};

const Pais = () => {
  useEffect(() => {
    // Set page title
    document.title = "PAIS | Pathfinder Academy";
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout showHeader={false} showFooter={false}>
      <Ribbon />
      <div className="min-h-screen bg-[#050B14] text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
        </div>

        {/* Hero Section */}
        <section className="relative pt-16 md:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs font-semibold tracking-wide">
                Pathfinder Academic Intelligence System (PAIS)
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1]">
                Study smarter. <br />
                <span className="text-blue-500">Track better.</span> <br />
                Improve faster.
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
                <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-95">
                  Choose Your Package
                </button>
                <button className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all">
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
              {/* Dashboard Glass Card */}
              <div className="bg-[#0A111E] border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                {/* Internal Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
                
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
                      <div className="h-full bg-blue-500 rounded-full w-[93%]" />
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                    <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-3">Practice Completion</div>
                    <div className="text-3xl font-black mb-3">86%</div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[86%]" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Subject Performance</div>
                      <h4 className="text-md font-bold text-slate-200">PCM-B Accuracy Snapshot</h4>
                    </div>
                    <div className="text-[10px] text-blue-400 font-bold uppercase animate-pulse">Live</div>
                  </div>
                  
                  <div className="space-y-5">
                    {[
                      { s: 'Physics', p: 82, c: 'bg-emerald-500' },
                      { s: 'Chemistry', p: 79, c: 'bg-emerald-500' },
                      { s: 'Mathematics', p: 88, c: 'bg-blue-500' },
                      { s: 'Biology', p: 84, c: 'bg-cyan-500' }
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-400">{item.s}</span>
                          <span>{item.p}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${item.c} rounded-full`} style={{ width: `${item.p}%` }} />
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
            </motion.div>

          </div>
        </section>

        {/* Why Students Need This Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4 max-w-3xl"
            >
              <div className="text-blue-500 font-bold uppercase tracking-[0.2em] text-xs">
                Why Students Need This
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight">
                Why do some students improve <br className="hidden md:block" />
                faster than others?
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
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
                className="bg-[#0A111E]/50 border border-white/5 p-8 rounded-[24px] hover:border-blue-500/20 hover:bg-[#0A111E] transition-all group"
              >
                <h3 className="text-lg font-bold mb-4 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* What You Get Inside PAIS Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
          <div className="text-center mb-16 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="text-blue-500 font-bold uppercase tracking-[0.2em] text-xs">
                What You Get Inside PAIS
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight max-w-2xl mx-auto">
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
                className="bg-[#0A111E]/40 border border-white/5 p-6 rounded-[20px] hover:border-blue-500/20 hover:bg-[#0A111E] transition-all group flex flex-col items-start h-full"
              >
                <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full mb-4">
                  Feature
                </span>
                <h3 className="text-md font-bold mb-3 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How PAIS Helps You Improve Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
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
                <div className="text-emerald-500 font-bold uppercase tracking-[0.2em] text-xs">
                  How PAIS Helps You Improve
                </div>
                <h2 className="text-4xl md:text-5xl font-black leading-tight">
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
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)]">
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
                    <span className="text-[9px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
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
                      <span key={i} className="px-3 py-1.5 bg-blue-500/5 border border-blue-500/20 rounded-full text-[10px] font-semibold text-blue-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Who This Is For Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
          <div className="text-center mb-16 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="text-blue-500 font-bold uppercase tracking-[0.2em] text-xs">
                Who This Is For
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight max-w-3xl mx-auto">
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
                className="bg-[#0A111E]/60 border border-white/5 p-10 rounded-[32px] hover:border-blue-500/20 hover:bg-[#0A111E] transition-all group flex flex-col justify-between min-h-[320px]"
              >
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold leading-tight group-hover:text-blue-400 transition-colors">
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

        {/* Pricing Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
          <div className="text-center mb-16 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="text-blue-500 font-bold uppercase tracking-[0.2em] text-xs">
                Pricing and Packages
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight max-w-3xl mx-auto">
                Choose the package that fits <br className="hidden md:block" />
                your study style
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
                Same smart portal. Two choices. Pick digital-only access or go for the version with study materials.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto pb-12">
            {/* PAIS Digital */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#0A111E] border border-blue-500/20 rounded-[32px] p-8 md:p-10 relative flex flex-col h-full"
            >
              <div className="absolute -top-4 left-8 bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
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
              <ul className="space-y-4 mb-20 flex-grow">
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
                  <li key={i} className="flex items-start gap-3 text-[13px] text-slate-300">
                    <span className="text-emerald-500 mt-1 flex-shrink-0">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95">
                Choose Digital
              </button>
            </motion.div>

            {/* PAIS Complete */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#0A111E]/40 border border-emerald-500/20 rounded-[32px] p-8 md:p-10 relative flex flex-col h-full"
            >
              <div className="absolute -top-4 left-8 bg-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(16,185,129,0.2)]">
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
              <ul className="space-y-4 mb-20 flex-grow">
                {[
                  "Everything included in PAIS Digital",
                  "Printed study materials for Physics, Chemistry, Mathematics and Biology",
                  "Better offline practice and physical revision support",
                  "More structured home-study experience",
                  "Ideal for students who prefer both screen learning and hard-copy study"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-slate-300">
                    <span className="text-emerald-500 mt-1 flex-shrink-0">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-black font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95">
                Choose Complete
              </button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto mt-6 bg-white/5 border border-white/5 p-4 rounded-2xl"
          >
            <p className="text-center text-amber-500/80 text-[11px] font-bold tracking-wide">
              Early launch pricing is limited. Once the launch allocation closes, access may move to the next slab.
            </p>
          </motion.div>
        </section>

        {/* Comparison & Parent Value Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Guide Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#0A111E] border border-blue-500/20 rounded-[32px] p-10 md:p-12 h-full"
            >
              <div className="space-y-4 mb-10">
                <div className="text-blue-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                  Which Package Should You Choose
                </div>
                <h2 className="text-3xl font-black leading-tight">
                  Not sure which one is <br />
                  right for you?
                </h2>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl group hover:border-blue-500/30 transition-all cursor-default">
                  <h4 className="text-md font-bold mb-2 group-hover:text-blue-400 transition-colors">PAIS Digital – ₹3,999</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Best if you want the full portal experience, smart analytics, and digital 
                    study support without printed study materials.
                  </p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl group hover:border-blue-500/30 transition-all cursor-default">
                  <h4 className="text-md font-bold mb-2 group-hover:text-blue-400 transition-colors">PAIS Complete – ₹4,999</h4>
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
              className="bg-[#0A111E] border border-emerald-500/20 rounded-[32px] p-10 md:p-12 h-full"
            >
              <div className="space-y-4 mb-10">
                <div className="text-emerald-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                  Why Parents Love PAIS
                </div>
                <h2 className="text-3xl font-black leading-tight">
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
                  <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl text-[10px] font-bold text-slate-400 text-center flex items-center justify-center">
                    {tag}
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
          <div className="text-center mb-16 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="text-blue-500 font-bold uppercase tracking-[0.2em] text-xs">
                Testimonials
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight max-w-3xl mx-auto">
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
                className="bg-[#0A111E]/40 border border-white/5 p-10 rounded-[32px] hover:border-blue-500/20 hover:bg-[#0A111E] transition-all group flex flex-col justify-between"
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

        {/* FAQ Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
          <div className="text-center mb-16 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                FAQ
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight max-w-3xl mx-auto">
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
                className="bg-[#0A111E]/40 border border-white/5 p-6 md:p-8 rounded-[24px] hover:border-blue-500/20 hover:bg-[#0A111E] transition-all cursor-default"
              >
                <h4 className="text-lg font-bold mb-3 text-slate-100">{faq.q}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Enquiry Form Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <div className="text-blue-500 font-bold uppercase tracking-[0.2em] text-xs">
                  Start Your PAIS Journey Today
                </div>
                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                  Fill in your details, choose <br />
                  your package, and get <br />
                  started.
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                  The earlier your tracking starts, the stronger your academic growth becomes. 
                  Choose your package and take the first step toward a more disciplined, 
                  measurable, and smarter study journey in Physics, Chemistry, Mathematics 
                  and Biology.
                </p>
              </div>

              <div className="bg-[#0A111E]/50 border border-blue-500/20 p-8 rounded-[24px]">
                <h4 className="text-lg font-bold mb-6 text-white">Why buy now?</h4>
                <ul className="space-y-4 text-xs font-semibold text-slate-300">
                  {[
                    "Early discipline compounds over time",
                    "Weaknesses identified early are easier to fix",
                    "Better practice now leads to stronger board and competitive foundations later",
                    "Tracked students usually outperform untracked students over time"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-blue-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Right Content - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-[#0A111E] border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl overflow-hidden relative">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-1">Purchase / Enquiry Form</h3>
                  <p className="text-slate-500 text-xs">Complete the details below to proceed.</p> 
                </div>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Student Name" className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium" />
                    <input type="text" placeholder="Class" className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Area" className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium" />
                    <input type="text" placeholder="School Name" className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Parent / Guardian Name" className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium" />
                    <input type="text" placeholder="Mobile Number" className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium" />
                  </div>
                  <input type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium" />
                  
                  <select className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm text-slate-400 focus:outline-none focus:border-blue-500/50 transition-all font-medium appearance-none">
                    <option value="">Select Package</option>
                    <option value="digital">PAIS Digital – ₹3,999</option>
                    <option value="complete">PAIS Complete – ₹4,999</option>
                  </select>

                  <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400">
                    <input type="checkbox" className="w-4 h-4 bg-white/5 border border-white/10 rounded accent-blue-600" />
                    <label>I agree to be contacted by Pathfinder regarding my PAIS enrollment.</label>
                  </div>

                  <button className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 text-sm uppercase tracking-wider">
                    Proceed to Purchase
                  </button>
                  <p className="text-center text-[10px] text-slate-500 italic">
                    A counselor may contact you to guide you through activation and onboarding.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final Call Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-[#0A111E] to-[#050B14] border border-white/10 rounded-[48px] p-12 md:p-20 text-center space-y-8 shadow-2xl relative overflow-hidden group"
          >
            <div className="space-y-4">
              <div className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                Final Call
              </div>
              <h2 className="text-4xl md:text-6xl font-black leading-tight max-w-4xl mx-auto">
                Your marks can improve. But only <br />
                if your progress is tracked.
              </h2>
              <p className="text-slate-400 text-lg max-w-3xl mx-auto">
                Choose PAIS and turn studying into a smarter, more disciplined, measurable 
                journey for Physics, Chemistry, Mathematics and Biology.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
              <button className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 text-sm">
                Buy Now
              </button>
              <button className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black rounded-2xl transition-all text-sm">
                Compare Packages
              </button>
            </div>
          </motion.div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Pais;
