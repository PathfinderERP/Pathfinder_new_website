import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { customPagesAPI, coursesAPI, centresAPI } from "../services/api";
import {
  Calendar, Users, Target, TrendingUp, Trophy, Award,
  Star, GraduationCap, BookOpen, Laptop, MapPin, Clock,
  Check, Phone, Navigation, HelpCircle, Send, CheckCircle, ArrowRight, Map, Mail
} from "lucide-react";
import { toast } from "react-toastify";
import NotFound from "./Notfound/NotFound";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ContactFormCard from "../components/common/ContactFormCard";
import CourseDetailModal from "../components/CourseDetailModal";
import { getImageUrl } from "../utils/imageUtils";

// Simple mapping for dynamic icons used in Legacy & Features sections
const IconComponent = ({ name, className = "w-6 h-6" }) => {
  const iconMap = {
    Calendar, Users, Target, TrendingUp, Trophy, Award,
    Star, GraduationCap, BookOpen, Laptop, MapPin, Clock,
    Check, Phone, Navigation, HelpCircle, Send, CheckCircle
  };
  const SelectedIcon = iconMap[name] || HelpCircle;
  return <SelectedIcon className={className} />;
};

export default function CustomPageRenderer() {
  const { slug } = useParams();

  

  const [pageData, setPageData] = useState(null);
  const [allCentres, setAllCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const sliderRef = useRef(null);
  const centresSliderRef = useRef(null);
  const courseSliderRef = useRef(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Slider settings that respect current viewport (isMobile)
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    slidesToShow: isMobile ? 1 : 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 1, slidesToScroll: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  };

  const topperSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    slidesToShow: isMobile ? 1 : 3,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 1, slidesToScroll: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  };

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      setErrorStatus(null);
      try {
        const [pageResponse, centresResponse] = await Promise.all([
          customPagesAPI.getBySlug(slug),
          centresAPI.getAll().catch(() => ({ data: [] }))
        ]);
        setPageData(pageResponse.data);
        if (centresResponse && centresResponse.data) {
          setAllCentres(centresResponse.data);
        }
      } catch (err) {
        console.error("Error fetching custom page:", err);
        const status = err.response?.status || 500;
        setErrorStatus(status);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  // Set browser SEO metadata dynamically
  useEffect(() => {
    if (pageData) {
      document.title = pageData.meta_title || `${pageData.title} | Pathfinder Institute`;

      // Update meta tags if they exist
      const updateMetaTag = (name, content) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = name;
          document.getElementsByTagName('head')[0].appendChild(meta);
        }
        meta.content = content;
      };

      if (pageData.meta_description) updateMetaTag('description', pageData.meta_description);
      if (pageData.meta_keywords) updateMetaTag('keywords', pageData.meta_keywords);
    }
  }, [pageData]);

  // Scroll handler to go to Contact section smoothly
  const scrollToContact = () => {
    try {
      const el = document.getElementById('contact-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // fallback: navigate to hash so server-side routing can handle it
        window.location.hash = '#contact-section';
      }
    } catch (e) {
      console.warn('scrollToContact failed', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium animate-pulse">Loading landing page...</p>
        </div>
      </div>
    );
  }

  const handleFormChange = (e) => {
    // kept for potential future use
  };

  // Section configs
  const { hero, legacy, toppers, features, courses, centers, faq, contact } = pageData;

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden font-sans">

      {/* 1. HERO SECTION */}
      {hero && (
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={hero.bg_image_url || "https://images.pexels.com/photos/3985154/pexels-photo-3985154.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"}
              alt={hero.title_highlight || "Pathfinder Prep"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/80 to-transparent"></div>
          </div>

          <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10 text-white max-w-6xl py-12">
            <div className="max-w-2xl space-y-6">
              {/* Dynamic Badge */}
              <div className="inline-flex items-center bg-orange-900/30 text-orange-500 border border-orange-500/30 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider uppercase">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] mr-2"></div>
                {hero.badge_text || "Admissions Open 2026 - 27"}
              </div>

              {/* Dynamic Title & Highlight */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-white">
                {hero.title || "Born in Bengal."} <br />
                {hero.title_highlight && (
                  <span className="text-orange-500">
                    {hero.title_highlight}
                  </span>
                )}
              </h1>

              <p className="text-lg text-gray-300 max-w-xl">
                {hero.description || "Top-tier mentorship, comprehensive test patterns, and premium doubt-solving setups for outstanding competitive results."}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={scrollToContact}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-orange-900/30 text-base"
                >
                  {hero.primary_btn_text || "Apply Now"} <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollToContact}
                  className="bg-transparent hover:bg-white/10 border border-gray-400 text-white px-8 py-4 rounded-xl font-bold transition-all text-base"
                >
                  {hero.secondary_btn_text || "Book Counselling"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. LEGACY TIMELINE SECTION */}
      {legacy && legacy.milestones && legacy.milestones.length > 0 && (
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-orange-500 font-bold text-sm lg:text-base uppercase tracking-wider block mb-2">Our Journey</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{legacy.title || "35 Years of Excellence"}</h2>
              <p className="text-gray-500 text-base lg:text-lg max-w-2xl mx-auto">
                {legacy.subtitle || "From humble beginnings in 1991 to becoming Eastern India's most trusted NEET coaching institute"}
              </p>
            </div>

            {legacy.milestones.length > 4 ? (
              <div className="legacy-carousel -mx-4 px-4 pb-12">
                <Slider {...sliderSettings}>
                  {legacy.milestones.map((item, index) => (
                    <div key={index} className="px-3 h-full pb-4 pt-2">
                      <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group h-full">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 lg:mb-8 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                          <IconComponent name={item.icon || "Calendar"} className="w-7 h-7 lg:w-8 lg:h-8" />
                        </div>
                        <div className="text-orange-600 font-bold text-2xl lg:text-3xl mb-2">{item.year}</div>
                        <h3 className="font-bold text-gray-900 text-lg lg:text-xl mb-2 lg:mb-3">{item.title}</h3>
                        <p className="text-gray-500 text-sm lg:text-base leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {legacy.milestones.map((item, index) => (
                  <div key={index} className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group h-full">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 lg:mb-8 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                      <IconComponent name={item.icon || "Calendar"} className="w-7 h-7 lg:w-8 lg:h-8" />
                    </div>
                    <div className="text-orange-600 font-bold text-2xl lg:text-3xl mb-2">{item.year}</div>
                    <h3 className="font-bold text-gray-900 text-lg lg:text-xl mb-2 lg:mb-3">{item.title}</h3>
                    <p className="text-gray-500 text-sm lg:text-base leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. TOPPERS SPOTLIGHT SECTION */}
      {toppers && toppers.toppers_list && toppers.toppers_list.length > 0 && (() => {
        const fallbackImages = [
          "/images/homepagecarousal_images/rupayan pal.webp",
          "/images/homepagecarousal_images/devdutta majhi.webp",
          "/images/homepagecarousal_images/Adrita Mahata.webp",
          "/images/homepagecarousal_images/Adrita Sarkar.webp",
          "/images/homepagecarousal_images/Chandrachur Sen.webp",
          "/images/homepagecarousal_images/Pranami halder.webp"
        ];

        return (
          <section className="py-12 bg-gradient-to-b from-[#fbf8f3] via-[#f7f0e4] to-[#fbf8f3] text-slate-900 relative overflow-hidden border-y border-[#eddcc4]">
            {/* Subtle light radial gradient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-[130px] pointer-events-none" />

            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, #cbd5e1 1.5px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <div className="container mx-auto px-6 max-w-6xl relative z-10">
              {(() => {
                const useTopperCarousel = toppers.toppers_list.length > 3 || (isMobile && toppers.toppers_list.length > 1);
                const dynamicTopperSliderSettings = {
                  ...topperSliderSettings,
                  infinite: toppers.toppers_list.length > 1,
                  slidesToShow: isMobile ? 1 : Math.min(3, toppers.toppers_list.length),
                  responsive: [
                    { breakpoint: 1024, settings: { slidesToShow: 1, slidesToScroll: 1 } },
                    { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } }
                  ]
                };

                return (
                  <>
                    {/* Header with Custom Manual Slider Navigation Buttons */}
                    <div className="flex flex-row items-center justify-between mb-10">
                      <div className="text-left">
                        <span className="text-orange-600 font-bold text-sm uppercase tracking-wider block mb-2">Top Performers</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{toppers.title || "Pathfinder Achievers"}</h2>
                        <div className="h-1.5 w-20 bg-orange-500 mt-3 rounded-full"></div>
                      </div>

                      {useTopperCarousel && (
                        <div className="flex gap-3 items-center mt-0">
                          <button
                            onClick={() => sliderRef.current?.slickPrev()}
                            className="w-11 h-11 rounded-full border border-[#f5e6d3] bg-white text-orange-600 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm hover:shadow-md hover:border-orange-500 active:scale-95 duration-200"
                            aria-label="Previous Slide"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                          </button>
                          <button
                            onClick={() => sliderRef.current?.slickNext()}
                            className="w-11 h-11 rounded-full border border-[#f5e6d3] bg-white text-orange-600 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm hover:shadow-md hover:border-orange-500 active:scale-95 duration-200"
                            aria-label="Next Slide"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {useTopperCarousel ? (
                      <div className="toppers-carousel -mx-4 px-4 pb-4">
                        <Slider ref={sliderRef} {...dynamicTopperSliderSettings}>
                          {toppers.toppers_list.map((topper, index) => (
                            <div key={index} className="px-3 h-full pb-4 pt-2">
                              <div className="bg-white border border-[#f5e6d3] rounded-[2rem] overflow-hidden hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-500 flex flex-col group h-full shadow-sm shadow-[#f7ebd9]/40">
                                <div className="aspect-[4/5] bg-gradient-to-b from-[#fdfcfb] to-[#f7eedc] relative overflow-hidden flex items-end justify-center border-b border-[#f5e6d3]/60">
                                  <img
                                    src={getImageUrl(topper.image_url)}
                                    alt={topper.name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = getImageUrl(fallbackImages[index % fallbackImages.length]);
                                    }}
                                    className="object-contain h-[92%] w-auto max-w-[92%] group-hover:scale-105 transition-transform duration-700 ease-out z-10"
                                  />
                                  <div className="absolute top-4 left-4 bg-orange-600 text-white text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full font-extrabold shadow-sm tracking-wider uppercase z-20">
                                    {topper.exam || "NEET"}
                                  </div>
                                  <div className="absolute w-44 h-44 rounded-full bg-white/40 blur-xl -bottom-10 left-1/2 -translate-x-1/2 pointer-events-none z-0" />
                                </div>
                                <div className="p-6 text-center space-y-3 bg-white flex flex-col items-center justify-between flex-grow">
                                  <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-orange-600 transition-colors duration-300">{topper.name}</h3>
                                  <p className="text-slate-500 text-sm font-semibold">{topper.score}</p>
                                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 text-sm font-extrabold transition-all group-hover:shadow-lg group-hover:shadow-orange-500/30">
                                    <Trophy className="w-4 h-4 text-white animate-pulse" /> {topper.rank}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </Slider>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {toppers.toppers_list.map((topper, index) => (
                          <div key={index}>
                            <div className="bg-white border border-[#f5e6d3] rounded-[2rem] overflow-hidden hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-500 flex flex-col group h-full shadow-sm shadow-[#f7ebd9]/40">
                              <div className="aspect-[4/5] bg-gradient-to-b from-[#fdfcfb] to-[#f7eedc] relative overflow-hidden flex items-end justify-center border-b border-[#f5e6d3]/60">
                                <img
                                  src={getImageUrl(topper.image_url)}
                                  alt={topper.name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = getImageUrl(fallbackImages[index % fallbackImages.length]);
                                  }}
                                  className="object-contain h-[92%] w-auto max-w-[92%] group-hover:scale-105 transition-transform duration-700 ease-out z-10"
                                />
                                <div className="absolute top-4 left-4 bg-orange-600 text-white text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full font-extrabold shadow-sm tracking-wider uppercase z-20">
                                  {topper.exam || "NEET"}
                                </div>
                                <div className="absolute w-44 h-44 rounded-full bg-white/40 blur-xl -bottom-10 left-1/2 -translate-x-1/2 pointer-events-none z-0" />
                              </div>
                              <div className="p-6 text-center space-y-3 bg-white flex flex-col items-center justify-between flex-grow">
                                <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-orange-600 transition-colors duration-300">{topper.name}</h3>
                                <p className="text-slate-500 text-sm font-semibold">{topper.score}</p>
                                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 text-sm font-extrabold transition-all group-hover:shadow-lg group-hover:shadow-orange-500/30">
                                  <Trophy className="w-4 h-4 text-white animate-pulse" /> {topper.rank}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </section>
        );
      })()}

      {/* 4. FEATURES / WHY CHOOSE US SECTION */}
      {features && features.features_list && features.features_list.length > 0 && (
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-orange-600 font-bold text-sm uppercase tracking-wider block mb-2">Our Pillars</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{features.title || "Why Choose Pathfinder?"}</h2>
              <div className="h-1.5 w-20 bg-orange-600 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.features_list.map((feat, index) => (
                <div key={index} className="flex gap-6 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-orange-50/30 transition-all duration-300">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <IconComponent name={feat.icon || "GraduationCap"} className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 text-xl">{feat.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. COURSES PROGRAMS SECTION */}
      {courses && (
        <>
          {/* Dynamic courses from real catalog — shown when admin selected course IDs */}
          {courses.course_ids && courses.course_ids.length > 0 && (
            <CoursesDisplaySection
              courseIds={courses.course_ids}
              title={courses.title}
              onEnquire={scrollToContact}
            />
          )}

          {/* Fallback: manually entered courses (backward compatibility) */}
          {(!courses.course_ids || courses.course_ids.length === 0) && courses.courses_list && courses.courses_list.length > 0 && (
            <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
              <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <span className="text-orange-600 font-bold text-sm uppercase tracking-wider block mb-2">Target Programs</span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{courses.title || "Choose Your Program"}</h2>
                  <div className="h-1.5 w-20 bg-orange-600 mx-auto mt-4 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {courses.courses_list.map((course, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:border-orange-600">
                      <div className="space-y-6">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-bold text-gray-900 text-2xl leading-tight mb-2">{course.name}</h3>
                            <div className="inline-block bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full font-semibold">Target: {course.target}</div>
                          </div>
                          <div className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0">{course.duration}</div>
                        </div>
                        <div className="border-t border-gray-100 pt-6 space-y-3.5">
                          <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Key Highlights</h4>
                          <ul className="space-y-3">
                            {course.features && course.features.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-gray-600 text-sm">
                                <Check className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <button onClick={scrollToContact} className="mt-8 w-full bg-gray-900 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                        Enquire Now <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* 6. CENTERS SECTION */}
      {centers && centers.centers_list && centers.centers_list.length > 0 && (() => {
        // Enrich stored center list with fresh live data from the DB (email, mobile, map_url etc.)
        const centresList = centers.centers_list.map(savedCenter => {
          const live = allCentres.find(
            c => c.id === savedCenter.id || c.centre === savedCenter.name
          );
          return live
            ? {
                ...savedCenter,
                email: live.email || savedCenter.email || "",
                mobile: live.mobile || savedCenter.mobile || savedCenter.phone || "",
                phone: live.mobile || live.phone || savedCenter.phone || "",
                map_url: live.map_url || savedCenter.map_url || "",
                location: savedCenter.location || live.location || "",
              }
            : savedCenter;
        });
        const useCarousel = centresList.length > 3 || (isMobile && centresList.length > 1);

        // Reusable card renderer
        const renderCentreCard = (center, index) => {
          const isFranchise = center.is_franchise || false;
          const centreType = center.centre_type || "General";
          const toppersCount = center.toppers?.length || 0;
          const logoUrl = center.logo_url || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=200&auto=format&fit=crop";
          const districtStr = center.district || "Kolkata";
          const stateStr = center.state || "West Bengal";
          const addressStr = center.address || "Address details currently being updated for this location.";
          
          const handleExplore = () => {
            if (center.id) navigate(`/centres/${center.id}`);
            else scrollToContact();
          };

          // Robust map link extractor helper (handles direct links and converts embed iframe URLs to clickable search links)
          const getMapLink = (locationVal, mapUrlVal) => {
            let val = locationVal || mapUrlVal || "";
            if (!val) return "";
            
            // Extract src from iframe if present
            if (val.includes("<iframe") || val.includes("iframe")) {
              const match = val.match(/src="([^"]+)"/);
              if (match && match[1]) {
                val = match[1];
              }
            }

            // If it is a Google Maps embed URL, convert it to a standard clickable link
            if (val.includes("/maps/embed") || val.includes("google.com/maps/embed")) {
              // 1. Try to extract lat/lng from pb parameter protobuf: !2d[lng]!3d[lat]
              const latMatch = val.match(/!3d(-?\d+\.\d+)/);
              const lngMatch = val.match(/!2d(-?\d+\.\d+)/);
              if (latMatch && lngMatch) {
                return `https://www.google.com/maps?q=${latMatch[1]},${lngMatch[1]}`;
              }

              // 2. Try to extract standard query parameter q
              try {
                const urlObj = new URL(val);
                const q = urlObj.searchParams.get("q");
                if (q) {
                  return `https://www.google.com/maps?q=${encodeURIComponent(q)}`;
                }
              } catch (e) {
                // Ignore parse errors and keep moving
              }
            }

            return val;
          };
          
          const mapLink = getMapLink(center.location, center.map_url);

          return (
            <div key={index} className="group relative bg-white rounded-3xl border border-slate-100 p-5 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col justify-between min-h-[340px] w-full">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-orange-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl" />
              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-neutral-100 border border-slate-100 flex items-center justify-center overflow-hidden group-hover:border-orange-200 transition-colors duration-300 shadow-sm shrink-0">
                      <img src={logoUrl} alt={center.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=200&auto=format&fit=crop"; }} />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${centreType === 'Instation' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}`}>{centreType}</span>
                      {isFranchise && <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">Franchise</span>}
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-bold text-amber-700">4.9</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-orange-600 transition-colors duration-300">{center.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Map className="w-3.5 h-3.5" />{districtStr}, {stateStr}
                    </p>
                  </div>
                  
                  {/* Stats & Info Row */}
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 group-hover:bg-white group-hover:border-orange-100 transition-all duration-300">
                        <div className="text-xs font-bold text-slate-500 mb-1">Toppers</div>
                        <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-orange-500" /><span className="text-sm font-black text-slate-900">{toppersCount}+</span></div>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 group-hover:bg-white group-hover:border-orange-100 transition-all duration-300">
                        <div className="text-xs font-bold text-slate-500 mb-1">Contact</div>
                        <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-400" /><span className="text-sm font-black text-slate-900 truncate">{center.mobile || center.phone || "Local"}</span></div>
                      </div>
                    </div>
                    
                    {center.email && (
                      <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 group-hover:bg-white group-hover:border-orange-100 transition-all duration-300 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 truncate" title={center.email}>{center.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-600 font-medium mb-6 line-clamp-2 min-h-[36px]">{addressStr}</p>
                </div>
                <div className="flex items-center gap-3 mt-auto">
                  <button onClick={handleExplore} className="flex-1 bg-orange-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-orange-700 transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                    Explore Centre <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  {mapLink ? (
                    <a href={mapLink} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-white hover:border-orange-200 group/map transition-all duration-300" title="Open in Maps">
                      <Map className="w-5 h-5 text-slate-400 group-hover/map:text-orange-500 transition-colors" />
                    </a>
                  ) : (
                    <button onClick={scrollToContact} className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-white hover:border-orange-200 group/map transition-all duration-300" title="Get Directions">
                      <Map className="w-5 h-5 text-slate-400 group-hover/map:text-orange-500 transition-colors" />
                    </button>
                  )}
                </div>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-orange-500 transition-all duration-500 group-hover:w-full" />
            </div>
          );
        };

        return (
          <section className="pt-10 pb-2 bg-white relative">
            <div className="container mx-auto px-6 max-w-6xl">
              {/* Section Header */}
              <div className="flex items-end justify-between max-w-3xl mx-auto mb-16 flex-col text-center gap-4">
                <div className="w-full text-center">
                  <span className="text-orange-600 font-bold text-sm uppercase tracking-wider block mb-2">Visit Centers</span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{centers.title || "Coaching Locations"}</h2>
                  <div className="h-1.5 w-20 bg-orange-600 mx-auto mt-4 rounded-full"></div>
                </div>
                {/* Carousel nav buttons — only shown when carousel mode */}
                {useCarousel && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => centresSliderRef.current?.slickPrev()}
                      className="w-11 h-11 rounded-2xl bg-white border-2 border-orange-200 flex items-center justify-center hover:bg-orange-600 hover:border-orange-600 text-orange-600 hover:text-white transition-all duration-300 shadow-sm group/arrow"
                      aria-label="Previous centres"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{centresList.length} Centres</span>
                    <button
                      onClick={() => centresSliderRef.current?.slickNext()}
                      className="w-11 h-11 rounded-2xl bg-white border-2 border-orange-200 flex items-center justify-center hover:bg-orange-600 hover:border-orange-600 text-orange-600 hover:text-white transition-all duration-300 shadow-sm group/arrow"
                      aria-label="Next centres"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                )}
              </div>

              {/* ≤ 3 → 3-column grid */}
              {!useCarousel && (
                <div className={`grid grid-cols-1 gap-8 ${centresList.length === 1 ? 'md:grid-cols-1 max-w-sm mx-auto'
                  : centresList.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto'
                    : 'md:grid-cols-3'
                  }`}>
                  {centresList.map((center, index) => renderCentreCard(center, index))}
                </div>
              )}

              {/* > 3 → react-slick carousel */}
              {useCarousel && (
                <div className="-mx-3">
                  {/* Mobile manual controls for centres */}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 md:hidden">
                    <button onClick={() => centresSliderRef.current?.slickPrev()} aria-label="Previous centre" className="w-10 h-10 rounded-full bg-white border border-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 md:hidden">
                    <button onClick={() => centresSliderRef.current?.slickNext()} aria-label="Next centre" className="w-10 h-10 rounded-full bg-white border border-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                  <Slider
                        ref={centresSliderRef}
                    dots={true}
                    infinite={centresList.length > 1}
                    speed={500}
                    autoplay={false}
                    slidesToShow={isMobile ? 1 : Math.min(3, centresList.length)}
                    slidesToScroll={1}
                    arrows={false}
                    dotsClass="slick-dots !bottom-[-36px]"
                    responsive={[
                      { breakpoint: 1024, settings: { slidesToShow: 1, slidesToScroll: 1 } },
                      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } }
                    ]}
                  >
                    {centresList.map((center, index) => (
                      <div key={index} className="px-3 py-4">
                        {renderCentreCard(center, index)}
                      </div>
                    ))}
                  </Slider>
                  {/* Extra bottom padding to make room for dots */}
                  <div className="pb-12" />
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* 7. FAQ SECTION */}
      {faq && faq.faqs_list && faq.faqs_list.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="text-center mb-16">
              <span className="text-orange-600 font-bold text-sm uppercase tracking-wider block mb-2">FAQ</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{faq.title || "Got Questions?"}</h2>
              <div className="h-1.5 w-20 bg-orange-600 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="space-y-4">
              {faq.faqs_list.map((item, index) => (
                <details key={index} className="bg-white border border-gray-100 rounded-2xl p-6 group shadow-sm transition-all [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between font-bold text-gray-900 cursor-pointer list-none select-none text-lg">
                    <span>{item.question}</span>
                    <span className="transition group-open:rotate-180 text-orange-600">
                      <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed text-sm border-t border-gray-50 pt-4">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. CONTACT FORM — uses the exact same form as the /contact page */}
      {contact && (
        <section id="contact-section" className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* Left: Info */}
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                    {contact.title || "Get in "}<span className="text-orange-600">Touch</span>
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Fill in the form and our expert counsellors will reach out to you within 24 hours.
                  </p>
                </div>

                {[
                  { icon: Users, title: "1-on-1 Guidance", desc: "Personal session with our senior expert advisors" },
                  { icon: TrendingUp, title: "Preparation Blueprint", desc: "Customised study plan targeting your weak areas" },
                  { icon: Target, title: "Score Prediction", desc: "AI-backed rank & score estimate before the exam" },
                  { icon: BookOpen, title: "Free Study Material", desc: "Complimentary chapter notes sent after counselling" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start bg-white rounded-2xl p-5 shadow-sm border border-orange-100 hover:shadow-md transition-all">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}

                <div className="bg-orange-600 text-white rounded-2xl p-5 text-center">
                  <div className="text-3xl font-black">35+</div>
                  <div className="text-sm font-semibold opacity-90">Years of Trusted Excellence</div>
                  <div className="mt-2 text-xs opacity-75">Serving Eastern India since 1991</div>
                </div>
              </div>

              {/* Right: Exact same form card as /contact page */}
              <div className="w-full">
                <ContactFormCard />
              </div>

            </div>
          </div>
        </section>
      )}

    </div>
  );
}

/* ============================================================
 * CoursesDisplaySection
 * Fetches courses by their IDs and renders them with the same
 * live filter bar (Centre / Programme / Mode) and CourseDetailModal
 * as the main Courses pages.
 * ============================================================ */
function CoursesDisplaySection({ courseIds, title, onEnquire }) {
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState("All");
  const [selectedProgramme, setSelectedProgramme] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Grid layout vs slider layout toggle
  const [showAll, setShowAll] = useState(false);

  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 1024);
  const courseSliderRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch all courses and filter to the selected IDs
  useEffect(() => {
    if (!courseIds || courseIds.length === 0) return;
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await coursesAPI.getAll();
        const data = Array.isArray(res.data) ? res.data : [];
        // Keep only admin-selected courses robustly
        setAllCourses(data.filter(c => {
          const cId = c.id || c._id?.$oid || c._id;
          return courseIds.map(String).includes(String(cId));
        }));
      } catch (err) {
        console.error("CoursesDisplaySection: failed to load courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [courseIds]);

  // Cascading filter computations (identical logic to AllIndia.jsx)
  const uniqueCentres = useMemo(() => {
    const s = new Set(allCourses.map(c => c.centre).filter(Boolean));
    return ["All", ...[...s].sort()];
  }, [allCourses]);

  const centreFiltered = useMemo(() =>
    selectedCentre === "All" ? allCourses : allCourses.filter(c => c.centre === selectedCentre),
    [allCourses, selectedCentre]
  );

  const uniqueProgrammes = useMemo(() => {
    const s = new Set(centreFiltered.map(c => c.programme).filter(Boolean));
    return ["All", ...[...s].sort()];
  }, [centreFiltered]);

  const progFiltered = useMemo(() =>
    selectedProgramme === "All" ? centreFiltered : centreFiltered.filter(c => c.programme === selectedProgramme),
    [centreFiltered, selectedProgramme]
  );

  const uniqueModes = useMemo(() => {
    const s = new Set(progFiltered.map(c => c.mode).filter(Boolean));
    return ["All", ...[...s].sort()];
  }, [progFiltered]);

  const displayCourses = useMemo(() =>
    selectedMode === "All" ? progFiltered : progFiltered.filter(c => c.mode === selectedMode),
    [progFiltered, selectedMode]
  );

  // Reset dependent filter when parent changes
  useEffect(() => {
    if (!uniqueProgrammes.includes(selectedProgramme)) setSelectedProgramme("All");
  }, [uniqueProgrammes, selectedProgramme]);
  useEffect(() => {
    if (!uniqueModes.includes(selectedMode)) setSelectedMode("All");
  }, [uniqueModes, selectedMode]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-orange-50/40 to-white">
        <div className="container mx-auto px-6 max-w-6xl text-center py-16">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4 text-sm font-medium animate-pulse">Loading courses...</p>
        </div>
      </section>
    );
  }

  if (allCourses.length === 0) return null;

  const hasFilters = uniqueCentres.length > 1 || uniqueProgrammes.length > 1 || uniqueModes.length > 1;

  // React Slick slider settings
  const sliderSettings = {
    dots: true,
    infinite: displayCourses.length > 1,
    speed: 500,
    slidesToShow: Math.min(3, displayCourses.length),
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: displayCourses.length > 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: displayCourses.length > 1,
        }
      }
    ]
  };

  const handleExplore = (course) => {
    setSelectedCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleBuy = (course) => {
    navigate("/buynow", { state: { courseData: course } });
  };

  return (
    <section className="py-16 bg-gradient-to-b from-orange-50/30 to-white relative overflow-hidden">
      {/* Subtle background blobs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 max-w-7xl mx-auto px-4 gap-4">
          <div className="text-left">
            <span className="text-orange-600 font-bold text-sm uppercase tracking-widest block mb-2">Target Programs</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{title || "Choose Your Program"}</h2>
            <div className="h-1.5 w-20 bg-gradient-to-r from-orange-500 to-amber-500 mt-4 rounded-full" />
          </div>
          {displayCourses.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5 whitespace-nowrap self-start md:self-center"
            >
              {showAll ? "Show Slider" : `View All (${displayCourses.length})`}
            </button>
          )}
        </div>

        {/* Filter Bar — same style as AllIndia/Boards/Foundation pages */}
        {hasFilters && (
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-8 shadow-xl border border-orange-400/50">
            <div className="flex flex-wrap gap-4 sm:gap-6">

              {/* Centre filter */}
              {uniqueCentres.length > 1 && (
                <div className="flex-1 min-w-[130px] space-y-1.5">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-orange-50 uppercase tracking-widest">Centre</label>
                  <div className="relative">
                    <select
                      value={selectedCentre}
                      onChange={e => setSelectedCentre(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-none bg-white/95 text-slate-800 text-xs sm:text-sm font-semibold focus:ring-4 focus:ring-white/20 outline-none appearance-none shadow-sm"
                    >
                      {uniqueCentres.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Programme filter */}
              {uniqueProgrammes.length > 1 && (
                <div className="flex-1 min-w-[130px] space-y-1.5">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-orange-50 uppercase tracking-widest">Programme</label>
                  <div className="relative">
                    <select
                      value={selectedProgramme}
                      onChange={e => setSelectedProgramme(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-none bg-white/95 text-slate-800 text-xs sm:text-sm font-semibold focus:ring-4 focus:ring-white/20 outline-none appearance-none shadow-sm"
                    >
                      {uniqueProgrammes.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode filter (pill buttons) */}
              {uniqueModes.length > 1 && (
                <div className="flex-1 min-w-[200px] space-y-1.5">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-orange-50 uppercase tracking-widest">Mode</label>
                  <div className="flex flex-wrap gap-2">
                    {uniqueModes.map(mode => (
                      <button
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap uppercase tracking-wider ${selectedMode === mode
                          ? "bg-white text-orange-600 shadow-lg scale-105"
                          : "bg-orange-400/30 text-white border border-white/20 hover:bg-white/10"
                          }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active filter pills + count */}
            <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex flex-wrap gap-2">
                {selectedCentre !== "All" && (
                  <span className="px-3 py-1.5 bg-white/90 border border-white rounded-lg flex items-center gap-1 text-orange-700 text-xs font-medium">
                    Centre: {selectedCentre}
                    <button onClick={() => setSelectedCentre("All")} className="ml-1 hover:text-red-600 text-base leading-none">×</button>
                  </span>
                )}
                {selectedProgramme !== "All" && (
                  <span className="px-3 py-1.5 bg-white/90 border border-white rounded-lg flex items-center gap-1 text-orange-700 text-xs font-medium">
                    {selectedProgramme}
                    <button onClick={() => setSelectedProgramme("All")} className="ml-1 hover:text-red-600 text-base leading-none">×</button>
                  </span>
                )}
                {selectedMode !== "All" && (
                  <span className="px-3 py-1.5 bg-white/90 border border-white rounded-lg flex items-center gap-1 text-orange-700 text-xs font-medium">
                    {selectedMode}
                    <button onClick={() => setSelectedMode("All")} className="ml-1 hover:text-red-600 text-base leading-none">×</button>
                  </span>
                )}
              </div>
              <span className="text-orange-100/80 text-xs font-medium">
                Showing {displayCourses.length} of {allCourses.length} course{allCourses.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Custom Slick Carousel styles */}
        <style>
          {`
            .courses-slider-container .slick-slide {
              padding: 0 12px;
            }
            .courses-slider-container .slick-list {
              margin: 0 -12px;
            }
            .courses-slider-container .slick-dots li button:before {
              font-size: 8px;
              color: #cbd5e1;
              opacity: 0.5;
            }
            .courses-slider-container .slick-dots li.slick-active button:before {
              color: #f97316;
              opacity: 1;
            }
          `}
        </style>

        {/* Course Cards Grid/Slider */}
        {displayCourses.length > 0 ? (
          (!showAll && (displayCourses.length > 3 || (isMobile && displayCourses.length > 1))) ? (
            <div className="courses-slider-container pb-6 relative">
              {/* Mobile manual controls */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 md:hidden">
                <button onClick={() => courseSliderRef.current?.slickPrev()} aria-label="Previous course" className="w-10 h-10 rounded-full bg-white border border-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 md:hidden">
                <button onClick={() => courseSliderRef.current?.slickNext()} aria-label="Next course" className="w-10 h-10 rounded-full bg-white border border-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <Slider
                ref={courseSliderRef}
                key={`courses-slider-${isMobile ? 'm' : 'd'}-${displayCourses.length}`}
                {...sliderSettings}
                slidesToShow={isMobile ? 1 : Math.min(4, displayCourses.length)}
                variableWidth={false}
                centerMode={false}
                adaptiveHeight={true}
              >
                {displayCourses.map((course) => (
                  <div key={course.id || course._id?.$oid || course._id} className="h-full py-2">
                    <CourseCard course={course} onExplore={handleExplore} onEnquire={onEnquire} />
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCourses.map((course) => (
                <CourseCard
                  key={course.id || course._id?.$oid || course._id}
                  course={course}
                  onExplore={handleExplore}
                  onEnquire={onEnquire}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-gray-600 font-semibold">No courses match the selected filters.</p>
            <button
              onClick={() => { setSelectedCentre("All"); setSelectedProgramme("All"); setSelectedMode("All"); }}
              className="mt-3 text-sm text-orange-600 font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* CourseDetailModal — identical to the one used on Courses pages */}
      <CourseDetailModal
        course={selectedCourse}
        isOpen={isCourseModalOpen}
        onClose={() => { setIsCourseModalOpen(false); setSelectedCourse(null); }}
      />
    </section>
  );
}

/* ============================================================
 * CourseCard Sub-component
 * Premium course card styled identically to the home page card.
 * ============================================================ */
function CourseCard({ course, onExplore, onEnquire }) {
  // Format class level to add "Class" prefix if it's only digits
  const formatClassLevel = (level) => {
    if (!level) return "Not specified";
    if (/^\d+$/.test(level.toString().trim())) {
      return `Class ${level}`;
    }
    return level;
  };

  // Pricing calculations
  const price = parseFloat(course.course_price || 0);
  const discounted = parseFloat(course.discounted_price || 0);
  const offer = parseFloat(course.offers || 0);

  let displayPrice = price;
  let originalPrice = 0;
  let discountLabel = 0;

  // Priority 1: Plans - Find lowest price
  if (course.plans && course.plans.length > 0) {
    const planPrices = course.plans.map(p => parseFloat(p.discounted_price || p.base_price || 0)).filter(p => p > 0);
    if (planPrices.length > 0) displayPrice = Math.min(...planPrices);

    const matchingPlan = course.plans.find(p => parseFloat(p.discounted_price || p.base_price) === displayPrice);
    if (matchingPlan && parseFloat(matchingPlan.base_price) > displayPrice) {
      originalPrice = parseFloat(matchingPlan.base_price);
      discountLabel = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
    }
  }
  // Priority 2: Direct Discount
  else if (discounted > 0 && discounted < price) {
    displayPrice = discounted;
    originalPrice = price;
    discountLabel = Math.round(((price - discounted) / price) * 100);
  }
  // Priority 3: Offers Percentage
  else if (offer > 0) {
    originalPrice = price;
    displayPrice = price - (price * (offer / 100));
    discountLabel = Math.round(offer);
  }

  const startDateValue = course.start_date || course.starting_date;
  const formattedDate = startDateValue
    ? new Date(startDateValue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : "Coming Soon";

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 relative flex flex-col group h-full">
      {/* Mode Ribbon */}
      <div className="absolute top-0 left-0 z-10">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-br-xl shadow-md uppercase tracking-wide">
          {course.mode || "Online"}
        </div>
      </div>

      {/* Banner Image */}
      <div className="h-40 bg-slate-105 relative overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={getImageUrl(course.thumbnail_url)}
            alt={course.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
            <div className="text-center p-4">
              <h4 className="text-orange-900/20 font-black text-3xl uppercase leading-none">
                {course.name?.split(" ")[0] || "COURSE"}
              </h4>
              <p className="text-orange-900/10 font-bold text-sm mt-1">
                PATHFINDER
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Course Title if available */}
        {course.course_title && (
          <div className="text-orange-600 text-[10px] font-black uppercase tracking-widest mb-2 border-b border-orange-100 pb-1.5 text-left">
            {course.course_title}
          </div>
        )}

        {/* Title Row */}
        <div className="flex items-start justify-between gap-2 mb-3 text-left">
          <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-[#66090D] transition-colors line-clamp-2">
            {course.name}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-650 text-[10px] font-bold uppercase rounded border border-slate-200">
              {course.language || "English"}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4 text-left">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Users className="w-4 h-4 text-slate-400" />
            <span>For {formatClassLevel(course.class_level)} Aspirants</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Starts on {formattedDate}</span>
          </div>
        </div>

        {/* Plans Strip */}
        <div className="mt-auto mb-4 bg-amber-50 rounded-lg border border-amber-100 p-2 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">More plans inside</span>
          <div className="flex gap-1">
            <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">
              Infinity Pro
            </span>
            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
              Infinity
            </span>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-end gap-2 mb-4 text-left">
          <div className="text-2xl font-bold text-[#66090D] leading-none">
            ₹{Math.round(displayPrice).toLocaleString()}
          </div>
          {originalPrice > displayPrice && (
            <div className="text-sm text-slate-400 line-through mb-0.5">
              ₹{Math.round(originalPrice).toLocaleString()}
            </div>
          )}
          {discountLabel > 0 && (
            <div className="ml-auto bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {discountLabel}% OFF
            </div>
          )}
        </div>
        <div className="text-[10px] text-slate-500 font-medium -mt-3 mb-4 uppercase tracking-wide text-left">
          (FOR FULL BATCH)
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onExplore(course)}
            className="py-2.5 rounded-xl border-2 border-[#66090D] text-[#66090D] font-bold text-sm hover:bg-orange-50 transition-all duration-200 uppercase tracking-wide"
          >
            Explore
          </button>
          <button
            onClick={onEnquire}
            className="py-2.5 rounded-xl bg-[#66090D] text-white font-bold text-sm hover:bg-[#55080b] transition-all duration-200 shadow-md hover:shadow-lg uppercase tracking-wide font-sans text-[13px] tracking-tight whitespace-nowrap"
          >
            Enquire Now
          </button>
        </div>
      </div>
    </div>
  );
}
