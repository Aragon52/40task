import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { createClient } from '@supabase/supabase-js';

import toast from 'react-hot-toast';
// Isolated client to prevent overwriting current session when creating users
const adminAuthClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

export default function SLAAdmins() {
  const [admins, setAdmins] = useState([]);
  const [staff, setStaff] = useState([]);
  const [session, setSession] = useState(null);
  const updatingStaffIdsRef = useRef(new Set());

  // Form states for creating staff
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffDept, setStaffDept] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchAdminsAndStaff = async () => {
    try {
      // Session
      const savedSession = localStorage.getItem('cb_admin_session');
      const parsedSession = savedSession ? JSON.parse(savedSession) : { role: 'Owner', name: 'System Owner', email: 'owner@wallmark.com' };
      setSession(parsedSession);

      // Admins
      const { data: adminsData, error: adminsError } = await supabase
        .from('cb_admins')
        .select('*')
        .order('created_at', { ascending: true });

      if (!adminsError && adminsData) {
        const mappedAdmins = adminsData.map(a => ({
          id: a.id,
          accountId: a.account_id,
          name: a.name,
          email: a.email,
          phone: a.phone || 'Unassigned',
          status: a.status,
          createdAt: new Date(a.created_at).toLocaleDateString()
        }));
        setAdmins(mappedAdmins);
      }

      // Staff
      const { data: staffData, error: staffError } = await supabase
        .from('cb_staff')
        .select('*')
        .order('created_at', { ascending: true });

      if (!staffError && staffData) {
        setStaff(prevStaff => {
          return staffData.map(s => {
            const isUpdating = updatingStaffIdsRef.current.has(s.id);
            const existing = prevStaff.find(x => x.id === s.id);
            return {
              id: s.id,
              staffId: s.staff_id,
              name: s.name,
              email: s.email,
              phone: s.phone || 'Unassigned',
              status: s.status,
              createdByAdminId: s.created_by_admin_id,
              department: s.department || 'Operations',
              referralCode: s.referral_code,
              profile_photo: (isUpdating && existing) ? existing.profile_photo : s.profile_photo,
              createdAt: new Date(s.created_at).toLocaleDateString()
            };
          });
        });
      }
    } catch (err) {
      console.error("Error fetching admins and staff:", err);
    }
  };

  useEffect(() => {
    fetchAdminsAndStaff();
    const interval = setInterval(() => {
      if (document.hidden) return; // Save bandwidth when tab is in background!
      fetchAdminsAndStaff();
    }, 20000); // Poll every 20 seconds instead of 3
    return () => clearInterval(interval);
  }, []);

  // Filter admins based on role
  const displayAdmins = admins.filter(a => {
    if (a.accountId === 'OWNER') return false; // Hide owner
    if (!session || session.role === 'Owner') return true;
    if (session.role === 'Admin') return a.accountId === session.accountId;
    return false;
  });

  const handleOpenCreateStaff = (admin) => {
    setSelectedAdminId(admin.accountId);
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
    setStaffDept('');
    setStaffPassword('');
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const handleOpenGeneralCreateStaff = () => {
    if (session && session.role === 'Owner') {
      const activeAdmins = admins.filter(a => a.status === 'Active' && a.accountId !== 'OWNER');
      if (activeAdmins.length > 0) {
        setSelectedAdminId(activeAdmins[0].accountId);
      } else {
        setSelectedAdminId('');
      }
    } else if (session) {
      setSelectedAdminId(session.accountId || '');
    }
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
    setStaffDept('');
    setStaffPassword('');
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const generateReferralCode = (staffId, name) => {
    let adminId = 'OWNER';
    const match = staffId.match(/^(AD\d+)SI(\d+)$/);
    if (match) {
      adminId = match[1];
    } else {
      adminId = selectedAdminId || 'OWNER';
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing O, 0, I, 1
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `WK${randomPart}${adminId}`;
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!staffName || !staffEmail || !staffPassword) {
      setFormError("Please fill in name, email, and password.");
      return;
    }

    // Filter staff belonging to this specific admin node to calculate next ID
    const staffUnderAdmin = staff.filter(s => s.createdByAdminId === selectedAdminId);
    const nextNum = staffUnderAdmin.length + 1;
    const staffId = `${selectedAdminId}SI${nextNum}`;
    const referralCode = generateReferralCode(staffId, staffName);

    try {
      // 1. First register the user natively in Supabase Auth to ensure login works perfectly
      const { data: authData, error: authError } = await adminAuthClient.auth.signUp({
        email: staffEmail,
        password: staffPassword,
        options: {
          data: {
            name: staffName,
            email_verified: true
          }
        }
      });

      if (authError) {
        setFormError("Error creating authentication account: " + authError.message);
        return;
      }

      if (!authData?.user) {
        setFormError("Failed to create authentication credentials natively.");
        return;
      }

      // 2. Map and link the user details and role using the secure database RPC function
      const { data: newUserId, error: rpcError } = await supabase.rpc('create_staff_member', {
        p_email: staffEmail,
        p_password: staffPassword,
        p_name: staffName,
        p_phone: staffPhone || 'Unassigned',
        p_staff_id: staffId,
        p_admin_id: selectedAdminId,
        p_department: staffDept || 'Operations',
        p_referral_code: referralCode
      });

      if (rpcError) {
        setFormError("Error creating staff account: " + rpcError.message);
        return;
      }

      if (!newUserId) {
        setFormError("Failed to retrieve user ID from authentication system.");
        return;
      }

      // Track Audit Log
      const auditLog = {
        id: Date.now().toString(),
        admin_email: session?.email || 'admin@wallmark.com',
        action: 'CREATE_STAFF',
        target: staffId,
        details: { name: staffName, referralCode },
        timestamp: new Date().toISOString()
      };

      await supabase
        .from('cb_audit_logs')
        .insert([auditLog]);

      // Success
      setFormSuccess(`Staff Member ${staffId} (${staffName}) created successfully!`);
      setStaffName('');
      setStaffEmail('');
      setStaffPhone('');
      setStaffDept('');
      setStaffPassword('');
      fetchAdminsAndStaff();

      // Auto-close modal
      setTimeout(() => {
        setShowModal(false);
        setFormSuccess('');
      }, 2000);

    } catch (err) {
      setFormError("Failed to create staff account: " + err.message);
    }
  };

  const toggleAdminStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const { error } = await supabase
        .from('cb_admins')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        toast.error("Error updating status: " + error.message);
        return;
      }

      toast(`Admin node status changed to ${newStatus}.`);
      fetchAdminsAndStaff();
    } catch (err) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const getStaffPermissions = (profilePhoto) => {
    let perms = {
      userManagement: true,
      ordersInProgress: true,
      orderTasking: false,
      financialCenter: false,
      supportChat: false
    };
    if (profilePhoto) {
      if (typeof profilePhoto === 'object') {
        perms = { ...perms, ...profilePhoto };
      } else {
        try {
          const parsed = JSON.parse(profilePhoto);
          if (parsed && typeof parsed === 'object') {
            perms = { ...perms, ...parsed };
          }
        } catch (e) {
          // Ignore
        }
      }
    }
    return perms;
  };

  const handleTogglePermission = async (staffMember, field) => {
    const currentPerms = getStaffPermissions(staffMember.profile_photo);
    const updatedPerms = {
      ...currentPerms,
      [field]: !currentPerms[field]
    };

    const updatedPhotoStr = JSON.stringify(updatedPerms);

    // Track active local update to prevent polling overwrite
    updatingStaffIdsRef.current.add(staffMember.id);

    // Optimistic UI update
    setStaff(prevStaff => prevStaff.map(s => {
      if (s.id === staffMember.id) {
        return { ...s, profile_photo: updatedPhotoStr };
      }
      return s;
    }));

    try {
      const { data, error } = await supabase
        .from('cb_staff')
        .update({ profile_photo: updatedPhotoStr })
        .eq('id', staffMember.id)
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("No rows were updated. You might not have administrative permissions to update this staff member.");
      }

      toast.success(`Permission updated for ${staffMember.name}`);
      
      // Stop tracking updating ID before refetching so that fetch receives the new db state
      updatingStaffIdsRef.current.delete(staffMember.id);
      fetchAdminsAndStaff();
    } catch (err) {
      toast.error("Failed to update permission: " + err.message);
      
      // Stop tracking on failure so that rollback state is restored properly
      updatingStaffIdsRef.current.delete(staffMember.id);
      
      // Rollback on error
      setStaff(prevStaff => prevStaff.map(s => {
        if (s.id === staffMember.id) {
          return { ...s, profile_photo: staffMember.profile_photo };
        }
        return s;
      }));
    }
  };

  return (
    <div className="admin-page-container scale-up">
      <div className="flex-row-title-bar">
        <div>
          <h2 className="admin-page-title">Administrator Nodes</h2>
          <p className="admin-page-subtitle">Manage system administrator nodes and operational staff hierarchies</p>
        </div>
        <button className="btn-create-item" onClick={handleOpenGeneralCreateStaff}>
          + Create Staff Account
        </button>
      </div>

      <div className="display-admins-grid">
        {displayAdmins.map(admin => {
          const myStaffCount = staff.filter(s => s.createdByAdminId === admin.accountId).length;

          return (
            <div className="admin-node-card card" key={admin.id}>
              <div className="node-card-header">
                <div className="node-identity">
                  <span className="node-id-label">{admin.accountId}</span>
                  <h3 className="node-name">{admin.name}</h3>
                </div>
                <span className={`status-pill ${admin.status.toLowerCase()}`}>{admin.status}</span>
              </div>

              <div className="node-card-body">
                <div className="node-detail-row">
                  <span className="lbl">Email:</span>
                  <span className="val">{admin.email}</span>
                </div>
                <div className="node-detail-row">
                  <span className="lbl">Phone:</span>
                  <span className="val">{admin.phone}</span>
                </div>
                <div className="node-detail-row">
                  <span className="lbl">Staff Members:</span>
                  <span className="val highlight-count">{myStaffCount} active staff</span>
                </div>
                <div className="node-detail-row">
                  <span className="lbl">Node Created:</span>
                  <span className="val">{admin.createdAt}</span>
                </div>
              </div>

              <div className="node-card-actions">
                {session && session.role === 'Owner' && (
                  <button 
                    className={`btn-node-opt ${admin.status === 'Active' ? 'btn-red-outline' : 'btn-green-outline'}`}
                    onClick={() => toggleAdminStatus(admin.id, admin.status)}
                  >
                    {admin.status === 'Active' ? 'Suspend Node' : 'Activate Node'}
                  </button>
                )}
                <button 
                  className="btn-node-opt btn-blue-filled"
                  onClick={() => handleOpenCreateStaff(admin)}
                  disabled={admin.status !== 'Active'}
                >
                  + Add Staff Account
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Permissions Management */}
      <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Staff Account Permissions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure granular access permissions for staff nodes under your management</p>
        </div>
        
        {staff.filter(s => {
          if (!session) return false;
          if (session.role === 'Owner') return true;
          if (session.role === 'Admin') return s.createdByAdminId === session.accountId;
          return false;
        }).length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No staff members created yet under your management.
          </div>
        ) : (
          <div className="table-responsive-wrapper border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th className="px-4 py-4 text-left font-bold text-xs uppercase text-slate-500 tracking-wider">Staff ID</th>
                  <th className="px-4 py-4 text-left font-bold text-xs uppercase text-slate-500 tracking-wider">Name / Email</th>
                  <th className="px-4 py-4 text-left font-bold text-xs uppercase text-slate-500 tracking-wider">Department</th>
                  <th className="px-4 py-4 text-center font-bold text-xs uppercase text-slate-500 tracking-wider">User Management</th>
                  <th className="px-4 py-4 text-center font-bold text-xs uppercase text-slate-500 tracking-wider">Order Tasking</th>
                  <th className="px-4 py-4 text-center font-bold text-xs uppercase text-slate-500 tracking-wider">Orders In Progress</th>
                  <th className="px-4 py-4 text-center font-bold text-xs uppercase text-slate-500 tracking-wider">Financial Center</th>
                  <th className="px-4 py-4 text-center font-bold text-xs uppercase text-slate-500 tracking-wider">Support & Chat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {staff.filter(s => {
                  if (!session) return false;
                  if (session.role === 'Owner') return true;
                  if (session.role === 'Admin') return s.createdByAdminId === session.accountId;
                  return false;
                }).map(s => {
                  const perms = getStaffPermissions(s.profile_photo);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">{s.staffId}</td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {s.department}
                        </span>
                      </td>
                      
                      {/* User Management */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(s, 'userManagement')}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            perms.userManagement ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              perms.userManagement ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      
                      {/* Order Tasking */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(s, 'orderTasking')}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            perms.orderTasking ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              perms.orderTasking ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      
                      {/* Orders In Progress */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(s, 'ordersInProgress')}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            perms.ordersInProgress ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              perms.ordersInProgress ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      
                      {/* Financial Center */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(s, 'financialCenter')}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            perms.financialCenter ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              perms.financialCenter ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      
                      {/* Support & Chat */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(s, 'supportChat')}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            perms.supportChat ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              perms.supportChat ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Staff Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-admin">
            <div className="modal-header-admin">
              <h3>Create Staff Account</h3>
              <button onClick={() => { setShowModal(false); setFormError(''); setFormSuccess(''); }} style={{ fontSize: 18, color: '#94a3b8' }}>&times;</button>
            </div>
            <form onSubmit={handleCreateStaff}>
              <div className="modal-body-admin">
                {formError && <div className="inline-alert-error">{formError}</div>}
                {formSuccess && <div className="inline-alert-success">{formSuccess}</div>}
                
                {session && session.role === 'Owner' ? (
                  <div className="form-group-admin">
                    <label>Administrator Node (Belongs To)</label>
                    <select 
                      value={selectedAdminId} 
                      onChange={(e) => setSelectedAdminId(e.target.value)} 
                      required 
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        borderRadius: '4px', 
                        border: '1px solid var(--border-color)', 
                        background: 'var(--bg-surface)', 
                        color: 'var(--text-color)',
                        outline: 'none'
                      }}
                    >
                      <option value="">-- Select Admin Node --</option>
                      {admins.filter(a => a.status === 'Active' && a.accountId !== 'OWNER').map(a => (
                        <option key={a.id} value={a.accountId}>{a.name} ({a.accountId})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-group-admin">
                    <label>Administrator Node</label>
                    <input type="text" value={selectedAdminId} disabled style={{ background: 'var(--bg-app)', cursor: 'not-allowed', color: 'var(--text-light)' }} />
                  </div>
                )}

                <div className="form-group-admin">
                  <label>Staff Member Name</label>
                  <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} required placeholder="e.g. David Staff" />
                </div>
                <div className="form-group-admin">
                  <label>Email Address</label>
                  <input type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} required placeholder="david@wallmark.com" />
                </div>
                <div className="form-group-admin">
                  <label>Phone Number (Optional)</label>
                  <input type="text" value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} placeholder="+1 999 888 777" />
                </div>
                <div className="form-group-admin">
                  <label>Department / Segment</label>
                  <input type="text" value={staffDept} onChange={(e) => setStaffDept(e.target.value)} placeholder="e.g. Customer Support" />
                </div>
                <div className="form-group-admin">
                  <label>Password</label>
                  <input type="password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} required placeholder="••••••••" />
                </div>
              </div>
              <div className="modal-footer-admin">
                <button type="button" className="btn-modal-cancel" onClick={() => { setShowModal(false); setFormError(''); setFormSuccess(''); }}>Cancel</button>
                <button type="submit" className="btn-modal-submit">Create Staff Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .flex-row-title-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .btn-create-item {
          background-color: var(--color-primary);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border: none;
        }
        .btn-create-item:hover {
          background-color: var(--color-primary-hover);
        }
        .admin-page-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-admin-main);
        }
        .admin-page-subtitle {
          font-size: 13px;
          color: var(--text-admin-light);
        }
        .display-admins-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
          gap: 20px;
        }
        .admin-node-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: var(--border-luxury);
        }
        .node-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: var(--border-glass);
          padding-bottom: 12px;
        }
        .node-identity {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .node-id-label {
          background-color: #fef3c7;
          color: #d97706;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 700;
          font-size: 11px;
          align-self: flex-start;
        }
        .node-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-admin-main);
        }
        .node-card-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13px;
        }
        .node-detail-row {
          display: flex;
          justify-content: space-between;
        }
        .node-detail-row .lbl {
          color: var(--text-admin-light);
        }
        .node-detail-row .val {
          font-weight: 550;
          color: var(--text-admin-main);
        }
        .node-detail-row .highlight-count {
          color: #2563eb;
          font-weight: 600;
        }
        .node-card-actions {
          display: flex;
          gap: 10px;
          margin-top: auto;
          padding-top: 12px;
          border-top: var(--border-glass);
        }
        .btn-node-opt {
          flex: 1;
          height: 34px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-red-outline {
          border: 1px solid #fca5a5;
          color: #b91c1c;
          background: none;
        }
        .btn-red-outline:hover {
          background-color: #fef2f2;
        }
        .btn-green-outline {
          border: 1px solid #86efac;
          color: #15803d;
          background: none;
        }
        .btn-green-outline:hover {
          background-color: #f0fdf4;
        }
        .btn-blue-filled {
          background-color: var(--color-primary);
          color: white;
        }
        .btn-blue-filled:disabled {
          background-color: #cbd5e1;
          color: #94a3b8;
          cursor: not-allowed;
        }
        .status-pill {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }
        .status-pill.active {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-pill.suspended {
          background-color: #fee2e2;
          color: #991b1b;
        }
      `}</style>
    </div>
  );
}
