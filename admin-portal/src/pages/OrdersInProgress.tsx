import React, { useState, useEffect } from 'react';
import { PRODUCT_CATALOG } from '../data/products';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { 
  ClipboardList, 
  ListOrdered, 
  TrendingUp, 
  LineChart,
  DollarSign, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Layers, 
  AlertCircle,
  HelpCircle,
  Briefcase,
  Database,
  Eye,
  Info,
  Layers3,
  Sparkles,
  Award,
  Search,
  Filter
} from 'lucide-react';

export default function OrdersInProgress() {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [products, setProducts] = useState(PRODUCT_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState({});

  // Edit Worksheet Orders Modal state
  const [showEditOrdersModal, setShowEditOrdersModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingOrders, setEditingOrders] = useState([]);

  const fetchTasks = async () => {
    try {
      const savedSession = localStorage.getItem('cb_admin_session');
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }

      // Fetch Assigned Tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('cb_assigned_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!tasksError && tasksData) {
        const mappedTasks = tasksData.map(t => ({
          id: t.id,
          userId: t.user_id,
          username: t.username,
          totalAmount: parseFloat(t.total_amount || 0),
          orderCount: t.order_count,
          profitPercent: parseFloat(t.profit_percent || 0),
          status: t.status,
          createdAt: new Date(t.created_at).toLocaleString(),
          assignedBy: t.assigned_by,
          orders: typeof t.orders === 'string' ? JSON.parse(t.orders) : t.orders,
          referred_by_staff_id: t.referred_by_staff_id || 'None',
          member_of_admin_id: t.member_of_admin_id || 'None'
        }));
        setAssignedTasks(mappedTasks);
      }
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  const loadProducts = async () => {
    try {
      let activeProducts = PRODUCT_CATALOG;
      const { data: dbProducts } = await supabase.from('cb_products').select('*');
      if (dbProducts && dbProducts.length > 0) {
        activeProducts = dbProducts.map((p, idx) => ({
          id: p.id || `db-prod-${idx}`,
          title: p.title,
          image: p.image_url || p.image,
          type: p.type || 'gear',
          price: parseFloat(p.price || 0),
          profit: parseFloat(p.profit || 0)
        }));
      }
      setProducts(activeProducts);
    } catch (err) {
      console.error("Error loading products catalog:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    loadProducts();
    const interval = setInterval(() => {
      if (document.hidden) return; // Save bandwidth when tab is in background!
      fetchTasks();
    }, 15000); // Poll every 15 seconds instead of 3
    return () => clearInterval(interval);
  }, []);

  const getFilteredTasks = () => {
    return assignedTasks.filter(t => {
      // Role Node checking
      const s = session as any;
      if (s?.role === 'Admin') {
        if (t.member_of_admin_id !== s?.accountId) return false;
      } else if (s?.role === 'Staff') {
        if (t.referred_by_staff_id !== s?.accountId) return false;
      }

      // Search checking
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.username.toLowerCase().includes(q) || 
          t.id.toLowerCase().includes(q) ||
          t.assignedBy.toLowerCase().includes(q)
        );
      }
      return true;
    });
  };

  const handleCancelTask = async (taskId) => {
    if (window.confirm("Are you sure you want to cancel and delete this assigned task? All pending orders will be removed.")) {
      try {
        // Step 1: Delete all linked orders from cb_orders
        const { error: ordersDeleteError } = await supabase
          .from('cb_orders')
          .delete()
          .eq('assigned_task_id', taskId);

        if (ordersDeleteError) {
          toast.error("Error removing linked orders: " + ordersDeleteError.message);
          return;
        }

        // Step 2: Delete the task itself from cb_assigned_tasks
        const { error: taskDeleteError } = await supabase
          .from('cb_assigned_tasks')
          .delete()
          .eq('id', taskId);

        if (taskDeleteError) {
          toast.error("Error deleting task: " + taskDeleteError.message);
          return;
        }

        toast.success("Task and all linked orders cancelled and deleted successfully.");
        fetchTasks();
      } catch (err) {
        toast.error("Failed to delete task: " + err.message);
      }
    }
  };

  const handleOpenEditOrdersModal = (task) => {
    setEditingTask(task);
    setEditingOrders(task.orders.map(o => ({ ...o })));
    setShowEditOrdersModal(true);
  };

  const handleSaveEditedOrders = async (e) => {
    e.preventDefault();
    if (!editingTask) return;

    for (let idx = 0; idx < editingOrders.length; idx++) {
      const o = editingOrders[idx];
      const pPrice = parseFloat(o.price);
      const pProfit = parseFloat(o.profit);
      if (isNaN(pPrice) || pPrice <= 0 || isNaN(pProfit) || pProfit < 0) {
        toast.error(`Order #${idx + 1} has invalid price or profit.`);
        return;
      }
    }

    try {
      const cleanedOrders = editingOrders.map(o => ({
        ...o,
        price: parseFloat(parseFloat(o.price || 0).toFixed(2)),
        profit: parseFloat(parseFloat(o.profit || 0).toFixed(2))
      }));

      const newTotalAmount = parseFloat(cleanedOrders.reduce((sum, o) => sum + parseFloat(o.price || 0), 0).toFixed(2));
      const newTotalProfit = parseFloat(cleanedOrders.reduce((sum, o) => sum + parseFloat(o.profit || 0), 0).toFixed(2));
      const newProfitPercent = newTotalAmount > 0 ? parseFloat(((newTotalProfit / newTotalAmount) * 100).toFixed(2)) : 0;

      // 1. Update cb_assigned_tasks with cleaned orders, total_amount, and profit_percent
      const { error: taskErr } = await supabase
        .from('cb_assigned_tasks')
        .update({ 
          orders: cleanedOrders,
          total_amount: newTotalAmount,
          profit_percent: newProfitPercent
        })
        .eq('id', editingTask.id);

      if (taskErr) {
        toast.error("Error updating worksheet orders in task: " + taskErr.message);
        return;
      }

      // 2. Update individual order records in cb_orders table
      for (let idx = 0; idx < cleanedOrders.length; idx++) {
        const o = cleanedOrders[idx];
        await supabase
          .from('cb_orders')
          .update({
            title: o.title,
            price: o.price,
            profit: o.profit,
            status: o.status
          })
          .eq('assigned_task_id', editingTask.id)
          .eq('assigned_order_index', idx);
      }

      toast.success("Successfully updated worksheet orders!");
      setShowEditOrdersModal(false);
      setEditingTask(null);
      setEditingOrders([]);
      fetchTasks();
    } catch (err) {
      toast.error("Failed to save changes: " + err.message);
    }
  };

  const filteredTasks = getFilteredTasks();

  const [statusFilter, setStatusFilter] = useState<'All' | 'In Progress' | 'Completed' | 'Pending'>('All');

  const filteredTasksWithStatus = filteredTasks.filter(t => {
    if (statusFilter === 'All') return true;
    return t.status === statusFilter;
  });

  // KPI Metrics calculation
  const totalTaskCount = filteredTasks.length;
  const inProgressCount = filteredTasks.filter(t => t.status === 'In Progress').length;
  const completedTaskCount = filteredTasks.filter(t => t.status === 'Completed').length;
  const pendingTaskCount = filteredTasks.filter(t => t.status === 'Pending').length;
  const totalVolume = filteredTasks.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  return (
    <div className="admin-page-container space-y-6 scale-up">
      {/* Header and Subtabs matching FinancialCenter layout */}
      <div className="admin-card">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-50 text-xl sm:text-2xl tracking-tight flex items-center gap-2.5">
              <LineChart className="w-6 h-6 text-indigo-500" />
              <span>Orders In Progress & Worksheets</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Monitor real-time worksheet sequences, track client completion progress, and modify allocated orders.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start xl:self-auto">
            <button 
              className={`px-3.5 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === 'All' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-700' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              onClick={() => setStatusFilter('All')}
            >
              All Worksheets ({filteredTasks.length})
            </button>
            <button 
              className={`px-3.5 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === 'In Progress' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-700' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              onClick={() => setStatusFilter('In Progress')}
            >
              In Progress ({filteredTasks.filter(t => t.status === 'In Progress').length})
            </button>
            <button 
              className={`px-3.5 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === 'Completed' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-700' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              onClick={() => setStatusFilter('Completed')}
            >
              Completed ({filteredTasks.filter(t => t.status === 'Completed').length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="admin-card !p-5 !mb-0 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Tasks</span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">{totalTaskCount}</span>
          </div>
        </div>

        <div className="admin-card !p-5 !mb-0 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">In Progress</span>
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">{inProgressCount}</span>
          </div>
        </div>

        <div className="admin-card !p-5 !mb-0 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center shrink-0">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Completed</span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">{completedTaskCount}</span>
          </div>
        </div>

        <div className="admin-card !p-5 !mb-0 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/40 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Allocated Volume</span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search user, task ID, or admin..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 text-xs font-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
          />
        </div>
      </div>

      {/* Task Tracker Table */}
      <div className="admin-card !p-0 overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base sm:text-lg tracking-tight">Worksheet Task Tracker</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time status tracking for client order allocations</p>
            </div>
          </div>
          <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/40">
            {filteredTasksWithStatus.length} Worksheets
          </span>
        </div>
        
        <div className="table-responsive-wrapper border-none rounded-none">
          <table className="admin-table orders-progress-table min-w-[1440px]">
            <thead>
              <tr>
                <th className="px-5 py-5">Task ID</th>
                <th className="px-5 py-5">Client User</th>
                <th className="px-5 py-5">Total Amount</th>
                <th className="px-5 py-5">Completion Progress</th>
                <th className="px-5 py-5">Yield %</th>
                <th className="px-5 py-5">Assigned By</th>
                <th className="px-5 py-5">Status</th>
                <th className="px-5 py-5">Assigned Date</th>
                <th className="px-5 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTasksWithStatus.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-7 py-14 text-center text-slate-500 dark:text-slate-400 font-medium text-sm">
                    No active or pending worksheets matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredTasksWithStatus.map(t => {
                  const completedCount = t.orders ? t.orders.filter(o => o.status === 'Success').length : 0;
                  const totalOrders = t.orderCount || (t.orders ? t.orders.length : 1);
                  const progressPct = Math.round((completedCount / totalOrders) * 100);
                  const isCompleted = t.status === 'Completed';
                  const isInProgress = t.status === 'In Progress';
                  
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-5">
                        <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800/40">
                          {t.id}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                            {t.username.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900 dark:text-white block">{t.username}</span>
                            <span className="text-xs text-slate-400 font-mono font-medium block mt-1">Staff: {t.referred_by_staff_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <span className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                          ${t.totalAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-5 min-w-[240px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-700 dark:text-slate-300 font-mono">{completedCount} / {totalOrders} orders</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-mono">{progressPct}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-indigo-600'
                              }`} 
                              style={{ width: `${progressPct}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                          +{t.profitPercent}%
                        </span>
                      </td>
                      <td className="px-5 py-5 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.assignedBy}</td>
                      <td className="px-5 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40' : 
                          isInProgress ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40' : 
                          'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40'
                        }`}>
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : (isInProgress ? <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> : null)}
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">{t.createdAt}</td>
                      <td className="px-5 py-5 text-right whitespace-nowrap">
                        {t.status !== 'Completed' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenEditOrdersModal(t)}
                              className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleCancelTask(t.id)}
                              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 inline-flex">
                            <Check className="w-4 h-4" /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Worksheet Orders Modal */}
      {showEditOrdersModal && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 sm:p-6 transition-all">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90dvh]">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/30">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Modify Worksheet Item Sequence
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Editing Task: <span className="font-mono text-indigo-500 font-semibold">{editingTask.id}</span> • Assigned Client: <b>{editingTask.username}</b>
                  </p>
                </div>
              </div>
              <button 
                type="button"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                onClick={() => { setShowEditOrdersModal(false); setEditingTask(null); }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedOrders} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                
                {/* Information advice banner */}
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 p-4 rounded-2xl flex items-start gap-3 text-sm leading-relaxed shadow-sm">
                  <Info className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" />
                  <span>
                    <span className="font-bold">Sequence Editing Guideline:</span> You can customize each individual order in the worksheet sequence. Editing prices and profits here will directly update both the task worksheet and the user's pending order screen. To prevent discrepancy, edit <b>Pending</b> orders only.
                  </span>
                </div>

                {/* Rows block */}
                <div className="space-y-5">
                  {editingOrders.map((order, idx) => {
                    const isCompleted = order.status === 'Success';
                    return (
                      <div 
                        key={idx} 
                        className={`border rounded-2xl p-6 relative transition-all ${
                          isCompleted 
                            ? 'bg-slate-50/60 dark:bg-slate-950/20 border-slate-200/50 dark:border-slate-800 opacity-75' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-5">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                              {idx + 1}
                            </div>
                            Worksheet Order Row
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status:</span>
                            <select
                              value={order.status}
                              onChange={(e) => {
                                const newOrders = [...editingOrders];
                                newOrders[idx].status = e.target.value;
                                setEditingOrders(newOrders);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none border transition-colors ${
                                isCompleted 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                              }`}
                            >
                              <option value="Pending">⌛ Pending</option>
                              <option value="Success">✓ Success</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-5">
                          {/* Quick fill dropdown from Catalog */}
                          {!isCompleted && products.length > 0 && (
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Quick Fill from Product Catalog</label>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const prod = products[parseInt(e.target.value)];
                                    const newOrders = [...editingOrders];
                                    newOrders[idx].title = prod.title;
                                    newOrders[idx].image = prod.image;
                                    newOrders[idx].price = prod.price;
                                    // Re-calculate profit based on task's profit yield percent
                                    const pYield = parseFloat(editingTask.profitPercent || '5');
                                    newOrders[idx].profit = parseFloat((prod.price * (pYield / 100)).toFixed(2));
                                    setEditingOrders(newOrders);
                                  }
                                }}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-sm outline-none transition-colors"
                                defaultValue=""
                              >
                                <option value="">-- Choose a product to auto-fill title, image, price & profit --</option>
                                {products.map((p, pIdx) => (
                                  <option key={pIdx} value={pIdx}>
                                    {p.title.length > 50 ? p.title.substring(0, 50) + '...' : p.title} (${p.price})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Text input and Numerical fields */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Product Title</label>
                              <div className="flex gap-3">
                                {order.image && (
                                  <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white shadow-sm p-1.5 flex-shrink-0 flex items-center justify-center">
                                    <img src={order.image} alt="" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                                  </div>
                                )}
                                <input 
                                  type="text"
                                  value={order.title}
                                  onChange={(e) => {
                                    const newOrders = [...editingOrders];
                                    newOrders[idx].title = e.target.value;
                                    setEditingOrders(newOrders);
                                  }}
                                  required
                                  disabled={isCompleted}
                                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 text-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none disabled:bg-slate-100 disabled:dark:bg-slate-950 disabled:text-slate-400 transition-colors"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Price ($)</label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-slate-400">$</span>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    value={order.price}
                                    onChange={(e) => {
                                      const newOrders = [...editingOrders];
                                      newOrders[idx].price = e.target.value;
                                      // Automatically recalculate profit using the task's profit commission yield percentage
                                      const pYield = parseFloat(editingTask.profitPercent || '5');
                                      const val = parseFloat(e.target.value || '0');
                                      newOrders[idx].profit = parseFloat((val * (pYield / 100)).toFixed(2));
                                      setEditingOrders(newOrders);
                                    }}
                                    required
                                    disabled={isCompleted}
                                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 text-sm font-mono focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none disabled:bg-slate-100 disabled:dark:bg-slate-950 transition-colors"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider block">Commission ($)</label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-emerald-500">$</span>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    value={order.profit}
                                    onChange={(e) => {
                                      const newOrders = [...editingOrders];
                                      newOrders[idx].profit = e.target.value;
                                      setEditingOrders(newOrders);
                                    }}
                                    required
                                    disabled={isCompleted}
                                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-70 transition-colors"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-8 py-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-900/80 flex justify-end gap-3 backdrop-blur-sm">
                <button 
                  type="button" 
                  className="px-6 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl transition-colors shadow-sm"
                  onClick={() => { setShowEditOrdersModal(false); setEditingTask(null); }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  Save Sequence Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
