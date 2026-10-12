import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Orders from './pages/Orders';
import ShopOrder from './pages/ShopOrder';
import Support from './pages/Support';
import Profile from './pages/Profile';
import Security from './pages/Security';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import TransactionLogs from './pages/TransactionLogs';
import Affiliate from './pages/Affiliate';
import Login from './pages/Login';
import Register from './pages/Register';
import { supabase } from './supabase';
import { Toaster } from 'react-hot-toast';
import { LoadingProvider } from './components/GlobalLoader';
import PWAInstallPrompt from './components/PWAInstallPrompt';


// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("User portal rendering error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, sans-serif', background: '#f8fafc', color: '#0f172a', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', maxWidth: '400px' }}>
            We encountered an unexpected error loading the portal. Click below to reload.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{ padding: '10px 24px', borderRadius: '12px', background: '#0071ce', color: '#fff', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Route guards
function ProtectedRoute({ children }) {
  let session = null;
  try {
    session = localStorage.getItem('cb_user_session');
  } catch (e) {
    console.warn("Storage error", e);
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  let session = null;
  try {
    session = localStorage.getItem('cb_user_session');
  } catch (e) {
    console.warn("Storage error", e);
  }
  if (session) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  // Theme state: 'orange' or 'red'
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('cb_theme') || 'orange';
    } catch {
      return 'orange';
    }
  });

  // Balance state
  const [balance, setBalance] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_balance');
      const val = saved ? parseFloat(saved) : 0;
      return isNaN(val) ? 0 : val;
    } catch {
      return 0;
    }
  });

  // Username
  const [username, setUsername] = useState(() => {
    try {
      return localStorage.getItem('cb_username') || '';
    } catch {
      return '';
    }
  });

  // Orders list
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_orders');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme === 'red' ? 'theme-red' : '';
    localStorage.setItem('cb_theme', theme);
  }, [theme]);

  // Capture PWA install prompt globally
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('cb_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('cb_username', username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem('cb_orders', JSON.stringify(orders));
  }, [orders]);

  // Triggered when theme updates
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const updateBalance = (amount) => {
    setBalance(prev => {
      const nextBalance = parseFloat((prev + amount).toFixed(2));
      
      supabase
        .from('cb_users')
        .select('balance, earnings')
        .eq('username', username)
        .then(({ data, error }) => {
          if (!error && data && data[0]) {
            const currentEarnings = parseFloat(data[0].earnings || 0);
            const nextEarnings = amount > 0 ? parseFloat((currentEarnings + amount).toFixed(4)) : currentEarnings;
            
            supabase
              .from('cb_users')
              .update({ 
                balance: nextBalance,
                ...(amount > 0 ? { earnings: nextEarnings } : {})
              })
              .eq('username', username)
              .then(({ error: updateErr }) => {
                if (updateErr) console.error("Supabase balance/earnings sync error:", updateErr.message);
              });
          } else {
            supabase
              .from('cb_users')
              .update({ balance: nextBalance })
              .eq('username', username);
          }
        });

      return nextBalance;
    });
  };

  const addPendingDeposit = () => {};
  const addPendingWithdraw = () => {};

  // Set user online status on session restore, visibility change, and page unload
  useEffect(() => {
    if (!username) return;

    const setOnlineStatus = (status) => {
      supabase.from('cb_users').update({ online: status }).eq('username', username)
        .then(({ error }) => {
          if (error) {
            const errMsg = error?.message || JSON.stringify(error);
            if (errMsg.includes('Failed to fetch') || errMsg.includes('TypeError')) {
              console.warn("Offline or transient network warning setting online status:", errMsg);
            } else {
              console.error("Error setting online status:", errMsg);
            }
          }
        })
        .catch((err) => {
          console.warn("Failed to set online status due to network error:", err?.message || err);
        });
    };

    const handleVisibilityChange = () => {
      const status = document.visibilityState === 'visible' ? 'Online' : 'Offline';
      setOnlineStatus(status);
    };

    const handleUnload = () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        const url = `${supabaseUrl}/rest/v1/cb_users?username=eq.${encodeURIComponent(username)}`;
        fetch(url, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ online: 'Offline' }),
          keepalive: true
        }).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('beforeunload', handleUnload);

    // Initial set to Online when component mounts
    setOnlineStatus('Online');

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
      // Try to set Offline when unmounting
      handleUnload();
    };
  }, [username]);

  // Periodically sync user profile and orders from Supabase database
  useEffect(() => {
    if (!username) return;

    const syncWithDatabase = async () => {
      if (document.hidden) return; // Save bandwidth when tab is in background!
      try {
        // 1. Fetch user balance
        const { data: users, error: userError } = await supabase
          .from('cb_users')
          .select('balance')
          .eq('username', username);

        if (!userError && users && users[0]) {
          const fetchedBalance = parseFloat(users[0].balance);
          setBalance(fetchedBalance);
        }

        // 2. Fetch matched orders list
        const { data: ordersData, error: ordersError } = await supabase
          .from('cb_orders')
          .select('*')
          .eq('username', username)
          .order('id', { ascending: false });

        if (!ordersError && ordersData) {
          const formatted = ordersData.map(o => ({
            id: o.id,
            timestamp: new Date(o.timestamp).toLocaleString(),
            status: o.status,
            title: o.title,
            image: o.image,
            price: o.price.toString(),
            profit: o.profit.toString(),
            type: o.type,
            assignedTaskId: o.assigned_task_id,
            assignedOrderIndex: o.assigned_order_index
          }));
          setOrders(formatted);
        }
      } catch (err) {
        console.error("Database sync error:", err);
      }
    };

    syncWithDatabase();
    const interval = setInterval(() => {
      if (document.hidden) return;
      syncWithDatabase();
    }, 15000); // Poll every 15 seconds instead of 3
    return () => clearInterval(interval);
  }, [username]);

  return (
    <LoadingProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="portal-layout">
                  {/* Show brand Header only on Home path */}
                  <ConditionalHeader theme={theme} onThemeChange={handleThemeChange} />
                  
                  <div className="main-content-area">
                    <Routes>
                      <Route path="" element={<Navigate to="/home" replace />} />
                      <Route 
                        path="home" 
                        element={<Home currentTheme={theme} balance={balance} username={username} />} 
                      />
                      <Route 
                        path="orders" 
                        element={
                          <Orders 
                            balance={balance}
                            orders={orders} 
                            setOrders={setOrders} 
                            updateBalance={updateBalance} 
                          />
                        } 
                      />
                      <Route 
                        path="match" 
                        element={
                          <ShopOrder 
                            balance={balance} 
                            updateBalance={updateBalance} 
                            orders={orders} 
                            setOrders={setOrders} 
                          />
                        } 
                      />
                      <Route path="support" element={<Support />} />
                      <Route 
                        path="profile" 
                        element={
                          <Profile 
                            balance={balance} 
                            username={username}
                            setUsername={setUsername}
                            setBalance={setBalance}
                            setOrders={setOrders}
                          />
                        } 
                      />
                      <Route 
                        path="security" 
                        element={<Security />} 
                      />
                      <Route 
                        path="affiliate" 
                        element={<Affiliate />} 
                      />
                      <Route 
                        path="deposit" 
                        element={<Deposit addPendingDeposit={addPendingDeposit} />} 
                      />
                      <Route 
                        path="withdraw" 
                        element={
                          <Withdraw 
                            balance={balance} 
                            updateBalance={updateBalance} 
                            addPendingWithdraw={addPendingWithdraw} 
                          />
                        } 
                      />
                      <Route path="deposit-history" element={<TransactionLogs username={username} />} />
                      <Route path="payout-history" element={<TransactionLogs username={username} />} />
                      <Route path="transaction-logs" element={<TransactionLogs username={username} />} />
                      <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                  </div>

                  {/* Show Bottom Nav bar on main navigation routes */}
                  <ConditionalBottomNav />

                  {/* PWA custom prompt installer */}
                  <PWAInstallPrompt />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </LoadingProvider>
  );
}

// Subcomponents to handle conditional headers and footers based on route
function ConditionalHeader({ theme, onThemeChange }) {
  const showHeader = window.location.hash.includes('/home');
  if (!showHeader) return null;
  return <Header currentTheme={theme} onThemeChange={onThemeChange} />;
}

function ConditionalBottomNav() {
  const path = window.location.hash;
  const hideNav = path.includes('/deposit') || path.includes('/withdraw');
  if (hideNav) return null;
  return <BottomNav />;
}
