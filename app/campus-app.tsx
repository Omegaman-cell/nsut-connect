"use client"
import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'

// The original React app uses browser preferences and the URL hash.
// Load it after hydration so those browser APIs never run on the server.
export default function CampusApp() {
  const [App, setApp] = useState<ComponentType | null>(null)
  useEffect(() => {
    import('../client/App.jsx').then((module) => setApp(() => module.default))
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')
  }, [])
  return App ? <App /> : <p className="loading-screen" role="status">Loading NSUT Connect…</p>
}
