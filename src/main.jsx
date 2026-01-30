import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { ArchitecturePage } from './pages/ArchitecturePage'
import './index.css'

// On GitHub Pages (e.g. /repo-name/architecture), basename must be /repo-name
function getBasename() {
  const base = import.meta.env.BASE_URL || './'
  if (base !== './' && base !== '/') return base.replace(/\/$/, '')
  const segs = window.location.pathname.split('/').filter(Boolean)
  return segs.length ? '/' + segs[0] : ''
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
