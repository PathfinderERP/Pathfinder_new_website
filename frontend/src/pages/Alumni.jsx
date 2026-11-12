import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
    AcademicCapIcon,
    TrophyIcon,
    UserGroupIcon,
    GlobeAltIcon,
    ChatBubbleBottomCenterTextIcon,
    LinkIcon,
    SparklesIcon,
    CheckBadgeIcon
} from "@heroicons/react/24/outline";
import AlumniCoursesSection from "../components/Alumni/AlumniCoursesSection";

import { Skeleton, FadeInImage } from "../components/common/OptimizedImage";
import { getImageUrl } from "../utils/imageUtils";
import { alumniAPI } from "../services/api";
import { useCachedData } from "../hooks/useCachedData";
import { useCallback } from "react";


const AlumniPage = () => {
    const constraintsRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const yRange = useTransform(scrollYProgress, [0, 1], [0, -100]);

    // Dynamic State


    // Fetch Initial Data (Years & Professions) - Caching Years
    const { data: years } = useCachedData("alumni_years", () => alumniAPI.getYears(), {
        onSuccess: (data) => (Array.isArray(data) ? data : []).sort((a, b) => b - a),
        initialData: []
    });

    // Caching Professions
    const { data: professions } = useCachedData("alumni_professions", () => alumniAPI.getProfessions(), {
        onSuccess: (data) => {
            let profs = Array.isArray(data) ? data : [];
            profs = Array.from(new Set(profs));
            const otherIndex = profs.findIndex(p => p.toLowerCase() === 'others');
            if (otherIndex > -1) {
                const otherLabel = profs[otherIndex];
                profs.splice(otherIndex, 1);
                profs.sort();
                profs.push(otherLabel);
            } else {
                profs.sort();
            }
            return profs;
        },
        initialData: []
    });

    const [selectedYear, setSelectedYear] = useState(null);
    const [activeProfession, setActiveProfession] = useState("");
    const [alumniImages, setAlumniImages] = useState([]);

    // Initialize defaults when data arrives
    useEffect(() => {
        if (years.length > 0 && selectedYear === null) {
            setSelectedYear(years[0]);
        }
    }, [years, selectedYear]);

    useEffect(() => {
        if (professions.length > 0 && activeProfession === "") {
            setActiveProfession(professions[0]);
        }
    }, [professions, activeProfession]);

    // Fetch Images - Caching per profession/year combination
    const { data: currentImages } = useCachedData(
        `alumni_images_${selectedYear}_${activeProfession}`,
        () => activeProfession ? alumniAPI.getByProfession(selectedYear) : Promise.resolve({ data: {} }),
        {
            onSuccess: (data) => {
                const results = (data && data.results) ? data.results : (data || {});
                const backendKey = Object.keys(results).find(
                    key => key.toLowerCase() === activeProfession.toLowerCase()
                );
                const professionRecords = results[backendKey] || results[activeProfession] || [];
                return professionRecords.flatMap(record => record.image_urls || []);
            },
            persistent: false // Don't persist all combinations to localStorage
        }
    );

    useEffect(() => {
        if (currentImages) {
            setAlumniImages(currentImages);
        }
    }, [currentImages]);

    const stats = [
        { label: "Successful Alumni", value: "25k+", icon: UserGroupIcon, color: "from-orange-500 to-red-500" },
        { label: "Elite Institutions", value: "5k+", icon: AcademicCapIcon, color: "from-blue-500 to-indigo-500" },
        { label: "Global Reach", value: "20+", icon: GlobeAltIcon, color: "from-green-500 to-teal-500" },
        { label: "Years of Legacy", value: "30+", icon: TrophyIcon, color: "from-yellow-500 to-orange-500" },
    ];

    const stories = [
        {
            name: "Rupayan Pal",
            achievement: "NEET Top Ranker | AIR 20",
            current: "MBBS Scholar, Premier Medical College",
            year: "Pathfinder Medical Batch",
            image: getImageUrl("/images/homepagecarousal_images/rupayan pal.webp"),
            quote: "Pathfinder was more than just a coaching center; it was a launchpad for my medical career. The rigorous testing and mentoring built my confidence to secure AIR 20 in NEET.",
        },
        {
            name: "Pranami Halder",
            achievement: "CBSE & Medical Ranker | 99.2%",
            current: "Medical Scholar & Academic Star",
            year: "Pathfinder Integrated Batch",
            image: getImageUrl("/images/homepagecarousal_images/Pranami halder.webp"),
            quote: "The personalized attention and conceptual clarity instilled by Pathfinder faculty were crucial during my preparation. Proud to be part of the Pathfinder legacy.",
        },
        {
            name: "Devdutta Majhi",
            achievement: "JEE Advanced Top Ranker | IITian",
            current: "Engineering Scholar, Premier IIT",
            year: "Pathfinder Engineering Batch",
            image: getImageUrl("/images/homepagecarousal_images/devdutta majhi.webp"),
            quote: "Success in competitive exams requires precision and strong fundamentals—both of which were forged during my JEE preparation at Pathfinder.",
        },
        {
            name: "Chandrachur Sen",
            achievement: "Madhyamik State Rank 1",
            current: "Senior Secondary Scholar",
            year: "Pathfinder Foundation Batch",
            image: getImageUrl("/images/homepagecarousal_images/Chandrachur Sen.webp"),
            quote: "Pathfinder's structured curriculum and continuous mock evaluations helped me achieve State Rank 1. The teachers are always there to guide you.",
        },
    ];

    return (
        <div className="bg-[#fdfcfb] min-h-screen overflow-hidden 2xl:max-w-7xl 2xl:mx-auto shadow-2xl">

            {/* Exactly Seamless Hero Section - Dynamically Generated Years Ticker */}
            <section className="relative w-full leading-[0] font-[0]">
                {/* Main Alumni Banner */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col "
                >
                    <FadeInImage
                        src={getImageUrl("/images/alumni/ALU.webp")}
                        alt="Our Alumni"
                        className="w-full h-auto block m-0 p-0 align-bottom"
                    />

                    {/* Interactive Years Strip - Matching YR.png Visuals */}
                    <div
                        ref={constraintsRef}
                        className="bg-black pt-4 pb-1 overflow-hidden relative flex items-center select-none -mt-[4px]"
                    >
                        {/* Edge Vignette Effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black via-black/60 to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black via-black/60 to-transparent z-10 pointer-events-none" />

                        <motion.div
                            drag="x"
                            dragConstraints={constraintsRef}
                            className="flex items-center cursor-grab active:cursor-grabbing px-10"
                        >
                            {/* Render Dynamic Years or Static Fallback if empty */}
                            {(years).map((year) => (
                                <motion.button
                                    key={year}
                                    initial={{ scaleY: 1.3, scaleX: 0.9 }}
                                    whileHover={{
                                        scaleY: 1.43, // 1.3 * 1.1
                                        scaleX: 0.99, // 0.9 * 1.1
                                        color: "#FF6B1A"
                                    }}
                                    animate={{
                                        color: selectedYear === year ? "#FF6B1A" : "#D35400",
                                        scaleY: selectedYear === year ? 1.43 : 1.3,
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedYear(year)}
                                    className="text-3xl font-black px-3 tracking-tighter transition-colors duration-200 outline-none flex-shrink-0"
                                    style={{
                                        fontFamily: "'Bebas Neue', sans-serif",
                                        display: 'block',
                                        transformOrigin: 'center'
                                    }}
                                >
                                    {year}
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Profession Showcase Section */}
            <section className="w-full bg-white py-12 md:py-20 px-4 md:px-10 lg:px-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-0 items-stretch">

                    {/* Mobile Only: Horizontal Categories - Dynamic & Responsive */}
                    <div className="md:hidden w-full mb-8 relative z-50">
                        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar px-10 select-none">
                            {professions.map((prof) => (
                                <button
                                    key={prof}
                                    onPointerDown={(e) => {
                                        // Prevents double-triggering with click but ensures fast response
                                        
                                        setActiveProfession(prof);
                                    }}
                                    className={`flex-shrink-0 px-8 py-4 rounded-full text-xl font-bold transition-all duration-200 relative z-[60] cursor-pointer touch-manipulation ${activeProfession === prof
                                        ? "bg-black text-[#FF6B1A] shadow-xl scale-105"
                                        : "bg-gray-100 text-gray-500 shadow-sm"
                                        }`}
                                    style={{
                                        fontFamily: "'Bebas Neue', sans-serif",
                                        letterSpacing: '0.05em'
                                    }}
                                >
                                    {prof.toUpperCase()}
                                </button>
                            ))}
                            {/* Larger Spacer for better reachability of last item */}
                            <div className="flex-shrink-0 w-32 h-1" />
                        </div>
                        <div className="h-[1px] w-full bg-gray-100 mt-2" />
                    </div>

                    {/* Desktop Only: Left Navigation */}
                    <div className="hidden md:flex w-[35%] justify-end pr-10 pt-8">
                        <div className="relative">
                            <div className="flex flex-col items-end space-y-1 relative">
                                {professions.map((prof) => (
                                    <button
                                        key={prof}
                                        onClick={() => setActiveProfession(prof)}
                                        className={`text-4xl md:text-5xl transition-all duration-300 relative pr-6 ${activeProfession === prof
                                            ? "text-[#1a1a1a] font-bold"
                                            : "text-[#cbd5e1] font-normal"
                                            }`}
                                        style={{
                                            fontFamily: "'Bebas Neue', sans-serif",
                                            letterSpacing: '0.05em'
                                        }}
                                    >
                                        {prof}
                                        {activeProfession === prof && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute -right-[27px] top-1/3 -translate-y-1/2 w-4 h-4 bg-[#FF6B1A] rounded-full shadow-md z-[100]"
                                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                ))}
                                {professions.length === 0 && (
                                    <div className="text-gray-400 text-lg">Loading professions...</div>
                                )}
                            </div>
                            <div className="absolute -right-5 -top-8 bottom-1 w-[1.5px] bg-[#94a3b8]" />
                        </div>
                    </div>

                    {/* Right: Alumni Grid */}
                    <div className="w-full md:w-[65%] px-4 md:pl-12 min-h-[300px] md:min-h-[400px]">
                        <motion.div
                            key={`${activeProfession}-${selectedYear}`}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 md:gap-y-12 md:gap-x-8"
                        >
                            {alumniImages.length > 0 ? (
                                alumniImages.map((imgUrl, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div className="relative w-full aspect-[3/4] md:aspect-auto overflow-hidden rounded-xl bg-white shadow-sm">
                                            <img
                                                src={getImageUrl(imgUrl)}
                                                alt={`Alumni ${index + 1}`}
                                                className="w-full h-full object-contain md:max-w-[180px]"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center text-gray-400 py-10">
                                    <UserGroupIcon className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="text-xl font-medium opacity-60">
                                        No alumni images found for {activeProfession} in {selectedYear}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>


            {/* Legend Banner Section - Once a Student, Now a Legend */}
            <section className="w-full -mt-16 md:-mt-5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="w-full relative"
                >
                    <FadeInImage
                        src={getImageUrl("/images/alumni/dev x rup in alumni.webp")}
                        alt="Once a Student, Now a Legend"
                        className="w-full h-auto block"
                    />
                </motion.div>
            </section>

            {/* Courses That Made them Legends Section */}
            <AlumniCoursesSection />

            {/* Know Your Alumni Showcase Section */}
            <section
                className="w-screen relative left-1/2 -translate-x-1/2 py-0 -mt-1"
                style={{
                    background: 'linear-gradient(to bottom, #000000 35%, #ffffff 35%)'
                }}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="w-full overflow-hidden"
                >
                    <FadeInImage
                        src={getImageUrl("/images/alumni/know your alumni.webp")}
                        alt="Know Your Alumni"
                        className="w-full h-auto block"
                    />
                </motion.div>
            </section>
        </div>
    );
};

export default AlumniPage;