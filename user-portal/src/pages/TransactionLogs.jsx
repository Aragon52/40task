import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function TransactionLogs({ username }) {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    async function fetchLogs() {
      if (!username) return;
      setLoading(true);

      // Fetch deposits
      const { data: deposits, error: depErr } = await supabase
        .from('cb_deposits')
        .select('*')
        .eq('username', username);

      // Fetch withdrawals
      const { data: withdrawals, error: withErr } = await supabase
        .from('cb_withdrawals')
        .select('*')
        .eq('username', username);

      if (depErr) console.error(depErr);
      if (withErr) console.error(withErr);

      const formattedDeposits = (deposits || []).map(d => ({
        id: d.id || `DEP-${Math.floor(Math.random() * 100000)}`,
        type: 'Deposit',
        amount: d.amount,
        status: d.status,
        timestamp: d.created_at || d.timestamp,
        method: d.method || d.currency || 'USDT TRC20',
        wallet: d.wallet_address || d.transaction_hash
      }));

      const formattedWithdrawals = (withdrawals || []).map(w => ({
        id: w.id || `WIT-${Math.floor(Math.random() * 100000)}`,
        type: 'Withdrawal',
        amount: w.amount,
        status: w.status,
        timestamp: w.created_at || w.timestamp,
        method: w.method || 'USDT TRC20',
        wallet: w.wallet_address || w.account_info
      }));

      const combined = [...formattedDeposits, ...formattedWithdrawals].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      setLogs(combined);
      setLoading(false);
    }
    fetchLogs();
  }, [username]);

  const filteredLogs = logs.filter(log => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Deposits') return log.type === 'Deposit';
    if (activeTab === 'Withdrawals') return log.type === 'Withdrawal';
    return true;
  });

  return (
    <div className="transaction-logs-page" style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
      <div className="orders-header">
        <button className="header-back-btn" onClick={() => navigate('/profile')}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <span className="orders-title">Transaction History</span>
        <div style={{width: 40}}></div>
      </div>

      <div className="orders-tabs">
        {['All', 'Deposits', 'Withdrawals'].map(tab => (
          <button 
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="orders-list" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>Loading...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-orders">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span>No transactions found</span>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div className="order-item-card" key={log.id}>
              <div className="order-item-header">
                <span className="order-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                <span className={`badge badge-${
                  (log.status || 'pending').toLowerCase() === 'approved' ? 'success' : 
                  (log.status || 'pending').toLowerCase() === 'rejected' ? 'rejected' : 
                  'pending'
                }`}>
                  {log.status === 'Approved' ? 'Finished' : (log.status || 'Pending')}
                </span>
              </div>
              <div className="order-item-body" style={{ alignItems: 'center' }}>
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-input)', marginRight: '12px' }}>
                  {log.type === 'Deposit' ? (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--success-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><path d="M6 14h.01M10 14h.01"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--danger-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '15px' }}>
                    {log.type}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', wordBreak: 'break-all' }}>
                    {log.method} {log.wallet ? `- ${log.wallet}` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: log.type === 'Deposit' ? 'var(--success-color)' : 'var(--text-main)', fontWeight: 600, fontSize: '16px' }}>
                    {log.type === 'Deposit' ? '+' : '-'}$ {parseFloat(log.amount || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
