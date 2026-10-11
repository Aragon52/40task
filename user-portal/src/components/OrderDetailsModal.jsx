import React from 'react';

export default function OrderDetailsModal({ order, balance = 0, onClose, onSubmit, onCancel }) {
  if (!order) return null;

  const isPending = order.status === 'Pending';
  const userBalance = parseFloat(balance || 0);
  const orderPrice = parseFloat(order.price || 0);
  const isBalanceSufficient = userBalance >= orderPrice;
  const differenceAmount = orderPrice - userBalance;
  const showDifference = isPending && !isBalanceSufficient;

  return (
    <div className="modal-overlay-user">
      <div className="modal-content-card-user scale-up-user">
        <div className="modal-header-user">
          <span className="modal-title-user">Order Details</span>
          <button className="modal-close-btn-user" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body-user">
          {/* Product row info */}
          <div className="product-info-row-user">
            <div className="product-image-container-user">
              {order.image ? (
                <img src={order.image} alt={order.title} className="product-img-user" />
              ) : (
                <div className="prod-img-placeholder-user">📦</div>
              )}
            </div>
            <div className="product-details-col-user">
              <span className="product-name-user">{order.title}</span>
              <span className="product-qty-user">x1</span>
              <span className="product-price-user">$ {parseFloat(order.price).toFixed(2)}</span>
            </div>
          </div>

          {/* Table information grid */}
          <div className="info-grid-user">
            <div className="info-row-user">
              <span className="info-lbl-user">Order grabbing time</span>
              <span className="info-val-user">{order.timestamp || new Date().toLocaleString()}</span>
            </div>
            
            {!isPending && order.id && (
              <div className="info-row-user">
                <span className="info-lbl-user">Order number</span>
                <span className="info-val-user" style={{ fontFamily: 'monospace', fontSize: 11 }}>
                  VP{order.id}
                </span>
              </div>
            )}

            <div className="info-row-user">
              <span className="info-lbl-user">Order amount</span>
              <span className="info-val-user font-bold-user">$ {parseFloat(order.price).toFixed(2)}</span>
            </div>

            <div className="info-row-user">
              <span className="info-lbl-user">Commission</span>
              <span className="info-val-user font-bold-user highlight-commission-user">
                $ {parseFloat(order.profit).toFixed(2)}
              </span>
            </div>

            {showDifference && (
              <div className="info-row-user difference-box-user" style={{ marginTop: '8px', padding: '10px 12px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span className="info-lbl-user" style={{ color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Difference Amount
                  </span>
                  <span className="info-val-user font-bold-user" style={{ color: '#ef4444', fontSize: '13px' }}>
                    $ {differenceAmount.toFixed(2)}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#ef4444', opacity: 0.85, textAlign: 'left', width: '100%', lineHeight: '1.3' }}>
                  Your wallet balance is insufficient. Please deposit $ {differenceAmount.toFixed(2)} to proceed.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer-user">
          {isPending ? (
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button 
                className="modal-action-btn-user"
                onClick={onCancel || onClose}
                style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                Cancel
              </button>
              <button 
                className="modal-action-btn-user btn-submit-user"
                onClick={() => onSubmit(order.id, order.price, order.profit)}
                style={{ flex: 1 }}
              >
                Confirm
              </button>
            </div>
          ) : (
            <button 
              className="modal-action-btn-user btn-completed-user" 
              disabled
            >
              Completed
            </button>
          )}
        </div>
      </div>

      <style>{`
        .modal-overlay-user {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 10000;
        }

        .modal-content-card-user {
          background-color: var(--bg-card);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 20px;
          width: 100%;
          max-width: 380px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
        }

        .scale-up-user {
          animation: scaleUpUser 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes scaleUpUser {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .modal-header-user {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          height: 52px;
          padding: 0 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .modal-title-user {
          font-size: 14px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .modal-close-btn-user {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          font-size: 11px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .modal-close-btn-user:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: scale(1.05);
        }

        .modal-body-user {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .product-info-row-user {
          display: flex;
          gap: 12px;
          background-color: rgba(0, 0, 0, 0.015);
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .product-image-container-user {
          width: 72px;
          height: 72px;
          border-radius: 10px;
          overflow: hidden;
          background-color: white;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0,0,0,0.04);
        }

        .product-img-user {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 4px;
        }

        .prod-img-placeholder-user {
          font-size: 30px;
        }

        .product-details-col-user {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
          min-width: 0;
        }

        .product-name-user {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-main);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-qty-user {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .product-price-user {
          font-size: 14px;
          font-weight: 800;
          color: var(--primary-color);
        }

        .info-grid-user {
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-top: 1px solid rgba(0,0,0,0.03);
          padding-top: 16px;
        }

        .info-row-user {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .info-lbl-user {
          color: var(--text-muted);
          font-weight: 500;
        }

        .info-val-user {
          color: var(--text-main);
          font-weight: 600;
        }

        .font-bold-user {
          font-weight: 700;
        }

        .highlight-commission-user {
          color: #10b981;
          font-weight: 800;
        }

        .modal-footer-user {
          padding: 0 20px 20px 20px;
        }

        .modal-action-btn-user {
          width: 100%;
          height: 44px;
          border-radius: 22px;
          font-size: 14px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-submit-user {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(3, 105, 161, 0.3);
          position: relative;
          overflow: hidden;
        }

        .btn-submit-user::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          transition: all 0.75s ease;
        }

        .btn-submit-user:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(3, 105, 161, 0.4);
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        }

        .btn-submit-user:hover::before {
          left: 125%;
        }

        .btn-submit-user:active {
          transform: translateY(1px);
          box-shadow: 0 2px 8px rgba(3, 105, 161, 0.3);
        }

        .btn-completed-user {
          background-color: #cbd5e1;
          color: #64748b;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
