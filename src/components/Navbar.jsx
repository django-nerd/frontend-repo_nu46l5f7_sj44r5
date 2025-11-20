import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export default function Navbar() {
  const [theme, setTheme] = useState('dark')
  const { token, user, signout } = useAuth()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/60 dark:bg-slate-950/60 border-b border-slate-200/60 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="/" className="font-bold text-slate-900 dark:text-white">Twitch Overlay</a>
        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          {token ? (
            <div className="flex items-center gap-2">
              <a href="/dashboard" className="text-sm px-3 py-1.5 rounded-lg border">Dashboard</a>
              <a href="/connections" className="text-sm px-3 py-1.5 rounded-lg border">Connections</a>
              <span className="text-sm text-slate-600">{user?.email}</span>
              <button onClick={signout} className="text-sm px-3 py-1.5 rounded-lg bg-red-600 text-white">Sign out</button>
            </div>
          ) : (
            <a href="/login" className="text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white">Sign in</a>
          )}
        </div>
      </div>
    </header>
  )
}
