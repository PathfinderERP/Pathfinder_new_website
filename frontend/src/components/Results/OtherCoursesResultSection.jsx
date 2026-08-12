import React, { useState, useEffect, useMemo, useCallback } from "react";
import { coursesAPI, centresAPI } from "../../services/api";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import ApplyNowForm from "../../pages/Student/Applynow";
import CourseDetailModal from "../CourseDetailModal";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getImageUrl } from "../../utils/imageUtils";
import { useCachedData } from "../../hooks/useCachedData";
import LoadingSpinner from "../common/LoadingSpinner";

export default function OtherCoursesResultSection({ category }) {
    const navigate = useNavigate();

    // Fetch courses with caching
    const { data: allCourses, loading: coursesLoading } = useCachedData(
        "all_courses",
        () => coursesAPI.getAll()
    );

    // Fetch centres with caching
    const { data: centresData, loading: centresLoading } = useCachedData(
        "centres",
        () => centresAPI.getAll()
    );

    const [isApplyNowOpen, setIsApplyNowOpen] = useState(false);
    const [selectedCourseData, setSelectedCourseData] = useState(null);
    const [selectedModalCourse, setSelectedModalCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [slidesToShowNum, setSlidesToShowNum] = useState(4);

    // Manual Responsive Handler
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setSlidesToShowNum(1);
            } else if (width < 1024) {
                setSlidesToShowNum(2);
            } else if (width < 1280) {
                setSlidesToShowNum(3);
            } else {
                setSlidesToShowNum(4);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const courses = useMemo(() => {
        if (!allCourses || !Array.isArray(allCourses)) return [];
        
        return allCourses.filter((course) => {
            const courseName = (course.name || "").toLowerCase();
            const targetExam = (course.target_exam || "").toLowerCase();
            const courseLevel = (course.course_level || "").toLowerCase();
            const programme = (course.programme || "").toLowerCase();

            if (category === "All India") {
                if (courseName.includes("foundation") || courseName.includes("board") ||
                    programme.includes("foundation") || programme.includes("board")) {
                    return false;
                }
                const examKeywords = ['jee', 'neet', 'cuet', 'nda', 'medical', 'engineering'];
                const nameHasKeyword = examKeywords.some(k => courseName.includes(k));
                const targetHasKeyword = examKeywords.some(k => targetExam.includes(k));
                return (nameHasKeyword || targetHasKeyword || courseName.includes("all india"));
            } else if (category === "Boards") {
                return targetExam === 'boards' || courseName.includes("board") || programme.includes("board");
            } else if (category === "Foundation") {
                return courseLevel === 'foundation' || courseName.includes("foundation") || programme.includes("foundation");
            }
            return false;
        });
    }, [allCourses, category]);

    const dynamicCentres = useMemo(() => {
        if (!centresData || !Array.isArray(centresData)) return ["Online", "Hazra", "Garia", "Salt Lake", "Howrah"];
        return centresData.map(c => c.centre).filter(Boolean);
    }, [centresData]);

    const loading = coursesLoading || centresLoading;

    const settings = {
        dots: false,
        infinite: courses.length > 1,
        speed: 500,
        slidesToShow: slidesToShowNum,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: slidesToShowNum > 1 && courses.length > slidesToShowNum,
    };

    const handleViewAllClick = useCallback((e) => {
        e.preventDefault();

        const centresToUse = dynamicCentres.length > 0 ? dynamicCentres : ["Online", "Hazra", "Garia", "Salt Lake", "Howrah"];
        let courseData = {};

        switch (category) {
            case "All India":
                courseData = {
                    name: "All India Entrance Programs",
                    description: "National entrance preparation for NEET, JEE, and other national exams",
                    centres: centresToUse,
                    price: "Contact for Price",
                    duration: "1-2 years",
                    badge: "Popular"
                };
                break;
            case "Foundation":
                courseData = {
                    name: "Foundation Program",
                    description: "Build strong fundamentals for Class 8-10 students",
                    centres: centresToUse,
                    price: "Contact for Price",
                    duration: "1 year",
                    badge: "Trending"
                };
                break;
            case "Boards":
                courseData = {
                    name: "Board Exam Preparation",
                    description: "Comprehensive preparation for CBSE, ICSE, and State Boards",
                    centres: centresToUse,
                    price: "Contact for Price",
                    duration: "6 months - 1 year",
                    badge: null
                };
                break;
            default:
                courseData = {
                    name: `${category} Courses`,
                    description: `Expert coaching for ${category}`,
                    centres: centresToUse,
                    price: "Contact for Price",
                    duration: "Varies",
                    badge: null
                };
        }

        setSelectedCourseData(courseData);
        setIsApplyNowOpen(true);
    }, [category, dynamicCentres]);

    const handleApplyNowSubmit = useCallback((applicationData) => {
        const courseSlug = category.toLowerCase().replace(/\s+/g, '-');
        navigate(`/courses/${courseSlug}`, {
            state: { courseFilter: category, formData: applicationData }
        });
        setIsApplyNowOpen(false);
    }, [category, navigate]);

    const handleExploreClick = useCallback((course) => {
        setSelectedModalCourse(course);
        setIsModalOpen(true);
    }, []);

    if (loading) return (
        <div className="bg-black py-20 flex justify-center">
            <LoadingSpinner />
        </div>
    );
    if (courses.length === 0) return null;

    return (
        <section className="relative w-full bg-black pb-20 pt-0 -mt-2">
            <div className="hidden md:block absolute top-0 left-0 w-full h-24 lg:h-32 -translate-y-[90%] z-20 pointer-events-none">
                <img
                    src={getImageUrl("/images/result/black  paper high res.webp")}
                    alt="Divider"
                    className="w-full h-full object-cover object-top"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-30">
                <div className="text-center mb-4 pt-2">
                    <h2 className="text-4xl md:text-2xl font-bold text-white tracking-tight">Other Courses</h2>
                </div>

                <div className="bg-white rounded-[40px] px-2 py-8 md:p-12 shadow-2xl relative">
                    <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/5 to-transparent pointer-events-none rounded-t-[40px]"></div>

                    <div className="courses-slider-container relative">
                        <Slider {...settings}>
                            {courses.map((course) => (
                                <div key={course.id || course._id} className="px-0 pb-4 md:px-3 text-black">
                                    <CourseSmallCard
                                        course={course}
                                        navigate={navigate}
                                        onExplore={() => handleExploreClick(course)}
                                    />
                                </div>
                            ))}
                        </Slider>
                    </div>

                    <div className="mt-10">
                        <button
                            onClick={handleViewAllClick}
                            className="w-full bg-gradient-to-r from-orange-400 to-[#FF5722] text-white py-3 md:py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all shadow-md tracking-wide"
                        >
                            View All
                        </button>
                    </div>
                </div>
            </div>

            {selectedCourseData && (
                <ApplyNowForm
                    course={selectedCourseData}
                    isOpen={isApplyNowOpen}
                    onClose={() => setIsApplyNowOpen(false)}
                    onSubmit={handleApplyNowSubmit}
                    allowMultipleCentres={true}
                    isFromHeader={true}
                    formTitle="Join Our Toppers"
                    formSubtitle="Start your journey to success today"
                />
            )}

            {selectedModalCourse && (
                <CourseDetailModal
                    course={selectedModalCourse}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onApplyNow={(course) => {
                        setSelectedCourseData(course);
                        setIsApplyNowOpen(true);
                        setIsModalOpen(false);
                    }}
                />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .courses-slider-container .slick-prev, .courses-slider-container .slick-next {
                    width: 50px;
                    height: 50px;
                    z-index: 40;
                    background: white !important;
                    border-radius: 50%;
                    display: flex !important;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
                    border: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                }
                .courses-slider-container .slick-prev:before {
                    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2.5' stroke='black' class='w-6 h-6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' /%3E%3C/svg%3E") !important;
                }
                .courses-slider-container .slick-next:before {
                    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2.5' stroke='black' class='w-6 h-6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' /%3E%3C/svg%3E") !important;
                }
                .courses-slider-container .slick-prev { left: -60px; }
                .courses-slider-container .slick-next { right: -60px; }
            `}} />
        </section>
    );
}

function CourseSmallCard({ course, navigate, onExplore }) {
    const displayPrice = course.discounted_price ? parseFloat(course.discounted_price) : parseFloat(course.course_price);
    const originalPrice = course.course_price ? parseFloat(course.course_price) : 0;
    const discount = course.offers ? parseInt(course.offers) : 0;
    const hasDiscount = course.discounted_price && discount > 0;

    return (
        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col h-full bg-white group hover:shadow-xl transition-all duration-300">
            <div className="relative h-64 md:h-40 bg-gradient-to-br from-orange-400 to-[#FF5722] overflow-hidden">
                {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-white">
                        <div className="font-black text-lg">PATHFINDER</div>
                    </div>
                )}
            </div>
            <div className="bg-black text-white p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-sm mb-2 truncate">{course.name}</h3>
                <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl font-bold text-orange-500">₹{displayPrice.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={onExplore} className="py-1 px-2 rounded border border-white text-[10px] font-bold uppercase">EXPLORE</button>
                        <button onClick={() => navigate('/buynow', { state: { courseData: course } })} className="py-1 px-2 rounded bg-orange-500 text-[10px] font-bold uppercase">BUY NOW</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
