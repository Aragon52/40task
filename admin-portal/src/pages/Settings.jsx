import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { 
  Shield, 
  Key, 
  Camera, 
  Save, 
  Coins, 
  Lock, 
  User, 
  Check, 
  Link, 
  AlertTriangle,
  Eye,
  Settings as SettingsIcon,
  Bitcoin,
  TrendingUp
} from 'lucide-react';

export default function Settings() {
  const [session, setSession] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [usdtAddress, setUsdtAddress] = useState('');
  const [cryptoAddresses, setCryptoAddresses] = useState({
    usdt_address: '',
    usdt_erc20_address: '',
    btc_address: '',
    eth_address: '',
    bnb_address: '',
    xrp_address: '',
    sol_address: '',
    doge_address: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('cb_admin_session');
    if (saved) {
      setSession(JSON.parse(saved));
    }
    fetchUsdtAddress();
  }, []);

  const fetchUsdtAddress = async () => {
    try {
      const { data, error } = await supabase
        .from('cb_deposit_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (!error && data) {
        setUsdtAddress(data.usdt_address || '');
        setCryptoAddresses({
          usdt_address:       data.usdt_address       || '',
          usdt_erc20_address: data.usdt_erc20_address || '',
          btc_address:        data.btc_address        || '',
          eth_address:        data.eth_address        || '',
          bnb_address:        data.bnb_address        || '',
          xrp_address:        data.xrp_address        || '',
          sol_address:        data.sol_address        || '',
          doge_address:       data.doge_address       || '',
        });
      }
    } catch (err) {
      console.error('Error fetching deposit settings:', err);
    }
  };

  const handlePhotoUpdate = async (e) => {
    e.preventDefault();
    if (!session || !photoUrl) return;

    setLoading(true);
    try {
      const table = session.role === 'Staff' ? 'cb_staff' : 'cb_admins';
      const matchCol = 'email';

      const { error } = await supabase
        .from(table)
        .update({ profile_photo: photoUrl })
        .eq(matchCol, session.email);

      if (error) {
        if (error.code === '42703') {
          toast.error("Database Schema Error: The profile_photo column does not exist. Please contact support or run the schema update.");
        } else {
          toast.error("Failed to update profile photo: " + error.message);
        }
      } else {
        toast.success("Profile photo updated successfully!");
        
        // Update local session to show the change live
        const updatedSession = { ...session, avatarUrl: photoUrl };
        setSession(updatedSession);
        localStorage.setItem('cb_admin_session', JSON.stringify(updatedSession));
        
        setPhotoUrl('');
      }
    } catch (err) {
      toast.error("Error updating profile photo.");
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) {
        toast.error("Failed to update password: " + error.message);
      } else {
        toast.success("Password updated securely!");
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error("Error updating password.");
    }
    setLoading(false);
  };

  const handleUsdtUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cb_deposit_settings')
        .update(cryptoAddresses)
        .eq('id', 1);

      if (error) {
        toast.error('Failed to update deposit addresses: ' + error.message);
      } else {
        toast.success('All crypto deposit addresses updated successfully!');
      }
    } catch (err) {
      toast.error('Error updating deposit settings.');
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-200 border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">Retrieving secure access configurations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container scale-up">
      <div className="w-full space-y-6">
        {/* Upper Status / Header Section */}
        <div className="admin-card flex items-center justify-between" style={{ padding: '24px 32px' }}>
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shadow-sm">
              {session.avatarUrl || session.profile_photo ? (
                <img 
                  src={session.avatarUrl || session.profile_photo} 
                  alt="Operator profile" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{session.name || session.email}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200/50 uppercase tracking-wider">
                  {session.role}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Authorized Security Key Node • {session.email}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Node Status</div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-1">Operational</div>
            <div className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1.5 justify-end">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              All services connected
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Photo Settings Card */}
          <div className="admin-card flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="section-title">Profile Avatar</h3>
                  <p className="text-xs text-slate-500">Update your avatar image</p>
                </div>
              </div>

              <form onSubmit={handlePhotoUpdate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Image URL</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/avatar.jpg" 
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    required
                    className="search-input w-full h-9 pl-3 text-sm"
                  />
                </div>

                {/* Live Preview Container */}
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt="Preview" 
                        onError={(e) => { e.target.src = ''; }}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">No img</div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-300">Preview</div>
                    <p className="text-[11px] text-slate-500">Live preview of your avatar.</p>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Processing...' : 'Save Avatar'}
                </button>
              </form>
            </div>
          </div>

          {/* Access Security Credentials Form */}
          <div className="admin-card flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="section-title">Security</h3>
                  <p className="text-xs text-slate-500">Update your password</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required
                      className="search-input w-full h-9 pl-3 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required
                      className="search-input w-full h-9 pl-3 text-sm"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    Guidelines
                  </div>
                  <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
                    <li>Use a strong, unique password.</li>
                    <li>Updates apply immediately across all sessions.</li>
                  </ul>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  {loading ? 'Processing...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Crypto Address Settings (Owner Only) */}
        {session.role === 'Owner' && (
          <div className="admin-card space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="section-title">Wallet Addresses</h3>
                  <p className="text-xs text-slate-500">Configure global deposit destinations</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUsdtUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'usdt_address',       label: 'USDT (TRC20)',    badge: 'TRX' },
                  { key: 'usdt_erc20_address', label: 'USDT (ERC20)',    badge: 'ETH' },
                  { key: 'btc_address',        label: 'BTC',             badge: 'BTC' },
                  { key: 'eth_address',        label: 'ETH',             badge: 'ETH' },
                  { key: 'bnb_address',        label: 'BNB',             badge: 'BSC' },
                  { key: 'xrp_address',        label: 'XRP',             badge: 'XRP' },
                  { key: 'sol_address',        label: 'SOL',             badge: 'SOL' },
                  { key: 'doge_address',       label: 'DOGE',            badge: 'DOGE' },
                ].map(({ key, label, badge }) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                    </div>
                    <input
                      type="text"
                      placeholder="Not set"
                      value={cryptoAddresses[key]}
                      onChange={e => setCryptoAddresses(prev => ({ ...prev, [key]: e.target.value }))}
                      id={`input-addr-${key}`}
                      className="search-input w-full h-9 pl-3 text-sm font-mono"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Leave blank to disable a receiving channel.</span>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Processing...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
