import { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { Phone, AlertCircle, Plus, Trash2, Shield, User, Loader } from 'lucide-react';

const SOS = () => {
  const { user } = useContext(AuthContext);
  const [sosNumbers, setSosNumbers] = useState({
    securityNumber: '',
    presidentNumber: '',
    customNumber: '',
    customName: 'Emergency Contact'
  });
  const [customInput, setCustomInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSOSNumbers();
  }, []);

  const fetchSOSNumbers = async () => {
    try {
      const { data } = await API.get('/sos/my');
      setSosNumbers(data);
      setCustomNameInput(data.customName || 'Emergency Contact');
      setCustomInput(data.customNumber || '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching SOS numbers:', error);
      setLoading(false);
    }
  };

  const handleAddCustomNumber = async (e) => {
    e.preventDefault();
    if (!customInput || !customNameInput) return;

    try {
      const { data } = await API.put('/sos/update', {
        customNumber: customInput,
        customName: customNameInput
      });
      // Update local state with response
      setSosNumbers(prev => ({
          ...prev,
          customNumber: data.sos.customNumber,
          customName: data.sos.customName
      }));
      setMessage('Contact updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveCustomNumber = async () => {
    if (window.confirm('Remove this contact?')) {
      try {
        await API.delete('/sos/remove');
        setSosNumbers(prev => ({ ...prev, customNumber: '', customName: 'Emergency Contact' }));
        setCustomInput('');
        setCustomNameInput('');
      } catch (error) { console.error(error); }
    }
  };

  const handleCall = (phoneNumber) => {
    if(phoneNumber && phoneNumber !== 'Not Set') window.location.href = `tel:${phoneNumber}`;
    else alert("Number not set by Admin yet.");
  };

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Loader className="animate-spin text-red-600" /></div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={32} />
          Emergency SOS
        </h1>
        <p className="text-slate-500 mt-1">Quick access to society emergency contacts.</p>
      </header>

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100">{message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Cards */}
        <div className="space-y-4">
          {/* Security */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Shield size={24} /></div>
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security Gate</p>
                   <p className="text-xl font-bold text-slate-800">{sosNumbers.securityNumber || 'Not Set'}</p>
                </div>
             </div>
             <button onClick={() => handleCall(sosNumbers.securityNumber)} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">
                <Phone size={20} />
             </button>
          </div>

          {/* President */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><User size={24} /></div>
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">President</p>
                   <p className="text-xl font-bold text-slate-800">{sosNumbers.presidentNumber || 'Not Set'}</p>
                </div>
             </div>
             <button onClick={() => handleCall(sosNumbers.presidentNumber)} className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-95">
                <Phone size={20} />
             </button>
          </div>

          {/* Custom Contact */}
          {sosNumbers.customNumber && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-between relative overflow-hidden transition-all hover:shadow-md">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><User size={24} /></div>
                  <div>
                     <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{sosNumbers.customName}</p>
                     <p className="text-xl font-bold text-slate-800">{sosNumbers.customNumber}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => handleCall(sosNumbers.customNumber)} className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95">
                     <Phone size={20} />
                  </button>
                  <button onClick={handleRemoveCustomNumber} className="bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 p-3 rounded-xl transition-all">
                     <Trash2 size={20} />
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* Add Contact Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit sticky top-24">
           <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
             <Plus size={20} className="text-slate-400"/> {sosNumbers.customNumber ? 'Update Contact' : 'Add Emergency Contact'}
           </h3>
           <form onSubmit={handleAddCustomNumber} className="space-y-4">
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
               <input
                 type="text"
                 placeholder="Ex: Dad, Mom, Doctor"
                 value={customNameInput}
                 onChange={(e) => setCustomNameInput(e.target.value)}
                 className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold placeholder:text-slate-400"
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
               <input
                 type="tel"
                 placeholder="+91 98765 43210"
                 value={customInput}
                 onChange={(e) => setCustomInput(e.target.value)}
                 className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold placeholder:text-slate-400"
               />
             </div>
             <button className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg">
                {sosNumbers.customNumber ? 'Update Contact' : 'Save Contact'}
             </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default SOS;