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
    ShieldCheckIcon,
    EyeIcon,
    XMarkIcon,
    PhoneIcon,
    SparklesIcon,
    TagIcon,
    CheckIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { studentCornerAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';

const numberToWords = (amt) => {
    try {
        const val = parseFloat(amt);
        if (isNaN(val) || val <= 0) return 'Zero Rupees Only';

        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const convertLessThanThousand = (num) => {
            let res = '';
            if (num >= 100) {
                res += ones[Math.floor(num / 100)] + ' Hundred ';
                num %= 100;
            }
            if (num >= 20) {
                res += tens[Math.floor(num / 10)] + ' ';
                num %= 10;
            }
            if (num > 0) {
                res += ones[num] + ' ';
            }
            return res.trim();
        };

        const rupees = Math.floor(val);
        const paise = Math.round((val - rupees) * 100);

        const convertIndian = (num) => {
            if (num === 0) return 'Zero';
            const crore = Math.floor(num / 10000000);
            num %= 10000000;
            const lakh = Math.floor(num / 100000);
            num %= 100000;
            const thousand = Math.floor(num / 1000);
            num %= 1000;
            const rem = num;

            const parts = [];
            if (crore) parts.push(convertLessThanThousand(crore) + ' Crore');
            if (lakh) parts.push(convertLessThanThousand(lakh) + ' Lakh');
            if (thousand) parts.push(convertLessThanThousand(thousand) + ' Thousand');
            if (rem) parts.push(convertLessThanThousand(rem));
            return parts.join(' ').trim();
        };

        const rStr = convertIndian(rupees) + ' Rupees';
        if (paise > 0) {
            const pStr = convertLessThanThousand(paise) + ' Paise';
            return `${rStr} and ${pStr} Only`;
        }
        return `${rStr} Only`;
    } catch {
        return `${amt} Rupees Only`;
    }
};

const StudentCornerOrders = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isStudentAuthenticated } = useAuth();

    const [orders, setOrders] = useState([]);
    const [itemImages, setItemImages] = useState({});
    const [itemMap, setItemMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(location.state?.success);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

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
            const detailsMap = {};
            if (Array.isArray(items)) {
                items.forEach(item => {
                    const id = item.id || item._id || item.unique_id;
                    if (id) {
                        detailsMap[id] = item;
                        if (item.image_url) mapping[id] = item.image_url;
                    }
                    if (item.unique_id) {
                        detailsMap[item.unique_id] = item;
                        if (item.image_url) mapping[item.unique_id] = item.image_url;
                    }
                });
            }
            setItemImages(mapping);
            setItemMap(detailsMap);
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

    // Helper: Determine if item is physical
    const isItemPhysical = (item) => {
        if (item.is_physical_asset !== undefined) return Boolean(item.is_physical_asset);
        const dbItem = itemMap[item.id] || itemMap[item.unique_id];
        if (dbItem && dbItem.is_physical_asset !== undefined) return Boolean(dbItem.is_physical_asset);
        const cat = (item.category || dbItem?.category || '').toLowerCase();
        if (cat.includes('note') || cat.includes('ebook') || cat.includes('timetable') || cat.includes('digital')) {
            return false;
        }
        return true;
    };

    // Helper: Determine if order requires physical delivery
    const orderHasPhysicalItems = (order) => {
        if (order.has_physical_items !== undefined) return Boolean(order.has_physical_items);
        if (!order.items || order.items.length === 0) return true;
        return order.items.some(item => isItemPhysical(item));
    };

    // Helper: Check if order is Paid
    const isOrderPaid = (order) => {
        const ps = (order.payment_status || '').toLowerCase();
        const st = (order.status || '').toLowerCase();
        if (ps === 'completed' || ps === 'paid' || ps === 'success') return true;
        if (ps === 'failed' || ps === 'pending' || ps === 'cancelled') return false;
        if (!ps && (st === 'processing' || st === 'shipped' || st === 'delivered')) return true;
        return false;
    };

    // Helper: Official Fee Receipt & Tax Invoice Generator
    const handleDownloadOrderReceipt = (order) => {
        const receiptWindow = window.open('', '_blank');
        if (!receiptWindow) return;

        const orderId = order.payment_id || order.id || `SC-ORD-${Date.now()}`;
        const formattedAmount = parseFloat(order.total_amount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        const amountInWords = numberToWords(order.total_amount);
        const dateStr = formatDate(order.created_at);
        const studentName = order.full_name || user?.fullName || 'Pathfinder Student';
        const studentPhone = order.phone || user?.phone || 'N/A';
        const studentEmail = order.email || user?.email || 'N/A';
        const hasPhysical = orderHasPhysicalItems(order);

        const itemsRows = (order.items || []).map((item, index) => {
            const isPhys = isItemPhysical(item);
            const lineTotal = ((parseFloat(item.price) || 0) * (item.quantity || 1)).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            return `
                <tr>
                    <td style="text-align:center;">${String(index + 1).padStart(2, '0')}</td>
                    <td>
                        <strong>${item.name || 'Courseware Item'}</strong>
                        <div style="font-size:11px; color:#64748B; margin-top:2px;">
                            ${isPhys ? '📦 Physical Study Kit / Book' : '⚡ Digital Learning Material'} | Unit Price: ₹${item.price}
                        </div>
                    </td>
                    <td style="text-align:center;">999293</td>
                    <td style="text-align:center;">${item.quantity || 1}</td>
                    <td style="text-align:right;"><strong>₹${lineTotal}</strong></td>
                </tr>
            `;
        }).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Official Fee Receipt & Tax Invoice - ${orderId}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
                <style>
                    * { box-sizing: border-box; }
                    body {
                        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        padding: 30px 15px;
                        color: #0F172A;
                        background: #F1F5F9;
                        margin: 0;
                        line-height: 1.5;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .invoice-sheet {
                        max-width: 820px;
                        margin: 0 auto;
                        background: #FFFFFF;
                        border-radius: 18px;
                        box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px #E2E8F0;
                        overflow: hidden;
                        position: relative;
                    }
                    .inst-header {
                        background: #FFFFFF;
                        border-bottom: 2px solid #F1F5F9;
                        padding: 28px 36px 22px 36px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 20px;
                        position: relative;
                    }
                    .inst-header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 5px;
                        background: linear-gradient(90deg, #EE4600 0%, #FF7D54 50%, #0F172A 100%);
                    }
                    .brand-col {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                    }
                    .logo-img {
                        height: 48px;
                        max-width: 220px;
                        display: block;
                        object-fit: contain;
                    }
                    .inst-info {
                        border-left: 2px solid #E2E8F0;
                        padding-left: 16px;
                    }
                    .inst-info h1 {
                        margin: 0;
                        font-size: 15px;
                        font-weight: 900;
                        color: #0F172A;
                    }
                    .inst-info p {
                        margin: 2px 0 0;
                        font-size: 10px;
                        color: #64748B;
                        font-weight: 600;
                    }
                    .inst-info .contacts {
                        margin-top: 4px;
                        font-size: 10px;
                        color: #EE4600;
                        font-weight: 700;
                    }
                    .receipt-tag-box {
                        text-align: right;
                    }
                    .receipt-badge {
                        display: inline-block;
                        background: #0F172A;
                        color: #FFFFFF;
                        font-size: 11px;
                        font-weight: 900;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                        padding: 5px 14px;
                        border-radius: 6px;
                        margin-bottom: 6px;
                    }
                    .receipt-num {
                        font-size: 13px;
                        font-weight: 800;
                        color: #334155;
                        margin: 0;
                    }
                    .receipt-date {
                        font-size: 11px;
                        color: #64748B;
                        margin: 3px 0 0;
                    }
                    .content-wrap {
                        padding: 30px 36px 36px 36px;
                    }
                    .meta-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 18px;
                        margin-bottom: 26px;
                    }
                    .meta-card {
                        background: #F8FAFC;
                        border: 1px solid #E2E8F0;
                        border-radius: 12px;
                        padding: 16px 20px;
                    }
                    .meta-card-title {
                        font-size: 10.5px;
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: #EE4600;
                        margin-bottom: 12px;
                        border-bottom: 1px dashed #CBD5E1;
                        padding-bottom: 6px;
                    }
                    .meta-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: baseline;
                        margin-bottom: 7px;
                        font-size: 12px;
                    }
                    .meta-row:last-child { margin-bottom: 0; }
                    .meta-label {
                        color: #64748B;
                        font-weight: 600;
                        margin-right: 8px;
                    }
                    .meta-val {
                        color: #0F172A;
                        font-weight: 800;
                        text-align: right;
                    }
                    .badge-paid {
                        background: #10B981;
                        color: #FFFFFF;
                        font-size: 10px;
                        font-weight: 900;
                        padding: 3px 10px;
                        border-radius: 9999px;
                        letter-spacing: 0.5px;
                        display: inline-block;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                        border: 1px solid #E2E8F0;
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    .items-table th {
                        background: #0F172A;
                        color: #FFFFFF;
                        font-size: 11px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        padding: 12px 14px;
                        text-align: left;
                    }
                    .items-table td {
                        padding: 14px;
                        font-size: 12.5px;
                        color: #1E293B;
                        border-bottom: 1px solid #E2E8F0;
                        background: #FFFFFF;
                    }
                    .items-table tr:last-child td { border-bottom: none; }
                    .total-wrapper {
                        display: flex;
                        justify-content: flex-end;
                        margin-bottom: 26px;
                    }
                    .total-box {
                        width: 380px;
                        background: #FFF7ED;
                        border: 1px solid #FED7AA;
                        border-radius: 12px;
                        padding: 16px 20px;
                    }
                    .total-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .total-table td {
                        padding: 4px 0;
                        font-size: 13px;
                    }
                    .total-grand {
                        border-top: 1.5px dashed #FDBA74;
                        padding-top: 10px !important;
                        font-size: 16px;
                        font-weight: 900;
                        color: #9A3412;
                    }
                    .total-grand-amt {
                        border-top: 1.5px dashed #FDBA74;
                        padding-top: 10px !important;
                        font-size: 22px;
                        font-weight: 900;
                        color: #EE4600;
                        text-align: right;
                    }
                    .words-row {
                        padding-top: 8px !important;
                        font-size: 11px;
                        color: #78350F;
                        font-style: italic;
                    }
                    .auth-grid {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: #F8FAFC;
                        border: 1px solid #E2E8F0;
                        border-radius: 12px;
                        padding: 18px 24px;
                        margin-bottom: 24px;
                    }
                    .seal-wrap {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .seal-badge {
                        width: 48px;
                        height: 48px;
                        border-radius: 50%;
                        border: 2px dashed #EE4600;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #EE4600;
                        font-size: 20px;
                        background: #FFF7ED;
                    }
                    .seal-text {
                        font-size: 11px;
                        color: #334155;
                    }
                    .seal-text strong {
                        color: #0F172A;
                        display: block;
                        font-size: 12px;
                    }
                    .signatory-box {
                        text-align: right;
                    }
                    .signatory-stamp {
                        font-size: 12px;
                        font-weight: 800;
                        color: #0F172A;
                        text-transform: uppercase;
                    }
                    .signatory-sub {
                        font-size: 10px;
                        color: #64748B;
                        margin-top: 2px;
                    }
                    .notice-panel {
                        background: #FEF3C7;
                        border-left: 4px solid #F59E0B;
                        border-radius: 0 10px 10px 0;
                        padding: 12px 16px;
                        font-size: 11.5px;
                        color: #92400E;
                        line-height: 1.5;
                        margin-bottom: 18px;
                    }
                    .helpline-panel {
                        background: #F0FDF4;
                        border: 1px solid #BBF7D0;
                        border-radius: 10px;
                        padding: 12px 16px;
                        font-size: 12px;
                        color: #166534;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 10px;
                    }
                    .helpline-link {
                        font-size: 16px;
                        font-weight: 900;
                        color: #EE4600;
                        text-decoration: none;
                    }
                    .inst-footer {
                        background: #0F172A;
                        color: #94A3B8;
                        padding: 18px 36px;
                        font-size: 10.5px;
                        text-align: center;
                        line-height: 1.6;
                    }
                    .action-toolbar {
                        text-align: center;
                        margin-top: 24px;
                        margin-bottom: 40px;
                        display: flex;
                        justify-content: center;
                        gap: 12px;
                    }
                    .btn-print {
                        background: linear-gradient(135deg, #EE4600 0%, #FF6B3D 100%);
                        color: #FFFFFF;
                        border: none;
                        padding: 14px 30px;
                        font-weight: 800;
                        border-radius: 12px;
                        cursor: pointer;
                        font-size: 14px;
                        box-shadow: 0 8px 20px rgba(238, 70, 0, 0.35);
                        font-family: inherit;
                    }
                    .btn-close {
                        background: #0F172A;
                        color: #FFFFFF;
                        border: none;
                        padding: 14px 24px;
                        font-weight: 700;
                        border-radius: 12px;
                        cursor: pointer;
                        font-size: 14px;
                    }
                    @media print {
                        body { padding: 0; background: #FFFFFF; }
                        .invoice-sheet { box-shadow: none; border: 1px solid #CBD5E1; border-radius: 0; max-width: 100%; }
                        .no-print { display: none !important; }
                        @page { size: A4 portrait; margin: 8mm 10mm; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-sheet">
                    <div class="inst-header">
                        <div class="brand-col">
                            <img src="https://pathfinder.edu.in/images/icon/logo-1.svg" alt="Pathfinder Educational Centre" class="logo-img" />
                            <div class="inst-info">
                                <h1>PATHFINDER EDUCATIONAL CENTRE LLP</h1>
                                <p>Premier Institute for JEE | NEET | WBJEE | Foundation | Boards</p>
                                <p>Head Office: 96K, Shyama Prasad Mukherjee Road, Hazra, Kolkata - 700026</p>
                                <div class="contacts">
                                    📞 Student Helpline: 9147178886 &nbsp;|&nbsp; ✉️ support@pathfinder.edu.in
                                </div>
                            </div>
                        </div>
                        <div class="receipt-tag-box">
                            <div class="receipt-badge">FEE RECEIPT & TAX INVOICE</div>
                            <p class="receipt-num">Order Ref: #${orderId}</p>
                            <p class="receipt-date">${dateStr}</p>
                        </div>
                    </div>

                    <div class="content-wrap">
                        <div class="meta-grid">
                            <div class="meta-card">
                                <div class="meta-card-title">👤 Student Particulars</div>
                                <div class="meta-row">
                                    <span class="meta-label">Student Name:</span>
                                    <span class="meta-val">${studentName}</span>
                                </div>
                                <div class="meta-row">
                                    <span class="meta-label">Contact Number:</span>
                                    <span class="meta-val">${studentPhone}</span>
                                </div>
                                <div class="meta-row">
                                    <span class="meta-label">Email Address:</span>
                                    <span class="meta-val">${studentEmail}</span>
                                </div>
                                <div class="meta-row">
                                    <span class="meta-label">Order Ref:</span>
                                    <span class="meta-val">${orderId}</span>
                                </div>
                            </div>

                            <div class="meta-card">
                                <div class="meta-card-title">📦 Order & Fulfillment Summary</div>
                                <div class="meta-row">
                                    <span class="meta-label">Fulfillment Mode:</span>
                                    <span class="meta-val" style="color:#EE4600;">
                                        ${hasPhysical ? 'Physical Dispatch (Courier)' : 'Instant Digital Access'}
                                    </span>
                                </div>
                                <div class="meta-row">
                                    <span class="meta-label">Payment Status:</span>
                                    <span class="meta-val"><span class="badge-paid">✓ PAID & VERIFIED</span></span>
                                </div>
                                <div class="meta-row">
                                    <span class="meta-label">Gateway Channel:</span>
                                    <span class="meta-val">Online (ICICI 3D Secure)</span>
                                </div>
                                <div class="meta-row">
                                    <span class="meta-label">Fulfillment Status:</span>
                                    <span class="meta-val" style="text-transform:capitalize;">${order.status || 'Processing'}</span>
                                </div>
                            </div>
                        </div>

                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th style="width: 8%; text-align:center;">Sl.</th>
                                    <th style="width: 52%;">Courseware / Item Description</th>
                                    <th style="width: 14%; text-align:center;">SAC Code</th>
                                    <th style="width: 8%; text-align:center;">Qty</th>
                                    <th style="width: 18%; text-align:right;">Total Net (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsRows}
                            </tbody>
                        </table>

                        <div class="total-wrapper">
                            <div class="total-box">
                                <table class="total-table">
                                    <tr>
                                        <td style="color:#64748B;">Items Subtotal:</td>
                                        <td style="text-align:right; font-weight:700;">₹${formattedAmount}</td>
                                    </tr>
                                    <tr>
                                        <td style="color:#64748B;">Shipping & Packaging:</td>
                                        <td style="text-align:right; font-weight:700; color:#10B981;">FREE (₹0.00)</td>
                                    </tr>
                                    <tr>
                                        <td class="total-grand">Total Fee Paid:</td>
                                        <td class="total-grand total-grand-amt">₹${formattedAmount}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" class="words-row">
                                            <strong>Amount in Words:</strong> ${amountInWords}
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <div class="auth-grid">
                            <div class="seal-wrap">
                                <div class="seal-badge">✓</div>
                                <div class="seal-text">
                                    <strong>PATHFINDER ACCOUNTS & DISPATCH CELL</strong>
                                    Digitally Authenticated & Gateway Validated
                                </div>
                            </div>
                            <div class="signatory-box">
                                <div class="signatory-stamp">Authorized Signatory</div>
                                <div class="signatory-sub">Pathfinder Educational Centre LLP (Computer Generated)</div>
                            </div>
                        </div>

                        <div class="notice-panel">
                            <strong>⚠️ Auto-Generated Notification:</strong>
                            This is an automatically generated official receipt. <strong>Please do not reply directly to this mail/receipt</strong> as incoming messages are not monitored.
                        </div>

                        <div class="helpline-panel">
                            <div>
                                <strong>Questions regarding dispatch tracking or student materials?</strong><br>
                                Our student support desk is available to assist you.
                            </div>
                            <div>
                                <a href="tel:9147178886" class="helpline-link">📞 9147178886</a>
                            </div>
                        </div>
                    </div>

                    <div class="inst-footer">
                        <strong>PATHFINDER EDUCATIONAL CENTRE LLP</strong> — Shaping Medical & Engineering Careers for Over 3 Decades<br>
                        Head Office: 96K, S. P. Mukherjee Road, Hazra, Kolkata - 700026 | Student Helpline: 9147178886 | Email: support@pathfinder.edu.in<br>
                        &copy; ${new Date().getFullYear()} Pathfinder Educational Centre. All Rights Reserved. Computer Generated Official Invoice.
                    </div>
                </div>

                <div class="action-toolbar no-print">
                    <button onclick="window.print()" class="btn-print">🖨️ Print / Save Official Invoice (PDF)</button>
                    <button onclick="window.close()" class="btn-close">Close Window</button>
                </div>
            </body>
            </html>
        `;

        receiptWindow.document.write(htmlContent);
        receiptWindow.document.close();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    if (!user && !isStudentAuthenticated) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 md:pt-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200/80 shadow-sm max-w-lg mx-auto"
                    >
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ShoppingBagIcon className="h-8 w-8 text-[#FF7D54]" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-2 tracking-tight">
                            Access Your Orders
                        </h2>
                        <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                            Please log in with your Pathfinder student account to view order history, delivery tracking, and official invoices.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setIsLoginModalOpen(true)}
                                className="flex-1 bg-gradient-to-r from-[#FF7D54] to-[#FF6B3D] hover:from-[#FF6B3D] hover:to-[#FF5E5E] text-white py-3.5 px-6 rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                            >
                                Student Login
                            </button>
                            <button
                                onClick={() => navigate('/students-corner')}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 px-6 rounded-2xl font-black uppercase tracking-wider text-xs transition-all"
                            >
                                Browse Materials
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
                        <span>Refresh Orders</span>
                    </button>
                </div>

                {/* Page Title & Support Callout */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#FF7D54] text-[10px] font-black uppercase tracking-wider mb-2">
                            <SparklesIcon className="w-3.5 h-3.5" /> Official Student Dashboard
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight italic">
                            My Orders & Invoices
                        </h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mt-1">
                            Track study materials, books, digital resources & official receipts
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
                        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF7D54]">
                            <PhoneIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Student Helpline</span>
                            <a href="tel:9147178886" className="font-black text-slate-900 text-xs hover:text-[#FF7D54] transition-colors">
                                9147178886
                            </a>
                        </div>
                    </div>
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
                                    Your order has been recorded and is currently being processed.
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
                            const isPaid = isOrderPaid(order);
                            const hasPhysical = orderHasPhysicalItems(order);

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

                                        {/* Status Badges Group */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Payment Status: Paid vs Other */}
                                            {isPaid ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-sm text-xs font-black uppercase tracking-wider">
                                                    <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                                                    <span>PAID</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full shadow-sm text-xs font-black uppercase tracking-wider">
                                                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
                                                    <span>PAYMENT: {order.payment_status?.toUpperCase() || 'PENDING'}</span>
                                                </div>
                                            )}

                                            {/* Asset Type Badge */}
                                            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                {hasPhysical ? (
                                                    <span>📦 Physical</span>
                                                ) : (
                                                    <span>⚡ Digital</span>
                                                )}
                                            </div>

                                            {/* Fulfillment Status */}
                                            <div className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-black uppercase tracking-wider text-slate-700">
                                                {order.status?.toLowerCase() === 'delivered' ? (
                                                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
                                                ) : order.status?.toLowerCase() === 'shipped' ? (
                                                    <TruckIcon className="w-3.5 h-3.5 text-blue-500" />
                                                ) : (
                                                    <ClockIcon className="w-3.5 h-3.5 text-orange-500" />
                                                )}
                                                <span>{order.status || 'Processing'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Physical Delivery Stepper OR Digital Asset Banner */}
                                    {hasPhysical ? (
                                        /* Visual Delivery Stepper ONLY for Physical Assets */
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
                                    ) : (
                                        /* Digital Asset Notice (No Shipped/Delivered stepper shown!) */
                                        <div className="px-6 py-3.5 sm:px-8 border-b border-purple-100 bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-white flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                                                    <SparklesIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-black text-purple-900 block uppercase tracking-wider">
                                                        Digital Learning Asset
                                                    </span>
                                                    <span className="text-[11px] font-semibold text-purple-700">
                                                        Instant digital courseware — physical courier dispatch is not required.
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="hidden sm:inline-flex px-3 py-1 bg-purple-100 text-purple-800 text-[10px] font-black uppercase rounded-lg tracking-wider">
                                                Instant Access
                                            </span>
                                        </div>
                                    )}

                                    {/* Order Content: Items & Address */}
                                    <div className="p-6 sm:p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            {/* Items List */}
                                            <div className="lg:col-span-7 space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                                    <ShoppingBagIcon className="w-3.5 h-3.5" />
                                                    Ordered Items ({order.items?.length || 0})
                                                </h4>

                                                {order.items?.map((item, idx) => {
                                                    const img = item.image || item.image_url || item.img || itemImages[item.id] || itemImages[item.unique_id];
                                                    const isPhys = isItemPhysical(item);

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
                                                                <div className="flex items-center gap-2">
                                                                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                                                                        {item.name}
                                                                    </h5>
                                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                                                        isPhys ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                                                    }`}>
                                                                        {isPhys ? 'Physical' : 'Digital'}
                                                                    </span>
                                                                </div>
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

                                            {/* Delivery / Fulfillment Details */}
                                            <div className="lg:col-span-5 bg-slate-50/70 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
                                                        {hasPhysical ? 'Delivery Details' : 'Fulfillment Details'}
                                                    </h4>
                                                    <div className="space-y-1.5 text-xs">
                                                        <p className="font-bold text-slate-900">{order.full_name || user?.fullName}</p>
                                                        {hasPhysical ? (
                                                            order.delivery_address && (
                                                                <p className="text-slate-600 font-medium leading-relaxed">
                                                                    {order.delivery_address.area}
                                                                    {order.delivery_address.school && `, ${order.delivery_address.school}`}
                                                                    {order.delivery_address.board && ` (${order.delivery_address.board})`}
                                                                </p>
                                                            )
                                                        ) : (
                                                            <p className="text-purple-700 font-semibold leading-relaxed">
                                                                Access enabled on Pathfinder Digital Portal for {order.email || user?.email}
                                                            </p>
                                                        )}
                                                        <p className="text-slate-500 font-semibold">
                                                            Phone: {order.phone || user?.phone || 'On file'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Action Bar: View Order Details + Official Receipt */}
                                                <div className="mt-6 pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
                                                    {/* View Order Details Button (Always available) */}
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
                                                    >
                                                        <EyeIcon className="w-3.5 h-3.5" />
                                                        <span>View Order Details</span>
                                                    </button>

                                                    {/* Receipt Button: Shown ONLY IF order is PAID */}
                                                    {isPaid ? (
                                                        <button
                                                            onClick={() => handleDownloadOrderReceipt(order)}
                                                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-orange-600 hover:bg-orange-50 hover:border-orange-300 text-xs font-bold rounded-xl border border-orange-200 shadow-sm transition-all active:scale-95"
                                                            title="Download official tax invoice"
                                                        >
                                                            <PrinterIcon className="w-3.5 h-3.5" />
                                                            <span>Official Receipt</span>
                                                        </button>
                                                    ) : (
                                                        <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                                                            <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-500" />
                                                            <span>Receipt locked (Unpaid)</span>
                                                        </div>
                                                    )}
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

            {/* View Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-7 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 block mb-1">
                                        Order Breakdown & Particulars
                                    </span>
                                    <h3 className="text-xl font-black tracking-tight">
                                        Order #{selectedOrder.payment_id || selectedOrder.id}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Placed on {formatDate(selectedOrder.created_at)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 sm:p-7 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* Status Summary Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                                            Payment Status
                                        </span>
                                        {isOrderPaid(selectedOrder) ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                                                <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                                                PAID (Confirmed)
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase">
                                                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
                                                {selectedOrder.payment_status?.toUpperCase() || 'PAYMENT PENDING'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                                            Asset Category
                                        </span>
                                        {orderHasPhysicalItems(selectedOrder) ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase">
                                                <TruckIcon className="w-4 h-4 text-blue-600" />
                                                Physical Shipment
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase">
                                                <SparklesIcon className="w-4 h-4 text-purple-600" />
                                                Instant Digital Asset
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Items Itemized List */}
                                <div>
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                                        Ordered Products ({selectedOrder.items?.length || 0})
                                    </h4>
                                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                                        {selectedOrder.items?.map((item, idx) => {
                                            const img = item.image || item.image_url || item.img || itemImages[item.id] || itemImages[item.unique_id];
                                            const isPhys = isItemPhysical(item);
                                            const lineTotal = ((parseFloat(item.price) || 0) * (item.quantity || 1)).toLocaleString('en-IN');

                                            return (
                                                <div key={idx} className="p-3.5 bg-white flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1 flex-shrink-0">
                                                            {img ? (
                                                                <img src={img} alt={item.name} className="w-full h-full object-contain" />
                                                            ) : (
                                                                <ShoppingBagIcon className="w-5 h-5 text-slate-300" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h5 className="text-xs font-black text-slate-900">{item.name}</h5>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[11px] font-semibold text-slate-500">
                                                                    ₹{item.price} × {item.quantity || 1}
                                                                </span>
                                                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                                                    isPhys ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                                                }`}>
                                                                    {isPhys ? 'Physical' : 'Digital'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900">
                                                        ₹{lineTotal}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Delivery / Student Information */}
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                                        Customer & Destination Particulars
                                    </span>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Student Name:</span>
                                        <span className="font-bold text-slate-900">{selectedOrder.full_name || user?.fullName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Contact Phone:</span>
                                        <span className="font-bold text-slate-900">{selectedOrder.phone || user?.phone || 'On file'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Email Address:</span>
                                        <span className="font-bold text-slate-900">{selectedOrder.email || user?.email || 'N/A'}</span>
                                    </div>
                                    {orderHasPhysicalItems(selectedOrder) && selectedOrder.delivery_address && (
                                        <div className="flex justify-between pt-1 border-t border-slate-200/60">
                                            <span className="text-slate-500">Shipping Address:</span>
                                            <span className="font-bold text-slate-900 text-right">
                                                {selectedOrder.delivery_address.area}
                                                {selectedOrder.delivery_address.school && `, ${selectedOrder.delivery_address.school}`}
                                                {selectedOrder.delivery_address.board && ` (${selectedOrder.delivery_address.board})`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Financial Summary */}
                                <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-1.5 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Items Subtotal:</span>
                                        <span className="font-bold">₹{selectedOrder.total_amount?.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Shipping & Handling:</span>
                                        <span className="font-bold text-emerald-600">FREE</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-orange-200">
                                        <span>Total Amount:</span>
                                        <span className="text-[#FF7D54]">₹{selectedOrder.total_amount?.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                {/* Support & Disclaimer Note */}
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                                    <strong>⚠️ Auto-Generated Notification:</strong> This is a system-generated order view. Please don't reply directly to notifications. For assistance, contact our student support desk at <strong>9147178886</strong>.
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                {isOrderPaid(selectedOrder) ? (
                                    <button
                                        onClick={() => handleDownloadOrderReceipt(selectedOrder)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-md transition-all active:scale-95"
                                    >
                                        <PrinterIcon className="w-4 h-4" />
                                        Download Official Invoice
                                    </button>
                                ) : (
                                    <span className="text-xs font-bold text-amber-700">
                                        ⚠️ Payment not completed. Receipt unavailable.
                                    </span>
                                )}

                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black rounded-xl uppercase tracking-wider transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentCornerOrders;
