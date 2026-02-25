import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BuildingStorefrontIcon,
    ArrowTrendingUpIcon,
    UserGroupIcon,
    LightBulbIcon,
    ShieldCheckIcon,
    MapPinIcon,
    ChevronDownIcon,
    ArrowRightIcon,
    BuildingOfficeIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';

const Franchise = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        experience: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Franchise Inquiry:', formData);
        alert('Thank you for your interest! Our team will contact you shortly.');
    };

    return (
        <div className="min-h-screen bg-white pt-[56px] lg:pt-[120px]">
            {/* Hero Section - Full Width Banner */}
            <section className="relative bg-black overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2 }}
                    className="w-full"
                >
                    <img
                        src="/images/franchise/hero%20franchise.png"
                        alt="Franchise Hero Banner"
                        className="w-full h-auto block"
                    />
                </motion.div>
            </section>

            {/* Investor Relations Tabs */}
            <div className="bg-slate-50 border-b border-slate-200 sticky top-[56px] lg:top-[120px] z-40">
                <div className="max-w-7xl mx-auto md:px-4">
                    <div className="flex items-center justify-start overflow-x-auto no-scrollbar px-4 md:px-0">
                        {[
                            { name: "Financial Results", active: true },
                            { name: "Corporate Governance", dropdown: true },
                            { name: "Statutory & Regulatory Disclosures", dropdown: true },
                            { name: "Communication & Announcements", dropdown: true },
                            { name: "Offer Documents", dropdown: true }
                        ].map((tab, i) => (
                            <button
                                key={i}
                                className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 group
                                    ${tab.active
                                        ? "text-slate-900 border-orange-500 bg-white"
                                        : "text-slate-500 border-transparent hover:text-slate-900"
                                    }`}
                            >
                                {tab.name}
                                {tab.dropdown && (
                                    <ChevronDownIcon className="w-2.5 h-2.5 text-slate-400 group-hover:text-slate-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>


            {/* Prosperity Portal Section */}
            <section id="prosperity-portal" className="pt-12 pb-6 md:pt-32 md:pb-12 bg-white scroll-mt-[150px] lg:scroll-mt-[200px]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Prosperity Portal</h2>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        {/* Documents List */}
                        <div className="lg:col-span-8">
                            <h3 className="text-sm font-black text-slate-900 mb-8">Q2 FY 2025-26</h3>
                            <div className="border-t border-slate-200">
                                {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
                                    <button
                                        key={i}
                                        className="w-full py-5 flex items-center justify-between group border-b border-slate-200 hover:bg-slate-50 transition-all px-2"
                                    >
                                        <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Lorem Ipsum</span>
                                        <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stats Sidebar Card */}
                        <div className="lg:col-span-4 lg:sticky lg:top-40 mt-12 lg:mt-0">
                            <div className="bg-black text-white rounded-sm overflow-hidden divide-y divide-white/20 w-full max-w-[400px] mx-auto lg:ml-auto">
                                {/* Area */}
                                <div className="p-5 px-6 flex items-center gap-4">
                                    <BuildingOfficeIcon className="w-6 h-6 text-white" />
                                    <div>
                                        <span className="text-orange-500 font-black text-lg uppercase italic">Area: </span>
                                        <span className="font-black text-xl">1000-1500 Sq.ft</span>
                                    </div>
                                </div>
                                {/* Return */}
                                <div className="p-5 px-6">
                                    <div className="flex items-center gap-4 mb-1">
                                        <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
                                        <h4 className="text-xl font-black">High Return</h4>
                                    </div>
                                    <p className="text-orange-500 font-black text-[10px] uppercase tracking-widest ml-10 italic">High Gross Profit Margin</p>
                                </div>
                                {/* Investment */}
                                <div className="p-5 px-6">
                                    <div className="flex items-start gap-4">
                                        <BanknotesIcon className="w-6 h-6 text-white" />
                                        <div>
                                            <h4 className="text-orange-500 font-black text-xs uppercase tracking-tight mb-1 italic leading-none">Investment Starts from</h4>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black">5LACS</span>
                                                <span className="text-orange-500 font-black text-[8px] uppercase italic">*Onwards</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative z-20 -mb-[60px] md:-mb-[120px] mt-6">
                <div className="relative w-full overflow-hidden">
                    <div className="relative md:absolute md:top-8 left-0 w-full z-10 text-center pointer-events-none px-4 pt-8 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900">Investor Contacts</h2>
                    </div>
                    <img
                        src="/images/franchise/footer.png"
                        alt="Investor Contacts Banner"
                        className="w-full h-auto block"
                    />
                </div>
            </section>

        </div>
    );
};

export default Franchise;