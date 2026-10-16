import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { initAdminPWAUpdatePrompt } from './utils/updatePrompt.ts';

document.title = 'Order Picking Platform - Admin Portal';

// Register service worker
initAdminPWAUpdatePrompt();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
