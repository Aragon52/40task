import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  ClipboardList, 
  ShoppingBag, 
  MessageCircle, 
  UserCircle 
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  isCenter?: boolean;
}

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Robust path detection for HashRouter
  const currentPath = location.pathname;
  
  const navItems: NavItem[] = [
    { label: 'Home', path: '/home' },
    { label: 'Orders', path: '/orders' },
    { label: 'Picking', path: '/match', isCenter: true },
    { label: 'Support', path: '/support' },
    { label: 'Profile', path: '/profile' }
  ];

  const getIcon = (label: string, active: boolean, isCenter?: boolean) => {
    const color = isCenter ? "white" : (active ? "#0071ce" : "#94a3b8");
    const size = isCenter ? 28 : 22;
    
    switch(label) {
      case 'Home': return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
      case 'Orders': return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 14h6" /><path d="M9 18h6" /><path d="M9 10h6" />
        </svg>
      );
      case 'Picking': return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
      case 'Support': return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 10h8" /><path d="M8 14h6" />
        </svg>
      );
      case 'Profile': return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      );
      default: return null;
    }
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-2 z-50 flex items-center justify-between shadow-lg">
      {navItems.map((item, index) => {
        const active = currentPath.startsWith(item.path);

        if (item.isCenter) {
          return (
            <div key={index} className="relative -top-5 flex flex-col items-center">
              <Link 
                to={item.path}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 cursor-pointer border-4 border-white bg-blue-600"
                style={{ 
                  background: 'linear-gradient(135deg, #0088f0 0%, #0071ce 100%)',
                }}
                aria-label="Order Picking"
              >
                {getIcon(item.label, active, true)}
              </Link>
              <span className={`text-[10px] mt-1 font-bold uppercase tracking-wider ${
                active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
              }`}>
                {item.label}
              </span>
            </div>
          );
        }

        return (
          <Link
            key={index}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all cursor-pointer ${
              active ? 'scale-105' : 'opacity-70 hover:opacity-100'
            }`}
          >
            {getIcon(item.label, active)}
            <span className={`text-[10px] font-bold tracking-tight ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
