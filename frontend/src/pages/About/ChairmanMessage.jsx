import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlayIcon } from '@heroicons/react/24/outline';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ChairmanMessage = () => {
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
            thumbnail: "/images/video-thumb-1.jpg",
            title: "Success Story 1",
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
            id: 2,
            thumbnail: "/images/video-thumb-2.jpg",
            title: "Success Story 2",
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
            id: 3,
            thumbnail: "/images/video-thumb-3.jpg",
            title: "Success Story 3",
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        }
    ];

    return (
        <div className="min-h-screen ">
            {/* Hero Section with CEO Image - Full Width */}
            <div className="w-full lg:mt-32">
                <div className="max-w-[1400px] mx-auto">
                    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src="/images/about/chairman sir.png"
                                alt="Chairman Debdutta Sreemany"
                                className="w-full h-full object-cover object-center"
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Message Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="space-y-8 text-slate-700 leading-relaxed text-lg text-justify">
                        <p>
                            Welcome to Pathfinder. Our journey began three decades ago with a simple mission: to bridge the gap between hard work and success. Today, we stand as a leader in the educational sector, having mentored thousands of students to achieve their dreams in national and regional competitive examinations.
                        </p>
                        <p>
                            I take great pride in our faculty—a group of dedicated professionals who are as passionate about your success as you are. Together, we have built an ecosystem of learning that is rigorous, supportive, and ultimately, rewarding.
                        </p>
                    </div>

                    {/* Quote Block */}
                    <div className="mt-16 bg-slate-50 rounded-[40px] p-12 relative overflow-hidden group border border-slate-100 shadow-sm">
                        <div className="absolute top-0 left-4 text-[12rem] text-slate-800/20 font-serif leading-none select-none group-hover:text-slate-400/30 transition-colors duration-500">
                            “
                        </div>
                        <p className="relative z-10 text-2xl md:text-3xl font-bold text-slate-800 text-center leading-relaxed italic px-12">
                            Excellence is not an act, but a habit. We strive to instill this habit in every student who walks through our doors.
                        </p>
                        <div className="absolute -bottom-12 right-4 text-[12rem] text-slate-800/20 font-serif leading-none select-none group-hover:text-slate-400/30 transition-colors duration-500 flex items-end">
                            ”
                        </div>
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
            title: "Pathfinder's 30-Year Legacy: A Message from the Chairman",
            description: "Mr. T.K. Banerjee shares the inspiring journey of Pathfinder and our commitment to excellence.",
            thumbnail: "https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg",
            published_date: "2025-11-10"
        },
        {
            title: "Navigating Success: Chairman's Guide for JEE/NEET Aspirants",
            description: "Essential advice for students on how to balance hard work with mental well-being.",
            thumbnail: "https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg",
            published_date: "2025-10-10"
        },
        {
            title: "The Future of Education: Our Vision for the Next Generation",
            description: "Hear about our innovative teaching methodologies and future-ready educational programs.",
            thumbnail: "https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg",
            published_date: "2025-11-10"
        },
        {
            title: "Celebrating Excellence: Chairman's Address to Toppers",
            description: "A heart-warming message to our achievers and a call to action for future leaders.",
            thumbnail: "https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg",
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

    const settings = {
        centerMode: freeSlidesToShow > 1,
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: freeSlidesToShow,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        focusOnSelect: true,
        arrows: freeSlidesToShow > 1,
        centerPadding: "0px",
    };

    return (
        <section className="pt-0 pb-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-0 md:px-4">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Chairman_  <span className="text-orange-500">Speaks</span>
                    </h2>
                    <p className="text-xl text-slate-600 font-bold max-w-2xl mx-auto">
                        Listen to our visionary Chairman, Mr. T.K. Banerjee, share his insights and guidance for the future of education.
                    </p>
                </div>

                <div className="relative px-0 md:px-12">
                    <Slider {...settings}>
                        {freeContents.map((content, idx) => (
                            <div key={idx} className="px-1 md:px-6 py-4">
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="bg-black rounded-3xl overflow-hidden h-full flex flex-col shadow-2xl border border-slate-800 group cursor-pointer transition-all duration-300"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={content.thumbnail}
                                            alt={content.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                        />
                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform duration-300">
                                                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 flex flex-col flex-grow">
                                        <div className="text-xs text-orange-400 mb-4 font-black uppercase tracking-widest">
                                            {new Date(content.published_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
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
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full max-w-4xl py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all duration-300"
                    >
                        View All
                    </motion.button>
                </div>
            </div>
        </section>
    );
}


export default ChairmanMessage;