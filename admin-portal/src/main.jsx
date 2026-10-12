import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAdminPWAUpdatePrompt } from './utils/updatePrompt.jsx'

// Register service worker with update toast prompt
initAdminPWAUpdatePrompt()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
