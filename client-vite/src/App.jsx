import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ParkingList from './pages/ParkingList';
import SOS from './pages/SOS';
import Bills from './pages/Bills';
import Residents from './pages/Residents';
import Billing from './pages/Billing';
import Announcements from './pages/Announcements';
import Notifications from './pages/Notifications';
import MyVisitors from './pages/MyVisitors';
import VisitorsAdmin from './pages/VisitorsAdmin';
import Complaints from './pages/Complaints';
import ComplaintsAdmin from './pages/ComplaintsAdmin';
import AdminProfile from './pages/AdminProfile';
import VisitorEntryPublic from './pages/VisitorEntryPublic';
import ExpensesAdmin from './pages/ExpensesAdmin';
import ExpensesResident from './pages/ExpensesResident';

import ResidentDirectory from './pages/ResidentDirectory';
import DeveloperDashboard from './pages/DeveloperDashboard';

// Helper Component to Wrap Layout
const AppLayout = ({ children }) => {
  return <Layout>{children}</Layout>;
};

function App() {
  const { user, loading } = useContext(AuthContext);

  // Inside App.jsx
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-bold tracking-widest uppercase text-indigo-900">Starting Nivas...</div>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Public Routes (No Sidebar) */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/visitor-entry" element={<VisitorEntryPublic />} />

        {/* Protected Routes (With Sidebar Layout) */}
        <Route path="/" element={
          user ? (
            user.role === 'developer' ? <Navigate to="/developer-dashboard" /> :
              user.role === 'admin' ? <Navigate to="/admin-dashboard" /> : <Navigate to="/resident-dashboard" />
          ) : <Navigate to="/login" />
        } />

        <Route path="/developer-dashboard" element={
          user && user.role === 'developer' ? <DeveloperDashboard /> : <Navigate to="/login" />
        } />

        <Route path="/admin-dashboard" element={
          user && user.role === 'admin' ? <AppLayout><Dashboard /></AppLayout> : <Navigate to="/" />
        } />

        <Route path="/resident-dashboard" element={
          user && user.role === 'resident' ? <AppLayout><Dashboard /></AppLayout> : <Navigate to="/" />
        } />

        <Route path="/parking" element={
          user ? <AppLayout><ParkingList /></AppLayout> : <Navigate to="/login" />
        } />

        <Route path="/residents" element={
          user && user.role === 'admin' ? <AppLayout><Residents /></AppLayout> : <Navigate to="/" />
        } />

        <Route path="/billing" element={
          user && user.role === 'admin' ? <AppLayout><Billing /></AppLayout> : <Navigate to="/" />
        } />

        <Route path="/expenses" element={
          user && user.role === 'admin' ? <AppLayout><ExpensesAdmin /></AppLayout> : <Navigate to="/login" />
        } />

        <Route path="/expenses-view" element={
          user ? <AppLayout><ExpensesResident /></AppLayout> : <Navigate to="/login" />
        } />

        <Route path="/directory" element={
          user ? <AppLayout><ResidentDirectory /></AppLayout> : <Navigate to="/login" />
        } />

        <Route path="/visitors" element={
          user && user.role === 'admin' ? <AppLayout><VisitorsAdmin /></AppLayout> : <Navigate to="/" />
        } />

        <Route path="/announcements" element={
          user ? (
            user.role === 'admin' ? <AppLayout><Announcements /></AppLayout> : <AppLayout><Notifications /></AppLayout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/bills" element={
          user ? <AppLayout><Bills /></AppLayout> : <Navigate to="/login" />
        } />

        <Route path="/my-visitors" element={
          user ? <AppLayout><MyVisitors /></AppLayout> : <Navigate to="/login" />
        } />

        <Route path="/complaints" element={
          user ? (
            user.role === 'admin' ? <AppLayout><ComplaintsAdmin /></AppLayout> : <AppLayout><Complaints /></AppLayout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/admin-profile" element={
          user && user.role === 'admin' ? <AppLayout><AdminProfile /></AppLayout> : <Navigate to="/login" />
        } />

        <Route path="/sos" element={
          user && user.role === 'resident' ? <AppLayout><SOS /></AppLayout> : <Navigate to="/" />
        } />

      </Routes>
    </Router>
  );
}

export default App;