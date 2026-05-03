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
        if (announcements.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % announcements.length);
        }, 8000);

        return () => clearInterval(timer);
    }, [announcements]);

    if (!isVisible || isLoading || announcements.length === 0) return null;

    const current = announcements[currentIndex];
    const Icon = IconMap[current?.icon_type] || MegaphoneIcon;

    const containerStyle = {
        background: current?.bg_color_2 
            ? `linear-gradient(90deg, ${current.bg_color}, ${current.bg_color_2})`
            : current?.bg_color || '#66090D',
        color: current?.text_color || '#FFFFFF'
    };

    return (
        <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`relative overflow-hidden z-[100] border-b border-white/10`}
            style={containerStyle}
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

            <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center gap-4">
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
                                        className={`text-xs sm:text-sm font-black tracking-wide flex-shrink-0 ${current?.is_blinking ? 'animate-pulse' : ''}`}
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
                                <p className={`text-xs sm:text-sm font-black tracking-wide ${current?.is_blinking ? 'animate-pulse' : ''}`}>
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
                            animate={{ 
                                scale: [1, 1.08, 1],
                                opacity: [1, 0.7, 1]
                            }}
                            transition={{ 
                                duration: 1.5, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                            }}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                backgroundColor: current.button_bg_color || '#FFFFFF',
                                color: current.button_text_color || '#66090D'
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase shadow-lg shadow-black/20 transition-all group whitespace-nowrap"
                        >
                            {current.button_text}
                            <ChevronRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
