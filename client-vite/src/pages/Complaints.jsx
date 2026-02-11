import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { AlertCircle, Camera, X, PlayCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const Complaints = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ title: '', description: '' });
  const [image, setImage] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // For Validation Errors
  const [selectedImage, setSelectedImage] = useState(null); 

  const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => { if (user) fetchMyComplaints(); }, [user]);

  const fetchMyComplaints = async () => {
    try {
      const { data } = await API.get('/complaints/my');
      setComplaints(data || []);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --- VALIDATION LOGIC ---
  const validate = () => {
    const titleWords = form.title.trim().split(/\s+/);
    if (titleWords.length < 2) return "Issue Title must have at least 2 words.";
    
    const descLen = form.description.trim().length;
    if (descLen < 20) return "Description is too short (min 20 chars).";
    if (descLen > 250) return "Description is too long (max 250 chars).";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const valError = validate();
    if (valError) { setError(valError); return; }

    setLoading(true);
    try {
      await API.post('/complaints/add', { ...form, photo: image });
      setMessage('Complaint filed successfully!');
      setForm({ title: '', description: '' }); setImage('');
      fetchMyComplaints();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Failed to file complaint'); } 
    finally { setLoading(false); }
  };

  const currentItems = complaints.filter(c => new Date(c.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) === currentMonthStr);
  const historyItems = complaints.filter(c => new Date(c.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) !== currentMonthStr);

  const ListSection = ({ data, title }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
       <div className="px-6 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-700">{title}</h3>
       </div>
       <div className="divide-y divide-slate-100">
         {data.map(c => (
           <div key={c._id} className="p-4 flex flex-col md:flex-row justify-between items-start hover:bg-slate-50 gap-4">
              <div className="flex-1">
                 <p className="font-bold text-slate-800 text-sm">{c.title}</p>
                 <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                 <div className="flex items-center gap-3 mt-2">
                    <p className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>
              {c.photo && (
                <img 
                  src={c.photo} 
                  alt="Proof" 
                  onClick={() => setSelectedImage(c.photo)}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 cursor-pointer hover:scale-105 transition-transform"
                />
              )}
              <span className={`px-2 py-1 rounded text-[10px] font-bold border shrink-0 flex items-center gap-1 ${
                c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                c.status === 'Working' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {c.status === 'Resolved' && <CheckCircle size={10}/>}
                {c.status === 'Working' && <PlayCircle size={10}/>}
                {c.status === 'Pending' && <Clock size={10}/>}
                {c.status}
              </span>
           </div>
         ))}
       </div>
    </div>
  );

  return (
    <div className="space-y-8 relative">
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={()=>setSelectedImage(null)}>
            <div className="relative bg-white p-2 rounded-2xl max-w-3xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
                <button onClick={()=>setSelectedImage(null)} className="absolute top-4 right-4 bg-slate-200 hover:bg-slate-300 p-2 rounded-full text-slate-600 transition-colors"><X size={20}/></button>
                <img src={selectedImage} alt="Proof" className="w-full h-auto rounded-xl" />
            </div>
        </div>
      )}

      <header>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3"><AlertCircle className="text-rose-600" size={32} /> Complaints</h1>
        <p className="text-slate-500 mt-1">Raise issues and track resolution status.</p>
      </header>
      
      {message && <div className="p-4 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-100">{message}</div>}
      
      {error && (
         <div className="p-4 bg-rose-50 text-rose-700 font-bold rounded-xl border border-rose-100 flex items-center gap-2">
            <AlertTriangle size={18}/> {error}
         </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM */}
        <div className="lg:col-span-1">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
             <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800"><Camera size={20}/> New Complaint</h2>
             <form onSubmit={handleSubmit} className="space-y-4">
               
               {/* FIXED: VISIBLE TEXT */}
               <input 
                 name="title" 
                 value={form.title} 
                 onChange={handleChange} 
                 placeholder="Issue Title" 
                 className="w-full p-3 rounded-xl border-2 border-slate-100 font-bold text-sm text-slate-900 focus:border-indigo-500 outline-none placeholder:text-slate-400" 
                 required 
               />
               <p className="text-[10px] text-slate-400">Min 2 words.</p>

               <textarea 
                 name="description" 
                 value={form.description} 
                 onChange={handleChange} 
                 placeholder="Description..." 
                 rows="4" 
                 className="w-full p-3 rounded-xl border-2 border-slate-100 font-bold text-sm text-slate-900 focus:border-indigo-500 outline-none placeholder:text-slate-400" 
                 required 
               />
               <p className="text-[10px] text-slate-400 flex justify-between">
                  <span>Min 20 chars.</span>
                  <span className={form.description.length > 250 ? 'text-rose-500' : ''}>{form.description.length}/250</span>
               </p>
               
               <div className="relative group cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="p-3 border-2 border-dashed border-slate-300 rounded-xl text-center text-xs font-bold text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-500 transition-colors">
                    {image ? "Image Selected ✓" : "Click to Upload Photo"}
                  </div>
               </div>
               
               <button disabled={loading} className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg text-sm transition-all active:scale-95">{loading ? 'Sending...' : 'Submit Complaint'}</button>
             </form>
           </div>
        </div>
        
        {/* LIST */}
        <div className="lg:col-span-2">
           {currentItems.length > 0 && <ListSection data={currentItems} title={`Current Month (${currentMonthStr})`} />}
           {historyItems.length > 0 && <ListSection data={historyItems} title="History" />}
           {complaints.length === 0 && <div className="text-center p-10 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">No complaints yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default Complaints;