import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeftIcon,
    ShoppingBagIcon,
    CubeIcon,
    TruckIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowRightIcon,
    PrinterIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { studentCornerAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';

const StudentCornerOrders = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isStudentAuthenticated } = useAuth();

    const [orders, setOrders] = useState([]);
    const [itemImages, setItemImages] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(location.state?.success);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        if (user || isStudentAuthenticated) {
            fetchData();
        }
    }, [user, isStudentAuthenticated]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, itemsRes] = await Promise.all([
                studentCornerAPI.getMyOrders(),
                studentCornerAPI.getAllItems()
            ]);

            setOrders(ordersRes.data || []);

            const items = itemsRes.data?.results || itemsRes.data || [];
            const mapping = {};
            if (Array.isArray(items)) {
                items.forEach(item => {
                    const id = item.id || item._id || item.unique_id;
                    if (id && item.image_url) {
                        mapping[id] = item.image_url;
                    }
                });
            }
            setItemImages(mapping);
        } catch (error) {
            console.error("Error fetching student corner orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const handleCopyId = (id) => {
        if (!id) return;
        navigator.clipboard.writeText(String(id));
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getStatusStepIndex = (status) => {
        const s = status?.toLowerCase() || '';
        if (s === 'delivered') return 3;
        if (s === 'shipped') return 2;
        if (s === 'processing' || s === 'confirmed') return 1;
        return 0;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    // If student is not logged in: show modern auth prompt
    if (!user && !isStudentAuthenticated) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
                <div className="2xl:max-w-4xl mx-auto px-4 sm:px-6 pt-10 md:pt-16">
                    <button
                        onClick={() => navigate('/students-corner')}
                        className="flex items-center gap-2 text-slate-500 hover:text-[#FF7D54] font-bold text-xs uppercase tracking-wider transition-colors mb-8"
                    >
                        <ChevronLeftIcon className="h-4 w-4" /> Back to Students Corner
                    </button>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 text-center shadow-xl shadow-slate-100 max-w-xl mx-auto"
                    >
                        <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#FF7D54] shadow-md shadow-orange-500/10">
                            <CubeIcon className="w-10 h-10" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight italic uppercase mb-3">
                            Track Your Orders
                        </h2>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">
                            Please sign in with your student account to check live tracking status, download receipts, and view order history.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => setIsLoginModalOpen(true)}
                                className="bg-gradient-to-r from-[#FF7D54] to-[#FF6B3D] hover:from-[#FF6B3D] hover:to-[#FF5E5E] text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-orange-500/30 transition-all text-xs active:scale-95"
                            >
                                Sign In to View Orders
                            </button>
                            <button
                                onClick={() => navigate('/students-corner')}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl font-bold uppercase tracking-wider transition-all text-xs"
                            >
                                Browse Books
                            </button>
                        </div>
                    </motion.div>
                </div>

                <LoginModal
                    isOpen={isLoginModalOpen}
                    onClose={() => setIsLoginModalOpen(false)}
                    onSuccess={() => {
                        setIsLoginModalOpen(false);
                        fetchData();
                    }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
            <div className="2xl:max-w-6xl mx-auto px-4 sm:px-6 pt-8 md:pt-12 lg:px-8">
                {/* Back Nav */}
                <div className="flex items-center justify-between gap-4 mb-8">
                    <button
                        onClick={() => navigate(location.state?.from === '/dashboard' ? '/dashboard' : '/students-corner')}
                        className="flex items-center gap-2 text-slate-500 hover:text-[#FF7D54] font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                        {location.state?.from === '/dashboard' ? 'Back to Dashboard' : 'Back to Students Corner'}
                    </button>

                    <button
                        onClick={fetchData}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#FF7D54] transition-colors"
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight italic">
                        My Orders
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mt-1">
                        Track your academic study materials, books & merchandise
                    </p>
                </div>

                {/* Success Banner */}
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-emerald-50 border border-emerald-200 p-4 sm:p-5 rounded-2xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0">
                                <CheckCircleIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-emerald-900 font-black uppercase text-xs tracking-wider">
                                    Order Placed Successfully!
                                </h3>
                                <p className="text-emerald-700 text-xs font-semibold">
                                    Your order is confirmed and is being processed for dispatch.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSuccessMessage(false)}
                            className="text-emerald-600 hover:text-emerald-800 font-bold text-xs uppercase"
                        >
                            Dismiss
                        </button>
                    </motion.div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-12 h-12 border-4 border-[#FF7D54] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">
                            Loading your orders...
                        </p>
                    </div>
                ) : orders.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        {orders.map((order) => {
                            const orderId = order.payment_id || order.id?.substring(0, 8) || 'ORD';
                            const currentStep = getStatusStepIndex(order.status);

                            return (
                                <motion.div
                                    key={order.id || order._id}
                                    variants={itemVariants}
                                    className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100 overflow-hidden hover:border-orange-300 transition-all duration-300"
                                >
                                    {/* Order Header */}
                                    <div className="bg-slate-50/70 px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex flex-wrap items-center gap-6 text-xs">
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                                    Order Placed
                                                </span>
                                                <span className="font-bold text-slate-800">
                                                    {formatDate(order.created_at)}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                                    Order ID
                                                </span>
                                                <button
                                                    onClick={() => handleCopyId(orderId)}
                                                    className="font-mono font-bold text-slate-700 hover:text-[#FF7D54] flex items-center gap-1 group"
                                                    title="Click to copy Order ID"
                                                >
                                                    <span>#{orderId}</span>
                                                    <span className="text-[9px] text-[#FF7D54] opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {copiedId === orderId ? 'Copied!' : 'Copy'}
                                                    </span>
                                                </button>
                                            </div>

                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                                    Total Amount
                                                </span>
                                                <span className="font-black text-[#FF7D54] text-sm">
                                                    ₹{order.total_amount?.toLocaleString('en-IN') || order.total_amount}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-slate-200/80">
                                            {order.status?.toLowerCase() === 'delivered' ? (
                                                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                                            ) : order.status?.toLowerCase() === 'shipped' ? (
                                                <TruckIcon className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <ClockIcon className="w-4 h-4 text-orange-500" />
                                            )}
                                            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                                                {order.status || 'Processing'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Visual Delivery Stepper */}
                                    <div className="px-6 py-6 sm:px-8 border-b border-slate-100 bg-white">
                                        <div className="max-w-2xl mx-auto">
                                            <div className="grid grid-cols-4 relative">
                                                {/* Connecting Bar */}
                                                <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-slate-200 z-0">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-500"
                                                        style={{ width: `${(currentStep / 3) * 100}%` }}
                                                    />
                                                </div>

                                                {[
                                                    { label: 'Placed', icon: CheckCircleIcon },
                                                    { label: 'Confirmed', icon: ShieldCheckIcon },
                                                    { label: 'Shipped', icon: TruckIcon },
                                                    { label: 'Delivered', icon: CheckCircleIcon }
                                                ].map((step, idx) => {
                                                    const isDone = currentStep >= idx;
                                                    const isCurrent = currentStep === idx;
                                                    const Icon = step.icon;

                                                    return (
                                                        <div key={step.label} className="flex flex-col items-center relative z-10 text-center">
                                                            <div
                                                                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                                                                    isDone
                                                                        ? 'bg-[#FF7D54] border-[#FF7D54] text-white shadow-md shadow-orange-500/20'
                                                                        : 'bg-white border-slate-300 text-slate-400'
                                                                }`}
                                                            >
                                                                <Icon className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className={`text-[10px] font-black uppercase mt-1.5 ${
                                                                isCurrent ? 'text-[#FF7D54]' : isDone ? 'text-slate-800' : 'text-slate-400'
                                                            }`}>
                                                                {step.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Content: Items & Address */}
                                    <div className="p-6 sm:p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            {/* Items List */}
                                            <div className="lg:col-span-7 space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                    Ordered Items ({order.items?.length || 0})
                                                </h4>

                                                {order.items?.map((item, idx) => {
                                                    const img = item.image || item.image_url || item.img || itemImages[item.id] || itemImages[item.unique_id];

                                                    return (
                                                        <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                                                            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100 p-1">
                                                                {img ? (
                                                                    <img
                                                                        src={img}
                                                                        alt={item.name}
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                ) : (
                                                                    <ShoppingBagIcon className="h-6 w-6 text-slate-300" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                                                                    {item.name}
                                                                </h5>
                                                                <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                                                                    ₹{item.price} × {item.quantity || 1}
                                                                </p>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <span className="text-xs sm:text-sm font-black text-slate-900">
                                                                    ₹{((parseFloat(item.price) || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Delivery Details */}
                                            <div className="lg:col-span-5 bg-slate-50/70 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
                                                        Delivery Details
                                                    </h4>
                                                    <div className="space-y-1.5 text-xs">
                                                        <p className="font-bold text-slate-900">{order.full_name || user?.fullName}</p>
                                                        {order.delivery_address && (
                                                            <p className="text-slate-600 font-medium leading-relaxed">
                                                                {order.delivery_address.area}
                                                                {order.delivery_address.school && `, ${order.delivery_address.school}`}
                                                            </p>
                                                        )}
                                                        <p className="text-slate-500 font-semibold">
                                                            Phone: {order.phone || user?.phone || 'On file'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                                                        <ShieldCheckIcon className="w-4 h-4" />
                                                        <span>ICICI 3D Verified</span>
                                                    </div>

                                                    <button
                                                        onClick={() => window.print()}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 hover:text-[#FF7D54] hover:border-orange-300 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all"
                                                        title="Print invoice"
                                                    >
                                                        <PrinterIcon className="w-3.5 h-3.5" />
                                                        <span>Receipt</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80 text-center px-6 shadow-sm"
                    >
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <CubeIcon className="h-10 w-10 text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-2 tracking-tight">
                            No Orders Found
                        </h2>
                        <p className="text-slate-400 font-medium text-sm max-w-sm mb-8">
                            You haven't placed any orders from Student's Corner yet. Explore our study materials, books, and merchandise!
                        </p>
                        <button
                            onClick={() => navigate('/students-corner')}
                            className="bg-gradient-to-r from-[#FF7D54] to-[#FF6B3D] hover:from-[#FF6B3D] hover:to-[#FF5E5E] text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 active:scale-95 text-xs"
                        >
                            Explore Student's Corner <ArrowRightIcon className="h-4 w-4" />
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default StudentCornerOrders;
