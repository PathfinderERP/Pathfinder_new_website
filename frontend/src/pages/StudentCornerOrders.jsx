import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ShoppingBagIcon, CubeIcon, TruckIcon, CheckCircleIcon, ClockIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { studentCornerAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StudentCornerOrders = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [itemImages, setItemImages] = useState({}); // Mapping of itemId -> image
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(location.state?.success);

    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: '/students-corner/orders' } });
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch orders and items in parallel
            const [ordersRes, itemsRes] = await Promise.all([
                studentCornerAPI.getMyOrders(),
                studentCornerAPI.getAllItems()
            ]);

            setOrders(ordersRes.data || []);

            // Create a mapping of item IDs to their current images
            const items = itemsRes.data.results || itemsRes.data || [];
            const mapping = {};
            items.forEach(item => {
                const id = item.id || item._id || item.unique_id;
                if (id && item.image_url) {
                    mapping[id] = item.image_url;
                }
            });
            setItemImages(mapping);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />;
            case 'shipped': return <TruckIcon className="h-5 w-5 text-blue-500" />;
            case 'processing': return <ClockIcon className="h-5 w-5 text-orange-500" />;
            default: return <InformationCircleIcon className="h-5 w-5 text-slate-400" />;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pt-[100px] lg:pt-[160px] pb-20">
            <div className="2xl:max-w-7xl mx-auto px-6 lg:px-8">
                <button
                    onClick={() => navigate(location.state?.from === '/dashboard' ? '/dashboard' : '/students-corner')}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#FF7D54] font-bold text-sm uppercase tracking-widest transition-colors mb-8"
                >
                    <ChevronLeftIcon className="h-5 w-5" /> {location.state?.from === '/dashboard' ? 'Back to Dashboard' : 'Back to Corner'}
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">My Orders</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Track your materials & merchandise</p>
                    </div>
                </div>

                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10 bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                <CheckCircleIcon className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-emerald-900 font-black uppercase text-sm tracking-tight">Order Placed Successfully!</h3>
                                <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest">Protocol ID: #{location.state?.orderId?.substring(0, 8)}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSuccessMessage(false)}
                            className="text-emerald-400 hover:text-emerald-600 font-black text-xs uppercase tracking-widest"
                        >
                            Dismiss
                        </button>
                    </motion.div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-[#FF7D54] border-t-transparent rounded-full animate-spin mb-6" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Inventory Database...</p>
                    </div>
                ) : orders.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                    >
                        {orders.map((order) => (
                            <motion.div
                                key={order.id || order._id}
                                variants={itemVariants}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group hover:border-[#FF7D54]/30 transition-all"
                            >
                                {/* Order Header */}
                                <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ordered On</p>
                                            <p className="text-sm font-black text-slate-900">{formatDate(order.created_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Protocol ID</p>
                                            <p className="text-sm font-mono font-bold text-slate-600 uppercase">#{order.payment_id || order.id?.substring(0, 10)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Assets</p>
                                            <p className="text-sm font-black text-[#FF7D54]">₹{order.total_amount}</p>
                                        </div>
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white rounded-2xl shadow-sm border border-slate-100">
                                        {getStatusIcon(order.status)}
                                        <span className="text-[11px] font-black uppercase text-slate-600 tracking-widest">{order.status}</span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-8 sm:p-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-6 group/item">
                                                    <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center group-hover/item:scale-105 transition-transform border border-slate-100">
                                                        {(item.image || item.image_url || item.img || itemImages[item.id] || itemImages[item.unique_id]) ? (
                                                            <img
                                                                src={item.image || item.image_url || item.img || itemImages[item.id] || itemImages[item.unique_id]}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    const icon = e.target.parentElement.querySelector('.fallback-icon');
                                                                    if (icon) icon.style.display = 'block';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <ShoppingBagIcon className={`fallback-icon h-10 w-10 text-slate-200 ${(item.image || item.image_url || item.img || itemImages[item.id] || itemImages[item.unique_id]) ? 'hidden' : 'block'}`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">{item.name}</h4>
                                                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                                            ₹{item.price} <span className="mx-2">×</span> {item.quantity || 1}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex flex-col justify-between">
                                            <div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Delivery Vector</h4>
                                                <div className="space-y-3">
                                                    <p className="text-sm font-bold text-slate-700">{order.full_name}</p>
                                                    <p className="text-xs font-medium text-slate-500 leading-relaxed italic">{order.delivery_address?.area}, {order.delivery_address?.school}</p>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Signal: {order.phone}</p>
                                                </div>
                                            </div>
                                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-200/60">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Security</span>
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase italic">Verified Complete</span>
                                                </div>
                                                <button
                                                    onClick={() => navigate('/support')}
                                                    className="px-6 py-2 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#FF7D54] hover:text-white transition-all shadow-sm border border-slate-100"
                                                >
                                                    Support
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200"
                    >
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                            <CubeIcon className="h-10 w-10 text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-2 tracking-tighter">No Physical Assets Found</h2>
                        <p className="text-slate-400 font-medium max-w-xs text-center mb-10">You haven't ordered any materials or merchandise from the student corner segment yet.</p>
                        <button
                            onClick={() => navigate('/students-corner')}
                            className="bg-[#FF7D54] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-200 transition-all hover:bg-[#FF6B3D] active:scale-95"
                        >
                            Explore Inventory
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default StudentCornerOrders;
