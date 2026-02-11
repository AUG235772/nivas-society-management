import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import API from '../services/api';
import { motion } from 'framer-motion';
import { 
  Users, CreditCard, AlertCircle, TrendingUp, 
  Activity, ArrowRight, Shield, FileText, Bell, Loader
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    residents: 0,
    complaints: 0,
    collection: 0,
    visitors: 0,
    dueAmount: 0,
    myComplaints: 0,
    myVisitors: 0,
    announcements: 0,
    recentNotices: [],
    collectionPercent: 0
  });

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    // 1. Safety Timeout: Force stop loading after 4 seconds if API hangs
    const safetyTimer = setTimeout(() => {
        if(loading) setLoading(false);
    }, 4000);

    try {
      const isAdmin = user?.role === 'admin';
      
      // 2. Use allSettled so one failure doesn't crash the whole dashboard
      const results = await Promise.allSettled([
        API.get(isAdmin ? '/bills/all' : '/bills/my'),
        API.get(isAdmin ? '/visitors/all' : '/visitors/my-flat'),
        API.get('/notices/all'),
        API.get(isAdmin ? '/complaints/all' : '/complaints/my'),
        isAdmin ? API.get('/auth/residents') : Promise.resolve({ data: [] })
      ]);

      // Helper to safely extract data
      const unwrap = (res) => (res.status === 'fulfilled' ? res.value.data : []);

      const bills = unwrap(results[0]);
      const visitors = unwrap(results[1]);
      const notices = unwrap(results[2]);
      const complaints = unwrap(results[3]);
      const residents = unwrap(results[4]);

      // Logic safely handles Arrays or Objects
      let totalAmount = 0, paidAmount = 0, pendingAmount = 0;
      const billsArray = Array.isArray(bills) ? bills : (bills.bills || []);

      billsArray.forEach(b => {
        const amt = b.amount || 0;
        totalAmount += amt;
        if (b.status === 'Paid') paidAmount += amt;
        else pendingAmount += amt;
      });

      const percent = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

      setStats({
        residents: Array.isArray(residents) ? residents.length : 0,
        complaints: Array.isArray(complaints) ? complaints.length : 0,
        collection: paidAmount,
        visitors: Array.isArray(visitors) ? visitors.filter(v => v.status === 'Inside').length : 0,
        dueAmount: pendingAmount,
        myComplaints: Array.isArray(complaints) ? complaints.length : 0,
        myVisitors: Array.isArray(visitors) ? visitors.length : 0,
        announcements: Array.isArray(notices) ? notices.length : 0,
        recentNotices: Array.isArray(notices) ? notices.slice(0, 3) : [],
        collectionPercent: percent
      });

    } catch (error) {
      console.error('Critical Dashboard Error:', error);
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false); // Ensure loading always stops
    }
  };

  // ... (Keep existing StatsCard, ActionButton, and Return logic) ...
  // Paste the rest of your UI components (StatsCard, ActionButton) here exactly as they were
  
  const StatsCard = ({ title, value, icon: Icon, colorClass, link }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      onClick={() => link && navigate(link)}
      className="group relative overflow-hidden p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity ${colorClass}`}>
        <Icon size={100} />
      </div>
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl ${colorClass.replace('text-', 'bg-').replace('500', '50').replace('600', '50')} ${colorClass}`}>
            <Icon size={20} />
          </div>
          <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">{title}</h3>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h2>
        {link && <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 group-hover:gap-3 transition-all">View Details <ArrowRight size={12} /></div>}
      </div>
    </motion.div>
  );

  const ActionButton = ({ label, icon: Icon, onClick, colorClass }) => (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-3 transition-all group"
    >
      <div className={`p-3 rounded-full bg-slate-50 group-hover:bg-indigo-50 transition-colors ${colorClass}`}><Icon size={24} /></div>
      <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-700">{label}</span>
    </motion.button>
  );

  if (loading) return <div className="flex justify-center h-[50vh] items-center"><Loader className="animate-spin text-indigo-600" /></div>;
  if (!user) return null;
  const isAdmin = user.role === 'admin';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Hello, <span className="text-indigo-600">{user.name}</span></h1>
          <p className="text-slate-500 mt-1 font-medium">{isAdmin ? "Society Overview" : `Flat ${user.flatNo} • Welcome home.`}</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span>
          <span className="text-xs font-bold text-emerald-700">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatsCard title="Residents" value={stats.residents} icon={Users} colorClass="text-blue-600" link="/residents" />
            <StatsCard title="Complaints" value={stats.complaints} icon={AlertCircle} colorClass="text-orange-500" link="/complaints" />
            <StatsCard title="Collection" value={`₹ ${stats.collection.toLocaleString()}`} icon={TrendingUp} colorClass="text-emerald-600" link="/billing" />
            <StatsCard title="Visitors" value={stats.visitors} icon={Shield} colorClass="text-purple-600" link="/visitors" />
          </>
        ) : (
          <>
            <StatsCard title="Due Amount" value={`₹ ${stats.dueAmount.toLocaleString()}`} icon={CreditCard} colorClass="text-rose-500" link="/bills" />
            <StatsCard title="Complaints" value={stats.myComplaints} icon={FileText} colorClass="text-amber-500" link="/complaints" />
            <StatsCard title="Visitors" value={stats.myVisitors} icon={Users} colorClass="text-indigo-500" link="/my-visitors" />
            <StatsCard title="Announcements" value={stats.announcements} icon={Bell} colorClass="text-orange-500" link="/announcements" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={18} className="text-indigo-500"/> Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {isAdmin ? (
                 <>
                   <ActionButton label="Add Resident" icon={Users} onClick={() => navigate('/residents')} colorClass="text-blue-600" />
                   <ActionButton label="New Bill" icon={CreditCard} onClick={() => navigate('/billing')} colorClass="text-emerald-600" />
                   <ActionButton label="Post Notice" icon={AlertCircle} onClick={() => navigate('/announcements')} colorClass="text-purple-600" />
                   <ActionButton label="Gate Pass" icon={Shield} onClick={() => navigate('/visitors')} colorClass="text-orange-600" />
                 </>
              ) : (
                 <>
                   <ActionButton label="Pay Now" icon={CreditCard} onClick={() => navigate('/bills')} colorClass="text-emerald-600" />
                   <ActionButton label="Invite Guest" icon={Users} onClick={() => navigate('/my-visitors')} colorClass="text-blue-600" />
                   <ActionButton label="Complain" icon={AlertCircle} onClick={() => navigate('/complaints')} colorClass="text-rose-600" />
                   <ActionButton label="SOS Alert" icon={Shield} onClick={() => navigate('/sos')} colorClass="text-red-600 bg-red-50" />
                 </>
              )}
            </div>
          </section>
          
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-700 p-8 text-white shadow-xl">
             <div className="relative z-10">
               <h3 className="text-xl font-bold">Maintenance Status</h3>
               <p className="text-indigo-100 text-sm mt-1">{isAdmin ? `Collection is ${stats.collectionPercent}% complete.` : (stats.dueAmount > 0 ? "You have pending dues." : "Payments up to date.")}</p>
               <div className="w-full bg-black/30 rounded-full h-3 mt-4 overflow-hidden border border-white/10">
                 <motion.div initial={{ width: 0 }} animate={{ width: `${stats.collectionPercent}%` }} transition={{ duration: 1.5 }} className="bg-emerald-400 h-full rounded-full"></motion.div>
               </div>
             </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Recent Notices</h3>
            <button onClick={() => navigate('/announcements')} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">View All</button>
          </div>
          <div className="space-y-6">
            {stats.recentNotices.length > 0 ? stats.recentNotices.map(n => (
              <div key={n._id} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-100 shrink-0 flex items-center justify-center"><Bell size={16} className="text-indigo-600" /></div>
                <div><p className="text-sm font-bold text-slate-800 line-clamp-1">{n.title}</p><p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p></div>
              </div>
            )) : <p className="text-center text-slate-400 text-sm py-4">No recent notices</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;