import React from 'react';
import toast from 'react-hot-toast';
import { registerSW } from 'virtual:pwa-register';

// Unique toast identifier to prevent duplicate banners
const TOAST_ID = 'pwa-update-toast';

// Build ID injected at compile time by Vite
const CURRENT_BUILD_ID = typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'dev';

let updateServiceWorkerFn = null;
let swRegistration = null;
let toastShown = false;
let isRefreshing = false;

/**
 * Trigger immediate page refresh with active Service Worker transition.
 */
export async function triggerAppRefresh() {
  if (isRefreshing) return;
  isRefreshing = true;

  // Dismiss toast banner immediately
  toast.dismiss(TOAST_ID);

  try {
    // 1. Tell Workbox to skip waiting
    if (typeof updateServiceWorkerFn === 'function') {
      await updateServiceWorkerFn(true);
    }
  } catch (err) {
    console.debug('Service worker updateSW trigger error:', err);
  }

  try {
    // 2. Direct message to waiting worker if present
    if (navigator.serviceWorker) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  } catch (err) {
    console.debug('Direct postMessage skip waiting error:', err);
  }

  // 3. Guarantee browser refresh
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

  // Guaranteed fallback reload
  setTimeout(doReload, 350);
}

/**
 * Checks if a newer version has been deployed to Netlify.
 * Only triggers if the server has a new build ID different from the currently running app.
 */
export async function checkServerVersion() {
  if (toastShown || isRefreshing) return;
  if (typeof window === 'undefined') return;

  // 1. Prompt service worker to check for new revision
  if (swRegistration) {
    try {
      await swRegistration.update();
    } catch (_) {}

    if (swRegistration.waiting) {
      showUpdateNotification();
      return;
    }
  }

  // 2. Query /version.json with no-store to check Netlify deploy status
  try {
    const res = await fetch(`/version.json?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.buildId && CURRENT_BUILD_ID !== 'dev' && data.buildId !== 'dev') {
        if (data.buildId !== CURRENT_BUILD_ID) {
          // A new version was deployed on Netlify, and user hasn't refreshed yet
          showUpdateNotification();
        }
      }
    }
  } catch (_) {
    // Network or offline check failure; fail silently
  }
}

/**
 * Display the non-intrusive update toast notification.
 */
export function showUpdateNotification() {
  if (toastShown || isRefreshing) return;
  toastShown = true;

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl pointer-events-auto flex items-center justify-between p-4 text-white gap-3 z-50`}
        style={{
          boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.4), 0 10px 15px -5px rgba(0, 0, 0, 0.2)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0 text-blue-400">
            <svg className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>New Update Available</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </p>
            <p className="text-xs text-slate-300 truncate">
              A newer version has been deployed. Refresh to update.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => triggerAppRefresh()}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
      id: TOAST_ID,
      duration: Infinity, // Keep visible until user refreshes or dismisses
      position: 'top-center'
    }
  );
}

/**
 * Initializes the PWA service worker updater with version detection.
 * The toast appears ONLY when an update is deployed from Netlify and the user hasn't refreshed.
 * After refreshing, it disappears.
 */
export function initPWAUpdatePrompt() {
  if (typeof window === 'undefined') return;

  // Prevent duplicate registration
  if (window.__pwa_updater_initialized) return;
  window.__pwa_updater_initialized = true;

  try {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        showUpdateNotification();
      },
      onOfflineReady() {
        console.debug('App is ready for offline usage.');
      },
      onRegisteredSW(swScriptUrl, registration) {
        swRegistration = registration;
        console.debug('Service Worker registered:', swScriptUrl);

        // If there's an existing waiting worker, notify user
        if (registration && registration.waiting) {
          showUpdateNotification();
        }
      },
      onRegisterError(error) {
        console.warn('Service Worker registration skipped:', error);
      }
    });

    updateServiceWorkerFn = updateSW;
  } catch (err) {
    console.warn('Service worker initialization skipped:', err);
  }

  // Check version shortly after initial page load (when user starts to use the app)
  setTimeout(() => {
    checkServerVersion();
  }, 2000);

  // Check when user returns to the tab or switches apps
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkServerVersion();
    }
  });

  // Check when window gains focus
  window.addEventListener('focus', () => {
    checkServerVersion();
  });

  // Check on first user interaction if page was already open
  const onFirstInteraction = () => {
    checkServerVersion();
  };
  window.addEventListener('pointerdown', onFirstInteraction, { once: true, passive: true });

  // Periodically check every 60 seconds while user is active
  setInterval(() => {
    if (document.hidden) return;
    checkServerVersion();
  }, 60 * 1000);

  // If the user manually refreshes via browser reload (F5 / mobile reload),
  // activate the waiting service worker during unload so upon reload it starts fresh
  window.addEventListener('beforeunload', () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });
}
