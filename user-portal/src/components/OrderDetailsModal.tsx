import React from 'react';

interface Order {
  id: string | number;
  title: string;
  image?: string | null;
  price: number | string;
  profit: number | string;
  status: string;
  timestamp?: string;
}

interface OrderDetailsModalProps {
  order: Order | null;
  balance?: number | string;
  onClose: () => void;
  onSubmit: (id: string | number, price: number | string, profit: number | string) => void;
  onCancel?: () => void;
}

export default function OrderDetailsModal({ order, balance = 0, onClose, onSubmit, onCancel }: OrderDetailsModalProps) {
  if (!order) return null;

  const isPending = String(order.status || '').toLowerCase() === 'pending';
  const userBalance = Number.parseFloat(String(balance ?? '0')) || 0;
  const orderPrice = Number.parseFloat(String(order.price ?? '0')) || 0;
  const isBalanceSufficient = userBalance >= orderPrice;
  const orderProfit = Number.parseFloat(String(order.profit ?? '0')) || 0;
  const differenceAmount = orderPrice - userBalance;
  const showDifference = isPending && !isBalanceSufficient;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center bg-slate-900 px-5 h-12 border-b border-slate-800">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Order Details</span>
          <button onClick={onClose} className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs cursor-pointer">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-lg bg-white p-1 flex items-center justify-center border border-slate-200 dark:border-slate-800 shrink-0">
              {order.image ? (
                <img src={order.image} alt={order.title} className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-2xl">📦</span>
              )}
            </div>
            <div className="flex flex-col justify-between flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">{order.title}</span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">x1</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">$ {orderPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Order time</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{order.timestamp || new Date().toLocaleString()}</span>
            </div>

            {!isPending && order.id && (
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Order ID</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">VP{order.id}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Order amount</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">$ {orderPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Commission</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">$ {orderProfit.toFixed(2)}</span>
            </div>

            {showDifference && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-bold">
                  <span>Difference Amount</span>
                  <span className="font-mono">$ {differenceAmount.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-rose-500">
                  Your wallet balance is insufficient. Please deposit $ {differenceAmount.toFixed(2)} to proceed.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 pt-0">
          {isPending ? (
            <div className="flex gap-2">
              <button 
                onClick={onCancel || onClose}
                className="flex-1 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => onSubmit(order.id, order.price, order.profit)}
                className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Confirm
              </button>
            </div>
          ) : (
            <button disabled className="w-full h-10 bg-slate-200 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed">
              Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
