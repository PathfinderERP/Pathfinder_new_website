import React, { useMemo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useCountUp } from "../hooks/useCountUp";
import { useCachedData } from "../hooks/useCachedData";
import { HeroCarousel } from "../components/Carousal";
import { centerdata } from "../data/data";
import { reelsData, reelstab } from "../data/reelsdata";
import { ChevronUp, Heart, Volume2, VolumeX, Play, Pause } from "lucide-react";
import ApplicationForm from "./Student/Applynow";
import { useAuth } from "../contexts/AuthContext";
import { centresAPI, coursesAPI } from "../services/api";

// Helper function to normalize strings for comparison
const normalizeStr = (str) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

import { Skeleton, FadeInImage } from "../components/common/OptimizedImage";

// Path-Verse Overview — CLEAN SINGLE-FILE PREVIEW

// Path-Verse Overview — CLEAN SINGLE-FILE PREVIEW
// Fixes: removed corrupted JSX, completed closing tags (incl. <div className=...>),
// simplified nav (no broken mega menu), and added lightweight runtime tests.
// Tailwind classes assumed. No external deps.

/********************
 * ROOT
 *******************/
export default function PathVerseOverview() {
  const [selectedState, setSelectedState] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedCentre, setSelectedCentre] = useState("hazra");

  const locationFilterRef = useRef(null);

  // Fetch and cache centres at root for shared access
  const { data: centres, loading: loadingCentres } = useCachedData(
    "centres",
    () => centresAPI.getAll(),
    {
      onSuccess: (data) => {
        const processedCentres = (data || []).map(backendCentre => {
          if (backendCentre.map_url || backendCentre.google_map_url) return backendCentre;
          const match = centerdata.find(staticCentre => {
            const bName = normalizeStr(backendCentre.centre);
            const sName = normalizeStr(staticCentre.name);
            return bName.includes(sName) || sName.includes(bName);
          });
          return match && match.mapEmbed ? { ...backendCentre, mapEmbed: match.mapEmbed } : backendCentre;
        });
        return processedCentres;
      }
    }
  );



  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth lg:mt-20">
      {/* MAIN CONTENT */}
      <Hero />
      <KPIRibbon />
      <Pillars />

      {/* LOCATION FILTER - Hidden, logic only */}
      <div style={{ display: 'none' }}>
        <LocationFilter
          ref={locationFilterRef}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedCentre={selectedCentre}
          setSelectedCentre={setSelectedCentre}
          centres={centres}
          loadingCentres={loadingCentres}
        />
      </div>

      {/* FILTERED SECTIONS */}
      <CoursesSection
        triggerLocationDetection={() => locationFilterRef.current?.detectLocation()}
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        selectedLocation={selectedLocation}
        selectedCentre={selectedCentre}
      />
      <ResultsSection
        selectedLocation={selectedLocation}
        selectedCentre={selectedCentre}
      />
      <Reels audience="Student" />
      <CentersSection
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        selectedLocation={selectedLocation}
        selectedCentre={selectedCentre}
        centres={centres}
        loadingCentres={loadingCentres}
      />
      <Students />
      <Admissions />
      <Events />
      <Lumos />
      <PathTex />
      <Blog />
      <Community />
      <FAQ />
      <FinalCTA />


    </div>
  );
}

// REMOVE THE DUPLICATE HomePage COMPONENT ENTIRELY
// DELETE THIS ENTIRE HomePage FUNCTION
// REMOVE THE DUPLICATE HomePage COMPONENT ENTIRELY
// DELETE THIS ENTIRE HomePage FUNCTION

/********************
 * CUSTOM HOOK
 *******************/

/********************
 * HERO
 *******************/
// Usage in Hero component
function Hero() {
  return (
    <section
      id="hero"
      className="bg-white pt-20 pb-8 sm:pt-24 sm:pb-12 md:pt-28 md:pb-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Mobile: Single column layout with full width content */}
        <div className="block md:hidden">
          {/* Header starts from extreme left */}
          <div className="w-full mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-3xl font-extrabold leading-tight text-left"
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block"
              >
                Born in Bengal.
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-orange-500 block mt-1 relative"
              >
                Built for the Best.
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%]"
                  animate={{ translateX: ["200%", "-200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                />
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-4 text-base text-slate-600 text-left leading-relaxed"
            >
              From Class 6 to IIT/AIIMS — mentorship, rigor, and results at
              scale.
            </motion.p>
          </div>

          {/* Carousel comes right after header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="w-full mb-10"
          >
            <HeroCarousel />
          </motion.div>

          {/* Buttons - Full width on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="w-full mb-6"
          >
            <div className="flex flex-col gap-3">
              <a
                href="#apply"
                className="w-full px-6 py-4 rounded-xl bg-[#66090D] text-white hover:bg-[#55080b] transition-all duration-300 text-center font-semibold text-base shadow-lg"
              >
                Apply Now
              </a>
              <a
                href="#admissions"
                className="w-full px-6 py-4 rounded-xl border border-slate-300 hover:border-orange-400 hover:bg-slate-50 transition-all duration-300 text-center font-medium"
              >
                Book Counselling
              </a>
              <a
                href="#events"
                className="w-full px-6 py-4 rounded-xl border border-slate-300 hover:border-orange-400 hover:bg-slate-50 transition-all duration-300 text-center font-medium"
              >
                Try Free Mock
              </a>
            </div>
          </motion.div>

          {/* Stats - Compact mobile design */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="w-full mb-6"
          >
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="font-bold text-sm text-slate-900">2.37L+</div>
                  <div className="text-xs text-slate-600 mt-1">Families</div>
                </div>
                <div className="border-l border-r border-slate-200">
                  <div className="font-bold text-sm text-slate-900">+21.3%</div>
                  <div className="text-xs text-slate-600 mt-1">Avg Uplift</div>
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">4.7★</div>
                  <div className="text-xs text-slate-600 mt-1">Centers</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trust Badges - Compact mobile version */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.6 }}
            className="w-full"
          >
            <div className="flex items-center justify-start gap-4">
              <div className="flex items-center gap-1 text-slate-500">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                ></motion.div>
                <span className="text-xs font-medium">Trusted</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  className="w-1.5 h-1.5 bg-red-500 rounded-full"
                ></motion.div>
                <span className="text-xs font-medium">Verified</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  className="w-1.5 h-1.5 bg-yellow-500 rounded-full"
                ></motion.div>
                <span className="text-xs font-medium">Awarded</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Desktop: Original grid layout */}
        <div className="hidden md:grid md:grid-cols-2 gap-10 md:gap-12 items-center">
          <div className="order-1 md:order-1">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-5xl font-extrabold leading-tight text-center md:text-left"
            >
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="inline-block"
              >
                Born in Bengal.
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="text-orange-500 block md:inline relative overflow-hidden"
              >
                Built for the Best.
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-200%]"
                  animate={{ translateX: ["200%", "-200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                />
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-5 sm:mt-6 text-lg sm:text-xl text-slate-600 text-center md:text-left leading-relaxed"
            >
              From Class 6 to IIT/AIIMS — mentorship, rigor, and results at
              scale.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <a
                href="#apply"
                className="px-8 py-4 rounded-2xl bg-[#66090D] text-white hover:bg-[#55080b] transition-all duration-300 text-center font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105"
              >
                Apply Now
              </a>
              <div className="flex flex-row gap-3 justify-center md:justify-start">
                <a
                  href="#admissions"
                  className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 hover:border-orange-400 hover:bg-slate-50 transition-all duration-300 text-center font-medium hover:shadow-lg"
                >
                  Book Counselling
                </a>
                <a
                  href="#events"
                  className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 hover:border-orange-400 hover:bg-slate-50 transition-all duration-300 text-center font-medium hover:shadow-lg"
                >
                  Try Free Mock
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-700">
                <div className="text-center sm:text-left">
                  <div className="font-bold text-lg text-slate-900">
                    2,37,000+
                  </div>
                  <div className="text-slate-600">Families</div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-slate-300"></div>
                <div className="text-center sm:text-left">
                  <div className="font-bold text-lg text-slate-900">+21.3%</div>
                  <div className="text-slate-600">Avg Uplift</div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-slate-300"></div>
                <div className="text-center sm:text-left">
                  <div className="font-bold text-lg text-slate-900">4.7★</div>
                  <div className="text-slate-600">Centers</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.9 }}
              className="mt-6 flex items-center justify-center md:justify-start gap-4"
            >
              <div className="flex items-center gap-2 text-slate-500">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-orange-500 rounded-full"
                ></motion.div>
                <span className="text-sm font-medium">Trusted</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                ></motion.div>
                <span className="text-sm font-medium">Verified</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  className="w-2 h-2 bg-yellow-500 rounded-full"
                ></motion.div>
                <span className="text-sm font-medium">Awarded</span>
              </div>
            </motion.div>
          </div>

          <div className="order-2 md:order-2 mt-4 sm:mt-8 md:mt-0">
            <HeroCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}

/********************
 * KPI RIBBON
 *******************/
function KPIRibbon() {
  const stats = [
    { label: "Students Taught", value: "237000", suffix: "+" },
    { label: "Toppers Made", value: "5193", suffix: "+" },
    { label: "Avg Score Uplift", value: "21.3", suffix: "%" },
    { label: "Centers", value: "42", suffix: "+" },
    { label: "Scholarships Awarded", value: "17856", suffix: "+" },
    { label: "Mock Attempts", value: "921345", suffix: "+" },
  ];

  return (
    <section id="kpis" className="border-y border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {stats.map((s) => (
          <KPICard key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}

function KPICard({ label, value, suffix }) {
  const v = useCountUp(value, 700);
  return (
    <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50 hover:bg-white text-center">
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-2xl sm:text-3xl font-bold">
          {Number.isFinite(v) ? v.toLocaleString() : value.toLocaleString()}
        </span>
        {suffix && (
          <span className="text-3xl sm:text-4xl font-extrabold text-orange-600 leading-none">
            {suffix}
          </span>
        )}
      </div>
      <div className="text-slate-600 text-sm mt-1">{label}</div>
    </div>
  );
}

/********************
 * PILLARS
 *******************/
function Pillars() {
  const items = [
    {
      title: "Mentorship",
      sub: "Elite teachers who build champions.",
      icon: "🎓",
    },
    {
      title: "Systems",
      sub: "Doubt-clearing, mocks, analytics, routines.",
      icon: "⚙️",
    },
    {
      title: "Community",
      sub: "A tribe that compounds your effort.",
      icon: "🌱",
    },
  ];
  return (
    <section id="pillars" className="py-12 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-3 gap-4">
        {items.map((i) => (
          <div
            key={i.title}
            className="rounded-2xl border border-slate-200 p-6 bg-white hover:shadow-md"
          >
            <div className="text-2xl">{i.icon}</div>
            <div className="mt-2 font-semibold text-lg">{i.title}</div>
            <div className="text-slate-600">{i.sub}</div>
            <a href="#about" className="inline-block mt-3 text-orange-600 font-medium hover:text-orange-700">
              Learn more →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
// ------------------------------new 12-11-25--------
// Helper to extract coordinates from Google Maps Embed URL
const extractCoordsFromUrl = (url) => {
  if (!url) return null;
  // Handle iframe src if entire iframe tag is pasted
  let targetUrl = url;
  if (url.includes("<iframe")) {
    const srcMatch = url.match(/src="([^"]+)"/);
    if (srcMatch) targetUrl = srcMatch[1];
  }

  // Look for !3d{lat} and !2d{lng} patterns
  const latMatch = targetUrl.match(/!3d\s*([-0-9.]+)/);
  const lngMatch = targetUrl.match(/!2d\s*([-0-9.]+)/);

  if (latMatch && lngMatch) {
    return {
      lat: parseFloat(latMatch[1]),
      lng: parseFloat(lngMatch[1])
    };
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

// Main Home Component with Location Filter
const LocationFilter = forwardRef(({
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  selectedLocation,
  setSelectedLocation,
  selectedCentre,
  setSelectedCentre,
  centres,
  loadingCentres,
}, ref) => {
  const [showOnlineCourses, setShowOnlineCourses] = useState(false);
  const [previousFilters, setPreviousFilters] = useState(null);
  const [userHasChangedFilters, setUserHasChangedFilters] = useState(false); // Track if user manually changed filters
  const [detectingLocation, setDetectingLocation] = useState(false); // New state for location detection

  const isInitialized = useRef(false);
  const defaultHazraSet = useRef(false); // Track if default Hazra was set
  const initialFiltersSet = useRef(false); // Track if initial filters were set
  const isRestoringFilters = useRef(false); // Track if we're currently restoring filters

  // Effect for default Hazra selection when data arrives
  useEffect(() => {
    if (centres && centres.length > 0 && !isInitialized.current && !defaultHazraSet.current) {
      const hazraCentre = centres.find(c => c.centre?.toLowerCase() === "hazra");
      if (hazraCentre) {
        if (hazraCentre.state) setSelectedState(hazraCentre.state);
        if (hazraCentre.district) setSelectedDistrict(hazraCentre.district);
        setSelectedCentre("hazra");
        defaultHazraSet.current = true;
        initialFiltersSet.current = true;
      }
      setTimeout(() => {
        isInitialized.current = true;
      }, 100);
    }
  }, [centres, setSelectedState, setSelectedDistrict, setSelectedCentre]);

  // Expose detectLocation to parent
  useImperativeHandle(ref, () => ({
    detectLocation: handleDetectLocation
  }));

  // Handle Detect Location click
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    console.log("📍 [LOCATION] Starting location detection...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        console.log("📍 [LOCATION] User coords:", { lat: userLat, lng: userLng });
        console.log(`🌍 [LOCATION] Verify your location on map: https://www.google.com/maps/search/?api=1&query=${userLat},${userLng}`);

        let nearestCentre = null;
        let minDistance = Infinity;

        // Debug: Log the first centre to see its structure
        if (centres.length > 0) {
          console.log("🔍 [LOCATION-DEBUG] First centre structure:", Object.keys(centres[0]));
        }

        // Calculate distances to all valid centres
        const centresWithDistance = [];
        console.group("📏 [LOCATION] Distances Calculated:");

        centres.forEach((centre) => {
          let lat, lng;
          // ... (existing url extraction logic) ... 
          // Re-using existing loop logic but refactoring slightly to capture all distances
          const url = centre.map_url || centre.google_map_url || centre.mapEmbed || centre.map || centre.location;
          if (!url) return;

          const coords = extractCoordsFromUrl(url);
          if (coords) {
            const dist = calculateDistance(userLat, userLng, coords.lat, coords.lng);
            centresWithDistance.push({ ...centre, distance: dist });
            console.log(`${centre.centre || centre.name}: ${dist.toFixed(3)} km`);
          }
        });
        console.groupEnd();

        // Sort by distance
        centresWithDistance.sort((a, b) => a.distance - b.distance);

        if (centresWithDistance.length > 0) {
          nearestCentre = centresWithDistance[0];
          minDistance = nearestCentre.distance;

          console.log(`📍 [LOCATION] Winner: ${nearestCentre.centre} (${minDistance.toFixed(2)} km)`);
          if (centresWithDistance.length > 1) {
            console.log(`🥈 Runner Up: ${centresWithDistance[1].centre} (${centresWithDistance[1].distance.toFixed(2)} km)`);
          }
          if (centresWithDistance.length > 2) {
            console.log(`🥉 Third Place: ${centresWithDistance[2].centre} (${centresWithDistance[2].distance.toFixed(2)} km)`);
          }

          if (showOnlineCourses) {
            setShowOnlineCourses(false);
          }

          // Update states to the nearest centre
          if (nearestCentre.state) setSelectedState(nearestCentre.state);
          if (nearestCentre.district) setSelectedDistrict(nearestCentre.district);
          if (nearestCentre.centre) setSelectedCentre(nearestCentre.centre.toLowerCase());

          // Mark as user change since they explicitly asked for detection
          setUserHasChangedFilters(true);

        } else {
          console.warn("📍 [LOCATION] No centres with valid coordinates found.");
          alert("Sorry, we couldn't find a centre near you with valid location data.");
        }
        setDetectingLocation(false);
      },
      (error) => {
        console.error("❌ [LOCATION] Error getting location:", error);
        let msg = "Unable to retrieve your location.";
        if (error.code === 1) msg = "Location permission denied.";
        else if (error.code === 2) msg = "Location unavailable.";
        else if (error.code === 3) msg = "Location request timed out.";
        alert(msg);
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Track when user manually changes filters
  useEffect(() => {
    if (isInitialized.current && !showOnlineCourses && initialFiltersSet.current && !isRestoringFilters.current) {
      // If filters are different from default Hazra, user has made changes
      const hazraCentre = centres.find(c => c.centre?.toLowerCase() === "hazra");
      if (hazraCentre) {
        const isDefaultHazra =
          selectedState === hazraCentre.state &&
          selectedDistrict === hazraCentre.district &&
          selectedCentre === "hazra";

        // Check if user selected a specific centre (not "all")
        const hasSpecificCentreSelected = selectedCentre !== "all" && selectedCentre !== "hazra";

        // Only mark as user change if:
        // 1. Not default Hazra AND
        // 2. Either has a specific centre selected OR state/district changed from Hazra's location
        const stateOrDistrictChanged =
          selectedState !== hazraCentre.state ||
          selectedDistrict !== hazraCentre.district;

        if (!isDefaultHazra && defaultHazraSet.current && !userHasChangedFilters) {
          // User made a change if they selected a specific centre OR changed state/district
          if (hasSpecificCentreSelected || (stateOrDistrictChanged && selectedCentre !== "all")) {
            setUserHasChangedFilters(true);
            console.log("👤 [USER-ACTION] User has manually changed filters!");
          }
        }
      }
    }
  }, [selectedState, selectedDistrict, selectedCentre, showOnlineCourses, centres, userHasChangedFilters]);

  // Handle Online Courses button click
  const handleOnlineCoursesClick = () => {
    // Only save filters if user has manually changed them
    if (userHasChangedFilters) {
      const savedFilters = {
        state: selectedState,
        district: selectedDistrict,
        centre: selectedCentre
      };
      setPreviousFilters(savedFilters);
    } else {
      setPreviousFilters(null);
    }

    setShowOnlineCourses(true);
    setSelectedCentre("online");
  };

  // Handle Back to All Courses button click
  const handleBackToAllCourses = () => {
    // Set restoration flag to prevent auto-reset logic from interfering
    isRestoringFilters.current = true;

    setShowOnlineCourses(false);

    // Restore previous filters if user had manually selected them
    if (previousFilters && userHasChangedFilters) {
      setSelectedState(previousFilters.state);
      setSelectedDistrict(previousFilters.district);
      setSelectedCentre(previousFilters.centre);
    } else {
      // User never changed filters, restore default Hazra
      const hazraCentre = centres.find(c => c.centre?.toLowerCase() === "hazra");
      if (hazraCentre) {
        setSelectedState(hazraCentre.state || "All");
        setSelectedDistrict(hazraCentre.district || "All");
        setSelectedCentre("hazra");
      } else {
        setSelectedState("All");
        setSelectedDistrict("All");
        setSelectedCentre("all");
      }
    }

    // Clear restoration flag after a short delay to allow state updates to complete
    setTimeout(() => {
      isRestoringFilters.current = false;
    }, 200);
  };

  // Get unique states from centres data
  const allStates = useMemo(() => {
    const states = ["All"];
    const uniqueStates = new Set();

    centres.forEach((centre) => {
      if (centre.state && centre.state.trim() !== "") {
        uniqueStates.add(centre.state);
      }
    });

    return [...states, ...Array.from(uniqueStates).sort()];
  }, [centres]);

  // Get unique districts based on selected state
  const availableDistricts = useMemo(() => {
    if (selectedState === "All") return ["All"];

    const districts = ["All"];
    const uniqueDistricts = new Set();

    centres.forEach((centre) => {
      if (
        centre.state === selectedState &&
        centre.district &&
        centre.district.trim() !== ""
      ) {
        uniqueDistricts.add(centre.district);
      }
    });

    return [...districts, ...Array.from(uniqueDistricts).sort()];
  }, [centres, selectedState]);

  // Get filtered centres based on state and district selection
  const filteredCentres = useMemo(() => {
    if (!centres || centres.length === 0) return [];

    return centres.filter((centre) => {
      // Filter by state
      if (selectedState !== "All" && centre.state !== selectedState) {
        return false;
      }

      // Filter by district
      if (selectedDistrict !== "All" && centre.district !== selectedDistrict) {
        return false;
      }

      return true;
    });
  }, [centres, selectedState, selectedDistrict]);

  // Get unique centre names for dropdown
  const availableCentres = useMemo(() => {
    const centreNames = ["All"];
    const uniqueCentres = new Set();

    filteredCentres.forEach((centre) => {
      if (centre.centre && centre.centre.trim() !== "") {
        uniqueCentres.add(centre.centre);
      }
    });

    return [...centreNames, ...Array.from(uniqueCentres).sort()];
  }, [filteredCentres]);

  // Reset district and centre when state changes (only when not in online mode)
  useEffect(() => {
    // Skip during initial setup, if showing online courses, or if restoring filters
    if (!isInitialized.current || showOnlineCourses || isRestoringFilters.current) return;

    if (selectedState === "All") {
      setSelectedDistrict("All");
      setSelectedCentre("all");
      // Reset user change flag when going back to "All"
      setUserHasChangedFilters(false);
    } else {
      // Check if current selectedDistrict is valid in the new availableDistricts
      const isDistrictValid = availableDistricts.includes(selectedDistrict);

      if (!isDistrictValid && selectedDistrict !== "All") {
        // Auto-select first district if only one exists
        if (availableDistricts.length === 2) {
          setSelectedDistrict(availableDistricts[1]);
        } else {
          setSelectedDistrict("All");
        }
      }
    }
  }, [selectedState, availableDistricts, showOnlineCourses, selectedDistrict]);

  // Reset centre when district changes (only when not in online mode)
  useEffect(() => {
    // Skip during initial setup, if showing online courses, or if restoring filters
    if (!isInitialized.current || showOnlineCourses || isRestoringFilters.current) return;

    if (selectedDistrict === "All") {
      setSelectedCentre("all");
    } else {
      // Check if current selectedCentre is valid in the new availableCentres
      // availableCentres has Title Case names, selectedCentre is lowercase
      const isCentreValid = availableCentres.some(c => c.toLowerCase() === selectedCentre);

      if (!isCentreValid && selectedCentre !== "all") {
        // Auto-select first centre if only one exists
        if (availableCentres.length === 2) {
          const centreName = availableCentres[1].toLowerCase();
          setSelectedCentre(centreName);
        } else {
          setSelectedCentre("all");
        }
      }
    }
  }, [selectedDistrict, availableCentres, showOnlineCourses, selectedCentre]);

  // Debug log for important state changes only
  useEffect(() => {
    if (isInitialized.current) {
      console.log("📊 [STATE] Filter state updated:", {
        mode: showOnlineCourses ? "ONLINE" : "LOCATION",
        selectedState,
        selectedDistrict,
        selectedCentre,
        userHasChangedFilters,
        hasPreviousFilters: !!previousFilters
      });
    }
  }, [showOnlineCourses, selectedState, selectedDistrict, selectedCentre]);

  return (
    <div className="bg-gradient-to-br from-white to-orange-50/30 border-b border-slate-200/60 shadow-lg shadow-orange-100/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Discover Programs
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {showOnlineCourses
                  ? "Viewing online courses"
                  : "Filter by location or detect to find courses near you"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Detect Location Button */}
            {!showOnlineCourses && (
              <button
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {detectingLocation ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Detecting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Detect My Location
                  </>
                )}
              </button>
            )}

            {/* Online Courses Toggle Button */}
            {!showOnlineCourses ? (
              <button
                onClick={handleOnlineCoursesClick}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Online Courses
              </button>
            ) : (
              <button
                onClick={handleBackToAllCourses}
                className="px-5 py-2.5 bg-gradient-to-r from-gray-500 to-slate-600 text-white rounded-lg font-medium hover:from-gray-600 hover:to-slate-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Back to Location
              </button>
            )}
          </div>
        </div>

        {showOnlineCourses ? (
          /* Compact Online Courses Mode */
          <div className="mb-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Online Courses</h3>
                  <p className="text-sm text-slate-600">Virtual classroom - Learn from anywhere</p>
                </div>
              </div>
              <div className="text-sm text-slate-600">
                Centre: <span className="font-semibold text-orange-700">Online</span>
              </div>
            </div>
          </div>
        ) : (
          /* Regular Location Filters */
          <>
            {/* Filter Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* State Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  State / Region
                </label>
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm transition-all duration-300 appearance-none cursor-pointer hover:border-orange-300 hover:shadow-md"
                  >
                    {loadingCentres ? (
                      <option value="">Loading states...</option>
                    ) : allStates.length === 0 ? (
                      <option value="">No states available</option>
                    ) : (
                      allStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {!loadingCentres && (
                  <p className="text-xs text-slate-500 mt-1">
                    {allStates.length - 1} state(s) available
                  </p>
                )}
              </div>

              {/* District Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                  </div>
                  District / Zone
                </label>
                <div className="relative">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm transition-all duration-300 appearance-none cursor-pointer hover:border-red-300 hover:shadow-md disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={selectedState === "All" || loadingCentres}
                  >
                    {loadingCentres ? (
                      <option value="">Loading districts...</option>
                    ) : availableDistricts.length === 0 ? (
                      <option value="">No districts available</option>
                    ) : (
                      availableDistricts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {!loadingCentres && selectedState !== "All" && (
                  <p className="text-xs text-slate-500 mt-1">
                    {availableDistricts.length - 1} district(s) available
                  </p>
                )}
              </div>

              {/* Centre Filter */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  Centre
                </label>
                <div className="relative">
                  <select
                    value={selectedCentre}
                    onChange={(e) => setSelectedCentre(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm transition-all duration-300 appearance-none cursor-pointer hover:border-orange-300 hover:shadow-md disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={
                      selectedState === "All" ||
                      loadingCentres ||
                      availableCentres.length === 1
                    }
                  >
                    {loadingCentres ? (
                      <option value="">Loading centres...</option>
                    ) : selectedState === "All" ? (
                      <option value="">Select state first</option>
                    ) : availableCentres.length === 0 ? (
                      <option value="">No centres available</option>
                    ) : (
                      availableCentres.map((centre) => (
                        <option key={centre} value={centre.toLowerCase()}>
                          {centre}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {!loadingCentres && selectedState !== "All" && (
                  <p className="text-xs text-slate-500 mt-1">
                    {availableCentres.length - 1} centre(s) available
                  </p>
                )}
              </div>
            </div>

            {/* Active Filters & Summary */}
            <div className="p-5 bg-white/80 rounded-2xl border border-slate-200/60 backdrop-blur-sm shadow-sm">
              {/* Active Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                  Active Filters
                </span>

                {selectedState !== "All" && (
                  <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-orange-200 shadow-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>State: {selectedState}</span>
                    <button
                      onClick={() => setSelectedState("All")}
                      className="text-orange-500 hover:text-orange-700 ml-1 transition-colors p-1 rounded-full hover:bg-orange-100"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                )}

                {selectedDistrict !== "All" && (
                  <span className="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-200 shadow-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>District: {selectedDistrict}</span>
                    <button
                      onClick={() => setSelectedDistrict("All")}
                      className="text-red-500 hover:text-red-700 ml-1 transition-colors p-1 rounded-full hover:bg-red-100"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                )}

                {selectedCentre !== "all" && selectedCentre !== "" && selectedCentre !== "online" && (
                  <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-orange-200 shadow-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Centre: {selectedCentre}</span>
                    <button
                      onClick={() => setSelectedCentre("all")}
                      className="text-orange-500 hover:text-orange-700 ml-1 transition-colors p-1 rounded-full hover:bg-orange-100"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                )}
              </div>

              {/* Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="text-sm text-slate-600">
                  Currently viewing:{" "}
                  <span className="font-semibold text-slate-800">
                    {selectedState === "All" ? "All States" : selectedState}
                    {selectedDistrict !== "All" && ` → ${selectedDistrict}`}
                    {selectedCentre !== "all" &&
                      selectedCentre !== "" &&
                      selectedCentre !== "online" &&
                      ` → ${selectedCentre}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg font-medium">
                    {selectedState === "All"
                      ? `${allStates.length - 1} state(s) available`
                      : `${availableCentres.length - 1} centre(s) available`}
                  </div>
                  {(selectedState !== "All" ||
                    selectedDistrict !== "All" ||
                    (selectedCentre !== "all" && selectedCentre !== "" && selectedCentre !== "online")) && (
                      <button
                        onClick={() => {
                          setSelectedState("All");
                          setSelectedDistrict("All");
                          setSelectedCentre("all");
                        }}
                        className="text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1 font-medium"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Clear filters
                      </button>
                    )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

function CoursesSection({ selectedState, selectedDistrict, selectedLocation, selectedCentre, triggerLocationDetection }) {

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Filter States
  const [selectedCourseName, setSelectedCourseName] = useState("All");
  const [selectedClassLevel, setSelectedClassLevel] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("All");
  const [sortBy, setSortBy] = useState("default");


  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftValue = useRef(0);


  const handleMouseDown = (e) => {
    isDown.current = true;
    setIsDragging(true);
    sliderRef.current.classList.add("active");
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftValue.current = sliderRef.current.scrollLeft;
    setIsPaused(true); // Pause on manual interaction
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    setIsDragging(false);
    sliderRef.current?.classList.remove("active");
  };

  const handleMouseUp = () => {
    isDown.current = false;
    setIsDragging(false);
    sliderRef.current?.classList.remove("active");
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // scroll-fast
    sliderRef.current.scrollLeft = scrollLeftValue.current - walk;
  };

  const { data: courses, loading, error } = useCachedData(
    "courses",
    () => coursesAPI.getAll(),
    {
      onSuccess: (data) => Array.isArray(data) ? data : []
    }
  );

  const navigate = useNavigate();
  const { user, token, isLoading } = useAuth();

  // Format class level to add "Class" prefix if it's only digits
  const formatClassLevel = (level) => {
    if (!level) return "Not specified";
    // If level is only digits, add "Class" prefix
    if (/^\d+$/.test(level.toString().trim())) {
      return `Class ${level}`;
    }
    return level;
  };

  // First, filter courses by location (state, district, centre) to get base set
  const locationFilteredCourses = useMemo(() => {
    console.log("🗺️ [COURSES] Filtering by location first:", {
      selectedState,
      selectedDistrict,
      selectedCentre,
      totalCourses: courses.length
    });

    return courses.filter((course) => {
      // State Filter
      if (selectedState && selectedState !== "All") {
        if (course.state && course.state !== selectedState) {
          return false;
        }
      }

      // District Filter
      if (selectedDistrict && selectedDistrict !== "All") {
        if (course.district && course.district !== selectedDistrict) {
          return false;
        }
      }

      // Centre Filter
      if (selectedCentre && selectedCentre !== "all" && selectedCentre !== "") {
        if (selectedCentre === "online") {
          if (course.centre?.toLowerCase() !== "online" && course.location !== "Online") {
            return false;
          }
        } else {
          if (course.centre?.toLowerCase() !== selectedCentre.toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [courses, selectedState, selectedDistrict, selectedCentre]);

  // Log location-filtered results
  useEffect(() => {
    console.log("✅ [COURSES] Location-filtered courses:", locationFilteredCourses.length, "courses");
  }, [locationFilteredCourses]);

  // Extract unique filter options from LOCATION-FILTERED courses only
  const uniqueCourseNames = useMemo(() => {
    const names = [...new Set(locationFilteredCourses.map((c) => c.name))];
    const result = ["All", ...names.filter(Boolean).sort()];
    console.log("📋 [COURSES] Available course names for this location:", result.length - 1);
    return result;
  }, [locationFilteredCourses]);

  const uniqueClassLevels = useMemo(() => {
    // Start with location-filtered courses, then filter by course name if selected
    const filteredByCourse =
      selectedCourseName === "All"
        ? locationFilteredCourses
        : locationFilteredCourses.filter((c) => c.name === selectedCourseName);

    const levels = [...new Set(filteredByCourse.map((c) => c.class_level))];
    const result = ["All", ...levels.filter(Boolean).sort()];
    console.log("📋 [COURSES] Available class levels for this selection:", result.length - 1);
    return result;
  }, [locationFilteredCourses, selectedCourseName]);

  const uniqueDurations = useMemo(() => {
    // Start with location-filtered courses, then apply course name and class level filters
    let filtered = locationFilteredCourses;
    if (selectedCourseName !== "All") {
      filtered = filtered.filter((c) => c.name === selectedCourseName);
    }
    if (selectedClassLevel !== "All") {
      filtered = filtered.filter((c) => c.class_level === selectedClassLevel);
    }

    const durations = [...new Set(filtered.map((c) => c.duration))];
    const result = ["All", ...durations.filter(Boolean).sort()];
    console.log("📋 [COURSES] Available durations for this selection:", result.length - 1);
    return result;
  }, [locationFilteredCourses, selectedCourseName, selectedClassLevel]);

  // Reset dependent filters when parent filter changes
  useEffect(() => {
    setSelectedClassLevel("All");
    setSelectedDuration("All");
  }, [selectedCourseName]);

  useEffect(() => {
    setSelectedDuration("All");
  }, [selectedClassLevel]);

  // Also reset course filters when location changes
  useEffect(() => {
    console.log("🔄 [COURSES] Location changed, resetting course filters");
    setSelectedCourseName("All");
    setSelectedClassLevel("All");
    setSelectedDuration("All");
  }, [selectedState, selectedDistrict, selectedCentre]);

  // Filter Logic - Start from location-filtered courses and apply course-specific filters
  const filteredCourses = useMemo(() => {
    console.log("🔍 [COURSES] Applying course-specific filters to location-filtered courses");

    return locationFilteredCourses.filter((course) => {
      // 1. Course Name Filter (internal filter)
      if (selectedCourseName !== "All" && course.name !== selectedCourseName) {
        return false;
      }

      // 2. Class Level Filter (internal filter)
      if (
        selectedClassLevel !== "All" &&
        course.class_level !== selectedClassLevel
      ) {
        return false;
      }

      // 3. Duration Filter (internal filter)
      if (selectedDuration !== "All" && course.duration !== selectedDuration) {
        return false;
      }

      // 4. Legacy location filter (if still needed)
      if (
        selectedLocation !== "All" &&
        course.location !== selectedLocation &&
        course.location !== "Online"
      ) {
        return false;
      }

      return true;
    });
  }, [
    locationFilteredCourses,
    selectedLocation,
    selectedCourseName,
    selectedClassLevel,
    selectedDuration,
  ]);

  // Log filtered results
  useEffect(() => {
    console.log("✅ [COURSES] Filtered courses:", filteredCourses.length, "courses");
  }, [filteredCourses]);

  // Sort Logic
  const sortedCourses = useMemo(() => {
    const sorted = [...filteredCourses];
    switch (sortBy) {
      case "price-low":
        return sorted.sort(
          (a, b) =>
            (parseFloat(a.course_price) || 0) -
            (parseFloat(b.course_price) || 0)
        );
      case "price-high":
        return sorted.sort(
          (a, b) =>
            (parseFloat(b.course_price) || 0) -
            (parseFloat(a.course_price) || 0)
        );
      case "start-date":
        return sorted.sort(
          (a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0)
        );
      default:
        return sorted;
    }
  }, [filteredCourses, sortBy]);

  const autoScrollInterval = useRef(null);

  // Sync current slide on scroll
  const handleScroll = () => {
    if (!sliderRef.current || window.innerWidth >= 768) return;
    const { scrollLeft, clientWidth } = sliderRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    if (index !== currentSlide) {
      setCurrentSlide(index);
    }
  };

  // Scroll to specific slide
  const scrollToSlide = (index) => {
    if (!sliderRef.current) return;
    const cards = sliderRef.current.children;
    if (cards[index]) {
      sliderRef.current.scrollTo({
        left: cards[index].offsetLeft - (index === 0 ? 0 : 0),
        behavior: "smooth"
      });
      setCurrentSlide(index);
    }
  };

  // Auto-carousel effect for mobile
  useEffect(() => {
    if (sortedCourses.length <= 1 || window.innerWidth >= 768) return;

    const startAutoScroll = () => {
      autoScrollInterval.current = setInterval(() => {
        if (!isPaused) {
          const next = (currentSlide + 1) % sortedCourses.length;
          scrollToSlide(next);
        }
      }, 4000);
    };

    startAutoScroll();
    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, [sortedCourses.length, currentSlide, isPaused]);

  // Reset slide when courses change
  useEffect(() => {
    setCurrentSlide(0);
    if (sliderRef.current) sliderRef.current.scrollLeft = 0;
  }, [sortedCourses]);

  const handleApplyClick = (course) => {
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

  const handleBuyNowClick = (course) => {
    navigate("/buynow", { state: { courseData: course } });
  };

  const handleFormSubmit = (applicationData) => {
    console.log("Application submitted:", applicationData);
    alert("Application submitted successfully!");
    setIsFormOpen(false);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCourse(null);
  };

  if (loading || isLoading) {
    return (
      <section id="courses" className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#66090D]"></div>
          <p className="mt-2 text-slate-500">Loading courses...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight leading-tight">
                Find Your Program
              </h2>
              <p className="text-sm font-medium text-slate-500 tracking-wide mt-0.5">
                Explore comprehensive courses designed for your success
              </p>
            </div>
          </div>
          {/* Center Button moved to Right */}
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => {
                if (triggerLocationDetection) {
                  triggerLocationDetection();
                }
              }}
              className="relative p-[2px] rounded-2xl group hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
            >
              <style>
                {`
                  @keyframes borderSpin {
                    100% { transform: translate(-50%, -50%) rotate(1turn); }
                  }
                  .animate-border-spin {
                    animation: borderSpin 4s linear infinite;
                  }
                `}
              </style>
              {/* Spinner Gradient */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500%] h-[500%] bg-[conic-gradient(from_90deg_at_50%_50%,#FFEDD5_0%,#EA580C_50%,#FFEDD5_100%)] animate-border-spin opacity-60"></div>

              {/* Button Content */}
              <div className="relative flex items-center gap-3 px-6 py-3 bg-white rounded-2xl">
                <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>

                {/* Animated Icon Container */}
                <div className="relative flex h-4 w-4 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 duration-1000"></span>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-50 delay-150 duration-1000"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-br from-red-500 to-orange-600 shadow-sm"></span>
                </div>

                <div className="flex flex-col items-start -space-y-0.5 relative z-10">
                  <span className="text-s font-bold text-orange-600 uppercase tracking-wider">Tap to find </span>
                  <span className="text-sm font-bold text-slate-800 group-hover:text-red-700 transition-colors">
                    Centre near you
                  </span>
                </div>

                <svg className="w-5 h-5 text-orange-500 animate-bounce relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Filter Section */}
        <div className="relative bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 mb-8 border border-orange-100">

          {/* SORT BY DROPDOWN - Absolute positioned top-right for desktop */}
          <div className="absolute top-6 right-6 hidden md:flex items-center gap-2 z-10">
            <span className="text-sm font-medium text-slate-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-red-100 bg-white/80 backdrop-blur-sm text-sm focus:ring-2 focus:ring-orange-500 outline-none text-slate-700"
            >
              <option value="default">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="start-date">Start Date</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 md:pt-0">
            {/* Course Type Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-800">
                Course Type
              </label>
              <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide snap-x">
                {uniqueCourseNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => setSelectedCourseName(name)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border whitespace-nowrap flex-shrink-0 snap-start ${selectedCourseName === name
                      ? "bg-[#66090D] text-white border-[#66090D] shadow-md"
                      : "bg-white text-slate-700 border-slate-300 hover:border-orange-400 hover:bg-orange-50"
                      }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Level Filter */}
            {uniqueClassLevels.length > 1 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  Class Level
                </label>
                <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide snap-x">
                  {uniqueClassLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        setSelectedClassLevel(
                          selectedClassLevel === level ? "All" : level
                        )
                      }
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 border whitespace-nowrap flex-shrink-0 snap-start ${selectedClassLevel === level
                        ? "bg-orange-600 text-white border-orange-600 shadow-md"
                        : "bg-white text-slate-600 border-slate-300 hover:border-orange-400 hover:bg-orange-50"
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration Filter */}
            {uniqueDurations.length > 1 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  Duration
                </label>
                <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide snap-x">
                  {uniqueDurations.map((duration) => (
                    <button
                      key={duration}
                      onClick={() =>
                        setSelectedDuration(
                          selectedDuration === duration ? "All" : duration
                        )
                      }
                      className={`px-3 py-2 rounded-lg text-xs font-medium uppercase tracking-wide transition-all duration-200 border whitespace-nowrap flex-shrink-0 snap-start ${selectedDuration === duration
                        ? "bg-red-600 text-white border-red-600 shadow-md"
                        : "bg-white text-slate-500 border-slate-300 hover:border-red-400 hover:bg-red-50"
                        }`}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          {(selectedCourseName !== "All" ||
            selectedClassLevel !== "All" ||
            selectedDuration !== "All") && (
              <div className="mt-6 pt-6 border-t border-orange-200">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">
                    Active filters:
                  </span>
                  <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide snap-x">
                    {selectedCourseName !== "All" && (
                      <span className="px-3 py-1.5 bg-orange-100 border border-orange-200 rounded-lg flex items-center gap-1 text-orange-700 text-sm font-medium">
                        {selectedCourseName}
                        <button
                          onClick={() => setSelectedCourseName("All")}
                          className="hover:text-red-500 ml-1 text-lg leading-none"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedClassLevel !== "All" && (
                      <span className="px-3 py-1.5 bg-red-100 border border-red-200 rounded-lg flex items-center gap-1 text-red-700 text-sm font-medium">
                        {selectedClassLevel}
                        <button
                          onClick={() => setSelectedClassLevel("All")}
                          className="hover:text-red-500 ml-1 text-lg leading-none"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedDuration !== "All" && (
                      <span className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-1 text-orange-800 text-sm font-medium">
                        {selectedDuration}
                        <button
                          onClick={() => setSelectedDuration("All")}
                          className="hover:text-red-500 ml-1 text-lg leading-none"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCourseName("All");
                        setSelectedClassLevel("All");
                        setSelectedDuration("All");
                      }}
                      className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium border border-transparent hover:border-red-200 transition-all"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Custom Scrollbar Styles */}
        <style>
          {`
            .courses-scrollbar::-webkit-scrollbar {
              height: 8px;
            }
            .courses-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .courses-scrollbar::-webkit-scrollbar-thumb {
              background-color: transparent;
              border-radius: 20px;
              border: 2px solid transparent;
              background-clip: content-box;
            }
            .courses-scrollbar:hover::-webkit-scrollbar-thumb {
              background-color: #cbd5e1; /* slate-300 */
            }
            .courses-scrollbar:hover::-webkit-scrollbar-thumb:hover {
              background-color: #94a3b8; /* slate-400 */
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}
        </style>

        {/* Courses Grid - Responsive Layout */}
        <div className="pb-6">
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x md:snap-none courses-scrollbar"
          >
            {loading && courses.length === 0 ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="w-full shrink-0 md:w-auto md:shrink rounded-2xl border border-slate-200 bg-white overflow-hidden p-0 h-[400px]">
                  <Skeleton className="h-40 w-full rounded-none mb-4" />
                  <div className="p-5 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              sortedCourses.map((c) => {

                // --- CALCULATE REAL DISPLAY DATA ---
                const price = parseFloat(c.course_price || 0);
                const discounted = parseFloat(c.discounted_price || 0);
                const offer = parseFloat(c.offers || 0);

                let displayPrice = price;
                let originalPrice = 0;
                let discountLabel = 0;

                // Priority 1: Plans - Find lowest price
                if (c.plans && c.plans.length > 0) {
                  const planPrices = c.plans.map(p => parseFloat(p.discounted_price || p.base_price || 0)).filter(p => p > 0);
                  if (planPrices.length > 0) displayPrice = Math.min(...planPrices);

                  // If matching plan has base_price > displayPrice, show it
                  const matchingPlan = c.plans.find(p => parseFloat(p.discounted_price || p.base_price) === displayPrice);
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

                const startDateValue = c.start_date || c.starting_date;
                const formattedDate = startDateValue
                  ? new Date(startDateValue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : "Coming Soon";

                return (
                  <div
                    key={c.id || c._id}
                    className="w-full shrink-0 md:w-auto md:shrink rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 relative flex flex-col group snap-center"
                  >
                    {/* Mode Ribbon */}
                    <div className="absolute top-0 left-0 z-10">
                      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-br-xl shadow-md uppercase tracking-wide">
                        {c.mode || "Online"}
                      </div>
                    </div>

                    {/* Banner Image */}
                    <div className="h-40 bg-slate-100 relative overflow-hidden">
                      {c.thumbnail_url ? (
                        <FadeInImage
                          src={c.thumbnail_url}
                          alt={c.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
                          <div className="text-center p-4">
                            <h4 className="text-orange-900/20 font-black text-3xl uppercase leading-none">
                              {c.name?.split(" ")[0] || "COURSE"}
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
                      {c.course_title && (
                        <div className="text-orange-600 text-[10px] font-black uppercase tracking-widest mb-2 border-b border-orange-100 pb-1.5">
                          {c.course_title}
                        </div>
                      )}
                      {/* Title Row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-bold text-xl text-slate-900 leading-tight group-hover:text-[#66090D] transition-colors line-clamp-2">
                          {c.name}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded border border-slate-200">
                            {c.language || "English"}
                          </span>
                          <button className="text-orange-600 hover:text-orange-700 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>For {formatClassLevel(c.class_level)} Aspirants</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
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
                      <div className="flex items-end gap-2 mb-4">
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
                      <div className="text-[10px] text-slate-500 font-medium -mt-3 mb-4 uppercase tracking-wide">
                        (FOR FULL BATCH)
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleApplyClick(c)}
                          className="py-2.5 rounded-xl border-2 border-[#66090D] text-[#66090D] font-bold text-sm hover:bg-orange-50 transition-all duration-200 uppercase tracking-wide"
                        >
                          Explore
                        </button>
                        <button
                          onClick={() => handleBuyNowClick(c)}
                          className="py-2.5 rounded-xl bg-[#66090D] text-white font-bold text-sm hover:bg-[#55080b] transition-all duration-200 shadow-md hover:shadow-lg uppercase tracking-wide"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Manual Carousel Navigation (Dots) - Mobile Only */}
          {sortedCourses.length > 1 && (
            <div className="flex md:hidden justify-center items-center gap-2.5 mt-4">
              {sortedCourses.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToSlide(idx)}
                  className={`transition-all duration-300 rounded-full ${currentSlide === idx
                    ? "w-8 h-2 bg-gradient-to-r from-orange-500 to-red-600 shadow-md"
                    : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* No Results Message */}
        {sortedCourses.length === 0 && !loading && (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-slate-200 border-dashed">
            <svg
              className="mx-auto h-16 w-16 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No courses found
            </h3>
            <p className="mt-2 text-slate-600 max-w-md mx-auto">
              We couldn't find any courses matching your current filters. Try
              adjusting your search criteria.
            </p>
            <button
              onClick={() => {
                setSelectedCourseName("All");
                setSelectedClassLevel("All");
                setSelectedDuration("All");
              }}
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-[#66090D] bg-red-100 hover:bg-red-200 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Application Form Popup */}
        {selectedCourse && (
          <ApplicationForm
            course={{
              ...selectedCourse,
              // Override goal with course name
              goal: selectedCourse.name,
              // Override location with centre name
              location: selectedCourse.centre || selectedCourse.location,
              start: selectedCourse.start_date || "Coming Soon",
              price: selectedCourse.course_price || "Contact for Price",
            }}
            isOpen={isFormOpen}
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
          />
        )}
      </div>
    </section >
  );
}

// Updated Centers Component with Location Filter
function CentersSection({ selectedState, selectedDistrict, selectedLocation, selectedCentre, centres, loadingCentres }) {
  const [selectedCenter, setSelectedCenter] = useState(null);

  // Filter centers based on selected location and centre
  const filteredCenters = useMemo(() => {
    if (!centres) return [];
    return centres.filter((center) => {
      // Filter by state
      if (selectedState !== "All" && center.state !== selectedState) {
        return false;
      }

      // Filter by district
      if (selectedDistrict !== "All" && center.district !== selectedDistrict) {
        return false;
      }

      // Filter by selected centre
      if (selectedCentre && selectedCentre !== "all" && selectedCentre !== "") {
        // Match center name with selected centre (case-insensitive)
        const centerName = (center.centre || center.name)?.toLowerCase() || "";
        const selectedCentreLower = selectedCentre.toLowerCase();

        // Check if the center name contains the selected centre
        if (!centerName.includes(selectedCentreLower)) {
          return false;
        }
      }

      return true;
    });
  }, [centres, selectedState, selectedDistrict, selectedCentre]);

  // Set default selected center or update when list changes
  useEffect(() => {
    if (filteredCenters.length > 0) {
      setSelectedCenter(filteredCenters[0]);
    } else {
      setSelectedCenter(null);
    }
  }, [filteredCenters]);

  return (
    <section id="centers" className="py-12 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Our Centers</h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Map Section */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="w-full h-[500px] relative">
              {loadingCentres ? (
                <div className="absolute inset-0 z-10">
                  <Skeleton className="w-full h-full rounded-none" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-semibold text-slate-700">Loading Map...</span>
                    </div>
                  </div>
                </div>
              ) : selectedCenter && selectedCenter.mapEmbed ? (
                <iframe
                  src={selectedCenter.mapEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${selectedCenter.centre || selectedCenter.name} Location`}
                  className="w-full h-full"
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 font-medium">
                    {selectedCenter ? "Map location not available for this center" : "Select a center to view location"}
                  </p>
                </div>
              )}
            </div>

            {/* Selected Center Info Bar */}
            {!loadingCentres && selectedCenter && (
              <div className="p-6 bg-white border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-xl text-slate-900">{selectedCenter.centre || selectedCenter.name}</h3>
                  <p className="text-slate-600 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedCenter.address || selectedCenter.city || selectedCenter.district}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((selectedCenter.centre || selectedCenter.name) + " Pathfinder " + (selectedCenter.address || ""))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                  >
                    Get Directions
                  </a>
                  <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                    Book Counselling
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Updated Results Component with Backend Data
function ResultsSection({ selectedCentre }) {
  const tabs = ["All", "All India", "Boards", "Foundation"];
  const [activeTab, setActiveTab] = useState("All");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { data: allToppers, loading, error, refetch } = useCachedData(
    "toppers",
    () => centresAPI.getAll(),
    {
      onSuccess: (data) => {
        const topperList = [];
        data.forEach((centre) => {
          if (centre.toppers && Array.isArray(centre.toppers)) {
            centre.toppers.forEach((topper) => {
              let category = topper.category;
              if (!category) {
                const examLower = (topper.exam || "").toLowerCase();
                if (examLower.includes("board") || examLower.includes("cbse") || examLower.includes("icse") || examLower.includes("class")) {
                  category = "Boards";
                } else if (examLower.includes("foundation")) {
                  category = "Foundation";
                } else {
                  category = "All India";
                }
              }

              topperList.push({
                name: topper.name || "Unknown",
                score: topper.percentages || topper.score || 0,
                exam: topper.exam || "N/A",
                category: category,
                rank: topper.rank ? `Rank ${topper.rank}` : "N/A",
                photo: getTopperImageUrl(topper) || "images/placeholder.png",
                quote: topper.topper_msg || "No message available",
                centre: centre.centre || "Unknown",
                badge: topper.badge || "",
                imgHeight: "h-56",
                imgWidth: "w-full",
              });
            });
          }
        });
        return topperList;
      }
    }
  );

  // Helper function to get topper image URL
  const getTopperImageUrl = (topper) => {
    if (topper.image_url) return topper.image_url;
    if (topper.image) return topper.image;
    if (topper.image_data && topper.image_content_type) {
      return `data:${topper.image_content_type};base64,${topper.image_data}`;
    }
    return null;
  };

  // Categorize toppers by exam type
  const categorizeToppers = () => {
    const categorized = {
      All: allToppers,
      "All India": allToppers.filter((t) => t.category === "All India"),
      Boards: allToppers.filter((t) => t.category === "Boards"),
      Foundation: allToppers.filter((t) => t.category === "Foundation"),
    };
    return categorized;
  };

  // Get cards for active tab
  const categorizedData = categorizeToppers();
  let cards = categorizedData[activeTab] || [];

  // Filter by selected centre
  if (selectedCentre && selectedCentre !== "all" && selectedCentre !== "") {
    cards = cards.filter((student) => {
      // Match centre field with selected centre (case-insensitive)
      if (!student.centre) return false;
      return student.centre.toLowerCase() === selectedCentre.toLowerCase();
    });
  }

  // Carousel navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % cards.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (cards.length <= 1) return; // Don't auto-scroll if only one card

    const interval = setInterval(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [cards.length, isPaused, activeTab]); // Reset when tab changes

  // Reset slide when tab changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeTab]);

  // Pause auto-scroll on hover (for desktop) and touch (for mobile)
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <section
      id="results"
      className="py-8 sm:py-10 lg:py-12 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tabs Section - Responsive */}
        <div className="flex flex-col items-center sm:items-end mb-6 sm:mb-8">
          <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 font-semibold transition-all duration-300 text-sm sm:text-base ${activeTab === tab
                  ? "bg-[#66090D] text-white border-[#66090D] shadow-lg shadow-red-200"
                  : "bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:shadow-md"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Skeleton Loading State */}
        {loading && cards.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-[5px] overflow-hidden shadow-lg h-[450px]">
                <Skeleton className="h-52 w-full rounded-none mb-4" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg inline-block">
              <p className="font-semibold">{error}</p>
              <button
                onClick={refetch}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && cards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">
              No results found for the selected filters.
            </p>
          </div>
        )}

        {/* Results Display - Only show if not loading, no error, and has cards */}
        {!loading && !error && cards.length > 0 && (
          <>
            {/* Mobile: Carousel */}
            <div className="lg:hidden">
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleMouseEnter}
                onTouchEnd={handleMouseLeave}
              >

                {/* Carousel Container */}
                <div className="overflow-hidden rounded-2xl">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {cards.map((student, index) => (
                      <div
                        key={`${student.name}-${index}`}
                        className="w-full flex-shrink-0 px-2"
                      >
                        <div className="bg-white rounded-[5px] border border-orange-100 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 mx-auto max-w-sm flex flex-col h-full group/mobile">
                          {/* Student Photo with Rank Badge */}
                          <div className="relative w-full h-52 overflow-hidden bg-gradient-to-br from-orange-50 to-red-50">
                            <FadeInImage
                              src={student.photo}
                              alt={student.name}
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute top-3 right-3 bg-gradient-to-br from-orange-500 to-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border border-white/20">
                              #{index + 1}
                            </div>
                          </div>

                          {/* Student Details */}
                          <div className="p-4 flex flex-col flex-grow">
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <div>
                                <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                                  {student.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 mt-0.5">
                                  <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {student.centre}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md">
                                  {student.score}%
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">CLASS OF 2024</span>
                              </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="flex flex-col">
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Exam</span>
                                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                                  <span className="line-clamp-1">{student.exam}</span>
                                </div>
                              </div>
                              <div className="flex flex-col border-l border-slate-200 pl-3">
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Achievement</span>
                                <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                                  <span className="line-clamp-1">{student.rank}</span>
                                </div>
                              </div>
                            </div>

                            {/* Topper Quote */}
                            {student.quote && student.quote !== "No message available" && (
                              <div className="mb-4 relative">
                                <span className="absolute -top-2 -left-1 text-orange-200 text-2xl font-serif">"</span>
                                <p className="text-[11px] text-slate-600 italic line-clamp-2 pl-3 leading-relaxed">
                                  {student.quote}
                                </p>
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Carousel Indicators */}
              {cards.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {cards.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                        ? "bg-[#66090D] scale-125"
                        : "bg-slate-300 hover:bg-slate-400"
                        }`}
                    />
                  ))}
                </div>
              )}

              {/* Slide Counter */}
              {cards.length > 1 && (
                <div className="text-center mt-2 text-sm text-slate-600">
                  {currentSlide + 1} / {cards.length}
                </div>
              )}
            </div>

            {/* Desktop: Grid Layout */}
            <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((student, index) => (
                <div
                  key={`${student.name}-${index}`}
                  className="group bg-white rounded-[15px] border border-orange-100 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative flex flex-col h-full"
                >
                  {/* Student Photo with Rank Badge */}
                  <div className="relative w-full h-60 overflow-hidden bg-gradient-to-br from-orange-50/50 to-red-50/50 group-hover:bg-white transition-colors duration-500">
                    <FadeInImage
                      src={student.photo}
                      alt={student.name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <h3 className="font-extrabold text-xl text-slate-900 leading-tight group-hover:text-red-700 transition-colors duration-300">
                          {student.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-1">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {student.centre}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-md">
                          {student.score}%
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg tracking-wider">CLASS OF 2024</span>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-orange-50/50 transition-colors duration-500">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Exam</span>
                        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <span>{student.exam}</span>
                        </div>
                      </div>
                      <div className="flex flex-col border-l border-slate-200 pl-4">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Achievement</span>
                        <div className="flex items-center gap-2 text-sm font-extrabold text-red-700">
                          <div className="w-2 h-2 rounded-full bg-red-600"></div>
                          <span>{student.rank}</span>
                        </div>
                      </div>
                    </div>

                    {/* Topper Quote */}
                    {student.quote && student.quote !== "No message available" && (
                      <div className="mb-6 relative">
                        <span className="absolute -top-3 -left-2 text-orange-200 text-3xl font-serif">"</span>
                        <p className="text-sm text-slate-600 italic line-clamp-3 pl-4 leading-relaxed group-hover:text-slate-900 transition-colors duration-300">
                          {student.quote}
                        </p>
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>

            {/* View More Button */}
            <div className="text-center mt-8 sm:mt-12">
              <button className="bg-white text-slate-900 border-2 border-slate-300 hover:border-[#66090D] hover:bg-orange-50 px-6 sm:px-8 py-3 rounded-2xl font-semibold transition-all duration-300">
                View All Success Stories →
              </button>
            </div>
          </>
        )}
      </div>
    </section >
  );
}

/********************
 * REELS
 *******************/

function Reels() {
  const [activeTab, setActiveTab] = useState("toppers");
  const [playingVideo, setPlayingVideo] = useState(null);
  const [progress, setProgress] = useState({});
  const [durationCache, setDurationCache] = useState({});
  const [posterCache, setPosterCache] = useState({});
  const [isMuted, setIsMuted] = useState(true);
  const [hasUserUnmuted, setHasUserUnmuted] = useState(false);
  const [liked, setLiked] = useState({});
  const [isPaused, setIsPaused] = useState({});
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const videoRefs = useRef({});
  const intervalRef = useRef({});
  const scrollContainerRef = useRef(null);
  const reelRefs = useRef({});
  const sectionRef = useRef(null);

  const currentReels = reelsData[activeTab];

  // Detect video type
  const getVideoType = (videoUrl) => {
    return videoUrl.includes("drive.google.com") ? "embed" : "direct";
  };

  const formatDuration = (s) => {
    if (!s) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Manual slider navigation
  const nextSlide = () => {
    if (currentSlide < currentReels.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      scrollToSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      scrollToSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    scrollToSlide(index);
  };

  const scrollToSlide = (index) => {
    const container = scrollContainerRef.current;
    const reel = reelRefs.current[currentReels[index]?.id];
    if (!container || !reel) return;

    const target =
      reel.offsetLeft - (container.clientWidth - reel.offsetWidth) / 2;
    container.scrollTo({ left: target, behavior: "smooth" });
  };

  const scrollToReel = (id) => {
    const reelEl = reelRefs.current[id];
    const container = scrollContainerRef.current;
    if (!reelEl || !container) return;

    const target =
      reelEl.offsetLeft - (container.clientWidth - reelEl.offsetWidth) / 2;
    container.scrollTo({ left: target, behavior: "smooth" });
  };

  const playVideo = (id) => {
    const videoUrl = currentReels.find((reel) => reel.id === id)?.video;
    const videoType = getVideoType(videoUrl);

    if (playingVideo && playingVideo !== id) {
      if (
        getVideoType(
          currentReels.find((reel) => reel.id === playingVideo)?.video
        ) === "direct"
      ) {
        videoRefs.current[playingVideo]?.pause();
        clearInterval(intervalRef.current[playingVideo]);
      }
    }

    setPlayingVideo(id);
    setIsPaused((prev) => ({ ...prev, [id]: false }));
    scrollToReel(id);

    // Update current slide
    const slideIndex = currentReels.findIndex((reel) => reel.id === id);
    if (slideIndex !== -1) {
      setCurrentSlide(slideIndex);
    }

    if (videoType === "direct") {
      const video = videoRefs.current[id];
      if (video) {
        video.muted = !hasUserUnmuted;
        video.play().catch(() => { });
        intervalRef.current[id] = setInterval(() => updateProgress(id), 50);
      }
    }
  };

  const handleVideoError = (reelId, error) => {
    console.warn(`Video load error for ${reelId}:`, error);
  };

  const handleVideoTap = (id, e) => {
    const videoUrl = currentReels.find((reel) => reel.id === id)?.video;
    const videoType = getVideoType(videoUrl);

    if (playingVideo === id) {
      if (videoType === "direct") {
        videoRefs.current[id]?.pause();
        clearInterval(intervalRef.current[id]);
        setProgress((prev) => ({ ...prev, [id]: 0 }));
      }
      setPlayingVideo(null);
      setIsPaused((prev) => ({ ...prev, [id]: true }));
    } else {
      playVideo(id);
    }
  };

  const updateProgress = (id) => {
    const videoUrl = currentReels.find((reel) => reel.id === id)?.video;
    if (getVideoType(videoUrl) !== "direct") return;

    const video = videoRefs.current[id];
    if (!video || !video.duration) return;
    setProgress((prev) => ({
      ...prev,
      [id]: (video.currentTime / video.duration) * 100,
    }));
  };

  const togglePlayPause = (id, e) => {
    e.stopPropagation();

    const videoUrl = currentReels.find((reel) => reel.id === id)?.video;
    if (getVideoType(videoUrl) === "embed") return;

    const video = videoRefs.current[id];
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => { });
      intervalRef.current[id] = setInterval(() => updateProgress(id), 50);
      setIsPaused((prev) => ({ ...prev, [id]: false }));
    } else {
      video.pause();
      clearInterval(intervalRef.current[id]);
      setIsPaused((prev) => ({ ...prev, [id]: true }));
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setHasUserUnmuted(!newMuted);

    if (playingVideo) {
      const videoUrl = currentReels.find(
        (reel) => reel.id === playingVideo
      )?.video;
      if (getVideoType(videoUrl) === "direct") {
        videoRefs.current[playingVideo].muted = newMuted;
      }
    }
  };

  const closeVideo = (e) => {
    e.stopPropagation();
    if (playingVideo) {
      const videoUrl = currentReels.find(
        (reel) => reel.id === playingVideo
      )?.video;
      if (getVideoType(videoUrl) === "direct") {
        videoRefs.current[playingVideo]?.pause();
        clearInterval(intervalRef.current[playingVideo]);
        setProgress((prev) => ({ ...prev, [playingVideo]: 0 }));
      }
    }
    setPlayingVideo(null);
  };

  const generateThumbnail = (id) => {
    const video = videoRefs.current[id];
    const videoUrl = currentReels.find((reel) => reel.id === id)?.video;
    if (!video || posterCache[id] || getVideoType(videoUrl) === "embed") return;

    video.currentTime = 0.1;
    const onSeeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 360;
      canvas.height = 640;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, 360, 640);
      setPosterCache((prev) => ({ ...prev, [id]: canvas.toDataURL() }));
      video.removeEventListener("seeked", onSeeked);
    };
    video.addEventListener("seeked", onSeeked);
  };

  const handleDoubleTap = (id, e) => {
    e.stopPropagation();
    setLiked((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setLiked((prev) => ({ ...prev, [id]: false })), 1000);
  };

  // Render video player based on type
  const renderVideoPlayer = (reel) => {
    const type = getVideoType(reel.video);

    if (type === "embed") {
      return (
        <iframe
          src={reel.video}
          className="w-full h-full object-cover"
          allow="autoplay; fullscreen"
          frameBorder="0"
          allowFullScreen
        />
      );
    } else {
      return (
        <video
          ref={(el) => {
            videoRefs.current[reel.id] = el;
          }}
          src={reel.video}
          crossOrigin="anonymous"
          poster={
            posterCache[reel.id] ||
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='640' viewBox='0 0 360 640'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0%25' x2='100%25' y1='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23F97316'/%3E%3Cstop offset='50%25' stop-color='%23DC2626'/%3E%3Cstop offset='100%25' stop-color='%2366090D'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='360' height='640' fill='url(%23a)'/%3E%3Cg stroke='white' stroke-width='2' stroke-opacity='0.1'%3E%3Cpath d='M0 160 L360 120'%3E%3Canimate attributeName='d' values='M0 160 L360 120;M-100 160 L260 120;M0 160 L360 120' dur='4s' repeatCount='indefinite'/%3E%3C/path%3E%3Cpath d='M0 320 L360 280'%3E%3Canimate attributeName='d' values='M0 320 L360 280;M-100 320 L260 280;M0 320 L360 280' dur='4s' repeatCount='indefinite'/%3E%3C/path%3E%3Cpath d='M0 480 L360 440'%3E%3Canimate attributeName='d' values='M0 480 L360 440;M-100 480 L260 440;M0 480 L360 440' dur='4s' repeatCount='indefinite'/%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
          }
          preload="metadata"
          playsInline
          loop
          className="w-full h-full object-cover pointer-events-none"
          onLoadedMetadata={() => {
            const v = videoRefs.current[reel.id];
            if (v?.duration) {
              setDurationCache((prev) => ({
                ...prev,
                [reel.id]: formatDuration(v.duration),
              }));
              generateThumbnail(reel.id);
            }
          }}
          onError={(e) => handleVideoError(reel.id, e)}
        />
      );
    }
  };

  // Show controls only for direct videos
  const showControls = (reelId) => {
    const reel = currentReels.find((reel) => reel.id === reelId);
    return reel ? getVideoType(reel.video) === "direct" : false;
  };

  // Track scroll position and update current slide
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      // Find which slide is currently in view
      const reels = currentReels.map((reel) => reelRefs.current[reel.id]);
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let closestIndex = 0;
      let minDistance = Infinity;

      reels.forEach((reel, index) => {
        if (reel) {
          const reelRect = reel.getBoundingClientRect();
          const reelCenter = reelRect.left + reelRect.width / 2;
          const distance = Math.abs(reelCenter - containerCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        }
      });

      setCurrentSlide(closestIndex);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentReels]);

  // Cleanup intervals
  useEffect(() => {
    return () => Object.values(intervalRef.current).forEach(clearInterval);
  }, []);

  // Reset on tab change
  useEffect(() => {
    Object.values(videoRefs.current).forEach((v) => v?.pause());
    Object.values(intervalRef.current).forEach(clearInterval);
    intervalRef.current = {};
    setPlayingVideo(null);
    setProgress({});
    setIsPaused({});
    setCurrentSlide(0);
  }, [activeTab]);

  return (
    <section
      ref={sectionRef}
      className="py-10 sm:py-12 lg:py-16 bg-gradient-to-b from-white via-orange-50/30 to-white px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl">
        {/* HEADER - RESPONSIVE */}
        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center sm:text-left">
            Unfiltered Reels
          </h2>

          {/* TABS - RESPONSIVE */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3">
            {reelstab.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 font-bold transition-all duration-300 text-sm sm:text-base ${activeTab === key
                  ? "bg-gradient-to-r from-orange-600 to-red-700 text-white border-transparent shadow-lg shadow-orange-200"
                  : "bg-white text-slate-700 border-slate-200 hover:border-orange-400 hover:shadow-md"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* REELS CONTAINER - RESPONSIVE */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none", cursor: "grab" }}
          >
            <div className="flex gap-0 sm:gap-4 lg:gap-6 px-0 sm:px-4 lg:px-6 py-2 sm:py-4">
              {currentReels.map((reel, index) => {
                const isDriveVideo = getVideoType(reel.video) === "embed";

                return (
                  <div
                    key={reel.id}
                    ref={(el) => (reelRefs.current[reel.id] = el)}
                    className="flex-none snap-center relative group w-full sm:w-[320px]"
                    onClick={(e) => handleVideoTap(reel.id, e)}
                  >
                    {/* LEFT ARROW - RESPONSIVE */}
                    {index > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevSlide();
                        }}
                        className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 z-40 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-full backdrop-blur-sm"
                      >
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                    )}

                    {/* RIGHT ARROW - RESPONSIVE */}
                    {index < currentReels.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextSlide();
                        }}
                        className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 z-40 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-full backdrop-blur-sm"
                      >
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    )}

                    <div className="aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-2xl bg-black relative">
                      {renderVideoPlayer(reel)}

                      {playingVideo !== reel.id && !isDriveVideo && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 right-3 sm:right-5 text-white">
                            <h3 className="text-sm sm:text-lg font-bold line-clamp-2">
                              {reel.title}
                            </h3>
                            <p className="text-xs opacity-90 mt-1">
                              {durationCache[reel.id] || "0:00"}
                            </p>
                          </div>

                          {/* PLAY BUTTON OVERLAY - RESPONSIVE */}
                          <div className="absolute inset-0 flex items-center justify-center z-15">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                              <Play
                                size={24}
                                className="text-white ml-0.5 sm:ml-1"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {playingVideo !== reel.id && isDriveVideo && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 right-3 sm:right-5 text-white">
                            <h3 className="text-sm sm:text-lg font-bold line-clamp-2">
                              {reel.title}
                            </h3>
                            <p className="text-xs opacity-90 mt-1">
                              {durationCache[reel.id] || "0:00"}
                            </p>
                          </div>
                        </>
                      )}

                      {playingVideo === reel.id && showControls(reel.id) && (
                        <>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/40">
                            <div
                              className="h-full bg-white transition-all duration-75"
                              style={{ width: `${progress[reel.id] || 0}%` }}
                            />
                          </div>

                          <button
                            onClick={toggleMute}
                            className="absolute bottom-16 sm:bottom-20 right-3 sm:right-4 p-2 sm:p-3 bg-black/70 rounded-full backdrop-blur z-30"
                          >
                            {isMuted ? (
                              <VolumeX
                                size={16}
                                className="text-white sm:w-5 sm:h-5"
                              />
                            ) : (
                              <Volume2
                                size={16}
                                className="text-white sm:w-5 sm:h-5"
                              />
                            )}
                          </button>

                          <button
                            onClick={closeVideo}
                            className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-black/70 rounded-full text-white z-50 text-sm sm:text-base"
                          >
                            ×
                          </button>

                          <div
                            className="absolute inset-0 z-10"
                            onDoubleClick={(e) => handleDoubleTap(reel.id, e)}
                          />

                          {liked[reel.id] && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                              <Heart
                                size={60}
                                className="text-white fill-white animate-ping sm:w-20 sm:h-20"
                              />
                            </div>
                          )}
                        </>
                      )}

                      {playingVideo === reel.id && !showControls(reel.id) && (
                        <button
                          onClick={closeVideo}
                          className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-black/70 rounded-full text-white z-50 text-sm sm:text-base"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CUSTOM HORIZONTAL SCROLLBAR */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>

        {/* MANUAL SLIDER CONTROLS - RESPONSIVE */}
        <div className="flex justify-center items-center gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 mt-6 sm:mt-8">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="group p-3 sm:p-4 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl hover:from-orange-600 hover:to-red-700 hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-300 transform hover:shadow-xl"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-0.5 sm:group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full border border-white/30">
              {currentSlide + 1} / {currentReels.length}
            </span>
            <div className="flex gap-1.5 sm:gap-2">
              {currentReels.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${index === currentSlide
                    ? "bg-gradient-to-r from-orange-500 to-red-600 scale-125 sm:scale-150 shadow-md sm:shadow-lg"
                    : "bg-gray-300 hover:bg-gray-400"
                    }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === currentReels.length - 1}
            className="group p-3 sm:p-4 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl hover:from-orange-600 hover:to-red-700 hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-300 transform hover:shadow-xl"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:translate-x-0.5 sm:group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

/********************
 * STUDENT CORNER
 *******************/
function Students() {
  const tiles = [
    { t: "Exam Portal", lock: false },
    { t: "Doubt-Clearing", lock: false },
    { t: "Downloads", lock: false },
    { t: "Topper Scripts", lock: false },
    { t: "Timetables", lock: false },
    { t: "Community Forum", lock: true },
  ];
  return (
    <section id="students" className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Student Corner</h2>
          <a className="text-[#66090D] font-medium hover:text-red-700 transition-colors" href="#">
            Go to portal →
          </a>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tiles.map((t) => (
            <div
              key={t.t}
              className="rounded-2xl border border-slate-200 p-6 bg-slate-50 hover:bg-white"
            >
              <div className="font-semibold">{t.t}</div>
              <div className="text-sm text-slate-600 mt-1">
                Tools to help you win
              </div>
              {t.lock && (
                <div className="mt-2 text-xs inline-block px-2 py-0.5 rounded-full bg-slate-200">
                  Login required
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * ADMISSIONS FLOW
 *******************/
function Admissions() {
  const steps = [
    { t: "Explore", s: "Browse courses & centers" },
    { t: "Counselling", s: "Book a free session" },
    { t: "Diagnostic", s: "Baseline test & review" },
    { t: "Offer", s: "Scholarship & plan" },
    { t: "Enrol", s: "Token & onboarding" },
  ];
  return (
    <section id="admissions" className="py-12 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-bold mb-4">How to get started</h2>
        <div className="grid md:grid-cols-5 gap-4">
          {steps.map((s, i) => (
            <div
              key={s.t}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="text-3xl">{i + 1}</div>
              <div className="font-semibold mt-1">{s.t}</div>
              <div className="text-sm text-slate-600">{s.s}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <a
            id="apply"
            href="#apply"
            className="px-4 py-2 rounded-xl bg-[#66090D] text-white hover:bg-[#55080b] transition-colors"
          >
            Apply Now
          </a>
          <a href="#" className="px-4 py-2 rounded-xl border">
            Download Brochure
          </a>
        </div>
      </div>
    </section>
  );
}

/********************
 * EVENTS & DEADLINES
 *******************/
function Events() {
  const items = [
    { d: "Nov 12", t: "Scholarship window ends", cta: "Register" },
    { d: "Nov 18", t: "New batch starts (multi-center)", cta: "Apply" },
    { d: "Nov 22", t: "Parent Counselling Webinar", cta: "Join" },
  ];
  return (
    <section id="events" className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-bold mb-3">Upcoming events & deadlines</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {items.map((e, i) => (
              <div
                key={i}
                className="w-80 shrink-0 rounded-2xl border border-slate-200 p-4 bg-slate-50"
              >
                <div className="text-sm text-slate-500">{e.d}</div>
                <div className="font-semibold">{e.t}</div>
                <button className="mt-3 px-3 py-1.5 rounded-lg bg-slate-900 text-white">
                  {e.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/********************
 * LUMOS
 *******************/
function Lumos() {
  const products = [
    {
      t: "Key to Success — Boards",
      p: "₹999 ₹499",
      img: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800",
    },
    {
      t: "Exam Planner Bundle",
      p: "₹799 ₹399",
      img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",
    },
    {
      t: "Pathfinder Tote",
      p: "₹699 ₹349",
      img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
    },
  ];
  return (
    <section id="lumos" className="py-12 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Lumos spotlight</h2>
          <a href="#" className="text-orange-600 font-medium hover:text-orange-700">
            View all →
          </a>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.t}
              className="rounded-2xl overflow-hidden border border-slate-200 bg-white"
            >
              <FadeInImage
                src={p.img}
                alt={p.t}
                className="w-full h-44 object-cover"
              />
              <div className="p-4">
                <div className="font-semibold">{p.t}</div>
                <div className="text-[#66090D] font-bold">{p.p}</div>
                <div className="mt-2 flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg border">
                    Details
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-slate-900 text-white">
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * PATHTEX
 *******************/
function PathTex() {
  const items = [
    {
      t: "AI Exam Analytics",
      s: "Personalized insights & error radar.",
      icon: "🤖",
    },
    { t: "OCR Notes", s: "Scan • search • study smarter.", icon: "📝" },
    {
      t: "Teacher Dashboards",
      s: "Plan, track, and intervene fast.",
      icon: "📊",
    },
  ];
  return (
    <section id="pathtex" className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-bold mb-3">
          PathTex — innovation at work
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((i) => (
            <div
              key={i.t}
              className="rounded-2xl border border-slate-200 p-6 bg-slate-50 hover:bg-white"
            >
              <div className="text-3xl">{i.icon}</div>
              <div className="mt-2 font-semibold">{i.t}</div>
              <div className="text-slate-600">{i.s}</div>
              <a href="#" className="mt-3 inline-block text-orange-600 font-medium hover:text-orange-700">
                See demo →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * BLOG
 *******************/
function Blog() {
  const posts = [
    {
      t: "Boards: 30-day sprint plan",
      c: "Deep Guide",
      img: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800",
    },
    {
      t: "New batches announced",
      c: "Announcement",
      img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800",
    },
    {
      t: "How to use mocks well",
      c: "Deep Guide",
      img: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800",
    },
    {
      t: "Motivation for finals",
      c: "Motivation",
      img: "https://images.unsplash.com/photo-1515165562835-c3b8c4f0a6c3?w=800",
    },
  ];
  return (
    <section id="blog" className="py-12 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Latest from the blog</h2>
          <a href="#" className="text-orange-600 font-medium hover:text-orange-700">
            Read all →
          </a>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {posts.map((p) => (
            <article
              key={p.t}
              className="rounded-2xl overflow-hidden border border-slate-200 bg-white"
            >
              <FadeInImage
                src={p.img}
                alt={p.t}
                className="w-full h-36 object-cover"
              />
              <div className="p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  {p.c}
                </div>
                <h3 className="font-semibold">{p.t}</h3>
                <a href="#" className="text-orange-600 text-sm font-medium hover:text-orange-700">
                  Read →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * COMMUNITY
 *******************/
function Community() {
  const items = [
    { t: "Kolkata Chapter", s: "4.6k members", badge: "Hero of the Week" },
    { t: "Durgapur Chapter", s: "1.1k members" },
    { t: "Siliguri Chapter", s: "800+ members" },
  ];
  return (
    <section id="community" className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">Community & Alumni</h2>
          <a href="#" className="text-orange-600 font-medium hover:text-orange-700">
            Join a chapter →
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((i) => (
            <div
              key={i.t}
              className="rounded-2xl border border-slate-200 p-6 bg-slate-50 hover:bg-white"
            >
              <div className="font-semibold">{i.t}</div>
              <div className="text-sm text-slate-600">{i.s}</div>
              {i.badge && (
                <div className="mt-2 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium inline-block">
                  {i.badge}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/********************
 * FAQ
 *******************/
function FAQ() {
  const faqs = [
    {
      q: "How do I enroll in Pathfinder courses?",
      a: "You can easily apply online through our Student Portal or visit any of our centers across the state. Our admission counselors will guide you through the process, evaluate your requirements, and help you select the ideal batch.",
    },
    {
      q: "What study materials are provided?",
      a: "Pathfinder provides comprehensive, expertly curated study modules that cover theory, solved examples, daily practice problems (DPPs), and an extensive archive of previous years' questions for thorough preparation.",
    },
    {
      q: "Are there dedicated doubt-clearing sessions?",
      a: "Absolutely! We hold regular doubt-clearing sessions both online and offline. Students also get access to our 24x7 digital doubt forum where expert faculties resolve queries round the clock.",
    },
    {
      q: "How are the Mock Tests structured?",
      a: "Our mock tests meticulously replicate the latest examination patterns (NTA/Boards). Post-test, you receive in-depth performance analytics highlighting topic-wise strengths and areas needing improvement.",
    },
    {
      q: "Can I switch between Online and Offline modes?",
      a: "Yes, we offer flexible hybrid learning options. If you miss an offline lecture, you can always catch up via recorded sessions or attend our parallel live online classes.",
    },
  ];

  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="py-16 sm:py-24 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-red-50 blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full bg-orange-50 blur-3xl opacity-60"></div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block py-1.5 px-4 rounded-full bg-red-100 text-red-700 text-xs sm:text-sm font-bold tracking-wider mb-4 uppercase shadow-sm">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Questions</span>
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            Everything you need to know about Pathfinder, our courses, and how we ensure your success.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`transition-all duration-300 border-2 rounded-[24px] bg-white overflow-hidden ${isOpen ? "border-orange-500 shadow-xl shadow-orange-100" : "border-slate-100 hover:border-orange-200 hover:shadow-lg hover:-translate-y-1"
                  }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left px-6 py-5 sm:px-8 sm:py-6 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className={`font-bold text-[16px] sm:text-lg transition-colors duration-300 pr-8 ${isOpen ? "text-[#66090D]" : "text-slate-800"}`}>
                    {f.q}
                  </span>
                  <div className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${isOpen ? "bg-gradient-to-br from-orange-500 to-red-600 text-white rotate-180 shadow-md" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                    <svg className="w-5 h-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-[500px] opacity-100 pb-6 px-6 sm:px-8" : "max-h-0 opacity-0 px-6 sm:px-8"}`}
                >
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <p className="text-slate-600 font-medium bg-white inline-block px-6 py-3 rounded-full shadow-sm border border-slate-100">
            Still have questions? <button onClick={() => document.getElementById('admissions')?.scrollIntoView({ behavior: 'smooth' })} className="text-orange-600 font-bold hover:text-orange-700 ml-1 transition-colors underline decoration-2 underline-offset-4 decoration-orange-200 hover:decoration-orange-600">Contact Support</button>
          </p>
        </div>
      </div>
    </section>
  );
}

/********************
 * FINAL CTA & FOOTER
 *******************/
function FinalCTA() {
  return (
    <section className="py-12 bg-slate-900 text-white w-full 2xl:mx-auto 2xl:max-w-7xl 2xl:rounded-3xl 2xl:mb-8 shadow-2xl relative overflow-hidden">

      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-red-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl"></div>

      <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h3 className="text-2xl font-bold">
            Not sure which course fits best?
          </h3>
          <p className="text-slate-300">
            Book a free counselling session and get a personalized roadmap.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="#admissions"
            className="px-4 py-2 rounded-xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Book Counselling
          </a>
          <a href="#apply" className="px-4 py-2 rounded-xl bg-[#66090D] text-white hover:bg-[#55080b] transition-colors">
            Apply Now
          </a>
        </div>
      </div>
    </section>
  );
}

