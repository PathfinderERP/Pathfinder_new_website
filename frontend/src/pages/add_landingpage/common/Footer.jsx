import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
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
                                <a href="mailto:support@pathfinder.edu.in" className="hover:text-[#EE4600] transition-colors">support@pathfinder.edu.in</a>
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

        </>
    );
};

export default Footer;
