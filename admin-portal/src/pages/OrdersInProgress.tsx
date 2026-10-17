import React, { useState, useEffect, useRef } from 'react';
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
  Filter,
  Package,
  ChevronRight,
  RefreshCcw,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button, Modal, Card, Input, Badge } from '@/src/shared/UI';

const toCents = (value: any) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : null;
};

const rebalanceFollowingPrices = (orders: any[], editedIndex: number, updatedPriceCents: number) => {
  const adjustedOrders = orders.map(order => ({ ...order }));
  const previousPriceCents = toCents(adjustedOrders[editedIndex]?.price);
  if (previousPriceCents === null || updatedPriceCents < 1) return null;

  const deltaCents = updatedPriceCents - previousPriceCents;
  adjustedOrders[editedIndex].price = updatedPriceCents / 100;
  if (deltaCents === 0) return adjustedOrders;

  const followingPendingIndexes = adjustedOrders
    .map((order, index) => ({ order, index }))
    .filter(({ order, index }) => index > editedIndex && order.status === 'Pending')
    .map(({ index }) => index);
  if (followingPendingIndexes.length === 0) return null;

  const oldFollowingTotal = followingPendingIndexes.reduce(
    (sum, index) => sum + (toCents(adjustedOrders[index].price) || 0),
    0
  );
  const newFollowingTotal = oldFollowingTotal - deltaCents;
  if (newFollowingTotal < followingPendingIndexes.length) return null;

  const weights = followingPendingIndexes.map(index => Math.max(1, toCents(adjustedOrders[index].price) || 1));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const distributableCents = newFollowingTotal - followingPendingIndexes.length;
  const shares = weights.map(weight => (distributableCents * weight) / totalWeight);
  const allocatedCents = shares.map(share => Math.floor(share));
  const remainingCents = distributableCents - allocatedCents.reduce((sum, amount) => sum + amount, 0);

  const remainderOrder = shares
    .map((share, index) => ({ index, remainder: share - allocatedCents[index] }))
    .sort((a, b) => b.remainder - a.remainder);
  for (let index = 0; index < remainingCents; index++) {
    allocatedCents[remainderOrder[index].index] += 1;
  }

  followingPendingIndexes.forEach((orderIndex, index) => {
    adjustedOrders[orderIndex].price = (allocatedCents[index] + 1) / 100;
  });
  return adjustedOrders;
};

export default function OrdersInProgress() {
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>(PRODUCT_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState<any>({});
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Progress' | 'Completed' | 'Pending'>('All');

  // Edit Worksheet Orders Modal state
  const [showEditOrdersModal, setShowEditOrdersModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingOrders, setEditingOrders] = useState<any[]>([]);
  const lastValidPrices = useRef<number[]>([]);

  const fetchTasks = async () => {
    try {
      const savedSession = localStorage.getItem('cb_admin_session');
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }

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
      if (document.hidden) return; 
      fetchTasks();
    }, 15000); 
    return () => clearInterval(interval);
  }, []);

  const getFilteredTasks = () => {
    return assignedTasks.filter(t => {
      if (session?.role === 'Admin') {
        if (t.member_of_admin_id !== session?.accountId) return false;
      } else if (session?.role === 'Staff') {
        if (t.referred_by_staff_id !== session?.accountId) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = t.username.toLowerCase().includes(q) || 
                             t.id.toLowerCase().includes(q) ||
                             t.assignedBy.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (statusFilter !== 'All') {
        if (t.status !== statusFilter) return false;
      }

      return true;
    });
  };

  const handleCancelTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to cancel and delete this assigned task? All pending orders will be removed.")) {
      try {
        const { error: ordersDeleteError } = await supabase
          .from('cb_orders')
          .delete()
          .eq('assigned_task_id', taskId);

        if (ordersDeleteError) {
          toast.error("Error removing linked orders: " + ordersDeleteError.message);
          return;
        }

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
      } catch (err: any) {
        toast.error("Failed to delete task: " + err.message);
      }
    }
  };

  const handleOpenEditOrdersModal = (task: any) => {
    setEditingTask(task);
    setEditingOrders(task.orders.map((o: any) => ({ ...o })));
    lastValidPrices.current = task.orders.map((order: any) => toCents(order.price) || 0);
    setShowEditOrdersModal(true);
  };

  const handlePriceChange = (idx: number, value: any, orderUpdates = {}) => {
    if (editingOrders[idx]?.status !== 'Pending') return;
    const updatedPriceCents = toCents(value);
    if (updatedPriceCents === null || updatedPriceCents < 1) {
      setEditingOrders(current => current.map((order, index) => index === idx ? { ...order, ...orderUpdates, price: value } : order));
      return;
    }

    const previousPriceCents = lastValidPrices.current[idx];
    const ordersWithCurrentValidPrice = editingOrders.map((order, index) => (
      index === idx ? { ...order, ...orderUpdates, price: previousPriceCents / 100 } : order
    ));
    const adjustedOrders = rebalanceFollowingPrices(ordersWithCurrentValidPrice, idx, updatedPriceCents);
    if (!adjustedOrders) {
      toast.error('This price change cannot be balanced across the remaining pending orders.');
      return;
    }

    if (updatedPriceCents !== previousPriceCents) {
      const profitYield = Number(editingTask?.profitPercent || 0) / 100;
      adjustedOrders.forEach((order, index) => {
        if (index > idx && order.status === 'Pending') {
          order.profit = Number((order.price * profitYield).toFixed(2));
        }
      });
    }
    lastValidPrices.current = adjustedOrders.map(order => toCents(order.price) || 0);
    setEditingOrders(adjustedOrders);
  };

  const handleSaveEditedOrders = async (e: React.FormEvent) => {
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
      const { data: currentTask, error: currentTaskError } = await supabase
        .from('cb_assigned_tasks')
        .select('status, orders')
        .eq('id', editingTask.id)
        .single();

      if (currentTaskError || !currentTask) {
        toast.error(`Unable to verify the current worksheet before saving: ${currentTaskError?.message || 'Task not found'}`);
        return;
      }

      const currentTaskOrders = typeof currentTask.orders === 'string'
        ? JSON.parse(currentTask.orders)
        : currentTask.orders;
      const currentCompletedCount = currentTaskOrders.filter((order: any) => order.status === 'Success').length;
      if (currentTask.status !== 'In Progress' || currentCompletedCount + 1 >= 36) {
        toast.error('Price changes are only allowed before the current in-progress order reaches #36.');
        return;
      }
      const worksheetChanged = currentTaskOrders.length !== editingTask.orders.length
        || currentTaskOrders.some((order: any, index: number) => (
          toCents(order.price) !== toCents(editingTask.orders[index]?.price)
          || order.status !== editingTask.orders[index]?.status
        ));
      if (worksheetChanged) {
        toast.error('This worksheet changed while it was open. Close it and reopen the latest version before saving.');
        return;
      }

      const cleanedOrders = editingOrders.map(o => ({
        ...o,
        price: parseFloat(parseFloat(o.price || 0).toFixed(2)),
        profit: parseFloat(parseFloat(o.profit || 0).toFixed(2))
      }));

      const originalTotalCents = editingTask.orders.reduce((sum: number, order: any) => sum + (toCents(order.price) || 0), 0);
      const newTotalCents = cleanedOrders.reduce((sum, order) => sum + (toCents(order.price) || 0), 0);
      if (newTotalCents !== originalTotalCents) {
        toast.error('Order prices must keep the worksheet total unchanged. Adjust a pending order price and its later orders will be balanced automatically.');
        return;
      }

      const newTotalAmount = originalTotalCents / 100;
      const newTotalProfit = parseFloat(cleanedOrders.reduce((sum, o) => sum + parseFloat(o.profit || 0), 0).toFixed(2));
      const newProfitPercent = newTotalAmount > 0 ? parseFloat(((newTotalProfit / newTotalAmount) * 100).toFixed(2)) : 0;

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

      for (let idx = 0; idx < cleanedOrders.length; idx++) {
        const o = cleanedOrders[idx];
        const { error: orderErr } = await supabase
          .from('cb_orders')
          .update({
            title: o.title,
            price: o.price,
            profit: o.profit,
            status: o.status
          })
          .eq('assigned_task_id', editingTask.id)
          .eq('assigned_order_index', idx);
        if (orderErr) {
          toast.error(`Worksheet saved, but order #${idx + 1} could not be synchronized: ${orderErr.message}`);
          return;
        }
      }

      toast.success("Successfully updated worksheet orders!");
      setShowEditOrdersModal(false);
      setEditingTask(null);
      setEditingOrders([]);
      fetchTasks();
    } catch (err: any) {
      toast.error("Failed to save changes: " + err.message);
    }
  };

  const filteredTasks = getFilteredTasks();
  const inProgressCount = assignedTasks.filter(t => t.status === 'In Progress').length;
  const completedTaskCount = assignedTasks.filter(t => t.status === 'Completed').length;
  const totalVolume = assignedTasks.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const completedOrdersForEdit = editingTask?.orders.filter((order: any) => order.status === 'Success').length || 0;
  const canAdjustPrices = editingTask?.status === 'In Progress' && completedOrdersForEdit + 1 < 36;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <LineChart className="w-6 h-6 text-indigo-500" />
              Orders In Progress & Worksheets
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Monitor real-time worksheet sequences, track client progress, and modify allocated orders.
            </p>
          </div>
          
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            {['All', 'In Progress', 'Completed', 'Pending'].map((tab) => (
              <button 
                key={tab}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${statusFilter === tab ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setStatusFilter(tab as any)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: assignedTasks.length, icon: ClipboardList, color: 'text-slate-600', bg: 'bg-slate-500/10' },
          { label: 'In Progress', value: inProgressCount, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-500/10' },
          { label: 'Completed', value: completedTaskCount, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'Volume', value: `$${totalVolume.toLocaleString()}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-500/10' }
        ].map((kpi, idx) => (
          <Card key={idx} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</span>
              <div className="text-lg font-black text-slate-900 dark:text-white font-mono leading-none">{kpi.value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search username, task ID, or admin node..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
          />
        </div>
      </Card>

      {/* Task Tracker Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Task ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Progress</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Volume</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Yield</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium text-xs">
                    No active worksheets found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(t => {
                  const completedCount = t.orders ? t.orders.filter((o: any) => o.status === 'Success').length : 0;
                  const totalOrders = t.orderCount || (t.orders ? t.orders.length : 1);
                  const progressPct = Math.round((completedCount / totalOrders) * 100);
                  const isCompleted = t.status === 'Completed';
                  const isInProgress = t.status === 'In Progress';
                  
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-[10px] font-bold text-indigo-500 bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10">#{t.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                            {t.username.substring(0,2)}
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.username}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Node: {t.referred_by_staff_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 min-w-[200px]">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                            <span className="text-slate-500">{completedCount} / {totalOrders} Completed</span>
                            <span className="text-indigo-600">{progressPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-indigo-600'}`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white tracking-tight">
                          ${t.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="success" className="text-[9px] font-black py-0 px-2 uppercase tracking-widest">+{t.profitPercent}%</Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge 
                          variant={isCompleted ? 'success' : isInProgress ? 'warning' : 'neutral'}
                          className="text-[9px] font-black py-0 px-2 uppercase"
                        >
                          {t.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {t.status !== 'Completed' ? (
                            <>
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="h-8 px-3 text-[10px] font-black"
                                onClick={() => handleOpenEditOrdersModal(t)}
                              >
                                EDIT
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm" 
                                className="h-8 px-3 text-[10px] font-black"
                                onClick={() => handleCancelTask(t.id)}
                              >
                                CANCEL
                              </Button>
                            </>
                          ) : (
                            <div className="h-8 flex items-center px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                              Archive
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Sequence Modal */}
      {showEditOrdersModal && editingTask && (
        <Modal
          isOpen={showEditOrdersModal}
          onClose={() => { setShowEditOrdersModal(false); setEditingTask(null); }}
          title="Worksheet Sequence Manager"
          size="lg"
        >
          <div className="space-y-6">
            <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 leading-relaxed uppercase tracking-tight">
                To maintain database consistency, sequence modifications are only permitted for worksheets below order #36. Later pending items will be proportionally balanced to maintain the original total.
              </p>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 pr-2 custom-scrollbar">
              {editingOrders.map((order: any, idx: number) => {
                const isCompleted = order.status === 'Success';
                return (
                  <Card key={idx} className={`p-4 ${isCompleted ? 'opacity-60 grayscale' : 'border-indigo-500/20'}`}>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black font-mono">
                          {idx + 1}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sequence Item</span>
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => {
                          const newOrders = [...editingOrders];
                          newOrders[idx].status = e.target.value;
                          setEditingOrders(newOrders);
                        }}
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border outline-none ${isCompleted ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Success">Success</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      {!isCompleted && canAdjustPrices && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const prod = products[parseInt(e.target.value)];
                              const pYield = parseFloat(editingTask.profitPercent || '5');
                              handlePriceChange(idx, prod.price, {
                                title: prod.title,
                                image: prod.image,
                                profit: parseFloat((prod.price * (pYield / 100)).toFixed(2))
                              });
                            }
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none"
                        >
                          <option value="">-- Quick Fill from Catalog --</option>
                          {products.map((p, pIdx) => (
                            <option key={pIdx} value={pIdx}>{p.title.substring(0, 40)}... (${p.price})</option>
                          ))}
                        </select>
                      )}

                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center bg-white shrink-0">
                          {order.image ? <img src={order.image} className="max-w-full max-h-full object-contain" /> : <Package className="w-6 h-6 text-slate-300" />}
                        </div>
                        <div className="flex-1 space-y-3">
                          <input 
                            type="text"
                            value={order.title}
                            onChange={(e) => {
                              const newOrders = [...editingOrders];
                              newOrders[idx].title = e.target.value;
                              setEditingOrders(newOrders);
                            }}
                            disabled={isCompleted}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-600"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price ($)</span>
                              <input 
                                type="number"
                                step="0.01"
                                value={order.price}
                                onChange={(e) => handlePriceChange(idx, e.target.value, {
                                  profit: parseFloat((Number(e.target.value || 0) * (parseFloat(editingTask.profitPercent || '5') / 100)).toFixed(2))
                                })}
                                disabled={isCompleted || !canAdjustPrices}
                                className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs font-black text-slate-900 dark:text-white outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1">Profit ($)</span>
                              <input 
                                type="number"
                                step="0.01"
                                value={order.profit}
                                onChange={(e) => {
                                  const newOrders = [...editingOrders];
                                  newOrders[idx].profit = e.target.value;
                                  setEditingOrders(newOrders);
                                }}
                                disabled={isCompleted}
                                className="w-full h-9 px-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 font-mono text-xs font-black text-emerald-600 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => { setShowEditOrdersModal(false); setEditingTask(null); }}>Cancel</Button>
              <Button onClick={handleSaveEditedOrders} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">Commit Sequence Changes</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
