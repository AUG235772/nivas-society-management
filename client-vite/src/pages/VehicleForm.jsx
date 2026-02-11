import React, { useState } from 'react';
import API from '../services/api';
import { Plus } from 'lucide-react';

const VehicleForm = ({ onAdded }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: '4 Wheeler (Car)',
    vehicleModel: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    const vNum = formData.vehicleNumber.trim().toUpperCase();
    const vModel = formData.vehicleModel.trim();
    const numRegex = /^[A-Z]{2}[A-Z0-9]+$/;
    if (vNum.length < 10 || vNum.length > 12) return "Vehicle Number must be 10-12 chars.";
    if (!numRegex.test(vNum)) return "Invalid format (e.g. GJ01AB1234)";
    
    const modelRegex = /^[A-Za-z\s]+$/;
    const words = vModel.split(/\s+/);
    if (!modelRegex.test(vModel)) return "Model must be letters only.";
    if (words.length < 2 || words.length > 3) return "Model must be 2-3 words.";
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const valError = validate();
    if (valError) { setError(valError); return; }

    setLoading(true);
    setError('');

    try {
      await API.post('/vehicles/add', {
          ...formData,
          vehicleNumber: formData.vehicleNumber.toUpperCase(),
          modelName: formData.vehicleModel // Mapping key correctly
      });
      setFormData({ vehicleNumber: '', vehicleType: '4 Wheeler (Car)', vehicleModel: '' });
      if (onAdded) onAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</div>}
      
      <div>
        <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Vehicle Number</label>
        <input
          type="text"
          placeholder="Ex: GJ01AB1234"
          // FIXED: text-slate-900
          className="w-full p-3 rounded-xl bg-white border-2 border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 transition-all uppercase"
          value={formData.vehicleNumber}
          onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Vehicle Model</label>
        <input
          type="text"
          placeholder="Ex: Honda City"
          // FIXED: text-slate-900
          className="w-full p-3 rounded-xl bg-white border-2 border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 transition-all"
          value={formData.vehicleModel}
          onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Vehicle Type</label>
        <div className="relative">
          <select
            // FIXED: text-slate-900
            className="w-full p-3 rounded-xl bg-white border-2 border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer"
            value={formData.vehicleType}
            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
          >
            <option>4 Wheeler (Car)</option>
            <option>2 Wheeler (Bike/Scooter)</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
      >
        {loading ? 'Registering...' : <><Plus size={20} strokeWidth={3} /> Add Vehicle</>}
      </button>
    </form>
  );
};

export default VehicleForm;