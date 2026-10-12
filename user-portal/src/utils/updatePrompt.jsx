import { registerSW } from 'virtual:pwa-register';

let updateServiceWorkerFn = null;

/**
 * Trigger immediate page refresh.
 */
export async function triggerAppRefresh() {
  try {
    if (typeof updateServiceWorkerFn === 'function') {
      await updateServiceWorkerFn(true);
    }
  } catch (err) {
    console.debug('Service worker updateSW error:', err);
  }
  window.location.reload();
}

/**
 * Silent version check helper (no popup toasts).
 */
export async function checkServerVersion() {
  // Silent check without intrusive UI popups
}

/**
 * Initializes the PWA service worker with silent background auto-updates.
 */
export function initPWAUpdatePrompt() {
  if (typeof window === 'undefined') return;

  if (window.__pwa_updater_initialized) return;
  window.__pwa_updater_initialized = true;

  try {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        // Auto-update service worker silently without nagging user with endless popups
        if (typeof updateSW === 'function') {
          updateSW(true).catch(() => {});
        }
      },
      onOfflineReady() {
        console.debug('App ready for offline usage.');
      },
      onRegisteredSW(swScriptUrl, registration) {
        if (registration) {
          // If a waiting worker exists, activate it immediately
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          // Periodically check for updates silently
          setInterval(() => {
            registration.update().catch(() => {});
          }, 60 * 60 * 1000);
        }
      },
      onRegisterError(error) {
        console.debug('Service worker registration skipped:', error);
      }
    });

    updateServiceWorkerFn = updateSW;
  } catch (err) {
    console.debug('Service worker initialization skipped:', err);
  }
}
