import React, { useState, useEffect, useCallback } from 'react';
import { franchiseAPI } from '../../services/api';
import {
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TrashIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ClockIcon,
    BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

const FranchiseInquiryList = () => {
    const [allInquiries, setAllInquiries] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateSort, setDateSort] = useState('newest');

    // Layout state
    const [isFullWidth, setIsFullWidth] = useState(false);

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        try {
            const response = await franchiseAPI.list();
            setAllInquiries(response.data || []);
            setError('');
        } catch (err) {
            console.error('Error fetching inquiries:', err);
            setError('Failed to fetch inquiries. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    useEffect(() => {
        applyFiltersAndPagination();
    }, [currentPage, statusFilter, searchQuery, dateSort, allInquiries]);

    const applyFiltersAndPagination = () => {
        let filteredData = [...allInquiries];

        if (statusFilter !== 'all') {
            const isContactedStr = statusFilter === 'contacted';
            filteredData = filteredData.filter(item => item.is_contacted === isContactedStr);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredData = filteredData.filter(item =>
                item.name?.toLowerCase().includes(query) ||
                item.phone?.includes(query) ||
                item.email?.toLowerCase().includes(query) ||
                item.city?.toLowerCase().includes(query)
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
        setInquiries(paginatedData);
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await franchiseAPI.updateStatus(id, !currentStatus);
            setAllInquiries(prev => prev.map(item =>
                item.id === id ? { ...item, is_contacted: !currentStatus } : item
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status.');
        }
    };

    const deleteInquiry = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this inquiry?')) {
            return;
        }

        try {
            await franchiseAPI.delete(id);
            setAllInquiries(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error('Error deleting inquiry:', err);
            alert('Failed to delete inquiry.');
        }
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Phone', 'Email', 'City', 'Experience', 'Contacted', 'Date'];
        const csvContent = [
            headers.join(','),
            ...allInquiries.map(item => [
                `"${item.name || ''}"`,
                `"${item.phone || ''}"`,
                `"${item.email || ''}"`,
                `"${item.city || ''}"`,
                `"${(item.experience || '').replace(/"/g, '""')}"`,
                item.is_contacted ? 'Yes' : 'No',
                `"${new Date(item.created_at).toLocaleString()}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `franchise_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <BuildingStorefrontIcon className="w-7 h-7 text-orange-600" />
                        Franchise Inquiries
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage potential franchise partners and their applications</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchInquiries}
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
                        Export Data
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Inquiries</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{totalItems}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Pending Review</p>
                    <h3 className="text-3xl font-black text-orange-500">{allInquiries.filter(l => !l.is_contacted).length}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Successfully Contacted</p>
                    <h3 className="text-3xl font-black text-emerald-600">{allInquiries.filter(l => l.is_contacted).length}</h3>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-6">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 text-slate-500">Search Inquiry</label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Name, phone, email or city..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none shadow-inner"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 text-slate-500">Processing Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none shadow-inner"
                        >
                            <option value="all">All Status</option>
                            <option value="contacted">Contacted</option>
                            <option value="pending">Pending Review</option>
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 text-slate-500">Sort Date</label>
                        <select
                            value={dateSort}
                            onChange={(e) => setDateSort(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border-none shadow-inner"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Details</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {inquiries.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No franchise inquiries found</td>
                                </tr>
                            ) : (
                                inquiries.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.name}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-medium">
                                                ID: #F-{item.id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.phone}</div>
                                            <div className="text-xs text-gray-400 truncate max-w-[150px]">{item.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.city}</div>
                                            <div className="text-[10px] text-gray-400 font-medium">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 italic max-w-xs">
                                                "{item.experience || 'No experience details provided'}"
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.is_contacted ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                                    Contacted
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-500 text-[10px] font-black uppercase tracking-wider">
                                                    <ClockIcon className="w-3.5 h-3.5" />
                                                    Awaiting
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toggleStatus(item.id, item.is_contacted)}
                                                    className={`p-1.5 rounded-lg transition-all ${item.is_contacted ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}
                                                    title={item.is_contacted ? "Mark as Pending" : "Mark as Contacted"}
                                                >
                                                    <CheckCircleIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => deleteInquiry(item.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Application"
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
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="text-xs font-black text-gray-400 uppercase">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-1 text-gray-400 hover:text-orange-600 disabled:opacity-30 transition-all font-bold"
                        >
                            Prev
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-1 text-gray-400 hover:text-orange-600 disabled:opacity-30 transition-all font-bold"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FranchiseInquiryList;
