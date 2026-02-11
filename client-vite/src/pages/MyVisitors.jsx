import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { Shield, UserPlus, Calendar, Clock, Car, AlertTriangle } from 'lucide-react';

const MyVisitors = () => {
  const { user } = useContext(AuthContext);
  const [visitors, setVisitors] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', purpose: '', vehicleNumber: '', duration: '1' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyVisitors = async () => {
      try {
        const { data } = await API.get('/visitors/my-flat');
        setVisitors(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchMyVisitors();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // --- VALIDATION LOGIC ---
  const validate = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const nameWords = form.name.trim().split(/\s+/);
    if (!nameRegex.test(form.name)) return "Name must contain only letters.";
    if (nameWords.length < 2) return "Name must contain at least 2 words.";

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) return "Phone number must be exactly 10 digits.";

    const purposeRegex = /^[A-Za-z\s]+$/;
    const purposeWords = form.purpose.trim().split(/\s+/);
    if (!purposeRegex.test(form.purpose)) return "Purpose must contain only letters.";
    if (purposeWords.length < 2) return "Purpose must contain at least 2 words.";

    if (form.vehicleNumber) {
        const vNum = form.vehicleNumber.trim().toUpperCase();
        const vRegex = /^[A-Z]{2}[A-Z0-9]+$/;
        if (vNum.length < 10 || vNum.length > 12) return "Vehicle Number must be 10-12 characters.";
        if (!vRegex.test(vNum)) return "Invalid Vehicle Format.";
    }
    return null;
  };

  const handlePreApprove = async (e) => {
    e.preventDefault();
    setError('');

    const valError = validate();
    if (valError) { setError(valError); return; }

    setSubmitting(true);
    try {
      const finalPurpose = `${form.purpose} (Est: ${form.duration}h)`;
      const payload = { 
        ...form, 
        purpose: finalPurpose, 
        vehicleNumber: form.vehicleNumber.toUpperCase(),
        duration: form.duration 
      };
      
      const { data } = await API.post('/visitors/pre-approve', payload);
      setVisitors([data, ...visitors]);
      setForm({ name: '', phone: '', purpose: '', vehicleNumber: '', duration: '1' });
      alert("Visitor Pre-Approved Successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to pre-approve");
    } finally { setSubmitting(false); }
  };

  const groupedVisitors = visitors.reduce((acc, v) => {
    const dateKey = new Date(v.entryTime).toLocaleDateString('en-IN');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
             <Shield size={32} className="text-indigo-600" /> My Visitors
           </h1>
           <p className="text-slate-500 mt-1">Pre-approve guests and view entry logs.</p>
        </div>
        
        <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase block">Total</span>
                <span className="text-xl font-extrabold text-slate-800">{visitors.length}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase block">Inside</span>
                <span className="text-xl font-extrabold text-emerald-600">{visitors.filter(v => v.status === 'Inside').length}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: PRE-APPROVE FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 border-b pb-4">
              <UserPlus size={20} className="text-indigo-600" /> Pre-approve Visitor
            </h2>

            {error && (
               <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs font-bold text-rose-700">
                 <AlertTriangle size={16} className="shrink-0 mt-0.5"/>
                 <p>{error}</p>
               </div>
            )}

            <form onSubmit={handlePreApprove} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                <input name="name" value={form.name} onChange={handleChange} required className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400" placeholder="Full Name" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} required className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400" placeholder="10-digit Mobile" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Purpose</label>
                <input name="purpose" value={form.purpose} onChange={handleChange} required className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400" placeholder="Reason for visit" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vehicle (Opt)</label>
                   <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} placeholder="GJ01AB1234" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase placeholder:text-slate-400" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Est. Duration</label>
                   <select name="duration" value={form.duration} onChange={handleChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
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
                {submitting ? 'Generating Pass...' : 'Generate Pass'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: VISITOR LOGS */}
        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Calendar size={20} className="text-indigo-600"/> Visitor History</h2>
           {loading ? <p className="text-center text-slate-400 py-10">Loading history...</p> : 
            Object.keys(groupedVisitors).length > 0 ? (
              Object.entries(groupedVisitors).map(([date, logs]) => (
                <div key={date} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                   <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 font-bold text-slate-600 flex items-center gap-2"><Calendar size={16}/> {date}</div>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                       <thead className="text-xs uppercase font-bold text-slate-400 border-b border-slate-100 bg-white">
                         <tr><th className="px-6 py-3">Visitor</th><th className="px-6 py-3">Purpose</th><th className="px-6 py-3">Time</th><th className="px-6 py-3">Status</th></tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                         {logs.map(v => (
                           <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-3">
                               <p className="font-bold text-slate-800 text-sm">{v.name}</p>
                               <p className="text-xs text-slate-500">{v.phone}</p>
                               {v.vehicleNumber && <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded"><Car size={10}/> {v.vehicleNumber}</span>}
                             </td>
                             <td className="px-6 py-3"><p className="text-xs text-slate-500 font-medium">{v.purpose}</p></td>
                             <td className="px-6 py-3 text-xs font-medium text-slate-600">
                               <div className="flex items-center gap-1"><Clock size={12} className="text-emerald-500"/> In: {new Date(v.entryTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                               <div className="flex items-center gap-1 mt-1"><Clock size={12} className={v.exitTime || v.status === 'Exited' ? "text-rose-500" : "text-amber-500"}/> Out: { v.exitTime ? new Date(v.exitTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : (v.expectedExitTime ? `${new Date(v.expectedExitTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} (Est)` : '-') }</div>
                             </td>
                             <td className="px-6 py-3">
                               {v.status === 'Inside' ? <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">INSIDE</span> : 
                               (v.status === 'Expected' ? <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">EXPECTED</span> : <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">EXITED</span>)}
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              ))
            ) : <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">No visitors found.</div>
           }
        </div>
      </div>
    </div>
  );
};

export default MyVisitors;