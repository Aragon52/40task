import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { supabase } from '../supabase';
import { useLoading } from '../components/GlobalLoader';

import toast from 'react-hot-toast';
export default function ShopOrder({ balance, updateBalance, orders, setOrders }) {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [activeOrderDetails, setActiveOrderDetails] = useState(null);
  const { performAsync } = useLoading();

  const handleModalSubmit = async (orderId, price, profit) => {
    // Check if user has sufficient balance
    if (parseFloat(balance) < parseFloat(price)) {
      toast.error(`Insufficient balance to proceed with this order. Required: $${parseFloat(price).toFixed(2)}, Available: $${parseFloat(balance).toFixed(2)}.`);
      navigate('/deposit');
      return;
    }

    // 1. OPTIMISTIC UI: Update local balance, orders state, and UI INSTANTLY (0ms delay)
    updateBalance(parseFloat(profit));
    setOrders(prev => prev.map(o => String(o.id) === String(orderId) ? { ...o, status: 'Success' } : o));
    toast.success(`Task submitted successfully! Earned $${parseFloat(profit).toFixed(2)} commission.`);
    setActiveOrderDetails(null);

    // 2. PARALLEL BACKGROUND DATABASE SYNCHRONIZATION
    try {
      const orderUpdatePromise = supabase
        .from('cb_orders')
        .update({ status: 'Success' })
        .eq('id', orderId);

      const affiliatePromise = (async () => {
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
                const commissionAmount = parseFloat((parseFloat(profit) * 0.10).toFixed(4));
                if (commissionAmount > 0) {
                  const newA_Balance = parseFloat((parseFloat(userA.balance || 0) + commissionAmount).toFixed(4));
                  const newA_Commissions = parseFloat((parseFloat(userA.commissions || 0) + commissionAmount).toFixed(4));
                  await supabase
                    .from('cb_users')
                    .update({ balance: newA_Balance, commissions: newA_Commissions })
                    .eq('id', userA.id);
                }
              }
            }
          }
        } catch (affErr) {
          console.error("Affiliate reward error:", affErr);
        }
      })();

      const taskUpdatePromise = (async () => {
        if (activeOrderDetails && activeOrderDetails.assignedTaskId) {
          const { data: taskList } = await supabase
            .from('cb_assigned_tasks')
            .select('*')
            .eq('id', activeOrderDetails.assignedTaskId);

          const task = taskList && taskList[0];
          if (task && activeOrderDetails.assignedOrderIndex !== undefined && activeOrderDetails.assignedOrderIndex !== -1) {
            task.orders[activeOrderDetails.assignedOrderIndex].status = 'Success';
            const allDone = task.orders.every(o => o.status === 'Success');
            const nextStatus = allDone ? 'Completed' : 'In Progress';
            await supabase
              .from('cb_assigned_tasks')
              .update({ orders: task.orders, status: nextStatus })
              .eq('id', task.id);
          }
        }
      })();

      await Promise.all([orderUpdatePromise, affiliatePromise, taskUpdatePromise]);
    } catch (err) {
      console.error("Background task sync error:", err);
    }
  };

  // Derive stats from orders list and active task
  const [orderCompleteCount, setOrderCompleteCount] = useState(0);
  const [undoneCount, setUndoneCount] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalCommission, setTotalCommission] = useState('0.00');
  const [activeTaskState, setActiveTaskState] = useState(null);

  useEffect(() => {
    const activeUser = localStorage.getItem('cb_username') || '';
    if (!activeUser) return;

    const fetchActiveTaskAndStats = async () => {
      if (document.hidden) return; // Save bandwidth when tab is in background!
      try {
        const { data: tasks, error: taskError } = await supabase
          .from('cb_assigned_tasks')
          .select('*')
          .ilike('username', activeUser)
          .order('created_at', { ascending: false });

        if (!taskError && tasks && tasks.length > 0) {
          const activeTask = tasks[0];
          setActiveTaskState(activeTask);
          setTotalTasks(activeTask.order_count || 40);
          const completed = activeTask.orders.filter(o => o.status === 'Success').length;
          setOrderCompleteCount(completed);
          
          const pending = orders.filter(o => o.status === 'Pending' && o.assignedTaskId === activeTask.id).length;
          setUndoneCount(pending);

          const comm = activeTask.orders.filter(o => o.status === 'Success').reduce((acc, curr) => acc + parseFloat(curr.profit), 0);
          setTotalCommission(comm.toFixed(2));
        } else {
          setActiveTaskState(null);
          setTotalTasks(0);
          setOrderCompleteCount(0);
          setUndoneCount(0);
          setTotalCommission('0.00');
        }
      } catch (err) {
        console.error("Error syncing stats with database:", err);
      }
    };

    fetchActiveTaskAndStats();
    const interval = setInterval(() => {
      if (document.hidden) return;
      fetchActiveTaskAndStats();
    }, 15000); // Poll every 15 seconds instead of 3
    return () => clearInterval(interval);
  }, [orders]);

  const remainingCount = activeTaskState 
    ? Math.max(0, totalTasks - orderCompleteCount) 
    : Math.max(0, totalTasks - orderCompleteCount - undoneCount);
  const freezeBalance = orders.filter(o => o.status === 'Frozen').reduce((acc, curr) => acc + parseFloat(curr.price), 0).toFixed(2);

  const mockMatchPool = [
    { title: 'barkTHINS Bark Thins Almond Snacking Chocolate 20.0 Ounce', price: '194.33', profit: '0.97', type: 'food' },
    { title: 'Jueachy Tactical Backpack for Men Hiking Day Pack Molle Military Rucksack', price: '214.31', profit: '1.07', type: 'gear' },
    { title: 'Under Armour Mens Woven Vital Workout Pants', price: '85.50', profit: '0.43', type: 'gear' },
    { title: 'Apple AirPods Pro (2nd Generation) Wireless Earbuds', price: '249.00', profit: '2.50', type: 'electronics' },
    { title: 'Nintendo Switch Lite - Blue Console', price: '199.99', profit: '2.00', type: 'electronics' }
  ];

  const handleBeginPicking = async () => {
    if (remainingCount <= 0) {
      toast("You have completed all tasks for today!");
      return;
    }
    if (undoneCount > 0 && !activeTaskState) {
      toast("You have an outstanding pending order. Please complete it first!");
      navigate('/orders');
      return;
    }

    setSpinning(true);
    setSpinResult(null);

    // Spin animation duration: 2 seconds
    setTimeout(async () => {
      try {
        const activeUser = localStorage.getItem('cb_username') || '';
        
        // Query active task details from Supabase to ensure fresh state
        const { data: tasks } = await supabase
          .from('cb_assigned_tasks')
          .select('*')
          .ilike('username', activeUser)
          .in('status', ['Pending', 'In Progress']);

        const activeTask = tasks && tasks[0];
        
        let chosenProduct = null;
        let assignedTaskId = null;
        let assignedOrderIndex = -1;

        if (activeTask) {
          const pendingOrderIdx = activeTask.orders.findIndex(o => o.status === 'Pending');
          if (pendingOrderIdx !== -1) {
            // Get real cb_orders ID that was pre-populated by admin
            const realOrder = orders.find(o => o.assignedTaskId === activeTask.id && o.assignedOrderIndex === pendingOrderIdx);
            const assignedOrder = activeTask.orders[pendingOrderIdx];
            chosenProduct = {
              id: realOrder ? realOrder.id : assignedOrder.id,
              title: assignedOrder.title,
              image: assignedOrder.image,
              price: parseFloat(assignedOrder.price).toFixed(2),
              profit: parseFloat(assignedOrder.profit).toFixed(2),
              type: 'gear'
            };
            assignedTaskId = activeTask.id;
            assignedOrderIndex = pendingOrderIdx;

            // Set task status to In Progress if it was Pending
            if (activeTask.status === 'Pending') {
              await supabase
                .from('cb_assigned_tasks')
                .update({ status: 'In Progress' })
                .eq('id', activeTask.id);
            }
          }
        }

        // Fallback to random pool if no active task or task orders are done
        if (!chosenProduct) {
          const randomIndex = Math.floor(Math.random() * mockMatchPool.length);
          const randProd = mockMatchPool[randomIndex];
          chosenProduct = {
            title: randProd.title,
            image: null,
            price: randProd.price,
            profit: randProd.profit,
            type: randProd.type
          };
        }

        const newOrder = {
          id: chosenProduct.id || Date.now(),
          username: activeUser,
          timestamp: new Date().toISOString(),
          status: 'Pending',
          title: chosenProduct.title,
          image: chosenProduct.image || null,
          price: parseFloat(chosenProduct.price),
          profit: parseFloat(chosenProduct.profit),
          type: chosenProduct.type,
          assigned_task_id: assignedTaskId || null,
          assigned_order_index: assignedOrderIndex !== -1 ? assignedOrderIndex : null
        };

        if (!assignedTaskId) {
          // Write the fallback order to Supabase cb_orders table
          const { error: insertOrderError } = await supabase
            .from('cb_orders')
            .insert([newOrder]);

          if (insertOrderError) {
            console.error("Insert Order Error Detail:", insertOrderError);
            toast.error(`Error matching order: ${insertOrderError.message} \nDetails: ${insertOrderError.details || insertOrderError.hint || ''}`);
            setSpinning(false);
            return;
          }

          // Add to orders state locally ONLY for fallback orders
          setOrders([
            {
              id: newOrder.id,
              timestamp: new Date(newOrder.timestamp).toLocaleString(),
              status: newOrder.status,
              title: newOrder.title,
              image: newOrder.image,
              price: newOrder.price.toString(),
              profit: newOrder.profit.toString(),
              type: newOrder.type,
              assignedTaskId: newOrder.assigned_task_id,
              assignedOrderIndex: newOrder.assigned_order_index
            },
            ...orders
          ]);
        }

        setSpinResult(chosenProduct);
        setSpinning(false);
        setActiveOrderDetails({
          id: newOrder.id,
          timestamp: new Date(newOrder.timestamp).toLocaleString(),
          status: newOrder.status,
          title: newOrder.title,
          image: newOrder.image,
          price: newOrder.price.toString(),
          profit: newOrder.profit.toString(),
          type: newOrder.type,
          assignedTaskId: newOrder.assigned_task_id,
          assignedOrderIndex: newOrder.assigned_order_index
        });
      } catch (err) {
        console.error("Match loop error:", err);
        setSpinning(false);
      }
    }, 2000);
  };

  return (
    <>
      <div className="shop-order-page scale-up">
        {/* Header bar */}
        <div className="shop-header">
          <div className="header-back-btn" onClick={() => navigate('/home')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </div>
          <span className="shop-title">Shop Order</span>
          <div className="shop-chat-btn" onClick={() => navigate('/support')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>

        {/* Content body */}
        <div className="shop-content">
          <div className="shop-grid-layout">
            <div className="shop-left-col">
              {/* Balance card with "+" button */}
              <div className="shop-balance-card">
                <div className="balance-info-col">
                  <span className="balance-amount-title">$ {parseFloat(balance).toFixed(2)}</span>
                  <span className="balance-sub-label">Balance</span>
                </div>
                <button className="add-balance-btn" onClick={() => navigate('/deposit')} id="btn-add-balance">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              {/* Standalone daily task stats card */}
              <div className="matching-stats-card">
                <h4 className="stats-card-title">Daily Task Statistics</h4>
                <div className="stats-card-grid">
                  <div className="stats-card-col">
                    <span className="stats-card-num">{orderCompleteCount} / {totalTasks}</span>
                    <span className="stats-card-lbl">Completed</span>
                  </div>
                  <div className="stats-card-col">
                    <span className="stats-card-num">{remainingCount}</span>
                    <span className="stats-card-lbl">Remaining</span>
                  </div>
                </div>
              </div>

              {/* Slot Machine / Matching Visual Module */}
              <div className="matching-visual-box">
                {spinning ? (
                  <div className="slot-container">
                    <div className="slot-track spinning">
                      {mockMatchPool.concat(mockMatchPool).map((item, idx) => (
                        <div className="slot-item" key={idx}>
                          <div className="slot-item-img-placeholder" style={{ marginBottom: 6 }}>
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="var(--primary-color)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6L18 2H6z"/>
                              <path d="M3 6h18"/>
                              <path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                          </div>
                          <span>{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="slot-container static" style={{ border: 'var(--border-luxury)' }}>
                    <div className="slot-item">
                      <div className="radar-circle bounce-slow" style={{ marginBottom: 10 }}>
                        <div className="radar-sweep-line"></div>
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="var(--primary-color)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
                          <line x1="12" y1="2" x2="12" y2="22" />
                          <line x1="2" y1="8.5" x2="22" y2="15.5" />
                          <line x1="2" y1="15.5" x2="22" y2="8.5" />
                        </svg>
                      </div>
                      <span className="slot-prompt-text" style={{ color: 'var(--text-main)', fontSize: 13, fontWeight: 500 }}>
                        Initiate Smart Allocation Node
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Begin Picking Button */}
              <button 
                className={`begin-match-btn ${spinning ? 'disabled' : 'pulse-glow-blue'}`}
                onClick={handleBeginPicking}
                disabled={spinning}
                id="btn-begin-matching"
              >
                {spinning ? 'Picking order...' : 'Begin Picking'}
              </button>
            </div>

            <div className="shop-right-col">
              {/* Stats grid block below (white card) */}
              <div className="stats-report-card">
                <div className="report-grid">
                  <div className="report-item">
                    <span className="report-val">$ {totalCommission}</span>
                    <span className="report-lbl">Total Commission</span>
                  </div>
                  <div className="report-item">
                    <span className="report-val">$ {freezeBalance}</span>
                    <span className="report-lbl">Freeze Balance</span>
                  </div>
                  <div className="report-item">
                    <span className="report-val">{orderCompleteCount}</span>
                    <span className="report-lbl">Order number</span>
                  </div>
                  <div className="report-item">
                    <span className="report-val">$ {parseFloat(balance).toFixed(2)}</span>
                    <span className="report-lbl">My balance</span>
                  </div>
                </div>
              </div>

              {/* Store rules */}
              <div className="store-rules-container">
                <h4 className="rules-title">Take a closer look at the store rules:</h4>
                <ol className="rules-list">
                  <li>Every order in our store will be randomly assigned to customers. Prevent illegal post-shipment activities such as money laundering and withdrawals for malicious purposes. The user must complete the work after the worksheet is launched. And the job cannot be canceled midway, otherwise the system will not allow withdrawals.</li>
                  <li>The commission for each order will be randomly distributed.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeOrderDetails && (
        <OrderDetailsModal
          order={activeOrderDetails}
          balance={balance}
          onClose={() => setActiveOrderDetails(null)}
          onCancel={() => setActiveOrderDetails(null)}
          onSubmit={handleModalSubmit}
        />
      )}

      <style>{`
        .shop-order-page {
          display: flex;
          flex-direction: column;
        }

        .shop-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 54px;
          padding: 0 16px;
          background-color: var(--bg-nav);
          border-bottom: var(--border-glass);
        }

        .header-back-btn, .shop-chat-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: var(--text-muted);
        }

        .shop-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--text-main);
        }

        .shop-content {
          padding: 16px;
        }

        .shop-grid-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .shop-left-col, .shop-right-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .shop-grid-layout {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 24px;
            align-items: start;
          }
        }

         /* Balance card */
        .shop-balance-card {
          background: linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%);
          border-radius: 16px;
          padding: 18px 24px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 113, 206, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .balance-info-col {
          display: flex;
          flex-direction: column;
        }

        .balance-amount-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--primary-color);
          letter-spacing: -0.5px;
        }

        .balance-sub-label {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .add-balance-btn {
          width: 42px;
          height: 42px;
          background-color: var(--primary-color);
          color: white;
          border-radius: 14px; /* matching squircle style */
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 113, 206, 0.25);
          transition: all 0.2s;
        }

        .add-balance-btn:hover {
          transform: translateY(-1.5px) scale(1.03);
          background-color: var(--primary-hover);
        }

        .add-balance-btn:active {
          transform: translateY(1px);
        }

        /* Standalone task stats card */
        .matching-stats-card {
          background-color: var(--bg-card);
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.04);
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stats-card-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(0,0,0,0.03);
          padding-bottom: 8px;
        }

        .stats-card-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          text-align: center;
        }

        .stats-card-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stats-card-col:not(:last-child) {
          border-right: 1px solid rgba(0, 0, 0, 0.04);
        }

        .stats-card-num {
          font-size: 18px;
          font-weight: 800;
          color: var(--primary-color);
        }

        .stats-card-lbl {
          font-size: 9px;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          font-weight: 600;
        }

        /* Match visual slot machine styles */
        .matching-visual-box {
          margin: 8px 0;
        }

        .matching-center-icon {
          font-size: 32px;
          margin-bottom: 6px;
        }

        .slot-prompt-text {
          font-size: 13px;
          color: var(--text-muted);
          text-align: center;
        }

        .slot-item-img-placeholder {
          font-size: 38px;
          margin-bottom: 4px;
        }

        /* Begin matching button */
        .begin-match-btn {
          width: 100%;
          height: 52px;
          border-radius: 26px;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: white;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          box-shadow: 0 8px 20px -4px rgba(3, 105, 161, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .begin-match-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.25) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          transition: all 0.75s ease;
        }

        .begin-match-btn:not(.disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -4px rgba(3, 105, 161, 0.5);
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        }

        .begin-match-btn:not(.disabled):hover::before {
          left: 125%;
        }

        .begin-match-btn.disabled {
          background: #e2e8f0;
          color: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        /* Stats Grid card */
        .stats-report-card {
          background-color: var(--bg-card);
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .report-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 12px;
        }

        .report-item {
          display: flex;
          flex-direction: column;
          padding: 6px 10px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.01);
          border: 1px solid rgba(0,0,0,0.01);
        }

        .report-val {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }

        .report-lbl {
          font-size: 9px;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-top: 1px;
          font-weight: 600;
        }

        /* Store rules */
        .store-rules-container {
          background-color: var(--bg-card);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
          margin-bottom: 16px;
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .rules-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .rules-list {
          padding-left: 14px;
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.6;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </>
  );
}
