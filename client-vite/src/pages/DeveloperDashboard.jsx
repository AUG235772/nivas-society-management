import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { Building2, Plus, LogOut, Key, Mail, Shield, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeveloperDashboard = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [societies, setSocieties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedSociety, setSelectedSociety] = useState(null);
    const [resetPassword, setResetPassword] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        adminEmail: '',
        adminPassword: '',
        secretKey: ''
    });

    useEffect(() => {
        fetchSocieties();
    }, []);

    const fetchSocieties = async () => {
        try {
            const { data } = await API.get('/developer/societies');
            setSocieties(data);
        } catch (err) {
            console.error('Failed to fetch societies', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await API.post('/developer/societies', formData);
            alert('Society Created Successfully!');
            setShowForm(false);
            setFormData({ name: '', address: '', adminEmail: '', adminPassword: '', secretKey: '' });
            fetchSocieties();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create society');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await API.post(`/developer/societies/${selectedSociety._id}/reset-password`, { password: resetPassword });
            alert('Admin Password Reset Successfully');
            setResetPassword('');
            // Optional: Close modal or keep open
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reset password');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to DELETE ${selectedSociety.name}? This will delete ALL data associated with it. This action cannot be undone.`)) return;

        try {
            await API.delete(`/developer/societies/${selectedSociety._id}`);
            alert('Society Deleted Successfully');
            setSelectedSociety(null);
            fetchSocieties();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete society');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/developer-login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold">
                            Dev
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Nivas Developer</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Societies Management</h2>
                        <p className="text-slate-500">Manage all registered societies and admins.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                        <Plus size={20} /> {showForm ? 'Cancel' : 'Add Society'}
                    </button>
                </div>

                {/* Create Form */}
                {showForm && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Building2 className="text-indigo-600" /> New Society Details
                        </h3>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Society Name</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. Nivas Heights"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Full Address"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Email</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="admin@society.com"
                                    type="email"
                                    value={formData.adminEmail}
                                    onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Password</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Initial Password"
                                    value={formData.adminPassword}
                                    onChange={e => setFormData({ ...formData, adminPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Secret Key</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Unique Secret Key for Integration"
                                    value={formData.secretKey}
                                    onChange={e => setFormData({ ...formData, secretKey: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                                    Create Society
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {societies.map(society => (
                        <div
                            key={society._id}
                            onClick={() => setSelectedSociety(society)}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Building2 size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${society.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {society.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 mb-1">{society.name}</h3>
                            <p className="text-slate-500 text-sm mb-4 h-10 line-clamp-2">{society.address}</p>

                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Shield size={16} className="text-indigo-500" />
                                    <span className="truncate">{society.adminEmail}</span>
                                </div>

                                {/* Secret Key (Hidden for security normally, but requested to show?) */}
                                {/* "assign admin mail and password and secretkey" implies input, not necessarily view. But for dev dashboard let's show masked or something. */}
                                {/* User didn't say to show it. I'll show it for now as it helps dev. */}
                            </div>
                        </div>
                    ))}

                    {societies.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center text-slate-400">
                            No societies found. Create one to get started.
                        </div>
                    )}
                </div>

                {/* Society Detail Modal */}
                {selectedSociety && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 leading-tight">{selectedSociety.name}</h3>
                                    <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm">
                                        <Building2 size={14} />
                                        <span>{selectedSociety.address}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedSociety(null)}
                                    className="p-2 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full shadow-sm border border-slate-200 transition-all hover:scale-105 active:scale-95"
                                >
                                    <LogOut className="rotate-180" size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 group hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase mb-2">
                                            <Mail size={12} /> Admin Email
                                        </div>
                                        <div className="font-semibold text-indigo-900 truncate" title={selectedSociety.adminEmail}>
                                            {selectedSociety.adminEmail}
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-2xl border ${selectedSociety.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-rose-50 border-rose-100 text-rose-900'}`}>
                                        <div className={`text-xs font-bold uppercase mb-2 ${selectedSociety.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            Status
                                        </div>
                                        <div className="font-bold flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${selectedSociety.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                            {selectedSociety.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                </div>

                                {/* Reset Password Section */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                            <Key size={14} />
                                        </div>
                                        Admin Access Control
                                    </h4>

                                    <form onSubmit={handleResetPassword} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter new admin password"
                                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                            value={resetPassword}
                                            onChange={e => setResetPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!resetPassword}
                                        >
                                            Reset
                                        </button>
                                    </form>
                                    <p className="text-[10px] text-slate-400 pl-1">
                                        * This will immediately invalidate the current admin password.
                                    </p>
                                </div>

                                {/* Danger Zone */}
                                <div className="pt-6 border-t border-slate-100">
                                    <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
                                        <h4 className="font-bold text-rose-700 mb-2 flex items-center gap-2">
                                            <Trash2 size={16} /> Delete Society
                                        </h4>
                                        <p className="text-xs text-rose-600/80 mb-4 leading-relaxed">
                                            This action is irreversible. It will permanently delete the society and all associated data including residents, bills, and history.
                                        </p>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full py-3 bg-white hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold rounded-xl text-sm transition-all shadow-sm active:scale-95"
                                        >
                                            Confirm Deletion
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeveloperDashboard;
