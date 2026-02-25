import React, { useState, useEffect, useCallback } from 'react';
import { landingAPI } from '../../services/api';
import axios from 'axios';
import {
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    UserGroupIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TrashIcon,
    EyeIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const AdsLeadsList = () => {
    const [allLeads, setAllLeads] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filter states
    const [sourceFilter, setSourceFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [contactedFilter, setContactedFilter] = useState('all');
    const [dateSort, setDateSort] = useState('newest');

    // Modal states
    const [selectedLead, setSelectedLead] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isFullWidth, setIsFullWidth] = useState(false);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const response = await landingAPI.list();
            setAllLeads(response.data || []);
            setError('');
        } catch (err) {
            console.error('Error fetching leads:', err);
            setError('Failed to fetch leads. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    useEffect(() => {
        applyFiltersAndPagination();
    }, [currentPage, sourceFilter, classFilter, contactedFilter, searchQuery, dateSort, allLeads]);

    const applyFiltersAndPagination = () => {
        let filteredData = [...allLeads];

        if (sourceFilter !== 'all') {
            filteredData = filteredData.filter(lead => lead.page_source === sourceFilter);
        }

        if (classFilter !== 'all') {
            filteredData = filteredData.filter(lead => lead.student_class === classFilter);
        }

        if (contactedFilter !== 'all') {
            const isContactedStr = contactedFilter === 'contacted';
            filteredData = filteredData.filter(lead => lead.is_contacted === isContactedStr);
        }

        if (searchQuery) {
            filteredData = filteredData.filter(lead =>
                lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.phone?.includes(searchQuery) ||
                lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.centre?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sorting
        filteredData.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setTotalItems(filteredData.length);
        const total = Math.ceil(filteredData.length / itemsPerPage);
        setTotalPages(total);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
        setLeads(paginatedData);
    };

    const toggleContacted = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('admin_token');
            // Assuming we have a patch endpoint or we can add one
            // For now, let's just update local state if endpoint isn't ready
            // and I'll check if I need to add the endpoint to backend

            // Re-using axios for direct call if landingAPI doesn't have update
            await axios.patch(
                `${import.meta.env.VITE_API_BASE_URL}/api/landing/registrations/${id}/`,
                { is_contacted: !currentStatus },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setAllLeads(prev => prev.map(lead =>
                lead.id === id ? { ...lead, is_contacted: !currentStatus } : lead
            ));
        } catch (err) {
            console.error('Error updating lead status:', err);
            // Fallback for UI if patch fails but we want to show feedback
            alert('Failed to update status. Make sure the backend endpoint exists.');
        }
    };

    const deleteLead = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this lead?')) {
            return;
        }

        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/landing/registrations/${id}/`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setAllLeads(prev => prev.filter(lead => lead.id !== id));
        } catch (err) {
            console.error('Error deleting lead:', err);
            alert('Failed to delete lead.');
        }
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Phone', 'Email', 'Class', 'Board', 'Course Type', 'Centre', 'Source', 'Contacted', 'Date'];
        const csvContent = [
            headers.join(','),
            ...allLeads.map(lead => [
                `"${lead.name || ''}"`,
                `"${lead.phone || ''}"`,
                `"${lead.email || ''}"`,
                `"${lead.student_class || ''}"`,
                `"${lead.board || ''}"`,
                `"${lead.course_type || ''}"`,
                `"${lead.centre || ''}"`,
                `"${lead.page_source || ''}"`,
                lead.is_contacted ? 'Yes' : 'No',
                `"${new Date(lead.created_at).toLocaleString()}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ads_leads_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-0">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Ads Leads (Landing Pages)</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Capture and track leads from JEE & NEET landing pages</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchLeads}
                        className="p-2 text-gray-500 hover:text-orange-600 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl transition-all shadow-sm"
                        title="Refresh Data"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsFullWidth(!isFullWidth)}
                        className={`p-2 rounded-xl transition-all border ${isFullWidth ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white dark:bg-slate-900 border-gray-200 text-gray-500'}`}
                    >
                        {isFullWidth ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Export Leads
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Leads</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{totalItems}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">JEE Leads</p>
                    <h3 className="text-3xl font-black text-blue-600">{allLeads.filter(l => l.page_source === 'JEE').length}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">NEET Leads</p>
                    <h3 className="text-3xl font-black text-red-600">{allLeads.filter(l => l.page_source === 'NEET').length}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Followed Up</p>
                    <h3 className="text-3xl font-black text-emerald-600">{allLeads.filter(l => l.is_contacted).length}</h3>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 mb-8">
                <div className="flex items-center gap-2 mb-6">
                    <FunnelIcon className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-bold">Leads Filtering</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 text-slate-500">Search Profile</label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Name, phone, email or centre..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 text-slate-500">Source</label>
                        <select
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none"
                        >
                            <option value="all">All Sources</option>
                            <option value="JEE">JEE Page</option>
                            <option value="NEET">NEET Page</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 text-slate-500">Status</label>
                        <select
                            value={contactedFilter}
                            onChange={(e) => setContactedFilter(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none"
                        >
                            <option value="all">All Status</option>
                            <option value="contacted">Followed Up</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 text-slate-500">Sort By</label>
                        <select
                            value={dateSort}
                            onChange={(e) => setDateSort(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-slate-300">Name</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-slate-300">Contact</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-slate-300">Target</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-slate-300">Centre</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-slate-300">Source</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-slate-300">Status</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest text-slate-300">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">No leads found matching current filters</td>
                            </tr>
                        ) : (
                            leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50 transition-colors group dark:hover:bg-slate-800">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{lead.name}</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-medium line-clamp-1">{lead.board || 'Unknown Board'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{lead.phone}</div>
                                        <div className="text-xs text-gray-400 truncate max-w-[150px]">{lead.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{lead.course_type}</div>
                                        <div className="text-[10px] text-gray-400 font-medium">Class {lead.student_class}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{lead.centre}</div>
                                        <div className="text-[10px] text-gray-400 tracking-tighter uppercase font-medium">
                                            {new Date(lead.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} | {new Date(lead.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${lead.page_source === 'JEE' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {lead.page_source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {lead.is_contacted ? (
                                            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-tight">
                                                <CheckCircleIcon className="w-4 h-4" />
                                                Done
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-orange-500 text-xs font-bold uppercase tracking-tight">
                                                <ClockIcon className="w-4 h-4" />
                                                Awaiting
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => toggleContacted(lead.id, lead.is_contacted)}
                                                className={`p-1.5 rounded-lg transition-all ${lead.is_contacted ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                                    }`}
                                                title={lead.is_contacted ? "Mark as Pending" : "Mark as Followed Up"}
                                            >
                                                <CheckCircleIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteLead(lead.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete Lead"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="text-xs font-black text-gray-400 uppercase">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} leads
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-1 text-gray-400 hover:text-orange-600 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-1 text-gray-400 hover:text-orange-600 disabled:opacity-30 transition-all"
                        >
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdsLeadsList;
