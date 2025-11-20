import { useEffect, useMemo, useState } from 'react'
import Hero from './components/Hero'
import Features from './components/Features'
import CTA from './components/CTA'
import Navbar from './components/Navbar'

function useI18n() {
  const [locale, setLocale] = useState('en')
  const [messages, setMessages] = useState({})

  useEffect(() => {
    const stored = localStorage.getItem('locale')
    if (stored) setLocale(stored)
  }, [])

  useEffect(() => {
    fetch((import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000') + `/i18n/${locale}`)
      .then((r) => r.json())
      .then(setMessages)
      .catch(() => setMessages({}))
  }, [locale])

  function t(key) {
    return messages[key] || key
  }

  return {
    locale,
    setLocale: (l) => { localStorage.setItem('locale', l); setLocale(l) },
    t,
  }
}

export default function App() {
  const i18n = useI18n()

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      <Navbar />
      <Hero />
      <main>
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{i18n.t('section_intro') || 'Build overlays with chat-powered widgets'}</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-70">Language</label>
            <select value={i18n.locale} onChange={(e)=> i18n.setLocale(e.target.value)} className="bg-transparent border border-slate-300 dark:border-white/20 rounded-lg px-2 py-1 text-sm">
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
        <Features t={i18n.t} />
        <CTA t={i18n.t} />
      </main>
      <footer className="py-10 text-center text-sm text-slate-600 dark:text-slate-400">© {new Date().getFullYear()} Overlay SaaS</footer>
    </div>
  )
}
