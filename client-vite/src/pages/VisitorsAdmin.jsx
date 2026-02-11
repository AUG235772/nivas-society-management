import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Shield, UserPlus, Download, Search, Trash2, Calendar, Clock, Car, AlertTriangle } from 'lucide-react';

const VisitorsAdmin = () => {
  const [visitors, setVisitors] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', flatNo: '', purpose: '', vehicleNumber: '', duration: '1' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => { fetchVisitors(); }, []);

  const fetchVisitors = async () => {
    try {
      const { data } = await API.get('/visitors/all');
      setVisitors(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // --- VALIDATION LOGIC ---
  const validate = () => {
    // 1. Name Check (Letters Only, Min 2 Words)
    const nameRegex = /^[A-Za-z\s]+$/;
    const nameWords = form.name.trim().split(/\s+/);
    if (!nameRegex.test(form.name)) return "Name must contain only letters.";
    if (nameWords.length < 2) return "Name should have at least 2 words (e.g. John Doe).";

    // 2. Phone Check (10 Digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) return "Phone number must be exactly 10 digits.";

    // 3. Purpose Check (Letters Only, Min 2 Words)
    const purposeRegex = /^[A-Za-z\s]+$/;
    const purposeWords = form.purpose.trim().split(/\s+/);
    if (!purposeRegex.test(form.purpose)) return "Purpose must contain only letters.";
    if (purposeWords.length < 2) return "Purpose should be descriptive (e.g. Delivery Package).";

    // 4. Vehicle Check (Optional but Strict if entered)
    if (form.vehicleNumber) {
        const vNum = form.vehicleNumber.trim().toUpperCase();
        const vRegex = /^[A-Z]{2}[A-Z0-9]+$/;
        if (vNum.length < 10 || vNum.length > 12) return "Vehicle Number must be 10-12 characters.";
        if (!vRegex.test(vNum)) return "Invalid Vehicle Format (Must start with 2 letters).";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
        setError(validationError);
        return;
    }

    setSubmitting(true);
    try {
      const payload = { 
        ...form, 
        vehicleNumber: form.vehicleNumber.toUpperCase(),
        duration: form.duration 
      };
      
      const { data } = await API.post('/visitors/entry', payload);
      setVisitors([data, ...visitors]); 
      setForm({ name: '', phone: '', flatNo: '', purpose: '', vehicleNumber: '', duration: '1' });
      alert("Visitor Entry Added");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add visitor");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this visitor log?')) return;
    try {
      await API.delete(`/visitors/${id}`);
      setVisitors(visitors.filter(v => v._id !== id));
    } catch (err) { alert('Delete failed'); }
  };

  const handleExport = async () => {
    try {
      const response = await API.get(`/export/visitors?month=${currentMonthStr}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Visitors_${currentMonthStr}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) { alert('Export failed'); }
  };

  const currentMonthVisitors = visitors.filter(v => 
    new Date(v.entryTime).toLocaleString('default', { month: 'long', year: 'numeric' }) === currentMonthStr
  );

  const groupedVisitors = currentMonthVisitors.reduce((acc, v) => {
    const dateKey = new Date(v.entryTime).toLocaleDateString('en-IN');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
             <Shield size={32} className="text-indigo-600" /> Visitor Management
           </h1>
           <p className="text-slate-500 mt-1">Manage daily visitor entry and exit.</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all">
          <Download size={18} /> Export Current Month
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD VISITOR FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 border-b pb-4">
              <UserPlus size={20} className="text-indigo-600" /> Add Visitor
            </h2>
            
            {error && (
               <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs font-bold text-rose-700">
                 <AlertTriangle size={16} className="shrink-0 mt-0.5"/>
                 <p>{error}</p>
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                {/* VISIBILITY FIX: text-slate-900 */}
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Full Name" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} required placeholder="10-digit Mobile" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Flat No</label>
                <input name="flatNo" value={form.flatNo} onChange={handleChange} required placeholder="e.g. 505" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Purpose</label>
                <input name="purpose" value={form.purpose} onChange={handleChange} required placeholder="e.g. Food Delivery" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vehicle (Opt)</label>
                   <input 
                     name="vehicleNumber"
                     value={form.vehicleNumber}
                     onChange={e => setForm({...form, vehicleNumber: e.target.value.toUpperCase()})}
                     placeholder="GJ01AB1234"
                     className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase placeholder:text-slate-400"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Est. Duration</label>
                   <select 
                     name="duration"
                     value={form.duration}
                     onChange={handleChange}
                     className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                   >
                     <option value="0.25">15 Mins</option>
                     <option value="1">1 Hour</option>
                     <option value="3">3 Hours</option>
                     <option value="5">5 Hours</option>
                     <option value="10">10 Hours</option>
                     <option value="24">24 Hours</option>
                   </select>
                </div>
              </div>

              <button disabled={submitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg mt-2 transition-all active:scale-95">
                {submitting ? 'Adding...' : 'Add Visitor'}
              </button>
            </form>
          </div>
        </div>

        {/* VISITOR LIST */}
        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <Calendar size={20} className="text-indigo-600"/> Current Month: {currentMonthStr}
           </h2>

           {loading ? <p className="text-center text-slate-400">Loading logs...</p> : 
            Object.keys(groupedVisitors).length > 0 ? (
              Object.entries(groupedVisitors).map(([date, logs]) => (
                <div key={date} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                   <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 font-bold text-slate-600 flex items-center gap-2">
                      <Calendar size={16}/> {date}
                   </div>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                       <thead className="text-xs uppercase font-bold text-slate-400 border-b border-slate-100 bg-white">
                         <tr>
                           <th className="px-6 py-3">Visitor</th>
                           <th className="px-6 py-3">Flat/Purpose</th>
                           <th className="px-6 py-3">Time</th>
                           <th className="px-6 py-3">Status</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                         {logs.map(v => (
                           <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-3">
                               <p className="font-bold text-slate-800 text-sm">{v.name}</p>
                               <p className="text-xs text-slate-500">{v.phone}</p>
                               {v.vehicleNumber && <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded"><Car size={10}/> {v.vehicleNumber}</span>}
                             </td>
                             <td className="px-6 py-3">
                               <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">{v.flatNo}</span>
                               <p className="text-xs text-slate-500 mt-1 truncate max-w-[120px]">{v.purpose}</p>
                             </td>
                             <td className="px-6 py-3 text-xs font-medium text-slate-600">
                               <div className="flex items-center gap-1"><Clock size={12} className="text-emerald-500"/> In: {new Date(v.entryTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                               <div className="flex items-center gap-1 mt-1"><Clock size={12} className={v.exitTime || v.status === 'Exited' ? "text-rose-500" : "text-amber-500"}/> Out: { v.exitTime ? new Date(v.exitTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : (v.expectedExitTime ? `${new Date(v.expectedExitTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} (Est)` : '-') }</div>
                             </td>
                             <td className="px-6 py-3">
                               {v.status === 'Inside' ? <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">INSIDE</span> : <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">EXITED</span>}
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">No visitors recorded this month.</div>
            )
           }
        </div>
      </div>
    </div>
  );
};

export default VisitorsAdmin;