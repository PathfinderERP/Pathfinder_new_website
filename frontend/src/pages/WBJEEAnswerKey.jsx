import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowDownTrayIcon, 
    ArrowLeftIcon,
    SparklesIcon,
    DocumentTextIcon,
    PlayCircleIcon,
    TableCellsIcon,
    PresentationChartLineIcon,
    XMarkIcon,
    LockClosedIcon,
    CheckBadgeIcon,
    VideoCameraIcon,
    AcademicCapIcon,
    ArrowRightIcon,
    ShareIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import BlogEnrollmentForm from '../components/blog/BlogEnrollmentForm';
import { wbjeeAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const WBJEEAnswerKey = () => {
    const navigate = useNavigate();
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [pendingDownload, setPendingDownload] = useState(null);
    const [redirectUrl, setRedirectUrl] = useState(null);
    const [modalMode, setModalMode] = useState('enroll'); // 'enroll' or 'download'
    const [dynamicConfig, setDynamicConfig] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await wbjeeAPI.getLatest();
                setDynamicConfig(response.data);
            } catch (err) {
                console.error("Error fetching WBJEE config:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();

        const enrolled = localStorage.getItem('pathfinder_blog_enrolled');
        if (enrolled) {
            setIsEnrolled(true);
        }
    }, []);

    useEffect(() => {
        if (dynamicConfig) {
            document.title = dynamicConfig.meta_title || "WBJEE 2026 Answer Key, Analysis & Solutions | Pathfinder";
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', dynamicConfig.meta_description || 'Download the WBJEE 2026 Answer Key, subject-wise analysis, and video solutions prepared by Pathfinder experts.');
            }

            // Custom Meta Tags Injection
            if (dynamicConfig.custom_meta_tags?.length > 0) {
                dynamicConfig.custom_meta_tags.forEach(tag => {
                    if (!tag.name || !tag.content) return;
                    
                    const selector = tag.property ? `meta[property="${tag.name}"]` : `meta[name="${tag.name}"]`;
                    let element = document.querySelector(selector);
                    
                    if (!element) {
                        element = document.createElement('meta');
                        if (tag.property) element.setAttribute('property', tag.name);
                        else element.setAttribute('name', tag.name);
                        document.head.appendChild(element);
                    }
                    element.setAttribute('content', tag.content);
                });
            }
        }
    }, [dynamicConfig]);


    const handleDownload = (url) => {
        if (isEnrolled) {
            window.open(url, '_blank');
        } else {
            setPendingDownload(url);
            setRedirectUrl(null);
            setModalMode('download');
            setShowModal(true);
        }
    };

    const handleKnowMore = () => {
        if (isEnrolled) {
            navigate('/courses/all-india');
        } else {
            setRedirectUrl('/courses/all-india');
            setPendingDownload(null);
            setModalMode('enroll');
            setShowModal(true);
        }
    };

    const handleEnrollSuccess = () => {
        localStorage.setItem('pathfinder_blog_enrolled', 'true');
        setIsEnrolled(true);
        setShowModal(false);
        
        if (pendingDownload) {
            window.open(pendingDownload, '_blank');
            setPendingDownload(null);
        }

        if (redirectUrl) {
            navigate(redirectUrl);
            setRedirectUrl(null);
        }
    };

    const handleShare = () => {
        const shareData = {
            title: dynamicConfig?.meta_title || "WBJEE 2026 Answer Key & Analysis",
            text: dynamicConfig?.meta_description || "Check out the official WBJEE 2026 answer key and expert analysis by Pathfinder.",
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData).catch(console.error);
        } else {
            // Fallback: Copy to clipboard or open social links
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const shareOnWhatsApp = () => {
        const text = encodeURIComponent(`${dynamicConfig?.meta_title || "WBJEE 2026 Answer Key & Analysis"}\n${window.location.href}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };


    const marksData = dynamicConfig?.marks_division?.length > 0 ? dynamicConfig.marks_division : [
        { subject: "Mathematics", questions: "75 (Cat 1: 50, Cat 2: 15, Cat 3: 10)", marks: "100", weightage: "50%" },
        { subject: "Physics", questions: "40 (Cat 1: 30, Cat 2: 5, Cat 3: 5)", marks: "50", weightage: "25%" },
        { subject: "Chemistry", questions: "40 (Cat 1: 30, Cat 2: 5, Cat 3: 5)", marks: "50", weightage: "25%" },
    ];

    const resources = dynamicConfig?.resources?.length > 0 ? dynamicConfig.resources : [
        {
            subject: "Mathematics",
            icon: "📐",
            bg_color: "bg-yellow-50",
            weightage_url: "https://drive.google.com/file/d/1sC7QCiztc-_7_ilkKpeJpy1roCP_m5CN/view?usp=sharing",
            pdf_url: "https://drive.google.com/file/d/1r7LxJgvyEPatmZr07l2eSvKsGS-dHQrL/view?usp=sharing",
            video_url: "https://www.youtube.com/live/uUZqQD_1_ow?si=_zWeo8y8Hqx53yOL"
        },
        {
            subject: "Physics",
            icon: "⚛️",
            bg_color: "bg-orange-50",
            weightage_url: "https://drive.google.com/file/d/1Dr9JQNoanPqcIb-Q0_pY4ahFkG2j7GTQ/view?usp=sharing",
            pdf_url: "https://drive.google.com/file/d/1_LVHQBKTCyJqeHfT0aNsnAxRXgjSEj9C/view?usp=sharing",
            video_url: "https://www.youtube.com/live/uUZqQD_1_ow?si=_zWeo8y8Hqx53yOL"
        },
        {
            subject: "Chemistry",
            icon: "🧪",
            bg_color: "bg-emerald-50",
            weightage_url: "https://drive.google.com/file/d/160XqChmZICHN4GORLXBibENcSjZa13Su/view?usp=sharing",
            pdf_url: "https://drive.google.com/file/d/1Qr91_knw683n5lxC1fZWx5gM5q7rd8DW/view?usp=sharing",
            video_url: "https://www.youtube.com/live/uUZqQD_1_ow?si=_zWeo8y8Hqx53yOL"
        }
    ];

    const videos = dynamicConfig?.videos?.length > 0 ? dynamicConfig.videos : [
        { id: 1, label: "Topper's Talk", url: "https://www.youtube.com/embed/dl-QLpDplLE?vq=hd1080", description: "" },
        { id: 2, label: "Success Story", url: "https://www.youtube.com/embed/wGnX7j4EULA?vq=hd1080", description: "" },
        { id: 3, label: "Expert Guidance", url: "https://www.youtube.com/embed/KOFomNzzluc?vq=hd1080", description: "" }
    ];

    const getEmbedUrl = (url) => {
        if (!url) return "";
        if (url.includes('embed')) return url;
        
        let videoId = "";
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
        } else if (url.includes('v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtube.com/shorts/')) {
            videoId = url.split('shorts/')[1].split(/[?#]/)[0];
        }

        return videoId ? `https://www.youtube.com/embed/${videoId}?vq=hd1080` : url;
    };


    if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;


    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900 relative">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');
                .oswald { font-family: 'Oswald', sans-serif; }
                .brand-border-left { border-left: 6px solid #FF8C00; }
                .neo-shadow { box-shadow: 3px 3px 0 #FF8C00; }
                .neo-shadow-large { box-shadow: 6px 6px 0 #FF8C00; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}} />

            {/* Hero Section */}
            <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden bg-slate-900">
                <img 
                    src={dynamicConfig?.hero_image_url || "/images/Header Banner.webp"} 
                    alt="WBJEE 2026 Analysis" 
                    className="w-full h-full object-cover object-center opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/20" />
                <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-16">
                    <div className="max-w-7xl mx-auto px-4 w-full">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl"
                        >
                            <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
                                <SparklesIcon className="w-3.5 h-3.5" />
                                Analysis Hub 2026
                            </div>
                            <h1 className="oswald text-3xl md:text-6xl lg:text-7xl uppercase text-white mb-6 leading-tight">
                                {dynamicConfig?.title?.split(':')[0] || "WBJEE 2026"} <br />
                                <span className="text-orange-600">{dynamicConfig?.title?.split(':')[1] || "Answer Key"}</span>
                            </h1>
                            <p className="text-sm md:text-lg text-slate-300 max-w-xl font-medium leading-relaxed">
                                {dynamicConfig?.description || "Get official answer keys, detailed weightage analysis, and video solutions prepared by Pathfinder's expert faculty."}
                            </p>
                            {dynamicConfig?.sub_description && (
                                <div className="mt-6 inline-block bg-orange-600 text-white px-4 py-2 rounded-lg oswald text-[10px] md:text-sm uppercase tracking-widest neo-shadow">
                                    {dynamicConfig.sub_description}
                                </div>
                            )}

                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
                {/* Pathfinder Edge Banner */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mb-16 bg-black text-[#FFF200] p-6 md:p-10 rounded-2xl border-2 border-[#FF8C00] flex flex-col md:flex-row items-center justify-between gap-8 neo-shadow-large"
                >
                    <div className="md:max-w-xl text-center md:text-left">
                        <span className="font-bold text-white text-xs uppercase tracking-[0.2em] block mb-2">Pathfinder Edge</span>
                        <p className="text-xl md:text-2xl font-bold leading-tight italic oswald uppercase">
                            Post-Exam Analysis Series – <span className="text-white">Understand the "why" behind every answer with our expert-led solutions.</span>
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <img src="/WHY PATH IMAGES/Tick mark.webp" alt="Tick" className="w-16 h-16 md:w-20 md:h-20" />
                    </div>
                </motion.div>

                {/* Marks Division */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <TableCellsIcon className="w-8 h-8 text-orange-600" />
                        <h2 className="oswald text-3xl md:text-4xl uppercase brand-border-left pl-6">
                            Marks Division <span className="text-slate-400">Analysis</span>
                        </h2>
                    </div>

                    <div className="bg-white border-2 border-black p-4 md:p-8 neo-shadow-large overflow-hidden rounded-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-black text-[#FFF200] oswald uppercase tracking-wider text-lg">
                                        <th className="border-2 border-black p-4 text-center">Subject</th>
                                        <th className="border-2 border-black p-4 text-center">Questions</th>
                                        <th className="border-2 border-black p-4 text-center">Marks</th>
                                        <th className="border-2 border-black p-4 text-center">Weightage</th>
                                    </tr>
                                </thead>
                                <tbody className="font-bold text-base">
                                    {marksData.map((row, i) => (
                                        <tr key={i} className={i % 2 === 1 ? "bg-orange-50" : "bg-white"}>
                                            <td className="border-2 border-black p-4 text-slate-900">{row.subject}</td>
                                            <td className="border-2 border-black p-4 text-center text-slate-700">{row.questions}</td>
                                            <td className="border-2 border-black p-4 text-center text-orange-600">{row.marks}</td>
                                            <td className="border-2 border-black p-4 text-center text-slate-700">{row.weightage}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.section>

                {/* Download Resources */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24"
                >
                    <div className="flex items-center gap-3 mb-10">
                        <DocumentTextIcon className="w-8 h-8 text-orange-600" />
                        <h2 className="oswald text-3xl md:text-4xl uppercase brand-border-left pl-6">
                            📥 Download <span className="text-slate-400">Solutions</span>
                        </h2>
                    </div>
                    
                    <div className="flex flex-col gap-6">
                        {resources.map((res, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ x: 10 }}
                                className={`${res.bg_color} border-2 border-black p-6 md:p-8 rounded-xl neo-shadow flex flex-col lg:flex-row items-center gap-6 lg:gap-10 group transition-all`}
                            >
                                <div className="text-5xl filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">
                                    {res.icon}
                                </div>
                                <div className="flex-grow text-center lg:text-left">
                                    <h3 className="oswald text-2xl md:text-3xl uppercase tracking-tighter text-slate-900 mb-1">{res.subject}</h3>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Expert Faculty Analysis</p>
                                </div>
                                <div className="flex flex-row justify-center lg:justify-end gap-3 w-full lg:w-auto overflow-x-auto lg:overflow-visible no-scrollbar">
                                    <button 
                                        onClick={() => handleDownload(res.weightage_url)}
                                        className="px-5 py-3 bg-[#FFF200] border-2 border-black rounded-lg oswald font-bold uppercase text-base neo-shadow hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        {!isEnrolled && <LockClosedIcon className="w-4 h-4" />}
                                        📄 Weightage
                                    </button>
                                    <button 
                                        onClick={() => handleDownload(res.pdf_url)}
                                        className="px-5 py-3 bg-white border-2 border-black rounded-lg oswald font-bold uppercase text-base neo-shadow hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        {!isEnrolled && <LockClosedIcon className="w-4 h-4" />}
                                        📄 Answer PDF
                                    </button>
                                    <a 
                                        href={res.video_url} target="_blank" rel="noopener noreferrer"
                                        className="px-5 py-3 bg-black border-2 border-[#FF8C00] text-white rounded-lg oswald font-bold uppercase text-base neo-shadow hover:bg-orange-500 hover:text-black transition-all flex items-center gap-2"
                                    >
                                        🎥 Video Solution
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Course Programme Section */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="flex items-center gap-3 mb-10">
                        <AcademicCapIcon className="w-8 h-8 text-orange-600" />
                        <h2 className="oswald text-3xl md:text-4xl uppercase brand-border-left pl-6">
                            🎓 Course <span className="text-slate-400">Programme</span>
                        </h2>
                    </div>

                    <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 border-2 border-black neo-shadow-large overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-orange-600/10 rounded-full blur-[8rem] -mr-60 -mt-60" />
                        
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6 relative z-10">
                            <div>
                                <h3 className="oswald text-3xl md:text-5xl uppercase mb-2 tracking-tight leading-none">
                                    JEE Main & Advanced | <span className="text-orange-500">WBJEE</span>
                                </h3>
                                <p className="text-orange-400 font-bold uppercase tracking-[0.2em] text-[10px]">Targeting WBJEE 2026 & Beyond</p>
                            </div>
                            <button 
                                onClick={handleKnowMore}
                                className="px-8 py-4 bg-[#FFF200] text-black rounded-lg oswald font-bold uppercase text-lg neo-shadow hover:bg-orange-500 hover:text-white transition-all flex items-center gap-3 active:scale-95"
                            >
                                Know More
                                <ArrowRightIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 mb-12 relative z-10">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-white/20">
                                    <img src="/WHY PATH IMAGES/rotateing cube.webp" alt="Freq" className="w-10 h-10" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-2 oswald uppercase tracking-wider">Frequency</h4>
                                    <p className="text-slate-400 text-base leading-relaxed">
                                        <span className="text-white font-bold">Instation:</span> 2 Days a Week <br />
                                        <span className="text-white font-bold">Outstation:</span> 2 Days a Week
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-white/20">
                                    <img src="/WHY PATH IMAGES/clock.webp" alt="Clock" className="w-10 h-10" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-2 oswald uppercase tracking-wider">Timings</h4>
                                    <p className="text-slate-400 text-base leading-relaxed">
                                        <span className="text-white font-bold">Instation:</span> 12hrs / Subject / Month <br />
                                        <span className="text-white font-bold">Outstation:</span> 12 hrs / Subject / Month
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Test Support Table */}
                        <div className="bg-white rounded-xl overflow-hidden mb-12 border-2 border-black relative z-10">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-orange-500 text-black oswald uppercase text-lg">
                                        <th className="p-4 border-r-2 border-black">1st Year (XI)</th>
                                        <th className="p-4">2nd Year (XII)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-900 text-base font-bold">
                                    <tr className="border-b-2 border-black">
                                        <td className="p-4 border-r-2 border-black italic">WBJEE Phase Test (Part Syllabus) - 5 Test</td>
                                        <td className="p-4 italic">WBJEE Phase Test (Part Syllabus) - 5 Test</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-r-2 border-black italic">WBJEE Full Syllabus Test - 2 Test</td>
                                        <td className="p-4 italic">WBJEE Mock Test (Full Syllabus) - 8 Test</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Add-ons */}
                        <div className="flex flex-wrap gap-6 pt-8 border-t-2 border-white/10 relative z-10">
                            {["Online Class Support", "Free Doubt Clearing", "Individual Mentorship"].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                    <CheckBadgeIcon className="w-4 h-4 text-orange-500" />
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Experts/Videos Section */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-10">
                        <VideoCameraIcon className="w-8 h-8 text-orange-600" />
                        <h2 className="oswald text-2xl md:text-4xl uppercase brand-border-left pl-6">
                            🎥 Experts <span className="text-slate-400">Insights</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {videos.map((video) => (
                            <div key={video.id} className="group">
                                <h4 className="oswald text-xl uppercase mb-1 text-slate-900 group-hover:text-orange-600 transition-colors tracking-tight">
                                    {video.label}
                                </h4>
                                {video.description && (
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                        {video.description}
                                    </p>
                                )}
                                <div className="aspect-[16/11] bg-black rounded-xl overflow-hidden neo-shadow transition-all duration-500 border-2 border-black transform-gpu isolate" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                                    <iframe
                                        className="w-full h-full"
                                        src={getEmbedUrl(video.url)}
                                        title={video.label}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    ></iframe>
                                </div>

                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Final Share Section */}
                <motion.section 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mb-12 p-8 md:p-12 bg-slate-900 rounded-[2.5rem] border-2 border-black neo-shadow-large text-center relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShareIcon className="w-48 h-48 text-orange-500" />
                    </div>
                    
                    <div className="relative z-10">
                        <h2 className="oswald text-2xl md:text-5xl uppercase text-white mb-6">
                            Help Your <span className="text-orange-500">Friends</span> Succeed!
                        </h2>
                        <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto font-medium">
                            Don't keep the official solutions to yourself. Share this resource hub with your peers and help them prepare better for WBJEE 2026.
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-6">
                            <button 
                                onClick={shareOnWhatsApp}
                                className="px-8 py-4 bg-[#25D366] text-white rounded-xl oswald font-bold uppercase text-base neo-shadow hover:scale-105 transition-all flex items-center gap-3 border-2 border-[#25D366] active:scale-95"
                            >
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.67-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.435 5.631 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                Share on WhatsApp
                            </button>
                            <button 
                                onClick={handleShare}
                                className="px-8 py-4 bg-white text-black border-2 border-black rounded-xl oswald font-bold uppercase text-base neo-shadow hover:bg-orange-500 hover:text-white transition-all flex items-center gap-3 active:scale-95"
                            >
                                <ShareIcon className="w-6 h-6" />
                                Other Share Options
                            </button>
                        </div>
                    </div>
                </motion.section>

            </div>

            {/* Enrollment Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-48 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="relative bg-white border-2 border-black rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar neo-shadow-large"
                        >
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-20 group"
                            >
                                <XMarkIcon className="w-6 h-6 text-slate-900 group-hover:text-orange-600" />
                            </button>
                            
                            <div className="p-4 md:p-6">
                                <BlogEnrollmentForm onSuccess={handleEnrollSuccess} mode={modalMode} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WBJEEAnswerKey;
