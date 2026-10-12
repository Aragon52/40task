import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAdminPWAUpdatePrompt } from './utils/updatePrompt.jsx'

document.title = 'Order Picking Platform - Admin Portal';

// Register service worker
initAdminPWAUpdatePrompt()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
