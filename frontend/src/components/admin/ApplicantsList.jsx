import React, { useState, useEffect, useRef, useCallback } from 'react';
import { applicationsAPI } from '../../services/api';
import { useAdminCache, clearAdminCache } from '../../hooks/useAdminCache';
import axios from 'axios';
import {
    HandThumbUpIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    UserGroupIcon,
    ClipboardDocumentCheckIcon,
    ClockIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TrashIcon,
    EyeIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const ApplicantsList = () => {
    // --- Caching Hook Implementation ---
    const fetchAllApplicantsData = useCallback(async () => {
        const response = await applicationsAPI.getAll();
        return response.data || [];
    }, []);

    const {
        data: allApplicants,
        loading,
        error: cacheError,
        refresh: refetchApplicants,
        updateCache: setApplicantsCache
    } = useAdminCache("admin_applicants", fetchAllApplicantsData);

    const [applicants, setApplicants] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (cacheError) setError(cacheError);
    }, [cacheError]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageInput, setPageInput] = useState(1);

    // Sync pageInput with currentPage
    useEffect(() => {
        setPageInput(currentPage);
    }, [currentPage]);


    // Filter states
    const [classFilter, setClassFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [centreFilter, setCentreFilter] = useState('all');
    const [availableCentres, setAvailableCentres] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [dateSort, setDateSort] = useState('newest');

    // Modal states
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Drag scrolling states
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [showScrollHint, setShowScrollHint] = useState(true);
    const tableContainerRef = useRef(null);
    const tableRef = useRef(null);

    // Full width state
    const [isFullWidth, setIsFullWidth] = useState(false);

    // Removed manual fetch call on mount as hook handles it

    useEffect(() => {
        applyFiltersAndPagination();
    }, [currentPage, classFilter, courseFilter, centreFilter, searchQuery, dateSort, allApplicants]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowScrollHint(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    // Handle mouse down for drag scrolling
    const handleMouseDown = (e) => {
        if (!tableContainerRef.current) return;

        // Ignore if clicking on interactive elements
        if (['INPUT', 'BUTTON', 'A', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

        setIsDragging(true);
        setStartX(e.pageX - tableContainerRef.current.offsetLeft);
        setScrollLeft(tableContainerRef.current.scrollLeft);

        e.preventDefault();
    };

    // Handle mouse move for drag scrolling
    const handleMouseMove = (e) => {
        if (!isDragging || !tableContainerRef.current) return;

        e.preventDefault();
        const x = e.pageX - tableContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        tableContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    // Handle mouse up/leave to stop dragging
    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    // Handle wheel event for horizontal scrolling
    const handleWheel = (e) => {
        if (!tableContainerRef.current) return;

        if (e.shiftKey || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault();
            tableContainerRef.current.scrollLeft += e.deltaY + e.deltaX;
        }
    };

    // Scroll to start/end buttons
    const scrollToStart = () => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        }
    };

    const scrollToEnd = () => {
        if (tableContainerRef.current && tableRef.current) {
            const scrollWidth = tableRef.current.scrollWidth;
            tableContainerRef.current.scrollTo({
                left: scrollWidth,
                behavior: 'smooth'
            });
        }
    };

    // Toggle full width view
    const toggleFullWidth = () => {
        setIsFullWidth(!isFullWidth);
    };

    // Use effect to update available filters when data change (from cache or net)
    useEffect(() => {
        if (allApplicants && allApplicants.length > 0) {
            const centresSet = new Set();
            const classesSet = new Set();

            allApplicants.forEach(app => {
                const location = app.course?.location;
                if (location) {
                    const centres = location.split(',').map(c => c.trim());
                    centres.forEach(centre => {
                        if (centre) centresSet.add(centre);
                    });
                }
                if (app.student_class) {
                    classesSet.add(app.student_class);
                }
            });

            setAvailableCentres(Array.from(centresSet).sort());

            const uniqueClasses = Array.from(classesSet).sort((a, b) => {
                const numA = parseInt(a);
                const numB = parseInt(b);
                if (!isNaN(numA) && !isNaN(numB)) {
                    return numA - numB;
                }
                return a.localeCompare(b);
            });
            setAvailableClasses(uniqueClasses);
        }
    }, [allApplicants]);

    const fetchAllApplicants = refetchApplicants;

    const applyFiltersAndPagination = () => {
        let filteredData = [...allApplicants];

        if (classFilter !== 'all') {
            filteredData = filteredData.filter(app => app.student_class === classFilter);
        }

        if (courseFilter !== 'all') {
            filteredData = filteredData.filter(app =>
                app.course?.name?.toLowerCase().includes(courseFilter.toLowerCase())
            );
        }

        if (centreFilter !== 'all') {
            filteredData = filteredData.filter(app => {
                const location = app.course?.location;
                if (!location) return false;
                const centres = location.split(',').map(c => c.trim().toLowerCase());
                return centres.includes(centreFilter.toLowerCase());
            });
        }

        if (searchQuery) {
            filteredData = filteredData.filter(app =>
                app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.phone?.includes(searchQuery) ||
                app.email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sorting
        if (dateSort !== 'none') {
            filteredData.sort((a, b) => {
                const dateA = new Date(a.submitted_at || 0);
                const dateB = new Date(b.submitted_at || 0);
                return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
            });
        }

        setTotalItems(filteredData.length);
        const total = Math.ceil(filteredData.length / itemsPerPage);
        setTotalPages(total);

        if (currentPage > total && total > 0) {
            setCurrentPage(total);
            return;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
        setApplicants(paginatedData);
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.patch(
                `${import.meta.env.VITE_API_BASE_URL}/api/applications/${id}/`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAllApplicants(prev =>
                prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
            );
            clearAdminCache("admin_applicants");
            fetchAllApplicants();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const deleteApplicant = async (id) => {
        if (!window.confirm('Are you sure you want to delete this applicant?')) {
            return;
        }

        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/applications/${id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAllApplicants(prev => prev.filter(app => app.id !== id));
            clearAdminCache("admin_applicants");
            fetchAllApplicants();
        } catch (err) {
            console.error('Error deleting applicant:', err);
            alert('Failed to delete applicant');
        }
    };

    const exportToCSV = async () => {
        try {
            let dataToExport = [...allApplicants];

            // Apply current filters
            if (classFilter !== 'all') {
                dataToExport = dataToExport.filter(app => app.student_class === classFilter);
            }
            if (courseFilter !== 'all') {
                dataToExport = dataToExport.filter(app =>
                    app.course?.name?.toLowerCase().includes(courseFilter.toLowerCase())
                );
            }
            if (centreFilter !== 'all') {
                dataToExport = dataToExport.filter(app => {
                    const location = app.course?.location;
                    if (!location) return false;
                    const centres = location.split(',').map(c => c.trim().toLowerCase());
                    return centres.includes(centreFilter.toLowerCase());
                });
            }
            if (searchQuery) {
                dataToExport = dataToExport.filter(app =>
                    app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    app.phone?.includes(searchQuery) ||
                    app.email?.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Create CSV content
            const headers = ['Name', 'Phone', 'Email', 'Class', 'Board', 'School', 'Area', 'Course', 'Centre', 'Mode', 'Status', 'Submitted At'];
            const csvContent = [
                headers.join(','),
                ...dataToExport.map(app => [
                    `"${app.full_name || ''}"`,
                    `"${app.phone || ''}"`,
                    `"${app.email || ''}"`,
                    `"${app.student_class || ''}"`,
                    `"${app.board || ''}"`,
                    `"${app.school_name || ''}"`,
                    `"${app.area || ''}"`,
                    `"${app.course?.name || ''}"`,
                    `"${app.course?.location || ''}"`,
                    `"${app.course?.mode || ''}"`,
                    `"${app.status || ''}"`,
                    `"${app.submitted_at ? new Date(app.submitted_at).toLocaleString() : ''}"`
                ].join(','))
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `applicants_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Error exporting CSV:', err);
            alert('Failed to export CSV');
        }
    };



    const viewDetails = (applicant) => {
        setSelectedApplicant(applicant);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            contacted: 'bg-blue-100 text-blue-800',
            enrolled: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-0">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Admission Pipeline</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Monitor and manage student enrollment applications</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            clearAdminCache("admin_applicants");
                            fetchAllApplicants();
                        }}
                        className="p-2 text-gray-500 hover:text-orange-600 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl transition-all shadow-sm"
                        title="Refresh Data"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={toggleFullWidth}
                        className={`p-2 rounded-xl transition-all border ${isFullWidth ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/20 dark:border-orange-800' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 dark:text-gray-400'}`}
                        title={isFullWidth ? "Standard View" : "Wide View"}
                    >
                        {isFullWidth ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Export Pipeline
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Pipeline</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{totalItems}</h3>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Accumulated applications</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Enrolled</p>
                        <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-500">
                            {allApplicants.filter(a => a.status === 'enrolled').length}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Conversion success</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 dark:bg-orange-900/10 rounded-full group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Pending Review</p>
                        <h3 className="text-3xl font-black text-orange-600 dark:text-orange-500">
                            {allApplicants.filter(a => a.status === 'pending' || !a.status).length}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Awaiting action</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 dark:bg-purple-900/10 rounded-full group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                        <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Contacted</p>
                        <h3 className="text-3xl font-black text-purple-600 dark:text-purple-500">
                            {allApplicants.filter(a => a.status === 'contacted').length}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Active engagements</p>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 mb-8">
                <div className="flex items-center gap-2 mb-6">
                    <FunnelIcon className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pipeline Optimization</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Search Field */}
                    <div className="md:col-span-4">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                            Global Discovery
                        </label>
                        <div className="relative group">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Name, Phone, or Email ID"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Centre Discovery */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                            Centre
                        </label>
                        <select
                            value={centreFilter}
                            onChange={(e) => {
                                setCentreFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all"
                        >
                            <option value="all">Everywhere</option>
                            {availableCentres.map((centre) => (
                                <option key={centre} value={centre}>{centre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Class/Level Discovery */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                            Class
                        </label>
                        <select
                            value={classFilter}
                            onChange={(e) => {
                                setClassFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all"
                        >
                            <option value="all">All Grades</option>
                            {availableClasses.map((studentClass) => (
                                <option key={studentClass} value={studentClass}>Grade {studentClass}</option>
                            ))}
                        </select>
                    </div>

                    {/* Course Segment Discovery */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                            Segment
                        </label>
                        <select
                            value={courseFilter}
                            onChange={(e) => {
                                setCourseFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all"
                        >
                            <option value="all">All Channels</option>
                            <option value="foundation">Foundation</option>
                            <option value="all india">All India</option>
                            <option value="boards">Boards</option>
                        </select>
                    </div>

                    {/* Temporal Sort */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                            Temporal Order
                        </label>
                        <select
                            value={dateSort}
                            onChange={(e) => setDateSort(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all"
                        >
                            <option value="newest">Latest Inbound</option>
                            <option value="oldest">Historical</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Pagination Component */}
            {applicants.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                            Showing <span className="text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="text-gray-900 dark:text-white">{totalItems}</span> Inbound Assets
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-gray-50 dark:bg-slate-800 p-1 rounded-xl">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-all shadow-sm"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>

                                <div className="flex items-center px-2">
                                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                        let pageNum;
                                        if (totalPages <= 5) pageNum = index + 1;
                                        else if (currentPage <= 3) pageNum = index + 1;
                                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + index;
                                        else pageNum = currentPage - 2 + index;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-8 h-8 text-[11px] font-black rounded-lg transition-all ${currentPage === pageNum ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-all shadow-sm"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="h-8 w-px bg-gray-200 dark:bg-slate-800" />

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-tight">Portal</span>
                                <input
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    value={pageInput}
                                    onChange={(e) => setPageInput(e.target.value)}
                                    onBlur={(e) => {
                                        const p = parseInt(e.target.value);
                                        if (p >= 1 && p <= totalPages) setCurrentPage(p);
                                        else setPageInput(currentPage);
                                    }}
                                    className="w-12 h-8 bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-xs font-black text-center focus:ring-2 focus:ring-orange-600/20 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Table System */}
            <div className="relative group/table">
                <div
                    ref={tableContainerRef}
                    className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden relative ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'} custom-scrollbar-wide`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    onWheel={handleWheel}
                >
                    <table ref={tableRef} className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-left">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Index</span>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Candidate Profile</span>
                                </th>
                                <th className="px-6 py-4 text-left font-sans">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Contact Intel</span>
                                </th>
                                <th className="px-6 py-4 text-left font-sans">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Academic Target</span>
                                </th>
                                <th className="px-6 py-4 text-left font-sans">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Location</span>
                                </th>
                                <th className="px-6 py-4 text-left font-sans">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Status</span>
                                </th>
                                <th className="px-6 py-4 text-right font-sans">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-4">Management</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                            {applicants.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                                            <UserGroupIcon className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pipeline Empty</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No applications match your current logical filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                applicants.map((app, idx) => (
                                    <tr key={app.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-gray-400 dark:text-slate-600">#{(currentPage - 1) * itemsPerPage + idx + 1}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-500 font-black text-sm uppercase">
                                                    {app.full_name?.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">{app.full_name}</div>
                                                    <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-tighter">{app.area || 'Unknown Region'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-700 dark:text-slate-300">{app.phone}</div>
                                            <div className="text-[11px] text-gray-500 dark:text-slate-500 truncate max-w-[150px]">{app.email || 'No email registered'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{app.course?.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">{app.course?.mode}</span>
                                                <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500">Class {app.student_class}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-gray-600 dark:text-slate-300 line-clamp-1" title={app.course?.location}>
                                                {app.course?.location?.split(',')[0]}
                                                {app.course?.location?.split(',').length > 1 && <span className="text-[10px] text-gray-400 ml-1">+{app.course?.location?.split(',').length - 1}</span>}
                                            </div>
                                            <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                                                {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Pending'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(app.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => viewDetails(app)}
                                                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all"
                                                    title="View Full Profile"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                                <div className="relative inline-block text-left">
                                                    <select
                                                        value={app.status || 'pending'}
                                                        onChange={(e) => updateStatus(app.id, e.target.value)}
                                                        className="text-[11px] font-bold bg-gray-50 dark:bg-slate-800 border-none rounded-lg py-1 pl-2 pr-8 focus:ring-2 focus:ring-orange-600/20 dark:text-white appearance-none cursor-pointer"
                                                    >
                                                        <option value="pending">PENDING</option>
                                                        <option value="contacted">CONTACTED</option>
                                                        <option value="enrolled">ENROLLED</option>
                                                        <option value="rejected">REJECTED</option>
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => deleteApplicant(app.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                    title="Archive Student"
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
            {/* Horizontal Scroll Indicator */}
            <div className="h-2 bg-gray-100 overflow-hidden">
                <div className="h-full bg-blue-500" style={{
                    width: '100%',
                    transform: tableContainerRef.current ? `translateX(-${(tableContainerRef.current.scrollLeft / (tableContainerRef.current.scrollWidth - tableContainerRef.current.clientWidth)) * 100}%)` : 'translateX(0)'
                }}></div>


            </div>

            {/* Pagination */}
            {applicants.length > 0 && (
                <div className="bg-white px-6 py-4 mt-4 border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                            <span className="font-medium">{totalItems}</span> results
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Jump to page input */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">Jump to:</span>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        min="1"
                                        max={totalPages}
                                        value={pageInput}
                                        onChange={(e) => setPageInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const page = parseInt(e.target.value);
                                                if (page >= 1 && page <= totalPages) {
                                                    setCurrentPage(page);
                                                } else {
                                                    setPageInput(currentPage);
                                                }
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const page = parseInt(e.target.value);
                                            if (page >= 1 && page <= totalPages) {
                                                setCurrentPage(page);
                                            } else {
                                                setPageInput(currentPage);
                                            }
                                        }}
                                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        aria-label="Page number"
                                    />
                                    <span className="px-2 py-1 text-sm text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg">
                                        / {totalPages}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = index + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = index + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + index;
                                        } else {
                                            pageNum = currentPage - 2 + index;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Detail Modal */}
            {showModal && selectedApplicant && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        <div className="inline-block align-bottom bg-white dark:bg-slate-900 rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100 dark:border-slate-800">
                            <div className="relative">
                                {/* Modal Header */}
                                <div className="px-8 py-6 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Profile Intelligence</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase tracking-widest">Inbound Academic Request</p>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="px-8 py-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Personal Info */}
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Full Legal Name</label>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedApplicant.full_name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Encrypted Contact</label>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedApplicant.phone}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedApplicant.email || 'No Email Verified'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Operational Domain</label>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedApplicant.area}</p>
                                            </div>
                                        </div>

                                        {/* Academic Info */}
                                        <div className="space-y-6">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Current Grade</label>
                                                    <span className="inline-flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase">
                                                        Grade {selectedApplicant.student_class || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Affiliation</label>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedApplicant.board || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">School / Institution</label>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedApplicant.school_name || 'Not Disclosed'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Current Status</label>
                                                <div className="mt-1">{getStatusBadge(selectedApplicant.status)}</div>
                                            </div>
                                        </div>

                                        {/* Target Course Info */}
                                        <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-800/50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-500">
                                                    <ClipboardDocumentCheckIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Inbound Target Asset</label>
                                                    <h4 className="text-base font-black text-gray-900 dark:text-white">{selectedApplicant.course?.name}</h4>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-tight mb-0.5">Delivery Node</p>
                                                    <p className="text-xs font-bold text-gray-700 dark:text-slate-300">{selectedApplicant.course?.location}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-tight mb-0.5">Execution Mode</p>
                                                    <p className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase">{selectedApplicant.course?.mode}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-tight mb-0.5">Inbound Timestamp</p>
                                                    <p className="text-xs font-bold text-gray-700 dark:text-slate-300">
                                                        {selectedApplicant.submitted_at ? new Date(selectedApplicant.submitted_at).toLocaleString('en-IN') : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="px-8 py-6 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-50 dark:border-slate-800 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-sm"
                                    >
                                        Close Intelligence
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Feature to potentially trigger a callback
                                            alert('Communication protocols initiated');
                                        }}
                                        className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-md shadow-orange-500/20 text-sm"
                                    >
                                        Contact Student
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicantsList;