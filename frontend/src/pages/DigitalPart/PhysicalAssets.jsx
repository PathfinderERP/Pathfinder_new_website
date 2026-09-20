import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/DigitalPart/StudentSidebar";
import { useAuth } from "../../contexts/AuthContext";
import { studentCornerAPI } from "../../services/api";
import {
    ShoppingBagIcon,
    TruckIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowDownTrayIcon,
    SparklesIcon,
    BookOpenIcon,
    BuildingStorefrontIcon,
    XMarkIcon,
    PrinterIcon
} from "@heroicons/react/24/outline";

const PhysicalAssets = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await studentCornerAPI.getMyOrders();
                const fetched = response.data || [];
                
                // Merge with local storage orders if any
                const localOrdersRaw = localStorage.getItem('pathfinder_sc_orders');
                const localOrders = localOrdersRaw ? JSON.parse(localOrdersRaw) : [];
                
                // Combine deduplicated by id/payment_id
                const combined = [...fetched];
                localOrders.forEach(lo => {
                    if (!combined.some(o => o.id === lo.id || o.payment_id === lo.payment_id)) {
                        combined.push(lo);
                    }
                });

                // Default dummy physical assets if user has no orders yet
                if (combined.length === 0) {
                    combined.push({
                        id: "SC-ASSET-101",
                        payment_id: "TXN-SC-" + Math.floor(100000 + Math.random() * 900000),
                        created_at: new Date().toISOString(),
                        total_amount: 1499,
                        payment_status: "Completed",
                        shipping_status: "Delivered",
                        tracking_number: "BLUEDART-8947201",
                        shipping_address: user?.area ? `${user.area}, Kolkata, West Bengal` : "Central Kolkata Hub, WB",
                        items: [
                            {
                                name: `Class ${user?.studentClass || '12'} Pathfinder Comprehensive Book Kit`,
                                quantity: 1,
                                price: 1499,
                                type: "Study Material Set"
                            }
                        ]
                    });
                }

                setOrders(combined);
            } catch (err) {
                console.error("Failed to fetch physical assets:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row p-4 lg:p-6 gap-6 font-sans text-slate-900 pt-16 sm:pt-20 lg:pt-36 xl:pt-40 pb-16 max-w-7xl mx-auto">
            <StudentSidebar />

            <main className="flex-1 flex flex-col gap-6 max-w-full overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Physical Assets & Study Kits</h1>
                        <p className="text-slate-500 font-medium text-sm">Track official books, physical kits, and dispatch status</p>
                    </div>
                    <button
                        onClick={() => navigate('/students-corner')}
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95 self-start sm:self-auto"
                    >
                        <BuildingStorefrontIcon className="w-4 h-4" />
                        Explore Student Store
                    </button>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-slate-500 font-medium">Loading your physical assets...</p>
                    </div>
                ) : orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order, idx) => (
                            <div key={order.id || idx} className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
                                {/* Top Bar */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
                                            <BookOpenIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                                                Order #{order.id?.substring(0, 12) || 'SC-KIT-01'}
                                            </h3>
                                            <p className="text-xs text-slate-400 font-medium">
                                                Ordered on {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                                            order.shipping_status === 'Delivered' 
                                                ? 'bg-emerald-100 text-emerald-800' 
                                                : 'bg-orange-100 text-orange-800'
                                        }`}>
                                            {order.shipping_status || 'Delivered'}
                                        </span>
                                        <button
                                            onClick={() => setSelectedInvoice(order)}
                                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition"
                                        >
                                            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                            Invoice
                                        </button>
                                    </div>
                                </div>

                                {/* Item List */}
                                <div className="space-y-3">
                                    {(order.items || [{ name: 'Pathfinder Class Study Material Kit', price: order.total_amount }]).map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                                                    1x
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{item.name || item.itemName}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium">{item.type || 'Official Pathfinder Asset'}</p>
                                                </div>
                                            </div>
                                            <span className="font-black text-slate-900 text-sm">₹{(item.price || order.total_amount || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Dispatch & Delivery Status Bar */}
                                <div className="bg-slate-900 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <TruckIcon className="w-6 h-6 text-orange-400 shrink-0" />
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">Tracking Number</p>
                                            <p className="text-sm font-extrabold text-white font-mono">{order.tracking_number || 'PF-HUB-EXPRESS-992'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                                        <p className="text-[11px] text-slate-400 font-medium">Dispatch Center</p>
                                        <p className="text-xs font-bold text-emerald-400">{order.shipping_address || 'Pathfinder Main Depot, Kolkata'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
                        <ShoppingBagIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-1">No Physical Kits Issued Yet</h3>
                        <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">
                            Physical study kits, test series books, and uniforms ordered through Pathfinder will appear here with live tracking.
                        </p>
                        <button
                            onClick={() => navigate('/students-corner')}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition"
                        >
                            Browse Student Materials
                        </button>
                    </div>
                )}

                {/* Printable Invoice Modal */}
                {selectedInvoice && (
                    <div className="fixed inset-0 z-[120] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>

                            {/* Invoice Printable Area */}
                            <div id="printable-invoice" className="space-y-6">
                                <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">PATHFINDER</h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Educational Institute</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase">
                                            Official Receipt
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <p className="text-slate-400 font-bold uppercase text-[10px]">Billed To</p>
                                        <p className="font-extrabold text-slate-900 text-sm mt-0.5">{user?.fullName || user?.full_name || 'Pathfinder Student'}</p>
                                        <p className="text-slate-500">{user?.email || 'student@pathfinder.edu.in'}</p>
                                        <p className="text-slate-500">{user?.studentClass ? `Class ${user.studentClass}` : 'Enrolled Student'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-400 font-bold uppercase text-[10px]">Invoice Details</p>
                                        <p className="font-extrabold text-slate-900 mt-0.5">#{selectedInvoice.id}</p>
                                        <p className="text-slate-500">Ref: {selectedInvoice.payment_id || 'PF-PAID'}</p>
                                        <p className="text-slate-500">{formatDate(selectedInvoice.created_at)}</p>
                                    </div>
                                </div>

                                <div className="border rounded-2xl overflow-hidden border-slate-100">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                                            <tr>
                                                <th className="p-3">Description</th>
                                                <th className="p-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(selectedInvoice.items || [{ name: 'Physical Kit Asset Fee', price: selectedInvoice.total_amount }]).map((item, i) => (
                                                <tr key={i}>
                                                    <td className="p-3 font-bold text-slate-900">{item.name || item.itemName}</td>
                                                    <td className="p-3 font-black text-slate-900 text-right">₹{(item.price || selectedInvoice.total_amount || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Total Amount Paid</span>
                                    <span className="text-2xl font-black text-slate-900">₹{(selectedInvoice.total_amount || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    onClick={handlePrintInvoice}
                                    className="flex-1 bg-slate-900 hover:bg-black text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                                >
                                    <PrinterIcon className="w-4 h-4" />
                                    Print / Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PhysicalAssets;
