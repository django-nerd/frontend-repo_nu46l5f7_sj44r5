import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

function useBackend() {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
}

export default function Dashboard() {
  const { token, user, signout, loading } = useAuth()
  const baseUrl = useBackend()
  const [overlays, setOverlays] = useState([])
  const [newName, setNewName] = useState('My Overlay')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch(`${baseUrl}/overlays`, { headers: { Authorization: `Bearer ${token}` }})
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('Failed to load overlays'))))
      .then(setOverlays)
      .catch(e => setError(e.message))
  }, [token, baseUrl])

  const createOverlay = async () => {
    setBusy(true)
    setError('')
    try {
      const r = await fetch(`${baseUrl}/overlays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName, width: 1920, height: 1080 })
      })
      if (!r.ok) throw new Error((await r.json()).detail || 'Unable to create overlay')
      const data = await r.json()
      setOverlays((prev) => [...prev, { id: data.id, name: newName }])
      setNewName('My Overlay')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (!token && !loading) {
    window.location.href = '/login'
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="font-semibold">Your overlays</div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <button onClick={signout} className="text-sm px-3 py-1.5 rounded-lg border">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="flex gap-2">
            <input value={newName} onChange={(e)=>setNewName(e.target.value)} className="flex-1 border rounded-lg px-3"/>
            <button disabled={busy} onClick={createOverlay} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create</button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {overlays.map((o) => (
            <div key={o.id} className="bg-white rounded-xl border p-4">
              <div className="font-medium mb-2">{o.name || 'Untitled Overlay'}</div>
              <div className="flex gap-2">
                <a className="px-3 py-1.5 rounded-lg border" href={`/editor/${o.id}`}>Open editor</a>
              </div>
            </div>
          ))}
          {overlays.length === 0 && (
            <div className="col-span-full text-center text-slate-500">No overlays yet. Create your first one above.</div>
          )}
        </div>
      </main>
    </div>
  )
}
