import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Users, CreditCard, Bell, Shield, 
  LogOut, Grid, Plus, Car, DollarSign, FileText, AlertCircle, X, Menu
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const role = user?.role || 'resident';

  const navConfig = {
    admin: [
      { name: 'Dashboard', path: '/admin-dashboard', icon: Home },
      { name: 'Residents', path: '/residents', icon: Users },
      { name: 'Billing', path: '/billing', icon: CreditCard },
      { name: 'Expenses', path: '/expenses', icon: DollarSign },
      { name: 'Parking', path: '/parking', icon: Car },
      { name: 'Visitors', path: '/visitors', icon: Shield },
      { name: 'Complaints', path: '/complaints', icon: AlertCircle },
      { name: 'Notices', path: '/announcements', icon: Bell },
      { name: 'Profile', path: '/admin-profile', icon: FileText },
    ],
    resident: [
      { name: 'Home', path: '/resident-dashboard', icon: Home },
      { name: 'Directory', path: '/directory', icon: Users },
      { name: 'My Bills', path: '/bills', icon: CreditCard },
      { name: 'Expenses', path: '/expenses-view', icon: DollarSign },
      { name: 'Visitors', path: '/my-visitors', icon: Shield },
      { name: 'Parking', path: '/parking', icon: Car },
      { name: 'Complaints', path: '/complaints', icon: AlertCircle },
      { name: 'Notices', path: '/announcements', icon: Bell },
      { name: 'SOS', path: '/sos', icon: Plus },
    ]
  };

  const currentNav = navConfig[role];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-600">
      
      {/* --- DESKTOP HEADER --- */}
      <header className="hidden md:flex fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 h-20 items-center justify-between px-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-black text-xl">N</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">NIVAS</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mx-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {currentNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.name} 
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2}/>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden xl:block">
            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500 font-medium">Flat {user?.flatNo}</p>
          </div>
          <button onClick={logout} className="p-2.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pt-28 md:pb-12">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* --- MOBILE "MORE" MENU DRAWER --- */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            
            {/* Slide-up Sheet (Dark Glass Theme) */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-2xl rounded-t-3xl z-[70] p-6 pb-28 shadow-2xl border-t border-slate-700 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                <h3 className="text-xl font-extrabold text-white tracking-tight">Menu Options</h3>
                <button 
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 bg-slate-800 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Grid of All Links */}
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                {currentNav.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link 
                      key={item.name} 
                      to={item.path}
                      onClick={() => setIsMoreOpen(false)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      {/* Icon Container: Dark theme adaption */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-indigo-500/40 ring-1 ring-indigo-400' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700 group-hover:bg-slate-700 group-hover:text-white'
                      }`}>
                        <item.icon size={26} strokeWidth={2} />
                      </div>
                      
                      {/* Text Label: Light text for dark background */}
                      <span className={`text-xs font-bold text-center leading-tight ${
                        isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}>
                        {item.name}
                      </span>
                    </Link>
                  )
                })}
                
                {/* Logout Button in Menu */}
                <button 
                  onClick={logout}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-900/30 text-rose-500 border border-rose-900/50 flex items-center justify-center group-hover:bg-rose-900/50 group-hover:text-rose-400 transition-colors shadow-lg">
                    <LogOut size={26} strokeWidth={2} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-rose-400">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MOBILE BOTTOM NAV (GLASS EFFECT) --- */}
      <nav className="md:hidden fixed bottom-0 w-full z-[80] bg-slate-900/90 backdrop-blur-xl border-t border-slate-700 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center h-16 px-6">
          {/* Show first 4 items directly */}
          {currentNav.slice(0, 4).map((item) => {
             const isActive = location.pathname === item.path;
             return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={() => setIsMoreOpen(false)}
                className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-all ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className={`relative p-1 rounded-xl transition-all ${isActive ? '-translate-y-1' : ''}`}>
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>}
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>{item.name}</span>
              </Link>
             )
          })}
          
          {/* The 'More' Button */}
          <button 
            onClick={() => setIsMoreOpen(!isMoreOpen)} 
            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-all ${
              isMoreOpen ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
             <div className={`p-1 rounded-xl transition-all ${isMoreOpen ? '-translate-y-1' : ''}`}>
               <Grid size={24} strokeWidth={isMoreOpen ? 2.5 : 2} />
             </div>
             <span className={`text-[10px] font-bold mt-0.5 ${isMoreOpen ? 'text-indigo-400' : 'text-slate-500'}`}>More</span>
          </button>
        </div>
      </nav>

    </div>
  );
};

export default Layout;
