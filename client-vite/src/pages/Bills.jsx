import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { CreditCard, Download, CheckCircle, Clock, TrendingUp, AlertTriangle, Shield } from 'lucide-react';

const Bills = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [message, setMessage] = useState('');

  const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    if (user) fetchBills();
    // Load Razorpay Script Dynamically
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [user]);

  const fetchBills = async () => {
    try {
      const { data } = await API.get('/bills/my');
      setBills(data);
    } catch (error) { console.error('Error fetching bills:', error); } 
    finally { setLoading(false); }
  };

  const handlePaymentClick = async (bill) => {
    if (bill.status === 'Paid') {
      setMessage('This bill is already paid!');
      return;
    }

    setPaymentLoading(true);
    setMessage('');

    try {
      // 1. Create Order on Backend (PASS billId HERE)
      const { data } = await API.post('/bills/create-order-public', {
        amount: Number(bill.amount), 
        billId: bill._id // ✅ REQUIRED by backend
      });

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Check internet connection.");
        setPaymentLoading(false);
        return;
      }

      // 2. Open Razorpay
      const options = {
        key: data.key, 
        amount: data.amount,
        currency: data.currency,
        name: 'Nivas Society',
        description: `Bill: ${bill.month}`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await API.post('/bills/verify-public', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              billId: bill._id
            });
            setMessage('Payment Successful!');
            fetchBills(); 
          } catch (error) {
            setMessage('Payment Verification Failed.');
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phoneNumber
        },
        theme: { color: '#4F46E5' },
        modal: { ondismiss: () => setPaymentLoading(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Failed to initiate payment.');
      setPaymentLoading(false);
    }
  };

  // ✅ FIXED: Downloads PDF using authenticated API request
  const handleDownloadReceipt = async (billId) => {
    try {
      const response = await API.get(`/bills/receipt/${billId}`, { 
        responseType: 'blob' // Important for PDF files
      });
      
      // Create a temporary link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Nivas_Receipt_${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) { 
      console.error("Download Error:", error);
      setMessage('Error downloading receipt. Please try again.'); 
    }
  };

  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidAmount = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const outstandingAmount = totalBills - paidAmount;

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <CreditCard className="text-indigo-600" size={32} /> My Bills
        </h1>
      </header>

      {message && (
        <div className={`p-4 rounded-xl border-l-4 shadow-sm font-bold ${message.includes('Failed') || message.includes('Error') ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-emerald-50 border-emerald-500 text-emerald-700'}`}>
           {message}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Billed</p>
           <h3 className="text-2xl font-extrabold text-slate-800 mt-1">₹ {totalBills.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paid</p>
           <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">₹ {paidAmount.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding</p>
           <h3 className="text-2xl font-extrabold text-rose-600 mt-1">₹ {outstandingAmount.toLocaleString()}</h3>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
               <tr>
                 <th className="px-6 py-4">Month</th>
                 <th className="px-6 py-4">Amount</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4">Paid On</th>
                 <th className="px-6 py-4 text-right">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {bills.map((bill) => (
                 <tr key={bill._id} className="hover:bg-slate-50 transition-colors">
                   <td className="px-6 py-4 font-bold text-slate-800">{bill.month}</td>
                   <td className="px-6 py-4 font-bold text-slate-600">₹ {bill.amount}</td>
                   <td className="px-6 py-4">
                     {bill.status === 'Paid' 
                       ? <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold"><CheckCircle size={12}/> Paid</span>
                       : <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-bold"><Clock size={12}/> Unpaid</span>
                     }
                   </td>
                   <td className="px-6 py-4 text-sm text-slate-500">
                     {bill.paidAt ? new Date(bill.paidAt).toLocaleDateString() : '—'}
                   </td>
                   <td className="px-6 py-4 text-right">
                     {bill.status === 'Paid' ? (
                       <button onClick={() => handleDownloadReceipt(bill._id)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition inline-flex items-center gap-1">
                         <Download size={12}/> Receipt
                       </button>
                     ) : (
                       <button 
                         onClick={() => handlePaymentClick(bill)} 
                         disabled={paymentLoading}
                         className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-md transition disabled:opacity-50"
                       >
                         {paymentLoading ? 'Processing...' : 'Pay Now'}
                       </button>
                     )}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
         {bills.length === 0 && <div className="p-10 text-center text-slate-400">No bills found.</div>}
      </div>
    </div>
  );
};

export default Bills;