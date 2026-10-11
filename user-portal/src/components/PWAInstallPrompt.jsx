import React, { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already running in standalone/installed mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return;
    }

    // Check if user dismissed the prompt recently
    const isDismissed = localStorage.getItem('cb_pwa_dismissed') === 'true';
    if (isDismissed) {
      return;
    }

    // Setup iOS check
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    // If there's an existing stashed prompt
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
      // Stagger slightly for a better entrance experience
      const timer = setTimeout(() => setShowPrompt(true), 1500);
      return () => clearTimeout(timer);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      // Stash the event
      window.deferredPrompt = e;
      setDeferredPrompt(e);
      // Show prompt
      const timer = setTimeout(() => setShowPrompt(true), 1500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for custom activation event from Profile or other pages
    const handleForceShow = () => {
      setShowPrompt(true);
    };
    window.addEventListener('pwa-force-show-prompt', handleForceShow);

    // iOS Safari auto-promotion
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('pwa-force-show-prompt', handleForceShow);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show the browser install prompt
    deferredPrompt.prompt();
    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    // Clear deferredPrompt
    window.deferredPrompt = null;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('cb_pwa_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <>
      <div className="pwa-prompt-overlay" onClick={() => setShowPrompt(false)}>
        <div className="pwa-prompt-card scale-up" onClick={(e) => e.stopPropagation()}>
          <button className="pwa-close-btn" onClick={handleDismiss} title="Dismiss">✕</button>
          
          <div className="pwa-header">
            <div className="pwa-icon-container">
              <img 
                src="/icon-192.png" 
                alt="Walmart App Icon" 
                className="pwa-app-icon"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="pwa-title-container">
              <span className="pwa-app-title">Walmart App</span>
              <span className="pwa-app-rating">4.9 ★★★★★ (120K+ reviews)</span>
              <span className="pwa-app-meta">Fast • Secure • Official PWA</span>
            </div>
          </div>

          <div className="pwa-body">
            <p className="pwa-description">
              Install the official Walmart application on your device for lightning-fast order matching, push alerts, and optimal secure routing.
            </p>

            {isIOS ? (
              <div className="pwa-ios-instructions">
                <span className="ios-step-title">How to Install on iPhone / iPad:</span>
                <ol className="ios-steps">
                  <li>
                    Tap the <strong>Share</strong> button <span className="ios-share-icon">📤</span> in Safari.
                  </li>
                  <li>
                    Scroll down and select <strong>Add to Home Screen</strong> <span className="ios-add-icon">➕</span>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> in the top right corner to install.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="pwa-actions">
                <button className="pwa-btn-secondary" onClick={handleDismiss}>
                  Later
                </button>
                <button className="pwa-btn-primary" onClick={handleInstallClick} id="btn-pwa-install-now">
                  Install Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .pwa-prompt-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 10000;
          padding: 16px;
          animation: pwaFadeIn 0.3s ease;
        }

        .pwa-prompt-card {
          width: 100%;
          max-width: 440px;
          background: var(--bg-card, #ffffff);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 113, 206, 0.1);
          padding: 20px;
          position: relative;
          margin-bottom: env(safe-area-inset-bottom, 0px);
          transform-origin: bottom center;
          animation: pwaSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pwa-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.04);
          border: none;
          color: var(--text-muted, #666);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 11px;
          font-weight: bold;
          transition: background 0.2s;
        }

        .pwa-close-btn:hover {
          background: rgba(0, 0, 0, 0.08);
          color: var(--text-main, #111);
        }

        .pwa-header {
          display: flex;
          gap: 14px;
          align-items: center;
          margin-bottom: 14px;
        }

        .pwa-icon-container {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 113, 206, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.05);
          background: #ffffff;
          flex-shrink: 0;
        }

        .pwa-app-icon {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pwa-title-container {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pwa-app-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-main, #111);
          letter-spacing: -0.3px;
        }

        .pwa-app-rating {
          font-size: 11px;
          color: #f59e0b;
          font-weight: 600;
        }

        .pwa-app-meta {
          font-size: 10px;
          color: var(--text-muted, #777);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }

        .pwa-description {
          font-size: 13px;
          line-height: 1.45;
          color: var(--text-muted, #444);
          margin-bottom: 16px;
        }

        .pwa-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 12px;
        }

        .pwa-btn-secondary {
          padding: 10px 16px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.05);
          color: var(--text-muted, #555);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pwa-btn-secondary:hover {
          background: rgba(0, 0, 0, 0.06);
        }

        .pwa-btn-primary {
          padding: 10px 20px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          border: none;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(3, 105, 161, 0.25);
          transition: all 0.2s;
        }

        .pwa-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(3, 105, 161, 0.35);
        }

        .pwa-btn-primary:active {
          transform: translateY(0);
        }

        /* iOS Specific Style instructions */
        .pwa-ios-instructions {
          background: rgba(0, 113, 206, 0.03);
          border: 1px dashed rgba(0, 113, 206, 0.2);
          border-radius: 12px;
          padding: 12px 14px;
          margin-top: 4px;
        }

        .ios-step-title {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #0071ce;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .ios-steps {
          margin: 0;
          padding-left: 18px;
          font-size: 12.5px;
          color: var(--text-main, #222);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ios-steps li {
          line-height: 1.4;
        }

        .ios-share-icon, .ios-add-icon {
          display: inline-block;
          font-size: 14px;
          vertical-align: middle;
          margin: 0 2px;
        }

        @keyframes pwaFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pwaSlideUp {
          from { transform: translateY(100px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
