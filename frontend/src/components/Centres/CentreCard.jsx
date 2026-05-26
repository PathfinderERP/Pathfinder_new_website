import React from "react";
import {
    MapPinIcon,
    MapIcon,
    PhoneIcon,
    AcademicCapIcon,
    ArrowRightIcon,
    StarIcon,
    EnvelopeIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const CentreCard = ({ centre, onExplore }) => {
    const navigate = useNavigate();
    if (!centre) return null;

    const handleExplore = () => {
        if (onExplore) {
            onExplore(centre);
        } else {
            navigate(`/centres/${centre.id}`);
        }
    };

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
    const mapLink = getMapLink(centre.location, centre.map_url);

    return (
        <div className="group relative bg-white rounded-3xl border border-slate-100 p-4 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-orange-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl" />

            <div className="relative z-10">
                {/* Header: Logo & Type */}
                <div className="flex justify-between items-start mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-neutral-100 border border-slate-100 flex items-center justify-center overflow-hidden group-hover:border-orange-200 transition-colors duration-300 shadow-sm">
                        <img
                            src={centre.logo_url || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=200&auto=format&fit=crop"}
                            alt={centre.centre}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=200&auto=format&fit=crop";
                            }}
                        />
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${centre.centre_type === 'Instation'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-amber-100 text-amber-700'
                            }`}>
                            {centre.centre_type || 'General'}
                        </span>
                        {centre.is_franchise && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                                Franchise
                            </span>
                        )}
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                            <StarIcon className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-bold text-amber-700">4.9</span>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="mb-4">
                    <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-orange-600 transition-colors duration-300">
                        {centre.centre}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <MapIcon className="w-3 h-3" />
                        {centre.district}, {centre.state}
                    </p>
                </div>

                {/* Stats Row */}
                <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 group-hover:bg-white group-hover:border-orange-100 transition-all duration-300">
                            <div className="text-xs font-bold text-slate-500 mb-1">Toppers</div>
                            <div className="flex items-center gap-2">
                                <AcademicCapIcon className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-black text-slate-900">
                                    {centre.toppers?.length || 0}+
                                </span>
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 group-hover:bg-white group-hover:border-orange-100 transition-all duration-300">
                            <div className="text-xs font-bold text-slate-500 mb-1">Distance</div>
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4 text-orange-400" />
                                <span className="text-sm font-black text-slate-900">
                                    {centre.distance ? `${centre.distance.toFixed(1)} km` : 'Local'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {centre.email && (
                        <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 group-hover:bg-white group-hover:border-orange-100 transition-all duration-300 flex items-center gap-2">
                            <EnvelopeIcon className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-700 truncate" title={centre.email}>
                                {centre.email}
                            </span>
                        </div>
                    )}
                </div>

                {/* Address Preview */}
                <p className="text-sm text-slate-600 font-medium mb-6 line-clamp-2 min-h-[36px]">
                    {centre.address || "Address details currently being updated for this location."}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExplore}
                        className="flex-1 bg-orange-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-orange-700 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                    >
                        Explore Centre
                        <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    {mapLink ? (
                        <a
                            href={mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-white hover:border-orange-200 group/map transition-all duration-300"
                            title="Open in Maps"
                        >
                            <MapIcon className="w-5 h-5 text-slate-400 group-hover/map:text-orange-500 transition-colors" />
                        </a>
                    ) : (
                        <button
                            onClick={() => {
                                const contactEl = document.querySelector("#contact-section");
                                if (contactEl) {
                                    contactEl.scrollIntoView({ behavior: "smooth" });
                                }
                            }}
                            className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-white hover:border-orange-200 group/map transition-all duration-300"
                            title="Get Directions"
                        >
                            <MapIcon className="w-5 h-5 text-slate-400 group-hover/map:text-orange-500 transition-colors" />
                        </button>
                    )}
                </div>
            </div>

            {/* Hover Line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-orange-500 transition-all duration-500 group-hover:w-full" />
        </div>
    );
};

export default React.memo(CentreCard);
