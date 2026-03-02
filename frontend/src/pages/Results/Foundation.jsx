import { getImageUrl } from "../../utils/imageUtils";
import React, { useState, useEffect } from 'react';
import ResultsSection from '../../components/Results/ResultsSection';
import { centresAPI } from '../../services/api';
import OtherCoursesResultSection from '../../components/Results/OtherCoursesResultSection';
import FAQResultSection from '../../components/Results/FAQResultSection';

export default function FoundationResultPage() {
    const [exams, setExams] = useState([]);
    const [years, setYears] = useState([]);
    const [activeExam, setActiveExam] = useState("All");
    const [activeYear, setActiveYear] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExamsAndYearsFromToppers();
    }, []);

    const fetchExamsAndYearsFromToppers = async () => {
        try {
            setLoading(true);
            const response = await centresAPI.getAll();

            // Extract all toppers from all centres
            const allToppers = [];
            response.data.forEach((centre) => {
                if (centre.toppers && Array.isArray(centre.toppers)) {
                    centre.toppers.forEach((topper) => {
                        // Infer category for legacy data
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

                        // Only include Foundation toppers
                        if (category === "Foundation") {
                            allToppers.push({
                                exam: topper.exam || "N/A",
                                year: topper.year ? topper.year.toString() : "N/A",
                                category: category
                            });
                        }
                    });
                }
            });

            // Extract unique exams from Foundation toppers
            const uniqueExams = [...new Set(allToppers.map(t => t.exam))].sort();
            setExams(uniqueExams);

            // Extract unique years from Foundation toppers
            const uniqueYears = [...new Set(allToppers.map(t => t.year))].filter(y => y !== "N/A").sort().reverse();
            setYears(uniqueYears);

        } catch (error) {
            console.error('Error fetching exams from toppers:', error);
            // Fallback
            setExams(['NTSE', 'Olympiad', 'KVPY']);
            setYears(['2025', '2024', '2023', '2022', '2021']);
        } finally {
            setLoading(false);
        }
    };

    const handleExamClick = (exam) => {
        setActiveExam(exam);
    };

    const handleYearClick = (year) => {
        setActiveYear(year);
    };

    return (
        <div className="relative bg-gradient-to-br pt-[56px] md:pt-32 pb-0 w-full 2xl:max-w-7xl 2xl:mx-auto shadow-sm min-h-screen">

            {/* Hero Image Section */}
            <div className="w-full bg-white overflow-hidden">
                <div className="w-full relative overflow-hidden aspect-[21/9] sm:aspect-[21/7] lg:aspect-[21/6]">
                    <img
                        src={getImageUrl("/images/result/result_hero_section.webp")}
                        alt="Foundation Results"
                        className="w-full h-full object-cover object-center lg:object-[center_top]"
                        onError={(e) => {
                            e.target.src = "https://placehold.co/1920x600/f97316/ffffff?text=Foundation+Results";
                        }}
                    />
                </div>
            </div>

            {/* Black Tab Bar */}
            <div className="w-full bg-white">
                <div className="w-full">
                    <div className="bg-black border-y border-white/10 relative z-10 shadow-lg -mt-1">
                        <div className="px-4">
                            <div className="flex items-center justify-start overflow-x-auto no-scrollbar scroll-smooth py-1 sm:py-0">
                                <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-max px-2">
                                    <button
                                        onClick={() => handleExamClick("All")}
                                        className={`py-4 px-3 sm:px-4 transition-all duration-300 relative uppercase transform-gpu flex-shrink-0 ${activeExam === "All"
                                            ? "text-[#FF8A50] font-bold scale-110 z-10 opacity-100"
                                            : "text-white font-medium scale-[0.85] opacity-100"
                                            } text-xs sm:text-sm md:text-base`}
                                    >
                                        ALL
                                        {activeExam === "All" && (
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-2 bg-gradient-to-r from-[#FF8A50] to-[#FF5722] animate-in fade-in slide-in-from-bottom-1 duration-300"></div>
                                        )}
                                    </button>

                                    {loading ? (
                                        <div className="py-4 px-4 text-white text-sm">Loading...</div>
                                    ) : (
                                        exams.map((exam) => (
                                            <button
                                                key={exam}
                                                onClick={() => handleExamClick(exam)}
                                                className={`py-4 px-3 sm:px-4 transition-all duration-300 relative uppercase transform-gpu flex-shrink-0 ${activeExam === exam
                                                    ? "text-[#FF8A50] font-bold scale-110 z-10 opacity-100"
                                                    : "text-white font-medium scale-[0.85] opacity-100"
                                                    } text-xs sm:text-sm md:text-base`}
                                            >
                                                {exam}
                                                {activeExam === exam && (
                                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-2 bg-gradient-to-r from-[#FF8A50] to-[#FF5722] animate-in fade-in slide-in-from-bottom-1 duration-300"></div>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toppers Showcase Banner */}
            <div className="w-full bg-white">
                <div className="w-full">
                    <img
                        src={getImageUrl("/images/result/dev x rup.webp")}
                        alt="Toppers Showcase - Foundation Toppers"
                        className="w-full h-auto object-contain"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            </div>

            {/* Combined Building Background Section with All Overlays */}
            <div className="w-full relative bg-white overflow-visible h-[460px]">
                {/* Building Silhouette Background - Enlarged and Shifted significantly up */}
                <div className="absolute inset-x-0 -top-40 h-full opacity-60 select-none pointer-events-none z-0">
                    <img
                        src={getImageUrl("/images/result/building.webp")}
                        alt="Background Building"
                        className="w-full h-[550px] object-cover object-bottom scale-110"
                    />
                </div>

                {/* Year Filter Buttons Section - Overlayed at the top of the building image */}
                <div className="absolute inset-x-0 top-4 z-30 px-4">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <button
                            onClick={() => handleYearClick("All")}
                            className={`px-10 py-2 rounded-full border-2 font-bold transition-all duration-300 text-sm sm:text-base ${activeYear === "All"
                                ? "bg-[#FF5722] text-white border-[#FF5722] shadow-sm"
                                : "bg-white text-black border-black hover:bg-slate-50"
                                } uppercase`}
                        >
                            ALL
                        </button>
                        {years.map((year) => (
                            <button
                                key={year}
                                onClick={() => handleYearClick(year)}
                                className={`px-10 py-2 rounded-full border-2 font-bold transition-all duration-300 text-sm sm:text-base ${activeYear === year
                                    ? "bg-[#FF5722] text-white border-[#FF5722] shadow-sm"
                                    : "bg-white text-black border-black hover:bg-slate-50"
                                    } uppercase`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Black "Our Toppers" Badge - Portaled Style from Reference */}
                <div className="absolute inset-x-0 bottom-[230px] md:bottom-52 flex justify-center z-20 px-4">
                    <div className="bg-black text-white px-6 md:px-10 pt-3 md:pt-4 pb-10 md:pb-20 rounded-t-[30px] md:rounded-t-[50px] rounded-b-[15px] shadow-2xl min-w-[160px] md:min-w-[200px] text-center border-b-4 border-[#FF5722]">
                        <h2 className="text-lg md:text-2xl font-bold tracking-tight">
                            Our <span className="text-[#FF5722]">Toppers</span>
                        </h2>
                    </div>
                </div>
            </div>



            {/* Main Results and Courses Container - Full Black Background */}
            <div className="bg-black">
                <ResultsSection
                    fixedCategory="Foundation"
                    showTabs={false}
                    activeExam={activeExam}
                    activeYear={activeYear}
                />
                <OtherCoursesResultSection category="Foundation" />
                <FAQResultSection category="Foundation" />

                {/* Result Footer Image */}
                <div className="w-full bg-white">
                    <img
                        src={getImageUrl("/images/result/footer image.webp")}
                        alt="Pathfinder Success"
                        className="w-full h-auto object-contain"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            </div>

            {/* Custom scrollbar hiding styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    );
}
