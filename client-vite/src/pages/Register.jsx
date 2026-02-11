import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Home, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', flatNo: '', phoneNumber: '', role: 'resident', adminSecret: ''
  });

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      alert("Registration Successful!");
      navigate('/login');
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-black/80"></div>
      </div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-lg p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl animate-fade-in">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Join <span className="text-blue-400">Nivas</span></h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input name="name" placeholder="Full Name" className="w-full bg-black/20 text-white border border-gray-600 rounded-lg py-2.5 pl-10 focus:border-blue-400 outline-none" onChange={handleChange} required />
            </div>
            <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input name="phoneNumber" placeholder="Phone" className="w-full bg-black/20 text-white border border-gray-600 rounded-lg py-2.5 pl-10 focus:border-blue-400 outline-none" onChange={handleChange} required />
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input name="email" type="email" placeholder="Email Address" className="w-full bg-black/20 text-white border border-gray-600 rounded-lg py-2.5 pl-10 focus:border-blue-400 outline-none" onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input name="password" type="password" placeholder="Password" className="w-full bg-black/20 text-white border border-gray-600 rounded-lg py-2.5 pl-10 focus:border-blue-400 outline-none" onChange={handleChange} required />
             </div>
             <div className="relative">
                <Home className="absolute left-3 top-3 text-gray-400" size={18} />
                <input name="flatNo" placeholder="Flat No (A-101)" className="w-full bg-black/20 text-white border border-gray-600 rounded-lg py-2.5 pl-10 focus:border-blue-400 outline-none" onChange={handleChange} required />
             </div>
          </div>

          <div className="relative">
            <select name="role" className="w-full bg-black/20 text-white border border-gray-600 rounded-lg py-2.5 px-4 focus:border-blue-400 outline-none" onChange={handleChange} value={formData.role}>
              <option value="resident" className="text-black">Resident Member</option>
              <option value="admin" className="text-black">Secretary (Admin)</option>
            </select>
          </div>

          {formData.role === 'admin' && (
            <div className="relative animate-fade-in bg-red-500/10 border border-red-500/50 p-3 rounded-lg">
               <ShieldCheck className="absolute left-3 top-3 text-red-400" size={18} />
               <input name="adminSecret" type="password" placeholder="Secret Society Code" className="w-full bg-transparent text-white placeholder-red-300/50 py-1 pl-8 outline-none" onChange={handleChange} required />
            </div>
          )}
          
          <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all">
            Create Account <ArrowRight size={18} />
          </button>
        </form>
        
        <p className="mt-4 text-center text-gray-300 text-sm">
           Already a member? <Link to="/login" className="text-blue-300 hover:text-white underline">Login Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;