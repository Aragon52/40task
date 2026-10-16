import { registerSW } from 'virtual:pwa-register';

let updateServiceWorkerFn: ((reloadPage?: boolean) => Promise<void>) | null = null;

declare global {
  interface Window {
    __pwa_updater_initialized?: boolean;
  }
}

/**
 * Trigger immediate page refresh.
 */
export async function triggerAppRefresh(): Promise<void> {
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
export async function checkServerVersion(): Promise<void> {
  // Silent check without intrusive UI popups
}

/**
 * Initializes the PWA service worker with silent background auto-updates.
 */
export function initPWAUpdatePrompt(): void {
  if (typeof window === 'undefined') return;

  if (window.__pwa_updater_initialized) return;
  window.__pwa_updater_initialized = true;

  try {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        if (typeof updateSW === 'function') {
          updateSW(true).catch(() => {});
        }
      },
      onOfflineReady() {
        console.debug('App ready for offline usage.');
      },
      onRegisteredSW(_swScriptUrl: string, registration?: ServiceWorkerRegistration) {
        if (registration) {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          setInterval(() => {
            registration.update().catch(() => {});
          }, 60 * 60 * 1000);
        }
      },
      onRegisterError(error: unknown) {
        console.debug('Service worker registration skipped:', error);
      }
    });

    updateServiceWorkerFn = updateSW;
  } catch (err) {
    console.debug('Service worker initialization skipped:', err);
  }
}
