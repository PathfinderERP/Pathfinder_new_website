import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPinIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    AdjustmentsVerticalIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { centresAPI } from "../../services/api";
import CentreCard from "./CentreCard";
import { useCachedData } from "../../hooks/useCachedData";
import { useCallback } from "react";

const CentreShowcase = () => {
    const { data: centres, loading, error } = useCachedData("centres", () => centresAPI.getAll(), {
        onSuccess: (response) => Array.isArray(response.data) ? response.data : (response.data.results || [])
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedState, setSelectedState] = useState("All");
    const [activeCentre, setActiveCentre] = useState(null);
    const [viewMode, setViewMode] = useState("grid"); // grid or map-split

    useEffect(() => {
        if (centres.length > 0 && !activeCentre) {
            setActiveCentre(centres[0]);
        }
    }, [centres, activeCentre]);

    const handleCentreHover = useCallback((centre) => {
        setActiveCentre(centre);
    }, []);

    const states = useMemo(() => ["All", ...new Set(centres.map(c => c.state).filter(Boolean))], [centres]);

    const filteredCentres = useMemo(() => {
        return centres.filter(centre => {
            const matchesSearch = centre.centre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                centre.district?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesState = selectedState === "All" || centre.state === selectedState;
            return matchesSearch && matchesState;
        });
    }, [centres, searchTerm, selectedState]);

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold tracking-widest text-xs uppercase animate-pulse">Scanning our network...</p>
            </div>
        );
    }

    return (
        <section className="relative pt-8 md:pt-24 pb-0 bg-white">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] bg-orange-100/30 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-6 md:mb-16">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100 mb-6"
                        >
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                            <span className="text-orange-700 text-xs font-bold uppercase tracking-wider">Our Growing Network</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6"
                        >
                            Excellence Near <br />
                            <span className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">Every Aspirant</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg font-medium text-slate-500 max-w-xl"
                        >
                            With over 42+ learning centres across multiple states, we bring IIT-standard mentorship right to your doorstep.
                        </motion.p>
                    </div>

                    {/* Filters Bar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-row items-center gap-2 sm:gap-4 w-full md:w-auto py-4"
                    >
                        {/* Search */}
                        <div className="relative w-[60%] sm:w-64">
                            <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-orange-500 transition-all outline-none font-medium text-sm sm:text-base text-slate-900"
                            />
                        </div>

                        {/* State Filter */}
                        <div className="relative w-[40%] sm:w-48">
                            <AdjustmentsVerticalIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                className="w-full pl-9 sm:pl-12 pr-6 sm:pr-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-orange-500 transition-all outline-none font-medium text-sm sm:text-base text-slate-900 appearance-none cursor-pointer"
                            >
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start relative">
                    {/* Centes Grid / List */}
                    <div className="w-full lg:w-[65%] order-2 lg:order-1">
                        <div className="grid sm:grid-cols-2 gap-6 relative">
                            <AnimatePresence mode="popLayout">
                                {filteredCentres.map((centre, idx) => (
                                    <motion.div
                                        key={centre.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                                        onMouseEnter={() => handleCentreHover(centre)}
                                    >
                                        <CentreCard centre={centre} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredCentres.length === 0 && (
                            <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <XMarkIcon className="w-10 h-10 text-slate-400" />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-2">No centres found</h4>
                                <p className="text-slate-500 font-medium">Try adjusting your filters or search term.</p>
                            </div>
                        )}
                    </div>

                    {/* Interactive Map Visualizer */}
                    <div className="w-full lg:w-[35%] lg:sticky lg:top-40 order-1 lg:order-2 self-start">
                        <motion.div
                            layoutId="map-container"
                            className="bg-slate-900 rounded-[32px] overflow-hidden border-[6px] border-slate-100 shadow-xl relative group"
                        >
                            <div className="absolute inset-0 bg-orange-500/5 pointer-events-none z-10" />

                            <div className="aspect-square w-full relative">
                                {activeCentre?.location ? (
                                    <iframe
                                        key={activeCentre.id}
                                        src={activeCentre.location.includes('iframe') ? activeCentre.location.match(/src="([^"]+)"/)?.[1] : activeCentre.location}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1)' }}
                                        allowFullScreen
                                        loading="lazy"
                                        title="Centre Location"
                                        className="group-hover:grayscale-0 transition-all duration-700"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-800">
                                        <MapPinIcon className="w-20 h-20 text-slate-600 mb-6 animate-bounce" />
                                        <h3 className="text-2xl font-black text-white mb-2">Location Ready</h3>
                                        <p className="text-slate-400 font-medium">Select a centre card to visualize its position on the global map.</p>
                                    </div>
                                )}

                                {/* Overlay Details */}
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl border border-white/20 shadow-2xl transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                                <MapPinIcon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-slate-900 leading-none mb-1">{activeCentre?.centre}</h4>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{activeCentre?.district}, {activeCentre?.state}</p>
                                            </div>
                                            <a
                                                href={activeCentre?.location}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-slate-100 rounded-xl hover:bg-orange-100 hover:text-orange-600 transition-colors"
                                            >
                                                <ChevronRightIcon className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                <div className="text-3xl font-black text-slate-900 mb-1">42<span className="text-orange-500">+</span></div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Centres</div>
                            </div>
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                <div className="text-3xl font-black text-slate-900 mb-1">05<span className="text-orange-500">+</span></div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">States Covered</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CentreShowcase;
