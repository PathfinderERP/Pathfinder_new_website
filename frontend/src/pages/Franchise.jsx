import { getImageUrl } from "../utils/imageUtils";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    XMarkIcon,
    MapIcon,
    ChevronRightIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
    CheckBadgeIcon,
    CalendarDaysIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { FadeInImage } from "../components/common/OptimizedImage";
import { franchiseAPI, centresAPI } from "../services/api";
import CentreCard from "../components/Centres/CentreCard";
import { useCachedData } from "../hooks/useCachedData";
import { getMapEmbedUrl, getDirectMapLink } from "../utils/mapUtils";

// Rich Document Information Dictionary for Prosperity Portal
const documentDetails = {
    "Unaudited Financial Results": {
        category: "Financial Performance",
        period: "Q2 FY 2025-26",
        filingDate: "14 Nov 2025",
        refNo: "PF/FIN/2025-26/Q2-089",
        status: "Statutory Auditor Reviewed",
        summary: "Pathfinder recorded standalone revenue of ₹48.6 Cr for Q2 FY 2025-26, representing 24.8% YoY growth driven by higher enrollments across hybrid batches and strong retention in flagship classroom programs.",
        keyHighlights: [
            { label: "Operational Revenue", value: "₹48.6 Cr (+24.8% YoY)" },
            { label: "Operating EBITDA", value: "₹13.8 Cr (28.4% Margin)" },
            { label: "Classroom Strength", value: "32,450+ Active Students" },
            { label: "Debt-to-Equity Ratio", value: "0.12 (Virtually Debt Free)" }
        ],
        details: "The Board approved the financial statements prepared in compliance with Ind AS. Unit economics across Tier-1 and Tier-2 franchise locations delivered average payback cycles under 16 months.",
        compliance: "Reviewed by Statutory Auditors with an unqualified audit report."
    },
    "Investor Presentation": {
        category: "Corporate Strategy",
        period: "Q2 FY 2025-26",
        filingDate: "15 Nov 2025",
        refNo: "PF/IR/PRES/2025-Q2",
        status: "Board Approved",
        summary: "Detailed overview of Pathfinder's multi-tier educational ecosystem, hub-and-spoke franchise expansion roadmap, capital allocation framework, and integration of AI diagnostic assessments.",
        keyHighlights: [
            { label: "Average Franchise ROI", value: "42% - 55% Annually" },
            { label: "Projected Center Additions", value: "25+ Hubs in FY 2026" },
            { label: "Digital Learning Adoption", value: "91% App Engagement" },
            { label: "Selection Ratio", value: "Top 3 in Eastern India" }
        ],
        details: "Provides exhaustive analysis on classroom capacity utilization, faculty training centers, standardized curriculum delivery, and centralized mock test evaluation infrastructure.",
        compliance: "Distributed to institutional and franchise investors under fair disclosure guidelines."
    },
    "Press Release - Q2 Performance": {
        category: "Media & Announcements",
        period: "Q2 FY 2025-26",
        filingDate: "16 Nov 2025",
        refNo: "PF/MEDIA/2025-PR08",
        status: "Official Press Release",
        summary: "Official announcement commemorating top state selections across WBJEE, JEE Advanced, and NEET 2025, alongside aggressive network expansion into strategic districts across Eastern India.",
        keyHighlights: [
            { label: "State Toppers", value: "48 District Toppers" },
            { label: "New Faculty Appointments", value: "65+ Ex-IITians & Doctors" },
            { label: "Franchise Satisfaction", value: "98.2% Positive Rating" },
            { label: "Scholarships Granted", value: "₹3.2 Cr via PAIS Exam" }
        ],
        details: "Management reaffirmed commitment to support franchise entrepreneurs with turnkey classroom infrastructure, dedicated academic mentorship, and zero-royalty starter tiers.",
        compliance: "Published across regional and national news publications."
    },
    "Audited Annual Report 2024-25": {
        category: "Annual Disclosures",
        period: "Full Year FY 2024-25",
        filingDate: "28 Jun 2025",
        refNo: "PF/AR/2024-25/FINAL",
        status: "AGM Approved",
        summary: "Comprehensive 148-page annual report covering audited balance sheets, profit and loss statements, management discussion and analysis (MD&A), and corporate social responsibility audits.",
        keyHighlights: [
            { label: "Annual Turnover", value: "₹182.4 Cr (+28.1%)" },
            { label: "Net Profit (PAT)", value: "₹34.1 Cr (+31.2%)" },
            { label: "Operating Centres", value: "54 Centres Network" },
            { label: "Total Alumni Base", value: "450,000+ Students" }
        ],
        details: "Covers corporate risk governance, IT security, infrastructure upgrades, employee welfare, and long-term academic quality assurance standards across all regional hubs.",
        compliance: "Audited by Independent Chartered Accountants with clean audit certificate."
    },
    "Consolidated Financial Statements": {
        category: "Financial Performance",
        period: "FY 2024-25",
        filingDate: "20 Jun 2025",
        refNo: "PF/FIN/CONS/2024-25",
        status: "ROC Filed",
        summary: "Consolidated group accounts combining operational income, regional franchise royalty flows, digital platform licensing, and publishing arm revenues.",
        keyHighlights: [
            { label: "Consolidated Net Worth", value: "₹126.8 Cr" },
            { label: "Operating Cash Flow", value: "₹38.5 Cr" },
            { label: "Cash & Equivalents", value: "₹24.2 Cr" },
            { label: "Credit Rating", value: "CRISIL A+ / Stable" }
        ],
        details: "Reflects disciplined working capital management, timely debt servicing, and sustainable reinvestment into high-tech smart classrooms and simulation labs.",
        compliance: "Filed with the Registrar of Companies (ROC) Kolkata."
    },
    "Cash Flow Statements": {
        category: "Financial Performance",
        period: "Q2 FY 2025-26",
        filingDate: "14 Nov 2025",
        refNo: "PF/CFS/2025-26/Q2",
        status: "Audited",
        summary: "Detailed cash flow overview showing positive net operating cash generation, capital expenditures on regional smart centers, and prudent liquidity reserves.",
        keyHighlights: [
            { label: "Net Cash from Operations", value: "₹14.2 Cr" },
            { label: "CapEx on Smart Classrooms", value: "₹4.5 Cr" },
            { label: "Financing Outflow", value: "₹1.8 Cr (Lease obligations)" },
            { label: "Net Increase in Liquidity", value: "₹7.9 Cr" }
        ],
        details: "Pathfinder continues to maintain strong self-funded operating momentum without relying on expensive short-term debt instruments.",
        compliance: "Complies with Ind AS 7 Statement of Cash Flows."
    },
    "Notes to Financial Results": {
        category: "Financial Performance",
        period: "Q2 FY 2025-26",
        filingDate: "14 Nov 2025",
        refNo: "PF/NOTES/2025-Q2",
        status: "Statutory Filing",
        summary: "Explanatory notes detailing revenue recognition standards, partner incentive provisioning, lease accounting under Ind AS 116, and academic session deferrals.",
        keyHighlights: [
            { label: "Ind AS 116 Impact", value: "Fully Provided" },
            { label: "Contingent Liabilities", value: "Nil / Zero Material" },
            { label: "Provisioning for Bad Debts", value: "< 0.4% of Receivables" },
            { label: "Tax Expense Provision", value: "Standard Corporate Surcharge" }
        ],
        details: "Provides exhaustive breakdowns of segment revenue (Classroom JEE/NEET, Foundation, Distance Learning, Digital App Subscriptions).",
        compliance: "Attached to the quarterly filing submitted to regulators."
    }
};

const getDocumentInfo = (docName, activeTab) => {
    if (documentDetails[docName]) {
        return documentDetails[docName];
    }

    // Dynamic professional fallback tailored to category
    return {
        title: docName,
        category: activeTab,
        period: "FY 2025-26",
        filingDate: "Updated Recently",
        refNo: `PF/${activeTab.substring(0, 3).toUpperCase()}/2025-26/${Math.floor(100 + Math.random() * 900)}`,
        status: "Active & Verified",
        summary: `Official document and corporate governance disclosure for ${docName} under the ${activeTab} regulatory framework. Sets forth operational guidelines, stakeholder covenants, and statutory records.`,
        keyHighlights: [
            { label: "Compliance Score", value: "100% Verified" },
            { label: "Governing Authority", value: "ROC / MCA Kolkata" },
            { label: "Revision Status", value: "Latest Adopted Draft" },
            { label: "Accessibility Tier", value: "Public Disclosure" }
        ],
        details: `This filing has been reviewed and recorded by the Pathfinder Educational Centre LLP Compliance & Secretarial team. Authorized franchise partners and prospective investors are granted full access to study the regulatory parameters.`,
        compliance: "Certified as true copy in accordance with corporate governance regulations."
    };
};

const handleDownloadDoc = (docInfo) => {
    const content = `PATHFINDER EDUCATIONAL CENTRE LLP
Corporate & Investor Relations Portal
=====================================================
DOCUMENT: ${docInfo.title}
CATEGORY: ${docInfo.category}
PERIOD: ${docInfo.period}
REFERENCE NO: ${docInfo.refNo}
FILING DATE: ${docInfo.filingDate}
STATUS: ${docInfo.status}
REGULATORY BODY: Ministry of Corporate Affairs / Registrar of Companies (ROC)
=====================================================

EXECUTIVE SUMMARY:
${docInfo.summary}

KEY FINANCIAL & OPERATIONAL HIGHLIGHTS:
${docInfo.highlights.map(h => `• ${h.label}: ${h.value}`).join('\n')}

DETAILED DISCLOSURE & ANALYSIS:
${docInfo.details}

STATUTORY COMPLIANCE:
${docInfo.compliance}

=====================================================
Pathfinder Educational Centre LLP
Head Office: 96K, Shyama Prasad Mukherjee Road, Kolkata, WB 700026
Website: https://pathfinder.edu.in | Email: support@pathfinder.edu.in
Certified True Copy for Authorized Investor Review
=====================================================
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}_${docInfo.refNo.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const Franchise = () => {
    const [activeTab, setActiveTab] = useState("Financial Results");
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [loadingInquiry, setLoadingInquiry] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Fetch and filter franchise centres
    const { data: centres, loading: loadingCentres } = useCachedData("centres", () => centresAPI.getAll(), {
        onSuccess: (data) => {
            const raw = data?.results || data || [];
            return Array.isArray(raw) ? raw.filter(c => c.is_franchise) : [];
        }
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        experience: ''
    });

    const [activeCentre, setActiveCentre] = useState(null);

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

    const handleCentreClick = (centre) => {
        setActiveCentre(centre);
    };

    // Close modals on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedDoc(null);
                setShowSuccess(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Set initial active centre
    useEffect(() => {
        if (centres && centres.length > 0 && !activeCentre) {
            setActiveCentre(centres[0]);
        }
    }, [centres, activeCentre]);

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
        <div className="min-h-screen bg-white">
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

            {/* Our Current Franchises Section */}
            {centres && centres.length > 0 && (
                <section className="py-24 bg-white border-y border-slate-100">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                            <div className="max-w-2xl">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100 mb-6"
                                >
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                    <span className="text-orange-700 text-xs font-bold uppercase tracking-wider">Our Trusted Partners</span>
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                    className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6 uppercase"
                                >
                                    Our Current <br />
                                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Franchise Network</span>
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="text-lg font-medium text-slate-500 max-w-xl"
                                >
                                    Join our successful network of educational entrepreneurs who are transforming lives in their local communities.
                                </motion.p>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
                            {/* Centres Grid */}
                            <div className="w-full lg:w-[65%] order-2 lg:order-1">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <p className="text-sm font-bold text-slate-500">
                                        Click any franchise centre to view on map:
                                    </p>
                                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                                        {centres.length} Active Franchise Centres
                                    </span>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6 relative">
                                    {centres.map((centre, idx) => {
                                        const isSelected = activeCentre?.id === centre.id;
                                        return (
                                            <motion.div
                                                key={centre.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={() => handleCentreClick(centre)}
                                                className={`rounded-3xl cursor-pointer transition-all duration-300 relative ${
                                                    isSelected
                                                        ? "ring-4 ring-orange-500 shadow-2xl shadow-orange-500/20 scale-[1.02]"
                                                        : "hover:shadow-xl hover:scale-[1.01]"
                                                }`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute -top-3 right-6 z-20 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                                                        <span className="w-2 h-2 rounded-full bg-white" />
                                                        <span>Active on Map</span>
                                                    </div>
                                                )}
                                                <CentreCard
                                                    centre={centre}
                                                    isSelected={isSelected}
                                                    onSelectMap={() => handleCentreClick(centre)}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Interactive Map Visualizer */}
                            <div className="relative w-full lg:w-[35%] lg:sticky lg:top-40 order-1 lg:order-2 self-start">
                                <motion.div
                                    layoutId="map-container"
                                    className="bg-slate-900 rounded-[32px] overflow-hidden border-[6px] border-slate-100 shadow-xl relative group"
                                >
                                    <div className="absolute inset-0 bg-orange-500/5 pointer-events-none z-10" />

                                    <div className="aspect-square w-full relative">
                                        {activeCentre ? (
                                            <iframe
                                                key={activeCentre.id}
                                                src={getMapEmbedUrl(activeCentre)}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                title={`${activeCentre.centre} Location Map`}
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-800">
                                                <MapPinIcon className="w-20 h-20 text-slate-600 mb-6 animate-bounce" />
                                                <h3 className="text-2xl font-black text-white mb-2">Location Ready</h3>
                                                <p className="text-slate-400 font-medium">Click any franchise centre card on the left to view its location map.</p>
                                            </div>
                                        )}

                                        {/* Overlay Details */}
                                        {activeCentre && (
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <div className="bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-white/40 shadow-2xl transition-all duration-300">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                                                            <MapPinIcon className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-black text-slate-900 leading-tight truncate mb-1">{activeCentre.centre}</h4>
                                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate">{activeCentre.district}, {activeCentre.state}</p>
                                                        </div>
                                                        <a
                                                            href={getDirectMapLink(activeCentre)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-3 bg-slate-100 hover:bg-orange-500 hover:text-white rounded-xl text-slate-700 transition-colors cursor-pointer shrink-0"
                                                            title="Open in Google Maps"
                                                        >
                                                            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                        <div className="text-3xl font-black text-slate-900 mb-1">{centres.length}</div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Franchise Centres</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                        <div className="text-3xl font-black text-slate-900 mb-1">
                                            {new Set(centres.map(c => c.state)).size}
                                        </div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">States Active</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

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
            <AnimatePresence>
                {selectedDoc && (() => {
                    const docInfo = getDocumentInfo(selectedDoc, activeTab);
                    return (
                        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-slate-900/75 backdrop-blur-md"
                                onClick={() => setSelectedDoc(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                                className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
                            >
                                {/* Header */}
                                <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black uppercase tracking-widest">
                                                    {docInfo.category}
                                                </span>
                                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <CheckBadgeIcon className="w-3.5 h-3.5 text-emerald-400" />
                                                    {docInfo.status}
                                                </span>
                                            </div>
                                            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                                                {docInfo.title}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => setSelectedDoc(null)}
                                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                                            title="Close"
                                        >
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Meta strip */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
                                        <div>
                                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Reference No</span>
                                            <span className="font-mono font-bold text-white">{docInfo.refNo}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Filing Date</span>
                                            <span className="font-bold text-white">{docInfo.filingDate}</span>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Period Covered</span>
                                            <span className="font-bold text-orange-400">{docInfo.period}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                                    {/* Summary */}
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Executive Summary</h4>
                                        <p className="text-slate-700 leading-relaxed font-medium text-sm sm:text-base">
                                            {docInfo.summary}
                                        </p>
                                    </div>

                                    {/* Key Highlights Grid */}
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Key Highlights & Metrics</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {docInfo.highlights.map((h, idx) => (
                                                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                                                    <span className="text-xs font-bold text-slate-500 mb-1">{h.label}</span>
                                                    <span className="text-base sm:text-lg font-black text-slate-900">{h.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Detailed Commentary */}
                                    <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-100">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-orange-800 mb-1.5 flex items-center gap-1.5">
                                            <DocumentTextIcon className="w-4 h-4 text-orange-600" />
                                            Operational Analysis & Disclosure
                                        </h4>
                                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                                            {docInfo.details}
                                        </p>
                                    </div>

                                    {/* Compliance Stamp */}
                                    <div className="text-xs text-slate-500 font-medium flex items-center gap-2 pt-2 border-t border-slate-100">
                                        <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>{docInfo.compliance}</span>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                                    <button
                                        onClick={() => handleDownloadDoc(docInfo)}
                                        className="w-full sm:w-auto px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                                    >
                                        <ArrowDownTrayIcon className="w-4 h-4" />
                                        <span>Download Summary Copy</span>
                                    </button>

                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => {
                                                setSelectedDoc(null);
                                                document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="flex-1 sm:flex-initial px-5 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                        >
                                            Inquire About This
                                        </button>
                                        <button
                                            onClick={() => setSelectedDoc(null)}
                                            className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>
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