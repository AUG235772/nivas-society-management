import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { 
  CreditCard, CheckCircle, Clock, TrendingUp, Plus, 
  Download, Search, Trash2, Calendar, AlertTriangle, Layers, FileText 
} from 'lucide-react';

const Billing = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingBills, setGeneratingBills] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Get Current Month String (e.g. "February 2026")
  const getCurrentMonthName = () => {
    const date = new Date();
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const [currentMonthStr, setCurrentMonthStr] = useState(getCurrentMonthName());
  const [form, setForm] = useState({ month: currentMonthStr, amount: '' });

  useEffect(() => {
    if (user?.role === 'admin') fetchBills();
  }, [user]);

  const fetchBills = async () => {
    try {
      const { data } = await API.get('/bills/all');
      setBills(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGenerateBills = async (e) => {
    e.preventDefault();
    if (!form.month || !form.amount) return;
    setGeneratingBills(true);
    try {
      const { data } = await API.post('/bills/generate', form);
      setMessage(data.message || 'Bills generated successfully!');
      setForm({ month: currentMonthStr, amount: '' }); 
      fetchBills();
      setTimeout(() => setMessage(''), 5000);
    } catch (err) { 
        setMessage(err.response?.data?.message || 'Failed to generate bills'); 
    } finally { 
        setGeneratingBills(false); 
    }
  };

  const handleDeleteBill = async (id) => {
    if (!window.confirm('Delete this bill permanently?')) return;
    try {
      await API.delete(`/bills/${id}`);
      setBills(bills.filter(b => b._id !== id));
    } catch (err) { alert('Failed to delete'); }
  };

  const handleDeleteGroup = async (groupName) => {
    const confirmMsg = `WARNING: You are about to delete the entire bill group "${groupName}".\n\nThis will remove bills for ALL residents in this group.\n\nAre you sure?`;
    if (!window.confirm(confirmMsg)) return;
    
    try {
      await API.post('/bills/delete-month', { month: groupName });
      setMessage(`Group "${groupName}" deleted successfully.`);
      // Optimistic Update
      setBills(prev => prev.filter(b => b.month !== groupName));
      setTimeout(() => setMessage(''), 4000);
    } catch (err) { alert('Failed to delete group'); }
  };

  const handleExport = async (type, specificMonth = null) => {
    try {
      let query = '';
      let filename = '';

      if (type === 'group' && specificMonth) {
          query = `?month=${specificMonth}`;
          filename = `Bills_${specificMonth}`;
      } else {
          // Default fallback
          query = `?excludeMonth=${currentMonthStr}`;
          filename = 'Bills_History';
      }

      const response = await API.get(`/export/bills${query}`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `${filename}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) { console.error('Export error', err); }
  };

  // --- GROUPING LOGIC ---
  // 1. Group ALL bills by their 'month' string (e.g. "February 2026", "Water Bill Feb")
  const groupedBills = bills.reduce((acc, bill) => {
      const key = bill.month;
      if (!acc[key]) acc[key] = [];
      acc[key].push(bill);
      return acc;
  }, {});

  // 2. Sort groups by creation date of the first bill in that group (Newest first)
  const sortedGroupKeys = Object.keys(groupedBills).sort((a, b) => {
      const dateA = new Date(groupedBills[a][0].createdAt);
      const dateB = new Date(groupedBills[b][0].createdAt);
      return dateB - dateA; 
  });

  // 3. Separate into Sections
  const currentSectionKeys = sortedGroupKeys.filter(key => key.toLowerCase().includes(currentMonthStr.toLowerCase()));
  const historySectionKeys = sortedGroupKeys.filter(key => !key.toLowerCase().includes(currentMonthStr.toLowerCase()));

  // Stats Calculation (Global)
  const calculateStats = (billList) => {
    const total = billList.reduce((sum, b) => sum + b.amount, 0);
    const paid = billList.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
    return { total, paid, pending: total - paid };
  };
  const currentStats = calculateStats(bills.filter(b => b.month.includes(currentMonthStr)));

  if (user?.role !== 'admin') return <div className="text-center text-rose-500 mt-20 font-bold">Access Denied</div>;

  // --- REUSABLE SUB-GROUP COMPONENT ---
  const BillGroupTable = ({ groupName, data }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
      {/* Group Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-indigo-600">
             <FileText size={20}/>
           </div>
           <div>
             <h3 className="font-bold text-slate-800 text-lg">{groupName}</h3>
             <span className="text-xs font-bold text-slate-500">{data.length} Residents Billed</span>
           </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => handleDeleteGroup(groupName)} 
             className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-rose-100 transition border border-rose-100 shadow-sm active:scale-95"
           >
             <Trash2 size={16}/> Delete Group
           </button>
           <button 
             onClick={() => handleExport('group', groupName)} 
             className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-100 transition border border-emerald-100 shadow-sm active:scale-95"
           >
             <Download size={16}/> Export
           </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white text-slate-400 text-xs uppercase font-extrabold tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Resident</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Paid On</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.filter(b => b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(b => (
              <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800 text-sm">{b.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Flat {b.user?.flatNo || '—'}</p>
                </td>
                <td className="px-6 py-4 font-bold text-slate-800">₹ {b.amount}</td>
                <td className="px-6 py-4">
                  {b.status === 'Paid' 
                    ? <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-200"><CheckCircle size={12}/> Paid</span> 
                    : <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-[11px] font-bold border border-rose-200"><Clock size={12}/> Unpaid</span>
                  }
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                  {b.paidAt ? new Date(b.paidAt).toLocaleDateString('en-IN') : '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDeleteBill(b._id)} 
                    className="text-slate-400 hover:text-rose-600 p-2 rounded-full hover:bg-rose-50 transition"
                    title="Delete Single Bill"
                  >
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
             <CreditCard size={32} className="text-indigo-600" /> Billing Management
           </h1>
           <p className="text-slate-500 mt-1">Generate and track resident bills.</p>
        </div>
      </div>

      {message && <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-emerald-800 font-bold shadow-sm">{message}</div>}

      {/* Generator */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-indigo-600"/> Generate Monthly Bills
        </h2>
        <form onSubmit={handleGenerateBills} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Month / Title</label>
            <input 
              name="month" 
              value={form.month} 
              onChange={handleChange} 
              placeholder="e.g. February 2026" 
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
            <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="1500" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" required />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button type="submit" disabled={generatingBills} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
              {generatingBills ? 'Generating...' : 'Generate Bills for All Residents'}
            </button>
          </div>
        </form>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Month Billed</p><h3 className="text-2xl font-extrabold text-slate-800 mt-1">₹ {currentStats.total.toLocaleString()}</h3></div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={24}/></div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collected (Current)</p><h3 className="text-2xl font-extrabold text-emerald-600 mt-1">₹ {currentStats.paid.toLocaleString()}</h3></div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={24}/></div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending (Current)</p><h3 className="text-2xl font-extrabold text-rose-600 mt-1">₹ {currentStats.pending.toLocaleString()}</h3></div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertTriangle size={24}/></div>
         </div>
      </div>

      {/* Search */}
      <div className="relative">
         <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
         <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search resident by name..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
      </div>

      {loading ? <p className="text-center py-20 text-slate-400">Loading bills...</p> : (
        <>
          {/* SECTION 1: CURRENT MONTH */}
          {currentSectionKeys.length > 0 ? (
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={24} className="text-indigo-600"/>
                    <h2 className="text-xl font-bold text-slate-800">Current Month ({currentMonthStr})</h2>
                </div>
                {currentSectionKeys.map(key => (
                    <BillGroupTable key={key} groupName={key} data={groupedBills[key]} />
                ))}
            </div>
          ) : (
            <div className="p-10 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 mb-10">
                No bills generated for {currentMonthStr} yet.
            </div>
          )}

          {/* SECTION 2: HISTORY */}
          {historySectionKeys.length > 0 && (
            <div className="space-y-6 mt-12 border-t border-slate-100 pt-8">
                <div className="flex items-center gap-2 mb-4">
                    <Layers size={24} className="text-slate-500"/>
                    <h2 className="text-xl font-bold text-slate-700">Previous History</h2>
                </div>
                {historySectionKeys.map(key => (
                    <BillGroupTable key={key} groupName={key} data={groupedBills[key]} />
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Billing;