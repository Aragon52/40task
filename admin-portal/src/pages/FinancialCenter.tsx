import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Search, 
  DollarSign, 
  Briefcase, 
  Check, 
  Info, 
  AlertCircle, 
  X, 
  Eye, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Settings2,
  QrCode,
  ShieldAlert,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Modal, Card, Input, Badge } from '@/src/shared/UI';

export default function FinancialCenter() {
  const [activeSubTab, setActiveSubTab] = useState('deposits');
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    usdtAddress: 'TY3N9dSk8sHDKsi8s9DKks82kdJS9k1nsD',
    qrCodeUrl: ''
  });
  
  const [session, setSession] = useState<any>({ role: 'Owner', name: 'System Owner', email: 'owner@wallmark.com' });
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Actions states
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [actionType, setActionType] = useState(''); // 'view_slip', 'reject_deposit', 'reject_withdrawal'
  const [rejectRemark, setRejectRemark] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editQrCode, setEditQrCode] = useState('');
  const [imageZoom, setImageZoom] = useState(1);

  const fetchFinancialData = async () => {
    try {
      // Session
      const savedSession = localStorage.getItem('cb_admin_session');
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }

      // Deposits
      const { data: depsData, error: depsError } = await supabase
        .from('cb_deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (!depsError && depsData) {
        const mappedDeps = depsData.map(d => ({
          id: d.id,
          userId: d.user_id,
          username: d.username,
          amount: parseFloat(d.amount || 0),
          currency: d.currency,
          screenshotName: d.screenshot_name,
          screenshotUrl: d.screenshot_url,
          status: d.status,
          createdAt: new Date(d.created_at).toLocaleString(),
          referred_by_staff_id: d.referred_by_staff_id || 'None',
          member_of_admin_id: d.member_of_admin_id || 'None'
        }));
        setDeposits(mappedDeps);
      }

      // Withdrawals
      const { data: wthsData, error: wthsError } = await supabase
        .from('cb_withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (!wthsError && wthsData) {
        const mappedWths = wthsData.map(w => ({
          id: w.id,
          userId: w.user_id,
          username: w.username,
          amount: parseFloat(w.amount || 0),
          method: w.method,
          account_info: w.account_info,
          status: w.status,
          createdAt: new Date(w.created_at).toLocaleString(),
          referred_by_staff_id: w.referred_by_staff_id || 'None',
          member_of_admin_id: w.member_of_admin_id || 'None',
          remark: w.remark || ''
        }));
        setWithdrawals(mappedWths);
      }

      // Settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('cb_deposit_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (!settingsError && settingsData) {
        const currentSettings = {
          usdtAddress: settingsData.usdt_address,
          qrCodeUrl: settingsData.qr_code_url || ''
        };
        setSettings(currentSettings);
        setEditAddress(currentSettings.usdtAddress);
        setEditQrCode(currentSettings.qrCodeUrl);
      }
    } catch (err) {
      console.error("Error loading financial data:", err);
    }
  };

  useEffect(() => {
    fetchFinancialData();
    const interval = setInterval(() => {
      if (document.hidden) return; 
      fetchFinancialData();
    }, 15000); 
    return () => clearInterval(interval);
  }, []);

  const getFilteredDeposits = () => {
    return deposits.filter(d => {
      if (session.role === 'Admin') {
        if (d.member_of_admin_id !== session.accountId) return false;
      } else if (session.role === 'Staff') {
        if (d.referred_by_staff_id !== session.accountId) return false;
      }
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = d.username.toLowerCase().includes(q) || 
                             d.id.toLowerCase().includes(q) ||
                             d.referred_by_staff_id.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (statusFilter !== 'All') {
        if (d.status !== statusFilter) return false;
      }

      return true;
    });
  };

  const getFilteredWithdrawals = () => {
    return withdrawals.filter(w => {
      if (session.role === 'Admin') {
        if (w.member_of_admin_id !== session.accountId) return false;
      } else if (session.role === 'Staff') {
        if (w.referred_by_staff_id !== session.accountId) return false;
      }
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = w.username.toLowerCase().includes(q) || 
                             w.id.toLowerCase().includes(q) ||
                             w.referred_by_staff_id.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (statusFilter !== 'All') {
        if (w.status !== statusFilter) return false;
      }

      return true;
    });
  };

  const handleApproveDeposit = async (dep: any) => {
    if (window.confirm(`Are you sure you want to APPROVE deposit of $${dep.amount.toFixed(2)} for ${dep.username}?`)) {
      try {
        const { data: userData, error: userError } = await supabase
          .from('cb_users')
          .select('id, balance')
          .eq('username', dep.username)
          .single();

        if (userError || !userData) {
          toast.error("Error fetching user for balance update: " + (userError?.message || "User not found"));
          return;
        }

        const newBalance = parseFloat((parseFloat(userData.balance || 0) + dep.amount).toFixed(2));

        const { error: updateBalanceError } = await supabase
          .from('cb_users')
          .update({ balance: newBalance })
          .eq('id', userData.id);

        if (updateBalanceError) {
          toast.error("Error updating user balance: " + updateBalanceError.message);
          return;
        }

        const { error: updateDepError } = await supabase
          .from('cb_deposits')
          .update({ status: 'Approved' })
          .eq('id', dep.id);

        if (updateDepError) {
          toast.error("Error updating deposit status: " + updateDepError.message);
          return;
        }

        toast.success('Deposit approved! User balance updated.');
        fetchFinancialData();
      } catch (err: any) {
        toast.error("Operation failed: " + err.message);
      }
    }
  };

  const handleOpenRejectDeposit = (dep: any) => {
    setSelectedItem(dep);
    setActionType('reject_deposit');
    setRejectRemark('');
  };

  const handleConfirmRejectDeposit = async () => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('cb_deposits')
        .update({ status: 'Rejected' })
        .eq('id', selectedItem.id);

      if (error) {
        toast.error("Error rejecting deposit: " + error.message);
        return;
      }

      setSelectedItem(null);
      setActionType('');
      toast.success('Deposit request rejected.');
      fetchFinancialData();
    } catch (err: any) {
      toast.error("Failed to reject deposit: " + err.message);
    }
  };

  const handleApproveWithdrawal = async (wth: any) => {
    if (window.confirm(`Are you sure you want to APPROVE withdrawal of $${wth.amount.toFixed(2)} for ${wth.username}?`)) {
      try {
        const { data: userData, error: userError } = await supabase
          .from('cb_users')
          .select('id, withdrawals')
          .eq('username', wth.username)
          .single();

        if (userError || !userData) {
          toast.error("Error fetching user: " + (userError?.message || "User not found"));
          return;
        }

        const newWithdrawals = parseFloat((parseFloat(userData.withdrawals || 0) + wth.amount).toFixed(2));

        const { error: updateUserError } = await supabase
          .from('cb_users')
          .update({ withdrawals: newWithdrawals })
          .eq('id', userData.id);

        if (updateUserError) {
          toast.error("Error updating user withdrawals: " + updateUserError.message);
          return;
        }

        const { error: updateWthError } = await supabase
          .from('cb_withdrawals')
          .update({ status: 'Approved' })
          .eq('id', wth.id);

        if (updateWthError) {
          toast.error("Error updating withdrawal status: " + updateWthError.message);
          return;
        }

        toast.success('Withdrawal approved!');
        fetchFinancialData();
      } catch (err: any) {
        toast.error("Operation failed: " + err.message);
      }
    }
  };

  const handleOpenRejectWithdrawal = (wth: any) => {
    setSelectedItem(wth);
    setActionType('reject_withdrawal');
    setRejectRemark('');
  };

  const handleConfirmRejectWithdrawal = async () => {
    if (!selectedItem) return;

    try {
      const { error: updateWthError } = await supabase
        .from('cb_withdrawals')
        .update({ status: 'Rejected', remark: rejectRemark })
        .eq('id', selectedItem.id);

      if (updateWthError) {
        toast.error("Error rejecting withdrawal: " + updateWthError.message);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('cb_users')
        .select('id, balance')
        .eq('username', selectedItem.username)
        .single();

      if (!userError && userData) {
        const newBalance = parseFloat((parseFloat(userData.balance || 0) + selectedItem.amount).toFixed(2));
        await supabase
          .from('cb_users')
          .update({ balance: newBalance })
          .eq('id', userData.id);
      }

      setSelectedItem(null);
      setActionType('');
      toast.success('Withdrawal request rejected. Funds refunded to user.');
      fetchFinancialData();
    } catch (err: any) {
      toast.error("Failed to reject withdrawal: " + err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAddress) {
      toast.error('Please provide a valid USDT Address.');
      return;
    }

    try {
      const { error } = await supabase
        .from('cb_deposit_settings')
        .update({ usdt_address: editAddress, qr_code_url: editQrCode })
        .eq('id', 1);

      if (error) {
        toast.error("Error saving settings: " + error.message);
        return;
      }

      setSettings({ usdtAddress: editAddress, qrCodeUrl: editQrCode });
      toast.success('Payment node settings saved successfully!');
      fetchFinancialData();
    } catch (err: any) {
      toast.error("Failed to save settings: " + err.message);
    }
  };

  const handleViewSlip = (dep: any) => {
    setSelectedItem(dep);
    setActionType('view_slip');
    setImageZoom(1);
  };

  const filteredDeps = getFilteredDeposits();
  const filteredWths = getFilteredWithdrawals();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-500" />
              Financial Center
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Manage deposits, approve payouts, and configure payment gateways.
            </p>
          </div>
          
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button 
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSubTab === 'deposits' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setActiveSubTab('deposits'); setStatusFilter('All'); setSearchQuery(''); }}
            >
              Deposits ({filteredDeps.filter(d => d.status === 'Pending').length})
            </button>
            <button 
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSubTab === 'withdrawals' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setActiveSubTab('withdrawals'); setStatusFilter('All'); setSearchQuery(''); }}
            >
              Payouts ({filteredWths.filter(w => w.status === 'Pending').length})
            </button>
            <button 
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSubTab === 'settings' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setActiveSubTab('settings'); }}
            >
              Gateway Settings
            </button>
          </div>
        </div>
      </Card>

      {activeSubTab !== 'settings' && (
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search username or request ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
              />
            </div>

            <div className="relative min-w-[200px] w-full md:w-auto">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 pl-4 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 appearance-none transition-all"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {activeSubTab === 'deposits' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Node</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Network</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDeps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500 font-medium text-xs">
                      No deposit requests found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredDeps.map(dep => (
                    <tr key={dep.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-[10px] font-bold text-slate-400">#{dep.id.substring(0,8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-[10px] font-black uppercase">
                            {dep.username.substring(0,2)}
                          </div>
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{dep.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[9px] font-black py-0.5 px-2">{dep.referred_by_staff_id}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                          ${dep.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{dep.currency}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={dep.status === 'Approved' ? 'success' : dep.status === 'Rejected' ? 'error' : 'warning'}
                          className="text-[9px] font-black py-0 px-2 uppercase"
                        >
                          {dep.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                        {dep.createdAt}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 px-3 text-[10px] font-black"
                            onClick={() => handleViewSlip(dep)}
                          >
                            <Eye className="w-3.5 h-3.5" /> SLIP
                          </Button>
                          {dep.status === 'Pending' && (
                            <>
                              <Button 
                                variant="success" 
                                size="sm" 
                                className="h-8 px-3 text-[10px] font-black"
                                onClick={() => handleApproveDeposit(dep)}
                              >
                                APPROVE
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm" 
                                className="h-8 px-3 text-[10px] font-black"
                                onClick={() => handleOpenRejectDeposit(dep)}
                              >
                                REJECT
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeSubTab === 'withdrawals' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Node</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method & Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredWths.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500 font-medium text-xs">
                      No payout requests found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredWths.map(wth => (
                    <tr key={wth.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-[10px] font-bold text-slate-400">#{wth.id.substring(0,8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-black uppercase">
                            {wth.username.substring(0,2)}
                          </div>
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{wth.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[9px] font-black py-0.5 px-2">{wth.referred_by_staff_id}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                          ${wth.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 max-w-[200px]">
                          <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{wth.method}</div>
                          <div className="text-[9px] font-mono text-slate-500 break-all leading-tight">{wth.account_info}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge 
                            variant={wth.status === 'Approved' ? 'success' : wth.status === 'Rejected' ? 'error' : 'warning'}
                            className="text-[9px] font-black py-0 px-2 uppercase"
                          >
                            {wth.status}
                          </Badge>
                          {wth.remark && <span className="text-[8px] font-bold text-rose-500 uppercase tracking-tighter truncate max-w-[80px]">{wth.remark}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                        {wth.createdAt}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {wth.status === 'Pending' ? (
                            <>
                              <Button 
                                variant="success" 
                                size="sm" 
                                className="h-8 px-3 text-[10px] font-black"
                                onClick={() => handleApproveWithdrawal(wth)}
                              >
                                APPROVE
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm" 
                                className="h-8 px-3 text-[10px] font-black"
                                onClick={() => handleOpenRejectWithdrawal(wth)}
                              >
                                REJECT
                              </Button>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-[9px] font-black py-1 px-3 grayscale opacity-50 uppercase tracking-widest">FINALIZED</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeSubTab === 'settings' && (
        <Card className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Settings2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Gateway Infrastructure</h4>
                <p className="text-xs text-slate-500 font-medium">Configure global payment nodes and secure receive addresses.</p>
              </div>
            </div>
            
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <Input
                label="USDT Wallet Receive Address (TRC20)"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                disabled={session.role === 'Staff'}
                required
                icon={<Wallet className="w-4 h-4" />}
                className="font-mono text-xs"
              />
              
              <Input
                label="QR Code Image URL (Public Access)"
                value={editQrCode}
                onChange={(e) => setEditQrCode(e.target.value)}
                disabled={session.role === 'Staff'}
                icon={<QrCode className="w-4 h-4" />}
                className="text-xs"
              />

              {session.role !== 'Staff' ? (
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 text-[11px] font-black uppercase tracking-widest"
                  icon={<Check className="w-4 h-4" />}
                >
                  Save Payment Configuration
                </Button>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
                    Staff nodes restricted: Payment gateway infrastructure can only be modified by root system administrators or owners.
                  </p>
                </div>
              )}
            </form>
          </div>
        </Card>
      )}

      {/* View Slip Modal */}
      {actionType === 'view_slip' && selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => { setSelectedItem(null); setActionType(''); }}
          title="Digital Receipt Audit"
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction Reference</span>
                <div className="font-mono text-xs font-bold text-slate-900 dark:text-white uppercase">{selectedItem.id}</div>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verification Amount</span>
                <div className="font-mono text-lg font-black text-emerald-600 tracking-tight">${selectedItem.amount.toFixed(2)}</div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="p-4 flex items-center justify-center min-h-[400px]">
                <img 
                  src={selectedItem.screenshotUrl} 
                  alt="Receipt" 
                  style={{ 
                    transform: `scale(${imageZoom})`,
                    transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
                  }}
                  className="max-h-[500px] object-contain shadow-2xl relative z-10"
                />
              </div>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full z-20">
                <button onClick={() => setImageZoom(prev => Math.max(1, prev - 0.5))} className="text-white hover:text-indigo-400 transition-colors">
                  <Minimize2 className="w-4 h-4" />
                </button>
                <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(imageZoom / 5) * 100}%` }} />
                </div>
                <button onClick={() => setImageZoom(prev => Math.min(5, prev + 0.5))} className="text-white hover:text-indigo-400 transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
              <span>Origin: {selectedItem.username}</span>
              <span>Network: {selectedItem.currency}</span>
            </div>
            
            <Button onClick={() => { setSelectedItem(null); setActionType(''); }} className="w-full">Close Audit View</Button>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {(actionType === 'reject_deposit' || actionType === 'reject_withdrawal') && selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => { setSelectedItem(null); setActionType(''); }}
          title="Administrative Rejection"
        >
          <div className="space-y-6">
            <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 leading-relaxed uppercase tracking-tight">
                Rejected requests will notify the user immediately. For withdrawals, funds will be automatically refunded to the user's available balance.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rejection Reason / Remark</label>
              <textarea 
                className="w-full h-32 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                placeholder="Describe why this transaction is being rejected..."
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="secondary" onClick={() => { setSelectedItem(null); setActionType(''); }}>Cancel</Button>
              <Button 
                variant="danger"
                className="px-8 shadow-lg shadow-rose-500/20"
                onClick={actionType === 'reject_deposit' ? handleConfirmRejectDeposit : handleConfirmRejectWithdrawal}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
