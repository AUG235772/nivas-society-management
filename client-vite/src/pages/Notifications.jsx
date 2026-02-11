import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { Bell, CheckCircle, AlertCircle, Clock, Check, Calendar, History } from 'lucide-react';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => { if (user) fetchAnnouncements(); }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await API.get('/notices/all');
      setAnnouncements(data || []);
    } catch (err) { console.error('Fetch error', err); } 
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id) => {
    try {
      await API.put(`/notices/${id}/read`);
      setAnnouncements(prev => prev.map(a => a._id === id ? { ...a, readBy: [...(a.readBy || []), user.id] } : a));
    } catch (err) { console.error('Mark read error', err); }
  };

  const unreadCount = announcements.filter(n => !n.readBy?.includes(user?.id)).length;
  const currentItems = announcements.filter(a => new Date(a.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) === currentMonthStr);
  const historyItems = announcements.filter(a => new Date(a.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) !== currentMonthStr);

  const NoticeGroup = ({ data, label, icon: Icon }) => (
    <div className="mb-8">
       <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-xs tracking-wider border-b border-slate-200 pb-2 mb-4"><Icon size={14}/> {label}</div>
       <div className="grid gap-4">
         {data.map(a => {
            const read = a.readBy?.includes(user?.id);
            const isUrgent = a.priority === 'Urgent';
            return (
              <div key={a._id} className={`group relative p-6 rounded-2xl border transition-all duration-300 ${read ? 'bg-white border-slate-100 opacity-70 hover:opacity-100' : isUrgent ? 'bg-rose-50/50 border-rose-200 shadow-sm' : 'bg-white border-indigo-100 shadow-md shadow-indigo-100/50'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {isUrgent && <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Urgent</span>}
                      {!read && !isUrgent && <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">New</span>}
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Clock size={12} /> {new Date(a.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${read ? 'text-slate-600' : 'text-slate-900'}`}>{a.title}</h3>
                    <p className={`text-sm leading-relaxed ${read ? 'text-slate-400' : 'text-slate-600'}`}>{a.message}</p>
                  </div>
                  <div className="shrink-0">
                    {read ? (
                       <div className="p-2 rounded-full bg-slate-50 text-emerald-500" title="Read"><CheckCircle size={24} /></div>
                    ) : (
                       <button onClick={() => handleMarkRead(a._id)} className="p-2 rounded-full bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors shadow-sm" title="Mark as Read"><Check size={20} /></button>
                    )}
                  </div>
                </div>
              </div>
            );
         })}
       </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3"><Bell className="text-indigo-600" size={32} /> Announcements</h1><p className="text-slate-500 mt-1">Important updates from society management.</p></div>
        {unreadCount > 0 && <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> {unreadCount} Unread</div>}
      </header>

      {loading ? <p className="text-center text-slate-500 py-10">Loading updates...</p> : (
        <>
          {currentItems.length > 0 && <NoticeGroup data={currentItems} label={`Current Month (${currentMonthStr})`} icon={Calendar} />}
          {historyItems.length > 0 && <NoticeGroup data={historyItems} label="Previous History" icon={History} />}
          {announcements.length === 0 && <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 border-dashed"><AlertCircle size={40} className="mx-auto text-slate-200 mb-3" /><p className="text-slate-400 font-medium">No announcements yet</p></div>}
        </>
      )}
    </div>
  );
};

export default Notifications;