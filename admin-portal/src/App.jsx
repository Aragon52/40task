import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Briefcase, TrendingUp, Activity } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import UserManagement from './pages/UserManagement';
import SLAOwnership from './pages/SLAOwnership';
import SLAAdmins from './pages/SLAAdmins';
import SLAStaff from './pages/SLAStaff';
import FinancialCenter from './pages/FinancialCenter';
import OrdersTasking from './pages/OrdersTasking';
import TemplatesSummary from './pages/TemplatesSummary';
import OrdersInProgress from './pages/OrdersInProgress';
import Settings from './pages/Settings';
import SupportChat from './pages/SupportChat';
import Login from './pages/Login';
import { supabase } from './supabase';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [session, setSession] = useState(null);
  const [stats, setStats] = useState({
    payoutRequests: 0,
    totalDeposits: 0,
    newUsers: 0,
    matchedTasks: 0,
    onlineUsers: 0
  });

  // Load session to guard tabs
  const loadSession = async () => {
    const saved = localStorage.getItem('cb_admin_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.role === 'Staff') {
        const { data, error } = await supabase
          .from('cb_staff')
          .select('profile_photo')
          .eq('staff_id', parsed.accountId)
          .single();
        if (!error && data) {
          let perms = {
            userManagement: true,
            ordersInProgress: true,
            orderTasking: false,
            financialCenter: false,
            supportChat: false
          };
          if (data.profile_photo) {
            try {
              const parsedPerms = JSON.parse(data.profile_photo);
              if (parsedPerms && typeof parsedPerms === 'object') {
                perms = { ...perms, ...parsedPerms };
              }
            } catch (e) {
              // Ignore
            }
          }
          parsed.permissions = perms;
          localStorage.setItem('cb_admin_session', JSON.stringify(parsed));
        }
      }
      setSession(parsed);
    } else {
      setSession(null);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // 1. Total Approved Payout Requests sum
      const { data: withdrawals, error: wthError } = await supabase
        .from('cb_withdrawals')
        .select('amount')
        .eq('status', 'Approved');
      
      let payoutSum = 0;
      if (!wthError && withdrawals) {
        payoutSum = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);
      }

      // 2. Total Approved Deposits sum
      const { data: deposits, error: depError } = await supabase
        .from('cb_deposits')
        .select('amount')
        .eq('status', 'Approved');

      let depositSum = 0;
      if (!depError && deposits) {
        depositSum = deposits.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
      }

      // 3. New registration nodes (total users in the database)
      const { count: usersCount, error: usersError } = await supabase
        .from('cb_users')
        .select('*', { count: 'exact', head: true });

      // 4. Matched tasks submissions (total completed orders in cb_orders)
      const { count: ordersCount, error: ordersError } = await supabase
        .from('cb_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Success');

      // 5. Total active online users count
      const { count: onlineCount, error: onlineError } = await supabase
        .from('cb_users')
        .select('*', { count: 'exact', head: true })
        .eq('online', 'Online');

      setStats({
        payoutRequests: payoutSum,
        totalDeposits: depositSum,
        newUsers: usersCount || 0,
        matchedTasks: ordersCount || 0,
        onlineUsers: onlineCount || 0
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  useEffect(() => {
    loadSession();
    fetchDashboardStats();
    // Poll for switcher changes and stats updates
    const interval = setInterval(() => {
      if (document.hidden) return; // Save bandwidth when tab is in background!
      loadSession();
      fetchDashboardStats();
    }, 15000); // Poll every 15 seconds instead of 3
    return () => clearInterval(interval);
  }, []);

  // Set default tab safely if switching roles redirects to an unauthorized tab
  useEffect(() => {
    if (session) {
      if (session.role === 'Staff') {
        const perms = session.permissions || {
          userManagement: true,
          ordersInProgress: true,
          orderTasking: false,
          financialCenter: false,
          supportChat: false
        };
        
        if (['ownership', 'sla-admins', 'settings'].includes(activeTab)) {
          setActiveTab('dashboard');
        } else if (activeTab === 'user-management' && !perms.userManagement) {
          setActiveTab('dashboard');
        } else if (activeTab === 'orders-tasking' && !perms.orderTasking) {
          setActiveTab('dashboard');
        } else if (activeTab === 'templates-summary' && !perms.orderTasking) {
          setActiveTab('dashboard');
        } else if (activeTab === 'orders-in-progress' && !perms.ordersInProgress) {
          setActiveTab('dashboard');
        } else if (activeTab === 'financial-center' && !perms.financialCenter) {
          setActiveTab('dashboard');
        } else if (activeTab === 'support-chat' && !perms.supportChat) {
          setActiveTab('dashboard');
        }
      } else if (session.role === 'Admin') {
        if (['ownership'].includes(activeTab)) {
          setActiveTab('dashboard');
        }
      }
    }
  }, [session, activeTab]);

  const getActiveTabLabel = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'ownership': return 'SLA System Ownership';
      case 'sla-admins': return 'SLA Administrator Nodes';
      case 'sla-staff': return 'SLA Staff Members';
      case 'user-management': return 'User Management';
      case 'orders-tasking': return 'Orders Tasking & Allocations';
      case 'templates-summary': return 'Presets Matrix & Verification';
      case 'orders-in-progress': return 'Orders In Progress';
      case 'financial-center': return 'Financial Center';
      case 'support-chat': return 'Support & Chat Inbox';
      case 'settings': return 'System Settings';
      case 'my-profile': return 'My Profile';
      default: return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'user-management':
        return <UserManagement />;

      case 'orders-tasking':
        return <OrdersTasking />;
        
      case 'templates-summary':
        return <TemplatesSummary />;
        
      case 'orders-in-progress':
        return <OrdersInProgress />;
        
      case 'ownership':
        return <SLAOwnership />;
        
      case 'sla-admins':
        return <SLAAdmins />;
        
      case 'sla-staff':
        return <SLAStaff />;

      case 'financial-center':
        return <FinancialCenter />;
        
      case 'dashboard':
        return (
          <div className="admin-page-container">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              
              {/* Card 1 */}
              <div className="admin-card !mb-0 !p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Total Payouts</p>
                    <h3 className="text-2xl font-extrabold mt-2 text-slate-800">$ {stats.payoutRequests.toFixed(2)}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-500">
                    <DollarSign size={24} />
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="admin-card !mb-0 !p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Total Deposits</p>
                    <h3 className="text-2xl font-extrabold mt-2 text-slate-800">$ {stats.totalDeposits.toFixed(2)}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-sky-50 text-sky-500">
                    <TrendingUp size={24} />
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="admin-card !mb-0 !p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Client Nodes</p>
                    <h3 className="text-2xl font-extrabold mt-2 text-slate-800">{stats.newUsers.toLocaleString()}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-500">
                    <Users size={24} />
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="admin-card !mb-0 !p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Matched Tasks</p>
                    <h3 className="text-2xl font-extrabold mt-2 text-slate-800">{stats.matchedTasks.toLocaleString()}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-50 text-amber-500">
                    <Briefcase size={24} />
                  </div>
                </div>
              </div>

              {/* Card 5 */}
              <div className="admin-card !mb-0 !p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Online Users</p>
                    <h3 className="text-2xl font-extrabold mt-2 text-slate-800">{stats.onlineUsers.toLocaleString()}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-rose-50 text-rose-500">
                    <Activity size={24} />
                  </div>
                </div>
              </div>

            </div>

            <div className="admin-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">
                  Platform Earning Velocity
                </h3>
              </div>
              <div className="h-72 flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400">
                <TrendingUp size={48} className="mb-4 text-slate-300" strokeWidth={1.5} />
                <span className="font-medium text-sm">Sales Details Chart Placeholder</span>
              </div>
            </div>
          </div>
        );

      case 'support-chat':
        return <SupportChat />;

      case 'settings':
        return <Settings />;

      default:
        return (
          <div className="admin-page-container scale-up">
            <div className="admin-card">
              <h3 className="section-title" style={{ marginBottom: 12 }}>{getActiveTabLabel()}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-admin-light)' }}>
                This portal subsection configures administrative bindings. Values set here link directly into backend state modules.
              </p>
            </div>
          </div>
        );
    }
  };

  if (!session) {
    return <Login onLoginSuccess={(s) => setSession(s)} />;
  }

  return (
    <div className="admin-shell">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Persistent left sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main content pane */}
      <div className="admin-main">
        <Navbar activeLabel={getActiveTabLabel()} />
        {renderContent()}
      </div>
    </div>
  );
}
