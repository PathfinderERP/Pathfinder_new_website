// import React from "react";

// const Footer = () => {
//   const cols = [
//     {
//       h: "Courses",
//       links: ["Foundation", "Boards", "JEE", "NEET", "Mock Tests"],
//     },
//     { h: "Centers", links: ["Kolkata", "Durgapur", "Siliguri", "All centers"] },
//     {
//       h: "Resources",
//       links: ["Blog", "Downloads", "Student Corner", "Community"],
//     },
//     { h: "Company", links: ["About", "Franchisee", "Careers", "Contact"] },
//   ];
//   return (
//     <footer id="footer" className="bg-white border-t border-slate-200">
//       <div className="mx-auto max-w-7xl px-4 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
//         {cols.map((c) => (
//           <div key={c.h}>
//             <div className="font-semibold mb-2">{c.h}</div>
//             <ul className="space-y-1 text-slate-600">
//               {c.links.map((l) => (
//                 <li key={l}>
//                   <a href="#" className="hover:text-slate-900">
//                     {l}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         ))}
//       </div>
//       <div className="mx-auto max-w-7xl px-4 pb-8 text-sm text-slate-500 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">
//             PF
//           </div>
//           <span>
//             © {new Date().getFullYear()} Pathfinder Educational Institute
//           </span>
//         </div>
//         <div className="space-x-3">
//           <a href="#">Privacy</a>
//           <a href="#">Terms</a>
//           <a href="#">Refund</a>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
  FaInstagram,
  FaTwitter,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaChevronDown,
  FaRocket,
  FaAward,
  FaGraduationCap,
  FaUsers,
  FaStar,
  FaHeart,
  FaChevronUp,
} from "react-icons/fa";
import { motion, useInView, useScroll, useTransform, useSpring } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const Footer = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef(null);
  const endSectionRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });
  const isEndInView = useInView(endSectionRef, { once: true, margin: "-50px" });

  const [showScrollTop, setShowScrollTop] = useState(false);
  const { scrollYProgress: windowScrollProgress } = useScroll();
  const smoothProgress = useSpring(windowScrollProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate DashOffset for the ring: 175.9 (empty) to 0 (full)
  const ringDashOffset = useTransform(smoothProgress, [0, 1], [175.9, 0]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

  useEffect(() => {
    if (isInView) {
      setIsVisible(true);
    }
  }, [isInView]);

  const footerSections = {
    "About Us": [
      { name: "Why Pathfinder", href: "/about-us" },
      { name: "CEO's Message", href: "/ceo-message" },
      { name: "Chairman's Message", href: "/chairman-message" },
    ],
    Courses: [
      { name: "All India", href: "/courses/all-india" },
      { name: "Foundation", href: "/courses/foundation" },
      { name: "Boards", href: "/courses/boards" },
    ],
    Results: [
      { name: "All India Toppers", href: "/results/all-india" },
      { name: "Foundation Results", href: "/results/foundation" },
      { name: "Board Results", href: "/results/boards" },
    ],
    "Student Corner": [
      { name: "Student's Corner", href: "/students-corner" },
      { name: "Alumni", href: "/alumni" },
      { name: "Franchise", href: "/franchise" },
    ],
    "Quick Links": [
      { name: "Career", href: "/career" },
      { name: "Blog", href: "/blog" },
      { name: "Centers", href: "/centres" },
      { name: "Contact", href: "/contact" },
    ],
  };

  const socialMedia = [
    {
      name: "Facebook",
      icon: FaFacebookF,
      href: "https://www.facebook.com/officialPathfinder/",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      href: "https://www.linkedin.com/company/pathfinder-institutes/",
    },
    {
      name: "YouTube",
      icon: FaYoutube,
      href: "https://www.youtube.com/channel/UCfi5HAZ_rEcnVnXmrB2kcXg",
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      href: "https://api.whatsapp.com/send/?phone=9147178886",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      href: "https://www.instagram.com/pathfinderinstitutewb/",
    },
    { name: "Twitter", icon: FaTwitter, href: "https://x.com/pathfinder_2016" },
  ];

  const stats = [
    {
      icon: FaGraduationCap,
      number: "10K+",
      text: "Students Trained",
      delay: 0,
    },
    { icon: FaAward, number: "95%", text: "Success Rate", delay: 0.1 },
    { icon: FaUsers, number: "50+", text: "Expert Faculty", delay: 0.2 },
    { icon: FaRocket, number: "15+", text: "Years Experience", delay: 0.3 },
  ];

  const letters = "PATHFINDER".split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const floatVariants = {
    initial: { y: 0 },
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // WhatsApp button animations
  const whatsappJumpVariants = {
    initial: { y: 0 },
    jump: {
      y: [0, -25, 0, -15, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut",
      },
    },
  };

  const whatsappPulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const ringPulseVariants = {
    initial: { scale: 1, opacity: 0.7 },
    pulse: {
      scale: [1, 1.8, 2.2],
      opacity: [0.7, 0.3, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut",
      },
    },
  };
  // const { isAdminAuthenticated } = useAuth();
  // if (isAdminAuthenticated) {
  //   return null;
  // }
  const [isSocialVisible, setIsSocialVisible] = useState(true);
  const [isToggleExpanded, setIsToggleExpanded] = useState(true);

  // Auto-hide social sidebar on mobile after 1 second
  useEffect(() => {
    if (window.innerWidth < 1024) {
      const hideTimer = setTimeout(() => {
        setIsSocialVisible(false);
        setIsToggleExpanded(false);
      }, 1500);
      return () => clearTimeout(hideTimer);
    }
  }, []);

  // Shrink toggle button after 1s of being expanded
  useEffect(() => {
    if (isToggleExpanded) {
      const timer = setTimeout(() => {
        setIsToggleExpanded(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isToggleExpanded]);

  return (
    <>
      <footer
        className="relative bg-[#161616] text-[#F8E4C2] overflow-hidden z-10 w-full shadow-2xl"
        ref={footerRef}
      >
        {/* Animated Background Elements */}
        <motion.div className="absolute inset-0 opacity-10" style={{ opacity }}>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-yellow-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-28 h-28 bg-red-500 rounded-full blur-3xl"></div>
        </motion.div>

        {/* Floating Particles */}
        <motion.div
          className="absolute top-20 left-10 text-orange-500 opacity-30"
          variants={floatVariants}
          initial="initial"
          animate="float"
        >
          <FaStar size={20} />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-yellow-500 opacity-40"
          variants={floatVariants}
          initial="initial"
          animate="float"
          transition={{ delay: 1 }}
        >
          <FaHeart size={16} />
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-20 text-red-500 opacity-30"
          variants={floatVariants}
          initial="initial"
          animate="float"
          transition={{ delay: 2 }}
        >
          <FaStar size={18} />
        </motion.div>

        {/* Top Footer */}
        <motion.div
          className="relative z-10 py-12 md:py-16 px-4 sm:px-6 lg:px-8"
          style={{ opacity, scale }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Stats Section - Appears on scroll */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={containerVariants}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.text}
                  variants={itemVariants}
                  custom={index}
                  className="text-center p-6 bg-[#1f1f1f] rounded-2xl border border-gray-800 hover:border-orange-500/50 transition-all duration-500 group"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <stat.icon className="text-white text-2xl" />
                  </motion.div>
                  <motion.h3
                    className="text-2xl md:text-3xl font-bold text-white mb-2"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                  >
                    {stat.number}
                  </motion.h3>
                  <p className="text-gray-400 group-hover:text-orange-500 transition-colors duration-300">
                    {stat.text}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Footer Menu */}
            <motion.div
              className="flex flex-wrap justify-center gap-x-12 md:gap-x-20 gap-y-10 mb-12"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {Object.entries(footerSections).map(([title, links]) => (
                <motion.div key={title} variants={itemVariants} className="group">
                  <div className="lg:hidden">
                    <button
                      className="flex justify-between items-center w-full py-3 text-lg font-semibold"
                      onClick={() =>
                        setOpenDropdown(openDropdown === title ? null : title)
                      }
                    >
                      <span>{title}</span>
                      <motion.div
                        animate={{ rotate: openDropdown === title ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaChevronDown className="text-orange-500" />
                      </motion.div>
                    </button>
                    <motion.ul
                      initial={false}
                      animate={{
                        height: openDropdown === title ? "auto" : 0,
                        opacity: openDropdown === title ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden space-y-2 ml-4"
                    >
                      {links.map((link) => (
                        <li key={link.name}>
                          <motion.a
                            href={link.href}
                            className="text-gray-400 hover:text-orange-500 transition-colors duration-300 block py-1"
                            whileHover={{ x: 5 }}
                          >
                            {link.name}
                          </motion.a>
                        </li>
                      ))}
                    </motion.ul>
                  </div>

                  <div className="hidden lg:block">
                    <h5
                      className="text-lg font-semibold mb-4 relative pb-2 
                    after:content-[''] after:absolute after:bottom-0 after:left-0 
                    after:w-12 after:h-0.5 after:bg-orange-500 after:rounded-full"
                    >
                      {title}
                    </h5>
                    <ul className="space-y-2">
                      {links.map((link) => (
                        <li key={link.name}>
                          <motion.a
                            href={link.href}
                            className="text-gray-400 hover:text-orange-500 transition-colors duration-300 flex items-center group/link"
                            whileHover={{ x: 5 }}
                          >
                            <span className="w-1 h-1 bg-orange-500 rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
                            {link.name}
                          </motion.a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Contact & Social Section */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {/* Location Card */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-4 bg-[#1f1f1f] rounded-2xl p-6 border border-gray-800 hover:border-orange-500/30 transition-all duration-500 group"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start space-x-4">
                  <motion.div
                    className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaMapMarkerAlt className="text-white text-lg" />
                  </motion.div>
                  <div>
                    <h4 className="text-xl font-semibold mb-3">Location</h4>
                    <p className="text-gray-400 group-hover:text-orange-500 transition-colors duration-300">
                      47, Kalidas Patitundi Lane, Kolkata, West Bengal - 700026
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Contact Card */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-4 bg-[#1f1f1f] rounded-2xl p-6 border border-gray-800 hover:border-orange-500/30 transition-all duration-500 group"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start space-x-4">
                  <motion.div
                    className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaPhone className="text-white text-lg" />
                  </motion.div>
                  <div>
                    <h4 className="text-xl font-semibold mb-3">Contact</h4>
                    <div className="space-y-2">
                      <motion.a
                        href="tel:+919147178886"
                        className="block text-gray-400 hover:text-orange-500 transition-colors duration-300"
                        whileHover={{ x: 5 }}
                      >
                        +91 9147178886
                      </motion.a>
                      <motion.a
                        href="mailto:info@pathfinder.edu.in"
                        className="block text-gray-400 hover:text-orange-500 transition-colors duration-300"
                        whileHover={{ x: 5 }}
                      >
                        info@pathfinder.edu.in
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Social Card */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-4 bg-[#1f1f1f] rounded-2xl p-6 border border-gray-800 hover:border-orange-500/30 transition-all duration-500 group"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start space-x-4">
                  <motion.div
                    className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaEnvelope className="text-white text-lg" />
                  </motion.div>
                  <div>
                    <h4 className="text-xl font-semibold mb-3">Follow Us</h4>
                    <div className="flex flex-wrap gap-3">
                      {socialMedia.map((social, idx) => (
                        <motion.a
                          key={idx}
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={social.name}
                          className={`flex items-center justify-center w-10 h-10 rounded-xl 
                          bg-gray-800 text-white transition-all duration-300 group/social
                          ${social.name === "Facebook"
                              ? "hover:bg-[#1877F2]"
                              : ""
                            }
                          ${social.name === "LinkedIn"
                              ? "hover:bg-[#0A66C2]"
                              : ""
                            }
                          ${social.name === "YouTube"
                              ? "hover:bg-[#FF0000]"
                              : ""
                            }
                          ${social.name === "WhatsApp"
                              ? "hover:bg-[#25D366]"
                              : ""
                            }
                          ${social.name === "Instagram"
                              ? "hover:bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                              : ""
                            }
                          ${social.name === "Twitter"
                              ? "hover:bg-[#1DA1F2]"
                              : ""
                            }
                        `}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <social.icon className="group-hover/social:scale-110 transition-transform duration-200" />
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Animated Logo Section */}
            <motion.div
              className="text-center"
              ref={endSectionRef}
              initial="hidden"
              animate={isEndInView ? "visible" : "hidden"}
              variants={containerVariants}
            >
              <motion.h4
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mt-8 md:mt-12 tracking-widest"
                variants={pulseVariants}
                animate={isEndInView ? "pulse" : "initial"}
              >
                {letters.map((letter, index) => (
                  <motion.span
                    key={index}
                    custom={index}
                    variants={itemVariants}
                    className="inline-block mx-0.5 md:mx-1"
                    whileHover={{
                      y: -8,
                      scale: 1.2,
                      color: "#f97316",
                      transition: { duration: 0.2 },
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.h4>

              {/* Final CTA Animation */}
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isEndInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{ delay: 1, duration: 0.8 }}
              >
                <motion.p
                  className="text-xl text-gray-400 mb-6"
                  variants={pulseVariants}
                  animate={isEndInView ? "pulse" : "initial"}
                >
                  Ready to start your success journey?
                </motion.p>
                <motion.a
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaRocket className="mr-3" />
                  Get Started Today
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Footer */}
        <motion.div
          className="relative z-10 bg-[#292929] py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <motion.p
                className="text-gray-400 text-center md:text-left text-sm"
                whileHover={{ color: "#f97316" }}
                transition={{ duration: 0.3 }}
              >
                2025 © All rights reserved by Pathfinder. Developed by{" "}
                <a
                  href="https://www.pixelsolutionz.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F8E4C2] font-semibold hover:text-orange-500 transition-colors duration-300"
                >
                  Pathfinder
                </a>
              </motion.p>

              <motion.ul
                className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm"
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
              >
                {["Privacy Policy", "Cookie Policy", "Disclaimer"].map((item) => (
                  <motion.li key={item} variants={itemVariants}>
                    <a
                      href={`/${item.toLowerCase().replace(" ", "-")}`}
                      className="text-gray-400 hover:text-orange-500 transition-colors duration-300"
                    >
                      {item}
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </div>
        </motion.div>

      </footer>
      {createPortal(
        /* Stylish Vertical Sticky Social Sidebar */
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[2147483647] flex flex-col items-end">
          {/* Minimalist Mobile Toggle Handle */}
          <motion.button
            onClick={() => {
              if (isSocialVisible) {
                // If sidebar is open, hide it
                setIsSocialVisible(false);
                setIsToggleExpanded(false);
              } else {
                // If sidebar is closed, open it and show icon briefly
                setIsSocialVisible(true);
                setIsToggleExpanded(true);
              }
            }}
            initial={false}
            animate={{
              width: isToggleExpanded ? 24 : 8,
              height: isToggleExpanded ? 24 : 28,
              marginBottom: isToggleExpanded ? 4 : 0,
              backgroundColor: isToggleExpanded ? "rgb(17, 24, 39)" : "transparent",
              boxShadow: isToggleExpanded ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : "0 0 15px rgba(249, 115, 22, 0.7)",
            }}
            className={`lg:hidden flex items-center justify-center transition-all duration-300 border-l border-t border-b border-white/20 overflow-hidden ${isToggleExpanded
              ? "rounded-none"
              : "bg-gradient-to-b from-orange-400 via-red-600 to-orange-400 rounded-none"
              }`}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{
                rotate: isSocialVisible ? 0 : 0,
                scale: isToggleExpanded ? 1 : 0.7
              }}
            >
              <FaChevronDown
                size={isToggleExpanded ? 10 : 8}
                className="text-white"
                style={{ transform: "rotate(-90deg)" }}
              />
            </motion.div>
          </motion.button>

          <motion.div
            className="flex flex-col gap-0 items-end w-10 sm:w-11"
            animate={{ x: isSocialVisible ? 0 : "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {[
              { name: "Facebook", icon: FaFacebookF, color: "bg-[#1877F2]", href: "https://www.facebook.com/officialPathfinder/" },
              { name: "Youtube", icon: FaYoutube, color: "bg-[#FF0000]", href: "https://www.youtube.com/channel/UCfi5HAZ_rEcnVnXmrB2kcXg" },
              { name: "LinkedIn", icon: FaLinkedinIn, color: "bg-[#0A66C2]", href: "https://www.linkedin.com/company/pathfinder-institutes/" },
              { name: "Whatsapp", icon: FaWhatsapp, color: "bg-[#25D366]", href: "https://api.whatsapp.com/send/?phone=9147178886" },
              { name: "Instagram", icon: FaInstagram, color: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600", href: "https://www.instagram.com/pathfinderinstitutewb/" },
              { name: "X", icon: FaTwitter, color: "bg-black", href: "https://x.com/pathfinder_2016" }
            ].map((social) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center overflow-hidden h-10 sm:h-11 ${social.color} text-white rounded-none shadow-lg pointer-events-auto flex-shrink-0`}
                initial={{ width: "40px" }}
                whileHover={{ width: "170px" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <div className="flex-shrink-0 w-[40px] sm:w-[44px] flex items-center justify-center">
                  <social.icon className="text-lg sm:text-xl" />
                </div>
                <span className="whitespace-nowrap font-bold text-base sm:text-lg pr-4">
                  {social.name}
                </span>
              </motion.a>
            ))}
          </motion.div>
        </div>,
        document.body
      )}

      {createPortal(
        /* Unique Scroll to Top with Progress Ring */
        <div
          className={`fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-[2147483646] transition-all duration-500 transform ${showScrollTop ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
            }`}
        >
          <button
            onClick={scrollToTop}
            className="relative flex items-center justify-center group focus:outline-none"
            aria-label="Scroll to top"
          >
            {/* Circular Progress Ring */}
            <svg
              className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90"
              viewBox="0 0 64 64"
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className="text-white/10"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                stroke="url(#scrollGradientFooter)"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="175.9"
                style={{
                  strokeDashoffset: ringDashOffset,
                }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="scrollGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glassmorphic Center Button */}
            <div className="absolute inset-[4px] sm:inset-[6px] bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-white/50 flex items-center justify-center group-hover:bg-orange-600 group-hover:border-orange-600 transition-all duration-300">
              <motion.div
                animate={{
                  y: [0, -3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FaChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 group-hover:text-white transition-all duration-300" />
              </motion.div>
            </div>

            {/* Magnetic Outer Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-orange-500/0 group-hover:bg-orange-500/10 blur-xl transition-all duration-500 -z-10 scale-150"></div>
          </button>
        </div>,
        document.body
      )}

      {createPortal(
        /* Scroll Progress Indicator Bar at Bottom */
        <motion.div
          className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 z-[99999]"
          style={{
            scaleX: smoothProgress,
            originX: 0
          }}
        />,
        document.body
      )}
    </>
  );
};

export default Footer;
