import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

// CDN base for official crypto color SVG icons
const CDN = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/svg/color';

// Network definitions with real token icons
const NETWORKS = [
  { id: 'USDT (TRC20)', label: 'USDT', sub: 'TRC20',    color: '#26a17b', dbKey: 'usdt_address',       iconUrl: `${CDN}/usdt.svg` },
  { id: 'USDT (ERC20)', label: 'USDT', sub: 'ERC20',    color: '#627eea', dbKey: 'usdt_erc20_address',  iconUrl: `${CDN}/usdt.svg` },
  { id: 'BTC',          label: 'BTC',  sub: 'Bitcoin',   color: '#f7931a', dbKey: 'btc_address',         iconUrl: `${CDN}/btc.svg`  },
  { id: 'ETH',          label: 'ETH',  sub: 'Ethereum',  color: '#627eea', dbKey: 'eth_address',         iconUrl: `${CDN}/eth.svg`  },
  { id: 'BNB',          label: 'BNB',  sub: 'BEP20',     color: '#f3ba2f', dbKey: 'bnb_address',         iconUrl: `${CDN}/bnb.svg`  },
  { id: 'XRP',          label: 'XRP',  sub: 'Ripple',    color: '#00aae4', dbKey: 'xrp_address',         iconUrl: `${CDN}/xrp.svg`  },
  { id: 'SOL',          label: 'SOL',  sub: 'Solana',    color: '#9945ff', dbKey: 'sol_address',         iconUrl: `${CDN}/sol.svg`  },
  { id: 'DOGE',         label: 'DOGE', sub: 'Dogecoin',  color: '#c2a633', dbKey: 'doge_address',        iconUrl: `${CDN}/doge.svg` },
];

export default function Deposit({ addPendingDeposit }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedNet, setSelectedNet] = useState(NETWORKS[0]);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [showIntlModal, setShowIntlModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Crypto addresses from DB (keyed by dbKey)
  const [addresses, setAddresses] = useState({});

  // Computed current address
  const currentAddress = addresses[selectedNet.dbKey] || '';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('cb_deposit_settings')
          .select('*')
          .eq('id', 1)
          .single();
        if (!error && data) {
          setAddresses({
            usdt_address:       data.usdt_address       || '',
            usdt_erc20_address: data.usdt_erc20_address || '',
            btc_address:        data.btc_address        || '',
            eth_address:        data.eth_address        || '',
            bnb_address:        data.bnb_address        || '',
            xrp_address:        data.xrp_address        || '',
            sol_address:        data.sol_address        || '',
            doge_address:       data.doge_address       || '',
          });
        }
      } catch (err) {
        console.error('Error fetching deposit settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleCopy = () => {
    if (!currentAddress) return;
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      try {
        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const generatedName = `deposit-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${fileExt}`;
        const filePath = `deposits/${generatedName}`;

        const { error: uploadError } = await supabase.storage
          .from('cb_storage')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('cb_storage')
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;
        setFileUrl(publicUrl);
        toast.success('Receipt screenshot uploaded successfully!');
      } catch (err) {
        console.error('Error uploading receipt screenshot:', err);
        toast.error('Error uploading receipt: ' + err.message);
        setFileName('');
        setFileUrl('');
        e.target.value = '';
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast('Please enter a valid deposit amount.');
      return;
    }
    if (!fileUrl) {
      toast('Please upload a deposit receipt screenshot and wait for it to finish uploading.');
      return;
    }

    const sessionStr = localStorage.getItem('cb_user_session');
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    if (!session) {
      toast('User session not found. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const { data: users, error: userError } = await supabase
        .from('cb_users')
        .select('*')
        .eq('username', session.username);

      if (userError) {
        toast.error('Error retrieving profile: ' + userError.message);
        return;
      }

      const userProfile = users && users[0];

      const newRequest = {
        id: 'DEP-' + Math.floor(10000 + Math.random() * 90000),
        user_id: userProfile?.id || session.id,
        username: session.username,
        amount: parseFloat(amount),
        currency: selectedNet.id,
        screenshot_name: fileName,
        screenshot_url: fileUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
        status: 'Pending',
        created_at: new Date().toISOString(),
        referred_by_staff_id: userProfile?.referred_by_staff_id || null,
        member_of_admin_id: userProfile?.member_of_admin_id || null,
      };

      const { error: depositError } = await supabase
        .from('cb_deposits')
        .insert([newRequest]);

      if (depositError) {
        toast.error('Error submitting deposit: ' + depositError.message);
        return;
      }

      toast.success(`Deposit request of $${amount} submitted! Awaiting admin approval.`);
      navigate('/home');
    } catch (err) {
      toast.error('Failed to submit deposit: ' + err.message);
    }
  };

  return (
    <>
      <div className="deposit-page scale-up">
        {/* International Banking Modal */}
        {showIntlModal && (
          <div className="dep-modal-overlay" onClick={() => setShowIntlModal(false)}>
            <div className="dep-modal-box scale-up" onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌐</div>
              <h3 style={{ fontSize: 18, marginBottom: 10, color: 'var(--text-main)' }}>International Banking</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
                For international wire transfers and banking, connect with our financial department representative for fastest routing and processing.
              </p>
              <button
                className="submit-deposit-btn"
                style={{ margin: 0, width: '100%' }}
                onClick={() => navigate('/support')}
              >
                Connect to Representative
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="deposit-header">
          <div className="header-back-btn" onClick={() => navigate('/home')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </div>
          <span className="deposit-title">Deposit Funds</span>
          <div style={{ width: 40 }} />
        </div>

        <form onSubmit={handleSubmit} className="deposit-content">

          {/* Step 1: Network Selector */}
          <div className="deposit-card card">
            <h4 className="card-sec-title">1. Select Cryptocurrency & Network</h4>
            <div className="network-grid">
              {NETWORKS.map(net => (
                  <button
                  type="button"
                  key={net.id}
                  className={`net-tile ${selectedNet.id === net.id ? 'active' : ''}`}
                  style={selectedNet.id === net.id ? {
                    borderColor: net.color,
                    background: `${net.color}14`,
                    boxShadow: `0 0 0 2px ${net.color}30`,
                  } : {}}
                  onClick={() => setSelectedNet(net)}
                  id={`btn-net-${net.id.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
                >
                  <span className="net-icon">
                    <img
                      src={net.iconUrl}
                      alt={net.label}
                      width="28"
                      height="28"
                      style={{ display: 'block', borderRadius: '50%' }}
                      onError={e => { e.target.style.display='none'; }}
                    />
                  </span>
                  <span className="net-label" style={selectedNet.id === net.id ? { color: net.color } : {}}>
                    {net.label}
                  </span>
                  <span className="net-sub">{net.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Deposit Address + QR Code */}
          <div className="deposit-card card">
            <h4 className="card-sec-title">
              2. Send to {selectedNet.label} ({selectedNet.sub}) Address
            </h4>

            {currentAddress ? (
              <>
                <span className="pay-instruction-lbl">
                  Transfer exactly the amount to the official address below. Do not send any other cryptocurrency to this address.
                </span>

                {/* Address row */}
                <div className="address-copy-row">
                  <span className="address-txt-display">{currentAddress}</span>
                  <button
                    type="button"
                    className="copy-address-btn"
                    style={{ background: selectedNet.color }}
                    onClick={handleCopy}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>

                {/* Live QR Code */}
                <div className="qr-code-live">
                  <div className="qr-inner">
                    <QRCodeSVG
                      value={currentAddress}
                      size={160}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="qr-scan-hint">Scan QR code with your wallet app</p>
                </div>

                {/* Network warning */}
                <div className="network-warning-box" style={{ borderLeftColor: selectedNet.color }}>
                  <span>⚠️</span>
                  <span>
                    Only send <b>{selectedNet.label}</b> on the <b>{selectedNet.sub}</b> network to this address.
                    Sending the wrong asset will result in permanent loss.
                  </span>
                </div>
              </>
            ) : (
              <div className="no-address-notice">
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
                <p>The <b>{selectedNet.label} ({selectedNet.sub})</b> deposit address has not been configured yet.</p>
                <p style={{ fontSize: 11, marginTop: 6 }}>Please contact support or select a different network.</p>
              </div>
            )}
          </div>

          {/* Step 3: Amount */}
          <div className="deposit-card card">
            <h4 className="card-sec-title">3. Enter Deposit Amount (USD)</h4>
            <div className="amount-input-row">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                className="deposit-amount-input"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                id="txt-deposit-amount"
              />
            </div>
            <div className="amount-chips-row">
              {[50, 100, 500, 1000, 3000, 5000].map(val => (
                <button
                  type="button"
                  key={val}
                  className="amount-chip"
                  onClick={() => setAmount(val.toString())}
                >
                  +${val}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Screenshot Upload */}
          <div className="deposit-card card">
            <h4 className="card-sec-title">4. Upload Payment Receipt</h4>
            <span className="pay-instruction-lbl">
              Provide a screenshot of your completed transaction for node verification:
            </span>
            <div className="file-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden-file-input"
                id="file-screenshot"
                required
              />
              <label htmlFor="file-screenshot" className="file-upload-label">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>{uploading ? 'Uploading screenshot...' : (fileName || 'Choose screenshot image')}</span>
              </label>
            </div>
            {fileUrl && (
              <div className="screenshot-preview-box">
                <img src={fileUrl} alt="Receipt Preview" className="receipt-preview-img" />
              </div>
            )}
          </div>

          <button type="submit" className="submit-deposit-btn" id="btn-submit-deposit" disabled={uploading}>
            {uploading ? 'Uploading image...' : '✓ Confirm & Submit Deposit Request'}
          </button>

          <div style={{ margin: '4px 0 8px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            — OR —
          </div>

          <button
            type="button"
            className="intl-banking-btn"
            onClick={() => setShowIntlModal(true)}
          >
            🏦 International Bank Wire Transfer
          </button>
        </form>
      </div>

      <style>{`
        .deposit-page {
          display: flex;
          flex-direction: column;
          padding-bottom: 32px;
        }

        .deposit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 54px;
          padding: 0 16px;
          background-color: var(--bg-nav);
          border-bottom: var(--border-glass);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .deposit-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: 0.5px;
        }

        .deposit-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .deposit-card {
          animation: fadeInUp 0.3s ease both;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card-sec-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 14px;
          letter-spacing: 0.2px;
        }

        /* Network tile grid */
        .network-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .net-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 10px 4px;
          border-radius: 10px;
          border: 1.5px solid var(--border-glass);
          background: var(--bg-input);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .net-tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .net-tile.active {
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }

        .net-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 1px 3px rgba(0,0,0,0.15));
          transition: filter 0.2s ease, transform 0.2s ease;
        }

        .net-tile.active .net-icon {
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
          transform: scale(1.08);
        }

        .net-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-main);
        }

        .net-sub {
          font-size: 8px;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* Address section */
        .pay-instruction-lbl {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 10px;
          display: block;
          line-height: 1.5;
        }

        .address-copy-row {
          display: flex;
          align-items: center;
          background-color: var(--bg-input);
          border-radius: 8px;
          padding: 10px 12px;
          gap: 10px;
          margin-bottom: 16px;
          border: var(--border-glass);
        }

        .address-txt-display {
          font-size: 10px;
          color: var(--text-main);
          font-family: 'Courier New', monospace;
          word-break: break-all;
          flex: 1;
          line-height: 1.5;
        }

        .copy-address-btn {
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }

        .copy-address-btn:hover { opacity: 0.9; }

        /* QR Code */
        .qr-code-live {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 16px 0 8px;
        }

        .qr-inner {
          padding: 12px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.10);
          border: 1px solid rgba(0,0,0,0.06);
        }

        .qr-scan-hint {
          font-size: 11px;
          color: var(--text-muted);
          text-align: center;
        }

        /* Network warning */
        .network-warning-box {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          font-size: 11px;
          line-height: 1.5;
          color: var(--text-muted);
          background: rgba(239,68,68,0.04);
          border-left: 3px solid #ef4444;
          border-radius: 4px;
          padding: 10px 12px;
          margin-top: 8px;
        }

        /* No address configured */
        .no-address-notice {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 24px 16px;
          color: var(--text-muted);
          font-size: 13px;
          line-height: 1.6;
        }

        /* Amount */
        .amount-input-row {
          display: flex;
          align-items: center;
          background-color: var(--bg-input);
          border: var(--border-glass);
          border-radius: 8px;
          padding: 10px 14px;
          gap: 8px;
        }

        .currency-symbol {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .deposit-amount-input {
          flex: 1;
          font-size: 20px;
          font-weight: 700;
          background-color: transparent;
          color: var(--text-main);
          border: none;
          outline: none;
        }

        .amount-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .amount-chip {
          flex: 1;
          min-width: 56px;
          height: 32px;
          border-radius: 16px;
          border: var(--border-glass);
          background-color: var(--bg-input);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .amount-chip:active {
          border-color: var(--primary-color);
          color: var(--primary-color);
          background: var(--primary-light);
        }

        /* File upload */
        .file-upload-container { display: flex; flex-direction: column; }
        .hidden-file-input { display: none; }

        .file-upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 46px;
          border-radius: 8px;
          background-color: var(--bg-input);
          border: 1.5px dashed var(--primary-color);
          color: var(--primary-color);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .file-upload-label:hover {
          background-color: var(--primary-light);
        }

        .screenshot-preview-box {
          margin-top: 12px;
          display: flex;
          justify-content: center;
          border-radius: 8px;
          border: var(--border-glass);
          background-color: var(--bg-input);
          padding: 10px;
        }

        .receipt-preview-img {
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
          border-radius: 6px;
        }

        /* Submit button */
        .submit-deposit-btn {
          height: 50px;
          background: var(--primary-gradient);
          color: white;
          border-radius: 25px;
          font-size: 15px;
          font-weight: 700;
          box-shadow: 0 6px 20px rgba(0,113,206,0.25);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.3px;
        }

        .submit-deposit-btn:active { transform: scale(0.98); }

        .intl-banking-btn {
          width: 100%;
          height: 46px;
          border-radius: 23px;
          background-color: var(--bg-card);
          color: var(--text-muted);
          border: var(--border-glass);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }

        .intl-banking-btn:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        /* Modal */
        .dep-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }

        .dep-modal-box {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 28px 24px;
          text-align: center;
          max-width: 320px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          border: var(--border-luxury);
        }
      `}</style>
    </>
  );
}
