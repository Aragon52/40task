import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

import toast from 'react-hot-toast';
export default function Withdraw({ balance, updateBalance, addPendingWithdraw }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('USDT (TRC20)');
  const [password, setPassword] = useState('');
  const [savedUsdtAddress, setSavedUsdtAddress] = useState('');
  const [savedBankName, setSavedBankName] = useState('');
  const [savedBankAccount, setSavedBankAccount] = useState('');
  const [savedBankHolder, setSavedBankHolder] = useState('');

  useEffect(() => {
    const loadSavedAddress = async () => {
      const sessionStr = localStorage.getItem('cb_user_session');
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      if (!session) return;
      const { data: users } = await supabase
        .from('cb_users')
        .select('usdt_address, bank_name, bank_account, bank_holder, withdraw_password, password')
        .eq('username', session.username);
      if (users && users[0]) {
        const u = users[0];
        setSavedUsdtAddress(u.usdt_address || '');
        setSavedBankName(u.bank_name || '');
        setSavedBankAccount(u.bank_account || '');
        setSavedBankHolder(u.bank_holder || '');
        // Auto-fill address with USDT address by default
        if (u.usdt_address) setAddress(u.usdt_address);
      }
    };
    loadSavedAddress();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const withdrawVal = parseFloat(amount);
    if (!withdrawVal || withdrawVal <= 0) {
      toast("Please enter a valid payout amount.");
      return;
    }
    if (withdrawVal > balance) {
      toast("Insufficient funds in your account balance.");
      return;
    }
    if (!address) {
      toast("Please provide a valid receiving address.");
      return;
    }

    const sessionStr = localStorage.getItem('cb_user_session');
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    if (!session) {
      toast("User session not found. Please log in again.");
      navigate('/login');
      return;
    }

    try {
      // Query user profile from database to get admin and staff nodes
      const { data: users, error: userError } = await supabase
        .from('cb_users')
        .select('*')
        .eq('username', session.username);

      if (userError) {
        toast.error("Error retrieving profile: " + userError.message);
        return;
      }

      const userProfile = users && users[0];
      if (!userProfile) {
        toast.error("User profile not found.");
        return;
      }

      if (userProfile.withdraw === 'Disable' || userProfile.withdraw === 'Disabled') {
        toast.error("Your withdrawal privilege has been restricted by administrative nodes.");
        return;
      }

      const correctWithdrawPassword = userProfile.withdraw_password || userProfile.password;
      if (correctWithdrawPassword && correctWithdrawPassword !== password) {
        if (userProfile.withdraw_password) {
          toast("Incorrect withdrawal password. Please enter your correct withdrawal password to authorize this payout.");
        } else {
          toast("Incorrect secure password. Please enter your correct login password to authorize this payout.");
        }
        return;
      }

      // 1. Create withdrawal request first
      const newRequest = {
        id: 'WTH-' + Math.floor(10000 + Math.random() * 90000),
        user_id: userProfile?.id || session.id,
        username: session.username,
        amount: withdrawVal,
        method: paymentMethod,
        account_info: address,
        status: "Pending",
        created_at: new Date().toISOString(),
        referred_by_staff_id: userProfile?.referred_by_staff_id || null,
        member_of_admin_id: userProfile?.member_of_admin_id || null,
        remark: ""
      };

      const { error: withdrawError } = await supabase
        .from('cb_withdrawals')
        .insert([newRequest]);

      if (withdrawError) {
        toast.error("Error recording withdrawal request: " + withdrawError.message);
        return;
      }

      // 2. Deduct balance in state and DB
      updateBalance(-withdrawVal);

      // Trigger HMR
      toast(`Payout request for $${withdrawVal.toFixed(2)} submitted! Funds have been frozen pending review.`);
      navigate('/home');
    } catch (err) {
      toast.error("Failed to submit withdrawal: " + err.message);
    }
  };

  return (
    <>
      <div className="withdraw-page scale-up">
        <div className="withdraw-header">
          <div className="header-back-btn" onClick={() => navigate('/home')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </div>
          <span className="withdraw-title">Request Payout</span>
          <div style={{ width: 40 }}></div>
        </div>

        <form onSubmit={handleSubmit} className="withdraw-content">
          <div className="withdraw-card card">
            <span className="balance-info-val">Available Balance: <b>$ {balance.toFixed(2)}</b></span>
          </div>

          <div className="withdraw-card card">
            <h4 className="card-sec-title">1. Payment Method</h4>
            <select
              className="method-dropdown"
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                // Auto-fill address based on method
                if (e.target.value.includes('USDT')) {
                  setAddress(savedUsdtAddress);
                } else if (e.target.value === 'Direct Bank Payout') {
                  setAddress(savedBankAccount ? `${savedBankHolder} | ${savedBankName} | ${savedBankAccount}` : '');
                }
              }}
            >
              <option value="USDT (TRC20)">USDT (TRC20)</option>
              <option value="USDT (ERC20)">USDT (ERC20)</option>
              <option value="Direct Bank Payout">Direct Bank Payout</option>
            </select>
            {/* Show saved info hint */}
            {paymentMethod.includes('USDT') && savedUsdtAddress && (
              <p style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 6 }}>Saved address: {savedUsdtAddress.substring(0, 16)}...</p>
            )}
            {paymentMethod === 'Direct Bank Payout' && savedBankName && (
              <p style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 6 }}>Saved bank: {savedBankName} — {savedBankHolder}</p>
            )}
          </div>

          <div className="withdraw-card card">
            <h4 className="card-sec-title">2. Receiving Details</h4>
            <input
              type="text"
              className="payout-address-input"
              placeholder="Enter your USDT wallet address or bank account"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              id="txt-withdraw-address"
            />
          </div>

          <div className="withdraw-card card">
            <h4 className="card-sec-title">3. Payout Amount ($)</h4>
            <div className="amount-input-row">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                className="withdraw-amount-input"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                id="txt-withdraw-amount"
              />
            </div>
            <button
              type="button"
              className="withdraw-all-btn"
              onClick={() => setAmount(balance.toString())}
              style={{ border: 'none', background: 'none', cursor: 'pointer', outline: 'none' }}
            >
              Withdraw All
            </button>
          </div>

          <div className="withdraw-card card">
            <h4 className="card-sec-title">4. Secure Verification</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '8px', lineHeight: '1.4' }}>
              For your financial security, please enter your secure withdrawal password to authorize this payout request.
            </p>
            <input
              type="password"
              className="payout-address-input"
              placeholder="Enter withdrawal password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="txt-withdraw-password"
            />
          </div>

          <div className="warnings-box">
            <p>⚠️ Payouts are processed by network nodes within 24 hours.</p>
            <p>⚠️ Double-check your wallet network. Incorrect addresses will result in permanent loss of funds.</p>
          </div>

          <button type="submit" className="submit-withdraw-btn" id="btn-submit-withdraw" style={{ border: 'none', cursor: 'pointer' }}>
            Submit Payout Request
          </button>
        </form>
      </div>

      <style>{`
        .withdraw-page {
          display: flex;
          flex-direction: column;
        }

        .withdraw-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 54px;
          padding: 0 16px;
          background-color: var(--bg-nav);
          border-bottom: var(--border-glass);
        }

        .withdraw-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: 0.5px;
        }

        .withdraw-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .balance-info-val {
          font-size: 14px;
          color: var(--text-muted);
        }

        .balance-info-val b {
          font-size: 18px;
          color: var(--primary-color);
        }

        .card-sec-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 12px;
        }

        .method-dropdown {
          width: 100%;
          height: 40px;
          border-radius: 6px;
          border: var(--border-glass);
          padding: 0 10px;
          background-color: var(--bg-input);
          font-size: 13px;
          color: var(--text-main);
        }

        .payout-address-input {
          width: 100%;
          height: 40px;
          border-radius: 6px;
          border: var(--border-glass);
          padding: 0 12px;
          font-size: 13px;
          background-color: var(--bg-input);
          color: var(--text-main);
        }

        .amount-input-row {
          display: flex;
          align-items: center;
          background-color: var(--bg-input);
          border: var(--border-glass);
          border-radius: 6px;
          padding: 8px 12px;
          gap: 6px;
          margin-bottom: 10px;
        }

        .currency-symbol {
          font-size: 18px;
          color: var(--text-muted);
        }

        .withdraw-amount-input {
          flex: 1;
          font-size: 18px;
          font-weight: 600;
          background-color: transparent;
          color: var(--text-main);
          border: none;
          outline: none;
        }

        .withdraw-all-btn {
          font-size: 12px;
          color: var(--primary-color);
          font-weight: 600;
          align-self: flex-start;
        }

        .warnings-box {
          background-color: rgba(239, 68, 68, 0.08);
          border-left: 3px solid var(--danger-color);
          padding: 12px;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-top: var(--border-glass);
          border-right: var(--border-glass);
          border-bottom: var(--border-glass);
        }

        .warnings-box p {
          font-size: 10px;
          color: #fca5a5;
          line-height: 1.4;
        }

        .submit-withdraw-btn {
          height: 48px;
          background: var(--primary-gradient);
          color: #080c14;
          border-radius: 24px;
          font-size: 15px;
          font-weight: 600;
          box-shadow: var(--shadow-lg);
          margin-bottom: 24px;
        }
      `}</style>
    </>
  );
}
