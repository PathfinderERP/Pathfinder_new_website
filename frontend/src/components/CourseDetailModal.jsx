import { getImageUrl } from "../utils/imageUtils";
﻿import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import "../index.css";

const ALL_INDIA_FAQS = [
    {
        question: "When should I start preparing for JEE/NEET?",
        answer: "Ideally, students should start their JEE/NEET preparation from Class 11. However, students with strong foundation from Class 9-10 have a significant advantage. We offer comprehensive 2-year programs starting from Class 11 and intensive 1-year crash courses for Class 12 students."
    },
    {
        question: "What is the difference between JEE Main and JEE Advanced preparation?",
        answer: "JEE Main focuses on NCERT concepts with moderate difficulty, while JEE Advanced requires deeper understanding and problem-solving skills. Our program covers both, with specialized practice for JEE Advanced for students who qualify JEE Main."
    },
    {
        question: "Do you provide study material for NEET/JEE preparation?",
        answer: "Yes, we provide comprehensive study material including concept booklets, practice problems, previous year question papers, test series, and online resources. All materials are designed by our expert faculty aligned with the latest exam patterns."
    },
    {
        question: "How many mock tests are conducted?",
        answer: "We conduct regular weekly tests, monthly full-length mock tests, and grand mock tests before the actual exam. Students get access to 50+ full-length tests for JEE and 40+ for NEET throughout the program, with detailed performance analysis."
    }
];

const BOARDS_FAQS = [
    {
        question: "Which boards do you cover in your program?",
        answer: "We provide comprehensive preparation for CBSE, ICSE, and major State Boards including West Bengal Board, Maharashtra Board, and UP Board. Our curriculum is designed to cover all syllabus patterns while maintaining high standards."
    },
    {
        question: "How do you ensure 95%+ scores in board exams?",
        answer: "Our proven methodology includes in-depth concept clarity, rigorous practice, regular assessments, board-pattern question practice, answer writing techniques, and time management strategies. We also conduct board exam simulations to build confidence."
    },
    {
        question: "When should students join for Class 10/12 board preparation?",
        answer: "For Class 10 boards, joining at the start of Class 10 is ideal, though we accept students throughout the year with customized catch-up plans. For Class 12, we recommend starting from Class 11 itself for comprehensive preparation."
    },
    {
        question: "Do you provide previous year question papers and sample papers?",
        answer: "Yes, we provide an extensive collection of previous 10 years' board question papers, CBSE sample papers, marking schemes, and board-specific practice materials. Students also get access to our exclusive question bank with 1000+ board-pattern questions."
    }
];

const FOUNDATION_FAQS = [
    {
        question: "What is the ideal time to join the Foundation Program?",
        answer: "The ideal time is starting from Class 8. However, students can also join in Class 9 or 10. Starting early gives students more time to grasp fundamental concepts and develop a competitive mindset."
    },
    {
        question: "Will this program affect my school studies?",
        answer: "Not at all. Our program is designed to complement school studies. In fact, it helps students perform better in school exams as we cover the syllabus in greater depth and clarity."
    },
    {
        question: "Are there scholarship opportunities available?",
        answer: "Yes, we conduct a scholarship test (Pathfinder Talent Search Exam) annually. Meritorious students can avail up to 100% scholarship on tuition fees based on their performance."
    },
    {
        question: "What is the mode of classes?",
        answer: "We offer both Offline (Classroom) and Online (Live Interactive) modes. You can choose the mode that best suits your convenience. We also have hybrid options available at select centers."
    }
];

const CourseDetailModal = ({ course, isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState("features");
    const [faqOpenIndex, setFaqOpenIndex] = useState(0);
    const modalRef = useRef(null);

    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 1024);

    // Prevent body scroll when modal is open
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener("resize", handleResize);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            window.removeEventListener("resize", handleResize);
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen || !course) return null;

    const handleBuyNow = () => {
        navigate("/buynow", { state: { courseData: course } });
    };

    const tabs = [
        { id: "features", label: "Features" },
        { id: "about", label: "About" },
        { id: "teachers", label: "Teachers" },
        { id: "toppers", label: "Toppers" },
        { id: "free_content", label: "Free Content" },
        { id: "more_details", label: "More Details" },
    ];

    const scrollToSection = (id) => {
        setActiveTab(id);
        const element = document.getElementById(`section-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Helper to get plan price
    const getPrice = () => {
        // Use discounted_price if available, otherwise course_price
        if (course.discounted_price) {
            return parseFloat(course.discounted_price);
        }
        if (course.plans && course.plans.length > 0) {
            const prices = course.plans.map(p => p.discounted_price || p.base_price).filter(p => p);
            return Math.min(...prices);
        }
        return parseFloat(course.course_price);
    };

    const getOriginalPrice = () => {
        // Use course_price as original if discounted_price exists
        if (course.discounted_price && course.course_price) {
            return parseFloat(course.course_price);
        }
        if (course.plans && course.plans.length > 0) {
            const prices = course.plans.map(p => p.base_price).filter(p => p);
            return Math.max(...prices);
        }
        return parseFloat(course.course_price);
    };

    const displayPrice = getPrice();
    const originalPrice = getOriginalPrice();
    // Use offers field if available, otherwise calculate
    const discount = course.offers ? parseInt(course.offers) : Math.round(((originalPrice - displayPrice) / originalPrice) * 100);

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 backdrop-blur-sm 2xl:p-4 overflow-hidden">
            <div
                ref={modalRef}
                className="bg-white w-full 2xl:max-w-7xl h-full 2xl:h-[95vh] 2xl:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-[100] bg-white text-slate-900 p-2.5 rounded-full shadow-xl hover:bg-slate-50 hover:scale-105 transition-all duration-200 group border border-slate-100"
                    aria-label="Close details"
                >
                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header Section (Scrollable with content) */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {/* Hero Banner Area */}
                    <div className="relative w-full h-[400px] md:h-[450px] overflow-visible bg-orange-500">
                        {/* Background Image */}
                        <div
                            className="absolute inset-0 z-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${getImageUrl("/images/course_images/explore_hero_bg.webp")})`,
                            }}
                        />

                        {/* Map Image - Right */}
                        <div className="absolute bottom-15 right-10 h-[85%] w-[30%] md:w-[25%] z-20 hidden md:flex justify-end items-center pointer-events-none">
                            <img
                                src={getImageUrl("/images/course_images/explore_top_india_map_right.webp")}
                                alt="Map"
                                className="h-[70%] object-contain object-right opacity-90 mix-blend-multiply"
                            />
                        </div>

                        {/* Person/Banner Image - Left - OVERLAPPING BOTTOM */}
                        <div className="absolute top-15 left-0 h-[75%] md:h-[70%] z-30 hidden md:flex items-end pointer-events-none filter drop-shadow-2xl mb-8">
                            <img
                                src={getImageUrl("/images/course_images/explore_banner.webp")}
                                alt="Course Banner"
                                className="h-full object-contain object-bottom"
                            />
                        </div>

                        {/* Content layer */}
                        <div className="relative z-20 h-[85%] container max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center items-center md:items-start md:pl-56">
                            {/* Breadcrumbs */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-white/90 font-medium mb-3 md:mb-4 drop-shadow-md">
                                <span>Home</span>
                                <span>&gt;</span>
                                <span>{course.category?.name || "Courses"}</span>
                                <span>&gt;</span>
                                <span>{course.mode || "Online"}</span>
                                <span>&gt;</span>
                                <span className="text-white font-bold border-b border-white/40">{course.name}</span>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-xl text-center md:text-left leading-tight tracking-tight">
                                {course.name}
                            </h1>
                        </div>

                        {/* Black Stripe Navigation */}
                        <div className="absolute top-64 left-0 w-full h-[60px] bg-black z-50 flex items-center shadow-2xl">
                            <div className="container max-w-7xl mx-auto px-6 md:px-12 md:pl-2 flex gap-8 overflow-x-auto no-scrollbar h-full items-center">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => scrollToSection(tab.id)}
                                        className={`text-sm md:text-base font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                            ? "text-orange-500 font-bold"
                                            : "text-slate-300 hover:text-white"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="px-4 pt-2 pb-8 md:px-8 md:pt-2 md:pb-12 bg-slate-50 min-h-screen">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

                            {/* Left Column: Details */}
                            <div className="lg:col-span-2 space-y-10">

                                {/* Features Section */}
                                <div id="section-features" className="scroll-mt-24 -mt-12 md:-mt-24 ml-0 md:ml-0 relative z-40">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Batch Features</h2>

                                    {/* Plans / Features Card */}
                                    <div className="relative bg-black rounded-2xl shadow-2xl flex  overflow-hidden min-h-[320px] max-w-2xl">

                                        {/* LEFT CONTENT */}
                                        <div className="flex-1 p-4 space-y-2 rounded-l-2xl flex flex-col relative z-10">
                                            {(() => {
                                                const featureSection = course.detail_sections?.find(s =>
                                                    s.title?.toLowerCase().includes("feature")
                                                );

                                                const featuresList = (featureSection?.points && featureSection.points.length > 0)
                                                    ? featureSection.points.map(p => p.text)
                                                    : [
                                                        "Recorded Lectures by top faculties",
                                                        "DPPs with Video Solution",
                                                        "Regular Test & AITS",
                                                        "24*7 Doubt Support",
                                                        "Class notes & Handwritten Notes"
                                                    ];

                                                return featuresList.map((feature, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-start gap-4 py-3 border-b-2 border-white/20 last:border-0 hover:bg-white/5 transition-colors px-3 rounded-lg group"
                                                    >
                                                        <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                                                            <svg
                                                                className="w-4 h-4 text-green-500"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={3}
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <span className="text-white/90 font-medium text-lg leading-relaxed group-hover:text-white transition-colors">
                                                            {feature}
                                                        </span>
                                                    </div>
                                                ));
                                            })()}
                                        </div>

                                        {/* Right Image Overlay */}
                                        <div className="flex-shrink-0 relative overflow-hidden w-16 md:w-28 bg-black">
                                            <img
                                                src={getImageUrl("/images/course_images/STANDARD BATCH.webp")}
                                                alt="Standard Batch"
                                                className="absolute top-0 left-0 h-[100.1%] w-auto max-w-none object-cover select-none overflow-hidden"
                                            />
                                        </div>
                                    </div>



                                </div>

                                {/* About Section */}
                                <div id="section-about" className="scroll-mt-24 bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">About the Batch</h2>

                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-orange-400 rounded-xl flex items-center justify-center text-orange-600 text-xl">
                                                📅
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-500 font-medium">Course Duration</div>
                                                <div className="font-semibold text-slate-900">
                                                    {course.duration ? `${course.duration} ${parseInt(course.duration) === 1 ? 'year' : 'years'}` : "Full Course"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-orange-400 rounded-xl flex items-center justify-center text-orange-600 text-xl">
                                                ⏳
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-500 font-medium">Validity</div>
                                                <div className="font-semibold text-slate-900">
                                                    Until {course.validity_date ? new Date(course.validity_date).toLocaleDateString() : "Exam Ends"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-orange-400 rounded-xl flex items-center justify-center text-orange-600 text-xl">
                                                🎥
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-500 font-medium">Mode of Lectures</div>
                                                <div className="font-semibold text-slate-900 capitalize">{course.mode}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-orange-400 rounded-xl flex items-center justify-center text-orange-600 text-xl">
                                                📅
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-500 font-medium">Schedule</div>
                                                <div className="font-semibold text-slate-900">{course.course_sessions || "6 days/week"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="prose prose-slate max-w-none">
                                        <p>{course.description}</p>
                                    </div>
                                </div>

                                {/* Remaining sections moved to full-width specific layout below */}

                            </div>

                            {/* Right Column: Sticky Sidebar */}
                            <div className="lg:col-span-3 -mt-12 md:-mt-12 relative z-40">
                                <div className=" top-4 space-y-6">
                                    <div className="bg-black rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
                                        {/* Course Image Header */}
                                        <div className="aspect-video bg-slate-900 relative border-b border-slate-800">
                                            {course.thumbnail_url ? (
                                                <img src={course.thumbnail_url} alt={course.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-4xl font-bold">
                                                    {course.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 text-white">
                                            <div className="flex justify-between items-start mb-4">
                                                <h2 className="text-2xl font-bold text-white leading-tight">{course.name}</h2>
                                                {course.language && (
                                                    <span className="border border-white/30 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">{course.language}</span>
                                                )}
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                                    <div className="w-5 text-center">👥</div>
                                                    <span>For {course.target_exam || "Aspirants"}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                                    <div className="w-5 text-center">📅</div>
                                                    <span>Starts on {course.starting_date || course.start_date
                                                        ? new Date(course.starting_date || course.start_date).toISOString().split('T')[0]
                                                        : "Soon"
                                                    }</span>
                                                </div>
                                                {course.centre && (
                                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                                        <div className="w-5 text-center">📍</div>
                                                        <span>Centre : {course.centre}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="text-4xl font-bold text-orange-500">₹{parseFloat(displayPrice).toLocaleString()}</div>
                                                {discount > 0 && (
                                                    <div className="text-lg text-slate-500 line-through decoration-slate-500">₹{parseFloat(originalPrice).toLocaleString()}</div>
                                                )}
                                                {discount > 0 && (
                                                    <div className="bg-green-600/20 text-green-400 text-xs font-bold px-2 py-1 rounded">
                                                        {discount}% OFF
                                                    </div>
                                                )}
                                            </div>

                                            {discount > 0 && (
                                                <div className="flex items-center gap-2 text-sm text-green-500 font-medium mb-6">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    Offer Applied - Save ₹{(originalPrice - displayPrice).toLocaleString()}
                                                </div>
                                            )}

                                            <button
                                                onClick={handleBuyNow}
                                                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-lg shadow-lg transition-all transform active:scale-95 mb-4 uppercase tracking-wide"
                                            >
                                                Continue with Batch
                                            </button>

                                            <div className="text-center text-xs text-slate-500">
                                                15-Days Money Back Guarantee
                                            </div>
                                        </div>
                                    </div>

                                    {/* Help Card */}
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                            📞
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">Have queries?</div>
                                            <div className="text-xs text-slate-500">Talk to our experts</div>
                                        </div>
                                        <button className="ml-auto text-sm font-semibold text-indigo-600 hover:underline">
                                            Call Us
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Full Width Sections (Moved below sidebar for layout) */}
                            {/* Full Width Sections (Moved below sidebar for layout) */}
                            <div className="lg:col-span-8 -mx-4 md:-mx-24">
                                {/* Toppers Section (New Design) */}
                                {/* Toppers Header (Separate) */}
                                <div id="section-toppers" className=" text-center mb-6 ">
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Our Toppers
                                    </h2>
                                </div>

                                {/* Toppers Carousel Section (Background + Cards) */}
                                <div className="relative mb-10 pb-10 min-h-[400px] -mt-12 overflow-hidden">
                                    {/* FULL PAGE BACKGROUND */}
                                    <div className="absolute inset-x-0 top-0 z-0 h-full">
                                        <img
                                            src="/images/result/orange paper.webp"
                                            alt="Background"
                                            className="w-full h-[400px] object-fit"
                                        />
                                    </div>

                                    {/* CONTENT */}
                                    <div className="relative z-10 w-full pt-10">
                                        {/* Animated Toppers List Container */}
                                        {/* React Slick Carousel for Toppers */}
                                        <div className="container mx-auto px-4 sm:px-12">
                                            {(() => {
                                                const settings = {
                                                    className: "topper-hero-slider",
                                                    centerMode: true,
                                                    infinite: true,
                                                    centerPadding: isMobile ? "20px" : "0px",
                                                    slidesToShow: isMobile ? 3 : 7,
                                                    speed: 500,
                                                    autoplay: true,
                                                    autoplaySpeed: 2000,
                                                    focusOnSelect: true,
                                                    arrows: !isMobile,
                                                    responsive: [
                                                        {
                                                            breakpoint: 1280,
                                                            settings: {
                                                                slidesToShow: 5,
                                                                centerPadding: "0px",
                                                            }
                                                        },
                                                        {
                                                            breakpoint: 1024,
                                                            settings: {
                                                                slidesToShow: 3,
                                                                centerPadding: "20px",
                                                            }
                                                        },
                                                        {
                                                            breakpoint: 640,
                                                            settings: {
                                                                slidesToShow: 3,
                                                                centerPadding: "10px",
                                                            }
                                                        }
                                                    ]
                                                };

                                                const toppersToDisplay =
                                                    course.toppers && course.toppers.length > 0
                                                        ? course.toppers
                                                        : [
                                                            {
                                                                name: "Rupayan Pal",
                                                                rank: "1026",
                                                                image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e"
                                                            },
                                                            {
                                                                name: "Atrijo Pal",
                                                                rank: "1649",
                                                                image: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1"
                                                            },
                                                            {
                                                                name: "Soumyadeep Das",
                                                                rank: "2022",
                                                                image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36"
                                                            },
                                                            {
                                                                name: "Prantik Ganguly",
                                                                rank: "2853",
                                                                image: "https://images.unsplash.com/photo-1618641986557-1ecd230959aa"
                                                            },
                                                            {
                                                                name: "Anirban Chakraborty",
                                                                rank: "312",
                                                                image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"
                                                            },
                                                            {
                                                                name: "Riya Banerjee",
                                                                rank: "487",
                                                                image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e"
                                                            },
                                                            {
                                                                name: "Sourav Mukherjee",
                                                                rank: "721",
                                                                image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2"
                                                            },
                                                            {
                                                                name: "Ishita Sen",
                                                                rank: "958",
                                                                image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c"
                                                            }
                                                        ];

                                                return (
                                                    <Slider {...settings}>
                                                        {toppersToDisplay.map((topper, idx) => (
                                                            <div key={idx} className="outline-none py-8 px-6">
                                                                <div className="w-32 mx-auto flex flex-col group cursor-pointer relative">
                                                                    <div className="absolute -top-2 -left-3 z-20">
                                                                        <div className="text-slate-900 font-black text-xl tracking-tight leading-none mb-0.5">RANK</div>
                                                                        <div className="text-slate-900 font-extrabold text-2xl leading-none">
                                                                            {String(topper.rank || "").replace(/rank/i, "").trim() || "1"}
                                                                        </div>
                                                                    </div>
                                                                    {/* Beveled Card Frame */}
                                                                    <div
                                                                        className="w-full bg-[#fa8626] p-1.5 shadow-lg relative"
                                                                        style={{
                                                                            clipPath: 'polygon(75px 0, 100% 0, 100% 100%, 0 100%, 0 75px)'
                                                                        }}
                                                                    >
                                                                        {/* Inner Border/Image Container */}
                                                                        <div className="bg-white/20 p-1 pb-0">
                                                                            <div
                                                                                className="w-full aspect-[4/5] bg-slate-200 overflow-hidden"
                                                                                style={{
                                                                                    clipPath: 'polygon(65px 0, 100% 0, 100% 100%, 0 100%, 0 65px)'
                                                                                }}
                                                                            >
                                                                                <img
                                                                                    src={topper.image_url || topper.image}
                                                                                    alt={topper.name}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {/* Name Bar */}
                                                                        <div className="text-center py-2">
                                                                            <div className="text-white font-bold text-base uppercase leading-tight font-sans tracking-wide truncate px-1">
                                                                                {topper.name}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </Slider>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-3">
                                {/* Teachers Section */}
                                <div id="section-teachers" className="relative mb-20 w-auto mt-[-5rem] md:-mt-16 ml-0 md:ml-16">
                                    <h2 className="text-xl font-bold text-slate-900 mb-8 text-center md:ml-10">Know your Teachers</h2>

                                    {/* Horizontal Background Line - Thinner */}
                                    <div className="absolute top-[55%] left-1/2 w-[200%] -translate-x-1/2 -translate-y-1/2 z-0 hidden sm:block">
                                        <img
                                            src={getImageUrl("/images/course_images/teachers horizontal bg line.webp")}
                                            alt=""
                                            className="w-full h-4 object-cover opacity-90"
                                        />
                                    </div>

                                    {/* Main White Container Wrapper */}
                                    <div className="relative z-10 w-fit max-w-full mx-auto">
                                        <div className="bg-white rounded-[1.5rem] shadow-[0_0_50px_rgba(0,0,0,0.15)] border border-slate-100 p-8 md:p-8">
                                            <div className="flex flex-wrap justify-center gap-x-10 gap-y-10">
                                                {course.teachers && course.teachers.length > 0 ? (
                                                    course.teachers.map((teacher, idx) => (
                                                        <div key={idx} className="relative group flex flex-col items-center justify-end w-52 transition-transform hover:-translate-y-1 duration-300">
                                                            {/* Image Area with Orange Background */}
                                                            <div className="relative w-40 h-48 flex justify-center items-end mb-2">
                                                                {/* Orange Arch/Blob Background via CSS */}
                                                                <div className="absolute w-[170px] h-36 bottom-0 left-1/2 -translate-x-1/2 bg-gradient-to-b from-orange-400 to-orange-600 rounded-t-[5rem] z-10" />

                                                                {/* Teacher Photo */}
                                                                <div className="relative z-20 w-full h-full flex items-end justify-center pb-1">
                                                                    <img
                                                                        src={teacher.profile_image_url || teacher.profile_image || "/images/course_images/explore_teacher.webp"}
                                                                        alt={teacher.name}
                                                                        className="h-full object-contain object-bottom drop-shadow-md"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Info Card - Overlapping Bottom */}
                                                            <div className="relative z-30 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-4 w-56 text-center -mt-4">
                                                                <h3 className="text-slate-500 text-sm line-clamp-1" title={teacher.name}>
                                                                    {teacher.name}
                                                                </h3>
                                                                <p className="text-slate-900 font-bold text-sm line-clamp-1">
                                                                    {teacher.subject || "Subject Expert"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    [1, 2, 3].map((_, idx) => (
                                                        <div key={idx} className="relative group flex flex-col items-center justify-end w-48">
                                                            <div className="relative w-40 h-48 flex justify-center items-end mb-2">
                                                                <div className="absolute w-[170px] h-36 bottom-0 left-1/2 -translate-x-1/2 bg-gradient-to-b from-orange-400 to-orange-600 rounded-t-[5rem] z-10" />
                                                                <div className="relative z-20 w-full h-full flex items-end justify-center pb-1">
                                                                    <img
                                                                        src={getImageUrl("/images/course_images/explore_teacher.webp")}
                                                                        alt="Start Faculty"
                                                                        className="h-full object-contain object-bottom"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="relative z-30 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-4 w-56 text-center -mt-4">
                                                                <h3 className="text-slate-500 text-sm">Expert Faculty</h3>
                                                                <p className="text-slate-900 font-bold text-sm">Subject Expert</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/* Free Content Section */}
                                {/* Free Content Section */}
                                <div id="section-free_content" className="max-w-7xl mx-auto mb-16 px-0 md:px-4 mt-0 md:-mt-10">
                                    <div className="text-center mb-12 px-4">
                                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                                            Free <span className="text-orange-500">Content</span>
                                        </h2>
                                        <p className="text-base md:text-xl font-medium text-slate-600 max-w-2xl mx-auto leading-relaxed">
                                            Experience our teaching quality firsthand with these exclusive sample lectures and study materials.
                                        </p>
                                    </div>

                                    <div className="relative px-0 md:px-2 ml-0 md:ml-32">
                                        {course.free_contents && course.free_contents.length > 0 ? (
                                            <Slider {...{
                                                className: "free-content-slider",
                                                centerMode: !isMobile,
                                                centerPadding: "0px",
                                                dots: false,
                                                infinite: true,
                                                speed: 500,
                                                slidesToShow: isMobile ? 1 : 3,
                                                slidesToScroll: 1,
                                                autoplay: true,
                                                autoplaySpeed: 3000,
                                                focusOnSelect: true,
                                                arrows: !isMobile,
                                                responsive: [
                                                    {
                                                        breakpoint: 1024,
                                                        settings: {
                                                            slidesToShow: isMobile ? 1 : 3,
                                                        }
                                                    }
                                                ]
                                            }}>
                                                {course.free_contents.map((content, idx) => (
                                                    <div key={idx} className="px-0 md:px-4 pb-8 pt-1">
                                                        <div className="bg-black rounded-2xl overflow-hidden h-full flex flex-col shadow-lg border border-slate-800 transition-all duration-300">
                                                            {/* Thumbnail */}
                                                            <div className="relative h-72 md:h-48 w-full bg-slate-800 flex items-center justify-center overflow-hidden">
                                                                {content.thumbnail ? (
                                                                    <img src={content.thumbnail} alt={content.title} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                                                        <span className="text-4xl">▶️</span>
                                                                    </div>
                                                                )}
                                                                {/* Play Overlay */}
                                                                <div className="absolute inset-0 bg-black/20 transition-colors flex items-center justify-center">
                                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/40">
                                                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Content */}
                                                            <div className="p-5 flex flex-col flex-grow">
                                                                <div className="text-xs text-slate-400 mb-2 font-medium">
                                                                    {new Date(content.published_date || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                </div>
                                                                <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2">
                                                                    {content.title}
                                                                </h3>
                                                                <p className="text-slate-400 text-xs line-clamp-2">
                                                                    {content.description || content.title}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </Slider>
                                        ) : (
                                            /* Dummy/Fallback Data for visualization if empty */
                                            <Slider {...{
                                                className: "free-content-slider",
                                                centerMode: !isMobile,
                                                centerPadding: "0px",
                                                dots: false,
                                                infinite: true,
                                                speed: 500,
                                                slidesToShow: isMobile ? 1 : 3,
                                                slidesToScroll: 1,
                                                autoplay: true,
                                                autoplaySpeed: 3000,
                                                focusOnSelect: true,
                                                arrows: !isMobile,
                                                responsive: [{ breakpoint: 1024, settings: { slidesToShow: isMobile ? 1 : 3 } }]
                                            }}>
                                                {[1, 2, 3, 4].map((_, idx) => (
                                                    <div key={idx} className="px-0 md:px-4 pb-8 pt-1">
                                                        <div className="bg-black rounded-2xl overflow-hidden h-full flex flex-col shadow-lg border border-slate-800 transition-all duration-300">
                                                            <div className="relative h-72 md:h-48 w-full bg-slate-800 flex items-center justify-center overflow-hidden">
                                                                <img
                                                                    src={[
                                                                        "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop",
                                                                        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
                                                                        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop",
                                                                        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop"
                                                                    ][idx % 4]}
                                                                    alt="Thumbnail"
                                                                    className="w-full h-full object-cover opacity-80"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/40">
                                                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-5 flex flex-col flex-grow">
                                                                <div className="text-xs text-slate-400 mb-2 font-medium">10 Nov, 2025</div>
                                                                <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2">
                                                                    Basic Chemistry 01: How to complete syllabus
                                                                </h3>
                                                                <p className="text-slate-400 text-xs line-clamp-2">Brief description of the content goes here...</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </Slider>
                                        )}
                                    </div>

                                    {/* View All Button */}
                                    <div className="mt-2 flex justify-center px-4 md:px-8 ml-0 md:ml-32">
                                        <button className="w-full bg-[#ff7d45] hover:bg-[#ff6b2c] text-white font-bold py-3 rounded-lg shadow-lg transition-colors text-lg">
                                            View All
                                        </button>
                                    </div>
                                </div>

                                {/* More Details Section */}
                                <div id="section-more_details" className="scroll-mt-24 max-w-7xl mx-auto">



                                    {/* FAQs based on Course Type */}
                                    {(() => {
                                        const getFAQs = () => {
                                            if (!course) return [];

                                            const name = (course.name || "").toLowerCase();
                                            const target = (course.target_exam || "").toLowerCase();
                                            const category = (course.category?.name || "").toLowerCase();

                                            // 1. Check Keywords for specific exams (Priority)
                                            if (name.includes("board") || target.includes("board") || category.includes("board")) return BOARDS_FAQS;

                                            // JEE/NEET/All India must take precedence over 'Foundation' keyword logic
                                            // (because some JEE courses might be named 'Foundation for JEE')
                                            if (
                                                name.includes("jee") || name.includes("neet") ||
                                                target.includes("jee") || target.includes("neet") ||
                                                category.includes("all india") || category.includes("entrance")
                                            ) {
                                                return ALL_INDIA_FAQS;
                                            }

                                            // Foundation logic (ONLY if not Board/JEE/NEET)
                                            if (
                                                name.includes("foundation") || target.includes("foundation") ||
                                                category.includes("foundation") ||
                                                target.includes("ntse") || target.includes("olympiad") || target.includes("kvpy")
                                            ) {
                                                return FOUNDATION_FAQS;
                                            }

                                            // Default fallback
                                            return ALL_INDIA_FAQS;
                                        };
                                        const currentFAQs = getFAQs();

                                        return (
                                            <div id="section-faq" className="py-10 md:py-24 bg-[#F9F9F9] rounded-[2rem] md:rounded-[3rem] ml-2 mr-4 md:ml-32 md:mr-8 my-12 overflow-hidden">
                                                <div className="max-w-4xl mx-auto px-2 md:px-6">
                                                    <div className="flex items-center gap-2 md:gap-6 mb-8 md:mb-16">
                                                        <h3 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                                                            Frequently Asked <span className="text-[#FF823E]">Questions</span>
                                                        </h3>
                                                        <div className="h-[2px] bg-slate-200 flex-grow rounded-full ml-4 hidden md:block" />
                                                    </div>

                                                    <div className="space-y-4">
                                                        {currentFAQs.map((faq, index) => (
                                                            <div
                                                                key={index}
                                                                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group relative"
                                                                onClick={() => setFaqOpenIndex(faqOpenIndex === index ? -1 : index)}
                                                            >
                                                                <div className="flex justify-between items-center gap-4">
                                                                    <h4 className={`text-base md:text-xl font-bold transition-colors ${faqOpenIndex === index ? 'text-[#FF823E]' : 'text-slate-800 group-hover:text-slate-900'}`}>
                                                                        {faq.question}
                                                                    </h4>
                                                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${faqOpenIndex === index ? 'bg-[#FF823E] text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                                                        {faqOpenIndex === index ? (
                                                                            <MinusIcon className="w-5 h-5 md:w-6 md:h-6" />
                                                                        ) : (
                                                                            <PlusIcon className="w-5 h-5 md:w-6 md:h-6" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <AnimatePresence>
                                                                    {faqOpenIndex === index && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <p className="pt-6 text-slate-500 font-medium leading-relaxed text-sm md:text-lg border-t border-slate-50 mt-6">
                                                                                {faq.answer}
                                                                            </p>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default CourseDetailModal;
