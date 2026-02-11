import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { DollarSign, Download, Plus, PieChart, Calendar, Tag, Trash2, History, AlertTriangle } from 'lucide-react';

const ExpensesAdmin = () => {
  const [form, setForm] = useState({ amount: '', category: '', description: '', date: '' });
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(''); // Validation Error State

  // 1. Get Current Month String
  const getCurrentMonthName = () => {
    const date = new Date();
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  const [currentMonthStr] = useState(getCurrentMonthName());

  const fetchData = async () => {
    try {
      const [expRes, sumRes] = await Promise.all([
        API.get('/expenses'),
        API.get('/expenses/summary')
      ]);
      setExpenses(expRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- SMART EXPORT ---
  const handleExport = async (type) => {
    try {
      let query = '';
      if (type === 'current') {
          query = `?month=${currentMonthStr}`;
      } else if (type === 'history') {
          query = `?excludeMonth=${currentMonthStr}`;
      }

      const response = await API.get(`/export/expenses${query}`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `Expenses_${type === 'current' ? currentMonthStr : 'History'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Error downloading report');
    }
  };

  const handleDeleteMonth = async (monthLabel) => {
    if (!window.confirm(`Delete ALL expenses for ${monthLabel}? This cannot be undone.`)) return;
    try {
      await API.post('/expenses/delete-month', { month: monthLabel });
      alert(`Expenses for ${monthLabel} deleted.`);
      fetchData();
    } catch (err) {
      alert('Failed to delete monthly expenses');
    }
  };

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    // 1. Amount Check
    if (Number(form.amount) <= 0) return "Amount must be greater than zero.";

    // 2. Category Check (No Numbers)
    const categoryRegex = /^[A-Za-z\s]+$/;
    if (!categoryRegex.test(form.category)) {
        return "Category must contain only letters (No numbers or special characters).";
    }

    // 3. Description Length Check
    if (form.description.length > 100) {
        return "Description is too long (Max 100 characters).";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
        setError(validationError);
        setTimeout(() => setError(''), 4000);
        return;
    }

    setIsSubmitting(true);
    try {
      await API.post('/expenses', { ...form, amount: Number(form.amount) });
      setForm({ amount: '', category: '', description: '', date: '' });
      fetchData();
      alert("Expense recorded! Notification sent.");
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
        await API.delete(`/expenses/${id}`);
        fetchData();
    } catch (err) { alert('Failed to delete'); }
  };

  const getMonthStrFromDate = (dateStr) => {
      return new Date(dateStr).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const currentMonthExpenses = expenses.filter(e => getMonthStrFromDate(e.date) === currentMonthStr);
  const historyExpenses = expenses.filter(e => getMonthStrFromDate(e.date) !== currentMonthStr);

  const ExpenseTable = ({ data, type, label }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                {type === 'history' ? <History size={20} className="text-slate-500"/> : <Calendar size={20} className="text-indigo-600"/>} 
                {label}
            </h2>
            <div className="flex gap-2">
                {type === 'current' && data.length > 0 && (
                    <button 
                        onClick={() => handleDeleteMonth(currentMonthStr)}
                        className="bg-rose-50 text-rose-600 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-rose-100 transition border border-rose-100"
                    >
                        <Trash2 size={14}/> Delete All
                    </button>
                )}
                <button 
                    onClick={() => handleExport(type)} 
                    className="bg-emerald-50 text-emerald-600 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-emerald-100 transition border border-emerald-100"
                >
                    <Download size={14}/> Export Excel
                </button>
            </div>
        </div>
        
        {data.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Details</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map(e => (
                            <tr key={e._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} /> {new Date(e.date).toLocaleDateString('en-IN')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-700">{e.description || '—'}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase">
                                        <Tag size={10} /> {e.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-800">₹ {e.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(e._id)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="p-10 text-center text-slate-400 text-sm">No expenses found for this period.</div>
        )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
             <DollarSign size={32} className="text-indigo-600" /> Expense Tracker
           </h1>
           <p className="text-slate-500 mt-1">Track society spending and generate reports.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg shadow-sm flex items-center gap-2">
           <AlertTriangle size={20} className="text-rose-600"/>
           <p className="text-rose-800 font-bold">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{s._id}</p>
                   <h3 className="text-2xl font-extrabold text-slate-800 mt-1">₹ {s.total.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                   <PieChart size={20} />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50">
                 <span className="text-xs font-bold text-slate-500">{s.count} transactions</span>
              </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Expense Form */}
        <div className="lg:col-span-1">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
             <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 border-b pb-4">
               <Plus size={20} className="text-indigo-600" /> Add New Expense
             </h2>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                 {/* VISIBILITY FIX: text-slate-900 */}
                 <input type="number" required step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} 
                   className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400" placeholder="0.00" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                   {/* VISIBILITY FIX: text-slate-900 */}
                   <input required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} 
                     className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400" placeholder="Utilities" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                   {/* VISIBILITY FIX: text-slate-900 */}
                   <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} 
                     className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition-all" />
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                 {/* VISIBILITY FIX: text-slate-900 */}
                 <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} 
                   className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition-all resize-none placeholder:text-slate-400" rows="3" placeholder="Details about this expense..." />
               </div>
               <button 
                 disabled={isSubmitting}
                 className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 mt-2 disabled:opacity-50"
               >
                 {isSubmitting ? 'Recording...' : 'Record Expense'}
               </button>
             </form>
           </div>
        </div>

        {/* Expense Lists */}
        <div className="lg:col-span-2 space-y-2">
           {loading ? <p className="text-center text-slate-500 py-10">Loading...</p> : (
             <>
                <ExpenseTable 
                    data={currentMonthExpenses} 
                    type="current" 
                    label={`Current Month (${currentMonthStr})`}
                />
                
                {historyExpenses.length > 0 && (
                    <ExpenseTable 
                        data={historyExpenses} 
                        type="history" 
                        label="Previous History"
                    />
                )}
             </>
           )}
        </div>
      </div>
    </div>
  );
};

export default ExpensesAdmin;