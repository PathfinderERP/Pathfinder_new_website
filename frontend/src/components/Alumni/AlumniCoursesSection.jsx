import React, { useState, useEffect } from "react";
import { coursesAPI } from "../../services/api";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import AlumniApplyNowForm from "./AlumniApplyNowForm";
import { centresAPI } from "../../services/api";
import CourseDetailModal from "../CourseDetailModal";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getImageUrl } from "../../utils/imageUtils";

export default function AlumniCoursesSection() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dynamicCentres, setDynamicCentres] = useState([]);
    const [isApplyNowOpen, setIsApplyNowOpen] = useState(false);
    const [selectedCourseData, setSelectedCourseData] = useState(null);
    const [selectedModalCourse, setSelectedModalCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [slidesToShow, setSlidesToShow] = useState(4);
    const navigate = useNavigate();

    // Fetch dynamic centres from backend
    useEffect(() => {
        const fetchCentres = async () => {
            try {
                const response = await centresAPI.getAll();
                const centresData = response.data || [];
                const centreNames = centresData.map(c => c.centre).filter(Boolean);
                setDynamicCentres(centreNames);
            } catch (error) {
                console.error("Error fetching centres:", error);
                setDynamicCentres(["Online", "Hazra", "Garia", "Salt Lake", "Howrah"]);
            }
        };
        fetchCentres();
    }, []);

    // Manual Responsive Handler
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setSlidesToShow(1);
            } else if (width < 1024) {
                setSlidesToShow(2);
            } else if (width < 1280) {
                setSlidesToShow(3);
            } else {
                setSlidesToShow(4);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await coursesAPI.getAll();
                const coursesData = Array.isArray(response.data) ? response.data : [];

                // 1. All India Entrance Group
                const allIndiaGroup = coursesData.filter((course) => {
                    const name = (course.name || "").toLowerCase();
                    const target = (course.target_exam || "").toLowerCase();
                    const prog = (course.programme || "").toLowerCase();
                    const level = (course.course_level || "").toLowerCase();

                    const keywords = ['jee', 'neet', 'cuet', 'nda', 'medical', 'engineering'];
                    const isAI = keywords.some(k => name.includes(k) || target.includes(k)) || name.includes("all india");
                    const isMisc = name.includes("foundation") || prog.includes("foundation") || level === 'foundation' ||
                        target === 'boards' || name.includes("board") || prog.includes("board");
                    return isAI && !isMisc;
                }).slice(0, 16);

                // 2. Foundation Group
                const foundationGroup = coursesData.filter((course) => {
                    const name = (course.name || "").toLowerCase();
                    const level = (course.course_level || "").toLowerCase();
                    const prog = (course.programme || "").toLowerCase();
                    return level === 'foundation' || name.includes("foundation") || prog.includes("foundation");
                }).slice(0, 16);

                // 3. Boards Group
                const boardsGroup = coursesData.filter((course) => {
                    const name = (course.name || "").toLowerCase();
                    const target = (course.target_exam || "").toLowerCase();
                    const prog = (course.programme || "").toLowerCase();
                    const isBoard = target === 'boards' || name.includes("board") || prog.includes("board");
                    const isFound = name.includes("foundation") || (course.course_level || "").toLowerCase() === 'foundation';
                    return isBoard && !isFound;
                }).slice(0, 16);

                // Interleave in exact sequence: Card 1 (AI) -> Card 2 (Found) -> Card 3 (Board) -> Card 4 (AI)...
                const combined = [];
                const maxLen = Math.max(allIndiaGroup.length, foundationGroup.length, boardsGroup.length);
                for (let i = 0; i < maxLen; i++) {
                    if (allIndiaGroup[i]) combined.push(allIndiaGroup[i]);
                    if (foundationGroup[i]) combined.push(foundationGroup[i]);
                    if (boardsGroup[i]) combined.push(boardsGroup[i]);
                }

                // Final unique filter
                const seen = new Set();
                const finalFiltered = combined.filter(c => {
                    const id = c.id || c._id;
                    if (seen.has(id)) return false;
                    seen.add(id);
                    return true;
                });

                setCourses(finalFiltered);
            } catch (error) {
                console.error("Error fetching courses for alumni page:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const settings = {
        dots: false,
        infinite: courses.length > 1,
        speed: 500,
        slidesToShow: slidesToShow,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true
    };

    const handleViewAllClick = (e) => {
        e.preventDefault();
        const centresToUse = dynamicCentres.length > 0 ? dynamicCentres : ["Online", "Hazra", "Garia", "Salt Lake", "Howrah"];
        setSelectedCourseData({
            name: "Legend Course Interest",
            centres: centresToUse,
            badge: "Legends"
        });
        setIsApplyNowOpen(true);
    };

    const handleApplyNowSubmit = (applicationData) => {
        setIsApplyNowOpen(false);

        // Redirect based on selected course category
        const selectedCat = applicationData.course_name;
        if (selectedCat === "All India") {
            navigate("/courses/all-india");
        } else if (selectedCat === "Foundation") {
            navigate("/courses/foundation");
        } else if (selectedCat === "Boards") {
            navigate("/courses/boards");
        }
    };

    const handleExploreClick = (course) => {
        setSelectedModalCourse(course);
        setIsModalOpen(true);
    };

    if (loading || courses.length === 0) return null;

    return (
        <section className="relative w-full bg-black pb-20 pt-4 md:pt-12 -mt-2">
            {/* Smooth Transition/Jagged Edge Divider - Hidden on Mobile */}
            <div className="hidden md:block absolute top-0 left-0 w-full h-24 lg:h-32 -translate-y-[90%] z-20 pointer-events-none">
                <img
                    src={getImageUrl("/images/result/black  paper high res.webp")}
                    alt="Divider"
                    className="w-full h-full object-cover object-top"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-30">
                <div className="text-center mb-10 pt-4">
                    <h2 className="text-2xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                        Courses That Made them Legends!
                    </h2>
                    <div className="w-[200px] sm:w-[300px] md:w-[450px] h-[2px] bg-orange-500 mx-auto mt-4 rounded-full opacity-90 shadow-sm" />
                </div>

                <div className="bg-white rounded-[40px] p-6 md:p-12 shadow-2xl relative">
                    <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/5 to-transparent pointer-events-none rounded-t-[40px]"></div>

                    <div className="courses-slider-container relative">
                        <Slider {...settings}>
                            {courses.map((course) => (
                                <div key={course.id || course._id} className="px-3 pb-4">
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

            {/* Enrollment Form Modal */}
            {isApplyNowOpen && (
                <AlumniApplyNowForm
                    course={selectedCourseData}
                    isOpen={isApplyNowOpen}
                    onClose={() => setIsApplyNowOpen(false)}
                    onSubmit={handleApplyNowSubmit}
                    allowMultipleCentres={true}
                    formTitle="Pathfinder Legend Enrollment"
                    formSubtitle="Tell us which legend path you want to take"
                />
            )}

            {/* Course Detail Modal */}
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
                .courses-slider-container .slick-prev:hover, .courses-slider-container .slick-next:hover {
                    transform: translateY(-50%) scale(1.1);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.3) !important;
                }
                .courses-slider-container .slick-prev:before, .courses-slider-container .slick-next:before {
                    color: black !important;
                    opacity: 1;
                    display: block;
                    width: 24px;
                    height: 24px;
                }
                .courses-slider-container .slick-prev:before {
                    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2.5' stroke='black' class='w-6 h-6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' /%3E%3C/svg%3E") !important;
                }
                .courses-slider-container .slick-next:before {
                    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2.5' stroke='black' class='w-6 h-6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' /%3E%3C/svg%3E") !important;
                }
                .courses-slider-container .slick-prev { left: -60px; }
                .courses-slider-container .slick-next { right: -60px; }
                @media (max-width: 1024px) {
                    .courses-slider-container .slick-prev { left: -40px; }
                    .courses-slider-container .slick-next { right: -40px; }
                }
                @media (max-width: 768px) {
                    .courses-slider-container .slick-prev { left: -20px; }
                    .courses-slider-container .slick-next { right: -20px; }
                }
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
            <div className="relative h-32 md:h-40 bg-gradient-to-br from-orange-400 to-[#FF5722] overflow-hidden">
                {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                        <div>
                            <div className="text-white font-black text-lg md:text-xl leading-none">WARRIORS</div>
                            <div className="text-white/80 font-bold text-[10px] my-0.5">AND</div>
                            <div className="text-white font-black text-lg md:text-xl leading-none">WINNERS</div>
                        </div>
                    </div>
                )}
            </div>
            <div className="bg-black text-white p-4 flex flex-col flex-grow">
                <div className="flex items-center justify-between gap-1 mb-2">
                    <h3 className="font-bold text-sm md:text-base border-b border-orange-500/30 pb-1 truncate flex-grow">{course.name}</h3>
                    <div className="text-[10px] px-1.5 py-0.5 border border-white/40 rounded uppercase font-bold shrink-0">{course.language || 'English'}</div>
                </div>
                <div className="space-y-1.5 mb-3 text-[10px] md:text-xs">
                    <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                        <span className="truncate">For {course.class_level || 'All'} Aspirants</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" /></svg>
                        <span>Starts on {course.starting_date ? new Date(course.starting_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'TBA'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        <span className="truncate">Centre : {course.centre || 'Kolkata'}</span>
                    </div>
                </div>
                <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl md:text-2xl font-bold text-orange-500">₹{displayPrice.toLocaleString()}</span>
                        {hasDiscount && <span className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>}
                        {hasDiscount && <span className="ml-auto text-[10px] bg-green-600 px-1 py-0.5 rounded font-bold">{discount}% OFF</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={onExplore} className="py-1.5 rounded-lg border border-white text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-all">EXPLORE</button>
                        <button onClick={() => navigate('/buynow', { state: { courseData: course } })} className="py-1.5 rounded-lg bg-orange-500 text-white text-[10px] font-bold uppercase hover:bg-orange-600 transition-all">BUY NOW</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
