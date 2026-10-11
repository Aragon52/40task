import React, { useEffect, useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ currentTheme, onThemeChange }) {
  return (
    <>
      <div className="header-bar-custom">
        <div className="header-left">
          {/* Logo container */}
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

        <div className="header-right">
          {/* Theme toggler */}
          <button 
            className="theme-toggle-pill"
            onClick={() => onThemeChange(currentTheme === 'orange' ? 'red' : 'orange')}
            title="Toggle theme Classic / Modern Blue"
            id="btn-toggle-theme"
          >
            <span className={`pill-indicator ${currentTheme}`}></span>
            <span className="pill-text">{currentTheme === 'orange' ? 'Classic' : 'Modern'}</span>
          </button>

          {/* Connected Translation Switcher for 67 regions */}
          <LanguageSwitcher />
        </div>
      </div>

      <style>{`
        .header-bar-custom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 60px;
          padding: 0 16px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .logo-badge-walmart {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 113, 206, 0.04);
          padding: 6px 12px;
          border-radius: 12px;
          border: 1px solid rgba(0, 113, 206, 0.08);
          transition: all 0.2s;
        }

        .logo-badge-walmart:hover {
          background: rgba(0, 113, 206, 0.07);
          transform: translateY(-0.5px);
        }

        .header-bar-custom .logo-text-walmart {
          font-size: 15px;
          font-weight: 800;
          color: #0071ce !important;
          letter-spacing: -0.2px;
        }

        .logo-spark-walmart {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: logoRotate 12s linear infinite;
        }

        @keyframes logoRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .theme-toggle-pill {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.03);
          padding: 6px 12px;
          border-radius: 12px;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid rgba(0, 0, 0, 0.03);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .theme-toggle-pill:hover {
          background: rgba(0, 0, 0, 0.05);
          transform: scale(1.02);
        }

        .theme-toggle-pill:active {
          transform: scale(0.96);
        }

        .pill-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: background-color 0.3s;
        }

        .pill-indicator.orange {
          background-color: #f59e0b; /* Gold indicator */
          box-shadow: 0 0 8px #f59e0b;
        }

        .pill-indicator.red {
          background-color: #0071ce; /* Blue indicator */
          box-shadow: 0 0 8px #0071ce;
        }

        .pill-text {
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .country-flag {
          display: flex;
          align-items: center;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          opacity: 0.95;
          border: 1px solid rgba(0,0,0,0.02);
          transition: all 0.2s;
        }

        .country-flag:hover {
          transform: scale(1.05);
          opacity: 1;
        }
      `}</style>
    </>
  );
}
