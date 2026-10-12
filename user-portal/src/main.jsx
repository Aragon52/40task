import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initPWAUpdatePrompt } from './utils/updatePrompt.jsx'

// Redirect immediately if user-portal was requested on an admin subdomain
try {
  const host = (window.location.hostname || '').toLowerCase();
  const path = window.location.pathname || '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const isAdminHost = host.startsWith('admin.') || host.startsWith('admin-') || host.includes('admin.walmark-retailshop.com');
  if (isAdminHost && !isLocal) {
    if (path !== '/admin.html' && !path.startsWith('/admin')) {
      window.location.replace('/admin.html' + window.location.search + window.location.hash);
    }
  }
} catch (e) {}

// Register service worker with non-intrusive update prompt
initPWAUpdatePrompt()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
