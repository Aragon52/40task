import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  const navItems = [
    {
      label: 'Home',
      path: '/home',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      label: 'Orders',
      path: '/orders',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 14h6" />
          <path d="M9 18h6" />
          <path d="M9 10h6" />
        </svg>
      )
    },
    {
      label: '',
      path: '/match',
      isCenter: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="center-svg">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h9" />
          <path d="M15 14h5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5" />
          <path d="M14 6h2a2 2 0 0 1 2 2v2" />
          <circle cx="9" cy="11" r="2" />
          <path d="M10.5 14.5a3 3 0 0 0-3 0" />
          {/* Gesture click finger representation */}
          <path d="M12 22a4 4 0 0 0 4-4v-4a2 2 0 0 0-4 0v4H9" strokeWidth="2.5" stroke="var(--text-white)" />
        </svg>
      )
    },
    {
      label: 'Support',
      path: '/support',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    }
  ];

  return (
    <>
      <div className="bottom-nav-container">
        {navItems.map((item, index) => {
          if (item.isCenter) {
            return (
              <button 
                key={index} 
                className={`center-nav-btn ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                id="btn-nav-match"
              >
                <div className="center-btn-inner">
                  {/* Premium matching layered node icon */}
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 9l10 7 10-7-10-7z"/>
                    <path d="M2 17l10 5 10-5M2 13l10 5 10-5"/>
                  </svg>
                </div>
              </button>
            );
          }

          return (
            <button
              key={index}
              className={`nav-btn ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              id={`btn-nav-${item.label.toLowerCase()}`}
            >
              <div className="nav-btn-icon">{item.icon}</div>
              <span className="nav-btn-label">{item.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .bottom-nav-container {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 100%;
          height: 68px;
          background-color: var(--bg-card);
          display: flex;
          justify-content: space-around;
          align-items: center;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          z-index: 1000;
          padding: 0 10px;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.03);
        }

        @media (min-width: 768px) {
          .bottom-nav-container {
            max-width: 1024px;
          }
        }

        .nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 100%;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 500;
          gap: 4px;
        }

        .nav-btn.active {
          color: var(--primary-color);
        }

        .nav-svg {
          width: 22px;
          height: 22px;
          transition: var(--transition-fast);
        }

        .nav-btn.active .nav-svg {
          transform: translateY(-2px);
          stroke: var(--primary-color);
        }

        .center-nav-btn {
          position: relative;
          width: 66px;
          height: 66px;
          margin-top: -30px;
          z-index: 1001;
        }

        .center-btn-inner {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--primary-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-white);
          box-shadow: var(--shadow-lg), 0 0 0 6px var(--bg-app);
          transition: var(--transition-fast);
        }

        .center-nav-btn:active .center-btn-inner {
          transform: scale(0.9) translateY(2px);
        }

        .center-btn-inner svg {
          stroke: var(--text-white);
          animation: fingerPulse 2.5s infinite;
        }

        @keyframes fingerPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </>
  );
}
