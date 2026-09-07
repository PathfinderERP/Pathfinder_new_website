import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Key, 
  ShieldCheck, 
  Terminal, 
  Send, 
  RefreshCw, 
  Play, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  HelpCircle, 
  ArrowRight,
  Code,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Globe,
  QrCode,
  RotateCcw,
  Search
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const ICICIPaymentDemo = () => {
  const [activeTab, setActiveTab] = useState('initiateSale'); // initiateSale, generateOTP, verifyOTP, authorize, statusCheck, refund, generateQR, userCancel, cardBin, serviceCharges

  // Default credentials provided in prompt
  const [credentials, setCredentials] = useState({
    merchantId: '100000000007164',
    aggregatorID: 'A100000000007164',
    secretKey: 'db06cca0-838b-4e01-8b20-6ac446ffb6bd',
    saleUrl: 'https://pgpayuat.icici.bank.in/tsp/pg/api/v2/initiateSale',
    commandUrl: 'https://pgpayuat.icici.bank.in/tsp/pg/api/command',
    qrUrl: 'https://pgpayuat.icicibank.com/tsp/pg/api/generateQR',
    cancelUrl: 'https://pgpayuat.icicibank.com/tsp/pg/api/userCancel',
    cardBinUrl: 'https://pgpayuat.icicibank.com/tsp/pg/api/getCardBin',
    serviceChargesUrl: 'https://pgpayuat.icicibank.com/tsp/pg/api/getServiceCharges'
  });

  // State for Initiate Sale Form
  const [saleForm, setSaleForm] = useState({
    payType: '0', // 0 = Standard (Redirect), 1 = Direct (Seamless)
    transactionType: 'SALE',
    amount: '100.00',
    currencyCode: '356',
    customerEmailID: 'test@gmail.com',
    customerMobileNo: '917709356600',
    customerName: 'Test',
    merchantTxnNo: `TXN${Date.now()}`,
    returnURL: 'https://pgpayuat.icicibank.com/tsp/pg/api/merchant',
    txnDate: new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14),
    addlParam1: '000',
    addlParam2: '111',
    paymentMode: '', // CARD, NB, WALLET, UPI
    cardNo: '476134000000035',
    cardExpiry: '202609',
    nameOnCard: 'Test',
    cvv: '123',
    customerUPIAlias: 'test@ybl'
  });

  // State for status check & refund
  const [commandForm, setCommandForm] = useState({
    merchantTxnNo: `REF${Date.now().toString().slice(-6)}`,
    originalTxnNo: '',
    transactionType: 'STATUS', // STATUS, REFUND
    amount: '10.00',
    addlParam1: 'Additional Info'
  });

  // State for Seamless Flow Steps
  const [seamlessState, setSeamlessState] = useState({
    tranCtx: '',
    redirectURI: '',
    showOTPCapturePage: 'N',
    generateOTPURI: '',
    verifyOTPURI: '',
    authorizeURI: '',
    otp: '123456',
    step: 1 // 1: initiateSale, 2: generateOTP, 3: verifyOTP, 4: authorize
  });

  // State for Generate QR
  const [qrForm, setQrForm] = useState({
    merchantRefNo: `QR${Date.now().toString().slice(-6)}`,
    amount: '40.00',
    currency: '356',
    mobileNo: '8208191623',
    emailID: 'test@gmail.com',
    requestType: 'UPIQR',
    customerID: 'CSDRR1',
    invoiceDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    accountNo: '001701378981',
    accountIFSC: 'ICIC0000017'
  });

  // Secure Hash Live Calculation state
  const [hashCalculation, setHashCalculation] = useState({
    hashText: '',
    sortedKeys: [],
    secureHash: '',
    minifiedJson: '',
    loading: false
  });

  const [apiResponse, setApiResponse] = useState(null);
  const [rawCurlCommand, setRawCurlCommand] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-generate fresh transaction ID
  const generateNewTxnNo = () => {
    const newTxn = `TXN${Date.now()}`;
    setSaleForm(prev => ({ ...prev, merchantTxnNo: newTxn, txnDate: new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14) }));
  };

  // Recalculate hash automatically whenever saleForm or credentials change
  useEffect(() => {
    if (activeTab === 'initiateSale') {
      calculateHashV1();
    } else if (['statusCheck', 'refund'].includes(activeTab)) {
      calculateCommandHash();
    } else if (activeTab === 'generateQR') {
      calculateQRHash();
    }
  }, [saleForm, commandForm, qrForm, credentials, activeTab]);

  const calculateHashV1 = async () => {
    try {
      setHashCalculation(prev => ({ ...prev, loading: true }));
      // Filter out empty params
      const params = {
        merchantId: credentials.merchantId,
        aggregatorID: credentials.aggregatorID,
        merchantTxnNo: saleForm.merchantTxnNo,
        amount: saleForm.amount,
        currencyCode: saleForm.currencyCode,
        payType: saleForm.payType,
        customerEmailID: saleForm.customerEmailID,
        transactionType: saleForm.transactionType,
        returnURL: saleForm.returnURL,
        txnDate: saleForm.txnDate,
        customerMobileNo: saleForm.customerMobileNo,
        customerName: saleForm.customerName,
        addlParam1: saleForm.addlParam1,
        addlParam2: saleForm.addlParam2
      };

      if (saleForm.paymentMode) params.paymentMode = saleForm.paymentMode;
      if (saleForm.payType === '1' && saleForm.paymentMode === 'CARD') {
        params.cardNo = saleForm.cardNo;
        params.cardExpiry = saleForm.cardExpiry;
        params.nameOnCard = saleForm.nameOnCard;
        params.cvv = saleForm.cvv;
      }
      if (saleForm.payType === '1' && saleForm.paymentMode === 'UPI') {
        params.customerUPIAlias = saleForm.customerUPIAlias;
      }

      const res = await axios.post(`${API_BASE_URL}/api/courses/icici/generate-hash/`, {
        mode: 'v1',
        secretKey: credentials.secretKey,
        params
      });

      if (res.data.success) {
        setHashCalculation({
          hashText: res.data.hashText,
          sortedKeys: res.data.sortedKeys,
          secureHash: res.data.secureHash,
          minifiedJson: '',
          loading: false
        });

        // Generate Curl Command Preview
        const curlData = { ...params, secureHash: res.data.secureHash };
        let curlStr = `curl --location '${credentials.saleUrl}' \\\n--header 'Content-Type: application/json' \\\n--data '${JSON.stringify(curlData, null, 2)}'`;
        setRawCurlCommand(curlStr);
      }
    } catch (err) {
      console.error("Hash calculation error", err);
      setHashCalculation(prev => ({ ...prev, loading: false }));
    }
  };

  const calculateCommandHash = async () => {
    try {
      const params = {
        merchantId: credentials.merchantId,
        aggregatorID: credentials.aggregatorID,
        merchantTxnNo: commandForm.merchantTxnNo,
        originalTxnNo: commandForm.originalTxnNo || commandForm.merchantTxnNo,
        transactionType: commandForm.transactionType
      };
      if (commandForm.transactionType === 'REFUND' || commandForm.amount) {
        params.amount = commandForm.amount;
      }
      if (commandForm.addlParam1) params.addlParam1 = commandForm.addlParam1;

      const res = await axios.post(`${API_BASE_URL}/api/courses/icici/generate-hash/`, {
        mode: 'v1',
        secretKey: credentials.secretKey,
        params
      });

      if (res.data.success) {
        setHashCalculation({
          hashText: res.data.hashText,
          sortedKeys: res.data.sortedKeys,
          secureHash: res.data.secureHash,
          minifiedJson: '',
          loading: false
        });

        const curlParams = new URLSearchParams({ ...params, secureHash: res.data.secureHash }).toString();
        let curlStr = `curl --location '${credentials.commandUrl}' \\\n--header 'Content-Type: application/x-www-form-urlencoded' \\\n--data-urlencode '${curlParams.replace(/&/g, "' \\\n--data-urlencode '")}'`;
        setRawCurlCommand(curlStr);
      }
    } catch (err) {
      console.error("Command hash calculation error", err);
    }
  };

  const calculateQRHash = async () => {
    try {
      const params = {
        merchantId: credentials.merchantId,
        aggregatorID: credentials.aggregatorID,
        merchantRefNo: qrForm.merchantRefNo,
        amount: qrForm.amount,
        currency: qrForm.currency,
        mobileNo: qrForm.mobileNo,
        emailID: qrForm.emailID,
        requestType: qrForm.requestType,
        customerID: qrForm.customerID,
        invoiceDate: qrForm.invoiceDate,
        accountNo: qrForm.accountNo,
        accountIFSC: qrForm.accountIFSC
      };

      const res = await axios.post(`${API_BASE_URL}/api/courses/icici/generate-hash/`, {
        mode: 'v1',
        secretKey: credentials.secretKey,
        params
      });

      if (res.data.success) {
        setHashCalculation({
          hashText: res.data.hashText,
          sortedKeys: res.data.sortedKeys,
          secureHash: res.data.secureHash,
          minifiedJson: '',
          loading: false
        });

        const curlParams = new URLSearchParams({ ...params, secureHash: res.data.secureHash }).toString();
        let curlStr = `curl --location '${credentials.qrUrl}' \\\n--header 'Content-Type: application/x-www-form-urlencoded' \\\n--data-urlencode '${curlParams.replace(/&/g, "' \\\n--data-urlencode '")}'`;
        setRawCurlCommand(curlStr);
      }
    } catch (err) {
      console.error("QR Hash calculation error", err);
    }
  };

  // Submit Handler for Initiate Sale Call
  const handleInitiateSaleSubmit = async (e) => {
    e.preventDefault();
    setApiResponse({ loading: true });

    const payload = {
      merchantId: credentials.merchantId,
      aggregatorID: credentials.aggregatorID,
      merchantTxnNo: saleForm.merchantTxnNo,
      amount: saleForm.amount,
      currencyCode: saleForm.currencyCode,
      payType: saleForm.payType,
      customerEmailID: saleForm.customerEmailID,
      transactionType: saleForm.transactionType,
      returnURL: saleForm.returnURL,
      txnDate: saleForm.txnDate,
      customerMobileNo: saleForm.customerMobileNo,
      customerName: saleForm.customerName,
      addlParam1: saleForm.addlParam1,
      addlParam2: saleForm.addlParam2,
      secureHash: hashCalculation.secureHash
    };

    if (saleForm.paymentMode) payload.paymentMode = saleForm.paymentMode;
    if (saleForm.payType === '1' && saleForm.paymentMode === 'CARD') {
      payload.cardNo = saleForm.cardNo;
      payload.cardExpiry = saleForm.cardExpiry;
      payload.nameOnCard = saleForm.nameOnCard;
      payload.cvv = saleForm.cvv;
    }
    if (saleForm.payType === '1' && saleForm.paymentMode === 'UPI') {
      payload.customerUPIAlias = saleForm.customerUPIAlias;
    }

    try {
      const response = await fetch(credentials.saleUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setApiResponse({ status: response.status, data, headers: Object.fromEntries(response.headers.entries()) });
      
      if (data.tranCtx) {
        setSeamlessState(prev => ({
          ...prev,
          tranCtx: data.tranCtx,
          redirectURI: data.redirectURI,
          showOTPCapturePage: data.showOTPCapturePage || 'N',
          generateOTPURI: data.generateOTPURI,
          verifyOTPURI: data.verifyOTPURI,
          authorizeURI: data.authorizeURI,
          step: data.showOTPCapturePage === 'Y' ? 2 : 1
        }));
        setCommandForm(prev => ({ ...prev, originalTxnNo: saleForm.merchantTxnNo }));
      }
      toast.success("Initiate Sale API executed!");
    } catch (err) {
      setApiResponse({ error: err.message, note: "Browser CORS Restriction likely triggered if UAT endpoint blocks browser origin. You can copy the generated cURL command below to test via Postman/Terminal or backend!" });
      toast.error("API Call Error / CORS restriction");
    }
  };

  // Submit Handler for Command API (Status / Refund)
  const handleCommandSubmit = async (e) => {
    e.preventDefault();
    setApiResponse({ loading: true });

    const params = new URLSearchParams({
      merchantId: credentials.merchantId,
      aggregatorID: credentials.aggregatorID,
      merchantTxnNo: commandForm.merchantTxnNo,
      originalTxnNo: commandForm.originalTxnNo || commandForm.merchantTxnNo,
      transactionType: commandForm.transactionType,
      secureHash: hashCalculation.secureHash
    });
    if (commandForm.amount) params.append('amount', commandForm.amount);
    if (commandForm.addlParam1) params.append('addlParam1', commandForm.addlParam1);

    try {
      const response = await fetch(credentials.commandUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      const data = await response.json();
      setApiResponse({ status: response.status, data });
      toast.success(`${commandForm.transactionType} API executed!`);
    } catch (err) {
      setApiResponse({ error: err.message, note: "Browser CORS Restriction likely triggered for ICICI UAT domain." });
      toast.error("Command API Failed");
    }
  };

  // Submit Handler for Generate QR
  const handleQrSubmit = async (e) => {
    e.preventDefault();
    setApiResponse({ loading: true });

    const params = new URLSearchParams({
      merchantId: credentials.merchantId,
      aggregatorID: credentials.aggregatorID,
      merchantRefNo: qrForm.merchantRefNo,
      amount: qrForm.amount,
      currency: qrForm.currency,
      mobileNo: qrForm.mobileNo,
      emailID: qrForm.emailID,
      requestType: qrForm.requestType,
      customerID: qrForm.customerID,
      invoiceDate: qrForm.invoiceDate,
      secureHash: hashCalculation.secureHash,
      accountNo: qrForm.accountNo,
      accountIFSC: qrForm.accountIFSC
    });

    try {
      const response = await fetch(credentials.qrUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      const data = await response.json();
      setApiResponse({ status: response.status, data });
      toast.success("Generate QR API executed!");
    } catch (err) {
      setApiResponse({ error: err.message, note: "Browser CORS Restriction likely triggered for ICICI UAT domain." });
      toast.error("Generate QR API Failed");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-200 to-red-400">
                  ICICI Bank Payment Gateway Demo Kit
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Comprehensive Technical Testing Portal & Live Hash Calculator
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-semibold">UAT Sandbox Testing Mode</span>
          </div>
        </div>

        {/* Credentials Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block font-mono">Merchant ID (MID)</span>
            <input 
              type="text" 
              value={credentials.merchantId} 
              onChange={e => setCredentials({...credentials, merchantId: e.target.value})}
              className="mt-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-orange-400 font-mono w-full focus:outline-none focus:border-orange-500" 
            />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-mono">Aggregator ID</span>
            <input 
              type="text" 
              value={credentials.aggregatorID} 
              onChange={e => setCredentials({...credentials, aggregatorID: e.target.value})}
              className="mt-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-orange-400 font-mono w-full focus:outline-none focus:border-orange-500" 
            />
          </div>
          <div className="md:col-span-2">
            <span className="text-xs text-slate-400 block font-mono">Encryption / Secret Key</span>
            <div className="flex gap-2 mt-1">
              <input 
                type="text" 
                value={credentials.secretKey} 
                onChange={e => setCredentials({...credentials, secretKey: e.target.value})}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-amber-300 font-mono w-full focus:outline-none focus:border-amber-500" 
              />
              <button 
                onClick={() => setCredentials({
                  ...credentials,
                  merchantId: '100000000007164',
                  aggregatorID: 'A100000000007164',
                  secretKey: 'db06cca0-838b-4e01-8b20-6ac446ffb6bd'
                })}
                className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-slate-200 transition"
              >
                Reset Default
              </button>
            </div>
          </div>
        </div>

        {/* Quick Test Cards Banner */}
        <div className="mt-4 bg-slate-800/30 border border-orange-500/20 rounded-xl p-3 flex flex-wrap items-center justify-between text-xs gap-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-orange-400" />
            <span className="font-semibold text-slate-200">Test Card:</span>
            <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-orange-300">4761 3400 0000 0035</span>
            <span className="text-slate-400">Exp: 09/26 | CVV: 123 | OTP: 123456</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">UPI VPA:</span>
            <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-emerald-300">test@ybl</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-200">Net Banking:</span>
            <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-blue-300">Test Bank (OTP: 123456)</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Test Navigation & Form Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Navigation Tabs */}
          <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/80 overflow-x-auto gap-1">
            <button
              onClick={() => setActiveTab('initiateSale')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'initiateSale' 
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              <Send className="w-3.5 h-3.5" /> 1. Initiate Sale API
            </button>
            <button
              onClick={() => setActiveTab('statusCheck')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'statusCheck' 
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              <Search className="w-3.5 h-3.5" /> 2. Status Check
            </button>
            <button
              onClick={() => setActiveTab('refund')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'refund' 
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" /> 3. Refund API
            </button>
            <button
              onClick={() => setActiveTab('generateQR')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'generateQR' 
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" /> 4. Generate QR
            </button>
          </div>

          {/* Form Container */}
          <div className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-6 shadow-xl relative">

            {/* TAB 1: INITIATE SALE */}
            {activeTab === 'initiateSale' && (
              <form onSubmit={handleInitiateSaleSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h2 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                    <Send className="w-5 h-5" /> Initiate Sale Request (v2)
                  </h2>
                  <button
                    type="button"
                    onClick={generateNewTxnNo}
                    className="text-xs bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded text-slate-200 flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3 h-3" /> New Txn Ref
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Payment Integration Mode (payType)</label>
                    <select
                      value={saleForm.payType}
                      onChange={e => setSaleForm({...saleForm, payType: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="0">0 - Standard Mode (Browser Redirection 3DSecure)</option>
                      <option value="1">1 - Direct Mode (Seamless Merchant OTP/Auth)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Merchant Txn No (merchantTxnNo)</label>
                    <input
                      type="text"
                      value={saleForm.merchantTxnNo}
                      onChange={e => setSaleForm({...saleForm, merchantTxnNo: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-orange-300 font-mono focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Amount (amount)</label>
                    <input
                      type="text"
                      value={saleForm.amount}
                      onChange={e => setSaleForm({...saleForm, amount: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Currency Code (currencyCode)</label>
                    <input
                      type="text"
                      value={saleForm.currencyCode}
                      onChange={e => setSaleForm({...saleForm, currencyCode: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Customer Email (customerEmailID)</label>
                    <input
                      type="email"
                      value={saleForm.customerEmailID}
                      onChange={e => setSaleForm({...saleForm, customerEmailID: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Customer Mobile (customerMobileNo)</label>
                    <input
                      type="text"
                      value={saleForm.customerMobileNo}
                      onChange={e => setSaleForm({...saleForm, customerMobileNo: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Customer Name (customerName)</label>
                    <input
                      type="text"
                      value={saleForm.customerName}
                      onChange={e => setSaleForm({...saleForm, customerName: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Txn Date (txnDate YYYYMMDDHHMISS)</label>
                    <input
                      type="text"
                      value={saleForm.txnDate}
                      onChange={e => setSaleForm({...saleForm, txnDate: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-300 mb-1 font-semibold">Return URL (returnURL)</label>
                    <input
                      type="text"
                      value={saleForm.returnURL}
                      onChange={e => setSaleForm({...saleForm, returnURL: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {saleForm.payType === '1' && (
                    <div className="md:col-span-2 bg-slate-900/80 p-4 rounded-xl border border-orange-500/30 space-y-3">
                      <h4 className="text-xs font-bold text-amber-400">Direct Seamless Payment Instrument Details</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">Payment Mode</label>
                          <select
                            value={saleForm.paymentMode}
                            onChange={e => setSaleForm({...saleForm, paymentMode: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                          >
                            <option value="CARD">CARD</option>
                            <option value="UPI">UPI</option>
                            <option value="NB">NB (Net Banking)</option>
                          </select>
                        </div>

                        {saleForm.paymentMode === 'CARD' && (
                          <>
                            <div>
                              <label className="block text-slate-400 mb-1">Card Number</label>
                              <input
                                type="text"
                                value={saleForm.cardNo}
                                onChange={e => setSaleForm({...saleForm, cardNo: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 mb-1">Card Expiry (YYYYMM)</label>
                              <input
                                type="text"
                                value={saleForm.cardExpiry}
                                onChange={e => setSaleForm({...saleForm, cardExpiry: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 mb-1">CVV</label>
                              <input
                                type="text"
                                value={saleForm.cvv}
                                onChange={e => setSaleForm({...saleForm, cvv: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                              />
                            </div>
                          </>
                        )}

                        {saleForm.paymentMode === 'UPI' && (
                          <div className="col-span-2">
                            <label className="block text-slate-400 mb-1">Customer VPA / UPI Alias</label>
                            <input
                              type="text"
                              value={saleForm.customerUPIAlias}
                              onChange={e => setSaleForm({...saleForm, customerUPIAlias: e.target.value})}
                              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition"
                  >
                    <Play className="w-4 h-4 fill-white" /> Execute Initiate Sale API
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: STATUS CHECK */}
            {activeTab === 'statusCheck' && (
              <form onSubmit={handleCommandSubmit} className="space-y-4">
                <div className="border-b border-slate-700 pb-3">
                  <h2 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                    <Search className="w-5 h-5" /> Transaction Status Check API
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Endpoint: /tsp/pg/api/command (Type: STATUS)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Original Merchant Txn No (originalTxnNo)</label>
                    <input
                      type="text"
                      value={commandForm.originalTxnNo}
                      onChange={e => setCommandForm({...commandForm, originalTxnNo: e.target.value, merchantTxnNo: e.target.value})}
                      placeholder="Enter past merchantTxnNo"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-orange-300 font-mono focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Request Txn Ref (merchantTxnNo)</label>
                    <input
                      type="text"
                      value={commandForm.merchantTxnNo}
                      onChange={e => setCommandForm({...commandForm, merchantTxnNo: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={() => setCommandForm(prev => ({...prev, transactionType: 'STATUS'}))}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
                >
                  <Search className="w-4 h-4" /> Check Transaction Status
                </button>
              </form>
            )}

            {/* TAB 3: REFUND */}
            {activeTab === 'refund' && (
              <form onSubmit={handleCommandSubmit} className="space-y-4">
                <div className="border-b border-slate-700 pb-3">
                  <h2 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" /> Refund API
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Endpoint: /tsp/pg/api/command (Type: REFUND)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Original Txn Reference (originalTxnNo)</label>
                    <input
                      type="text"
                      value={commandForm.originalTxnNo}
                      onChange={e => setCommandForm({...commandForm, originalTxnNo: e.target.value})}
                      placeholder="e.g. TXN175758588"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-orange-300 font-mono focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">New Refund Reference (merchantTxnNo)</label>
                    <input
                      type="text"
                      value={commandForm.merchantTxnNo}
                      onChange={e => setCommandForm({...commandForm, merchantTxnNo: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Refund Amount (amount)</label>
                    <input
                      type="text"
                      value={commandForm.amount}
                      onChange={e => setCommandForm({...commandForm, amount: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={() => setCommandForm(prev => ({...prev, transactionType: 'REFUND'}))}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" /> Process Refund
                </button>
              </form>
            )}

            {/* TAB 4: GENERATE QR */}
            {activeTab === 'generateQR' && (
              <form onSubmit={handleQrSubmit} className="space-y-4">
                <div className="border-b border-slate-700 pb-3">
                  <h2 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                    <QrCode className="w-5 h-5" /> Generate Dynamic UPI QR API
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Endpoint: /tsp/pg/api/generateQR</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Merchant Reference (merchantRefNo)</label>
                    <input
                      type="text"
                      value={qrForm.merchantRefNo}
                      onChange={e => setQrForm({...qrForm, merchantRefNo: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-orange-300 font-mono focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Amount</label>
                    <input
                      type="text"
                      value={qrForm.amount}
                      onChange={e => setQrForm({...qrForm, amount: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Mobile No</label>
                    <input
                      type="text"
                      value={qrForm.mobileNo}
                      onChange={e => setQrForm({...qrForm, mobileNo: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Customer ID</label>
                    <input
                      type="text"
                      value={qrForm.customerID}
                      onChange={e => setQrForm({...qrForm, customerID: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
                >
                  <QrCode className="w-4 h-4" /> Generate QR Code
                </button>
              </form>
            )}

          </div>

          {/* Secure Hash Calculation Breakdown Card */}
          <div className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Key className="w-4 h-4" /> Live Secure Hash Calculation Engine (SHA256 HMAC)
              </h3>
              <span className="text-xs font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Algorithm: HMAC-SHA256
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 font-semibold">1. Sorted Field Concatenation String (HashText):</span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-slate-300 break-all select-all">
                  {hashCalculation.hashText || 'Calculating...'}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold">2. Calculated secureHash:</span>
                <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/30 font-mono text-emerald-400 font-bold break-all flex items-center justify-between gap-2">
                  <span>{hashCalculation.secureHash || 'Generating...'}</span>
                  <button 
                    onClick={() => copyToClipboard(hashCalculation.secureHash)}
                    className="hover:text-white p-1 rounded transition"
                    title="Copy secureHash"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: API Responses & Redirection Playground (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Seamless Redirect / Redirect Handler Box */}
          {seamlessState.tranCtx && (
            <div className="bg-gradient-to-br from-slate-800 to-orange-950/40 border border-orange-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-orange-500/30 pb-3">
                <h3 className="text-sm font-bold text-orange-300 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Redirect URI & Context Available
                </h3>
                <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30 font-mono">
                  tranCtx Captured
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Transaction Context (tranCtx):</span>
                  <span className="font-mono text-orange-200 break-all bg-slate-900/90 px-2 py-1 rounded block mt-0.5">
                    {seamlessState.tranCtx}
                  </span>
                </div>

                {seamlessState.redirectURI && (
                  <div>
                    <span className="text-slate-400 block mb-1">Standard Mode 3DSecure Redirect Link:</span>
                    <a
                      href={`${seamlessState.redirectURI}?tranCtx=${seamlessState.tranCtx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded text-xs font-semibold transition"
                    >
                      Proceed to Bank Auth Page <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* cURL Command Generator */}
          <div className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> Exact Request cURL Command
              </h3>
              <button 
                onClick={() => copyToClipboard(rawCurlCommand)}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1 rounded flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy cURL'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
              {rawCurlCommand || 'Select an API tab to view generated cURL...'}
            </pre>
          </div>

          {/* Live API Response Display */}
          <div className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Code className="w-4 h-4 text-orange-400" /> Live Response Inspector
              </h3>
              {apiResponse?.status && (
                <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                  apiResponse.status >= 200 && apiResponse.status < 300 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  HTTP {apiResponse.status}
                </span>
              )}
            </div>

            {apiResponse?.loading ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-400" />
                <p className="text-xs">Sending Request to ICICI Gateway...</p>
              </div>
            ) : apiResponse ? (
              <div className="space-y-3">
                {apiResponse.error && (
                  <div className="bg-amber-900/30 border border-amber-500/40 p-3 rounded-xl text-xs text-amber-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <AlertCircle className="w-4 h-4" /> {apiResponse.error}
                    </div>
                    <p className="text-slate-300 text-[11px]">{apiResponse.note}</p>
                  </div>
                )}
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96">
                  {JSON.stringify(apiResponse.data || apiResponse, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Click any API execution button above to test live call and inspect raw JSON response.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
