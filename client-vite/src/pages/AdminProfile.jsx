import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import API from '../services/api';
import { User, Mail, Phone, Lock, Save, Shield, Loader, Building } from 'lucide-react';

const AdminProfile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', password: '' });
  const [securityNum, setSecurityNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ 
        name: user.name || '', 
        email: user.email || '', 
        phoneNumber: user.phoneNumber || '', 
        password: '' 
      });
    }
    fetchSecurityNumber();
  }, [user]);

  const fetchSecurityNumber = async () => {
    try {
        const { data } = await API.get('/sos/my'); 
        // Directly set whatever the backend gives us. 
        // If it's undefined, fallback to empty string.
        setSecurityNum(data.securityNumber || ''); 
    } catch (err) { 
        console.error("Failed to fetch security number", err); 
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Update Personal Profile
      const { data } = await API.put('/auth/me', form);
      if (data?.user) updateUser(data.user);

      // 2. Update Global Security Number
      await API.put('/sos/security', { securityNumber: securityNum });

      setMessage('Profile & Security Contact updated!');
      // Refetch to ensure we show the saved data
      fetchSecurityNumber();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-10 bg-slate-50">
      <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        
        <div className="flex justify-center mb-6">
           <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2 shadow-sm">
              <Shield size={40} />
           </div>
        </div>
        
        <h1 className="text-2xl font-extrabold text-slate-800 text-center mb-1">Admin Profile</h1>
        <p className="text-slate-500 text-center text-sm mb-8">Manage personal info & society contacts.</p>
        
        {message && (
          <div className="mb-6 p-3 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-center text-sm border border-emerald-200 shadow-sm flex justify-center items-center gap-2">
            <Shield size={16}/> {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* --- SECTION 1: SOCIETY SETTINGS --- */}
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Society Contacts</div>
          
          <div className="relative group">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:text-indigo-700 transition-colors" size={20}/>
              <input 
                value={securityNum}
                onChange={(e) => setSecurityNum(e.target.value)}
                placeholder="Security Guard Number"
                // EXACT SAME STYLING AS BELOW
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-indigo-100 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
              />
          </div>
          <p className="text-[10px] text-slate-400 text-right">Visible to all residents on SOS page</p>

          <div className="border-t border-slate-100 my-2"></div>

          {/* --- SECTION 2: PERSONAL DETAILS --- */}
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Personal Details</div>

          <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20}/>
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Full Name" 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-100 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                required 
              />
          </div>
          
          <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20}/>
              <input 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="Email Address" 
                type="email" 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-100 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                required 
              />
          </div>
          
          <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20}/>
              <input 
                name="phoneNumber" 
                value={form.phoneNumber} 
                onChange={handleChange} 
                placeholder="President Phone" 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-100 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
              />
          </div>
          
          <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20}/>
              <input 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="New Password (leave blank to keep)" 
                type="password" 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-100 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
              />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex justify-center items-center gap-2 mt-6"
          >
            {loading ? <Loader className="animate-spin" size={20}/> : <Save size={20}/>}
            {loading ? 'Saving...' : 'Save All Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;