import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initPWAUpdatePrompt } from './utils/updatePrompt.jsx'

document.title = 'Order Picking Platform';

// Register service worker
initPWAUpdatePrompt()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
