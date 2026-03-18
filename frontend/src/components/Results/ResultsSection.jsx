import React, { useState, useEffect, useMemo, useCallback } from "react";
import { centresAPI } from "../../services/api";
import { useFilter } from "../../contexts/FilterContext";
import Slider from "react-slick";
import { getImageUrl } from "../../utils/imageUtils";
import { useCachedData } from "../../hooks/useCachedData";
import LoadingSpinner from "../common/LoadingSpinner";

// Helper function to get topper image URL - Moved outside to avoid initialization order issues
const getTopperImageUrl = (topper) => {
    if (topper.image_url) return getImageUrl(topper.image_url);
    if (topper.image) return getImageUrl(topper.image);
    if (topper.image_data && topper.image_content_type) {
        return `data:${topper.image_content_type};base64,${topper.image_data}`;
    }
    return null;
};

export default function ResultsSection({ selectedCentre, fixedCategory, title, showTabs = true, activeExam, activeYear }) {
    const { globalSelectedCentre } = useFilter(); // Access global filter context

    const tabs = useMemo(() => ["All", "All India", "Boards", "Foundation"], []);
    const [activeTab, setActiveTab] = useState(fixedCategory || "All");
    
    // Fetch toppers from backend with caching
    const { data: centresData, loading, error: fetchError } = useCachedData(
        "centres",
        () => centresAPI.getAll()
    );

    const error = fetchError ? "Failed to load results. Please try again later." : "";

    const [filterCentre, setFilterCentre] = useState(
        selectedCentre && selectedCentre !== "All" ? selectedCentre
            : (globalSelectedCentre && globalSelectedCentre !== "All" ? globalSelectedCentre : "All")
    );
    const [filterExam, setFilterExam] = useState("All");
    const [filterYear, setFilterYear] = useState("All");

    useEffect(() => {
        if (fixedCategory) {
            setActiveTab(fixedCategory);
        }
    }, [fixedCategory]);

    useEffect(() => {
        if (activeExam) {
            setFilterExam(activeExam);
        }
    }, [activeExam]);

    useEffect(() => {
        if (activeYear) {
            setFilterYear(activeYear);
        }
    }, [activeYear]);

    useEffect(() => {
        if (selectedCentre && selectedCentre !== "All" && selectedCentre !== "") {
            setFilterCentre(selectedCentre);
        } else {
            setFilterCentre("All");
        }
    }, [selectedCentre]);

    // Extract all toppers from all centres using useMemo
    const allToppers = useMemo(() => {
        if (!centresData || !Array.isArray(centresData)) return [];
        
        const toppers = [];
        centresData.forEach((centre) => {
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

                    toppers.push({
                        name: topper.name || "Unknown",
                        score: topper.percentages || topper.score || 0,
                        exam: topper.exam || "N/A",
                        category: category,
                        rank: topper.rank ? `Rank ${topper.rank}` : "N/A",
                        photo: getTopperImageUrl(topper) || getImageUrl("images/placeholder.webp"),
                        quote: topper.topper_msg || "No message available",
                        centre: centre.centre || "Unknown",
                        badge: topper.badge || "",
                        year: topper.year ? topper.year.toString() : "N/A",
                        imgHeight: "h-56",
                        imgWidth: "w-full",
                    });
                });
            }
        });
        return toppers;
    }, [centresData]);

    const handleRetry = useCallback(() => {
        window.location.reload();
    }, []);

    // Categorized toppers by exam type using useMemo
    const categorizedData = useMemo(() => {
        return {
            All: allToppers,
            "All India": allToppers.filter((t) => t.category === "All India"),
            Boards: allToppers.filter((t) => t.category === "Boards"),
            Foundation: allToppers.filter((t) => t.category === "Foundation"),
        };
    }, [allToppers]);

    // Get base data for active tab
    const baseCards = useMemo(() => categorizedData[activeTab] || [], [categorizedData, activeTab]);

    const uniqueCentres = useMemo(() => {
        return [...new Set(baseCards.map(item => item.centre))].sort();
    }, [baseCards]);

    useEffect(() => {
        let targetCentre = "All";
        if (selectedCentre && selectedCentre !== "All" && selectedCentre !== "") {
            targetCentre = selectedCentre;
        } else if (globalSelectedCentre && globalSelectedCentre !== "All" && globalSelectedCentre !== "") {
            targetCentre = globalSelectedCentre;
        }

        if (targetCentre !== "All") {
            const match = uniqueCentres.find(c => (c || "").toLowerCase() === targetCentre.toLowerCase());
            if (match) {
                setFilterCentre(match);
            } else {
                setFilterCentre(targetCentre);
            }
        } else {
            setFilterCentre("All");
        }
    }, [selectedCentre, globalSelectedCentre, activeTab, uniqueCentres]);

    const examsSource = useMemo(() => {
        return (filterCentre && filterCentre !== "All")
            ? baseCards.filter(c => (c.centre || "").toLowerCase() === filterCentre.toLowerCase())
            : baseCards;
    }, [baseCards, filterCentre]);

    const uniqueExams = useMemo(() => [...new Set(examsSource.map(item => item.exam))].sort(), [examsSource]);

    const yearsSource = useMemo(() => {
        return examsSource.filter(c => (filterExam && filterExam !== "All") ? c.exam === filterExam : true);
    }, [examsSource, filterExam]);

    const uniqueYears = useMemo(() => [...new Set(yearsSource.map(item => item.year))].sort().reverse(), [yearsSource]);

    const cards = useMemo(() => {
        return baseCards.filter((student) => {
            if (filterCentre && filterCentre !== "All") {
                if ((student.centre || "").toLowerCase() !== filterCentre.toLowerCase()) return false;
            }
            if (filterExam && filterExam !== "All") {
                if (student.exam !== filterExam) return false;
            }
            if (filterYear && filterYear !== "All") {
                if (student.year !== filterYear) return false;
            }
            return true;
        });
    }, [baseCards, filterCentre, filterExam, filterYear]);

    useEffect(() => {
        setFilterExam("All");
        setFilterYear("All");
    }, [activeTab]);

    return (
        <section id="results" className="pt-0 pb-12 bg-transparent w-full">
            <div className="w-full px-0">
                {title && (
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
                    </div>
                )}

                {showTabs && !fixedCategory && (
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
                )}

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner />
                    </div>
                )}

                {error && !loading && (
                    <div className="text-center py-12">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg inline-block">
                            <p className="font-semibold">{error}</p>
                            <button onClick={handleRetry} className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Retry</button>
                        </div>
                    </div>
                )}

                {!loading && !error && cards.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-600 text-lg">No results found for the selected criteria.</p>
                    </div>
                )}

                {!loading && !error && cards.length > 0 && (
                    <div className="relative z-40 w-full mb-0 -mt-80">
                        <div className="absolute inset-0 z-0 w-screen left-1/2 -ml-[50vw]">
                            <img src={getImageUrl("/images/result/orange paper.webp")} alt="Background" className="w-full h-full object-cover" />
                        </div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 py-16 md:py-24">
                            <div className="w-full px-0">
                                {(() => {
                                    const settings = {
                                        className: "topper-hero-slider",
                                        centerMode: true,
                                        infinite: true,
                                        centerPadding: "0px",
                                        slidesToShow: cards.length < 7 ? cards.length : 7,
                                        speed: 500,
                                        autoplay: true,
                                        autoplaySpeed: 2000,
                                        focusOnSelect: true,
                                        arrows: true,
                                        responsive: [{
                                            breakpoint: 1280,
                                            settings: { slidesToShow: cards.length < 5 ? cards.length : 5, centerPadding: "20px" }
                                        }, {
                                            breakpoint: 1024,
                                            settings: { slidesToShow: 3, centerPadding: "40px" }
                                        }, {
                                            breakpoint: 640,
                                            settings: { slidesToShow: 1, centerPadding: "40px", arrows: true }
                                        }]
                                    };

                                    return (
                                        <Slider {...settings}>
                                            {cards.map((student, idx) => (
                                                <div key={idx} className="outline-none py-8 px-2 md:px-6">
                                                    <div className="w-48 sm:w-36 mx-auto flex flex-col group cursor-pointer relative">
                                                        <div className="absolute -top-3 -left-4 z-20">
                                                            <div className="text-slate-900 font-black text-xl md:text-base tracking-tight leading-none mb-0.5">RANK</div>
                                                            <div className="text-slate-900 font-extrabold text-3xl md:text-xl leading-none">
                                                                {String(student.rank || "").replace(/rank/i, "").trim() || (idx + 1)}
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-[#fa8626] p-1.5 shadow-lg relative transform transition-transform duration-300 group-hover:scale-105" style={{ clipPath: 'polygon(75px 0, 100% 0, 100% 100%, 0 100%, 0 75px)' }}>
                                                            <div className="bg-white/20 p-1 pb-0">
                                                                <div className="w-full aspect-[4/5] bg-slate-200 overflow-hidden" style={{ clipPath: 'polygon(65px 0, 100% 0, 100% 100%, 0 100%, 0 65px)' }}>
                                                                    <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                                                                </div>
                                                            </div>
                                                            <div className="text-center py-2 bg-[#fa8626]">
                                                                <div className="text-white font-bold text-sm sm:text-base uppercase truncate px-1">{student.name}</div>
                                                                {student.score && <div className="text-white/80 text-[10px] font-bold">{student.score}%</div>}
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

                        {!fixedCategory && (
                            <div className="text-center mt-12 relative z-20">
                                <button className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-xl">View All Success Stories →</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
