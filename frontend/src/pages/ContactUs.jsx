import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ClockIcon,
    ChevronDownIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import { AnimatePresence } from "framer-motion";
import { centresAPI } from "../services/api";
import { centerdata } from "../data/data";
import ReCAPTCHA from "react-google-recaptcha";

// Helper function to normalize strings for comparison
const normalizeStr = (str) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

// Helper to extract coordinates from various URL formats
const extractCoordsFromUrl = (url) => {
    if (!url) return null;

    // Try @lat,lng format
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
        return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    }

    // Try query= format or q= format
    const queryMatch = url.match(/[?&](?:query|q)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (queryMatch) {
        return { lat: parseFloat(queryMatch[1]), lng: parseFloat(queryMatch[2]) };
    }

    // Try !3d and !2d or !4d format (Google Maps internal format)
    const latMatch = url.match(/!3d(-?\d+\.\d+)/);
    const lngMatch = url.match(/!(?:2d|4d)(-?\d+\.\d+)/);
    if (latMatch && lngMatch) {
        return { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]) };
    }

    // Try just lat,lng in the path
    const pathMatch = url.match(/\/(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (pathMatch) {
        return { lat: parseFloat(pathMatch[1]), lng: parseFloat(pathMatch[2]) };
    }

    return null;
};

// Helper to calculate distance between two coordinates in km (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const ContactUs = () => {
    const [centres, setCentres] = useState([]);
    const [displayedCentre, setDisplayedCentre] = useState(null);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [locationDetected, setLocationDetected] = useState(false);
    const [userLoc, setUserLoc] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        contact_number: "",
        email: "",
        course: "",
        center_name: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [showMessage, setShowMessage] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);

    // Get API base URL from environment variables
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    useEffect(() => {
        document.title = "Contact Us | Pathfinder Institute Official Support & Centres";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', "Get in touch with Pathfinder Institute for admissions, course queries, and support. Locate your nearest centre across West Bengal and India.");
        }
    }, []);

    useEffect(() => {
        const fetchCentres = async () => {
            try {
                const response = await centresAPI.getAll();
                const rawData = Array.isArray(response.data) ? response.data : (response.data?.results || []);

                // Merge backend data with static data for map fallback (same as Home page)
                const processedCentres = rawData.map(backendCentre => {
                    // If backend already has map_url, use it
                    if (backendCentre.map_url || backendCentre.google_map_url) return backendCentre;

                    // Otherwise try to find match in static data
                    const match = centerdata.find(staticCentre => {
                        const bName = normalizeStr(backendCentre.centre);
                        const sName = normalizeStr(staticCentre.name);
                        return bName.includes(sName) || sName.includes(bName);
                    });

                    if (match && match.mapEmbed) {
                        return { ...backendCentre, mapEmbed: match.mapEmbed };
                    }

                    return backendCentre;
                });

                setCentres(processedCentres);

                // Set Hazra as default
                const hazraCentre = processedCentres.find(c => c.centre?.toLowerCase() === "hazra");
                if (hazraCentre) {
                    setDisplayedCentre(hazraCentre);
                } else if (processedCentres.length > 0) {
                    setDisplayedCentre(processedCentres[0]);
                }
            } catch (error) {
                console.error("Error fetching centres:", error);
            }
        };

        fetchCentres();
    }, []);

    // Form Handlers
    const onCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const validate = () => {
        let newErrors = {};
        if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
        if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.match(emailRegex)) {
            newErrors.email = "Please enter a valid email address";
        }
        
        // Phone validation (exactly 10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!formData.contact_number.match(phoneRegex)) {
            newErrors.contact_number = "Please enter a valid 10-digit number";
        }
        
        if (!formData.course) newErrors.course = "Please select a course";
        if (!formData.center_name) newErrors.center_name = "Please select a centre";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;

        // Map frontend field names to backend field names
        const fieldMapping = {
            fname: "first_name",
            lname: "last_name",
            contactno: "contact_number",
            emailid: "email",
            course: "course",
            centername: "center_name",
            floatingTextarea2: "message",
        };

        const backendFieldName = fieldMapping[id] || id;

        // Special handling for contact number (only digits)
        if (id === 'contactno' && value !== '' && !/^\d*$/.test(value)) {
            return;
        }

        // Limit contact number to 10 digits
        if (id === 'contactno' && value.length > 10) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [backendFieldName]: value,
        }));

        // Clear error when user starts typing
        if (errors[backendFieldName]) {
            setErrors((prev) => ({
                ...prev,
                [backendFieldName]: "",
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        if (!captchaToken) {
            setSubmitMessage("Please complete the reCAPTCHA.");
            setShowMessage(true);
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage("");
        setErrors({});
        setShowMessage(false);

        try {
            const response = await fetch(`${API_BASE_URL}/api/contact/submit/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    captcha_token: captchaToken
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSubmitMessage(result.message);
                setShowMessage(true);
                // Reset form
                setFormData({
                    first_name: "",
                    last_name: "",
                    contact_number: "",
                    email: "",
                    course: "",
                    center_name: "",
                    message: "",
                });
                setCaptchaToken(null);
                if (window.grecaptcha) {
                    window.grecaptcha.reset();
                }
            } else {
                // Handle field-specific errors
                if (result.field_errors) {
                    setErrors(result.field_errors);
                    setSubmitMessage("Please correct the errors below.");
                    setShowMessage(true);
                } else {
                    setSubmitMessage(
                        result.error || "Something went wrong. Please try again."
                    );
                    setShowMessage(true);
                }
            }
        } catch (error) {
            console.error("Submission error:", error);
            setSubmitMessage(
                `Network error: ${error.message}. Please check your connection and try again.`
            );
            setShowMessage(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        let timer;
        if (showMessage && submitMessage) {
            timer = setTimeout(() => {
                setShowMessage(false);
                setTimeout(() => setSubmitMessage(""), 300);
            }, 5000);
        }
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [showMessage, submitMessage]);

    const handleCloseMessage = () => {
        setShowMessage(false);
        setTimeout(() => setSubmitMessage(""), 300);
    };

    const handleFindNearest = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setDetectingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                setUserLoc({ lat: userLat, lng: userLng });

                let nearestCentre = null;
                let minDistance = Infinity;

                centres.forEach((centre) => {
                    const url = centre.map_url || centre.google_map_url || centre.mapEmbed || centre.map || centre.location;
                    if (!url) return;

                    const coords = extractCoordsFromUrl(url);
                    if (coords) {
                        const dist = calculateDistance(userLat, userLng, coords.lat, coords.lng);
                        if (dist < minDistance) {
                            minDistance = dist;
                            nearestCentre = { ...centre, distance: dist };
                        }
                    }
                });

                if (nearestCentre) {
                    setDisplayedCentre(nearestCentre);
                    setLocationDetected(true);
                } else {
                    alert("Sorry, we couldn't find a centre near you with valid location data.");
                }
                setDetectingLocation(false);
            },
            (error) => {
                console.error("Error getting location:", error);

                // If location fails, fallback to opening current centre's map as a friendly gesture
                if (displayedCentre) {
                    const url = displayedCentre.map_url || displayedCentre.google_map_url || displayedCentre.mapEmbed || displayedCentre.map || displayedCentre.location;
                    if (url) window.open(url, '_blank');
                } else {
                    let msg = "Unable to retrieve your location.";
                    if (error.code === 1) msg = "Location permission denied.";
                    else if (error.code === 2) msg = "Location unavailable.";
                    else if (error.code === 3) msg = "Location request timed out.";
                    alert(msg);
                }
                setDetectingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleGetDirections = () => {
        if (!displayedCentre) return;

        const targetUrl = displayedCentre.map_url || displayedCentre.google_map_url || displayedCentre.mapEmbed || displayedCentre.map || displayedCentre.location;
        const coords = extractCoordsFromUrl(targetUrl);

        if (coords && userLoc) {
            const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${coords.lat},${coords.lng}&travelmode=driving`;
            window.open(googleMapsDirUrl, '_blank');
        } else if (targetUrl) {
            window.open(targetUrl, '_blank');
        }
    };


    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-10 pb-12 md:pt-16 md:pb-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight">
                            Contact <span className="text-orange-500">Us</span>
                        </h1>
                        <div className="prose prose-lg max-w-4xl">
                            <p className="text-xl text-slate-600 leading-relaxed mb-6 font-medium">
                                This is the official page of Pathfinder, where you can share all your queries, feedback, complaints, or any concern you may have about our centers, courses, and programs.
                            </p>
                            <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                                <p>
                                    Pathfinder, India's loved education platform, is here to help students solve their grievances. We aim to resolve your queries within <span className="font-bold text-slate-900">7 days</span>.
                                </p>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="mb-0">
                                        You can call on Pathfinder's official Contact No. <span className="font-bold text-orange-600 text-xl tracking-tight"> 9147178886</span> (24x7).
                                    </p>
                                </div>
                                <p>
                                    If the phone is busy, we're resolving someone else's queries. We request you to contact us again after 15 minutes so that we can address your query or concern you may have regarding lecturers or course material. Your suggestions will help us improve and give all children a bright future.
                                </p>
                                <p>
                                    In case of any grievance, don't hesitate to get in touch with us at <a href="mailto:support@pathfinder.edu.in" className="text-orange-600 hover:text-orange-700 font-bold underline decoration-2 underline-offset-4">support@pathfinder.edu.in</a>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Centre Location Section */}
            {displayedCentre && (
                <section className="py-12 md:py-20 bg-slate-50 border-y border-slate-100">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left: Centre Info */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                className="max-w-xl"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-full mb-6">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">Locate Nearest Centre</span>
                                </div>

                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                                    Pathfinder <br />
                                    <span className="text-orange-600">{displayedCentre.centre}</span>
                                </h2>

                                <div className="flex items-start gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                        <MapPinIcon className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <p className="text-slate-600 text-lg font-medium leading-relaxed">
                                        {displayedCentre.address || "47, Kalidas Patitundi Lane, Kolkata, West Bengal - 700026"}
                                    </p>
                                </div>

                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                        <PhoneIcon className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <p className="text-slate-600 text-lg font-medium leading-relaxed">
                                        {displayedCentre.mobile || "9147178886"}
                                    </p>
                                </div>

                                <div className="flex items-start gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                        <EnvelopeIcon className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <p className="text-slate-600 text-lg font-medium leading-relaxed">
                                        {displayedCentre.email || "support@pathfinder.edu.in"}
                                    </p>
                                </div>

                                {displayedCentre.distance && (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200 mb-4">
                                        <MapPinIcon className="w-5 h-5 text-green-600" />
                                        <span className="text-sm font-bold text-green-700">
                                            {displayedCentre.distance.toFixed(1)} km away
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <motion.button
                                        onClick={handleFindNearest}
                                        disabled={detectingLocation}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-8 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {detectingLocation ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Detecting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <MapPinIcon className="w-5 h-5" />
                                                <span>Centre Near You</span>
                                            </>
                                        )}
                                    </motion.button>

                                    {locationDetected && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={handleGetDirections}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="bg-white border-2 border-orange-600 text-orange-600 font-bold py-3 px-8 rounded-lg hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span>Get Directions</span>
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>

                            {/* Right: Map */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-lg h-full min-h-[400px]"
                            >
                                {displayedCentre.location || displayedCentre.map_url || displayedCentre.google_map_url ? (
                                    <iframe
                                        src={(() => {
                                            const url = displayedCentre.map_url || displayedCentre.google_map_url || displayedCentre.mapEmbed || displayedCentre.map || displayedCentre.location;

                                            // If it's an iframe string, extract the src
                                            if (url.includes('iframe')) {
                                                const srcMatch = url.match(/src="([^"]+)"/);
                                                if (srcMatch) return srcMatch[1];
                                            }

                                            // If it's already a proper embed URL, use it
                                            if (url.includes('google.com/maps/embed')) {
                                                return url;
                                            }

                                            // Extract coordinates from URL
                                            const coords = extractCoordsFromUrl(url);

                                            // If we have coordinates, create a search URL that shows place details
                                            if (coords) {
                                                // Use search URL format that shows the business card
                                                const placeName = encodeURIComponent(displayedCentre.centre || 'Pathfinder Institute');
                                                return `https://maps.google.com/maps?q=${placeName}&t=&z=15&ie=UTF8&iwloc=&output=embed&ll=${coords.lat},${coords.lng}`;
                                            }

                                            // Fallback: use the original URL
                                            return url;
                                        })()}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, minHeight: '400px' }}
                                        allowFullScreen
                                        loading="lazy"
                                        title="Centre Location"
                                    />
                                ) : (
                                    <div className="w-full h-full min-h-[400px] bg-slate-200 flex items-center justify-center">
                                        <div className="text-center">
                                            <MapPinIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                            <p className="text-slate-500 font-bold">Map not available</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </section>
            )}

            {/* Form & FAQ Combined Section */}
            <section className="py-12 md:py-20 bg-slate-50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* FAQ Side */}
                        <div className="w-full">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="mb-8">
                                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                                        Frequently Asked <span className="text-orange-600">Questions</span>
                                    </h2>
                                    <p className="text-slate-500 font-medium">Quick answers to common queries about Pathfinder.</p>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        {
                                            question: "How do I contact a Pathfinder counsellor?",
                                            answer: "You can contact our counsellors by calling our 24x7 helpline at  9147178886 or by emailing us at support@pathfinder.edu.in. You can also visit any of our centres."
                                        },
                                        {
                                            question: "What is the official website of Pathfinder?",
                                            answer: "The official website of Pathfinder is www.pathfinder.edu.in. Please be cautious of fake websites."
                                        },
                                        {
                                            question: "How can I contact the Pathfinder customer care?",
                                            answer: "Reach us at 9147178886 (24x7), email support@pathfinder.edu.in, or visit the nearest centre."
                                        },
                                        {
                                            question: "How will I get my doubts answered?",
                                            answer: "We provide 24x7 doubt support online, doubt-clearing sessions at centres, and class-hour faculty access."
                                        },
                                        {
                                            question: "What mentorship does Pathfinder Hazra provide?",
                                            answer: "Hazra provides JEE, NEET, and competitive mentorship with personalized study plans and expert tracking."
                                        }
                                    ].map((faq, index) => (
                                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Contact Form Side */}
                        <div className="w-full">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
                                    <div className="bg-gradient-to-r from-orange-600 to-red-600 p-5 md:p-6 text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                                        <div className="relative z-10">
                                            <h2 className="text-xl md:text-2xl font-black text-white mb-1 tracking-tight">
                                                Get in <span className="text-orange-200">Touch</span>
                                            </h2>
                                            <p className="text-white/80 text-sm font-medium">Have a question? We're here to help.</p>
                                        </div>
                                    </div>

                                    <div className="p-5 md:p-6">
                                        <form onSubmit={handleSubmit} className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {/* First Name */}
                                                <div className="space-y-2">
                                                    <label htmlFor="fname" className="text-sm font-bold text-slate-700 ml-1">
                                                        First Name <span className="text-orange-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="fname"
                                                        value={formData.first_name}
                                                        onChange={handleChange}
                                                        required
                                                        className={`w-full px-3 py-2.5 rounded-lg border ${errors.first_name ? 'border-red-500' : 'border-slate-200'} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium text-sm`}
                                                        placeholder="Enter your first name"
                                                    />
                                                    {errors.first_name && <p className="text-red-500 text-xs font-bold ml-1">{errors.first_name}</p>}
                                                </div>

                                                {/* Last Name */}
                                                <div className="space-y-2">
                                                    <label htmlFor="lname" className="text-sm font-bold text-slate-700 ml-1">
                                                        Last Name <span className="text-orange-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="lname"
                                                        value={formData.last_name}
                                                        onChange={handleChange}
                                                        required
                                                        className={`w-full px-3 py-2.5 rounded-lg border ${errors.last_name ? 'border-red-500' : 'border-slate-200'} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium text-sm`}
                                                        placeholder="Enter your last name"
                                                    />
                                                    {errors.last_name && <p className="text-red-500 text-xs font-bold ml-1">{errors.last_name}</p>}
                                                </div>

                                                {/* Phone */}
                                                <div className="space-y-2">
                                                    <label htmlFor="contactno" className="text-sm font-bold text-slate-700 ml-1">
                                                        Contact Number <span className="text-orange-500">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        id="contactno"
                                                        value={formData.contact_number}
                                                        onChange={handleChange}
                                                        required
                                                        className={`w-full px-3 py-2.5 rounded-lg border ${errors.contact_number ? 'border-red-500' : 'border-slate-200'} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium text-sm`}
                                                        placeholder="Enter 10-digit number"
                                                    />
                                                    {errors.contact_number && <p className="text-red-500 text-xs font-bold ml-1">{errors.contact_number}</p>}
                                                </div>

                                                {/* Email */}
                                                <div className="space-y-2">
                                                    <label htmlFor="emailid" className="text-sm font-bold text-slate-700 ml-1">
                                                        Email Address <span className="text-orange-500">*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="emailid"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                        className={`w-full px-3 py-2.5 rounded-lg border ${errors.email ? 'border-red-500' : 'border-slate-200'} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium text-sm`}
                                                        placeholder="your.email@example.com"
                                                    />
                                                    {errors.email && <p className="text-red-500 text-xs font-bold ml-1">{errors.email}</p>}
                                                </div>

                                                {/* Course */}
                                                <div className="space-y-2">
                                                    <label htmlFor="course" className="text-sm font-bold text-slate-700 ml-1">
                                                        Select Course <span className="text-orange-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            id="course"
                                                            value={formData.course}
                                                            onChange={handleChange}
                                                            required
                                                            className={`w-full px-3 py-2.5 rounded-lg border ${errors.course ? 'border-red-500' : 'border-slate-200'} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium appearance-none text-sm`}
                                                        >
                                                            <option value="">Select a course</option>
                                                            <option value="Engineering">Engineering</option>
                                                            <option value="Foundation">Foundation</option>
                                                            <option value="Medical">Medical</option>
                                                            <option value="NCRP">NCRP</option>
                                                        </select>
                                                        <ChevronDownIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                                    </div>
                                                    {errors.course && <p className="text-red-500 text-xs font-bold ml-1">{errors.course}</p>}
                                                </div>

                                                {/* Centre Name */}
                                                <div className="space-y-2">
                                                    <label htmlFor="centername" className="text-sm font-bold text-slate-700 ml-1">
                                                        Centre Name <span className="text-orange-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            id="centername"
                                                            value={formData.center_name}
                                                            onChange={handleChange}
                                                            required
                                                            className={`w-full px-3 py-2.5 rounded-lg border ${errors.center_name ? 'border-red-500' : 'border-slate-200'} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium appearance-none text-sm`}
                                                        >
                                                            <option value="">Select a centre</option>
                                                            {centres.map((centre) => (
                                                                <option key={centre.id || centre._id} value={centre.centre}>
                                                                    {centre.centre}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                    </div>
                                                    {errors.center_name && <p className="text-red-500 text-xs font-bold ml-1">{errors.center_name}</p>}
                                                </div>
                                            </div>

                                            {/* Message */}
                                            <div className="space-y-2">
                                                <label htmlFor="floatingTextarea2" className="text-sm font-bold text-slate-700 ml-1">
                                                    Your Message
                                                </label>
                                                <textarea
                                                    id="floatingTextarea2"
                                                    rows="2"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    className={`w-full px-3 py-2.5 rounded-lg border ${errors.message ? 'border-red-500' : 'border-slate-200'} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium resize-none text-sm`}
                                                    placeholder="Tell us how we can help..."
                                                ></textarea>
                                                {errors.message && <p className="text-red-500 text-xs font-bold ml-1">{errors.message}</p>}
                                            </div>

                                            {/* reCAPTCHA */}
                                            <div className="flex justify-center md:justify-start py-2">
                                                <ReCAPTCHA
                                                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LdGdd8sAAAAAGnXDx7IDnHOiOWDtF9yQ4pVvwYD"}
                                                    onChange={onCaptchaChange}
                                                />
                                            </div>

                                            <motion.button
                                                type="submit"
                                                disabled={isSubmitting}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black rounded-lg shadow-xl shadow-orange-600/20 hover:shadow-orange-600/40 transition-all duration-300 disabled:opacity-50 text-base tracking-tight"
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center justify-center gap-3">
                                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        <span>Sending...</span>
                                                    </div>
                                                ) : (
                                                    "Send Message"
                                                )}
                                            </motion.button>
                                        </form>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {showMessage && submitMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-l-4 ${submitMessage.includes("success") || submitMessage.includes("Thank")
                                ? "bg-white border-green-500 text-slate-900"
                                : "bg-white border-red-500 text-slate-900"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${submitMessage.includes("success") || submitMessage.includes("Thank")
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                                }`}>
                                {submitMessage.includes("success") || submitMessage.includes("Thank") ? (
                                    <MapPinIcon className="w-6 h-6" />
                                ) : (
                                    <div className="font-bold">!</div>
                                )}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 leading-tight">
                                    {submitMessage.includes("success") || submitMessage.includes("Thank") ? "Message Sent!" : "Error"}
                                </p>
                                <p className="text-sm font-medium text-slate-500">{submitMessage}</p>
                            </div>
                            <button onClick={handleCloseMessage} className="ml-4 text-slate-400 hover:text-slate-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
};

// FAQ Item Component with Accordion
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
                <span className="font-semibold text-slate-900 pr-4">{question}</span>
                <motion.svg
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-5 h-5 text-orange-600 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
            </button>
            <motion.div
                initial={false}
                animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                    {answer}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ContactUs;
