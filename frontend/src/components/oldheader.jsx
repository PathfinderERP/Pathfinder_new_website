// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// const Header = () => {
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [activeSection, setActiveSection] = useState("hero");
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const tabs = [
//     { t: "Overview", href: "#hero" },
//     { t: "About Us", href: "#pillars" },
//     { t: "Courses", href: "#courses" },
//     { t: "Centers", href: "#centers" },
//     { t: "Student Corner", href: "#students" },
//     { t: "Franchisee", href: "#admissions" },
//     { t: "Blogs", href: "#blog" },
//     { t: "Community", href: "#community" },
//     { t: "Lumos", href: "#lumos" },
//     { t: "PathTex", href: "#pathtex" },
//   ];

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 20);

//       const sections = tabs.map((tab) => tab.href.substring(1));
//       const current = sections.find((section) => {
//         const element = document.getElementById(section);
//         if (element) {
//           const rect = element.getBoundingClientRect();
//           return rect.top <= 100 && rect.bottom >= 100;
//         }
//         return false;
//       });
//       if (current) setActiveSection(current);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <AnimatePresence>
//       <motion.header
//         initial={{ y: -80, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         exit={{ y: -80, opacity: 0 }}
//         transition={{ duration: 0.8, ease: "easeOut" }}
//         className={`sticky top-0 z-50 transition-all duration-500 ${
//           isScrolled
//             ? "bg-white/10 backdrop-blur-xl shadow-2xl border-b border-white/20 py-2"
//             : "bg-transparent backdrop-blur-md border-b border-transparent py-3 shadow-lg"
//         }`}
//       >
//         <div className="mx-auto max-w-8xl px-6 flex items-center justify-between">
//           {/* Logo animation */}
//           <motion.div
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.2, duration: 0.6 }}
//             className="flex items-center gap-3 group cursor-pointer"
//           >
//             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 text-white grid place-items-center font-bold shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
//               <span className="text-xl">PF</span>
//             </div>
//             <div className="flex flex-col">
//               <span className="font-bold text-xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-blue-600 transition-all duration-300">
//                 Pathfinder
//               </span>
//               <span className="text-xs text-slate-500 -mt-1 group-hover:text-emerald-600 transition-colors duration-300">
//                 Education
//               </span>
//             </div>
//           </motion.div>

//           {/* Desktop Navigation */}
//           <motion.nav
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4, duration: 0.5 }}
//             className="hidden lg:flex gap-1"
//           >
//             {tabs.map((x, index) => (
//               <motion.a
//                 key={x.t}
//                 href={x.href}
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
//                 className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 relative group ${
//                   activeSection === x.href.substring(1)
//                     ? "text-emerald-600 bg-emerald-50/80 shadow-md"
//                     : "text-slate-600 hover:text-emerald-600 hover:bg-slate-100/60"
//                 }`}
//               >
//                 {x.t}
//                 <span
//                   className={`absolute bottom-2 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 transform origin-left transition-transform duration-300 ${
//                     activeSection === x.href.substring(1)
//                       ? "scale-x-100"
//                       : "scale-x-0 group-hover:scale-x-100"
//                   }`}
//                 />
//               </motion.a>
//             ))}
//           </motion.nav>

//           {/* Mobile Menu Button */}
//           <motion.button
//             initial={{ opacity: 0, rotate: -10 }}
//             animate={{ opacity: 1, rotate: 0 }}
//             transition={{ delay: 0.6, duration: 0.4 }}
//             className="lg:hidden flex flex-col gap-1.5 w-6 h-6 relative"
//             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//           >
//             <span
//               className={`w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${
//                 isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
//               }`}
//             />
//             <span
//               className={`w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${
//                 isMobileMenuOpen ? "opacity-0" : "opacity-100"
//               }`}
//             />
//             <span
//               className={`w-full h-0.5 bg-slate-700 rounded-full transition-all duration-300 ${
//                 isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
//               }`}
//             />
//           </motion.button>

//           {/* CTA Button */}
//           <motion.div
//             initial={{ opacity: 0, x: 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.8, duration: 0.6 }}
//             className="hidden lg:flex items-center gap-1"
//           >
//             <a
//               href="#apply"
//               className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold hover:shadow-2xl hover:shadow-emerald-400/30 transition-all duration-500 hover:scale-105 active:scale-95 text-sm group overflow-hidden"
//             >
//               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
//               <span className="relative">Apply Now</span>
//               <div className="absolute inset-0 rounded-xl border-2 border-emerald-400/30 animate-pulse group-hover:animate-none" />
//             </a>
//           </motion.div>

//           {/* Mobile Menu */}
//           <AnimatePresence>
//             {isMobileMenuOpen && (
//               <motion.div
//                 initial={{ opacity: 0, y: -20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -20 }}
//                 transition={{ duration: 0.4 }}
//                 className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-2xl"
//               >
//                 <div className="p-6 space-y-4">
//                   {tabs.map((x, index) => (
//                     <a
//                       key={x.t}
//                       href={x.href}
//                       onClick={() => setIsMobileMenuOpen(false)}
//                       className={`block px-4 py-3 rounded-xl font-medium transition-all duration-300 border-l-4 ${
//                         activeSection === x.href.substring(1)
//                           ? "text-emerald-600 bg-emerald-50/80 border-emerald-500 shadow-sm"
//                           : "text-slate-600 hover:text-emerald-600 hover:bg-slate-100/60 border-transparent hover:border-emerald-300"
//                       }`}
//                       style={{ transitionDelay: `${index * 100}ms` }}
//                     >
//                       {x.t}
//                     </a>
//                   ))}
//                   <a
//                     href="#apply"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                     className="block px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-center hover:shadow-lg transition-all duration-300 mt-4"
//                   >
//                     Apply Now
//                   </a>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </motion.header>
//     </AnimatePresence>
//   );
// };

// export default Header;
