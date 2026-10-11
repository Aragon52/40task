import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  UserCog, 
  Briefcase, 
  LineChart, 
  DollarSign, 
  MessageSquare, 
  Settings,
  Layers
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const loadSession = () => {
      const saved = localStorage.getItem('cb_admin_session');
      if (saved) {
        setSession(JSON.parse(saved));
      } else {
        setSession(null);
      }
    };
    loadSession();
    // Poll for session updates from navbar switcher
    const interval = setInterval(loadSession, 1000);
    return () => clearInterval(interval);
  }, []);

  const allMenuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['Owner', 'Admin', 'Staff'] },
    { id: 'ownership', label: 'Ownership', icon: ShieldCheck, roles: ['Owner'] },
    { id: 'sla-admins', label: 'Administrators', icon: UserCog, roles: ['Owner', 'Admin'] },
    { id: 'sla-staff', label: 'Staff Members', icon: Users, roles: ['Owner', 'Admin', 'Staff'] },
    { id: 'user-management', label: 'User Management', icon: Users, roles: ['Owner', 'Admin', 'Staff'] },
    { id: 'orders-tasking', label: 'Orders Tasking', icon: Briefcase, roles: ['Owner', 'Admin', 'Staff'] },
    { id: 'templates-summary', label: 'Templates Matrix', icon: Layers, roles: ['Owner', 'Admin', 'Staff'] },
    { id: 'orders-in-progress', label: 'Orders In Progress', icon: LineChart, roles: ['Owner', 'Admin', 'Staff'] },
    { id: 'financial-center', label: 'Financial Center', icon: DollarSign, roles: ['Owner', 'Admin', 'Staff'] },
    { id: 'support-chat', label: 'Support & Chat', icon: MessageSquare, roles: ['Owner', 'Admin', 'Staff'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['Owner', 'Admin'] }
  ];

  // Filter items based on active session role and permissions
  const activeRole = session?.role || 'Owner';
  const menuItems = allMenuItems.filter(item => {
    if (!item.roles.includes(activeRole)) return false;
    
    // If staff, apply dynamic permission checks
    if (activeRole === 'Staff') {
      const perms = session?.permissions || {
          userManagement: true,
          ordersInProgress: true,
          orderTasking: false,
          financialCenter: false,
          supportChat: false
      };
      
      if (item.id === 'user-management' && !perms.userManagement) return false;
      if (item.id === 'orders-tasking' && !perms.orderTasking) return false;
      if (item.id === 'templates-summary' && !perms.orderTasking) return false;
      if (item.id === 'orders-in-progress' && !perms.ordersInProgress) return false;
      if (item.id === 'financial-center' && !perms.financialCenter) return false;
      if (item.id === 'support-chat' && !perms.supportChat) return false;
    }
    
    return true;
  });

  return (
    <div className="admin-sidebar">
      {/* Brand Logo */}
      <div className="sidebar-brand">
        <div className="logo-badge-walmart">
          <span className="logo-text-walmart">Walmart</span>
          <span className="logo-spark-walmart">
            <svg viewBox="0 0 100 100" width="14" height="14">
              <g transform="translate(50,50)" stroke="#FFC220" strokeWidth="15" strokeLinecap="round">
                <line x1="0" y1="-10" x2="0" y2="-38" />
                <line x1="0" y1="-10" x2="0" y2="-38" transform="rotate(60)" />
                <line x1="0" y1="-10" x2="0" y2="-38" transform="rotate(120)" />
                <line x1="0" y1="-10" x2="0" y2="-38" transform="rotate(180)" />
                <line x1="0" y1="-10" x2="0" y2="-38" transform="rotate(240)" />
                <line x1="0" y1="-10" x2="0" y2="-38" transform="rotate(300)" />
              </g>
            </svg>
          </span>
        </div>
      </div>
      <div className="sidebar-menu">
        {menuItems.map(item => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className={`menu-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              id={`btn-sidebar-${item.id}`}
            >
              <IconComponent className="menu-icon" size={18} strokeWidth={2} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
