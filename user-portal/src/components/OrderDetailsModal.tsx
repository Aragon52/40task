import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Package,
  Clock,
  Wallet,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface Order {
  id: string | number;
  title: string;
  image?: string | null;
  price: number | string;
  profit: number | string;
  status: string;
  timestamp?: string;
  assignedTaskId?: string;
  assignedOrderIndex?: number;
}

interface OrderDetailsModalProps {
  order: Order | null;
  balance?: number | string;
  onClose: () => void;
  onSubmit: (id: string | number, price: number | string, profit: number | string) => void;
  onCancel?: () => void;
}

export default function OrderDetailsModal({
  order,
  balance = 0,
  onClose,
  onSubmit,
  onCancel
}: OrderDetailsModalProps) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const isPending = String(order.status || '').toLowerCase() === 'pending';
  const userBalance = Number.parseFloat(String(balance ?? '0')) || 0;
  const orderPrice = Number.parseFloat(String(order.price ?? '0')) || 0;
  const isBalanceSufficient = userBalance >= orderPrice;
  const orderProfit = Number.parseFloat(String(order.profit ?? '0')) || 0;
  const differenceAmount = Math.max(0, orderPrice - userBalance);
  const showDifference = isPending && !isBalanceSufficient;

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(order.id, order.price, order.profit);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm sm:max-w-md shadow-2xl overflow-hidden flex flex-col scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-sky-50/50 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Order Details</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  #VP{order.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Order verification & task allocation</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Product Showcase Card */}
          <div className="flex gap-3.5 bg-slate-50/80 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="w-20 h-20 rounded-xl bg-white dark:bg-slate-900 p-1.5 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden relative shadow-xs">
              {order.image ? (
                <img 
                  src={order.image} 
                  alt={order.title} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const fb = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                    if (fb) fb.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-full h-full flex flex-col items-center justify-center text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40"
                style={{ display: order.image ? 'none' : 'flex' }}
              >
                <Package className="w-7 h-7" />
              </div>
            </div>

            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div>
                <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 tracking-wider uppercase">
                  Verified Merchandise · Qty: 1
                </span>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug mt-0.5">
                  {order.title}
                </h4>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Order Value:</span>
                <span className="text-sm font-bold font-mono text-sky-600 dark:text-sky-400">
                  $ {orderPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Financial & Order Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Order Time
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {order.timestamp || new Date().toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-slate-400" />
                Available Wallet Balance
              </span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                $ {userBalance.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="font-medium text-slate-700 dark:text-slate-300">Order Amount</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                $ {orderPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-emerald-50/60 dark:bg-emerald-950/30 -mx-3.5 px-3.5 py-2 border-y border-emerald-100/80 dark:border-emerald-900/40">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Estimated Commission
              </span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                +$ {orderProfit.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Balance Status Card */}
          {showDifference ? (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Difference Required
                </span>
                <span className="font-mono text-sm">$ {differenceAmount.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-normal">
                Your wallet balance ($ {userBalance.toFixed(2)}) is insufficient for this task. Please deposit $ {differenceAmount.toFixed(2)} to proceed.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/deposit');
                }}
                className="w-full mt-1 h-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                Deposit $ {differenceAmount.toFixed(2)} Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">Wallet balance verified. Ready to submit order and earn commission.</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
          {isPending ? (
            <div className="flex gap-2.5">
              <button 
                type="button"
                onClick={onCancel || onClose}
                className="w-28 h-11 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              
              {isBalanceSufficient ? (
                <button 
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 h-11 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {submitting ? (
                    <span>Submitting Task...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Submit Task (+$ {orderProfit.toFixed(2)})</span>
                    </>
                  )}
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/deposit');
                  }}
                  className="flex-1 h-11 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Deposit $ {differenceAmount.toFixed(2)} to Proceed</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 w-full h-11 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Order Task Completed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
