import React, { useState } from "react";
import {
    MapPinIcon,
    MapIcon,
    AcademicCapIcon,
    UserGroupIcon,
    StarIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChevronRightIcon,
    ChevronLeftIcon
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUtils";

const CentreDetails = ({ centre }) => {
    const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=400&auto=format&fit=crop";
    if (!centre) return null;

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Header */}
            <section className="relative pt-16 md:pt-32 pb-10 md:pb-20 overflow-hidden bg-gradient-to-br from-orange-600 to-red-700">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-white rounded-full blur-[150px] -mr-[20%]" />
                    <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-amber-400 rounded-full blur-[150px] -ml-[10%]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-20 mb-8 mt-8 md:mt-4">
                    <Link
                        to="/centres"
                        className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-all group"
                    >
                        <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Centres
                    </Link>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[40px] bg-white p-4 shadow-2xl overflow-hidden">
                            <img
                                src={getImageUrl(centre.logo_url) || FALLBACK_IMAGE}
                                alt={centre.centre}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = FALLBACK_IMAGE;
                                }}
                            />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-4">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-white text-[10px] font-bold uppercase tracking-wider">Active Learning Centre</span>
                            </div>
                            <h1 className="text-4xl md:text-7xl font-black text-white leading-tight mb-4 uppercase">
                                Pathfinder <br className="hidden md:block" />
                                <span className="text-white/90">{centre.centre}</span>
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                                <div className="flex items-center gap-2 text-white/70 font-bold">
                                    <MapPinIcon className="w-5 h-5" />
                                    {centre.district}, {centre.state}
                                </div>
                                <div className="flex items-center gap-2 text-white/70 font-bold">
                                    <StarIcon className="w-5 h-5 text-amber-300 fill-amber-300" />
                                    4.9 (2k+ Reviews)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 pb-24">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column: Details & Facilities */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Box */}
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/60 border border-slate-100">
                            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <span className="text-orange-600">i</span>
                                </span>
                                About this Centre
                            </h3>
                            <p className="text-lg text-slate-600 leading-relaxed font-medium mb-8">
                                The {centre.centre} centre is one of our premier locations in {centre.district},
                                equipped with state-of-the-art classrooms, advanced doubt-clearing
                                zones, and a dedicated counselling wing to ensure every student
                                receives personalized attention.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                        <UserGroupIcon className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Faculty</div>
                                        <div className="text-lg font-black text-slate-900">Elite Experts</div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                        <AcademicCapIcon className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Success</div>
                                        <div className="text-lg font-black text-slate-900">Rank Holders</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Toppers Section */}
                        {centre.toppers && centre.toppers.length > 0 && (
                            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-slate-200/60 border border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-slate-900">Hall of Fame</h3>
                                    <button className="text-orange-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                        View All <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4 scrollbar-hide">
                                    {centre.toppers.map((topper, idx) => (
                                        <div key={idx} className="flex-shrink-0 w-48 text-center group">
                                            <div className="w-32 h-32 rounded-full mx-auto overflow-hidden border-4 border-slate-50 group-hover:border-orange-500 transition-all duration-300 mb-4 shadow-lg">
                                                <img
                                                    src={getImageUrl(topper.image_url) || getImageUrl("images/placeholder.webp")}
                                                    alt={topper.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <h4 className="font-bold text-slate-900 mb-1">{topper.name}</h4>
                                            <p className="text-xs font-black text-orange-600 uppercase tracking-widest">{topper.exam}</p>
                                            <div className="text-xs font-bold text-slate-400 mt-1">{topper.rank || topper.percentages + '%'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Contact & Map */}
                    <div className="space-y-8">
                        {/* Quick Contact Card */}
                        <div className="bg-neutral-900 rounded-[40px] p-8 text-white shadow-2xl border border-white/5">
                            <h3 className="text-xl font-black mb-8">Book a Visit</h3>

                            <div className="space-y-6 mb-10">
                                <div className="flex items-start gap-4">
                                    <MapPinIcon className="w-6 h-6 text-orange-500 flex-shrink-0" />
                                    <p className="text-white/70 text-sm leading-relaxed font-medium">
                                        {centre.address}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <PhoneIcon className="w-6 h-6 text-orange-400" />
                                    <p className="text-white/70 text-sm font-bold">{centre.mobile || "9147178886"}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <EnvelopeIcon className="w-6 h-6 text-amber-300" />
                                    <p className="text-white/70 text-sm font-bold">{centre.email || "support@pathfinder.edu.in"}</p>
                                </div>
                            </div>

                            <button className="w-full py-4 rounded-2xl bg-orange-600 text-white hover:bg-orange-700 transition-all font-black text-sm tracking-widest uppercase mb-4 shadow-xl">
                                Instant Counselling
                            </button>
                        </div>

                        {/* Map Integration */}
                        <div className="bg-white rounded-[40px] p-4 shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                            <div className="aspect-[4/5] rounded-[30px] overflow-hidden bg-slate-100">
                                {centre.location ? (
                                    <iframe
                                        src={centre.location.includes('iframe') ? centre.location.match(/src="([^"]+)"/)?.[1] : centre.location}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        title="Centre Location"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold p-12 text-center">
                                        Map visualizer currently being updated.
                                    </div>
                                )}
                            </div>
                            <div className="p-4 text-center">
                                <a
                                    href={centre.location}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    Open in Google Maps <MapIcon className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CentreDetails;
