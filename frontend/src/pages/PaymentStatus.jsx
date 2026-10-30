import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Download, 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  Calendar, 
  Receipt, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  Send,
  Check,
  AlertCircle
} from 'lucide-react';
import { centresAPI, invoiceAPI } from '../services/api';

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
  } catch (e) {
    return `${amt} Rupees Only`;
  }
};

const PaymentStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const status = searchParams.get('status') || '0000';
  const txnNo = searchParams.get('txnNo') || `TXN${Date.now()}`;
  const amount = searchParams.get('amount') || '10.00';
  const rawName = searchParams.get('name') || '';
  const customerName = (rawName && rawName !== 'Referred Student' && rawName !== 'Student') ? rawName : 'Pathfinder Student';
  const customerEmail = searchParams.get('email') || '';
  const customerPhone = searchParams.get('phone') || searchParams.get('mobile') || '';
  const courseName = searchParams.get('course') || 'CBSE Mock Test Program 2';

  const isSuccess = status === '0000' || status === '00' || status === 'SUCCESS' || status === '0';

  const [centres, setCentres] = useState([]);
  const [loadingCentres, setLoadingCentres] = useState(true);

  // Email status states
  const [emailStatus, setEmailStatus] = useState('idle'); // idle, sending, sent, error
  const [emailTarget, setEmailTarget] = useState(customerEmail || '');
  const [emailFeedback, setEmailFeedback] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const emailSentRef = useRef(false);

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const res = await centresAPI.getAll();
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setCentres(data);
      } catch (err) {
        console.error("Error fetching centres:", err);
      } finally {
        setLoadingCentres(false);
      }
    };
    fetchCentres();
  }, []);

  // Automatically trigger email sending if student email is present upon success
  useEffect(() => {
    if (isSuccess && customerEmail && !emailSentRef.current) {
      emailSentRef.current = true;
      setEmailStatus('sending');
      invoiceAPI.sendInvoiceEmail({
        email: customerEmail,
        name: customerName,
        txnNo,
        amount,
        course: courseName,
        phone: customerPhone
      })
      .then(() => {
        setEmailStatus('sent');
        setEmailFeedback(`Official invoice emailed to ${customerEmail}`);
      })
      .catch((err) => {
        console.error("Auto email invoice failed:", err);
        setEmailStatus('idle');
      });
    }
  }, [isSuccess, customerEmail, customerName, txnNo, amount, courseName, customerPhone]);

  const handleSendManualEmail = async (targetEmail) => {
    const to = targetEmail || emailTarget || customerEmail;
    if (!to || !to.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }
    setEmailStatus('sending');
    try {
      await invoiceAPI.sendInvoiceEmail({
        email: to,
        name: customerName,
        txnNo,
        amount,
        course: courseName,
        phone: customerPhone
      });
      setEmailStatus('sent');
      setEmailFeedback(`Official invoice emailed successfully to ${to}`);
      setShowEmailModal(false);
    } catch (err) {
      console.error("Manual invoice email error:", err);
      setEmailStatus('error');
      setEmailFeedback("Failed to send email. Please verify the address and try again.");
    }
  };

  const handleDownloadReceipt = () => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    const formattedAmount = parseFloat(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const amountInWords = numberToWords(amount);
    const currentDateStr = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Official Fee Receipt & Tax Invoice - Pathfinder Educational Centre</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * {
            box-sizing: border-box;
          }
          body { 
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
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
          
          /* Top Institutional Header */
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
            letter-spacing: 0.3px;
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

          /* Receipt Tag Box */
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

          /* Content Area */
          .content-wrap {
            padding: 30px 36px 36px 36px;
          }

          /* 2-column Student and Course Meta */
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
            display: flex;
            align-items: center;
            gap: 6px;
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
          .meta-row:last-child {
            margin-bottom: 0;
          }
          .meta-label {
            color: #64748B;
            font-weight: 600;
            flex-shrink: 0;
            margin-right: 8px;
          }
          .meta-val {
            color: #0F172A;
            font-weight: 800;
            text-align: right;
            word-break: break-word;
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

          /* Program Schedule Table */
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
          .items-table th.text-right {
            text-align: right;
          }
          .items-table th.text-center {
            text-align: center;
          }
          .items-table td {
            padding: 14px;
            font-size: 12.5px;
            color: #1E293B;
            border-bottom: 1px solid #E2E8F0;
            background: #FFFFFF;
          }
          .items-table td.text-right {
            text-align: right;
          }
          .items-table td.text-center {
            text-align: center;
          }
          .items-table tr:last-child td {
            border-bottom: none;
          }

          /* Total Breakdown Box */
          .total-wrapper {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 26px;
          }
          .total-box {
            width: 360px;
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
            margin-top: 6px;
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

          /* Verification Stamp & Signatory */
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
            letter-spacing: 0.5px;
          }
          .signatory-sub {
            font-size: 10px;
            color: #64748B;
            margin-top: 2px;
          }

          /* Mandatory Notices and Helpline */
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
            letter-spacing: 0.5px;
          }

          /* Receipt Footer */
          .inst-footer {
            background: #0F172A;
            color: #94A3B8;
            padding: 18px 36px;
            font-size: 10.5px;
            text-align: center;
            line-height: 1.6;
          }
          .inst-footer a {
            color: #FF7D54;
            text-decoration: none;
          }

          /* Print / PDF Button Toolbar */
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
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
          }
          .btn-print:hover {
            transform: translateY(-1px);
            box-shadow: 0 12px 24px rgba(238, 70, 0, 0.45);
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
            font-family: inherit;
          }

          @media print {
            body { 
              padding: 0; 
              background: #FFFFFF; 
            }
            .invoice-sheet { 
              box-shadow: none; 
              border: 1px solid #CBD5E1; 
              border-radius: 0;
              max-width: 100%;
            }
            .no-print { 
              display: none !important; 
            }
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-sheet">
          <!-- Institutional Header -->
          <div class="inst-header">
            <div class="brand-col">
              <img src="https://pathfinder.edu.in/images/icon/logo-1.svg" alt="Pathfinder Educational Centre" class="logo-img" />
              <div class="inst-info">
                <h1>PATHFINDER EDUCATIONAL CENTRE LLP</h1>
                <p>Premier Coaching for JEE (Main & Adv) | NEET | WBJEE | Foundation | Boards</p>
                <p>Head Office: 96K, Shyama Prasad Mukherjee Road, Hazra, Kolkata - 700026</p>
                <div class="contacts">
                  📞 Student Helpline: 9147178886 &nbsp;|&nbsp; ✉️ support@pathfinder.edu.in &nbsp;|&nbsp; 🌐 pathfinder.edu.in
                </div>
              </div>
            </div>
            <div class="receipt-tag-box">
              <div class="receipt-badge">FEE RECEIPT & TAX INVOICE</div>
              <p class="receipt-num">Receipt #${txnNo}</p>
              <p class="receipt-date">${currentDateStr}</p>
            </div>
          </div>

          <div class="content-wrap">
            <!-- 2-Column Student & Academic Meta -->
            <div class="meta-grid">
              <!-- Student Particulars -->
              <div class="meta-card">
                <div class="meta-card-title">
                  👤 Student Particulars
                </div>
                <div class="meta-row">
                  <span class="meta-label">Student Name:</span>
                  <span class="meta-val">${customerName}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Contact Number:</span>
                  <span class="meta-val">${customerPhone || 'N/A'}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Email Address:</span>
                  <span class="meta-val">${customerEmail || 'N/A'}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Student Reg. Ref:</span>
                  <span class="meta-val">${txnNo}</span>
                </div>
              </div>

              <!-- Academic Program & Transaction -->
              <div class="meta-card">
                <div class="meta-card-title">
                  🎓 Academic & Payment Summary
                </div>
                <div class="meta-row">
                  <span class="meta-label">Academic Program:</span>
                  <span class="meta-val" style="color:#EE4600;">${courseName}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Academic Session:</span>
                  <span class="meta-val">2026 - 2027</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Payment Gateway:</span>
                  <span class="meta-val">ICICI 3D Secure / Online</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Payment Status:</span>
                  <span class="meta-val"><span class="badge-paid">✓ PAID & VERIFIED</span></span>
                </div>
              </div>
            </div>

            <!-- Itemized Course Fee Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 8%;" class="text-center">Sl.</th>
                  <th style="width: 52%;">Description of Academic Program / Courseware</th>
                  <th style="width: 14%;" class="text-center">SAC Code</th>
                  <th style="width: 8%;" class="text-center">Qty</th>
                  <th style="width: 18%;" class="text-right">Total Net (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-center">01</td>
                  <td>
                    <strong>${courseName}</strong><br>
                    <span style="font-size: 11px; color: #64748B;">Comprehensive Learning Material, Question Banks & Academic Support Access</span>
                  </td>
                  <td class="text-center">999293</td>
                  <td class="text-center">1</td>
                  <td class="text-right"><strong>₹${formattedAmount}</strong></td>
                </tr>
              </tbody>
            </table>

            <!-- Total Amount Card -->
            <div class="total-wrapper">
              <div class="total-box">
                <table class="total-table">
                  <tr>
                    <td style="color:#64748B;">Course Fee Subtotal:</td>
                    <td style="text-align:right; font-weight:700;">₹${formattedAmount}</td>
                  </tr>
                  <tr>
                    <td style="color:#64748B;">Taxes & GST (Inclusive):</td>
                    <td style="text-align:right; font-weight:700;">₹0.00</td>
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

            <!-- Verification & Digital Seal -->
            <div class="auth-grid">
              <div class="seal-wrap">
                <div class="seal-badge">✓</div>
                <div class="seal-text">
                  <strong>PATHFINDER ACCOUNTS & ADMISSIONS CELL</strong>
                  Digitally Authenticated & Gateway Validated
                </div>
              </div>
              <div class="signatory-box">
                <div class="signatory-stamp">Authorized Signatory</div>
                <div class="signatory-sub">Pathfinder Educational Centre LLP (Computer Generated Receipt)</div>
              </div>
            </div>

            <!-- Notice & Disclaimers -->
            <div class="notice-panel">
              <strong>⚠️ Auto-Generated Notification:</strong>
              This is an automatically generated official receipt from the Pathfinder portal. <strong>Please do not reply directly to this mail/receipt</strong> as incoming messages are not monitored.
            </div>

            <div class="helpline-panel">
              <div>
                <strong>Need assistance regarding batch allocation or study material collection?</strong><br>
                Our student counseling & support desk is available to assist you.
              </div>
              <div>
                <a href="tel:9147178886" class="helpline-link">📞 9147178886</a>
              </div>
            </div>
          </div>

          <!-- Institutional Footer -->
          <div class="inst-footer">
            <strong>PATHFINDER EDUCATIONAL CENTRE LLP</strong> — Shaping Medical & Engineering Careers for Over 3 Decades<br>
            Corporate HQ: 96K, S. P. Mukherjee Road, Hazra, Kolkata - 700026, West Bengal | Helpline: 9147178886 | Email: support@pathfinder.edu.in<br>
            &copy; ${new Date().getFullYear()} Pathfinder Educational Centre. All Rights Reserved. Computer Generated Official Tax Invoice.
          </div>
        </div>

        <!-- Print Action Toolbar -->
        <div class="action-toolbar no-print">
          <button onclick="window.print()" class="btn-print">
            🖨️ Print / Save Official Invoice (PDF)
          </button>
          <button onclick="window.close()" class="btn-close">
            Close Window
          </button>
        </div>
      </body>
      </html>
    `;

    receiptWindow.document.write(htmlContent);
    receiptWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Status Card */}
        {isSuccess ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-8 text-white text-center relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-8 -translate-y-8">
                <Sparkles className="w-48 h-48" />
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md ring-8 ring-white/10 animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-wider mb-3 shadow-md">
                <ShieldCheck className="w-4 h-4" /> Payment Status: Paid & Verified
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Enrollment Successful!</h1>
              <p className="text-orange-100 font-medium max-w-lg mx-auto text-sm sm:text-base">
                Welcome <span className="font-bold text-white underline decoration-orange-300">{customerName}</span>! You have successfully enrolled in <span className="font-bold text-white">{courseName}</span>.
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Receipt Summary Box */}
              <div className="bg-gradient-to-br from-orange-50/70 to-amber-50/40 p-6 rounded-2xl border-2 border-orange-200/80 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-orange-200/60 pb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://pathfinder.edu.in/images/icon/logo-1.svg" 
                      alt="Pathfinder" 
                      className="h-8 max-w-[140px] object-contain bg-white px-2 py-1 rounded-lg border border-orange-200" 
                    />
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-1.5">
                      <Receipt className="w-5 h-5 text-orange-600" />
                      Official Fee Receipt Summary
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-black rounded-full tracking-wide">
                    PAID
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Student Name</span>
                    <span className="text-sm font-black text-gray-900">{customerName}</span>
                  </div>
                  {customerPhone && (
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Contact Number</span>
                      <span className="text-sm font-black text-gray-900">{customerPhone}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Transaction ID</span>
                    <span className="text-sm font-black text-gray-900 break-all">{txnNo}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Amount Paid</span>
                    <span className="text-base font-black text-orange-600">₹{amount}</span>
                  </div>
                </div>

                {/* Email Delivery Feedback Banner */}
                {emailFeedback && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-800 text-xs font-semibold">
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      {emailFeedback}
                    </span>
                    <button 
                      onClick={() => setShowEmailModal(true)}
                      className="text-emerald-700 underline hover:text-emerald-900 text-[11px] font-bold"
                    >
                      Send to Another Email
                    </button>
                  </div>
                )}

                {/* Auto Generated Disclaimer & Contact Info */}
                <div className="pt-2 border-t border-orange-200/60 text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>Auto-generated invoice. Please don't reply to notification emails.</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-orange-600">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Student Helpline: 9147178886</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 text-sm uppercase tracking-wider"
                >
                  <Download className="w-5 h-5" />
                  Download Official Invoice PDF
                </button>

                <button
                  onClick={() => setShowEmailModal(true)}
                  disabled={emailStatus === 'sending'}
                  className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-orange-50 text-orange-600 font-black rounded-2xl border-2 border-orange-200 shadow-sm transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                  <Mail className="w-5 h-5" />
                  {emailStatus === 'sending' ? 'Sending Invoice...' : 'Email Invoice'}
                </button>

                {(courseName?.toLowerCase().includes('student') || courseName?.toLowerCase().includes('corner') || localStorage.getItem('student_corner_last_order')) && (
                  <button
                    onClick={() => navigate('/students-corner/orders')}
                    className="w-full sm:w-auto px-8 py-4 bg-[#FF7D54] hover:bg-[#FF6B3D] text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 text-sm uppercase tracking-wider"
                  >
                    View My Orders
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                  Go To Homepage
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Email Send Modal / Popover */}
              {showEmailModal && (
                <div className="p-4 bg-orange-50/70 border-2 border-orange-200 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Recipient Email Address
                    </label>
                    <input
                      type="email"
                      value={emailTarget}
                      onChange={(e) => setEmailTarget(e.target.value)}
                      placeholder="Enter student or parent email"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto sm:self-end">
                    <button
                      onClick={() => handleSendManualEmail(emailTarget)}
                      disabled={emailStatus === 'sending'}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      {emailStatus === 'sending' ? 'Sending...' : 'Send Invoice'}
                    </button>
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-red-100 text-center p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <XCircle className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Unsuccessful</h1>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              We couldn't process your payment. If any amount was deducted, it will be refunded automatically by your bank within 3-5 business days.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}

        {/* Visit Nearest Centre Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-gray-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              Offline Verification & ID Card Collect
            </div>
            <h2 className="text-2xl md:text-3xl font-black">Visit Your Nearest Pathfinder Centre</h2>
            <p className="text-gray-300 text-sm max-w-xl">
              Show your downloaded payment receipt at any Pathfinder offline centre to collect your test material, schedule guide, and student ID card.
            </p>
          </div>
          {isSuccess && (
            <button
              onClick={handleDownloadReceipt}
              className="px-6 py-3 bg-white text-gray-900 font-extrabold rounded-xl hover:bg-orange-50 transition-all flex items-center gap-2 whitespace-nowrap text-sm shadow-lg"
            >
              <Download className="w-4 h-4 text-orange-600" />
              Download Receipt
            </button>
          )}
        </div>

        {/* All Centres List Section */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900">Pathfinder Offline Centres</h3>
              <p className="text-gray-500 text-sm">Find your nearest branch in West Bengal</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
              <MapPin className="w-4 h-4" />
              {centres.length || 20}+ Centres Available
            </div>
          </div>

          {loadingCentres ? (
            <div className="py-12 text-center text-gray-400 font-medium">Loading centre lists...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {centres.map((centre, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-orange-50/50 hover:border-orange-200 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {centre.centre || centre.name}
                      </h4>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white text-gray-500 border border-gray-200">
                        {centre.district || 'WB'}
                      </span>
                    </div>
                    {centre.address && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {centre.address}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1 font-semibold text-gray-700">
                      <Phone className="w-3.5 h-3.5 text-orange-500" />
                      {centre.phone || centre.contact_no || '84430 75751'}
                    </span>
                    {(centre.map_url || centre.google_map_url) && (
                      <a
                        href={centre.map_url || centre.google_map_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 hover:underline"
                      >
                        Map <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PaymentStatus;
