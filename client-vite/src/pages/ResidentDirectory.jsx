import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Search, User, Mail, Phone, MapPin, BadgeCheck } from 'lucide-react';

const ResidentDirectory = () => {
  const [residents, setResidents] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchResidents = async () => {
    try {
      const { data } = await API.get('/auth/residents');
      setResidents(data || []);
    } catch (err) {
      console.error('Fetch residents error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResidents(); }, []);

  const filtered = residents.filter(r => {
    const s = q.toLowerCase();
    return r.name.toLowerCase().includes(s) ||
      (r.flatNo || '').toLowerCase().includes(s) ||
      (r.phoneNumber || '').includes(s);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <User size={32} className="text-indigo-600" /> Resident Directory
          </h1>
          <p className="text-slate-500 mt-1">Contact information for society members.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by name, flat or phone..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
        {loading ? (
          <p className="p-20 text-center text-slate-500">Loading directory...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-extrabold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Flat No</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Email</th>
                  {/* <th className="px-6 py-4">Role</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {r.name[0]}
                        </div>
                        <span className="font-bold text-slate-800">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                        <MapPin size={12} /> {r.flatNo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" /> {r.phoneNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" /> {r.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {r.role === 'admin' && (
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 w-fit">
                          <BadgeCheck size={12} /> Secretary
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentDirectory;