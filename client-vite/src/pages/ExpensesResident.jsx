import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { DollarSign, Calendar, Tag, TrendingUp, Download, History } from 'lucide-react';

const ExpensesResident = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Get Current Month String
  const getCurrentMonthName = () => {
    const date = new Date();
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  const [currentMonthStr] = useState(getCurrentMonthName());

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await API.get('/expenses/public');
        setExpenses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

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

  // 2. Separate Data
  const getMonthStrFromDate = (dateStr) => {
      return new Date(dateStr).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const currentMonthExpenses = expenses.filter(e => getMonthStrFromDate(e.date) === currentMonthStr);
  const historyExpenses = expenses.filter(e => getMonthStrFromDate(e.date) !== currentMonthStr);

  // Reusable Table Component
  const ExpenseTable = ({ data, type, label }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
       <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
         <div className="flex items-center gap-2">
            {type === 'current' ? <Calendar size={20} className="text-indigo-600"/> : <History size={20} className="text-slate-500"/>}
            <h2 className="font-bold text-slate-800">{label}</h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-full ml-2">{data.length} Records</span>
         </div>
         
         <button 
            onClick={() => handleExport(type)} 
            className="bg-emerald-50 text-emerald-600 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-emerald-100 transition border border-emerald-100"
         >
            <Download size={14}/> Export Excel
         </button>
       </div>
       
       <div className="overflow-x-auto">
         <table className="w-full text-left">
           <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
             <tr>
               <th className="px-6 py-4">Date</th>
               <th className="px-6 py-4">Category</th>
               <th className="px-6 py-4">Description</th>
               <th className="px-6 py-4 text-right">Amount</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {data.map(e => (
               <tr key={e._id} className="hover:bg-slate-50 transition-colors">
                 <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-2">
                    <Calendar size={14} /> {new Date(e.date).toLocaleDateString('en-IN')}
                 </td>
                 <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase">
                       <Tag size={10} /> {e.category}
                    </span>
                 </td>
                 <td className="px-6 py-4 text-sm font-medium text-slate-700">{e.description}</td>
                 <td className="px-6 py-4 text-right font-bold text-rose-600">
                    - ₹ {e.amount.toFixed(2)}
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
      <header>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <DollarSign size={32} className="text-indigo-600" /> Society Expenses
        </h1>
        <p className="text-slate-500 mt-1">Transparency report of society maintenance spending.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
            <p className="text-slate-500 font-medium animate-pulse">Loading financial data...</p>
        </div>
      ) : (
        <>
            {/* Current Month */}
            <ExpenseTable 
                data={currentMonthExpenses} 
                type="current" 
                label={`Current Month (${currentMonthStr})`} 
            />

            {/* History */}
            {historyExpenses.length > 0 ? (
                <ExpenseTable 
                    data={historyExpenses} 
                    type="history" 
                    label="Previous History" 
                />
            ) : (
                currentMonthExpenses.length === 0 && (
                    <div className="p-16 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200">
                        <TrendingUp size={40} className="text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No expenses recorded yet.</p>
                    </div>
                )
            )}
        </>
      )}
    </div>
  );
};

export default ExpensesResident;