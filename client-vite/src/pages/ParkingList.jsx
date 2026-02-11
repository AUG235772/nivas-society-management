import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
// FIX: Added 'Phone' to imports
import { Car, Search, Plus, Trash2, Shield, User, AlertTriangle, Phone } from 'lucide-react';

const Parking = () => {
  const { user } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ vehicleNumber: '', vehicleModel: '', vehicleType: '4 Wheeler (Car)' });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(''); 

  useEffect(() => {
    if (user) fetchVehicles();
  }, [user]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/vehicles/all');
      setVehicles(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    const vNum = form.vehicleNumber.trim().toUpperCase();
    const vModel = form.vehicleModel.trim();

    // 1. Vehicle Number Validation (2 Letters start + Alphanumeric + Length 10-12)
    const numRegex = /^[A-Z]{2}[A-Z0-9]+$/;
    
    if (vNum.length < 10 || vNum.length > 12) {
        return "Vehicle Number must be 10-12 characters long.";
    }
    if (!numRegex.test(vNum)) {
        return "Invalid Format. Must start with 2 letters (e.g. GJ01AB1234).";
    }

    // 2. Vehicle Model Validation (2-3 words, text only)
    const modelWords = vModel.split(/\s+/); 
    const modelRegex = /^[A-Za-z\s]+$/; 

    if (!modelRegex.test(vModel)) {
        return "Vehicle Model must contain letters only.";
    }
    if (modelWords.length < 2 || modelWords.length > 3) {
        return "Model should be 2-3 words (e.g. 'Honda City').";
    }

    return null; 
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
        setError(validationError);
        return;
    }
    
    setAdding(true);
    try {
      const payload = {
        vehicleNumber: form.vehicleNumber.toUpperCase(),
        vehicleType: form.vehicleType,
        modelName: form.vehicleModel
      };

      const { data } = await API.post('/vehicles/add', payload);
      
      setVehicles([data, ...vehicles]);
      setForm({ vehicleNumber: '', vehicleModel: '', vehicleType: '4 Wheeler (Car)' });
      alert("Vehicle Added Successfully!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this vehicle?')) return;
    try {
      await API.delete(`/vehicles/${id}`);
      setVehicles(vehicles.filter(v => v._id !== id));
    } catch (err) {
      alert('Delete failed. You may not be authorized.');
    }
  };

  const isMyVehicle = (v) => {
    if (!user || !v.owner) return false;
    const vehicleOwnerId = v.owner._id ? v.owner._id.toString() : v.owner.toString();
    const currentUserId = user._id ? user._id.toString() : user.id.toString();
    return vehicleOwnerId === currentUserId;
  };

  const myVehicles = vehicles.filter(isMyVehicle);
  const societyVehicles = vehicles.filter(v => !isMyVehicle(v)).filter(v => {
     const num = v.vehicleNumber.toLowerCase();
     const name = v.owner?.name?.toLowerCase() || '';
     const query = searchTerm.toLowerCase();
     return num.includes(query) || name.includes(query);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
             <Car size={32} className="text-indigo-600" /> Parking Directory
           </h1>
           <p className="text-slate-500 mt-1">Manage personal vehicles and view society parking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Vehicle Lists */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* 1. MY VEHICLES SECTION */}
           <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
              <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 flex items-center gap-2">
                 <Shield size={20} className="text-emerald-600"/>
                 <h2 className="font-bold text-emerald-800">My Registered Vehicles</h2>
              </div>
              <div className="p-5">
                 {myVehicles.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {myVehicles.map(v => (
                       <div key={v._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-emerald-300 transition-colors">
                          <div>
                            <h3 className="text-xl font-extrabold text-slate-800">{v.vehicleNumber}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase mt-1">{v.modelName || 'Unknown Model'}</p>
                            <span className="inline-block mt-2 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                              {v.vehicleType}
                            </span>
                          </div>
                          <button onClick={() => handleDelete(v._id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors" title="Delete Vehicle">
                            <Trash2 size={20}/>
                          </button>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-6 text-slate-400 text-sm">You haven't added any vehicles yet.</div>
                 )}
              </div>
           </div>

           {/* 2. ALL SOCIETY VEHICLES */}
           <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User size={20} className="text-indigo-600"/> All Society Vehicles
                </h2>
             </div>

             {/* Search Bar */}
             <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                  name="search"
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  placeholder="Search by vehicle number or owner..." 
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium placeholder:text-slate-400"
                />
             </div>
             
             {loading ? (
               <p className="text-center py-10 text-slate-500">Loading directory...</p>
             ) : societyVehicles.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {societyVehicles.map(v => (
                   <div key={v._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">{v.vehicleNumber}</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase">{v.modelName || 'Unknown'}</p>
                        </div>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">{v.vehicleType}</span>
                      </div>
                      <div className="border-t border-slate-50 pt-3 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">{v.owner?.name?.[0] || 'U'}</div>
                            <div>
                              <p className="leading-none">{v.owner?.name || 'Unknown'}</p>
                              <p className="text-[10px] text-slate-400">Flat {v.owner?.flatNo || 'N/A'}</p>
                            </div>
                         </div>
                         {/* THIS CAUSED THE ERROR - Phone was missing from import */}
                         {v.owner?.phoneNumber && (
                           <a href={`tel:${v.owner.phoneNumber}`} className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors">
                             <Phone size={12} /> Call
                           </a>
                         )}
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">No vehicles found matching your search.</div>
             )}
           </div>
        </div>

        {/* RIGHT: Add Form */}
        <div className="lg:col-span-1">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
             <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 border-b pb-4">
               <Plus size={20} className="text-indigo-600" /> Register New Vehicle
             </h2>
             
             {error && (
               <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs font-bold text-rose-700">
                 <AlertTriangle size={16} className="shrink-0 mt-0.5"/>
                 <p>{error}</p>
               </div>
             )}

             <form onSubmit={handleAdd} className="space-y-4">
               <div>
                 <label htmlFor="vNum" className="block text-xs font-bold text-slate-500 uppercase mb-1">Vehicle Number</label>
                 <input 
                   id="vNum"
                   name="vehicleNumber"
                   value={form.vehicleNumber} 
                   onChange={e => setForm({...form, vehicleNumber: e.target.value.toUpperCase()})} 
                   placeholder="GJ01AB1234" 
                   className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase placeholder:text-slate-400"
                   required
                 />
                 <p className="text-[10px] text-slate-400 mt-1">Format: 2 letters start, 10-12 chars total.</p>
               </div>
               
               <div>
                 <label htmlFor="vModel" className="block text-xs font-bold text-slate-500 uppercase mb-1">Vehicle Model</label>
                 <input 
                   id="vModel"
                   name="vehicleModel"
                   value={form.vehicleModel} 
                   onChange={e => setForm({...form, vehicleModel: e.target.value})} 
                   placeholder="e.g. Honda City" 
                   className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                 />
                 <p className="text-[10px] text-slate-400 mt-1">2-3 words only (e.g. Maruti Swift)</p>
               </div>
               
               <div>
                 <label htmlFor="vType" className="block text-xs font-bold text-slate-500 uppercase mb-1">Vehicle Type</label>
                 <select 
                   id="vType"
                   name="vehicleType"
                   value={form.vehicleType} 
                   onChange={e => setForm({...form, vehicleType: e.target.value})} 
                   className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                 >
                   <option>4 Wheeler (Car)</option>
                   <option>2 Wheeler (Bike/Scooter)</option>
                   <option>Other</option>
                 </select>
               </div>
               
               <button 
                 type="submit" 
                 disabled={adding} 
                 className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 mt-2 flex justify-center gap-2 items-center"
               >
                 {adding ? 'Registering...' : <><Plus size={18}/> Add Vehicle</>}
               </button>
             </form>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Parking;