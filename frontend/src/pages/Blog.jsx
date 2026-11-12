import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from "react-slick";
import {
    MagnifyingGlassIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    ArrowsUpDownIcon,
    ArrowUpRightIcon,
    PlusIcon,
    MinusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import { blogAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useCachedData } from '../hooks/useCachedData';

const Blog = () => {
    const { data: posts, loading: postsLoading } = useCachedData("blog_posts", () => blogAPI.getAll(), {
        onSuccess: (data) => {
            const raw = data?.results || data || [];
            return Array.isArray(raw) ? raw : [];
        }
    });

    const { data: categories } = useCachedData("blog_categories", () => blogAPI.getCategories(), {
        onSuccess: (data) => {
            if (Array.isArray(data)) {
                return ["All", ...data];
            }
            return ["All"];
        },
        initialData: ["All"]
    });

    const loading = postsLoading;

    const [searchQuery, setSearchQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const carouselRef = useRef(null);

    useEffect(() => {
        document.title = "Blog | Pathfinder Institute Articles & Success Stories";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', "Read the latest preparation tips, topper interviews, and academic strategies from Pathfinder Institute's expert faculty and successful students.");
        }
        return () => {
            document.title = "Pathfinder Institute";
        };
    }, []);

    const featuredPosts = useMemo(() => posts.filter(post => post.is_featured).slice(0, 5), [posts]);

    const latestPosts = useMemo(() => {
        let filtered = [...posts];

        if (selectedCategory !== "All") {
            filtered = filtered.filter(post => post.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(post => {
                const title = (post.title || "").toLowerCase();
                const summary = (post.summary || post.excerpt || "").toLowerCase();
                const content = (post.content || "").toLowerCase();
                const category = (post.category || "").toLowerCase();
                const author = (post.author || "").toLowerCase();
                const tags = Array.isArray(post.tags) ? post.tags.map(t => String(t).toLowerCase()) : [];
                return title.includes(query) ||
                    summary.includes(query) ||
                    content.includes(query) ||
                    category.includes(query) ||
                    author.includes(query) ||
                    tags.some(t => t.includes(query));
            });
        }

        return filtered.slice(0, 30);
    }, [posts, selectedCategory, searchQuery]);

    // Auto-playing Carousel Logic
    useEffect(() => {
        let interval;
        if (isAutoPlaying && featuredPosts.length > 0) {
            interval = setInterval(() => {
                setActiveIndex((prev) => (prev + 1) % featuredPosts.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, featuredPosts.length]);

    const handlePrev = useCallback((e) => {
        e.stopPropagation();
        setActiveIndex((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
        setIsAutoPlaying(false);
    }, [featuredPosts.length]);

    const handleNext = useCallback((e) => {
        e.stopPropagation();
        setActiveIndex((prev) => (prev + 1) % featuredPosts.length);
        setIsAutoPlaying(false);
    }, [featuredPosts.length]);

    if (loading) return <div className="pt-32"><LoadingSpinner /></div>;

    return (
        <div className="min-h-screen bg-white">
            {/* Top Brand Banner */}
            <div className="h-16 md:h-32 w-full bg-gradient-to-r from-[#FF823E] via-[#FF6B44] to-[#F14641]" />
            <div className="h-6 md:h-10 w-full bg-black" />

            {/* Hero Section */}
            <section className="bg-[#F9F9F9] pt-10 pb-4 md:pt-20 md:pb-12 text-center border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl md:text-8xl font-black text-black mb-2 md:mb-4 tracking-[-0.04em] leading-tight"
                    >
                        Read. Learn .Grow
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-4xl text-black font-normal mb-6 md:mb-10 tracking-tight"
                    >
                        Discover our latest news
                    </motion.p>
                    <div className="w-full relative">
                        {categories.length > 0 && (
                            <div className="overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                                <div className="flex gap-3 md:justify-center w-max md:w-full mx-auto px-2">
                                    {categories.map((cat, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-6 py-3 rounded-full text-base md:text-lg font-bold whitespace-nowrap transition-all duration-300 border
                                            ${selectedCategory === cat
                                                    ? 'bg-[#FF9D5C] text-white border-transparent shadow-lg shadow-orange-500/20 scale-105'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-500'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Cards Horizontal Section - PRECISE REPLICATION OF SS */}
            <section
                className="max-w-full mx-auto px-4 pt-4 md:pt-12 pb-20 relative overflow-hidden"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
            >
                <div
                    className="flex items-center justify-center min-h-[420px] md:min-h-[400px] gap-2 md:gap-3"
                >
                    {featuredPosts.length > 0 ? (() => {
                        const total = featuredPosts.length;
                        const visibleIndices = [
                            (activeIndex - 1 + total) % total, // Prev
                            activeIndex,                       // Center
                            (activeIndex + 1) % total,         // Next1
                            (activeIndex + 2) % total          // Next2
                        ];

                        return visibleIndices.map((idx, i) => {
                            const post = featuredPosts[idx];
                            const isCenter = idx === activeIndex;

                            return (
                                <motion.div
                                    key={`${post.id}-${i}`}
                                    initial={false}
                                    animate={{
                                        scale: isCenter ? 1.05 : 0.95,
                                        zIndex: isCenter ? 30 : 10,
                                        x: 0,
                                        opacity: isCenter ? 1 : 0.8
                                    }}
                                    transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                                    className={`flex-shrink-0 rounded-[2.5rem] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-500 ${isCenter
                                        ? 'w-[85vw] md:w-[340px] h-[380px] md:h-[460px] border-none shadow-[0_30px_70px_rgba(255,130,62,0.35)]'
                                        : 'hidden md:block w-[220px] md:w-[300px] h-[280px] md:h-[420px]'
                                        }`}
                                >
                                    <Link to={`/blog/${post.slug || post.id}`} className="block h-full w-full bg-slate-200">
                                        <img
                                            src={post.image_url || "/images/blog/placeholder.webp"}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-all duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent flex flex-col justify-end p-5 pb-4 md:p-8">
                                            <h3 className="text-white font-bold leading-[1.1] md:leading-tight mb-1 text-xl md:text-3xl line-clamp-2 md:line-clamp-3">
                                                {post.title}
                                            </h3>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        });
                    })() : (
                        <div className="py-20 text-slate-400 font-medium">No active featured stories found.</div>
                    )}
                </div>

                {/* Manual Controls */}
                <div className="absolute top-[45%] md:top-[35%] -translate-y-1/2 left-0 right-0 hidden md:flex justify-between px-2 md:px-6 pointer-events-none z-40">
                    <button
                        onClick={handlePrev}
                        className="w-10 h-10 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-black/10 flex items-center justify-center transition-all pointer-events-auto shadow-lg hover:scale-110 active:scale-95 group"
                    >
                        <ChevronLeftIcon className="w-6 h-6 md:w-8 md:h-8 text-black/70 group-hover:text-black" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-10 h-10 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-black/10 flex items-center justify-center transition-all pointer-events-auto shadow-lg hover:scale-110 active:scale-95 group"
                    >
                        <ChevronRightIcon className="w-6 h-6 md:w-8 md:h-8 text-black/70 group-hover:text-black" />
                    </button>
                </div>

                {/* Dots Navigation */}
                <div className="flex justify-center gap-3 mt-8">
                    {featuredPosts.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setActiveIndex(idx); setIsAutoPlaying(false); }}
                            className={`h-3 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-10 bg-orange-500' : 'w-3 bg-slate-300 hover:bg-orange-300'
                                }`}
                        />
                    ))}
                </div>

                {/* Search Bar - Repositioned slightly for better flow */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const feedEl = document.getElementById('blog-feed-section');
                        if (feedEl) feedEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="max-w-xl mx-auto flex gap-2 md:gap-4 mt-8 md:mt-12 px-4"
                >
                    <div className="flex-grow relative group">
                        <MagnifyingGlassIcon className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find specific topics, exams, or strategies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 md:pl-14 md:pr-12 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all font-medium text-sm md:text-lg shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                                title="Clear search"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="px-6 md:px-10 py-3 md:py-4 bg-[#FF7A45] text-white font-black rounded-xl md:rounded-2xl hover:bg-orange-600 transition-all shadow-lg active:scale-95 text-sm md:text-xl whitespace-nowrap cursor-pointer"
                    >
                        Search
                    </button>
                </form>
            </section >

            {/* Main Content Body */}
            < main className="max-w-7xl mx-auto px-4 pb-20 grid lg:grid-cols-12 gap-20 items-start mt-2" >

                {/* Toppers Spotlight Section */}
                < div className="lg:col-span-7" >
                    <div className="flex flex-col gap-8"> {/* or gap-6, gap-10, etc. */}
                        {/* Heading section */}
                        <div className="flex items-start gap-8">
                            <h2 className="text-4xl md:text-6xl font-black text-black leading-[0.85] tracking-tighter">
                                What <br />
                                Toppers <br />
                                are Talking <br />
                                About
                            </h2>
                            <div className="pt-2 md:pt-6">
                                <div className="w-16 h-16 md:w-24 md:h-24 border-4 md:border-8 border-black rounded-full flex items-center justify-center flex-shrink-0">
                                    <ArrowUpRightIcon className="w-8 h-8 md:w-12 md:h-12 text-black stroke-2 md:stroke-[2.5]" />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-500 text-2xl leading-relaxed font-medium max-w-xl">
                            Explore exclusive insights, winning strategies, and personal tips directly from national rank holders.
                        </p>

                        {/* Card */}
                        <div className="rounded-[4rem] bg-gradient-to-br from-[#FF9D5C] via-[#FF7A45] to-[#F14641] min-h-[400px] w-full shadow-3xl shadow-orange-500/20 relative overflow-hidden group p-8 md:p-12 flex flex-col justify-between">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Decorative Quote Icon Background */}
                            <div className="absolute top-10 right-10 opacity-10 pointer-events-none transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                                    <path d="M14.017 21L14.017 18C14.017 16.896 14.321 15.925 14.929 15.087C15.539 14.249 16.486 13.593 17.771 13.118L19 13.118C19 11.233 18.599 9.873 17.798 9.035C16.997 8.197 15.767 7.781 14.108 7.788L14.017 5.002C16.3 4.966 18.257 5.629 19.889 6.992C21.521 8.354 22.337 10.378 22.337 13.062L22.337 21L14.017 21ZM5.023 21L5.023 18C5.023 16.896 5.327 15.925 5.935 15.087C6.545 14.249 7.492 13.593 8.777 13.118L10 13.118C10 11.233 9.599 9.873 8.798 9.035C7.997 8.197 6.767 7.781 5.108 7.788L5.017 5.002C7.3 4.966 9.257 5.629 10.889 6.992C12.521 8.354 13.337 10.378 13.337 13.062L13.337 21L5.023 21Z" />
                                </svg>
                            </div>

                            <div className="relative z-10">
                                <span className="inline-block px-5 py-2 bg-black/20 backdrop-blur-md rounded-full text-white font-bold text-xs tracking-[0.2em] uppercase mb-8 border border-white/10 shadow-sm">
                                    Topper's Insight
                                </span>
                                <h3 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                                    "Consistency beats intensity. Reviewing your mistakes daily is more valuable than solving 100 new problems."
                                </h3>
                            </div>

                            <div className="relative z-10 flex items-center gap-5 mt-8">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#F14641] font-black text-2xl shadow-lg">
                                    A
                                </div>
                                <div>
                                    <div className="text-white font-black text-xl leading-none mb-1">Aravind S.</div>
                                    <div className="text-orange-50 font-medium text-base tracking-wide opacity-90">JEE Adv. AIR 15, 2024</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >

                {/* Trending Feed */}
                <div className="lg:col-span-5" id="blog-feed-section">
                    <div className="flex items-center gap-8 mb-6">
                        <h3 className="text-3xl font-black text-black text-center w-full lg:text-left">
                            {searchQuery.trim() ? "Search Results" : "Trending Topics"}
                        </h3>
                        <div className="h-[2px] bg-slate-100 flex-grow hidden lg:block" />
                    </div>

                    {searchQuery.trim() && (
                        <div className="flex items-center justify-between gap-4 mb-6 px-1">
                            <span className="text-sm font-semibold text-slate-600">
                                Results for <span className="text-orange-600 font-black">"{searchQuery}"</span> ({latestPosts.length} {latestPosts.length === 1 ? 'article' : 'articles'})
                            </span>
                            <button
                                onClick={() => setSearchQuery("")}
                                className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                            >
                                Clear search
                            </button>
                        </div>
                    )}

                    <div className="relative h-[800px]"> {/* Fixed container height */}
                        <div className="h-full overflow-y-auto pr-2 pb-20 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-orange-200">
                            {loading ? (
                                <div className="py-20 text-center text-slate-400">Loading feeds...</div>
                            ) : latestPosts.length > 0 ? latestPosts.map((post, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    viewport={{ once: true, margin: "50px" }}
                                    key={post.id}
                                >
                                    <Link
                                        to={`/blog/${post.slug || post.id}`}
                                        className="flex gap-6 p-4 rounded-[2.5rem] hover:bg-slate-50 transition-all duration-300 group border border-transparent hover:border-slate-100"
                                    >
                                        <div className="w-24 h-24 rounded-[1.8rem] overflow-hidden flex-shrink-0 shadow-md shadow-slate-100 group-hover:shadow-orange-100 transition-all">
                                            <img
                                                src={post.image_url || "/images/blog/placeholder.webp"}
                                                alt={post.title}
                                                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                                            />
                                        </div>
                                        <div className="flex-grow flex flex-col justify-center">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-orange-500 transition-colors" />
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                    {post.published_date ? new Date(post.published_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : 'Recent'}
                                                </div>
                                            </div>
                                            <h4 className="text-lg font-bold text-black leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                                                {post.title}
                                            </h4>
                                        </div>
                                    </Link>
                                </motion.div>
                            )) : (
                                <div className="py-16 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-3xl p-6">
                                    <p className="text-base font-bold text-slate-800 mb-1">No articles found</p>
                                    <p className="text-xs text-slate-500 mb-4">No content matches "{searchQuery}". Try searching for another topic or reset filters.</p>
                                    <button
                                        onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                                        className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Elegant Bottom Fade for Scroll Indication */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
                    </div>
                </div>
            </main >

            {/* Free Content Section */}
            <FreeContentSection />

            {/* FAQ Section */}
            <FAQSection />
        </div >
    );
};

export default Blog;

function FreeContentSection() {
    const navigate = useNavigate();
    const [activeVideo, setActiveVideo] = useState(null);

    const freeContents = [
        {
            id: "vid-1",
            youtubeId: "dl-QLpDplLE",
            title: "Topper's Talk: Strategic Preparation for JEE & NEET",
            description: "Learn high-scoring strategies, daily study schedules, and problem-solving methods directly from Pathfinder top rankers.",
            thumbnail: "https://img.youtube.com/vi/dl-QLpDplLE/hqdefault.jpg",
            published_date: "2025-11-10"
        },
        {
            id: "vid-2",
            youtubeId: "wGnX7j4EULA",
            title: "Success Story: How to Clear Backlogs & Master Tough Concepts",
            description: "Deep dive into chemical bonding, organic mechanisms, and solving complex physics numericals with expert guidance.",
            thumbnail: "https://img.youtube.com/vi/wGnX7j4EULA/hqdefault.jpg",
            published_date: "2025-10-10"
        },
        {
            id: "vid-3",
            youtubeId: "KOFomNzzluc",
            title: "Newton's Laws of Motion: Concept Clarity & Problem Solving",
            description: "Master the foundation of mechanics with this comprehensive conceptual guide and shortcut techniques.",
            thumbnail: "https://img.youtube.com/vi/KOFomNzzluc/hqdefault.jpg",
            published_date: "2025-11-10"
        },
        {
            id: "vid-4",
            youtubeId: "Zd_H0PmG6fo",
            title: "Math & Physics Shortcut Tricks for JEE & NEET Aspirants",
            description: "Save time and improve accuracy with elite mathematical shortcuts and smart elimination methods.",
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
        <section className="pt-0 md:pt-24 pb-10 md:pb-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-0 md:px-4">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Free <span className="text-orange-500">Content</span>
                    </h2>
                    <p className="text-base md:text-xl font-medium sm:font-bold max-w-2xl mx-auto text-slate-600">
                        Experience our teaching quality firsthand with these exclusive sample lectures and study materials.
                    </p>
                </div>

                <div className="relative px-0 md:px-12">
                    <Slider {...settings}>
                        {freeContents.map((content, idx) => (
                            <div key={idx} className="px-1 md:px-6 py-4">
                                <div
                                    onClick={() => setActiveVideo(content)}
                                    className="bg-black rounded-2xl overflow-hidden h-full flex flex-col shadow-lg border border-slate-800 cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/50"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={content.thumbnail}
                                            alt={content.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        {/* Play Overlay */}
                                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <div className="w-16 h-16 bg-orange-600/90 text-white shadow-xl shadow-orange-600/40 rounded-full flex items-center justify-center border-2 border-white/80 group-hover:scale-110 transition-transform duration-300">
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
                                </div>
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
                        <ArrowUpRightIcon className="w-5 h-5" />
                    </motion.button>
                    <a
                        href="https://www.youtube.com/@PathfinderInstitute"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-black text-white font-bold text-sm uppercase tracking-wider rounded-xl border border-slate-700 shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <span>Watch on YouTube</span>
                        <ArrowUpRightIcon className="w-4 h-4" />
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
                                    <XMarkIcon className="w-6 h-6" />
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

function FAQSection() {
    const faqs = [
        {
            question: "How does Pathfinder prepare students for JEE?",
            answer: "We focus on building strong conceptual foundations, rigorous practice through mock tests, and personalized doubt-clearing sessions to ensure every student is exam-ready."
        },
        {
            question: "Who is the Pathfinder Napura NEET faculty for 2024?",
            answer: "Our Napura centre boasts a team of highly experienced educators, including ex-IITians and medical professionals, dedicated to guiding NEET aspirants."
        },
        {
            question: "How strong are Pathfinder Napura JEE results?",
            answer: "Pathfinder Napura has consistently produced top rankers in JEE Main and Advanced, with a high selection ratio and numerous success stories every year."
        },
        {
            question: "How will I get my doubts answered?",
            answer: "We offer a 3-tiered doubt resolution system: instant in-class doubt clearing, dedicated doubt counters after class, and 24/7 online support via our app."
        },
        {
            question: "What competitive mentorship does Pathfinder Napura provide?",
            answer: "Beyond academics, we provide strategic mentorship on time management, exam temperament, and stress handling, led by past toppers and senior faculty."
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section className="py-10 md:py-24 bg-[#F9F9F9]">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center gap-2 md:gap-6 mb-8 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                        Frequently Asked <span className="text-[#FF823E]">Questions</span>
                    </h2>
                    <div className="h-[2px] bg-slate-200 flex-grow rounded-full ml-4 hidden md:block" />
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group"
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        >
                            <div className="flex justify-between items-center gap-4">
                                <h3 className={`text-lg md:text-xl font-bold transition-colors ${openIndex === idx ? 'text-[#FF823E]' : 'text-slate-800 group-hover:text-slate-900'}`}>
                                    {faq.question}
                                </h3>
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${openIndex === idx ? 'bg-[#FF823E] text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                    {openIndex === idx ? <MinusIcon className="w-6 h-6" /> : <PlusIcon className="w-6 h-6" />}
                                </div>
                            </div>
                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <p className="pt-6 text-slate-500 font-medium leading-relaxed text-lg border-t border-slate-50 mt-6">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function NextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{ ...style, display: "flex", background: "white", borderRadius: "50%", width: "40px", height: "40px", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", zIndex: 1, right: "-50px", top: "50%", transform: "translateY(-50%)" }}
            onClick={onClick}
        >
            <ChevronRightIcon className="w-5 h-5 text-black" />
        </div>
    );
}

function PrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{ ...style, display: "flex", background: "white", borderRadius: "50%", width: "40px", height: "40px", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", zIndex: 1, left: "-45px", top: "50%", transform: "translateY(-50%)" }}
            onClick={onClick}
        >
            <ChevronLeftIcon className="w-5 h-5 text-black" />
        </div>
    );
}