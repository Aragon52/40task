import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { 
  Database, 
  Trash2, 
  AlertTriangle, 
  UserX, 
  RefreshCw, 
  Search, 
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

interface InactiveUser {
  id: string;
  user_id: string;
  username: string;
  email: string;
  created_at: string;
  balance: number;
  online: string;
  orderCount?: number;
}

export default function DbManagement() {
  const [users, setUsers] = useState<InactiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<InactiveUser | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'inactive' | 'zero_balance'>('inactive');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: usersData, error } = await supabase
        .from('cb_users')
        .select('*');

      if (error) throw error;

      const enhanced: InactiveUser[] = [];
      if (usersData) {
        for (const u of usersData) {
          let orderCount = 0;
          try {
            const { count } = await supabase
              .from('cb_orders')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', u.user_id);
            orderCount = count || 0;
          } catch (e) {
            orderCount = 0;
          }

          enhanced.push({
            id: u.id || u.user_id,
            user_id: u.user_id || u.id,
            username: u.username || u.email || 'Unknown',
            email: u.email || 'No Email',
            created_at: u.reg_time || u.created_at || new Date().toISOString(),
            balance: Number(u.balance || 0),
            online: u.online || 'Offline',
            orderCount
          });
        }
      }
      setUsers(enhanced);
    } catch (err: any) {
      console.error("Error fetching users for DB management:", err);
      toast.error(`Failed to load user records: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (user: InactiveUser) => {
    setDeleting(true);
    try {
      const userId = user.user_id;

      // Cascade delete related records safely
      try { await supabase.from('cb_orders').delete().eq('user_id', userId); } catch (e) {}
      try { await supabase.from('cb_deposits').delete().eq('user_id', userId); } catch (e) {}
      try { await supabase.from('cb_withdrawals').delete().eq('user_id', userId); } catch (e) {}
      try { await supabase.from('cb_transaction_logs').delete().eq('user_id', userId); } catch (e) {}

      // Finally delete user
      const { error } = await supabase.from('cb_users').delete().eq('user_id', userId);
      if (error) throw error;

      toast.success(`User ${user.username} and all related records deleted successfully`);
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      console.error("Error deleting user data:", err);
      toast.error(`Failed to delete user: ${err.message || 'Unknown error'}`);
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    if (filterMode === 'inactive') {
      return u.balance === 0 || u.online === 'Offline' || (u.orderCount || 0) === 0;
    }
    if (filterMode === 'zero_balance') {
      return u.balance === 0;
    }
    return true;
  });

  return (
    <div className="admin-page-container space-y-6">
      {/* Header */}
      <div className="admin-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-50 text-xl tracking-tight flex items-center gap-2.5">
              <Database className="w-6 h-6 text-rose-500" />
              <span>Database Management & Inactive User Purge</span>
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Identify and securely purge inactive user accounts, test records, and orphaned transactional data to maintain DB hygiene.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card !p-5 !mb-0 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Registered Users</span>
            <span className="text-xl font-bold font-mono tabular-nums mt-1 text-slate-900 dark:text-white block">{users.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border border-indigo-100 dark:border-indigo-900/30">
            <Database size={20} />
          </div>
        </div>

        <div className="admin-card !p-5 !mb-0 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Inactive / Zero Balance</span>
            <span className="text-xl font-bold font-mono tabular-nums mt-1 text-amber-600 block">
              {users.filter(u => u.balance === 0 || u.online === 'Offline').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-100 dark:border-amber-900/30">
            <UserX size={20} />
          </div>
        </div>

        <div className="admin-card !p-5 !mb-0 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Active Online</span>
            <span className="text-xl font-bold font-mono tabular-nums mt-1 text-emerald-600 block">
              {users.filter(u => u.online === 'Online').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card space-y-4">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by username, email, or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setFilterMode('inactive')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterMode === 'inactive' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Inactive / Stale
            </button>
            <button
              onClick={() => setFilterMode('zero_balance')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterMode === 'zero_balance' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Zero Balance
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterMode === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All Accounts
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">User Account</th>
                <th className="py-3.5 px-4">User ID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Balance</th>
                <th className="py-3.5 px-4">Orders</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading user records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    No inactive user accounts found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.user_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{u.username}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {u.user_id.substring(0, 12)}...
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.online === 'Online' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {u.online}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      ${u.balance.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {u.orderCount || 0} orders
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto cursor-pointer border border-rose-200 dark:border-rose-900/50"
                      >
                        <Trash2 size={14} />
                        <span>Purge Account</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            
            <div className="text-center space-y-1">
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">Confirm Account & Data Purge</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Are you sure you want to delete user <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedUser.username}</span>? This will permanently remove the user account, order history, deposits, withdrawals, and transaction records.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs font-mono text-slate-600 dark:text-slate-400">
              <div>User ID: {selectedUser.user_id}</div>
              <div>Email: {selectedUser.email}</div>
              <div>Balance: ${selectedUser.balance.toFixed(2)}</div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                disabled={deleting}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(selectedUser)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {deleting && <RefreshCw size={16} className="animate-spin" />}
                <span>{deleting ? 'Purging...' : 'Yes, Purge Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
