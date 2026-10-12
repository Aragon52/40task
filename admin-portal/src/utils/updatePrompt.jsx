import { registerSW } from 'virtual:pwa-register';

let updateServiceWorkerFn = null;

/**
 * Trigger immediate admin page refresh.
 */
export async function triggerAdminAppRefresh() {
  try {
    if (typeof updateServiceWorkerFn === 'function') {
      await updateServiceWorkerFn(true);
    }
  } catch (err) {
    console.debug('Admin SW update trigger error:', err);
  }
  window.location.reload();
}

/**
 * Silent version check helper for Admin Portal.
 */
export async function checkAdminServerVersion() {
  // Silent check without intrusive UI popups
}

/**
 * Initializes the Admin PWA service worker with silent background auto-updates.
 */
export function initAdminPWAUpdatePrompt() {
  if (typeof window === 'undefined') return;

  if (window.__admin_pwa_updater_initialized) return;
  window.__admin_pwa_updater_initialized = true;

  try {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        if (typeof updateSW === 'function') {
          updateSW(true).catch(() => {});
        }
      },
      onOfflineReady() {
        console.debug('Admin portal ready for offline caching.');
      },
      onRegisteredSW(swScriptUrl, registration) {
        if (registration) {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          setInterval(() => {
            registration.update().catch(() => {});
          }, 60 * 60 * 1000);
        }
      },
      onRegisterError(error) {
        console.debug('Admin Service Worker registration skipped:', error);
      }
    });

    updateServiceWorkerFn = updateSW;
  } catch (err) {
    console.debug('Admin service worker initialization skipped:', err);
  }
}
