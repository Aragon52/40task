import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

import toast from 'react-hot-toast';
export default function Security() {
  const navigate = useNavigate();
  const username = localStorage.getItem('cb_username') || '';

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast("New passwords do not match.");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Verify current password
      const { data: users, error: fetchError } = await supabase
        .from('cb_users')
        .select('*')
        .eq('username', username);

      if (fetchError || !users || users.length === 0) {
        toast.error("Authentication error: Could not verify user.");
        setLoading(false);
        return;
      }

      const user = users[0];
      if (user.password && user.password !== passwordForm.currentPassword) {
        toast("Incorrect current password.");
        setLoading(false);
        return;
      }

      // 2. Update password
      const { error: updateError } = await supabase
        .from('cb_users')
        .update({ password: passwordForm.newPassword })
        .eq('username', username);

      if (updateError) {
        toast.error("Failed to update password: " + updateError.message);
      } else {
        toast.success("Password updated successfully!");
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error("Error updating password.");
    }
    setLoading(false);
  };

  const handlePhotoUpdate = async (e) => {
    e.preventDefault();
    if (!photoUrl) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cb_users')
        .update({ profile_photo: photoUrl })
        .eq('username', username);

      if (error) {
        toast.error("Failed to update profile photo: " + error.message);
        // Fallback for when column doesn't exist yet
        if (error.code === '42703') {
           toast.error("Database Schema Error: The profile_photo column does not exist. Please contact support or run the schema update.");
        }
      } else {
        toast.success("Profile photo updated successfully!");
        setPhotoUrl('');
      }
    } catch (err) {
      toast.error("Error updating profile photo.");
    }
    setLoading(false);
  };

  return (
    <div className="security-page scale-up">
      <div className="security-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h2>Security Settings</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="security-content">
        <div className="security-card card">
          <h3 className="card-title">Update Profile Photo</h3>
          <p className="card-desc">Enter an image URL to update your avatar.</p>
          <form onSubmit={handlePhotoUpdate}>
            <div className="form-group">
              <label>Image URL</label>
              <input 
                type="url" 
                placeholder="https://example.com/avatar.jpg" 
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="action-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Save Photo'}
            </button>
          </form>
        </div>

        <div className="security-card card">
          <h3 className="card-title">Change Password</h3>
          <p className="card-desc">Ensure your account uses a strong, secure password.</p>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="action-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .security-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: var(--bg-app);
          padding-bottom: 80px;
        }
        .security-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--primary-gradient);
          color: white;
        }
        .security-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        .back-btn {
          background: none;
          border: none;
          color: white;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .security-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .security-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-main);
          margin: 0;
        }
        .card-desc {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }
        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .form-group input {
          height: 42px;
          border-radius: var(--border-radius-sm);
          border: var(--border-glass);
          background-color: var(--bg-input);
          padding: 0 12px;
          font-size: 14px;
          color: var(--text-main);
        }
        .form-group input:focus {
          border-color: var(--primary-color);
          outline: none;
          background-color: white;
        }
        .action-btn {
          width: 100%;
          height: 44px;
          border-radius: 22px;
          background: var(--primary-gradient);
          color: white;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          margin-top: 8px;
          transition: transform 0.2s;
        }
        .action-btn:active {
          transform: scale(0.98);
        }
        .action-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
