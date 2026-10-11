import React, { useState, useEffect } from 'react';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../components/GlobalLoader';

import toast from 'react-hot-toast';
export default function Orders({ balance, orders, setOrders, updateBalance }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const { showLoading, hideLoading, performAsync } = useLoading();

  const tabs = ['All', 'Success', 'Frozen'];

  useEffect(() => {
    showLoading('orders');
    const timer = setTimeout(() => {
      hideLoading();
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All') {
      return order.status.toLowerCase() !== 'pending';
    }
    return order.status.toLowerCase() === activeTab.toLowerCase();
  });

  const handleSubmitTask = async (orderId, price, profit) => {
    // Balance Check:
    if (parseFloat(balance || 0) < parseFloat(price)) {
      toast.error(`Insufficient balance to proceed with this order. Required: $${parseFloat(price).toFixed(2)}, Available: $${parseFloat(balance || 0).toFixed(2)}.`);
      navigate('/deposit');
      return;
    }
    
    // Find the matched order from the orders list
    const matchedOrder = orders.find(o => String(o.id) === String(orderId));

    await performAsync(async () => {
      try {
        // 1. Update order status to Success in Supabase
        const { error: orderUpdateError } = await supabase
          .from('cb_orders')
          .update({ status: 'Success' })
          .eq('id', orderId);

        if (orderUpdateError) {
          toast.error("Error submitting order: " + orderUpdateError.message);
          return;
        }

        // 2. Add profit to user balance (principal is not deducted initially)
        updateBalance(parseFloat(profit));

        // 2.5 Affiliate Commission logic: If user B has an inviter (user A), reward user A with 10% of user B's profit
        try {
          const currentUsername = localStorage.getItem('cb_username');
          if (currentUsername) {
            const { data: userBData, error: userBError } = await supabase
              .from('cb_users')
              .select('id, invited_by_user_id')
              .eq('username', currentUsername);

            if (!userBError && userBData && userBData.length > 0) {
              const invitedByUserId = userBData[0].invited_by_user_id;
              if (invitedByUserId) {
                const { data: userAData, error: userAError } = await supabase
                  .from('cb_users')
                  .select('id, balance, commissions')
                  .eq('id', invitedByUserId);

                if (!userAError && userAData && userAData.length > 0) {
                  const userA = userAData[0];
                  const commissionAmount = parseFloat((parseFloat(profit) * 0.10).toFixed(4));
                  if (commissionAmount > 0) {
                    const newA_Balance = parseFloat((parseFloat(userA.balance || 0) + commissionAmount).toFixed(4));
                    const newA_Commissions = parseFloat((parseFloat(userA.commissions || 0) + commissionAmount).toFixed(4));

                    await supabase
                      .from('cb_users')
                      .update({
                        balance: newA_Balance,
                        commissions: newA_Commissions
                      })
                      .eq('id', userA.id);
                  }
                }
              }
            }
          }
        } catch (affErr) {
          console.error("Error processing affiliate commission:", affErr);
        }

        // 3. Update assigned task progression if order belongs to a task
        if (matchedOrder && matchedOrder.assignedTaskId) {
          const { data: taskList } = await supabase
            .from('cb_assigned_tasks')
            .select('*')
            .eq('id', matchedOrder.assignedTaskId);

          const task = taskList && taskList[0];
          if (task && matchedOrder.assignedOrderIndex !== undefined && matchedOrder.assignedOrderIndex !== -1) {
            const updatedOrders = [...task.orders];
            updatedOrders[matchedOrder.assignedOrderIndex].status = 'Success';
            const allDone = updatedOrders.every(o => o.status === 'Success');
            const nextStatus = allDone ? 'Completed' : 'In Progress';

            await supabase
              .from('cb_assigned_tasks')
              .update({ 
                orders: updatedOrders,
                status: nextStatus 
              })
              .eq('id', task.id);
          }
        }
        
        // 4. Immediately flip local state so status badge updates without waiting for DB sync
        setOrders(prev => prev.map(o => 
          String(o.id) === String(orderId) ? { ...o, status: 'Success' } : o
        ));
        
        toast.success(`Order submitted! Earned $${parseFloat(profit).toFixed(2)} commission.`);
      } catch (err) {
        toast.error("Error submitting task: " + err.message);
      }
    }, 'orders');
  };

  return (
    <>
      <div className="orders-page scale-up">
        {/* Header replicated from Screenshot 4 */}
        <div className="orders-header">
          <div className="header-back-btn">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </div>
          <span className="orders-title">Order ID</span>
          <div className="orders-chat-btn">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <circle cx="9" cy="10" r="1" />
              <circle cx="12" cy="10" r="1" />
              <circle cx="15" cy="10" r="1" />
            </svg>
          </div>
        </div>

        {/* Tab bar */}
        <div className="tabs-container">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              id={`btn-tab-${tab.toLowerCase()}`}
            >
              {tab}
              {activeTab === tab && <span className="tab-indicator"></span>}
            </button>
          ))}
        </div>

        {/* Order items list */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-orders">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M9 17h6" />
                <path d="M9 13h6" />
                <path d="M9 9h6" />
              </svg>
              <span>No orders found in this category</span>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div 
                className="order-item-card" 
                key={order.id} 
                id={`order-${order.id}`}
                onClick={() => setSelectedOrderDetails(order)}
                style={{ cursor: 'pointer' }}
              >
                <div className="order-item-header">
                  <span className="order-timestamp">{order.timestamp}</span>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-item-body">
                  <div className="product-image-container" style={{ border: 'var(--border-luxury)', borderRadius: 6, backgroundColor: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {order.image ? (
                      <img src={order.image} alt={order.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="prod-img-placeholder" style={{ color: 'var(--primary-color)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {order.type === 'food' ? (
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6L18 2H6z"/>
                            <path d="M16 10a4 4 0 0 1-8 0"/>
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <span className="product-title">{order.title}</span>
                  </div>
                </div>

                <div className="order-price-box">
                  <div className="price-col">
                    <span className="price-value">$ {order.price}</span>
                    <span className="price-label">Price</span>
                  </div>
                  <div className="profit-col">
                    <span className="profit-value">$ {order.profit}</span>
                    <span className="profit-label">Estimated Profit</span>
                  </div>
                </div>

                {order.status === 'Pending' && parseFloat(balance || 0) < parseFloat(order.price) && (
                  <div className="diff-amount-badge-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '10px 12px', borderRadius: '10px', fontSize: '12px' }}>
                    <span style={{ color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline-block' }}>
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      Difference Amount:
                    </span>
                    <span style={{ color: '#ef4444', fontWeight: '750' }}>$ {(parseFloat(order.price) - parseFloat(balance || 0)).toFixed(2)}</span>
                  </div>
                )}

                {order.status === 'Pending' && (
                  <div className="order-item-actions">
                    <button
                      className="submit-task-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrderDetails(order);
                      }}
                      id={`btn-submit-task-${order.id}`}
                    >
                      Submit Task
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
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

      <style>{`
        .orders-page {
          display: flex;
          flex-direction: column;
        }

        .orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 54px;
          padding: 0 16px;
          background-color: var(--bg-nav);
          border-bottom: var(--border-glass);
        }

        .header-back-btn, .orders-chat-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: var(--text-muted);
        }

        .orders-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: 0.5px;
        }

        /* Tabs styles */
        .tabs-container {
          display: flex;
          background-color: var(--bg-nav);
          border-bottom: var(--border-glass);
          height: 44px;
        }

        .tab-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 550;
          color: var(--text-muted);
          position: relative;
        }

        .tab-btn.active {
          color: var(--primary-color);
        }

        .tab-indicator {
          position: absolute;
          bottom: 0;
          width: 28px;
          height: 3px;
          background-color: var(--primary-color);
          border-radius: 2px;
          box-shadow: 0 -1px 8px var(--primary-color);
        }

        /* Order card list styles */
        .orders-list {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .orders-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .orders-list {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .empty-orders {
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
          font-size: 13px;
        }

        .order-item-card {
          background-color: var(--bg-card);
          border-radius: var(--border-radius-md);
          box-shadow: var(--shadow-card);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: var(--border-glass);
          backdrop-filter: blur(10px);
        }

        .order-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: var(--border-glass);
          padding-bottom: 8px;
        }

        .order-timestamp {
          font-size: 11px;
          color: var(--text-light);
          font-family: var(--font-secondary);
        }

        .order-item-body {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .product-image-container {
          width: 50px;
          height: 50px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .prod-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .prod-img-placeholder.red-grad {
          background: linear-gradient(135deg, #f87171, #ef4444);
        }

        .prod-img-placeholder.blue-grad {
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
        }

        .product-info {
          flex: 1;
        }

        .product-title {
          font-size: 13px;
          font-weight: 550;
          color: var(--text-main);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .order-price-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--bg-input);
          border-radius: var(--border-radius-sm);
          padding: 12px;
          gap: 12px;
        }

        .price-col, .profit-col {
          display: flex;
          flex-direction: column;
        }

        .profit-col {
          align-items: flex-end;
        }

        .price-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
        }

        .profit-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--primary-color);
        }

        .price-label, .profit-label {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .submit-task-btn {
          width: 100%;
          height: 40px;
          background: linear-gradient(135deg, #ff6b6b, #ee5253);
          color: white;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 10px rgba(238, 82, 83, 0.2);
        }

        .submit-task-btn:active {
          transform: scale(0.97);
        }
      `}</style>
    </>
  );
}
