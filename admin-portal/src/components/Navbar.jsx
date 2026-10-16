import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { RefreshCw, Bell, ChevronDown, LogOut } from 'lucide-react';

export default function Navbar({ activeLabel }) {
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [pendingWithdraws, setPendingWithdraws] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [session, setSession] = useState({ role: 'Owner', name: 'System Owner', email: 'owner@wallmark.com' });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isMaintenance, setIsMaintenance] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_maintenance_mode');
      return saved === 'true'; // Default false
    } catch {
      return false;
    }
  });

  const toggleMaintenance = () => {
    const nextState = !isMaintenance;
    setIsMaintenance(nextState);
    try {
      localStorage.setItem('cb_maintenance_mode', nextState ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('cb_maintenance_updated', { detail: { active: nextState } }));
      
      const channel = supabase.channel('system_maintenance');
      channel.send({
        type: 'broadcast',
        event: 'maintenance_toggle',
        payload: { active: nextState }
      });
    } catch (e) {
      console.warn("Broadcast error", e);
    }
  };

  const syncStats = async () => {
    try {
      const { count: depCount, error: depError } = await supabase
        .from('cb_deposits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');

      const { count: wthCount, error: wthError } = await supabase
        .from('cb_withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');

      const { count: online, error: onlineError } = await supabase
        .from('cb_users')
        .select('*', { count: 'exact', head: true })
        .eq('online', 'Online');

      if (!depError) setPendingDeposits(depCount || 0);
      if (!wthError) setPendingWithdraws(wthCount || 0);
      if (!onlineError) setOnlineCount(online || 0);

      const savedSession = localStorage.getItem('cb_admin_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        const table = parsed.role === 'Staff' ? 'cb_staff' : 'cb_admins';
        const { data: userData } = await supabase.from(table).select('profile_photo').eq('email', parsed.email).single();
        if (userData?.profile_photo) setProfilePhoto(userData.profile_photo);
      }
    } catch (err) {
      console.error("Error syncing stats from database:", err);
    }
  };

  useEffect(() => {
    syncStats();
    const savedSession = localStorage.getItem('cb_admin_session');
    if (savedSession) {
      setSession(JSON.parse(savedSession));
    }
    const interval = setInterval(() => {
      if (document.hidden) return; // Save bandwidth when tab is in background!
      syncStats();
    }, 15000); // Poll every 15 seconds instead of 5
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    setIsRefreshing(true);
    await syncStats();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
    localStorage.removeItem('cb_admin_session');
    window.location.reload();
  };

  return (
    <div className="admin-navbar">
      <div className="navbar-left">
        <div className="breadcrumb-trail">
          <span className="active">{activeLabel}</span>
        </div>
      </div>
      
      <div className="jobie-search">
        <input type="text" placeholder="Search something here..." />
      </div>

      <div className="navbar-right">
        <div className="admin-stats-bar">
          <div className="status-badge badge-deposit-pending">
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#d97706' }}></span> 
            {pendingDeposits} Deposits
          </div>
          <div className="status-badge badge-withdraw-pending">
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#dc2626' }}></span> 
            {pendingWithdraws} Withdraws
          </div>
          <div className="status-badge badge-online-count">
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }}></span> 
            {onlineCount} Online
          </div>
          <button 
            className="btn-admin-secondary" 
            style={{ height: 32, padding: '0 12px', gap: 6 }} 
            onClick={handleUpdate}
          >
            <RefreshCw size={14} className={isRefreshing ? "spin-anim" : ""} />
            Sync
          </button>
          
          <button 
            onClick={toggleMaintenance}
            title={isMaintenance ? "Click to turn Maintenance Mode OFF (Go Live)" : "Click to put site on Maintenance Break"}
            style={{ 
              height: 32, 
              padding: '0 12px', 
              gap: 6, 
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              border: isMaintenance ? '1px solid #2563eb' : '1px solid var(--border-color)',
              backgroundColor: isMaintenance ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-card)',
              color: isMaintenance ? '#2563eb' : 'var(--text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: isMaintenance ? '#2563eb' : '#94a3b8',
              boxShadow: isMaintenance ? '0 0 8px #2563eb' : 'none'
            }} />
            {isMaintenance ? 'ON AIR: Maintenance Active' : 'Maintenance: OFF'}
          </button>
        </div>

        <div style={{ width: 1, height: 24, backgroundColor: 'var(--border-color)', margin: '0 8px' }}></div>

        <div className="admin-profile-menu" style={{ gap: 16, display: 'flex', alignItems: 'center' }}>
          <div className="admin-avatar-mini" style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', backgroundColor: '#e8e8f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'var(--text-main)', fontSize: 18, fontWeight: 600 }}>{session.role ? session.role[0] : 'O'}</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{session.name}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>{session.role}</span>
          </div>
          <button 
            onClick={handleLogout} 
            title="Sign Out"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 6, marginLeft: 8 }}
            className="logout-icon-btn"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <style>{`
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .logout-icon-btn:hover {
          background-color: var(--color-danger-bg);
          color: var(--color-danger) !important;
        }
      `}</style>
    </div>
  );
}
