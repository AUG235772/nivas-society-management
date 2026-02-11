import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { Download, CheckCircle, Clock, ExternalLink, Calendar, History, Trash2, PlayCircle, X } from 'lucide-react';

const ComplaintsAdmin = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); 

  const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => { if (user?.role === 'admin') fetchAll(); }, [user]);

  const fetchAll = async () => {
    try {
      const { data } = await API.get('/complaints/all');
      setComplaints(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    if(!window.confirm(`Mark this complaint as '${status}'?`)) return;
    try {
      await API.put(`/complaints/status/${id}`, { status });
      setComplaints(complaints.map(c => c._id === id ? { ...c, status } : c));
    } catch (err) { alert("Error updating status"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this complaint permanently?")) return;
    try {
      await API.delete(`/complaints/${id}`);
      setComplaints(complaints.filter(c => c._id !== id));
    } catch (err) { alert("Error deleting complaint"); }
  }

  // ✅ FIXED EXPORT FUNCTION
  const handleExport = async () => {
    try {
      const response = await API.get('/export/complaints', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Complaints_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to download report. Please check server logs.");
    }
  };

  const currentItems = complaints.filter(c => new Date(c.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) === currentMonthStr);
  const historyItems = complaints.filter(c => new Date(c.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) !== currentMonthStr);

  const TableSection = ({ data, title, icon: Icon }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
       <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Icon size={20} className="text-indigo-600"/>
          <h2 className="font-bold text-slate-800">{title}</h2>
          <span className="ml-auto text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{data.length} Records</span>
       </div>
       <div className="overflow-x-auto">
         <table className="w-full text-left">
           <thead className="bg-white text-slate-400 text-xs uppercase font-bold border-b border-slate-100">
             <tr><th className="px-6 py-4">Resident</th><th className="px-6 py-4">Issue</th><th className="px-6 py-4">Proof</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
             {data.map(c => (
               <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                 <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{c.user?.name}</p>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500">FLAT {c.user?.flatNo}</span>
                 </td>
                 <td className="px-6 py-4 max-w-xs">
                    <p className="font-bold text-sm truncate text-slate-800">{c.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
                 </td>
                 <td className="px-6 py-4">
                    {c.photo ? (
                        <img 
                          src={c.photo} 
                          alt="Proof" 
                          onClick={()=>setSelectedImage(c.photo)}
                          className="w-10 h-10 rounded object-cover cursor-pointer border border-slate-200 hover:scale-110 transition-transform"
                        />
                    ) : <span className="text-[10px] text-slate-300 italic">No Proof</span>}
                 </td>
                 <td className="px-6 py-4">
                    {c.status === 'Resolved' ? 
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold flex w-fit items-center gap-1 border border-emerald-200"><CheckCircle size={10}/> Resolved</span> :
                     (c.status === 'Working' ? 
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold flex w-fit items-center gap-1 border border-blue-200"><PlayCircle size={10}/> Working</span> :
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold flex w-fit items-center gap-1 border border-amber-200"><Clock size={10}/> Pending</span>)
                    }
                 </td>
                 <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        {c.status === 'Pending' && (
                            <>
                            <button onClick={() => updateStatus(c._id, 'Working')} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">Start Job</button>
                            <button onClick={() => updateStatus(c._id, 'Resolved')} className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all">Resolve</button>
                            </>
                        )}
                        {c.status === 'Working' && (
                            <button onClick={() => updateStatus(c._id, 'Resolved')} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-md">✓ Mark Done</button>
                        )}
                        {c.status === 'Resolved' && (
                            <button onClick={() => handleDelete(c._id)} className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-100 transition-all flex items-center gap-1">
                                <Trash2 size={12}/> Delete
                            </button>
                        )}
                    </div>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
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

      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-slate-800">Complaints</h1><p className="text-slate-500">Manage resident issues</p></div>
        <button onClick={handleExport} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"><Download size={16}/> Export Report</button>
      </div>

      {loading ? <p className="text-center text-slate-400 py-10">Loading complaints...</p> : (
        <>
          {currentItems.length > 0 && <TableSection data={currentItems} title={`Current Month (${currentMonthStr})`} icon={Calendar} />}
          {historyItems.length > 0 && <TableSection data={historyItems} title="Previous History" icon={History} />}
          {complaints.length === 0 && <div className="p-16 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400">No complaints found.</div>}
        </>
      )}
    </div>
  );
};

export default ComplaintsAdmin;