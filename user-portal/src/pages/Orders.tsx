import { useState } from 'react';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

import toast from 'react-hot-toast';

const toMoneyAmount = (value) => {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[$,\s]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const toCurrency = (value) => Number(toMoneyAmount(value).toFixed(2));
const toCommission = (value) => Number((toMoneyAmount(value) * 0.1).toFixed(4));

export default function Orders({ balance, orders, setOrders, updateBalance }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const tabs = ['All', 'Success', 'Frozen'];

  // Filter out Pending orders from the page so only Success and Frozen orders are displayed
  const nonPendingOrders = (orders || []).filter(order => {
    const statusLower = String(order?.status || '').toLowerCase();
    return statusLower === 'success' || statusLower === 'frozen' || statusLower === 'completed' || statusLower === 'approved';
  });

  const filteredOrders = nonPendingOrders.filter(order => {
    if (activeTab === 'All') return true;
    const statusLower = String(order?.status || '').toLowerCase();
    if (activeTab === 'Success') {
      return statusLower === 'success' || statusLower === 'completed' || statusLower === 'approved';
    }
    if (activeTab === 'Frozen') {
      return statusLower === 'frozen';
    }
    return statusLower === activeTab.toLowerCase();
  });

  const handleSubmitTask = async (orderId, price, profit) => {
    const normalizedPrice = toCurrency(price);
    const normalizedProfit = toCurrency(profit);

    // Balance Check:
    if (toMoneyAmount(balance || 0) < normalizedPrice) {
      toast.error(`Insufficient balance to proceed with this order. Required: $${normalizedPrice.toFixed(2)}, Available: $${toCurrency(balance || 0).toFixed(2)}.`);
      navigate('/deposit');
      return;
    }
    
    // Find the matched order from the orders list
    const matchedOrder = orders.find(o => String(o.id) === String(orderId));

    // 1. OPTIMISTIC UI: Update local state & UI INSTANTLY (0ms delay)
    updateBalance(normalizedProfit);
    setOrders(prev => prev.map(o => String(o.id) === String(orderId) ? { ...o, status: 'Success' } : o));
    setSelectedOrderDetails(null);
    toast.success(`Order submitted! Earned $${normalizedProfit.toFixed(2)} commission.`);

    // 2. PARALLEL BACKGROUND DATABASE SYNCHRONIZATION (NON-BLOCKING)
    Promise.all([
      supabase
        .from('cb_orders')
        .update({ status: 'Success' })
        .eq('id', orderId),

      (async () => {
        try {
          const currentUsername = localStorage.getItem('cb_username');
          if (currentUsername) {
            const { data: userBData } = await supabase
              .from('cb_users')
              .select('id, invited_by_user_id')
              .eq('username', currentUsername);

            if (userBData && userBData[0] && userBData[0].invited_by_user_id) {
              const { data: userAData } = await supabase
                .from('cb_users')
                .select('id, balance, commissions')
                .eq('id', userBData[0].invited_by_user_id);

              if (userAData && userAData[0]) {
                const userA = userAData[0];
                const commissionAmount = toCommission(normalizedProfit);
                if (commissionAmount > 0) {
                  const newA_Balance = Number((toMoneyAmount(userA.balance || 0) + commissionAmount).toFixed(4));
                  const newA_Commissions = Number((toMoneyAmount(userA.commissions || 0) + commissionAmount).toFixed(4));
                  await supabase
                    .from('cb_users')
                    .update({ balance: newA_Balance, commissions: newA_Commissions })
                    .eq('id', userA.id);
                }
              }
            }
          }
        } catch (affErr) {
          console.error("Affiliate error:", affErr);
        }
      })(),

      (async () => {
        if (matchedOrder && matchedOrder.assignedTaskId) {
          const { data: taskList } = await supabase
            .from('cb_assigned_tasks')
            .select('*')
            .eq('id', matchedOrder.assignedTaskId);

          const task = taskList && taskList[0];
          if (task && matchedOrder.assignedOrderIndex !== undefined && matchedOrder.assignedOrderIndex !== -1) {
            const updatedOrders = [...task.orders];
            const completedIdx = matchedOrder.assignedOrderIndex;
            updatedOrders[completedIdx].status = 'Success';

            let freshUserBalance = 0;
            const activeUser = localStorage.getItem('cb_username') || '';
            if (activeUser) {
              const { data: userData } = await supabase
                .from('cb_users')
                .select('balance')
                .ilike('username', activeUser.trim());
              if (userData && userData[0]) {
                freshUserBalance = parseFloat(userData[0].balance || 0);
              }
            }

            const currentEffectiveBalance = toMoneyAmount(balance) + normalizedProfit;
            if (isNaN(freshUserBalance) || currentEffectiveBalance > freshUserBalance) {
              freshUserBalance = currentEffectiveBalance;
            }

            const hasPendingSubsequent = updatedOrders.slice(completedIdx + 1).some((o: any) => o.status === 'Pending');

            if (hasPendingSubsequent && freshUserBalance > 0) {
              let runningBalance = freshUserBalance;

              for (let i = completedIdx + 1; i < updatedOrders.length; i++) {
                if (updatedOrders[i].status === 'Pending') {
                  // CRITICAL: Preserve any manually edited/customized order or freeze target
                  if (updatedOrders[i].is_manually_edited || updatedOrders[i].isCustom || updatedOrders[i].is_custom || updatedOrders[i].isFreezeTarget || updatedOrders[i].is_freeze_target) {
                    const manualPrice = parseFloat(updatedOrders[i].price) || 0;
                    const manualProfit = parseFloat(updatedOrders[i].profit) || 0;
                    if (manualPrice + 20 > runningBalance) {
                      runningBalance = manualPrice + 25;
                    }
                    runningBalance = parseFloat((runningBalance + manualProfit).toFixed(2));
                    continue;
                  }

                  const reduction = Math.random() * (37 - 18) + 18;
                  const newPrice = Math.max(10, parseFloat((runningBalance - reduction).toFixed(2)));
                  const profitRate = 0.002 + Math.random() * (0.003 - 0.002);
                  const newProfit = parseFloat((newPrice * profitRate).toFixed(2));

                  updatedOrders[i].price = newPrice;
                  updatedOrders[i].profit = newProfit;

                  runningBalance = parseFloat((runningBalance + newProfit).toFixed(2));
                }
              }
            }

            const allDone = updatedOrders.every(o => o.status === 'Success');
            const nextStatus = allDone ? 'Completed' : 'In Progress';
            const newTotalAmount = parseFloat(updatedOrders.reduce((sum: number, o: any) => sum + toMoneyAmount(o.price), 0).toFixed(2));
            const newTotalProfit = parseFloat(updatedOrders.reduce((sum: number, o: any) => sum + toMoneyAmount(o.profit), 0).toFixed(2));
            const newProfitPercent = newTotalAmount > 0 ? parseFloat(((newTotalProfit / newTotalAmount) * 100).toFixed(2)) : 0;

            await supabase
              .from('cb_assigned_tasks')
              .update({ 
                orders: updatedOrders, 
                status: nextStatus,
                total_amount: newTotalAmount,
                profit_percent: newProfitPercent
              })
              .eq('id', task.id);
          }
        }
      })()
    ]).then(async () => {
      const activeUser = localStorage.getItem('cb_username') || '';
      if (activeUser) {
        const { data: freshOrders } = await supabase
          .from('cb_orders')
          .select('*')
          .ilike('username', activeUser.trim())
          .order('timestamp', { ascending: false });

        if (freshOrders && freshOrders.length > 0) {
          setOrders(freshOrders);
        }
      }
    }).catch(err => {
      console.error("Background sync error:", err);
    });
  };

  return (
    <div className="flex flex-col min-h-full pb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Page Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80 mb-4 rounded-xl">
        <button 
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-all cursor-pointer" 
          onClick={() => navigate('/home')}
          aria-label="Back to home"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Worksheet Orders</h1>
        <button 
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-all cursor-pointer" 
          onClick={() => navigate('/support')}
          aria-label="Support chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </header>

      {/* Modern Filter Tabs */}
      <nav className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-6 mx-1 border border-slate-200/50 dark:border-slate-800/50">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeTab === tab 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-white/10' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Orders List Grid */}
      <div className="space-y-4 px-1">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching records found</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isSuccess = ['success', 'completed', 'approved'].includes(order.status.toLowerCase());
            const isFrozen = order.status.toLowerCase() === 'frozen';
            const isPending = order.status.toLowerCase() === 'pending';
            const canAfford = parseFloat(balance || 0) >= parseFloat(order.price);

            return (
              <div 
                key={order.id}
                onClick={() => setSelectedOrderDetails(order)}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.99]"
              >
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-700/50">
                    <Clock className="w-3 h-3" />
                    {order.timestamp}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xs ${
                    isSuccess ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                    isFrozen ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex gap-4 items-center mb-5 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 p-2 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700/50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                    {order.image ? (
                      <img src={order.image} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-extrabold text-slate-900 dark:text-slate-100 leading-tight line-clamp-2 uppercase tracking-tight">
                      {order.title}
                    </h3>
                    <div className="mt-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">ID: VP{order.id}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] block mb-1">Price</span>
                    <span className="text-base font-mono font-black text-slate-900 dark:text-white tabular-nums">$ {order.price}</span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 transition-colors group-hover:bg-emerald-100/50 dark:group-hover:bg-emerald-900/30">
                    <span className="text-[9px] font-black text-emerald-600/70 dark:text-emerald-500 uppercase tracking-[0.15em] block mb-1">Profit</span>
                    <span className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums">+$ {order.profit}</span>
                  </div>
                </div>

                {isPending && !canAfford && (
                  <div className="mb-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/40 p-3.5 rounded-2xl flex items-center justify-between text-[11px] animate-pulse">
                    <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Difference
                    </div>
                    <span className="font-mono font-black text-rose-700 dark:text-rose-300 tabular-nums">$ {(parseFloat(order.price) - parseFloat(balance || 0)).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    View Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                  {isPending && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrderDetails(order);
                      }}
                      className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      Submit Task
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedOrderDetails && (
        <OrderDetailsModal
          order={selectedOrderDetails}
          balance={balance}
          onClose={() => setSelectedOrderDetails(null)}
          onSubmit={(orderId, price, profit) => {
            handleSubmitTask(orderId, price, profit);
            setSelectedOrderDetails(null);
          }}
        />
      )}
    </div>
  );
}
