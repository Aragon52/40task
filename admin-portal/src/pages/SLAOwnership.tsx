import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { createClient } from '@supabase/supabase-js';
import { ShieldCheck, UserPlus, Trash2, CheckCircle2, AlertCircle, Phone, Mail, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

const adminAuthClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

export default function SLAOwnership() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [adminToDelete, setAdminToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('cb_admins')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        const mapped = data.map(a => ({
          id: a.id,
          accountId: a.account_id,
          name: a.name,
          email: a.email,
          phone: a.phone || 'Unassigned',
          status: a.status,
          createdAt: new Date(a.created_at).toLocaleDateString()
        }));
        setAdmins(mapped);
      }
    } catch (err) {
      console.error("Error loading admins:", err);
    }
  };

  useEffect(() => {
    fetchAdmins();
    const interval = setInterval(() => {
      if (document.hidden) return;
      fetchAdmins();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name || !email || !password) {
      setFormError("Please fill in name, email, and password.");
      return;
    }

    const nextNum = admins.length + 1;
    const accountId = `AD${String(nextNum).padStart(2, '0')}`;

    try {
      const { data: authData, error: authError } = await adminAuthClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
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

      const { data: newUserId, error: rpcError } = await supabase.rpc('create_admin_member', {
        p_email: email,
        p_password: password,
        p_name: name,
        p_phone: phone || 'Unassigned',
        p_account_id: accountId
      });

      if (rpcError) {
        setFormError("Error creating admin account: " + rpcError.message);
        return;
      }

      if (!newUserId) {
        setFormError("Failed to retrieve user ID from authentication system.");
        return;
      }

      setFormSuccess(`Administrator ${accountId} (${name}) created successfully!`);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      fetchAdmins();
      
      setTimeout(() => {
        setShowModal(false);
        setFormSuccess('');
      }, 2000);

    } catch (err: any) {
      setFormError("Failed to create admin node: " + err.message);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const { error } = await supabase
        .from('cb_admins')
        .update({ status: newStatus })
        .eq('id', id);

      if (!error) {
        toast.success(`Administrator status updated to ${newStatus}`);
        fetchAdmins();
      } else {
        toast.error("Error updating status: " + error.message);
      }
    } catch (err: any) {
      toast.error("Error updating status: " + err.message);
    }
  };

  const handleDeleteAdmin = (admin: any) => {
    setAdminToDelete(admin);
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    setIsDeleting(true);

    try {
      const { error: deleteErr } = await supabase
        .from('cb_admins')
        .delete()
        .eq('id', adminToDelete.id);

      if (deleteErr) {
        if (deleteErr.message && deleteErr.message.toLowerCase().includes('foreign key')) {
          toast.error(`Could not delete administrator. There are still staff members registered under this administrator (${adminToDelete.accountId}).\n\nPlease delete their registered staff members first.`);
        } else {
          toast.error("Error deleting administrator: " + deleteErr.message);
        }
        setIsDeleting(false);
        setAdminToDelete(null);
        return;
      }

      await supabase.from('user_roles').delete().eq('user_id', adminToDelete.id);
      await supabase.rpc('delete_auth_user', { p_user_id: adminToDelete.id });

      toast.success(`Administrator ${adminToDelete.name} deleted successfully.`);
      fetchAdmins();
    } catch (err: any) {
      toast.error("Failed to delete administrator: " + err.message);
    } finally {
      setIsDeleting(false);
      setAdminToDelete(null);
    }
  };

  const activeAdmins = admins.filter(a => a.accountId !== 'OWNER');

  return (
    <div className="admin-page-container space-y-6 scale-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Ownership Governance</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Supervise administrator nodes, authority hierarchies, and system credentials.</p>
        </div>
        <button 
          className="btn-admin-primary flex items-center gap-2 cursor-pointer self-start sm:self-auto text-xs sm:text-sm py-2.5 px-4"
          onClick={() => setShowModal(true)}
        >
          <UserPlus size={18} />
          <span>Create Administrator</span>
        </button>
      </div>

      {/* Owner Authority Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-md border border-indigo-800/80 flex flex-col md:flex-row gap-4 sm:gap-5 items-start">
        <div className="w-11 h-11 rounded-xl bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center text-white shrink-0 shadow-sm">
          <ShieldCheck size={24} />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-bold text-base sm:text-lg text-white tracking-tight">Owner Authority Node (Role: Owner)</h3>
            <span className="bg-amber-400 text-slate-950 font-extrabold text-[11px] px-2.5 py-0.5 rounded-md tracking-wider uppercase shadow-xs">Master System Key</span>
          </div>
          <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed max-w-4xl">
            The Owner account holds supreme root authority. It directly provisions and supervises all Administrator (<code className="font-mono bg-indigo-900/80 px-1.5 py-0.5 rounded text-amber-300">AD##</code>) nodes, manages staff delegation permissions, and holds master database access across the platform network.
          </p>
        </div>
      </div>

      {/* Administrator Nodes Grid / Table */}
      <div className="admin-card !p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Active Administrator Nodes ({activeAdmins.length})</h3>
        </div>

        <div className="table-responsive-wrapper border-none rounded-none">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="px-5 py-3.5">Account ID</th>
                <th className="px-5 py-3.5">Administrator Name</th>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-5 py-3.5">Phone Number</th>
                <th className="px-5 py-3.5">Created Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {activeAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No active administrator nodes created yet.
                  </td>
                </tr>
              ) : (
                activeAdmins.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/40">
                        {a.accountId}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-sm text-slate-900 dark:text-white">{a.name}</td>
                    <td className="px-5 py-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">{a.email}</td>
                    <td className="px-5 py-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-mono">{a.phone}</td>
                    <td className="px-5 py-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">{a.createdAt}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        a.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button 
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            a.status === 'Active' 
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/40' 
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/40'
                          }`}
                          onClick={() => toggleStatus(a.id, a.status)}
                        >
                          {a.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button 
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                          onClick={() => handleDeleteAdmin(a)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-card max-w-md w-full">
            <div className="modal-header">
              <h3>Create Administrator Node</h3>
              <button onClick={() => { setShowModal(false); setFormError(''); setFormSuccess(''); }} className="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              {formError && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs">{formError}</div>}
              {formSuccess && <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs">{formSuccess}</div>}
              
              <div className="form-group-admin">
                <label>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. John Admin" />
              </div>
              <div className="form-group-admin">
                <label>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@wallmark.com" />
              </div>
              <div className="form-group-admin">
                <label>Phone Number (Optional)</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
              </div>
              <div className="form-group-admin">
                <label>Account Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={() => { setShowModal(false); setFormError(''); setFormSuccess(''); }}>Cancel</button>
                <button type="submit" className="btn-admin-primary">Generate Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {adminToDelete && (
        <div className="modal-overlay">
          <div className="modal-content-card max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle size={24} />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Administrator Node</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete administrator <strong>{adminToDelete.name} ({adminToDelete.accountId})</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button className="btn-admin-secondary" onClick={() => setAdminToDelete(null)}>Cancel</button>
              <button 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                onClick={confirmDeleteAdmin}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
