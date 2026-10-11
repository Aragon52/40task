import React, { createContext, useContext, useState, useEffect } from 'react';

const LoadingContext = createContext({
  isLoading: false,
  skeletonType: 'general',
  showLoading: (type) => {},
  hideLoading: () => {},
  performAsync: async (fn, type) => {}
});

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [skeletonType, setSkeletonType] = useState('general');
  const [timeoutId, setTimeoutId] = useState(null);

  const showLoading = (type = 'general') => {
    setSkeletonType(type);
    setIsLoading(true);

    // Escape hatch safety to prevent permanent lockouts
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => {
      setIsLoading(false);
    }, 6000); // Max 6s
    setTimeoutId(id);
  };

  const hideLoading = () => {
    setIsLoading(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const performAsync = async (fn, type = 'general') => {
    showLoading(type);
    try {
      const result = await fn();
      return result;
    } finally {
      // Small intentional delay to let the user appreciate the stunning shimmer screen transition
      setTimeout(() => {
        hideLoading();
      }, 400);
    }
  };

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (
    <LoadingContext.Provider value={{ isLoading, skeletonType, showLoading, hideLoading, performAsync }}>
      {children}
      {isLoading && <GlobalLoader type={skeletonType} />}
    </LoadingContext.Provider>
  );
}

function GlobalLoader({ type }) {
  return (
    <div className="skeleton-overlay-container">
      <div className="skeleton-screen-wrapper">
        
        {/* Floating loading caption */}
        <div className="skeleton-status-card">
          <div className="skeleton-spinner"></div>
          <span className="skeleton-status-text">Fetching live database...</span>
        </div>

        {/* Dynamic Skeleton Presets */}
        {type === 'home' && (
          <div className="skeleton-view">
            {/* Header placeholder */}
            <div className="skeleton-header-row">
              <div className="skeleton-logo-box shimmer"></div>
              <div className="skeleton-circle-avatar shimmer"></div>
            </div>

            {/* Huge Balance Card placeholder */}
            <div className="skeleton-balance-card shimmer-parent">
              <div className="skeleton-text-line w-1/3 h-4 shimmer"></div>
              <div className="skeleton-text-line w-2/3 h-10 mt-3 shimmer"></div>
              <div className="skeleton-text-line w-1/4 h-3 mt-2 shimmer"></div>
            </div>

            {/* Quick Action Button placeholder */}
            <div className="skeleton-btn-bar shimmer"></div>

            {/* Grid layout placeholder */}
            <div className="skeleton-grid-row">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-grid-col">
                  <div className="skeleton-grid-sq shimmer"></div>
                  <div className="skeleton-text-line w-12 h-3 mt-2 shimmer"></div>
                </div>
              ))}
            </div>

            {/* Earnings Boxes placeholder */}
            <div className="skeleton-header-row">
              <div className="skeleton-text-line w-1/4 h-4 shimmer"></div>
            </div>
            <div className="skeleton-earnings-row">
              <div className="skeleton-earnings-box shimmer"></div>
              <div className="skeleton-earnings-box shimmer"></div>
            </div>
          </div>
        )}

        {type === 'orders' && (
          <div className="skeleton-view">
            {/* Title bar placeholder */}
            <div className="skeleton-header-row justify-between">
              <div className="skeleton-circle-icon shimmer"></div>
              <div className="skeleton-text-line w-24 h-5 shimmer"></div>
              <div className="skeleton-circle-icon shimmer"></div>
            </div>

            {/* Tab pill indicators */}
            <div className="skeleton-tab-row">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-tab-pill shimmer"></div>
              ))}
            </div>

            {/* List records placeholder */}
            <div className="skeleton-list">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-card-item shimmer-parent">
                  <div className="skeleton-card-header">
                    <div className="skeleton-text-line w-24 h-3 shimmer"></div>
                    <div className="skeleton-badge-pill shimmer"></div>
                  </div>
                  <div className="skeleton-card-body">
                    <div className="skeleton-sq shimmer"></div>
                    <div className="skeleton-col w-full">
                      <div className="skeleton-text-line w-3/4 h-4 shimmer"></div>
                      <div className="skeleton-text-line w-1/2 h-3 mt-2 shimmer"></div>
                      <div className="skeleton-text-line w-1/3 h-4 mt-3 shimmer"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'match' && (
          <div className="skeleton-view">
            {/* Balance banner */}
            <div className="skeleton-card-item shimmer-parent">
              <div className="skeleton-card-header justify-between">
                <div>
                  <div className="skeleton-text-line w-20 h-3 shimmer"></div>
                  <div className="skeleton-text-line w-32 h-6 mt-2 shimmer"></div>
                </div>
                <div className="skeleton-circle-icon shimmer"></div>
              </div>
            </div>

            {/* Large circle progress / Slot machine shape */}
            <div className="skeleton-match-circle shimmer-parent">
              <div className="skeleton-inner-circle shimmer"></div>
            </div>

            {/* Large button block */}
            <div className="skeleton-btn-bar shimmer"></div>

            {/* Report Grid columns */}
            <div className="skeleton-grid-row">
              {[1, 2].map(i => (
                <div key={i} className="skeleton-earnings-box shimmer"></div>
              ))}
            </div>
          </div>
        )}

        {type === 'general' && (
          <div className="skeleton-view">
            <div className="skeleton-header-row justify-between">
              <div className="skeleton-logo-box shimmer"></div>
              <div className="skeleton-circle-avatar shimmer"></div>
            </div>
            
            <div className="skeleton-list">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-card-item shimmer-parent">
                  <div className="skeleton-card-body">
                    <div className="skeleton-sq shimmer"></div>
                    <div className="skeleton-col w-full">
                      <div className="skeleton-text-line w-full h-4 shimmer"></div>
                      <div className="skeleton-text-line w-5/6 h-3 mt-2 shimmer"></div>
                      <div className="skeleton-text-line w-1/2 h-3 mt-1 shimmer"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <style>{`
        .skeleton-overlay-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000000;
          background-color: rgba(248, 250, 252, 0.82); /* Warm, slate off-white light mode overlay */
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 40px;
          overflow-y: auto;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* Support Red theme and Dark overlay elements if active */
        .theme-red .skeleton-overlay-container {
          background-color: rgba(254, 242, 242, 0.85); /* Slightly pinkish off-white for red theme */
        }

        .skeleton-screen-wrapper {
          width: 100%;
          max-width: 420px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-sizing: border-box;
          animation: skeletonFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .skeleton-status-card {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          padding: 8px 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.04);
          margin: 0 auto;
        }

        .skeleton-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0, 113, 206, 0.15);
          border-top-color: #0071ce;
          border-radius: 50%;
          animation: skeletonSpin 0.75s infinite linear;
        }

        .skeleton-status-text {
          font-size: 11px;
          font-weight: 700;
          color: rgba(0, 113, 206, 0.85);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .skeleton-view {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        /* Shimmer Animation Effect */
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.04) 25%,
            rgba(0, 0, 0, 0.09) 50%,
            rgba(0, 0, 0, 0.04) 75%
          );
          background-size: 200% 100%;
          animation: skeletonShimmer 1.4s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }

        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes skeletonSpin {
          100% { transform: rotate(360deg); }
        }

        @keyframes skeletonFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Custom Skeletons Components */
        .skeleton-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .skeleton-logo-box {
          height: 28px;
          width: 100px;
          border-radius: 8px;
        }

        .skeleton-circle-avatar {
          height: 36px;
          width: 36px;
          border-radius: 50%;
        }

        .skeleton-circle-icon {
          height: 32px;
          width: 32px;
          border-radius: 50%;
        }

        .skeleton-balance-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.03);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.01);
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          position: relative;
        }

        .skeleton-text-line {
          border-radius: 4px;
        }

        .w-1\/3 { width: 33.333%; }
        .w-2\/3 { width: 66.666%; }
        .w-1\/4 { width: 25%; }
        .w-1\/2 { width: 50%; }
        .w-3\/4 { width: 75%; }
        .w-1\/3 { width: 33.333%; }
        .w-full { width: 100%; }
        .h-3 { height: 12px; }
        .h-4 { height: 16px; }
        .h-5 { height: 20px; }
        .h-10 { height: 40px; }
        .mt-1 { margin-top: 4px; }
        .mt-2 { margin-top: 8px; }
        .mt-3 { margin-top: 12px; }

        .skeleton-btn-bar {
          height: 48px;
          border-radius: 24px;
          width: 100%;
        }

        .skeleton-grid-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          width: 100%;
        }

        .skeleton-grid-col {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .skeleton-grid-sq {
          width: 48px;
          height: 48px;
          border-radius: 12px;
        }

        .skeleton-earnings-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
        }

        .skeleton-earnings-box {
          height: 64px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.03);
          border-radius: 12px;
        }

        .skeleton-tab-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          width: 100%;
        }

        .skeleton-tab-pill {
          height: 32px;
          border-radius: 16px;
        }

        .skeleton-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .skeleton-card-item {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.03);
          border-radius: 14px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .skeleton-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .skeleton-badge-pill {
          width: 60px;
          height: 18px;
          border-radius: 9px;
        }

        .skeleton-card-body {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .skeleton-sq {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .skeleton-col {
          display: flex;
          flex-direction: column;
        }

        .skeleton-match-circle {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 10px auto;
        }

        .skeleton-inner-circle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
