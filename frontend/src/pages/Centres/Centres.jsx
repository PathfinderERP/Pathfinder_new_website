import { getImageUrl } from "../../utils/imageUtils";
import React, { useState, useEffect } from "react";
import CentreShowcase from "../../components/Centres/CentreShowcase";
import { motion, AnimatePresence } from "framer-motion";
import Slider from "react-slick";
import { ChevronUp, Play, X, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CentresPage = () => {
    const navigate = useNavigate();

    return (
        <div className="">
            {/* Hero Header for Centres Page - Premium Boxed Version */}
            <section className="max-w-7xl mx-auto px-4 mt-2 sm:mt-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 group"
                >
                    <img
                        src={getImageUrl("/images/centre/centre hero imge.webp")}
                        alt="Centres Hero"
                        className="w-full h-auto block"
                    />

                    {/* Text Overlay */}
                    <div className="absolute inset-0 flex flex-col items-end justify-center px-10 md:px-20 text-right pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="max-w-[55%] sm:max-w-md lg:max-w-xl mr-0 md:mr-0"
                        >
                            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.1] md:leading-tight">
                                <span className="text-white block">Pathfinder is</span>
                                <span className="text-white">Forever </span>
                                <span className="text-black">Growing!</span>
                            </h2>
                        </motion.div>
                    </div>

                    {/* Pagination Dots Decor */}
                    <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-white opacity-40"></div>
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                        <div className="w-2 h-2 rounded-full bg-white opacity-40"></div>
                    </div>
                </motion.div>
            </section>

            {/* Main Showcase Section */}
            <CentreShowcase />

            {/* Network Stats Section */}
            <section className="bg-slate-50 py-8 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="text-center p-8 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50"
                        >
                            <div className="text-4xl font-black text-slate-900 mb-2">42<span className="text-orange-500">+</span></div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Premium Centres</div>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="text-center p-8 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50"
                        >
                            <div className="text-4xl font-black text-slate-900 mb-2">05<span className="text-orange-500">+</span></div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Major States</div>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="text-center p-8 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50"
                        >
                            <div className="text-4xl font-black text-slate-900 mb-2">12k<span className="text-green-500">+</span></div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Students</div>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="text-center p-8 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50"
                        >
                            <div className="text-4xl font-black text-slate-900 mb-2">98<span className="text-amber-500">%</span></div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Success Rate</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="pt-8 pb-4 md:pb-16 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[50px] p-8 md:p-20 relative overflow-hidden group shadow-2xl shadow-orange-500/20">
                        {/* Decorative Patterns */}
                        <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-white/10 skew-x-[20deg] group-hover:bg-white/20 transition-all duration-700" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                                    Can't find a centre <br />
                                    nearby?
                                </h2>
                                <p className="text-xl text-white/90 font-bold max-w-xl">
                                    Our Online Live Classes bring the best of Pathfinder to wherever you are.
                                    Experience elite mentorship from the comfort of your home.
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/courses/all-india')}
                                className="px-12 py-6 bg-white text-orange-600 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-2xl shadow-orange-900/20 cursor-pointer"
                            >
                                Explore Online Programs
                            </motion.button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features and Success Stories Section */}
            <FeaturesAndStoriesSection />

            {/* Free Content Section */}
            <FreeContentSection />

            {/* Unique Scroll to Top logic removed as it's now handled by Footer */}
        </div>
    );
};

function FeaturesAndStoriesSection() {
    const features = [
        {
            title: "Strong Fundamentals",
            description: "Building rock-solid concepts in Science & Math for JEE/NEET success.",
            icon: "📐",
            gradient: "from-blue-500 to-cyan-400"
        },
        {
            title: "Expert Faculty",
            description: "Learn from India's top educators with a proven track record of producing rankers.",
            icon: "👨‍🏫",
            gradient: "from-purple-500 to-pink-500"
        },
        {
            title: "Competitive Edge",
            description: "Early exposure to Olympiad-level problems to stay ahead of the curve.",
            icon: "🚀",
            gradient: "from-orange-500 to-red-500"
        },
        {
            title: "Personalized Care",
            description: "Small batches with dedicated doubt-clearing and mentorship sessions.",
            icon: "❤️",
            gradient: "from-emerald-500 to-teal-500"
        }
    ];

    return (
        <section className="relative overflow-hidden w-full bg-white">
            {/* Orange Paper Background */}
            <div className="relative w-full">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/result/orange paper.webp"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 pt-12 md:pt-48 pb-52 md:pb-32">
                    {/* Decorative Elements for Design */}
                    <div className="absolute top-[10%] left-[-2%] w-24 h-24 bg-orange-400/10 rounded-full blur-2xl animate-pulse md:hidden" />
                    <div className="absolute top-[25%] right-[0%] w-32 h-32 bg-red-400/10 rounded-full blur-3xl md:hidden" />

                    {/* Features Section Header - In White Part */}
                    <div className="text-center max-w-3xl mx-auto mb-20 md:mb-16">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/5 rounded-full border border-slate-900/10 mb-6"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Why Pathfinder?</span>
                        </motion.div>

                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-14 md:mb-6 tracking-tight">
                            Why Choose <br className="md:hidden" /> <span className="text-slate-900 md:text-white md:drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">Pathfinder?</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-slate-800 md:text-black leading-relaxed font-bold opacity-90 max-w-2xl mx-auto">
                            We don't just teach; we transform potential into performance. Give your child the perfect launchpad for their academic journey.
                        </p>
                    </div>

                    {/* Features Grid - Pushed into Orange Part */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                        {/* Design accent for the grid area */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-px h-12 bg-white/20 md:hidden" />

                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/50"
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function FreeContentSection() {
    const navigate = useNavigate();
    const [activeVideo, setActiveVideo] = useState(null);

    const freeContents = [
        {
            id: "vid-1",
            youtubeId: "dl-QLpDplLE",
            title: "Topper's Talk: Strategic Preparation for JEE & NEET",
            description: "Learn high-scoring techniques, problem-solving methods, and time management directly from Pathfinder top rankers.",
            thumbnail: "https://img.youtube.com/vi/dl-QLpDplLE/hqdefault.jpg",
            published_date: "2025-11-10"
        },
        {
            id: "vid-2",
            youtubeId: "wGnX7j4EULA",
            title: "Success Blueprint: How to Master Concepts & Clear Backlogs",
            description: "Deep dive into chemical bonding, reaction mechanisms, and solving complex physics numericals with expert guidance.",
            thumbnail: "https://img.youtube.com/vi/wGnX7j4EULA/hqdefault.jpg",
            published_date: "2025-10-10"
        },
        {
            id: "vid-3",
            youtubeId: "KOFomNzzluc",
            title: "Newton's Laws of Motion & Mechanics Concept Clarity",
            description: "Master the foundations of mechanics with real-time conceptual examples and exam-tested shortcuts.",
            thumbnail: "https://img.youtube.com/vi/KOFomNzzluc/hqdefault.jpg",
            published_date: "2025-11-10"
        },
        {
            id: "vid-4",
            youtubeId: "Zd_H0PmG6fo",
            title: "Elite Math & Physics Shortcut Tricks for JEE 2026",
            description: "Save precious exam minutes and boost problem accuracy using elite elimination and shortcut methods.",
            thumbnail: "https://img.youtube.com/vi/Zd_H0PmG6fo/hqdefault.jpg",
            published_date: "2025-12-05"
        }
    ];

    const [freeSlidesToShow, setFreeSlidesToShow] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3);

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

    // Close video modal on Escape key
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
        autoplaySpeed: 3000,
        focusOnSelect: false,
        arrows: freeSlidesToShow > 1,
        centerPadding: "0px",
    };

    return (
        <section className="pt-0 pb-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-0 md:px-4">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Free <span className="text-orange-500">Content</span>
                    </h2>
                    <p className="text-xl text-slate-600 font-bold max-w-2xl mx-auto">
                        Experience our teaching quality firsthand with these exclusive sample lectures and study materials.
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
                                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <div className="w-16 h-16 bg-orange-600/90 text-white shadow-xl shadow-orange-600/40 rounded-full flex items-center justify-center border-2 border-white/80 group-hover:scale-110 transition-transform duration-300">
                                                <Play className="w-8 h-8 ml-1 fill-white text-white" />
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
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
                    <motion.button
                        onClick={() => navigate('/courses/all-india')}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full max-w-xl py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>View All Online Programs & Free Content</span>
                        <ArrowUpRight className="w-5 h-5" />
                    </motion.button>
                    <a
                        href="https://www.youtube.com/@PathfinderInstitute"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-black text-white font-bold text-sm uppercase tracking-wider rounded-xl border border-slate-700 shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <span>Watch on YouTube</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </a>
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
                        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
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
                                    className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/60 transition-colors cursor-pointer"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="relative aspect-video w-full bg-black">
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                                    title={activeVideo.title}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            <div className="p-5 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{activeVideo.description}</p>
                                <a
                                    href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orange-400 hover:text-orange-300 text-xs font-bold whitespace-nowrap flex items-center gap-1"
                                >
                                    Open in YouTube →
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

export default CentresPage;