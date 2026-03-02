import { getImageUrl } from "../../utils/imageUtils";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  UserGroupIcon,
  TrophyIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

const AboutUs = () => {
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);
  const timelineRef = useRef(null);

  const timelineItems = [
    { year: "1991", label: "Year of Establishment" },
    { year: "1992", label: "First all India Class" },
    { year: "1992", label: "Board Department Established" },
    { year: "2001", label: "Foundation Dept Established" },
    { year: "2020", label: "First Online Class" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimelineIndex((prev) => (prev + 1) % timelineItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timelineRef.current && window.innerWidth < 1024) {
      const container = timelineRef.current;
      const itemWidth = container.offsetWidth - 64; // Adjusted for w-[calc(100vw-64px)]
      container.scrollTo({
        left: (itemWidth + 16) * currentTimelineIndex, // 16 is gap-4
        behavior: 'smooth'
      });
    }
  }, [currentTimelineIndex]);

  const stats = [
    {
      icon: <AcademicCapIcon className="w-8 h-8 lg:w-10 lg:h-10" />,
      label: "10K+",
      sublabel: "Students Trained",
      description: "Empowering thousands of students yearly to achieve their academic dreams."
    },
    {
      icon: <TrophyIcon className="w-8 h-8 lg:w-10 lg:h-10" />,
      label: "95%",
      sublabel: "Success Rate",
      description: "Consistent track record in top competitive exams across India."
    },
    {
      icon: <UserGroupIcon className="w-8 h-8 lg:w-10 lg:h-10" />,
      label: "50+",
      sublabel: "Expert Faculty",
      description: "Renowned mentors and subject matter experts dedicated to student growth."
    },
    {
      icon: <RocketLaunchIcon className="w-8 h-8 lg:w-10 lg:h-10" />,
      label: "15+",
      sublabel: "Years Experience",
      description: "Three decades of legacy in shaping careers and leading education."
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-white pt-12 lg:pt-24">


        <div className="max-w-[1536px] mx-auto px-6 md:px-12 lg:px-20 container relative">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between min-h-[600px] lg:min-h-[700px]">
            {/* Left Side Content */}
            <div className="w-full lg:w-[40%] z-30 text-center lg:text-left pt-4 pb-48 lg:pt-0 lg:pb-0 relative">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h1 className="text-3xl md:text-7xl lg:text-[60px] font-black text-[#1a1a1a] leading-none tracking-tighter mb-10">
                  DECODING <span className="text-[#FF7F3E]">SUCCESS</span><br />
                  SINCE 1993
                </h1>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 25px 50px -12px rgba(255, 127, 62, 0.5)",
                    background: "linear-gradient(to right, #FFA366, #FF5F00)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-[#FFB380] to-[#FF5F00] text-white px-12 lg:px-20 py-4 lg:py-6 rounded-[20px] text-2xl lg:text-4xl font-black shadow-[0_20px_40px_-5px_rgba(255, 95, 0, 0.3)] transition-all duration-300 uppercase tracking-tight"
                >
                  START
                </motion.button>
              </motion.div>
            </div>

            {/* Right Side Figures and Background */}
            <div className="w-[calc(100%+3rem)] lg:w-[55%] relative h-[450px] md:h-[650px] lg:h-[750px] flex items-end justify-center lg:justify-end -mx-6 lg:mx-0 -mb-24 lg:mt-0 lg:mb-0 lg:pb-0 lg:pr-16 z-0">
              {/* Orange Grid Background */}
              <div
                className="absolute top-0 right-0 md:right-[-13%] lg:right-[-13%] w-full md:w-[120%] lg:w-[130%] h-full z-0 pointer-events-none opacity-100"
                style={{
                  backgroundImage: `url("${getImageUrl("/images/about us page/herobg.webp")}")`,
                  backgroundPosition: 'top right',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'contain'
                }}
              />

              {/* Foreground Figure */}
              <motion.img
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                src={getImageUrl("/images/about us page/herofigure.webp")}
                alt="Pathfinder Figure"
                className="relative z-10 w-full h-full object-contain bottom-12 lg:bottom-0 translate-y-[-5%] lg:translate-y-[25%] pointer-events-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar Section */}
      <section className="relative z-30 -mt-[150px]">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-black rounded-none md:rounded-t-[50px] p-4 md:p-8 lg:p-12 "
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="group [perspective:1000px] h-[200px] lg:h-[260px]">
                  <motion.div
                    className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]"
                  >
                    {/* Front Side */}
                    <div className="absolute inset-0 bg-[#1C1C1C] rounded-2xl p-6 lg:p-10 flex flex-col items-center text-center [backface-visibility:hidden]">
                      <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#FF7F3E] to-[#FF5F00] rounded-2xl flex items-center justify-center text-white mb-4 lg:mb-6 shadow-lg shadow-orange-500/20">
                        <div className="transform scale-90 lg:scale-100">
                          {stat.icon}
                        </div>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                        {stat.label}
                      </h3>
                      <p className="text-slate-400 text-xs lg:text-sm font-medium">
                        {stat.sublabel}
                      </p>
                    </div>

                    {/* Back Side */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF7F3E] to-[#FF5F00] rounded-2xl p-6 lg:p-8 flex items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                      <p className="text-white text-sm lg:text-base font-bold leading-relaxed">
                        {stat.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="pt-8 pb-32 lg:py-10 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">

          {/* Mission */}
          <div className="mb-4 lg:mb-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-baseline gap-4 mb-4 lg:mb-6">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-[900] text-black tracking-tighter">
                  OUR
                </h2>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFB380] to-[#FF5F00]"></div>
                  <h2 className="relative text-4xl md:text-6xl lg:text-7xl font-thin italic text-black tracking-tighter px-4 z-10">
                    MISSION
                  </h2>
                </div>
              </div>

              <p className="text-lg md:text-xl lg:text-2xl text-zinc-600 leading-relaxed font-medium max-w-4xl">
                To nurture students to achieve success in their academic pursuits. To encourage parents to participate with the school authorities in decision making partnerships. To provide most eminent teachers for improving student performance, through quality teaching and their commitment to offer guidance and mentoring.
              </p>
            </motion.div>
          </div>

          {/* Vision */}
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32 mt-[-120px]">
            {/* Vision Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2"
            >
              <img
                src={getImageUrl("/images/about us page/our vision.webp")}
                alt="Our Vision"
                className="w-full h-[400px] lg:h-[800px] object-contain object-center drop-shadow-2xl"
              />
            </motion.div>

            {/* Vision Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2"
            >
              <div className="flex items-baseline gap-4 mb-8 lg:mb-12 justify-start lg:justify-start">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-[900] text-black tracking-tighter">
                  OUR
                </h2>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFB380] to-[#FF5F00]"></div>
                  <h2 className="relative text-4xl md:text-6xl lg:text-7xl font-thin italic text-black tracking-tighter px-4 z-10">
                    VISION
                  </h2>
                </div>
              </div>

              <p className="text-lg md:text-xl lg:text-2xl text-zinc-600 leading-relaxed font-medium text-left">
                Our vision is to be a premier educational hub, empowering students with excellence in competitive exam preparation. At PATHFINDER, we strive to nurture future leaders through innovative teaching, personalized mentoring, and holistic development, turning aspirations into achievements.
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* History Section (Orange Background) */}
      <section className="bg-gradient-to-r from-[#FFB380] to-[#FF5F00] pt-20 pb-32 lg:pt-24 lg:pb-48 relative z-20 -mt-24 lg:-mt-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-white space-y-6"
          >
            <p className="text-base md:text-lg font-medium leading-relaxed text-left">
              Pathfinder was established three decades ago with a small number of students but with a big dream — a dream to impart holistic education to the students of Eastern India and help them in building a successful professional career through outstanding academic performance.
            </p>
            <p className="text-base md:text-lg font-medium leading-relaxed text-left">
              Today that dream has turned into a reality. After setting new benchmarks for success, year after year, Pathfinder is now regarded as the No. 1 Institute in Eastern India for guiding students in Competitive exams like JEE (Main & Advanced), NEET-UG, WBJEE, Olympiads, as well as in all class X and XII Board exams like CBSE, ICSE, ISC, Madhyamik and H.S.
            </p>
            <p className="text-base md:text-lg font-medium leading-relaxed text-left">
              After three decades of creating excellence in the domain of education, Pathfinder now looks forward to offering yet more opportunities and helping the students to turn their aspirations into reality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section (Overlapping) */}
      <div
        ref={timelineRef}
        className="relative z-30 -mt-24 lg:-mt-20 pb-0 lg:pb-20 w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth"
      >
        <div className="flex flex-nowrap justify-start lg:justify-center items-center gap-4 lg:gap-0 px-6 min-w-max lg:min-w-full mx-auto">
          {timelineItems.map((item, index, arr) => (
            <React.Fragment key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-black rounded-[2rem] w-[calc(100vw-64px)] md:w-60 h-40 md:h-36 flex-shrink-0 snap-center flex flex-col items-center justify-center shadow-2xl relative z-10"
              >
                <h3 className="text-3xl md:text-5xl font-black text-white mb-1 tracking-tighter">{item.year}</h3>
                <p className="text-[10px] md:text-xs text-zinc-400 text-center font-medium leading-tight px-2">{item.label}</p>
              </motion.div>
              {index < arr.length - 1 && (
                <div className="hidden lg:flex items-center justify-center -mx-5 z-20">
                  <div className="w-12 h-12 rounded-full bg-[#FF9F66] border-[4px] border-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* The Team Section */}
      <section className="py-8 lg:py-2 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-0"
          >
            <div className="flex items-baseline justify-center gap-4">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-[900] text-black tracking-tighter">
                THE
              </h2>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFB380] to-[#FF5F00]"></div>
                <h2 className="relative text-4xl md:text-6xl lg:text-7xl font-thin italic text-black tracking-tighter px-4 z-10">
                  TEAM
                </h2>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Photos - Full Width Black Background */}
      <section className="relative w-full">
        {/* Black Background Strip */}
        <div className="absolute bottom-0 left-0 w-full h-[180px] md:h-[220px] lg:h-[240px] bg-black"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full overflow-x-auto overflow-y-hidden px-6 lg:px-10 pt-16 lg:pt-20 pb-0"
        >
          <div className="flex items-end justify-center gap-0 flex-nowrap min-w-max lg:min-w-full mx-auto group/team">
            {[
              { name: "Abhishek Sir", image: "Abhishek Sir.webp", role: "Sr. Faculty", desc: "Expert in JEE Mathematics with 15+ years experience." },
              { name: "Biswajit Sir", image: "Biswajit Sir.webp", role: "Sr. Faculty", desc: "Physics specialist known for conceptual clarity." },
              { name: "Chairman Sir", image: "Chairman Sir.webp", role: "Founder & Chairman", desc: "The visionary behind Pathfinder's academic excellence." },
              { name: "CEO Mam", image: "CEO mam.webp", isCEO: true, role: "CEO", desc: "Leading the mission to empower students across India." },
              { name: "Subhojit Sir", image: "subhojit Sir.webp", role: "Sr. Faculty", desc: "Expert in Chemistry and competitive exam strategies." },
              { name: "Dipanjan Sir", image: "Dipanjan Sir.webp", role: "Sr. Faculty", desc: "Mathematics guru for NEET and Board preparations." },
              { name: "Jitendra Sir", image: "Jitendra Sir.webp", role: "Sr. Faculty", desc: "Dedicated mentor for Foundation and Olympiad students." },
              { name: "Sourabh Sir", image: "Sourabh Sir.webp", role: "Sr. Faculty", desc: "Proven track record in guiding toppers in competitive exams." },
            ].map((teacher, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ zIndex: 110, transition: { duration: 0.2 } }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group flex-shrink-0 -ml-8 first:ml-0 relative transition-all duration-500 lg:group-hover/team:blur-[2px] lg:group-hover/team:opacity-40 lg:hover:!blur-none lg:hover:!opacity-100"
                style={{ zIndex: teacher.isCEO ? 100 : index }}
              >
                <img
                  src={getImageUrl(`images/about us page/teachers_image/${teacher.image}`)}
                  alt={teacher.name}
                  className={teacher.isCEO
                    ? "h-48 md:h-60 lg:h-[300px] w-auto object-contain"
                    : "h-40 md:h-52 lg:h-[270px] w-auto object-contain"
                  }
                />
                {/* Hover Info Card (Large Screens Only) */}
                <div
                  className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 w-48 bg-black/95 backdrop-blur-md border border-orange-500/40 rounded-2xl p-4 flex-col items-center text-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:-translate-y-2 pointer-events-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50"
                >
                  <h4 className="text-orange-500 font-black text-sm tracking-tight">{teacher.name}</h4>
                  <p className="text-white font-bold text-[10px] mb-2 uppercase tracking-widest">{teacher.role}</p>
                  <div className="w-8 h-[2px] bg-orange-500/50 mb-2"></div>
                  <p className="text-zinc-300 text-[10px] leading-snug font-medium italic">
                    "{teacher.desc}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pathfinder Advantage Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
          >
            {/* Left Side: Heading */}
            <div className="text-center md:text-right flex flex-col items-center md:items-end">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black leading-[0.9] tracking-tighter">
                PATHFINDER
              </h2>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-thin italic text-[#FF5F00] leading-[0.9] tracking-tighter">
                ADVANTAGE
              </h2>
            </div>

            {/* Vertical Separator Line (Hidden on mobile) */}
            <div className="hidden md:block w-[2px] h-32 bg-[#FFCBAB]"></div>

            {/* Right Side: Description */}
            <div className="text-center md:text-left max-w-2xl">
              <p className="text-gray-900 text-sm md:text-base lg:text-lg font-medium leading-relaxed">
                Pathfinder Educational Centre is a trusted name in the realm of academic
                excellence, particularly in JEE MAIN AND ADVANCED, NEET, FOUNDATION
                and OLYMPIADS coaching. Here are several reasons why it has become a
                premier destination for students aiming to achieve top ranks:
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comprehensive Study Materials Section */}
      <section className="bg-white pt-0 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
            {/* Left Side: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-[45%] text-center md:text-left pr-0 mt-12 md:mt-0"
            >
              <div className="flex flex-col items-center md:items-start mb-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-black leading-[0.9] tracking-tighter uppercase">
                  COMPREHENSIVE
                </h2>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#FF5F00] leading-[0.9] tracking-tighter uppercase">
                  STUDY MATERIALS
                </h2>
              </div>

              <p className="text-gray-900 text-sm md:text-base font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
                We provide meticulously curated study materials that align
                with the latest examination patterns and syllabi for JEE
                MAIN AND ADVANCED, NEET UG, FOUNDATION and
                OLYMPIADS. These resources are designed to bridge the
                gap between theory and application.
              </p>
            </motion.div>

            {/* Right Side: Image with Decorative Background */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-[50%] relative flex justify-center md:justify-end"
            >
              {/* Orange Decorative Stripe */}
              <div className="absolute top-1/2 -translate-y-1/2 right-[-100px] md:right-[-250px] w-[300px] md:w-[600px] h-[80px] md:h-[120px] bg-gradient-to-r from-[#FFB380] to-[#FF5F00] z-0"></div>

              <img
                src={getImageUrl("/images/about us page/Books.webp")}
                alt="Comprehensive Study Materials"
                className="relative z-10 w-full max-w-[280px] md:max-w-[420px] object-contain drop-shadow-xl translate-x-0 md:translate-x-16"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Student-Centric Environment Section */}
      <section className="bg-white pt-0 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-col-reverse md:flex-row items-center justify-center md:justify-between">
            {/* Left Side: Image with Decorative Background */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-[50%] relative flex justify-center md:justify-start"
            >
              {/* Orange Decorative Stripe */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[-100px] md:left-[-250px] w-[300px] md:w-[600px] h-[80px] md:h-[120px] bg-gradient-to-r from-[#FFB380] to-[#FF5F00] z-0"></div>

              <img
                src={getImageUrl("/images/about us page/Students.webp")}
                alt="Student-Centric Environment"
                className="relative z-10 w-full max-w-[280px] md:max-w-[420px] object-contain drop-shadow-xl translate-x-0 md:-translate-x-0"
              />

              {/* White Curved Overlay at Bottom - Simple Border Radius Method */}
              <div className="absolute -bottom-[10px] md:-bottom-[90px] left-1/2 -translate-x-1/2 w-[140%] h-[50px] md:h-[180px] bg-white rounded-[100%] z-20"></div>
            </motion.div>

            {/* Right Side: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-[45%] text-center md:text-left pl-0 md:pl-8 mt-12 md:mt-0 mb-0 md:mb-0"
            >
              <div className="flex flex-col items-center md:items-start mb-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-black leading-[0.9] tracking-tighter uppercase">
                  STUDENT-CENTRIC
                </h2>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#FF5F00] leading-[0.9] tracking-tighter uppercase">
                  ENVIRONMENT
                </h2>
              </div>

              <p className="text-gray-900 text-sm md:text-base font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
                We believe in unlocking the potential of each child, and to
                achieve this, we create a student-centric learning environment.
                Our approach encourages critical thinking and problem-solving
                skills, fostering academic growth and confidence.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Focus on Holistic Development Section */}
      <section className="bg-white pt-0 pb-0 overflow-hidden relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
            {/* Left Side: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-[45%] text-center md:text-left pr-0 mt-12 md:mt-0"
            >
              <div className="flex flex-col items-center md:items-start mb-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-black leading-[0.9] tracking-tighter uppercase">
                  FOCUS ON
                </h2>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#FF5F00] leading-[0.9] tracking-tighter uppercase">
                  HOLISTIC DEVELOPMENT
                </h2>
              </div>

              <p className="text-gray-900 text-sm md:text-base font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
                We believe in nurturing not just academic excellence but also
                the overall personality of our students. Our holistic development
                programs focus on building character, leadership qualities, and
                emotional intelligence, preparing them for life's challenges.
              </p>
            </motion.div>

            {/* Right Side: Image with Decorative Background */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-[50%] relative flex justify-center md:justify-end"
            >
              {/* Orange Decorative Stripe */}
              <div className="absolute top-1/2 -translate-y-1/2 right-[-100px] md:right-[-250px] w-[300px] md:w-[600px] h-[80px] md:h-[120px] bg-gradient-to-r from-[#FFB380] to-[#FF5F00] z-0"></div>

              <img
                src={getImageUrl("/images/about us page/CEO.webp")}
                alt="Holistic Development"
                className="relative z-10 w-full max-w-[280px] md:max-w-[420px] object-contain drop-shadow-xl translate-x-0 md:translate-x-0  md:mt-0"
              />

              {/* White Curved Overlay at Bottom - Simple Border Radius Method */}
              <div className="absolute -bottom-[10px] md:-bottom-[90px] left-1/2 -translate-x-1/2 w-[140%] h-[50px] md:h-[180px] bg-white rounded-[100%] z-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Innovative Teaching Techniques Section */}
      <section className="bg-white pt-0 pb-0 overflow-hidden mt-0 md:-mt-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-col-reverse md:flex-row items-center justify-center md:justify-between">
            {/* Left Side: Image with Decorative Background */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-[50%] relative flex justify-center md:justify-start"
            >
              {/* Orange Decorative Stripe */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[-100px] md:left-[-250px] w-[300px] md:w-[600px] h-[80px] md:h-[120px] bg-gradient-to-r from-[#FFB380] to-[#FF5F00] z-0"></div>

              <img
                src={getImageUrl("/images/about us page/Woman.webp")}
                alt="Innovative Teaching Techniques"
                className="relative z-10 w-full max-w-[320px] md:max-w-[550px] object-contain drop-shadow-xl translate-x-0 md:-translate-x-0 mt-[-80px] md:-mt-[100px]"
              />

              {/* White Curved Overlay at Bottom - Simple Border Radius Method */}
              <div className="absolute -bottom-[10px] md:-bottom-[90px] left-1/2 -translate-x-1/2 w-[140%] h-[50px] md:h-[180px] bg-white rounded-[100%] z-20"></div>
            </motion.div>

            {/* Right Side: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-[45%] text-center md:text-left pl-0 md:pl-8 mt-12 md:mt-0 mb-0 md:mb-0"
            >
              <div className="flex flex-col items-center md:items-start mb-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-black leading-[0.9] tracking-tighter uppercase">
                  INNOVATIVE
                </h2>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#FF5F00] leading-[1.1] tracking-tighter uppercase">
                  TEACHING TECHNIQUES
                </h2>
              </div>

              <p className="text-gray-900 text-sm md:text-base font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
                Pathfinder integrates modern teaching tools, including
                Mobile Application (PATHTEX), problem-solving
                workshops, and AI-based performance tracking, to make
                learning engaging and efficient.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
