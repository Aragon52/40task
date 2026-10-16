import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { 
  Search, 
  User, 
  UserCheck, 
  UserX, 
  Coins, 
  DollarSign, 
  Smartphone, 
  Mail, 
  Layers, 
  Lock, 
  Shield, 
  Trash2, 
  Edit3, 
  Activity, 
  Filter, 
  Calendar, 
  X, 
  FileText, 
  CheckCircle, 
  Ban, 
  Award, 
  ArrowUpRight, 
  Globe,
  Database,
  TrendingUp,
  Briefcase,
  AlertTriangle
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnline, setFilterOnline] = useState('All');

  // Edit modal
  const [editUser, setEditUser] = useState<any>(null);
  const [editFields, setEditFields] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // Reset passwords modal
  const [resetPWUser, setResetPWUser] = useState<any>(null);
  const [resetPWFields, setResetPWFields] = useState({
    loginPassword: '',
    withdrawPassword: ''
  });
  const [resettingPW, setResettingPW] = useState(false);

  // View details modal
  const [viewUser, setViewUser] = useState<any>(null);

  // Compute dynamic stats for the top cards
  const stats = React.useMemo(() => {
    const total = users.length;
    const online = users.filter(u => u.online === 'Online').length;
    const totalBalance = users.reduce((acc, u) => acc + u.balance, 0);
    const totalFrozen = users.reduce((acc, u) => acc + u.frozen, 0);
    return { total, online, totalBalance, totalFrozen };
  }, [users]);

  const getTemplateName = (task) => {
    if (!task) return 'Custom';
    const amt = parseFloat(task.total_amount || 0);
    const count = parseInt(task.order_count || 0);
    
    if (count === 40) {
      if (Math.abs(amt - 30718.07) < 100) return 'Order Template M-1';
      if (Math.abs(amt - 98290.93) < 100) return 'Order Template M-2';
      if (Math.abs(amt - 353999.72) < 500) return 'Order Template M-3';
      if (Math.abs(amt - 508022.10) < 500) return 'Order Template M-4';
      if (Math.abs(amt - 817.17) < 10) return 'Order Template C-1';
      if (Math.abs(amt - 3920.24) < 50) return 'Order Template C-2';
      if (Math.abs(amt - 104951.13) < 500) return 'Order Template C-3';
      if (Math.abs(amt - 75852.5) < 500) return 'Order Template C-4';
      if (Math.abs(amt - 148524.49) < 500) return 'Order Template C-5';
    }
    
    let ordersList = [];
    try {
      ordersList = typeof task.orders === 'string' ? JSON.parse(task.orders) : (task.orders || []);
    } catch (e) {
      ordersList = task.orders || [];
    }
    
    const firstTitle = ordersList[0]?.title || '';
    const sumPrices = ordersList.reduce((acc, o) => acc + parseFloat(o.price || 0), 0);
    if (Math.abs(sumPrices - 30718.07) < 100) return 'Order Template M-1';
    if (Math.abs(sumPrices - 98290.93) < 100) return 'Order Template M-2';
    if (Math.abs(sumPrices - 353999.72) < 500) return 'Order Template M-3';
    if (Math.abs(sumPrices - 508022.10) < 500) return 'Order Template M-4';
    if (Math.abs(sumPrices - 817.17) < 10) return 'Order Template C-1';
    if (Math.abs(sumPrices - 3920.24) < 50) return 'Order Template C-2';
    if (Math.abs(sumPrices - 104951.13) < 500) return 'Order Template C-3';
    if (Math.abs(sumPrices - 75852.5) < 500) return 'Order Template C-4';
    if (Math.abs(sumPrices - 148524.49) < 500) return 'Order Template C-5';
    
    if (firstTitle.includes("Saint Laurent") || firstTitle.includes("RÉNERGIE LIFT")) {
      if (Math.abs(sumPrices - 30718.07) < 1000) return 'Order Template M-1';
      if (Math.abs(sumPrices - 98290.93) < 1000) return 'Order Template M-2';
      if (Math.abs(sumPrices - 353999.72) < 5000) return 'Order Template M-3';
      if (Math.abs(sumPrices - 508022.10) < 5000) return 'Order Template M-4';
      if (Math.abs(sumPrices - 817.17) < 50) return 'Order Template C-1';
      if (Math.abs(sumPrices - 3920.24) < 100) return 'Order Template C-2';
    }
    if (firstTitle.includes("Ergonomic Memory")) return 'Order Template C-2';
    if (firstTitle.includes("Premium Gel Ink")) return 'Order Template C-1';
    if (firstTitle.includes("Premium Noise-Cancelling") || firstTitle.includes("GrandPad Senior")) {
      if (Math.abs(sumPrices - 104951.13) < 5000) return 'Order Template C-3';
    }
    if (firstTitle.includes("Ted Baker") || firstTitle.includes("Powder Canister")) {
      if (Math.abs(sumPrices - 75852.5) < 5000) return 'Order Template C-4';
      if (Math.abs(sumPrices - 148524.49) < 5000) return 'Order Template C-5';
    }
    
    return `Custom Task (${count} items)`;
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('cb_users')
        .select('*')
        .order('reg_time', { ascending: false });

      if (!error && data) {
        // Fetch assigned tasks to check completed/ongoing templates
        const { data: tasksData } = await supabase
          .from('cb_assigned_tasks')
          .select('*');

        const userTasks = tasksData || [];

        const session = JSON.parse(localStorage.getItem('cb_admin_session') || '{}');
        let mapped = data.map(u => {
          const referer = data.find(r => r.id === u.invited_by_user_id);
          
          const uTasks = userTasks.filter(t => t.username?.toLowerCase() === u.username?.toLowerCase());
          
          const completedTemplates = uTasks
            .filter(t => t.status === 'Completed')
            .map(t => getTemplateName(t));
            
          const ongoingTemplates = uTasks
            .filter(t => t.status === 'Pending' || t.status === 'In Progress')
            .map(t => getTemplateName(t));

          return {
            id: u.id,
            username: u.username,
            email: u.email,
            phone: u.phone,
            password_plain: u.password_plain || '',
            password: u.password || '',
            withdraw_password: u.withdraw_password || '',
            nickname: u.nickname || '',
            level: u.level || 1,
            online: u.online || 'Offline',
            balance: parseFloat(u.balance || 0),
            frozen: parseFloat(u.frozen || 0),
            earnings: parseFloat(u.earnings || 0),
            commissions: parseFloat(u.commissions || 0),
            withdrawals: parseFloat(u.withdrawals || 0),
            topup: parseFloat(u.topup || 0),
            usdt_address: u.usdt_address || '',
            bank_name: u.bank_name || '',
            bank_account: u.bank_account || '',
            bank_holder: u.bank_holder || '',
            withdraw: (u.withdraw === 'Enable' || u.withdraw === 'Enabled') ? 'Enabled' : 'Disabled',
            inviteCode: u.invite_code || '',
            inviter: u.inviter || '',
            referred_by_staff_id: u.referred_by_staff_id || '',
            member_of_admin_id: u.member_of_admin_id || '',
            ip: u.ip || '',
            regTime: new Date(u.reg_time).toLocaleDateString(),
            invited_by_user_id: u.invited_by_user_id || '',
            referred_by_username: referer ? referer.username : '',
            completedTemplates,
            ongoingTemplates,
          };
        });

        const s = session as any;
        if (s?.role === 'Admin') {
          mapped = mapped.filter(u => u.member_of_admin_id === s?.accountId);
        } else if (s?.role === 'Staff') {
          mapped = mapped.filter(u => u.referred_by_staff_id === s?.accountId);
        }

        setUsers(mapped);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(() => {
      if (document.hidden) return; // Save bandwidth when tab is in background!
      fetchUsers();
    }, 15000); // Poll every 15 seconds instead of 5
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = [...users];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.invite_code && u.invite_code.toLowerCase().includes(q)) ||
        (u.referral_id && u.referral_id.toLowerCase().includes(q)) ||
        (u.referred_by_staff_id && u.referred_by_staff_id.toLowerCase().includes(q)) ||
        (u.member_of_admin_id && u.member_of_admin_id.toLowerCase().includes(q))
      );
    }
    if (filterOnline !== 'All') {
      result = result.filter(u => u.online === filterOnline);
    }
    setFilteredUsers(result);
  }, [users, searchQuery, filterOnline]);

  const openEdit = (user) => {
    setEditUser(user);
    setEditFields({
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      password_plain: user.password_plain || '',
      password: user.password || '',
      withdraw_password: user.withdraw_password || '',
      balance: (user.balance ?? 0).toString(),
      frozen: (user.frozen ?? 0).toString(),
      usdt_address: user.usdt_address || '',
      bank_name: user.bank_name || '',
      bank_account: user.bank_account || '',
      bank_holder: user.bank_holder || '',
      withdraw: (user.withdraw === 'Enable' || user.withdraw === 'Enabled') ? 'Enabled' : 'Disabled',
      level: (user.level ?? 1).toString(),
      invited_by_user_id: user.invited_by_user_id || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      let finalInvitedByUserId = null;
      if (editFields.invited_by_user_id) {
        const trimmed = (editFields.invited_by_user_id || '').trim();
        if (trimmed) {
          const foundById = users.find(u => u.id === trimmed);
          if (foundById) {
            finalInvitedByUserId = trimmed;
          } else {
            const foundByName = users.find(u => u.username.toLowerCase() === trimmed.toLowerCase() || (u.nickname && u.nickname.toLowerCase() === trimmed.toLowerCase()));
            if (foundByName) {
              finalInvitedByUserId = foundByName.id;
            } else {
              finalInvitedByUserId = trimmed;
            }
          }
        }
      }

      const updates = {
        username: (editFields.username || '').trim(),
        email: (editFields.email || '').trim(),
        phone: (editFields.phone || '').trim(),
        password_plain: (editFields.password_plain || '').trim(),
        password: (editFields.password || '').trim() || (editFields.password_plain || '').trim(),
        withdraw_password: (editFields.withdraw_password || '').trim(),
        balance: parseFloat(editFields.balance) || 0,
        frozen: parseFloat(editFields.frozen) || 0,
        usdt_address: (editFields.usdt_address || '').trim(),
        bank_name: (editFields.bank_name || '').trim(),
        bank_account: (editFields.bank_account || '').trim(),
        bank_holder: (editFields.bank_holder || '').trim(),
        withdraw: (editFields.withdraw === 'Enable' || editFields.withdraw === 'Enabled') ? 'Enabled' : 'Disabled',
        level: parseInt(editFields.level) || 1,
        invited_by_user_id: finalInvitedByUserId,
      };

      const { error } = await supabase
        .from('cb_users')
        .update(updates)
        .eq('id', editUser.id);

      if (error) {
        toast.error('Error saving: ' + error.message);
        return;
      }
      toast.success(`User ${editUser.username} updated successfully!`);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const openResetPasswords = (user) => {
    setResetPWUser(user);
    setResetPWFields({
      loginPassword: user.password_plain || user.password || '',
      withdrawPassword: user.withdraw_password || ''
    });
  };

  const handleSaveResetPW = async () => {
    if (!resetPWUser) return;
    setResettingPW(true);
    try {
      const updates = {
        password: resetPWFields.loginPassword.trim(),
        password_plain: resetPWFields.loginPassword.trim(),
        withdraw_password: resetPWFields.withdrawPassword.trim()
      };

      if (!updates.password) {
        toast.error('Login password cannot be empty');
        setResettingPW(false);
        return;
      }

      const { error } = await supabase
        .from('cb_users')
        .update(updates)
        .eq('id', resetPWUser.id);

      if (error) {
        toast.error('Error resetting passwords: ' + error.message);
        return;
      }
      toast.success(`Security credentials for ${resetPWUser.username} updated successfully!`);
      setResetPWUser(null);
      fetchUsers();
    } catch (err) {
      toast.error('Reset failed: ' + err.message);
    } finally {
      setResettingPW(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`⚠️ Are you sure you want to permanently delete user "${user.username}"? This cannot be undone.`)) return;
    try {
      // Delete related records first
      await supabase.from('cb_orders').delete().eq('username', user.username);
      await supabase.from('cb_assigned_tasks').delete().eq('username', user.username);
      await supabase.from('cb_deposits').delete().eq('username', user.username);
      await supabase.from('cb_withdrawals').delete().eq('username', user.username);

      // Delete user
      const { error } = await supabase.from('cb_users').delete().eq('id', user.id);
      if (error) {
        toast.error('Error deleting user: ' + error.message);
        return;
      }
      toast.success(`User ${user.username} and all related data deleted.`);
      fetchUsers();
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const handleToggleWithdraw = async (user) => {
    const isCurrentlyEnabled = user.withdraw === 'Enable' || user.withdraw === 'Enabled';
    const newVal = isCurrentlyEnabled ? 'Disabled' : 'Enabled';
    const { error } = await supabase.from('cb_users').update({ withdraw: newVal }).eq('id', user.id);
    if (error) {
      toast.error('Action failed: ' + error.message);
    } else {
      toast.success(`Withdrawal ${newVal === 'Enabled' ? 'Enabled' : 'Disabled'} for ${user.username}.`);
      fetchUsers();
    }
  };

  // Helper to generate dynamic initials color
  const getAvatarColorClass = (username) => {
    const colors = [
      'bg-indigo-500 text-indigo-50 border-indigo-200',
      'bg-purple-500 text-purple-50 border-purple-200',
      'bg-sky-500 text-sky-50 border-sky-200',
      'bg-pink-500 text-pink-50 border-pink-200',
      'bg-emerald-500 text-emerald-50 border-emerald-200',
      'bg-rose-500 text-rose-50 border-rose-200',
    ];
    let sum = 0;
    for (let i = 0; i < username.length; i++) sum += username.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div className="admin-page-container scale-up">
      <div className="w-full space-y-6">
        {/* Top statistics panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Registered Users',
            value: stats.total,
            sub: 'Operational Accounts',
            icon: User,
            color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400'
          },
          {
            title: 'Users Online Now',
            value: stats.online,
            sub: 'Active Live Sessions',
            icon: Activity,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
            pulse: true
          },
          {
            title: 'Aggregate Balances',
            value: `$${stats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: 'Available Net Capital',
            icon: DollarSign,
            color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400'
          },
          {
            title: 'Frozen Securities',
            value: `$${stats.totalFrozen.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: 'Locked Order Escrows',
            icon: Lock,
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
          }
        ].map((item, idx) => (
          <div key={idx} className={`admin-card flex items-center justify-between overflow-hidden relative ${item.color}`} style={{ padding: '20px', borderColor: 'transparent' }}>
            <div className="absolute inset-0 opacity-5 bg-current pointer-events-none"></div>
            <div className="space-y-1.5 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">{item.title}</span>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold tracking-tight opacity-100">{item.value}</h3>
                {item.pulse && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{item.sub}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color}`}>
              <item.icon className="w-5.5 h-5.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Main dashboard list container */}
      <div className="admin-card">
        {/* Card Header & Search Panel */}
        <h3 className="section-title" style={{ marginBottom: 12 }}>User Management Console</h3>
        <p style={{ fontSize: 13, color: 'var(--text-admin-light)', marginBottom: 16 }}>
          Monitor user balances, adjust account levels, edit referral networks, and manage payout restrictions. ({filteredUsers.length} Match{filteredUsers.length !== 1 ? 'es' : ''})
        </p>

        <div className="filter-controls-row" style={{ padding: 0, marginBottom: 16 }}>
          <div className="search-box-wrapper" style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search user ID, username, email, phone number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 text-xs focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none"
            />
          </div>
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
            <select
              value={filterOnline}
              onChange={e => setFilterOnline(e.target.value)}
              className="w-full pl-9 pr-8 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 text-xs focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none appearance-none"
            >
              <option value="All">All Status Levels</option>
              <option value="Online">Live (Online)</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Responsive Table Grid */}
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table w-full whitespace-nowrap">
            <thead>
              <tr>
                <th className="w-full">Client Profile</th>
                <th className="w-[15%]">Secure Contact</th>
                <th className="w-[10%]">SLA Referral Bond</th>
                <th className="w-0">Assets</th>
                <th className="w-0">Payout Info</th>
                <th className="w-0">Financial Stats</th>
                <th className="w-0">Completed</th>
                <th className="w-0">Ongoing</th>
                <th className="w-0">Cashout Lock</th>
                <th className="w-0 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <UserX className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <div className="text-sm font-semibold">No operational users found</div>
                      <p className="text-xs text-slate-400">Try adjusting your filter or query string parameters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const avatarClass = getAvatarColorClass(u.username);
                  const isOnline = u.online === 'Online';
                  return (
                    <tr key={u.id} id={`row-user-${u.id}`}>
                      {/* Name Card */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border flex-shrink-0 shadow-sm ${avatarClass}`}>
                            {u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 dark:text-slate-50 text-[13px] flex items-center gap-1.5">
                              {u.username}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono tracking-wider">{u.id.substring(0, 12)}…</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`inline-block w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                              <span className={`text-[10px] font-semibold uppercase ${isOnline ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                {u.online}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Credentials */}
                      <td>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="font-medium truncate max-w-[150px]">{u.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Smartphone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="font-mono">{u.phone}</span>
                          </div>
                          {u.ip && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">IP: {u.ip}</div>
                          )}
                        </div>
                      </td>

                      {/* Referral Node binding */}
                      <td>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Agent:</span>
                            {u.referred_by_username ? (
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-md border border-indigo-500/10">
                                👤 {u.referred_by_username}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Unbound</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Promo Code:</span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{u.inviteCode}</span>
                          </div>
                        </div>
                      </td>

                      {/* Available Assets */}
                      <td>
                        <div className="space-y-1.5 flex flex-col min-w-[130px]">
                          <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1.5 rounded-md border border-indigo-100 dark:border-indigo-800/50">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Available</span>
                            <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 text-xs">${u.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-900/20 px-2 py-1.5 rounded-md border border-amber-100 dark:border-amber-800/50">
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Escrow</span>
                            <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-xs">${u.frozen.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </td>

                      {/* USDT payout gateways */}
                      <td>
                        <div className="space-y-1 text-xs min-w-[140px]">
                          {u.usdt_address ? (
                            <div className="flex items-center gap-1 font-mono text-[10px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-700/50 w-fit">
                              <Coins className="w-3 h-3 text-teal-500" />
                              <span>{u.usdt_address.substring(0, 12)}…{u.usdt_address.substring(u.usdt_address.length - 4)}</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 italic">No USDT Address Set</div>
                          )}
                          
                          {u.bank_name ? (
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800 rounded p-1.5 mt-1 space-y-0.5 text-[10px] text-slate-600 dark:text-slate-400">
                              <div className="font-bold flex items-center gap-1 text-slate-800 dark:text-slate-300">
                                <Database className="w-3 h-3 text-indigo-500" />
                                {u.bank_name}
                              </div>
                              <div className="font-mono text-slate-500">{u.bank_account}</div>
                              <div className="text-slate-400 truncate max-w-[140px]">Hdr: {u.bank_holder}</div>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Earnings Stats */}
                      <td>
                        <div className="space-y-1.5 flex flex-col min-w-[120px]">
                          <div className="flex justify-between items-center bg-sky-50 dark:bg-sky-900/20 px-2 py-1 rounded border border-sky-100 dark:border-sky-800/50">
                            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Deposits</span>
                            <span className="font-mono font-bold text-sky-700 dark:text-sky-400 text-xs">${u.topup.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-800/50">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Profits</span>
                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">${u.earnings.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded border border-rose-100 dark:border-rose-800/50">
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Payouts</span>
                            <span className="font-mono font-bold text-rose-700 dark:text-rose-400 text-xs">${u.withdrawals.toFixed(2)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Completed Templates */}
                      <td>
                        <div className="flex flex-col gap-1 min-w-[110px]">
                          {u.completedTemplates && u.completedTemplates.length > 0 ? (
                            u.completedTemplates.map((tpl, i) => (
                              <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/10">
                                ✓ {tpl}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">None</span>
                          )}
                        </div>
                      </td>

                      {/* Ongoing Templates */}
                      <td>
                        <div className="flex flex-col gap-1 min-w-[110px]">
                          {u.ongoingTemplates && u.ongoingTemplates.length > 0 ? (
                            u.ongoingTemplates.map((tpl, i) => (
                              <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-500/10">
                                ⏳ {tpl}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">None</span>
                          )}
                        </div>
                      </td>

                      {/* Toggle withdraw restriction */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleWithdraw(u)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 mx-auto ${
                            (u.withdraw === 'Enable' || u.withdraw === 'Enabled')
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20 dark:text-rose-400'
                          }`}
                          id={`btn-toggle-withdraw-${u.id}`}
                        >
                          {(u.withdraw === 'Enable' || u.withdraw === 'Enabled') ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              Unlocked
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5 text-rose-500" />
                              Locked
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewUser(u)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                            title="View full record"
                            id={`btn-view-${u.id}`}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(u)}
                            className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors"
                            title="Edit user params"
                            id={`btn-edit-${u.id}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openResetPasswords(u)}
                            className="p-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 rounded-lg transition-colors"
                            title="Reset Security Passwords"
                            id={`btn-reset-pw-${u.id}`}
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg transition-colors"
                            title="Permanently remove"
                            id={`btn-delete-${u.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Param Modal */}
      {editUser && (
        <div className="modal-overlay">
          <div className="modal-content-card" style={{ maxWidth: 620, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">Modify Client Profile</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Edit credentials and balance matrices for <b>{editUser.username}</b></p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setEditUser(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body py-4 space-y-4">
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 p-3.5 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
                <span>
                  <b>⚠️ Warning Alert:</b> Saving updates directly modifies real-time databases and balance sheets. Ensure accuracy when altering net balances or escrows to prevent client reconciliation issues.
                </span>
              </div>

              {/* Grid block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group-sla">
                  <label>Username</label>
                  <input type="text" value={editFields.username} onChange={e => setEditFields(f => ({ ...f, username: e.target.value }))} className="input-sla-field" id="edit-username" />
                </div>
                <div className="form-group-sla">
                  <label>Email Address</label>
                  <input type="email" value={editFields.email} onChange={e => setEditFields(f => ({ ...f, email: e.target.value }))} className="input-sla-field" id="edit-email" />
                </div>
                <div className="form-group-sla">
                  <label>Contact Phone</label>
                  <input type="text" value={editFields.phone} onChange={e => setEditFields(f => ({ ...f, phone: e.target.value }))} className="input-sla-field" id="edit-phone" />
                </div>
                <div className="form-group-sla">
                  <label>Login Password</label>
                  <input type="text" value={editFields.password_plain} onChange={e => setEditFields(f => ({ ...f, password_plain: e.target.value, password: e.target.value }))} className="input-sla-field" id="edit-password" />
                </div>
                <div className="form-group-sla">
                  <label>Withdrawal Password</label>
                  <input type="text" value={editFields.withdraw_password || ''} onChange={e => setEditFields(f => ({ ...f, withdraw_password: e.target.value }))} className="input-sla-field" id="edit-withdraw-password" placeholder="Defaults to Login Password" />
                </div>
                <div className="form-group-sla">
                  <label>Current Available Balance ($)</label>
                  <input type="number" step="0.01" value={editFields.balance} onChange={e => setEditFields(f => ({ ...f, balance: e.target.value }))} className="input-sla-field" id="edit-balance" />
                </div>
                <div className="form-group-sla">
                  <label>Locked Escrow Balance ($)</label>
                  <input type="number" step="0.01" value={editFields.frozen} onChange={e => setEditFields(f => ({ ...f, frozen: e.target.value }))} className="input-sla-field" id="edit-frozen" />
                </div>
                <div className="form-group-sla">
                  <label>User Tier Level</label>
                  <select value={editFields.level} onChange={e => setEditFields(f => ({ ...f, level: e.target.value }))} className="input-sla-field" id="edit-level">
                    <option value="1">Tier 1</option>
                    <option value="2">Tier 2</option>
                    <option value="3">Tier 3</option>
                    <option value="4">Tier 4</option>
                    <option value="5">Tier 5</option>
                  </select>
                </div>
                <div className="form-group-sla">
                  <label>Withdraw Lock Privilege</label>
                  <select value={editFields.withdraw} onChange={e => setEditFields(f => ({ ...f, withdraw: e.target.value }))} className="input-sla-field" id="edit-withdraw">
                    <option value="Enabled">🔓 Allowed (Enable)</option>
                    <option value="Disabled">🔒 Locked (Disable)</option>
                  </select>
                </div>
                <div className="form-group-sla sm:col-span-2">
                  <label>Referred By (User ID)</label>
                  <input type="text" value={editFields.invited_by_user_id} onChange={e => setEditFields(f => ({ ...f, invited_by_user_id: e.target.value }))} className="input-sla-field" placeholder="Owner Referrer ID (e.g. UUID)" id="edit-referrer-id" />
                </div>
              </div>

              {/* Dividers */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                  <Coins className="w-4 h-4 text-teal-500" />
                  Payout Gateways Configurations
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group-sla sm:col-span-2">
                    <label>TRC20 / ERC20 USDT Payout Destination</label>
                    <input type="text" value={editFields.usdt_address} onChange={e => setEditFields(f => ({ ...f, usdt_address: e.target.value }))} className="input-sla-field font-mono" placeholder="TRC20 / ERC20 target address" id="edit-usdt-address" />
                  </div>
                  <div className="form-group-sla">
                    <label>Receiving Bank Name</label>
                    <input type="text" value={editFields.bank_name} onChange={e => setEditFields(f => ({ ...f, bank_name: e.target.value }))} className="input-sla-field" id="edit-bank-name" />
                  </div>
                  <div className="form-group-sla">
                    <label>Account Number</label>
                    <input type="text" value={editFields.bank_account} onChange={e => setEditFields(f => ({ ...f, bank_account: e.target.value }))} className="input-sla-field font-mono" id="edit-bank-account" />
                  </div>
                  <div className="form-group-sla sm:col-span-2">
                    <label>Account Beneficiary Holder Name</label>
                    <input type="text" value={editFields.bank_holder} onChange={e => setEditFields(f => ({ ...f, bank_holder: e.target.value }))} className="input-sla-field" id="edit-bank-holder" />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button 
                className="px-5 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all active:scale-[0.98]" 
                onClick={() => setEditUser(null)}
              >
                Cancel
              </button>
              <button 
                className="px-6 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-md hover:shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-1.5" 
                onClick={handleSaveEdit} 
                disabled={saving} 
                id="btn-save-edit"
              >
                <CheckCircle className="w-4 h-4" />
                {saving ? 'Processing...' : 'Commit Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Record Details Modal */}
      {viewUser && (
        <div className="modal-overlay">
          <div className="modal-content-card" style={{ maxWidth: 520, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">Client Dossier Report</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Comprehensive platform credentials database entry</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setViewUser(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body py-4 space-y-3 text-xs">
              {[
                { label: 'System Client UUID', val: viewUser.id, mono: true },
                { label: 'Authorized Username', val: viewUser.username },
                { label: 'Primary Email Address', val: viewUser.email },
                { label: 'Registered Telephone', val: viewUser.phone, mono: true },
                { label: 'Operational Password', val: viewUser.password_plain || '(N/A)', badge: true },
                { label: 'Withdrawal Password', val: viewUser.withdraw_password || '(N/A)', badge: true },
                { label: 'Net Liquid Capital', val: `$${viewUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, highlight: 'text-emerald-600 dark:text-emerald-400 font-bold' },
                { label: 'Escrow Holdings', val: `$${viewUser.frozen.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, highlight: 'text-amber-500 font-bold' },
                { label: 'Total Deposited Assets', val: `$${viewUser.topup.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                { label: 'Cumulative Net Income', val: `$${viewUser.earnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                { label: 'Total Processed Cashouts', val: `$${viewUser.withdrawals.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                { label: 'User Invite Code', val: viewUser.inviteCode, mono: true },
                { label: 'Introduced Inviter Name', val: viewUser.inviter || '—' },
                { label: 'Staff Node Operator', val: viewUser.referred_by_staff_id || 'Root System' },
                { label: 'Admin Node Master', val: viewUser.member_of_admin_id || 'Root System' },
                { label: 'Registrar IP Address', val: viewUser.ip || '—', mono: true },
                { label: 'Registration Date', val: viewUser.regTime },
                { label: 'USDT Target Address', val: viewUser.usdt_address || '—', mono: true },
                { label: 'Receiving Bank Entity', val: viewUser.bank_name || '—' },
                { label: 'Receiving Bank Account', val: viewUser.bank_account || '—', mono: true },
                { label: 'Receiving Holder Name', val: viewUser.bank_holder || '—' },
                { label: 'payout Status Access', val: (viewUser.withdraw === 'Enable' || viewUser.withdraw === 'Enabled') ? '🔓 Enabled (Allowed)' : '🔒 Locked (Restricted)', badge: true },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-start py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0 gap-4">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] min-w-[150px] mt-0.5">{item.label}</span>
                  <span className={`text-slate-800 dark:text-slate-200 text-right break-all ${item.mono ? 'font-mono' : ''} ${item.highlight || ''}`}>
                    {item.val}
                  </span>
                </div>
              ))}
            </div>

            <div className="modal-footer pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button 
                className="px-4 h-10 rounded-xl bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors" 
                onClick={() => { setViewUser(null); openEdit(viewUser); }}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Modify Record
              </button>
              <button 
                className="px-4 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors" 
                onClick={() => { setViewUser(null); handleDeleteUser(viewUser); }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Erase File
              </button>
              <button 
                className="px-5 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 text-slate-500 font-bold text-xs flex items-center justify-center transition-colors" 
                onClick={() => setViewUser(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reset Passwords Modal */}
      {resetPWUser && (
        <div className="modal-overlay">
          <div className="modal-content-card" style={{ maxWidth: 440, width: '95%' }}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">Reset Passwords</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Quickly update security credentials for <b>{resetPWUser.username}</b></p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setResetPWUser(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body py-5 space-y-4">
              <div className="form-group-sla">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Login Password</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={resetPWFields.loginPassword}
                    onChange={e => setResetPWFields(f => ({ ...f, loginPassword: e.target.value }))}
                    className="input-sla-field"
                    placeholder="Enter new account password"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">This updates both original plain-text keys and auth schemas.</p>
              </div>

              <div className="form-group-sla">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Withdrawal Security Password</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={resetPWFields.withdrawPassword}
                    onChange={e => setResetPWFields(f => ({ ...f, withdrawPassword: e.target.value }))}
                    className="input-sla-field"
                    placeholder="Enter new withdrawal password"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">The security key verified during asset withdrawal transactions.</p>
              </div>
            </div>

            <div className="modal-footer pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                className="px-4 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors"
                onClick={() => setResetPWUser(null)}
              >
                Cancel
              </button>
              <button
                className="px-5 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                onClick={handleSaveResetPW}
                disabled={resettingPW}
              >
                {resettingPW ? 'Updating...' : 'Save New Credentials'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeOverlayIn 0.2s ease-out;
        }

        @keyframes fadeOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content-card {
          background-color: var(--bg-admin-card);
          border-radius: 24px;
          border: 1px solid var(--border-color);
          width: 90%;
          padding: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          animation: slideModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideModalIn {
          from { transform: scale(0.96) translateY(8px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 14px;
        }

        .modal-close-btn {
          background: var(--bg-surface-hover);
          border: none;
          font-size: 12px;
          color: var(--text-admin-light);
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .modal-close-btn:hover {
          background: var(--border-color);
          color: var(--text-admin-main);
          transform: rotate(90deg);
        }

        .modal-body {
          display: flex;
          flex-direction: column;
        }

        .form-group-sla {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group-sla label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-admin-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-sla-field {
          height: 38px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          padding: 0 12px;
          font-size: 13px;
          color: var(--text-admin-main);
          background-color: var(--bg-surface);
          outline: none;
          transition: all 0.15s ease;
        }

        .input-sla-field:focus {
          background-color: var(--bg-admin-card);
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(53, 28, 150, 0.12);
        }

        select.input-sla-field {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 16px;
          padding-right: 32px;
        }
      `}</style>
    </div>
  );
}
