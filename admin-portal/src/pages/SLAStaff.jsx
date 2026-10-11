import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

import toast from 'react-hot-toast';
export default function SLAStaff() {
  const [session, setSession] = useState(null);
  const [staff, setStaff] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchStaffAndClients = async () => {
    try {
      // Session
      const savedSession = localStorage.getItem('cb_admin_session');
      const parsedSession = savedSession ? JSON.parse(savedSession) : { role: 'Owner', name: 'System Owner', email: 'owner@wallmark.com' };
      setSession(parsedSession);

      // Staff
      const { data: staffData, error: staffError } = await supabase
        .from('cb_staff')
        .select('*')
        .order('created_at', { ascending: true });

      if (!staffError && staffData) {
        const mappedStaff = staffData.map(s => ({
          id: s.id,
          staffId: s.staff_id,
          name: s.name,
          email: s.email,
          phone: s.phone || 'Unassigned',
          status: s.status,
          createdByAdminId: s.created_by_admin_id,
          department: s.department || 'Operations',
          referralCode: s.referral_code,
          createdAt: new Date(s.created_at).toLocaleDateString()
        }));
        setStaff(mappedStaff);
      }

      // Clients/Users
      const { data: usersData, error: usersError } = await supabase
        .from('cb_users')
        .select('*')
        .order('reg_time', { ascending: false });

      if (!usersError && usersData) {
        const mappedUsers = usersData.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          phone: u.phone,
          nickname: u.nickname,
          level: u.level,
          rate: u.rate,
          acceptance: u.acceptance,
          online: u.online,
          balance: parseFloat(u.balance || 0),
          frozen: parseFloat(u.frozen || 0),
          topup: parseFloat(u.topup || 0),
          spentToday: parseFloat(u.spent_today || 0),
          spentCurrent: parseFloat(u.spent_current || 0),
          remaining: u.remaining,
          withdraw: u.withdraw,
          tpRecharge: parseFloat(u.tp_recharge || 0),
          beRecharge: parseFloat(u.be_recharge || 0),
          earnings: parseFloat(u.earnings || 0),
          commissions: parseFloat(u.commissions || 0),
          withdrawals: parseFloat(u.withdrawals || 0),
          inviteCode: u.invite_code,
          subs: u.subs,
          inviter: u.inviter,
          referred_by_staff_id: u.referred_by_staff_id,
          member_of_admin_id: u.member_of_admin_id,
          referral_id: u.referral_id,
          l1Agent: u.l1_agent,
          l2Agent: u.l2_agent,
          ip: u.ip,
          regTime: new Date(u.reg_time).toLocaleDateString()
        }));
        setClients(mappedUsers);
      }
    } catch (err) {
      console.error("Error loading staff and clients:", err);
    }
  };

  useEffect(() => {
    fetchStaffAndClients();
    const interval = setInterval(() => {
      if (document.hidden) return; // Save bandwidth when tab is in background!
      fetchStaffAndClients();
    }, 20000); // Poll every 20 seconds instead of 3
    return () => clearInterval(interval);
  }, []);

  // Filter staff based on session role hierarchy
  const displayStaff = staff.filter(s => {
    if (!session) return false;
    if (session.role === 'Owner') return true;
    if (session.role === 'Admin') return s.createdByAdminId === session.accountId;
    if (session.role === 'Staff') return s.staffId === session.accountId;
    return false;
  });

  const filteredStaff = displayStaff.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.staffId.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      (s.referralCode && s.referralCode.toLowerCase().includes(q)) ||
      (s.createdByAdminId && s.createdByAdminId.toLowerCase().includes(q))
    );
  });

  // Auto-select first staff to display details
  useEffect(() => {
    if (filteredStaff.length > 0 && !selectedStaff) {
      setSelectedStaff(filteredStaff[0]);
    }
  }, [filteredStaff, selectedStaff]);

  // If selectedStaff is updated in lists, refresh the details reference
  useEffect(() => {
    if (selectedStaff) {
      const refreshed = staff.find(s => s.id === selectedStaff.id);
      if (refreshed) setSelectedStaff(refreshed);
    }
  }, [staff, selectedStaff]);

  const getReferralLink = (referralCode) => {
    let userPortalUrl = import.meta.env.VITE_USER_PORTAL_URL;
    if (!userPortalUrl) {
      const hostname = window.location.hostname;
      const port = window.location.port;
      
      // If we are locally running the admin portal on 5174, default the user portal to 5173
      if (port === '5174') {
        userPortalUrl = `${window.location.protocol}//${hostname}:5173`;
      } else if (hostname.startsWith('admin.')) {
        // e.g. admin.clicker-bat.com -> clicker-bat.com
        userPortalUrl = `${window.location.protocol}//${hostname.substring(6)}`;
      } else if (hostname.startsWith('admin-')) {
        // e.g. admin-clicker-bat.netlify.app -> clicker-bat.netlify.app
        userPortalUrl = `${window.location.protocol}//${hostname.substring(6)}`;
      } else {
        userPortalUrl = `${window.location.protocol}//${hostname}`;
      }
    }
    const base = userPortalUrl.replace(/\/$/, '');
    return `${base}/#/register?ref=${referralCode}`;
  };

  const handleCopyLink = (code, id) => {
    const link = getReferralLink(code);
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStaffStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const { error } = await supabase
        .from('cb_staff')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        toast.error("Error updating status: " + error.message);
        return;
      }

      toast(`Staff status updated to ${newStatus}.`);
      fetchStaffAndClients();
    } catch (err) {
      toast.error("Failed to update staff status: " + err.message);
    }
  };

  // Clients registered under selected staff
  const staffClients = clients.filter(c => selectedStaff && c.referred_by_staff_id === selectedStaff.staffId);

  return (
    <div className="admin-page-container scale-up">
      <div className="flex-row-title-bar">
        <div>
          <h2 className="admin-page-title">Staff Members</h2>
          <p className="admin-page-subtitle">Track operational staff nodes, generate referral parameters and monitor direct clients</p>
        </div>
      </div>

      <div className="staff-layout-split">
        {/* Left Side: Staff List */}
        <div className="staff-list-pane card">
          <div className="search-box-admin">
            <input 
              type="text" 
              placeholder="Search staff, ID, department..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="staff-items-list">
            {filteredStaff.map(s => (
              <div 
                key={s.id} 
                className={`staff-item-row ${selectedStaff?.id === s.id ? 'active' : ''}`}
                onClick={() => setSelectedStaff(s)}
              >
                <div className="staff-avatar-mini">
                  {s.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="staff-row-info">
                  <div className="staff-row-name-row">
                    <span className="staff-row-name">{s.name}</span>
                    <span className={`status-pill ${s.status.toLowerCase()}`}>{s.status}</span>
                  </div>
                  <div className="staff-row-sub-row">
                    <span className="staff-row-id">{s.staffId}</span>
                    <span className="staff-row-dept">{s.department}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Staff Details & Clients */}
        {selectedStaff ? (
          <div className="staff-details-pane card">
            <div className="details-header-row">
              <div className="details-avatar">
                {selectedStaff.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="details-main-info">
                <h3>{selectedStaff.name}</h3>
                <div className="details-badges">
                  <span className="id-badge-sla">{selectedStaff.staffId}</span>
                  <span className="dept-badge">{selectedStaff.department}</span>
                  <span className={`status-pill ${selectedStaff.status.toLowerCase()}`}>{selectedStaff.status}</span>
                </div>
              </div>
            </div>

            <div className="details-section-box">
              <h4 className="details-sec-title">Referral Configuration</h4>
              <div className="referral-config-grid">
                <div className="ref-param-row">
                  <span className="lbl">Staff Referral Code</span>
                  <div className="val-copy-box">
                    <span className="val-code">{selectedStaff.referralCode}</span>
                    <button className="copy-btn-small" onClick={() => handleCopyLink(selectedStaff.referralCode, selectedStaff.id)}>
                      {copiedId === selectedStaff.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="ref-param-row">
                  <span className="lbl">Referral Link URL</span>
                  <input 
                    type="text" 
                    readOnly 
                    value={getReferralLink(selectedStaff.referralCode)} 
                    className="ref-link-input-display"
                    onClick={(e) => e.target.select()}
                  />
                </div>
              </div>
            </div>

            <div className="details-section-box">
              <h4 className="details-sec-title">Direct Clients Node ({staffClients.length})</h4>
              {staffClients.length === 0 ? (
                <p className="no-clients-message">No clients registered under this staff node yet.</p>
              ) : (
                <div className="table-responsive-wrapper mini-table">
                  <table className="admin-table text-12">
                    <thead>
                      <tr>
                        <th>Client ID</th>
                        <th>Username</th>
                        <th>Phone</th>
                        <th>Balance</th>
                        <th>Reg. Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffClients.map(c => (
                        <tr key={c.id}>
                          <td><strong>{c.id}</strong></td>
                          <td>{c.username}</td>
                          <td>{c.phone}</td>
                          <td><span className="price-green">${parseFloat(c.balance).toFixed(2)}</span></td>
                          <td>{c.regTime}</td>
                          <td>
                            <span className={`status-pill ${c.online === 'Online' ? 'active' : 'suspended'}`}>
                              {c.online}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {session && session.role !== 'Staff' && (
              <div className="details-danger-actions">
                <button 
                  className={`btn-node-opt ${selectedStaff.status === 'Active' ? 'btn-red-outline' : 'btn-green-outline'}`}
                  onClick={() => toggleStaffStatus(selectedStaff.id, selectedStaff.status)}
                >
                  {selectedStaff.status === 'Active' ? 'Suspend Staff Account' : 'Activate Staff Account'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="staff-details-pane card empty-details">
            <p>Select a staff member to view details and registration link metadata</p>
          </div>
        )}
      </div>

      <style>{`
        .staff-layout-split {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 20px;
          align-items: start;
        }
        .staff-list-pane {
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 600px;
          overflow: hidden;
          padding: 16px;
          border: var(--border-luxury);
        }
        .search-box-admin input {
          width: 100%;
          height: 38px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 0 12px;
          font-size: 13px;
          background-color: #f8fafc;
        }
        .staff-items-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .staff-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .staff-item-row:hover {
          background-color: #f8fafc;
        }
        .staff-item-row.active {
          background-color: #eff6ff;
          border-color: #bfdbfe;
        }
        .staff-avatar-mini, .details-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: #dbeafe;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          flex-shrink: 0;
        }
        .details-avatar {
          width: 50px;
          height: 50px;
          font-size: 18px;
        }
        .staff-row-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .staff-row-name-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 6px;
        }
        .staff-row-name {
          font-weight: 600;
          font-size: 13px;
          color: var(--text-admin-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .staff-row-sub-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-admin-light);
        }
        .staff-row-id {
          font-family: monospace;
          font-weight: 600;
        }
        .staff-details-pane {
          min-height: 600px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          border: var(--border-luxury);
        }
        .details-header-row {
          display: flex;
          gap: 16px;
          align-items: center;
          border-bottom: var(--border-glass);
          padding-bottom: 16px;
        }
        .details-main-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .details-main-info h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-admin-main);
        }
        .details-badges {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dept-badge {
          background-color: #f1f5f9;
          color: #475569;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }
        .details-sec-title {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-admin-light);
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          border-bottom: 1px dashed var(--border-color);
          padding-bottom: 6px;
        }
        .details-section-box {
          display: flex;
          flex-direction: column;
        }
        .referral-config-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          background-color: #f8fafc;
          padding: 16px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }
        .ref-param-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ref-param-row .lbl {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-admin-light);
        }
        .val-copy-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .val-code {
          font-family: monospace;
          font-size: 15px;
          font-weight: 700;
          color: #2563eb;
        }
        .copy-btn-small {
          background-color: #2563eb;
          color: white;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 4px;
        }
        .ref-link-input-display {
          height: 34px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 0 10px;
          font-size: 12px;
          color: var(--text-admin-muted);
          background-color: white;
          width: 100%;
        }
        .no-clients-message {
          font-size: 12px;
          color: var(--text-admin-light);
          text-align: center;
          padding: 20px;
          background-color: #f8fafc;
          border-radius: 6px;
          border: 1px dashed var(--border-color);
        }
        .mini-table {
          border-radius: 6px;
          max-height: 250px;
          overflow-y: auto;
        }
        .text-12 {
          font-size: 11px !important;
        }
        .price-green {
          color: #10b981;
          font-weight: 700;
        }
        .details-danger-actions {
          margin-top: auto;
          border-top: var(--border-glass);
          padding-top: 16px;
        }
        .btn-red-outline {
          border: 1px solid #fca5a5;
          color: #b91c1c;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        .btn-red-outline:hover {
          background-color: #fef2f2;
        }
        .btn-green-outline {
          border: 1px solid #86efac;
          color: #15803d;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        .btn-green-outline:hover {
          background-color: #f0fdf4;
        }
        .empty-details {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-admin-light);
          font-size: 13px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
