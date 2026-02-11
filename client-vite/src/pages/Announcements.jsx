import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { Bell, Trash2, Plus, AlertTriangle, Info, CheckCircle, Calendar, History } from 'lucide-react';

const Announcements = () => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', message: '', priority: 'Normal' });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // Validation Error State

  const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => { if (user?.role === 'admin') fetchAnnouncements(); }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await API.get('/notices/all');
      setAnnouncements(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
      setError(''); // Clear error when typing
  };

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    // 1. Title Word Count Check (2-3 words)
    const titleWords = form.title.trim().split(/\s+/);
    if (titleWords.length < 2 || titleWords.length > 3) {
        return "Title must be concise (2-3 words only, e.g. 'Water Supply Alert').";
    }

    // 2. Message Length Check (Max 250 chars)
    if (form.message.length > 250) {
        return `Message is too long. Limit is 250 characters. (Current: ${form.message.length})`;
    }

    return null;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Run Validation
    const validationError = validateForm();
    if (validationError) {
        setError(validationError);
        return;
    }

    setCreating(true);
    try {
      await API.post('/notices/add', form);
      setMessage('Announcement created & emailed to all residents!');
      setForm({ title: '', message: '', priority: 'Normal' });
      fetchAnnouncements();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) { setMessage('Failed to post announcement'); } finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await API.delete(`/notices/${id}`);
      setAnnouncements(a => a.filter(x => x._id !== id));
    } catch (err) { console.error(err); }
  };

  if (user?.role !== 'admin') return <div className="text-center text-rose-500 mt-20 font-bold">Access Denied</div>;

  const currentItems = announcements.filter(a => new Date(a.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) === currentMonthStr);
  const historyItems = announcements.filter(a => new Date(a.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) !== currentMonthStr);

  const NoticeList = ({ data, label, icon: Icon }) => (
    <div className="mb-8">
       <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-xs tracking-wider border-b border-slate-200 pb-2 mb-4">
          <Icon size={14}/> {label}
       </div>
       <div className="space-y-4">
         {data.map(a => (
           <div key={a._id} className={`p-6 rounded-2xl border transition-all hover:shadow-md flex gap-4 ${a.priority === 'Urgent' ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'}`}>
              <div className={`p-3 rounded-xl h-fit shrink-0 ${a.priority === 'Urgent' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {a.priority === 'Urgent' ? <AlertTriangle size={24}/> : <Info size={24}/>}
              </div>
              <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-bold text-lg ${a.priority === 'Urgent' ? 'text-rose-800' : 'text-slate-800'}`}>{a.title}</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Posted on {new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDelete(a._id)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-100 p-2 rounded-full transition-colors"><Trash2 size={18}/></button>
                  </div>
                  <p className="text-slate-600 mt-3 text-sm leading-relaxed whitespace-pre-wrap">{a.message}</p>
                  <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                     <CheckCircle size={14} className="text-emerald-500" />
                     <span>Read by {a.readBy?.length || 0} residents</span>
                  </div>
              </div>
           </div>
         ))}
       </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3"><Bell size={32} className="text-indigo-600" /> Announcements</h1><p className="text-slate-500 mt-1">Broadcast updates to all residents.</p></div>
      </div>

      {message && <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg shadow-sm flex items-center gap-2 text-emerald-800 font-bold"><CheckCircle size={18} /> {message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
             <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 border-b pb-4"><Plus size={20} className="text-indigo-600" /> New Announcement</h2>
             
             {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs font-bold text-rose-700">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5"/>
                    <p>{error}</p>
                </div>
             )}

             <form onSubmit={handleCreate} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                 {/* VISIBILITY FIX: text-slate-900 */}
                 <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Water Supply Interruption" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400" required />
                 <p className="text-[10px] text-slate-400 mt-1">Must be 2-3 words.</p>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority</label>
                 {/* VISIBILITY FIX: text-slate-900 */}
                 <select name="priority" value={form.priority} onChange={handleChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-all cursor-pointer">
                   <option className="text-slate-900">Normal</option><option className="text-rose-600 font-bold">Urgent</option>
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
                 {/* VISIBILITY FIX: text-slate-900 */}
                 <textarea name="message" value={form.message} onChange={handleChange} placeholder="Type your message here..." className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition-all h-32 resize-none placeholder:text-slate-400" required />
                 <p className="text-[10px] text-slate-400 mt-1 text-right">{form.message.length}/250 chars</p>
               </div>
               <button type="submit" disabled={creating} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg mt-2 transition-all active:scale-95">
                 {creating ? 'Broadcasting...' : 'Post & Email'}
               </button>
             </form>
           </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
           {loading ? <p className="text-center py-20 text-slate-500">Loading...</p> : (
             <>
               {currentItems.length > 0 && <NoticeList data={currentItems} label={`Current Month (${currentMonthStr})`} icon={Calendar} />}
               {historyItems.length > 0 && <NoticeList data={historyItems} label="Previous History" icon={History} />}
               {announcements.length === 0 && <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed"><Bell size={40} className="mx-auto text-slate-200 mb-3" /><p className="text-slate-400 font-medium">No announcements yet</p></div>}
             </>
           )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;