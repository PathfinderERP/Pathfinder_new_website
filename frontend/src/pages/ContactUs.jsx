import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ClockIcon
} from "@heroicons/react/24/outline";
import { centresAPI } from "../services/api";
import { centerdata } from "../data/data";

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
        <div className="min-h-screen bg-white pt-[70px] lg:pt-[100px]">
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
                                        You can call on Pathfinder's official Contact No. <span className="font-bold text-orange-600 text-xl tracking-tight">9147178888</span> (24x7).
                                    </p>
                                </div>
                                <p>
                                    If the phone is busy, we're resolving someone else's queries. We request you to contact us again after 15 minutes so that we can address your query or concern you may have regarding lecturers or course material. Your suggestions will help us improve and give all children a bright future.
                                </p>
                                <p>
                                    In case of any grievance, don't hesitate to get in touch with us at <a href="mailto:info@pathfinder.edu.in" className="text-orange-600 hover:text-orange-700 font-bold underline decoration-2 underline-offset-4">info@pathfinder.edu.in</a>
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

            {/* FAQ Section */}
            <section className="py-12 md:py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12">
                            Frequently Asked <span className="text-orange-600">Questions</span>
                        </h2>

                        <div className="space-y-4">
                            {[
                                {
                                    question: "How do I contact a Pathfinder counsellor?",
                                    answer: "You can contact our counsellors by calling our 24x7 helpline at 9147178888 or by emailing us at info@pathfinder.edu.in. You can also visit any of our centres during working hours (Mon-Sat: 9:00 AM - 8:00 PM) for in-person counselling."
                                },
                                {
                                    question: "What is the official website of Pathfinder?",
                                    answer: "The official website of Pathfinder is www.pathfinder.edu.in. Please be cautious of fake websites and always verify the URL before sharing any personal information."
                                },
                                {
                                    question: "How can I contact the Pathfinder customer care?",
                                    answer: "You can reach our customer care team through multiple channels: Call us at 9147178888 (24x7), email us at info@pathfinder.edu.in, or visit the nearest Pathfinder centre. Our team aims to resolve all queries within 7 days."
                                },
                                {
                                    question: "How will I get my doubts answered?",
                                    answer: "We provide 24x7 doubt support through our online platform. You can also attend doubt-clearing sessions at our centres, connect with faculty during class hours, or use our dedicated doubt resolution portal available to all enrolled students."
                                },
                                {
                                    question: "What Competitive mentorship does Pathfinder Hazra provide?",
                                    answer: "Pathfinder Hazra provides comprehensive mentorship for JEE, NEET, and other competitive exams. Our mentorship includes personalized study plans, regular performance tracking, one-on-one counselling sessions, and guidance from experienced faculty who are experts in their respective fields."
                                }
                            ].map((faq, index) => (
                                <FAQItem key={index} question={faq.question} answer={faq.answer} />
                            ))}
                        </div>
                    </motion.div>
                </div>
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
