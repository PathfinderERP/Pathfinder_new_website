import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { studentCornerAPI } from "../services/api";
import { useCart } from "../contexts/CartContext";
import { EyeIcon, EyeSlashIcon, ChevronLeftIcon, ShoppingBagIcon, ShieldCheckIcon, CreditCardIcon, MapPinIcon, UserIcon } from "@heroicons/react/24/outline";

const StudentCheckout = () => {
    const navigate = useNavigate();
    const { user, setAuthenticatedUser } = useAuth();
    const { cartItems, cartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Registration Form State
    const [registrationData, setRegistrationData] = useState({
        fullName: "",
        email: "",
        phone: "",
        studentClass: "12",
        area: "",
        school: "",
        parentName: "",
        board: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate("/students-corner");
        }
        window.scrollTo(0, 0);
    }, [cartItems, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRegistrationData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePlaceOrder = async () => {
        setError(null);

        // Validate Registration if not logged in
        if (!user) {
            if (!registrationData.fullName || !registrationData.email || !registrationData.phone || !registrationData.password || !registrationData.area) {
                setError("Please fill all required fields (Name, Email, Phone, Area, Password)");
                return;
            }
            if (registrationData.password !== registrationData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
        }

        setLoading(true);

        try {
            const payload = {
                items: cartItems.map(item => ({
                    id: item.id || item.unique_id,
                    name: item.name,
                    price: item.discounted_price || item.price,
                    quantity: item.quantity || 1,
                    image: item.image_url || item.image || item.img
                })),
                totalAmount: cartTotal,
                payment: {
                    method: 'card',
                    status: 'completed'
                },
                user: !user ? registrationData : undefined
            };

            const response = await studentCornerAPI.purchase(payload);

            if (response.data.token && response.data.user) {
                // Global auth update
                setAuthenticatedUser(response.data.user, response.data.token);
            }

            // Clear cart and redirect
            clearCart();
            navigate("/students-corner/orders", { state: { success: true, orderId: response.data.order_id } });

        } catch (err) {
            console.error("Purchase failed:", err);
            setError(err.response?.data?.error || "Order failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pt-[100px] lg:pt-[160px] pb-20">
            <div className="2xl:max-w-7xl mx-auto px-6 lg:px-8">
                <button
                    onClick={() => navigate('/students-corner/bag')}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#FF7D54] font-bold text-sm uppercase tracking-widest transition-colors mb-8"
                >
                    <ChevronLeftIcon className="h-5 w-5" /> Back to Bag
                </button>

                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic mb-10">Checkout</h1>

                {error && (
                    <div className="mb-8 bg-red-50 text-red-600 p-6 rounded-[2rem] border border-red-100 flex items-center gap-4 animate-shake">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-xl">⚠️</span>
                        </div>
                        <p className="font-bold">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Col: Info Forms */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 1. Identity Form */}
                        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                                    <UserIcon className="h-6 w-6 text-[#FF7D54]" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 uppercase">Contact Information</h2>
                            </div>

                            {user ? (
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Logged in as</p>
                                    <h3 className="text-lg font-bold text-slate-900">{user.fullName || user.full_name}</h3>
                                    <p className="text-slate-500 font-medium">{user.email}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={registrationData.fullName}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={registrationData.email}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={registrationData.phone}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                            placeholder="10-digit mobile number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Create Password *</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={registrationData.password}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                                placeholder="Min. 6 characters"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-orange-500"
                                            >
                                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Confirm Password *</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={registrationData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                                placeholder="Re-enter password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-orange-500"
                                            >
                                                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Shipping Form */}
                        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                    <MapPinIcon className="h-6 w-6 text-blue-500" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 uppercase">Delivery Address</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Area / Locality / Street Address *</label>
                                    <input
                                        type="text"
                                        name="area"
                                        value={registrationData.area}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                        placeholder="Enter your complete address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">School (Optional)</label>
                                    <input
                                        type="text"
                                        name="school"
                                        value={registrationData.school}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold transition-all outline-none"
                                        placeholder="Your school name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Class (For optimization)</label>
                                    <select
                                        name="studentClass"
                                        value={registrationData.studentClass}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold transition-all outline-none appearance-none"
                                    >
                                        {[...Array(7)].map((_, i) => (
                                            <option key={6 + i} value={String(6 + i)}>Class {6 + i}</option>
                                        ))}
                                        <option value="Dropper">Dropper</option>
                                        <option value="College">College</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 3. Payment Method Mock */}
                        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full -mr-20 -mt-20" />
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                    <CreditCardIcon className="h-6 w-6 text-emerald-500" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 uppercase">Payment Method</h2>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 p-6 border-2 border-orange-500 bg-orange-50/30 rounded-[2rem] flex items-center gap-4 relative">
                                    <div className="w-10 h-10 bg-[#FF7D54] rounded-full flex items-center justify-center shrink-0">
                                        <ShieldCheckIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 uppercase text-xs">Pathfinder Direct</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Instant Confirmation & Tracking</p>
                                    </div>
                                    <div className="absolute top-4 right-6">
                                        <div className="w-4 h-4 rounded-full border-4 border-[#FF7D54] flex items-center justify-center" />
                                    </div>
                                </div>
                                <div className="flex-1 p-6 border border-slate-100 bg-white rounded-[2rem] flex items-center gap-4 opacity-50 grayscale">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                                        <CreditCardIcon className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-400 uppercase text-xs">UPI / Other</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">Coming Soon</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Order Summary Stick */}
                    <div className="lg:col-span-4 lg:sticky lg:top-[160px] h-fit">
                        <div className="bg-[#161616] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-orange-200/20 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-3xl -mr-16 -mt-16" />

                            <div className="flex items-center gap-3 mb-8">
                                <ShoppingBagIcon className="h-6 w-6 text-orange-400" />
                                <h2 className="text-xl font-black uppercase italic tracking-tighter">Order Details</h2>
                            </div>

                            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id || item.unique_id} className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-xs font-black uppercase line-clamp-1">{item.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1">QTY: {item.quantity || 1}</p>
                                        </div>
                                        <span className="text-xs font-black text-orange-400">₹{(item.discounted_price || item.price) * (item.quantity || 1)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-white/10 space-y-4 mb-8">
                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-white">₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <span>Delivery</span>
                                    <span className="text-emerald-400">FREE</span>
                                </div>
                                <div className="flex justify-between items-end pt-4">
                                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Total</span>
                                    <span className="text-3xl font-black text-white italic">₹{cartTotal}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading || cartItems.length === 0}
                                className="w-full bg-[#FF7D54] hover:bg-[#FF6B3D] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Encrypting...</span>
                                    </>
                                ) : (
                                    "Place Order Now"
                                )}
                            </button>

                            <p className="mt-6 text-[9px] text-gray-500 font-bold text-center uppercase tracking-widest">
                                By placing this order, you agree to our Digital Terms & End User Licensing Agreement.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentCheckout;
