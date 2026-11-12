import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlayIcon } from '@heroicons/react/24/outline';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getImageUrl } from '../../utils/imageUtils';

const CEOMessage = () => {
    const [selectedVideo, setSelectedVideo] = useState(null);

    const tips = [
        {
            number: "01",
            title: "Take Breaks",
            description: "Regular breaks improve focus and retention. Step away from your desk every hour."
        },
        {
            number: "02",
            title: "Stay Active",
            description: "Physical activity boosts brain function. Exercise regularly to enhance your learning capacity."
        },
        {
            number: "03",
            title: "Talk It Out",
            description: "Discuss concepts with peers or mentors. Teaching others reinforces your own understanding."
        },
        {
            number: "04",
            title: "Sleep Well",
            description: "Quality sleep consolidates memory. Aim for 7-8 hours of restful sleep each night."
        },
        {
            number: "05",
            title: "Celebrate Small Wins",
            description: "Acknowledge your progress, no matter how small. Positive reinforcement builds momentum."
        }
    ];

    const videos = [
        {
            id: 1,
            thumbnail: getImageUrl("/images/video-thumb-1.webp"),
            title: "Success Story 1",
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
            id: 2,
            thumbnail: getImageUrl("/images/video-thumb-2.webp"),
            title: "Success Story 2",
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
            id: 3,
            thumbnail: getImageUrl("/images/video-thumb-3.webp"),
            title: "Success Story 3",
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        }
    ];

    return (
        <div className="min-h-screen ">
            {/* Hero Section with CEO Image - Full Width */}
            <div className="w-full">
                <div className="max-w-[1400px] mx-auto">
                    <div className="relative w-full h-[220px] sm:h-[450px] md:h-[620px] lg:h-[820px] overflow-hidden">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src={getImageUrl("images/about/ceo image.webp")}
                                alt="CEO Madhuparna Sreemany"
                                className="w-full h-full object-cover object-top"
                            />
                            {/* Dark Gradient Overlay */}
                            {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900"></div> */}
                        </div>

                    </div>
                </div>
            </div>

            {/* Dear Students Message Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 md:p-12"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        Dear Students,
                    </h2>

                    <div className="space-y-6 text-slate-700 leading-relaxed">
                        <p className="text-base md:text-lg">
                            As the <span className="font-bold text-slate-900">CEO of PATHFINDER EDUCATIONAL CENTRE</span>, I want to take a moment to personally extend my warmest greetings to each and every one of you. It is an honor to lead this institution where the JEE and NEET is no small feat—it requires discipline, focus, and an unwavering determination to achieve your dreams. But today, I want to talk about something just as important as your studies: Your Mental Health.
                        </p>

                        <p className="text-base md:text-lg">
                            The pressure to perform can sometimes feel overwhelming, and it's natural to face moments of stress, anxiety, or self-doubt. Let me tell you something important: You are not alone in this journey. What's not okay is ignoring these feelings or pushing yourself to a breaking point.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Tips Section with Intro */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    {/* Intro Text */}
                    <p className="text-slate-700 text-base md:text-lg leading-relaxed mb-8 md:mb-12">
                        Your <span className="font-bold text-slate-900">mind is your most powerful tool</span>, and just like a machine, it needs care and maintenance to function at its best. Here are some things I encourage you to remember:
                    </p>

                    {/* Tips List */}
                    <div className="space-y-8 md:space-y-10">
                        {tips.map((tip, index) => (
                            <motion.div
                                key={tip.number}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                                className="flex gap-4 md:gap-6 items-start"
                            >
                                {/* Number Badge */}
                                <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                                    <span className="text-white font-black text-xl md:text-2xl">
                                        {tip.number}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-1">
                                    <h3 className="text-slate-900 font-bold text-lg md:text-xl mb-2">
                                        {tip.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                                        {tip.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
            <FreeContentSection />
        </div>
    );
};
function FreeContentSection() {
    const freeContents = [
        {
            id: "ceo-vid-1",
            title: "Empowering Minds: A Vision for Educational Excellence",
            description: "Ms. Madhuparna Sreemany discusses the future of competitive exam preparation and student empowerment.",
            thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop",
            youtubeId: "aqz-KE-bpKQ",
            published_date: "2025-11-10"
        },
        {
            id: "ceo-vid-2",
            title: "Mental Well-being: The Key to Sustaining Peak Performance",
            description: "Our CEO shares essential strategies for students to manage stress and prioritize mental health.",
            thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop",
            youtubeId: "aqz-KE-bpKQ",
            published_date: "2025-10-10"
        },
        {
            id: "ceo-vid-3",
            title: "The Pathfinder Difference: Innovative Learning for Tomorrow",
            description: "Discover how we are integrating technology and personalized mentorship to transform education.",
            thumbnail: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop",
            youtubeId: "aqz-KE-bpKQ",
            published_date: "2025-11-10"
        },
        {
            id: "ceo-vid-4",
            title: "Message to 2026 Batch: Turning Challenges into Opportunities",
            description: "An encouraging address from the CEO to the next generation of JEE and NEET aspirants.",
            thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop",
            youtubeId: "aqz-KE-bpKQ",
            published_date: "2025-12-05"
        }
    ];

    const [freeSlidesToShow, setFreeSlidesToShow] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3);
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setFreeSlidesToShow(1);
            } else {
                setFreeSlidesToShow(3);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setActiveVideo(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const settings = {
        centerMode: freeSlidesToShow > 1,
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: freeSlidesToShow,
        slidesToScroll: 1,
        autoplay: !activeVideo,
        autoplaySpeed: 3500,
        arrows: freeSlidesToShow > 1,
        centerPadding: "0px",
    };

    return (
        <section className="pt-0 pb-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-0 md:px-4">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        CEO <span className="text-orange-500">Speaks</span>
                    </h2>
                    <p className="text-xl text-slate-600 font-bold max-w-2xl mx-auto">
                        Hear from our CEO, Ms. Madhuparna Sreemany, as she shares her vision and commitment to student success.
                    </p>
                </div>

                <div className="relative px-0 md:px-12">
                    <Slider {...settings}>
                        {freeContents.map((content, idx) => (
                            <div key={idx} className="px-1 md:px-6 py-4">
                                <motion.div
                                    whileHover={{ y: -8 }}
                                    onClick={() => setActiveVideo(content)}
                                    className="bg-black rounded-3xl overflow-hidden h-full flex flex-col shadow-2xl border border-slate-800 group cursor-pointer transition-all duration-300 relative"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={content.thumbnail}
                                            alt={content.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                        />
                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <div className="w-16 h-16 bg-orange-600/90 text-white shadow-lg shadow-orange-600/30 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/60 group-hover:scale-115 transition-transform duration-300">
                                                <PlayIcon className="w-8 h-8 ml-0.5 fill-current" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 flex flex-col flex-grow">
                                        <div className="text-xs text-orange-400 mb-4 font-black uppercase tracking-widest flex items-center gap-2">
                                            <span>{new Date(content.published_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            <span>•</span>
                                            <span className="text-emerald-400 font-bold">Watch Video</span>
                                        </div>
                                        <h3 className="text-white font-black text-xl leading-tight mb-4 group-hover:text-orange-500 transition-colors line-clamp-2">
                                            {content.title}
                                        </h3>
                                        <p className="text-slate-400 text-sm font-medium line-clamp-2">
                                            {content.description}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </Slider>
                </div>

                {/* View All Button */}
                <div className="mt-12 flex justify-center w-full px-4">
                    <motion.a
                        href="https://www.youtube.com/@PathfinderInstitute"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full max-w-4xl py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all duration-300 text-center block"
                    >
                        View All Videos On YouTube
                    </motion.a>
                </div>
            </div>

            {/* Video Modal Player */}
            <AnimatePresence>
                {activeVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveVideo(null)}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.92, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.92, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl relative"
                        >
                            <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-800/90 border-b border-slate-700">
                                <h3 className="text-white font-black text-sm sm:text-base line-clamp-1">{activeVideo.title}</h3>
                                <button
                                    onClick={() => setActiveVideo(null)}
                                    className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/60 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="relative aspect-video w-full bg-black">
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId || 'aqz-KE-bpKQ'}?autoplay=1&rel=0`}
                                    title={activeVideo.title}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            <div className="p-5 bg-slate-900">
                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{activeVideo.description}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
export default CEOMessage;
