import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Users, UserPlus, Search, Copy, Check, ShieldCheck, ExternalLink, AlertTriangle, Phone, Mail, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SLAStaff() {
  const [session, setSession] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchStaffAndClients = async () => {
    try {
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
          online: u.online,
          balance: parseFloat(u.balance || 0),
          withdraw: u.withdraw,
          referred_by_staff_id: u.referred_by_staff_id,
          member_of_admin_id: u.member_of_admin_id,
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
      if (document.hidden) return;
      fetchStaffAndClients();
    }, 20000);
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

  useEffect(() => {
    if (filteredStaff.length > 0 && !selectedStaff) {
      setSelectedStaff(filteredStaff[0]);
    }
  }, [filteredStaff, selectedStaff]);

  useEffect(() => {
    if (selectedStaff) {
      const refreshed = staff.find(s => s.id === selectedStaff.id);
      if (refreshed) setSelectedStaff(refreshed);
    }
  }, [staff, selectedStaff]);

  const getReferralLink = (referralCode: string) => {
    let userPortalUrl = import.meta.env.VITE_USER_PORTAL_URL;
    if (!userPortalUrl) {
      const hostname = window.location.hostname;
      const port = window.location.port;
      if (port === '5174') {
        userPortalUrl = `${window.location.protocol}//${hostname}:5173`;
      } else if (hostname.startsWith('admin.')) {
        userPortalUrl = `${window.location.protocol}//${hostname.substring(6)}`;
      } else if (hostname.startsWith('admin-')) {
        userPortalUrl = `${window.location.protocol}//${hostname.substring(6)}`;
      } else {
        userPortalUrl = `${window.location.protocol}//${hostname}`;
      }
    }
    return `${userPortalUrl}/#/register?ref=${referralCode}`;
  };

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Referral code copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStaffStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const { error } = await supabase
        .from('cb_staff')
        .update({ status: nextStatus })
        .eq('id', id);

      if (!error) {
        toast.success(`Staff status updated to ${nextStatus}`);
        fetchStaffAndClients();
      } else {
        toast.error("Failed to update staff status: " + error.message);
      }
    } catch (err: any) {
      toast.error("Error updating status: " + err.message);
    }
  };

  const staffClients = selectedStaff 
    ? clients.filter(c => c.referred_by_staff_id === selectedStaff.staffId)
    : [];

  return (
    <div className="admin-page-container space-y-6 scale-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">SLA Staff Members</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Operational staff accounts, referral configurations, and client bindings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Staff Directory */}
        <div className="lg:col-span-5 admin-card !p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Staff Nodes ({filteredStaff.length})</h3>
            <span className="text-xs font-semibold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
              {displayStaff.length} Total
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search staff by name, ID, or dept..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 text-xs font-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
            />
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredStaff.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No staff accounts match search criteria.</p>
            ) : (
              filteredStaff.map(s => {
                const isSelected = selectedStaff?.id === s.id;
                const myClientCount = clients.filter(c => c.referred_by_staff_id === s.staffId).length;

                return (
                  <div 
                    key={s.id} 
                    onClick={() => setSelectedStaff(s)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-xs' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {s.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block truncate">{s.name}</span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-medium">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{s.staffId}</span>
                          <span>•</span>
                          <span>{s.department}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider block ${
                        s.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                      }`}>
                        {s.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">{myClientCount} clients</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Staff Profile & Direct Client Accounts */}
        <div className="lg:col-span-7 space-y-6">
          {selectedStaff ? (
            <div className="admin-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                    {selectedStaff.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{selectedStaff.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="font-mono text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 px-2.5 py-0.5 rounded-md">{selectedStaff.staffId}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{selectedStaff.department}</span>
                      <span className="text-xs text-slate-400">• Created: {selectedStaff.createdAt}</span>
                    </div>
                  </div>
                </div>

                {session && session.role !== 'Staff' && (
                  <button 
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer self-start sm:self-auto ${
                      selectedStaff.status === 'Active' 
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/50 hover:bg-rose-100' 
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100'
                    }`}
                    onClick={() => toggleStaffStatus(selectedStaff.id, selectedStaff.status)}
                  >
                    {selectedStaff.status === 'Active' ? 'Suspend Staff Node' : 'Activate Staff Node'}
                  </button>
                )}
              </div>

              {/* Staff Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Email Address</span>
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{selectedStaff.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Phone Number</span>
                    <span className="text-xs font-medium font-mono text-slate-800 dark:text-slate-200">{selectedStaff.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Building size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Department / Node</span>
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{selectedStaff.department}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-indigo-500 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Created By Admin</span>
                    <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">{selectedStaff.createdByAdminId || 'SYSTEM'}</span>
                  </div>
                </div>
              </div>

              {/* Referral Configurations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Referral Link Configuration</h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 font-medium">Staff Referral Code:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/40">{selectedStaff.referralCode}</span>
                      <button 
                        onClick={() => handleCopyLink(selectedStaff.referralCode, selectedStaff.id)}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        {copiedId === selectedStaff.id ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedId === selectedStaff.id ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium block">Direct Registration URL:</span>
                    <input 
                      type="text" 
                      readOnly 
                      value={getReferralLink(selectedStaff.referralCode)} 
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="w-full h-10 px-3 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Direct Clients Node */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Direct Client Accounts ({staffClients.length})</h4>
                </div>
                {staffClients.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs font-medium">
                    No client accounts currently registered under this staff node.
                  </div>
                ) : (
                  <div className="table-responsive-wrapper border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th className="px-4 py-3">Client ID</th>
                          <th className="px-4 py-3">Username</th>
                          <th className="px-4 py-3">Balance</th>
                          <th className="px-4 py-3">Reg. Date</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {staffClients.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3"><span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{c.id.substring(0,8)}...</span></td>
                            <td className="px-4 py-3 font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{c.username}</td>
                            <td className="px-4 py-3"><span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">${c.balance.toFixed(2)}</span></td>
                            <td className="px-4 py-3 text-xs text-slate-500 font-medium">{c.regTime}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                c.online === 'Online' 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' 
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
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
            </div>
          ) : (
            <div className="admin-card p-12 text-center text-slate-400 text-xs sm:text-sm font-medium">
              Select a staff member from the directory list to view profile metadata, referral configurations, and registered client accounts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
