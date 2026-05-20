import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { customPagesAPI, landingAPI } from "../services/api";
import { 
  Calendar, Users, Target, TrendingUp, Trophy, Award, 
  Star, GraduationCap, BookOpen, Laptop, MapPin, Clock, 
  Check, Phone, Navigation, HelpCircle, Send, CheckCircle, ArrowRight
} from "lucide-react";
import { toast } from "react-toastify";
import NotFound from "./Notfound/NotFound";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
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
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  };

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null); // null, 404, 403, 500

  // Contact Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    center: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      setErrorStatus(null);
      try {
        const response = await customPagesAPI.getBySlug(slug);
        setPageData(response.data);
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

  // If page not found, render standard premium 404
  if (errorStatus === 404 || errorStatus === 403 || !pageData) {
    return <NotFound />;
  }

  // Scroll handler to go to Contact section smoothly
  const scrollToContact = () => {
    const element = document.querySelector("#contact-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Name and Phone Number are required!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Register lead using the standard landing page lead API
      await landingAPI.register({
        ...formData,
        campaign: `Landing Page: ${pageData.title} (${pageData.slug})`,
        source: window.location.href
      });
      setSubmitSuccess(true);
      toast.success("Counselling session booked successfully!");
    } catch (err) {
      console.error("Lead submission error:", err);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                {hero.title || "Born in Bengal."} <br/>
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
      {toppers && toppers.toppers_list && toppers.toppers_list.length > 0 && (
        <section className="py-24 bg-gray-950 text-white relative">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-orange-400 font-bold text-sm uppercase tracking-wider block mb-2">Top Performers</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">{toppers.title || "Pathfinder Achievers"}</h2>
              <div className="h-1.5 w-20 bg-orange-500 mx-auto mt-4 rounded-full"></div>
            </div>

            {toppers.toppers_list.length > 3 ? (
              <div className="toppers-carousel -mx-4 px-4 pb-12">
                <Slider {...topperSliderSettings}>
                  {toppers.toppers_list.map((topper, index) => (
                    <div key={index} className="px-3 h-full pb-4 pt-2">
                      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden hover:border-orange-500/50 transition-all flex flex-col group h-full">
                        <div className="aspect-[4/5] bg-gray-800 relative overflow-hidden flex items-end justify-center">
                          <img 
                            src={topper.image_url || "/images/spotlight/1.png"} 
                            alt={topper.name}
                            className="object-cover h-[85%] w-auto group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                            {topper.exam || "NEET"}
                          </div>
                        </div>
                        <div className="p-6 text-center space-y-2">
                          <h3 className="font-extrabold text-xl">{topper.name}</h3>
                          <p className="text-gray-400 text-sm">{topper.score}</p>
                          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-950 text-orange-400 border border-orange-500/30 text-sm font-bold">
                            <Trophy className="w-4 h-4" /> {topper.rank}
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
                  <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden hover:border-orange-500/50 transition-all flex flex-col group h-full">
                    <div className="aspect-[4/5] bg-gray-800 relative overflow-hidden flex items-end justify-center">
                      <img 
                        src={topper.image_url || "/images/spotlight/1.png"} 
                        alt={topper.name}
                        className="object-cover h-[85%] w-auto group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                        {topper.exam || "NEET"}
                      </div>
                    </div>
                    <div className="p-6 text-center space-y-2">
                      <h3 className="font-extrabold text-xl">{topper.name}</h3>
                      <p className="text-gray-400 text-sm">{topper.score}</p>
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-950 text-orange-400 border border-orange-500/30 text-sm font-bold">
                        <Trophy className="w-4 h-4" /> {topper.rank}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

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
      {courses && courses.courses_list && courses.courses_list.length > 0 && (
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
                        <div className="inline-block bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full font-semibold">
                          Target: {course.target}
                        </div>
                      </div>
                      <div className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0">
                        {course.duration}
                      </div>
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

                  <button 
                    onClick={scrollToContact}
                    className="mt-8 w-full bg-gray-900 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Enquire Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. CENTERS SECTION */}
      {centers && centers.centers_list && centers.centers_list.length > 0 && (
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-orange-600 font-bold text-sm uppercase tracking-wider block mb-2">Visit Centers</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{centers.title || "Coaching Locations"}</h2>
              <div className="h-1.5 w-20 bg-orange-600 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {centers.centers_list.map((center, index) => (
                <div key={index} className="bg-gray-50 border border-gray-100 rounded-3xl p-8 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-xl text-gray-900">{center.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{center.address}</p>
                    <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                      <Phone className="w-4 h-4" /> {center.phone}
                    </div>
                  </div>
                  <div className="pt-6">
                    <button 
                      onClick={scrollToContact}
                      className="text-orange-600 hover:text-orange-700 font-extrabold flex items-center gap-2 transition-colors"
                    >
                      Get Directions <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* 8. CONTACT FORM & COUNSELLING BOOKING */}
      {contact && (
        <section id="contact-section" className="py-24 bg-orange-950 text-white relative">
          <div className="container mx-auto px-6 max-w-4xl relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              
              <div className="md:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-900 text-orange-400 text-xs font-bold border border-orange-800">
                  ⚡ Personalized Counselling
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {contact.title || "Book Your Free Career Counselling Session"}
                </h2>
                <p className="text-orange-100 leading-relaxed text-sm">
                  Connect with our senior expert counsellors to map out your perfect medical prep journey and target score plans.
                </p>
                <div className="space-y-4 pt-4 border-t border-orange-900">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-900/50 flex items-center justify-center border border-orange-800">
                      <Users className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">1-on-1 Guidance</h4>
                      <p className="text-xs text-orange-200">Personal session with expert advisors</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-900/50 flex items-center justify-center border border-orange-800">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Target Preparation Blueprint</h4>
                      <p className="text-xs text-orange-200">NCERT mapping and weak area strategies</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 bg-white text-gray-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-orange-850">
                {submitSuccess ? (
                  <div className="text-center py-12 space-y-6">
                    <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-100 animate-bounce">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-2xl text-orange-950">Session Request Received!</h3>
                      <p className="text-gray-600 text-sm max-w-sm mx-auto">
                        Our student relations team will reach out to you within 24 hours to confirm your scheduled slot.
                      </p>
                    </div>
                    <button 
                      onClick={() => setSubmitSuccess(false)}
                      className="bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-orange-500 transition-colors text-sm"
                    >
                      Submit Another Query
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <h3 className="font-bold text-gray-900 text-2xl mb-4">Request Callback</h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Full Name *</label>
                      <input 
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="Enter student name"
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Phone Number *</label>
                        <input 
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFormChange}
                          placeholder="10-digit mobile number"
                          required
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Email Address</label>
                        <input 
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          placeholder="yourname@gmail.com"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {courses && courses.courses_list && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Target Program</label>
                          <select 
                            name="course"
                            value={formData.course}
                            onChange={handleFormChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all outline-none"
                          >
                            <option value="">Select program</option>
                            {courses.courses_list.map((c, idx) => (
                              <option key={idx} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {centers && centers.centers_list && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Preferred Center</label>
                          <select 
                            name="center"
                            value={formData.center}
                            onChange={handleFormChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all outline-none"
                          >
                            <option value="">Select center</option>
                            {centers.centers_list.map((c, idx) => (
                              <option key={idx} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Your Question / Message</label>
                      <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleFormChange}
                        rows="3"
                        placeholder="Any specific doubts or query..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all outline-none resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white font-extrabold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting Booking...
                        </>
                      ) : (
                        <>
                          Book Counselling <Send className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </section>
      )}

    </div>
  );
}
