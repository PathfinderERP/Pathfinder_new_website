import { getImageUrl } from "../utils/imageUtils";
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
    BanknotesIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { FadeInImage } from "../components/common/OptimizedImage";
import { franchiseAPI } from "../services/api";

const Franchise = () => {
    const [activeTab, setActiveTab] = useState("Financial Results");
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [loadingInquiry, setLoadingInquiry] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        experience: ''
    });

    const investorData = {
        "Financial Results": {
            period: "Q2 FY 2025-26",
            documents: [
                "Unaudited Financial Results",
                "Investor Presentation",
                "Press Release - Q2 Performance",
                "Audited Annual Report 2024-25",
                "Consolidated Financial Statements",
                "Cash Flow Statements",
                "Notes to Financial Results"
            ]
        },
        "Corporate Governance": {
            period: "Current Policies",
            documents: [
                "Board of Directors Profile",
                "Composition of Committees",
                "Code of Conduct for Board & Senior Management",
                "Whistle Blower Policy",
                "Policy on Materiality of Related Party Transactions",
                "Familiarization Programme for Independent Directors"
            ]
        },
        "Statutory & Regulatory Disclosures": {
            period: "FY 2025-26",
            documents: [
                "Shareholding Pattern",
                "Corporate Governance Report",
                "Annual Return (Form MGT-7)",
                "Secretarial Audit Report",
                "Compliance Certificate - Reg 7(3)",
                "Investor Complaint Status"
            ]
        },
        "Communication & Announcements": {
            period: "Latest Updates",
            documents: [
                "Intimation of Board Meeting",
                "Press Release - New Center Launch",
                "Outcome of Annual General Meeting",
                "Schedule of Analyst/Investor Meet",
                "Transcript of Earnings Call",
                "Clarification on Price Movement"
            ]
        },
        "Offer Documents": {
            period: "Historical Records",
            documents: [
                "Prospectus - Main Board Listing",
                "Draft Red Herring Prospectus",
                "Letter of Offer - Rights Issue",
                "Information Memorandum",
                "Statement of Objects of Issue",
                "Basis of Allotment"
            ]
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingInquiry(true);
        try {
            await franchiseAPI.submit(formData);
            setShowSuccess(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                city: '',
                state: '',
                experience: ''
            });
        } catch (err) {
            console.error('Error submitting inquiry:', err);
            alert('Failed to submit inquiry. Please try again.');
        } finally {
            setLoadingInquiry(false);
        }
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        document.getElementById('prosperity-portal')?.scrollIntoView({ behavior: 'smooth' });
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
                    <FadeInImage
                        src={getImageUrl("/images/franchise/hero%20franchise.webp")}
                        alt="Franchise Hero Banner"
                        className="w-full h-auto block"
                    />
                </motion.div>
            </section>

            {/* Investor Relations Tabs */}
            <div className="bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto md:px-4">
                    <div className="flex items-center justify-start overflow-x-auto no-scrollbar px-4 md:px-0">
                        {Object.keys(investorData).map((tabName, i) => {
                            const isDropdown = tabName !== "Financial Results";
                            return (
                                <div key={i} className="relative group">
                                    <button
                                        onClick={() => handleTabClick(tabName)}
                                        onMouseEnter={() => isDropdown && setOpenDropdown(tabName)}
                                        onMouseLeave={() => setOpenDropdown(null)}
                                        className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2
                                            ${activeTab === tabName
                                                ? "text-slate-900 border-orange-500 bg-white"
                                                : "text-slate-500 border-transparent hover:text-slate-900"
                                            }`}
                                    >
                                        {tabName}
                                        {isDropdown && (
                                            <ChevronDownIcon className="w-2.5 h-2.5 text-slate-400 group-hover:text-slate-600" />
                                        )}
                                    </button>
                                    
                                    {/* Simplified Dropdown Menu if needed - currently just highlights the section */}
                                    {isDropdown && openDropdown === tabName && (
                                        <div 
                                            onMouseEnter={() => setOpenDropdown(tabName)}
                                            onMouseLeave={() => setOpenDropdown(null)}
                                            className="absolute left-0 top-full w-64 bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                                        >
                                            View {tabName} Details
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
                            <h3 className="text-sm font-black text-slate-900 mb-8 uppercase tracking-widest">{investorData[activeTab]?.period} - {activeTab}</h3>
                            <div className="border-t border-slate-200">
                                {investorData[activeTab]?.documents.map((doc, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDoc(doc)}
                                        className="w-full py-5 flex items-center justify-between group border-b border-slate-200 hover:bg-slate-50 transition-all px-2"
                                    >
                                        <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{doc}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] items-center font-black text-orange-500 transition-all uppercase italic tracking-wider">Show Details</span>
                                            <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                                        </div>
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

            {/* Support Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-[1fr_minmax(0,450px)] gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase">Comprehensive <span className="text-orange-500">Support</span></h2>
                            <div className="space-y-6">
                                {[
                                    { title: "Academic Support", desc: "Access to our proven curriculum, teaching methodologies, and regular study materials." },
                                    { title: "Marketing & Branding", desc: "National level brand awareness and localized marketing strategies for your center." },
                                    { title: "Operational Guidance", desc: "End-to-end support in center setup, recruitment, and management systems." },
                                    { title: "Technology Integration", desc: "Complete access to our digital learning platforms and center management software." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                                            <p className="text-sm text-slate-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="rounded-xl overflow-hidden shadow-xl"
                        >
                            <FadeInImage
                                src={getImageUrl("/images/franchise/support_indian.png")}
                                alt="Support"
                                className="w-full h-[300px] object-cover block"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Franchise Inquiry Form */}
            <section className="py-20 bg-white" id="inquiry-form">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-slate-900 uppercase">Franchise <span className="text-orange-500">Inquiry</span></h2>
                        <p className="text-slate-500 mt-2 font-bold uppercase text-[10px] tracking-widest">Partner with India's leading education institute</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                            <input
                                required
                                type="text"
                                placeholder="Enter your name"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-sm"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                            <input
                                required
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-sm"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                            <input
                                required
                                type="tel"
                                placeholder="Enter your phone"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-sm"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Proposed City</label>
                            <input
                                required
                                type="text"
                                placeholder="City name"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-sm"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Experience</label>
                            <textarea
                                placeholder="Tell us about your background"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-sm h-32 resize-none"
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={loadingInquiry}
                                className="w-full bg-orange-500 text-white font-black py-5 rounded-xl hover:bg-orange-600 transition-all uppercase tracking-widest shadow-xl shadow-orange-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loadingInquiry ? (
                                    <>
                                        <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Inquiry'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <section className="relative z-20 -mb-[60px] md:-mb-[120px] mt-6">
                <div className="relative w-full overflow-hidden">
                    <div className="relative md:absolute md:top-8 left-0 w-full z-10 text-center pointer-events-none px-4 pt-8 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900">Investor Contacts</h2>
                    </div>
                    <FadeInImage
                        src={getImageUrl("/images/franchise/footer.webp")}
                        alt="Investor Contacts Banner"
                        className="w-full h-auto block"
                    />
                </div>
            </section>

            {/* Document Details Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedDoc(null)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">{selectedDoc}</h3>
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{activeTab}</span>
                                </div>
                                <button 
                                    onClick={() => setSelectedDoc(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-8">
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    The complete details and downloadable documents for <span className="font-bold text-slate-900">{selectedDoc}</span> are currently being updated in our portal.
                                </p>
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <p className="text-sm text-orange-800 font-bold leading-relaxed italic">
                                        For immediate access to this document or for any investor queries, please reach out to our support team at support@pathfinder.edu.in
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedDoc(null)}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-orange-500 transition-all uppercase tracking-widest text-sm"
                            >
                                Close Details
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                        onClick={() => setShowSuccess(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden p-10 text-center"
                    >
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, delay: 0.2 }}
                            className="w-24 h-24 bg-orange-500 rounded-full mx-auto flex items-center justify-center mb-8 shadow-xl shadow-orange-500/30"
                        >
                            <ShieldCheckIcon className="w-12 h-12 text-white" />
                        </motion.div>
                        
                        <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">SUCCESS!</h3>
                        <p className="text-slate-500 font-bold mb-10 leading-relaxed text-sm uppercase tracking-wide text-center">
                            Thank you for your interest. Our partners team will reach out to you within <span className="text-orange-500">24-48 hours</span> to discuss the next steps.
                        </p>

                        <button
                            onClick={() => setShowSuccess(false)}
                            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-orange-600 transition-all uppercase tracking-widest text-xs shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                        >
                            Awesome
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Franchise;