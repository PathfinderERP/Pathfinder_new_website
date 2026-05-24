import React, { useState, useEffect, useCallback } from "react";
import { announcementsAPI } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
    XMarkIcon, 
    MegaphoneIcon, 
    StarIcon, 
    FireIcon, 
    GiftIcon, 
    BellIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";

const IconMap = {
    megaphone: MegaphoneIcon,
    star: StarIcon,
    fire: FireIcon,
    gift: GiftIcon,
    bell: BellIcon
};

const AnnouncementBar = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnnouncements = useCallback(async () => {
        try {
            const response = await announcementsAPI.getActive();
            const data = response.data;
            const activeList = Array.isArray(data) ? data : (data.results || []);
            setAnnouncements(activeList);
        } catch (error) {
            console.error("Error fetching announcements:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    useEffect(() => {
        const hasContent = !isLoading && announcements.length > 0;
        const height = (isVisible && hasContent) ? (window.innerWidth < 640 ? "40px" : "48px") : "0px";
        document.documentElement.style.setProperty('--announcement-height', height);
        
        // Also handle window resize for height accuracy
        const handleResize = () => {
            const newHeight = (isVisible && hasContent) ? (window.innerWidth < 640 ? "40px" : "48px") : "0px";
            document.documentElement.style.setProperty('--announcement-height', newHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isVisible, isLoading, announcements]);

    useEffect(() => {
        if (announcements.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % announcements.length);
        }, 8000);

        return () => clearInterval(timer);
    }, [announcements]);

    if (!isVisible || isLoading || announcements.length === 0) return null;

    const current = announcements[currentIndex];
    const Icon = IconMap[current?.icon_type] || MegaphoneIcon;

    return (
        <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-gradient-to-r from-[#FF823E] via-[#FF6B44] to-[#F14641] text-white relative z-[1001] shadow-lg border-b border-white/10"
        >
            {/* Animated Shine Effect */}
            {current?.show_shine !== false && (
                <motion.div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                        width: '50%',
                        skewX: '-20deg'
                    }}
                    animate={{
                        left: ['-50%', '150%']
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 2
                    }}
                />
            )}

            <div className="max-w-[1920px] mx-auto px-2 sm:px-4 h-10 sm:h-12 flex items-center justify-between gap-2 sm:gap-4">
                {/* Left Side: Icon */}
                <div className="flex-shrink-0 p-1.5 bg-white/20 rounded-lg backdrop-blur-sm shadow-sm z-20">
                    <Icon className="w-4 h-4 sm:w-5 h-5 text-white" />
                </div>

                {/* Center: Marquee/Static Text */}
                <div className="flex-1 overflow-hidden relative h-6 sm:h-7 flex items-center">
                    <AnimatePresence mode="wait">
                        {current?.is_marquee ? (
                            <motion.div 
                                key={`marquee-${current.id}`}
                                className="flex whitespace-nowrap absolute items-center gap-12 sm:gap-24"
                                initial={{ x: 0 }}
                                animate={{ x: "-50%" }}
                                transition={{ 
                                    duration: 60, 
                                    repeat: Infinity, 
                                    ease: "linear" 
                                }}
                            >
                                {/* Multiply the text to ensure it covers the entire width without gaps */}
                                {[...Array(10)].map((_, i) => (
                                    <p 
                                        key={i}
                                        className={`text-[10px] sm:text-xs font-black tracking-wide flex-shrink-0 ${current?.is_blinking ? 'animate-pulse' : ''}`}
                                    >
                                        {current.text}
                                    </p>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key={`static-${current.id}`}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="w-full flex justify-center items-center"
                            >
                                <p className={`text-[10px] sm:text-xs font-black tracking-wide ${current?.is_blinking ? 'animate-pulse' : ''}`}>
                                    {current.text}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Side: Action Button & Close */}
                <div className="flex items-center gap-3 sm:gap-4 z-20 flex-shrink-0">
                    {current.button_text && (
                        <motion.a
                            href={current.link || '#'}
                            className="flex-shrink-0 flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1 sm:py-1.5 bg-white/10 backdrop-blur-sm rounded-full shadow-[0_0_15px_rgba(255,255,255,0.15)] group hover:shadow-xl transition-all border sm:border-2 border-white relative overflow-hidden"
                            initial={{ scale: 1 }}
                            animate={{ 
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                    "0 0 10px rgba(255,255,255,0.2)",
                                    "0 0 25px rgba(255,255,255,0.4)",
                                    "0 0 10px rgba(255,255,255,0.2)"
                                ]
                            }}
                            transition={{ 
                                duration: 2, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-tight">
                                {current.button_text}
                            </span>
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center text-[#F14641] shadow-lg group-hover:scale-110 transition-transform">
                                <ChevronRightIcon className="w-3 h-3 sm:w-4 h-4 stroke-[3]" />
                            </div>
                        </motion.a>
                    )}

                    <button 
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-black/10 rounded-full transition-colors opacity-60 hover:opacity-100"
                        title="Dismiss"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            {announcements.length > 1 && !current?.is_marquee && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black/10">
                    <motion.div 
                        key={currentIndex}
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 8, ease: "linear" }}
                        className="h-full bg-white/40"
                    />
                </div>
            )}
        </motion.div>
    );
};

export default AnnouncementBar;
