import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Affiliate() {
  const navigate = useNavigate();
  const username = localStorage.getItem('cb_username') || '';
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [inviter, setInviter] = useState(null);
  const [referredUsers, setReferredUsers] = useState([]);
  
  // Binding section states
  const [referralInput, setReferralInput] = useState('');
  const [binding, setBinding] = useState(false);

  // Copy helper
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const fetchAffiliateData = async () => {
    if (!username) return;
    setLoading(true);
    try {
      // 1. Fetch current user profile
      const { data: users, error: profileErr } = await supabase
        .from('cb_users')
        .select('*')
        .eq('username', username);

      if (profileErr) throw profileErr;
      if (!users || users.length === 0) {
        toast.error('User profile not found');
        return;
      }

      const curProfile = users[0];
      
      // Ensure a unique invitation code is generated if it doesn't exist
      if (!curProfile.invite_code) {
        const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { error: updateErr } = await supabase
          .from('cb_users')
          .update({ invite_code: generatedCode })
          .eq('id', curProfile.id);
        if (!updateErr) {
          curProfile.invite_code = generatedCode;
        }
      }

      setProfile(curProfile);

      // 2. Fetch referrer information if already bound
      if (curProfile.invited_by_user_id) {
        const { data: inviters, error: inviterErr } = await supabase
          .from('cb_users')
          .select('id, username')
          .eq('id', curProfile.invited_by_user_id);
          
        if (!inviterErr && inviters && inviters.length > 0) {
          setInviter(inviters[0]);
        }
      } else {
        setInviter(null);
      }

      // 3. Fetch list of referred downlines
      const { data: referrals, error: refErr } = await supabase
        .from('cb_users')
        .select('id, username, reg_time, level, balance')
        .eq('invited_by_user_id', curProfile.id)
        .order('reg_time', { ascending: false });

      if (refErr) throw refErr;
      setReferredUsers(referrals || []);

    } catch (err) {
      console.error('Error fetching affiliate page data:', err);
      toast.error('Failed to load affiliate details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliateData();
  }, [username]);

  // Bind referral code logic
  const handleBindReferral = async (e) => {
    e.preventDefault();
    const code = referralInput.trim().toUpperCase();
    if (!code) {
      toast.error('Please enter an invitation code');
      return;
    }

    if (!profile) {
      toast.error('Profile not initialized');
      return;
    }

    if (code === profile.invite_code) {
      toast.error('You cannot refer your own account');
      return;
    }

    setBinding(true);
    try {
      // 1. Find user with this invite_code
      const { data: foundUsers, error: searchErr } = await supabase
        .from('cb_users')
        .select('id, username, referred_by_staff_id, member_of_admin_id')
        .eq('invite_code', code);

      if (searchErr) throw searchErr;
      if (!foundUsers || foundUsers.length === 0) {
        toast.error('Invalid referral code. Please verify and try again.');
        return;
      }

      const targetInviter = foundUsers[0];

      // 2. Clear out self-binding loops or existing bindings
      // Perform database update
      const { error: updateErr } = await supabase
        .from('cb_users')
        .update({
          invited_by_user_id: targetInviter.id
        })
        .eq('id', profile.id);

      if (updateErr) throw updateErr;

      toast.success(`Successfully linked to referrer: ${targetInviter.username}!`);
      setReferralInput('');
      fetchAffiliateData(); // Refresh page state

    } catch (err) {
      console.error('Error binding referral code:', err);
      toast.error('Failed to bind referral code: ' + err.message);
    } finally {
      setBinding(false);
    }
  };

  // Helper mask username for display: 13912341234 -> 139****1234
  const maskUsername = (name) => {
    if (!name) return '';
    if (name.length <= 4) return name;
    return name.substring(0, 3) + '****' + name.substring(name.length - 4);
  };

  const inviteLink = profile ? `${window.location.origin}/#/register?invite=${profile.invite_code}` : '';

  return (
    <div className="affiliate-page" style={{ paddingBottom: '90px', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
      {/* Header Bar */}
      <div className="orders-header">
        <button className="header-back-btn" onClick={() => navigate('/profile')}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span className="orders-title">Affiliate Center</span>
        <div style={{ width: 40 }}></div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px' }}>
          <p>Loading your Affiliate dashboard...</p>
        </div>
      ) : (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Main Referral Info Card */}
          <div className="affiliate-card scale-up">
            <div className="aff-card-header">
              <span className="aff-card-badge">Affiliate Link</span>
            </div>
            
            <div className="aff-info-row" style={{ marginTop: '12px' }}>
              <div className="aff-info-lbl">My Invitation Code</div>
              <div className="aff-info-val-wrap" onClick={() => handleCopy(profile?.invite_code, 'Invitation Code')}>
                <span className="aff-info-val-text">{profile?.invite_code || '------'}</span>
                <button className="aff-copy-btn">Copy</button>
              </div>
            </div>

            <div className="aff-info-row">
              <div className="aff-info-lbl">Registration Link</div>
              <div className="aff-info-val-wrap" onClick={() => handleCopy(inviteLink, 'Referral Link')} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px' }}>
                <span className="aff-info-val-text" style={{ fontSize: '11px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                  {inviteLink}
                </span>
                <button className="aff-copy-btn">Copy</button>
              </div>
            </div>
          </div>

          {/* Referral Binding Section */}
          <div className="affiliate-card scale-up" style={{ background: 'linear-gradient(135deg, rgba(0, 113, 206, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)' }}>
            <div className="aff-card-header">
              <span className="aff-card-title">Referrer Binding</span>
            </div>

            {inviter ? (
              <div style={{ marginTop: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Linked Account</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#10b981', marginTop: '2px' }}>
                    👤 {maskUsername(inviter.username)}
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600', textTransform: 'uppercase' }}>
                  ✓ Securely Bound
                </div>
              </div>
            ) : (
              <form onSubmit={handleBindReferral} style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  If you registered without an invitation code, please enter a friend's referral code below to link accounts. This binding is lifetime and cannot be changed.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value)}
                    placeholder="Enter Invitation Code"
                    className="aff-bind-input"
                    maxLength={10}
                    disabled={binding}
                  />
                  <button 
                    type="submit" 
                    className="aff-bind-submit"
                    disabled={binding}
                  >
                    {binding ? 'Binding...' : 'Bind Link'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Stats Summary Bento Grid */}
          <div className="aff-stats-grid">
            <div className="aff-stat-card scale-up">
              <div className="aff-stat-label">👥 Team Size</div>
              <div className="aff-stat-number">{referredUsers.length}</div>
              <div className="aff-stat-description">Directly invited active users</div>
            </div>

            <div className="aff-stat-card scale-up">
              <div className="aff-stat-label">💰 Commission Share</div>
              <div className="aff-stat-number">{profile?.commissions ? `$ ${parseFloat(profile.commissions).toFixed(2)}` : '$ 0.00'}</div>
              <div className="aff-stat-description">Accumulated profit share</div>
            </div>
          </div>

          {/* List of Invited Users */}
          <div className="affiliate-card scale-up" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="aff-card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span className="aff-card-title">Downline Members ({referredUsers.length})</span>
            </div>

            {referredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: '8px' }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <div style={{ fontSize: '13px' }}>No referred users found yet</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>Share your registration link to start earning commissions!</div>
              </div>
            ) : (
              <div className="aff-users-list">
                {referredUsers.map((user) => (
                  <div key={user.id} className="aff-user-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="aff-user-avatar">
                        {user.username.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="aff-user-name">{maskUsername(user.username)}</div>
                        <div className="aff-user-date">Joined: {new Date(user.reg_time).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="aff-user-vip">{user.level || 'FREE VIP'}</span>
                      <div className="aff-user-bal">Bal: ${parseFloat(user.balance).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Styled JSX for Premium Visual Fidelity */}
      <style>{`
        .affiliate-page {
          background-color: var(--bg-main);
          color: var(--text-main);
        }

        .affiliate-card {
          background-color: var(--bg-card);
          border: var(--border-luxury);
          border-radius: 16px;
          padding: 16px;
          box-shadow: var(--shadow-luxury);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .aff-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .aff-card-badge {
          background-color: rgba(0, 113, 206, 0.08);
          color: var(--primary-color);
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          border: 1px solid rgba(0, 113, 206, 0.15);
        }

        .aff-card-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .aff-info-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .aff-info-lbl {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .aff-info-val-wrap {
          height: 42px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .aff-info-val-wrap:hover {
          border-color: var(--primary-color);
          background-color: rgba(0, 113, 206, 0.02);
        }

        .aff-info-val-text {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
        }

        .aff-copy-btn {
          background: none;
          border: none;
          font-size: 11px;
          font-weight: 700;
          color: var(--primary-color);
          cursor: pointer;
          text-transform: uppercase;
        }

        .aff-bind-input {
          flex: 1;
          height: 42px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          padding: 0 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          background-color: var(--bg-input);
          outline: none;
          transition: all 0.2s;
        }

        .aff-bind-input:focus {
          border-color: var(--primary-color);
          background-color: var(--bg-card);
        }

        .aff-bind-submit {
          height: 42px;
          padding: 0 16px;
          border-radius: 10px;
          background-color: var(--primary-color);
          color: white;
          font-weight: 700;
          font-size: 13px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .aff-bind-submit:hover {
          opacity: 0.95;
          transform: translateY(-0.5px);
        }

        .aff-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .aff-stat-card {
          background-color: var(--bg-card);
          border: var(--border-luxury);
          border-radius: 16px;
          padding: 14px;
          box-shadow: var(--shadow-luxury);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .aff-stat-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .aff-stat-number {
          font-size: 18px;
          font-weight: 800;
          color: var(--primary-color);
        }

        .aff-stat-description {
          font-size: 10px;
          color: var(--text-muted);
          line-height: 1.2;
        }

        .aff-users-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 350px;
          overflow-y: auto;
        }

        .aff-user-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 12px;
        }

        .aff-user-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--primary-color) 0%, rgba(0, 113, 206, 0.75) 100%);
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
        }

        .aff-user-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
        }

        .aff-user-date {
          font-size: 10px;
          color: var(--text-muted);
          marginTop: 2px;
        }

        .aff-user-vip {
          font-size: 10px;
          font-weight: 700;
          background-color: rgba(0, 113, 206, 0.08);
          color: var(--primary-color);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid rgba(0, 113, 206, 0.12);
        }

        .aff-user-bal {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-main);
          margin-top: 3px;
        }
      `}</style>
    </div>
  );
}
