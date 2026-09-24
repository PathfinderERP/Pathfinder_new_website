import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { centresAPI } from '../services/api';

const PaymentStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const status = searchParams.get('status') || '0000';
  const txnNo = searchParams.get('txnNo') || `TXN${Date.now()}`;
  const amount = searchParams.get('amount') || '10.00';
  const customerName = searchParams.get('name') || 'Student';
  const customerEmail = searchParams.get('email') || '';
  const courseName = searchParams.get('course') || 'CBSE Mock Test Program 2';

  const isSuccess = status === '0000' || status === '00' || status === 'SUCCESS' || status === '0';

  const [centres, setCentres] = useState([]);
  const [loadingCentres, setLoadingCentres] = useState(true);

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

  const handleDownloadReceipt = () => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Invoice - Pathfinder Academy</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: #fafafa; }
          .invoice-box { max-width: 650px; margin: 0 auto; border: 2px solid #EE4600; padding: 35px; border-radius: 16px; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 25px; }
          .header h1 { color: #EE4600; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px; }
          .header p { color: #666; margin-top: 5px; font-size: 13px; font-weight: 600; text-transform: uppercase; }
          .section-title { font-size: 14px; font-weight: 800; color: #EE4600; text-transform: uppercase; margin: 20px 0 10px 0; letter-spacing: 0.5px; border-bottom: 1px solid #fee2e2; padding-bottom: 5px; }
          .details-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px dashed #f0f0f0; font-size: 14px; }
          .label { font-weight: 600; color: #666; }
          .value { font-weight: 700; color: #111; }
          .status-badge { background: #10B981; color: white; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; }
          .total-box { background: #fff7ed; border: 1px solid #ffedd5; padding: 15px; border-radius: 12px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
          .total-title { font-size: 16px; font-weight: 800; color: #9a3412; }
          .total-amount { font-size: 22px; font-weight: 900; color: #EE4600; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; leading-height: 1.6; }
          @media print {
            body { padding: 0; background: #fff; }
            .invoice-box { border: none; box-shadow: none; padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <h1>PATHFINDER ACADEMY</h1>
            <p>Official Payment Invoice & Receipt</p>
          </div>
          
          <div class="section-title">Payment Overview</div>
          <div class="details-row">
            <span class="label">Invoice / Txn Reference</span>
            <span class="value">${txnNo}</span>
          </div>
          <div class="details-row">
            <span class="label">Payment Status</span>
            <span class="status-badge">0000 SUCCESS</span>
          </div>
          <div class="details-row">
            <span class="label">Date & Time</span>
            <span class="value">${new Date().toLocaleString()}</span>
          </div>

          <div class="section-title">Student & Registration Details</div>
          <div class="details-row">
            <span class="label">Student Name</span>
            <span class="value">${customerName}</span>
          </div>
          ${customerEmail ? `
          <div class="details-row">
            <span class="label">Registered Email</span>
            <span class="value">${customerEmail}</span>
          </div>` : ''}
          <div class="details-row">
            <span class="label">Enrolled Program</span>
            <span class="value">${courseName}</span>
          </div>

          <div class="total-box">
            <span class="total-title">Total Amount Paid</span>
            <span class="total-amount">₹${amount}</span>
          </div>

          <div class="footer">
            <p><strong>Verification Notice:</strong> Present this invoice at any Pathfinder Offline Centre to claim physical test series papers and student ID.</p>
            <p>This is an automated computer-generated payment invoice.</p>
          </div>
        </div>
        <br/>
        <div style="text-align: center;" class="no-print">
          <button onclick="window.print()" style="background: #EE4600; color: white; border: none; padding: 14px 28px; font-weight: 800; border-radius: 10px; cursor: pointer; font-size: 15px; box-shadow: 0 4px 14px rgba(238,70,0,0.3);">Print / Download Invoice PDF</button>
        </div>
      </body>
      </html>
    `;

    receiptWindow.document.write(htmlContent);
    receiptWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Status Card */}
        {isSuccess ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100">
            <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-8 text-white text-center relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-8 -translate-y-8">
                <Sparkles className="w-48 h-48" />
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md ring-8 ring-white/10 animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-black mb-2">Payment Confirmed & Invoiced!</h1>
              <p className="text-emerald-100 font-medium max-w-md mx-auto">
                Thank you, <span className="font-bold text-white">{customerName}</span>. Your enrollment for <span className="font-bold text-white">{courseName}</span> is active.
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-orange-600" />
                  Official Student Invoice Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Student Name</span>
                    <span className="text-sm font-black text-gray-800">{customerName}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Transaction ID</span>
                    <span className="text-sm font-black text-gray-800 break-all">{txnNo}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Amount Paid</span>
                    <span className="text-sm font-black text-green-600">₹{amount}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Status</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> 0000 SUCCESS
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <Download className="w-5 h-5" />
                  DOWNLOAD INVOICE PDF
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  GO TO HOMEPAGE
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
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
