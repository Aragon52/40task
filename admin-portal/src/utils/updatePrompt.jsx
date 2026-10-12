import React from 'react';
import toast from 'react-hot-toast';
import { registerSW } from 'virtual:pwa-register';

// Unique toast identifier for Admin Portal
const ADMIN_TOAST_ID = 'admin-pwa-update-toast';

// Build ID injected at compile time by Vite
const CURRENT_BUILD_ID = typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'dev';

let updateServiceWorkerFn = null;
let swRegistration = null;
let toastShown = false;
let isRefreshing = false;

/**
 * Trigger immediate page refresh with active Service Worker transition.
 */
export async function triggerAdminAppRefresh() {
  if (isRefreshing) return;
  isRefreshing = true;

  toast.dismiss(ADMIN_TOAST_ID);

  try {
    if (typeof updateServiceWorkerFn === 'function') {
      await updateServiceWorkerFn(true);
    }
  } catch (err) {
    console.debug('Admin SW update trigger error:', err);
  }

  try {
    if (navigator.serviceWorker) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  } catch (err) {
    console.debug('Admin SW skipWaiting direct message error:', err);
  }

  let reloaded = false;
  const doReload = () => {
    if (!reloaded) {
      reloaded = true;
      window.location.reload();
    }
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', doReload, { once: true });
  }

  setTimeout(doReload, 350);
}

/**
 * Checks if a newer version has been deployed to Netlify.
 */
export async function checkAdminServerVersion() {
  if (toastShown || isRefreshing) return;
  if (typeof window === 'undefined') return;

  if (swRegistration) {
    try {
      await swRegistration.update();
    } catch (_) {}

    if (swRegistration.waiting) {
      showAdminUpdateNotification();
      return;
    }
  }

  try {
    const res = await fetch(`/version.json?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.buildId && CURRENT_BUILD_ID !== 'dev' && data.buildId !== 'dev') {
        if (data.buildId !== CURRENT_BUILD_ID) {
          showAdminUpdateNotification();
        }
      }
    }
  } catch (_) {}
}

/**
 * Display the non-intrusive update toast notification for Admin Portal.
 */
export function showAdminUpdateNotification() {
  if (toastShown || isRefreshing) return;
  toastShown = true;

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-slate-900 border border-indigo-500/30 shadow-2xl rounded-2xl pointer-events-auto flex items-center justify-between p-4 text-white gap-3 z-50`}
        style={{
          boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.4), 0 10px 15px -5px rgba(0, 0, 0, 0.2)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0 text-indigo-400">
            <svg className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Admin Portal Update</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </p>
            <p className="text-xs text-slate-300 truncate">
              A newer version has been deployed. Refresh to update.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => triggerAdminAppRefresh()}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            disabled={isRefreshing}
          >
            <svg className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors text-sm cursor-pointer"
            aria-label="Dismiss update notification"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    {
      id: ADMIN_TOAST_ID,
      duration: Infinity,
      position: 'top-center'
    }
  );
}

/**
 * Initializes the Admin PWA service worker updater.
 */
export function initAdminPWAUpdatePrompt() {
  if (typeof window === 'undefined') return;

  if (window.__admin_pwa_updater_initialized) return;
  window.__admin_pwa_updater_initialized = true;

  try {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        showAdminUpdateNotification();
      },
      onOfflineReady() {
        console.debug('Admin portal ready for offline caching.');
      },
      onRegisteredSW(swScriptUrl, registration) {
        swRegistration = registration;
        console.debug('Admin Service Worker registered:', swScriptUrl);

        if (registration && registration.waiting) {
          showAdminUpdateNotification();
        }
      },
      onRegisterError(error) {
        console.warn('Admin Service Worker registration skipped:', error);
      }
    });

    updateServiceWorkerFn = updateSW;
  } catch (err) {
    console.warn('Admin service worker registration skipped:', err);
  }

  setTimeout(() => {
    checkAdminServerVersion();
  }, 2000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkAdminServerVersion();
    }
  });

  window.addEventListener('focus', () => {
    checkAdminServerVersion();
  });

  const onFirstInteraction = () => {
    checkAdminServerVersion();
  };
  window.addEventListener('pointerdown', onFirstInteraction, { once: true, passive: true });

  setInterval(() => {
    if (document.hidden) return;
    checkAdminServerVersion();
  }, 60 * 1000);

  window.addEventListener('beforeunload', () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });
}
