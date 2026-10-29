import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { studentCornerAPI } from "../services/api";
import { useCart } from "../contexts/CartContext";
import { 
    EyeIcon, 
    EyeSlashIcon, 
    ChevronLeftIcon, 
    ShoppingBagIcon, 
    ShieldCheckIcon, 
    CreditCardIcon, 
    MapPinIcon, 
    UserIcon,
    CheckCircleIcon,
    LockClosedIcon
} from "@heroicons/react/24/outline";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const StudentCheckout = () => {
    const navigate = useNavigate();
    const { user, setAuthenticatedUser } = useAuth();
    const { 
        cartItems, 
        cartTotal, 
        cartOriginalTotal, 
        cartSavings, 
        clearCart,
        getItemSellingPrice 
    } = useCart();
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

    useEffect(() => {
        if (user) {
            setRegistrationData(prev => ({
                ...prev,
                fullName: prev.fullName || user.fullName || user.full_name || "",
                email: prev.email || user.email || "",
                phone: prev.phone || user.phone || user.mobile || "",
                area: prev.area || user.area || "",
                school: prev.school || user.school || "",
                studentClass: prev.studentClass || user.studentClass || user.student_class || "12",
                board: prev.board || user.board || ""
            }));
        }
    }, [user]);

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
                setError("Please fill all required fields (Name, Email, Phone, Delivery Area, Password)");
                return;
            }
            if (registrationData.password !== registrationData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            const cleanPhone = registrationData.phone.replace(/\D/g, "");
            if (cleanPhone.length < 10) {
                setError("Please enter a valid 10-digit mobile number");
                return;
            }
        } else {
            if (!registrationData.area && !user.area) {
                setError("Please enter your complete delivery area / address");
                return;
            }
        }

        setLoading(true);

        try {
            const customerName = user ? (user.fullName || user.full_name) : registrationData.fullName;
            const customerEmailID = user ? user.email : registrationData.email;
            const customerMobileNo = user ? (user.phone || user.mobile || registrationData.phone || "9876543210") : registrationData.phone;
            const merchantTxnNo = `TXN${Date.now()}`;
            const txnDate = new Date().toISOString().replace(/[-T:\.Z]/g, "").slice(0, 14);
            const amount = cartTotal ? cartTotal.toFixed(2) : "0.00";

            // 1. Prepare items payload using selling price
            const items = cartItems.map(item => {
                const itemPrice = getItemSellingPrice ? getItemSellingPrice(item) : (parseFloat(item.discounted_price) || parseFloat(item.price) || 0);
                return {
                    id: item.id || item.unique_id,
                    name: item.name,
                    price: itemPrice,
                    quantity: item.quantity || 1,
                    image: item.image_url || item.image || item.img
                };
            });

            // 2. Pre-create order and user account in backend
            const orderPayload = {
                items,
                totalAmount: cartTotal,
                payment: {
                    method: 'icici',
                    status: 'pending',
                    txn_id: merchantTxnNo
                },
                delivery_address: {
                    area: registrationData.area || user?.area || '',
                    school: registrationData.school || user?.school || '',
                    board: registrationData.board || user?.board || ''
                },
                user: !user ? registrationData : undefined
            };

            const purchaseRes = await studentCornerAPI.purchase(orderPayload);

            if (purchaseRes.data?.token && purchaseRes.data?.user) {
                // Update global auth state
                setAuthenticatedUser(purchaseRes.data.user, purchaseRes.data.token);
            }

            // Save order reference locally for dashboard and receipts
            try {
                const orderRecord = {
                    id: purchaseRes.data?.order_id || `ORD-${merchantTxnNo}`,
                    items,
                    total_amount: cartTotal,
                    merchantTxnNo,
                    customerName,
                    customerEmail: customerEmailID,
                    date: new Date().toISOString()
                };
                localStorage.setItem('student_corner_last_order', JSON.stringify(orderRecord));
            } catch (e) {
                console.warn("Could not save last order in localStorage:", e);
            }

            // 3. Fetch ICICI Payment Gateway Configuration
            let gatewayConfig = {
                merchantId: "100000000007164",
                aggregatorID: "A100000000007164",
                secretKey: "db06cca0-838b-4e01-8b20-6ac446ffb6bd",
                saleUrl: "https://pgpayuat.icici.bank.in/tsp/pg/api/v2/initiateSale"
            };

            try {
                const configRes = await axios.get(`${API_BASE_URL}/api/courses/icici/config/`);
                if (configRes.data && configRes.data.merchantId) {
                    gatewayConfig = configRes.data;
                }
            } catch (cfgErr) {
                console.warn("Using default ICICI config fallback", cfgErr);
            }

            const { merchantId, aggregatorID, secretKey, saleUrl } = gatewayConfig;
            const returnURL = `${API_BASE_URL}/api/courses/icici/callback/`;

            const itemSummaryNames = cartItems.map(i => i.name).slice(0, 2).join(', ');
            const params = {
                merchantId,
                aggregatorID,
                merchantTxnNo,
                amount,
                currencyCode: "356",
                payType: "0", // Standard 3DS Redirection
                customerEmailID,
                transactionType: "SALE",
                returnURL,
                txnDate,
                customerMobileNo,
                customerName,
                addlParam1: `Student Corner - ${itemSummaryNames || 'Items'}`.slice(0, 100),
                addlParam2: ""
            };

            // 4. Generate HMAC-SHA256 secure hash from backend proxy
            const hashRes = await axios.post(`${API_BASE_URL}/api/courses/icici/generate-hash/`, {
                mode: "v1",
                secretKey,
                params
            });

            if (!hashRes.data || !hashRes.data.success) {
                throw new Error("Failed to calculate payment security hash.");
            }

            const secureHash = hashRes.data.secureHash;
            const fullPayload = {
                ...params,
                secureHash
            };

            // 5. Initiate Sale API via backend proxy
            const proxyRes = await axios.post(`${API_BASE_URL}/api/courses/icici/proxy/`, {
                target_url: saleUrl,
                payload_type: "json",
                payload: fullPayload
            });

            const resData = proxyRes.data;
            const responseContent = resData.data || resData;
            console.log("ICICI Gateway Raw Response:", resData);

            const targetRedirect = responseContent.redirectURI || responseContent.redirectUrl || responseContent.redirect_url || responseContent.targetUrl || responseContent.target_url || responseContent.url || responseContent.action;
            const tranCtx = responseContent.tranCtx || responseContent.tran_ctx || responseContent.tranContext;

            // Clear cart upon successful handoff to payment gateway
            clearCart();

            if (targetRedirect && tranCtx) {
                const finalUrl = targetRedirect.includes('?') 
                    ? `${targetRedirect}&tranCtx=${encodeURIComponent(tranCtx)}`
                    : `${targetRedirect}?tranCtx=${encodeURIComponent(tranCtx)}`;
                window.location.href = finalUrl;
            } else if (targetRedirect) {
                window.location.href = targetRedirect;
            } else if (responseContent.html || responseContent.formHtml) {
                document.open();
                document.write(responseContent.html || responseContent.formHtml);
                document.close();
            } else {
                console.error("ICICI Gateway unexpected response structure:", responseContent);
                const errorMsg = responseContent.responseMessage || responseContent.respDescription || responseContent.message || responseContent.error || (typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent));
                throw new Error(errorMsg || "Payment initiation returned an unexpected response from ICICI Bank.");
            }

        } catch (err) {
            console.error("Purchase or ICICI payment failed:", err);
            setError(err.response?.data?.error || err.message || "Payment initiation failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <div className="2xl:max-w-7xl mx-auto px-6 pt-10 md:pt-16 lg:px-8">
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

                        {/* 3. Payment Method: ICICI Bank Payment Gateway */}
                        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full -mr-20 -mt-20" />
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                                    <CreditCardIcon className="h-6 w-6 text-[#FF7D54]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase">Payment Method</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Official Bank Secured Gateway</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* ICICI Bank Primary Option */}
                                <div className="p-6 border-2 border-orange-500 bg-orange-50/40 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 relative shadow-sm">
                                    <div className="flex items-start sm:items-center gap-4">
                                        <div className="w-12 h-12 bg-[#B02A30] rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-red-900/20 text-white font-black text-sm tracking-tighter">
                                            ICICI
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-slate-900 uppercase text-sm">ICICI Bank Payment Gateway</h4>
                                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Active</span>
                                            </div>
                                            <p className="text-xs text-slate-600 font-medium mt-1">
                                                Pay securely via UPI (GPay, PhonePe, Paytm, BHIM), Credit / Debit Card (Visa, MasterCard, RuPay), or Net Banking
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                <span className="flex items-center gap-1 text-emerald-600">
                                                    <ShieldCheckIcon className="w-3.5 h-3.5" /> 3D Secure 2.0
                                                </span>
                                                <span>• 256-Bit SSL Encrypted</span>
                                                <span>• Instant Receipt</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        <span className="w-6 h-6 rounded-full bg-[#FF7D54] flex items-center justify-center text-white">
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </span>
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
                                {cartItems.map((item) => {
                                    const itemPrice = getItemSellingPrice ? getItemSellingPrice(item) : (parseFloat(item.discounted_price) || parseFloat(item.price) || 0);
                                    const qty = item.quantity || 1;
                                    return (
                                        <div key={item.id || item.unique_id} className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h4 className="text-xs font-black uppercase line-clamp-1">{item.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold mt-1">QTY: {qty}</p>
                                            </div>
                                            <span className="text-xs font-black text-orange-400">₹{(itemPrice * qty).toLocaleString('en-IN')}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-6 border-t border-white/10 space-y-4 mb-8">
                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-white">₹{(cartOriginalTotal || cartTotal).toLocaleString('en-IN')}</span>
                                </div>
                                {cartSavings > 0 && (
                                    <div className="flex justify-between text-xs font-bold text-emerald-400 uppercase tracking-widest">
                                        <span>Discount Savings</span>
                                        <span>-₹{cartSavings.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <span>Delivery</span>
                                    <span className="text-emerald-400">FREE</span>
                                </div>
                                <div className="flex justify-between items-end pt-4">
                                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Total</span>
                                    <div className="text-right">
                                        {cartSavings > 0 && (
                                            <p className="text-xs text-gray-400 line-through font-bold">₹{cartOriginalTotal.toLocaleString('en-IN')}</p>
                                        )}
                                        <span className="text-3xl font-black text-[#FF7D54] italic">₹{cartTotal.toLocaleString('en-IN')}</span>
                                    </div>
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
                                        <span>Connecting to ICICI Gateway...</span>
                                    </>
                                ) : (
                                    <>
                                        <LockClosedIcon className="w-5 h-5" />
                                        <span>Pay ₹{cartTotal.toLocaleString('en-IN')} via ICICI Bank</span>
                                    </>
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
