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
import { useAuth } from "../../../contexts/AuthContext";

const WatermarkLetter = ({ char, progress, index }) => {
    // Each letter reveals at a slightly different scroll point
    const start = 0.05 + (index * 0.03);
    const end = start + 0.1;

    const opacity = useTransform(progress, [start, end], [0, 1]);
    const y = useTransform(progress, [start, end], [50, 0]);
    const x = useTransform(progress, [0, 1], ["2%", "-2%"]); // Subtle parallax

    return (
        <motion.span
            style={{ opacity, y, x, fontFamily: "'Nunito Sans', sans-serif", fontWeight: 850 }}
            className="text-[90px] sm:text-[182px] text-[#292929] tracking-tighter leading-none whitespace-nowrap inline-block"
        >
            {char}
        </motion.span>
    );
};

const Footer = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const footerRef = useRef(null);
    const endSectionRef = useRef(null);
    const isInView = useInView(footerRef, { once: true, margin: "-100px" });
    const isEndInView = useInView(endSectionRef, { once: true, margin: "-50px" });

    const [showScrollTop, setShowScrollTop] = useState(false);
    // Global scroll for top ring/button
    const { scrollYProgress: windowScrollProgress } = useScroll();
    const smoothProgress = useSpring(windowScrollProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Targeted scroll for footer watermark parallax
    const { scrollYProgress: footerScrollProgress } = useScroll({
        target: footerRef,
        offset: ["start end", "end start"]
    });

    const watermarkX = useTransform(footerScrollProgress, [0, 1], ["5%", "-5%"]);
    const watermarkOpacity = useTransform(footerScrollProgress, [0, 0.5, 1], [0, 1, 0]);
    const watermarkScale = useTransform(footerScrollProgress, [0, 0.5, 1], [0.8, 1.2, 0.8]);

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
            color: "hover:bg-[#1877F2]",
        },
        {
            name: "YouTube",
            icon: FaYoutube,
            href: "https://www.youtube.com/channel/UCfi5HAZ_rEcnVnXmrB2kcXg",
            color: "hover:bg-[#FF0000]",
        },
        {
            name: "LinkedIn",
            icon: FaLinkedinIn,
            href: "https://www.linkedin.com/company/pathfinder-institutes/",
            color: "hover:bg-[#0A66C2]",
        },
        {
            name: "WhatsApp",
            icon: FaWhatsapp,
            href: "https://api.whatsapp.com/send/?phone=9147178886",
            color: "hover:bg-[#25D366]",
        },
        {
            name: "Instagram",
            icon: FaInstagram,
            href: "https://www.instagram.com/pathfinderinstitutewb/",
            color: "hover:bg-[#E4405F]",
        },
        {
            name: "Twitter",
            icon: FaTwitter,
            href: "https://x.com/pathfinder_2016",
            color: "hover:bg-[#000000]"
        },
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
                className="relative bg-[#161616] text-gray-300 overflow-hidden z-10 w-full"
                ref={footerRef}
            >
                {/* Scroll-Animated Watermark Text (Typing Reveal) */}
                <div className="absolute top-[76%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-[180px] overflow-hidden select-none pointer-events-none flex justify-center items-center z-0">
                    <div className="flex whitespace-nowrap">
                        {"PATHFINDER".split("").map((char, index) => (
                            <WatermarkLetter
                                key={index}
                                char={char}
                                index={index}
                                progress={footerScrollProgress}
                            />
                        ))}
                    </div>
                </div>

                {/* Top Footer Content */}
                <motion.div
                    className="relative z-10 pt-20 pb-48 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
                    style={{ opacity, scale }}
                >
                    {/* Horizontal Contact Info Bar */}
                    <div className="border border-[#FFE5B4]/20 rounded-2xl bg-[#161616] overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#FFE5B4]/20 relative z-20">

                        {/* Location Section */}
                        <div className="p-8 group transition-colors hover:bg-white/5">
                            <h3 className="text-xl font-bold text-[#FFE5B4] mb-4">Location</h3>
                            <p className="text-gray-400 text-base leading-relaxed max-w-xs">
                                47, Kalidas Patitundi Lane, Kolkata, West Bengal - 700026
                            </p>
                        </div>

                        {/* Contact Section */}
                        <div className="p-8 group transition-colors hover:bg-white/5">
                            <h3 className="text-xl font-bold text-[#FFE5B4] mb-4">Contact</h3>
                            <div className="text-base text-gray-400 flex flex-wrap items-center gap-2">
                                <a href="tel:+919147178886" className="hover:text-[#EE4600] transition-colors">+91 9147178886</a>
                                <span className="text-gray-600 hidden sm:inline">|</span>
                                <a href="mailto:info@pathfinder.edu.in" className="hover:text-[#EE4600] transition-colors">info@pathfinder.edu.in</a>
                            </div>
                        </div>

                        {/* Social Section */}
                        {/* <div className="p-8 group transition-colors hover:bg-white/5">
                            <h3 className="text-xl font-bold text-[#FFE5B4] mb-4">Follow us on</h3>
                            <div className="flex gap-2.5">
                                {socialMedia.slice(0, 6).map((social, idx) => (
                                    <a
                                        key={idx}
                                        href={social.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white ${social.color} transition-all`}
                                        aria-label={social.name}
                                    >
                                        <social.icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div> */}
                    </div>
                </motion.div>

                {/* Bottom Footer */}
                <motion.div
                    className="relative z-10 py-5 px-4 sm:px-6 lg:px-8 bg-[#292929]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm">
                            <motion.p className="text-gray-500 text-center md:text-left font-medium">
                                2026 © All rights reserved by Pathfinder. Developed by{" "}
                                <a
                                    href=""
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#FFE5B4] font-bold hover:text-white transition-colors"
                                >
                                    PATHFINDER.
                                </a>
                            </motion.p>

                            <motion.div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4 text-gray-500 font-medium">
                                {["Privacy Policy", "Cookie Policy", "Disclaimer"].map((item, idx, arr) => (
                                    <React.Fragment key={item}>
                                        <a
                                            href={`/${item.toLowerCase().replace(" ", "-")}`}
                                            className="hover:text-white transition-colors"
                                        >
                                            {item}
                                        </a>
                                        {idx < arr.length - 1 && <span className="text-gray-700">|</span>}
                                    </React.Fragment>
                                ))}
                            </motion.div>
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


        </>
    );
};

export default Footer;
