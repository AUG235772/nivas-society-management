import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { UserPlus, Trash2, Search, Mail, Phone, MapPin, Users, AlertTriangle } from 'lucide-react';

const Residents = () => {
  const { user } = useContext(AuthContext);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', flatNo: '', phoneNumber: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // New state for validation errors
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') fetchResidents();
  }, [user]);

  const fetchResidents = async () => {
    try {
      const { data } = await API.get('/residents');
      setResidents(data || []);
    } catch (err) {
      console.error('Fetch residents error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when typing
  };

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    // 1. Name Check (Only Alphabets & Spaces)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(form.name)) {
      return "Name must contain only letters and spaces (No numbers).";
    }

    // 2. Email Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "Please enter a valid email address.";
    }

    // 3. Flat No Check (Max 10 chars, Alphanumeric ok)
    if (form.flatNo.length > 10) {
      return "Flat Number is too long (Max 10 characters).";
    }

    // 4. Phone Check (Exactly 10 Digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phoneNumber)) {
      return "Phone number must be exactly 10 digits.";
    }

    // 5. Password Check
    if (form.password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    return null; // No errors
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
      await API.post('/auth/add-user', form);
      setMessage(`Resident created successfully! Password: ${form.password}`);
      setForm({ name: '', email: '', flatNo: '', phoneNumber: '', password: '' });
      fetchResidents();
      setTimeout(() => setMessage(''), 8000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add resident');
      setTimeout(() => setError(''), 5000);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this resident? This will delete their bills and history.')) return;
    try {
      await API.delete(`/residents/${id}`);
      setResidents(r => r.filter(x => x._id !== id));
    } catch (err) {
      alert('Delete failed. Check console for details.');
    }
  };

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.flatNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.role !== 'admin') return <div className="text-center text-rose-500 mt-10 font-bold">Access denied</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
             <Users size={32} className="text-indigo-600" /> Residents Management
           </h1>
           <p className="text-slate-500 mt-1">Manage society members and access.</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input 
             value={searchTerm} 
             onChange={e => setSearchTerm(e.target.value)} 
             placeholder="Search resident..." 
             className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm placeholder:text-slate-400"
           />
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg shadow-sm">
          <p className="text-emerald-800 font-bold">{message}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg shadow-sm flex items-center gap-2">
          <AlertTriangle size={20} className="text-rose-600"/>
          <p className="text-rose-800 font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Resident Form */}
        <div className="lg:col-span-1">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
             <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 border-b pb-4">
               <UserPlus size={20} className="text-indigo-600" /> Add New Resident
             </h2>
             <form onSubmit={handleCreate} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                 {/* FIXED: text-slate-900 for visibility */}
                 <input 
                   name="name" 
                   value={form.name} 
                   onChange={handleChange} 
                   placeholder="John Doe" 
                   className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400" 
                   required 
                 />
               </div>
               
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                 <input 
                   name="email" 
                   value={form.email} 
                   onChange={handleChange} 
                   placeholder="john@example.com" 
                   type="email" 
                   className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400" 
                   required 
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Flat No</label>
                   <input 
                     name="flatNo" 
                     value={form.flatNo} 
                     onChange={handleChange} 
                     placeholder="101" 
                     className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400" 
                     required 
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                   <input 
                     name="phoneNumber" 
                     value={form.phoneNumber} 
                     onChange={handleChange} 
                     placeholder="9876543210" 
                     className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400" 
                     required 
                   />
                 </div>
               </div>
               
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                 <input 
                   name="password" 
                   value={form.password} 
                   onChange={handleChange} 
                   placeholder="Set initial password" 
                   type="text" 
                   className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400" 
                   required 
                 />
               </div>
               
               <button 
                 type="submit" 
                 disabled={creating} 
                 className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 mt-2"
               >
                 {creating ? 'Creating...' : 'Register Resident'}
               </button>
             </form>
           </div>
        </div>

        {/* Residents List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <h2 className="font-bold text-slate-800">All Residents</h2>
               <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{filteredResidents.length} Total</span>
             </div>
             
             {loading ? (
               <p className="text-center text-slate-500 py-20">Loading residents...</p>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                     <tr>
                       <th className="px-6 py-4">Name</th>
                       <th className="px-6 py-4">Contact</th>
                       <th className="px-6 py-4">Flat</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {filteredResidents.map(r => (
                       <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{r.name}</p>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                               <Mail size={12}/> {r.email}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-sm text-slate-600 flex items-center gap-2">
                               <Phone size={14} className="text-slate-400" /> {r.phoneNumber}
                            </span>
                         </td>
                         <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-100">
                               <MapPin size={12} /> {r.flatNo}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDelete(r._id)} 
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                              title="Delete Resident"
                            >
                              <Trash2 size={18} />
                            </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Residents;