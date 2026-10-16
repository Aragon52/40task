import React from 'react';
import LanguageSwitcher from './LanguageSwitcher.tsx';

interface HeaderProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export default function Header({ currentTheme, onThemeChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 flex items-center justify-between shadow-xs">
      <div className="flex items-center">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/40 rounded-xl">
          <span className="font-extrabold text-sm text-sky-600 dark:text-sky-400 tracking-tight">Walmart</span>
          <span className="flex items-center">
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

      <div className="flex items-center gap-3">
        <button 
          onClick={() => onThemeChange(currentTheme === 'orange' ? 'red' : 'orange')}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          title="Toggle theme Classic / Modern"
        >
          <span className={`w-2 h-2 rounded-full ${currentTheme === 'orange' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-sky-500 shadow-[0_0_8px_#0284c7]'}`} />
          <span className="uppercase text-[10px] tracking-wider">{currentTheme === 'orange' ? 'Classic' : 'Modern'}</span>
        </button>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
