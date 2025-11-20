import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

function useBackend() {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
}

function useOverlayEditor(overlayId, token) {
  const baseUrl = useBackend()
  const [widgets, setWidgets] = useState([])
  const [overlayMeta, setOverlayMeta] = useState({ width: 1920, height: 1080 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const r = await fetch(`${baseUrl}/overlays/${overlayId}/widgets`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!r.ok) throw new Error((await r.json()).detail || 'Failed to load widgets')
      const data = await r.json()
      setWidgets(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const addWidget = async (type) => {
    const defaults = {
      text: {
        width: 400,
        height: 100,
        logic_config: { text: 'New text', align: 'left', fontSize: 36, color: '#ffffff' },
      },
      timer: {
        width: 300,
        height: 100,
        logic_config: { mode: 'countup', startSeconds: 0, color: '#ffffff' },
      },
    }
    const d = defaults[type] || { width: 300, height: 100, logic_config: {} }
    const body = {
      overlay_id: overlayId,
      type,
      x: 50,
      y: 50,
      width: d.width,
      height: d.height,
      z_index: widgets.length,
      logic_config: d.logic_config,
      cosmetic_overrides: {},
    }
    const r = await fetch(`${baseUrl}/widgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error((await r.json()).detail || 'Failed to create widget')
    const data = await r.json()
    setWidgets((prev) => [...prev, { id: data.id, ...body }])
  }

  const updateWidget = async (id, updates) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)))
    try {
      await fetch(`${baseUrl}/widgets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ widget_id: id, updates }),
      })
    } catch (e) {
      // ignore for MVP, optimistic update
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayId, token])

  return { widgets, setWidgets, overlayMeta, setOverlayMeta, loading, error, addWidget, updateWidget }
}

function WidgetNode({ widget, scale, onChange, onSelect, selected }) {
  const nodeRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const startRef = useRef({ x: 0, y: 0, w: 0, h: 0, left: 0, top: 0 })

  const left = Math.round(widget.x * scale)
  const top = Math.round(widget.y * scale)
  const width = Math.round(widget.width * scale)
  const height = Math.round(widget.height * scale)

  const onMouseDown = (e) => {
    onSelect(widget.id)
    if ((e.target).dataset.handle === 'resize') {
      setResizing(true)
    } else {
      setDragging(true)
    }
    startRef.current = { x: e.clientX, y: e.clientY, w: widget.width, h: widget.height, left: widget.x, top: widget.y }
    e.stopPropagation()
    e.preventDefault()
  }

  const onMouseMove = (e) => {
    if (!dragging && !resizing) return
    const dx = (e.clientX - startRef.current.x) / scale
    const dy = (e.clientY - startRef.current.y) / scale
    if (dragging) {
      onChange({ x: Math.max(0, Math.round(startRef.current.left + dx)), y: Math.max(0, Math.round(startRef.current.top + dy)) })
    }
    if (resizing) {
      onChange({ width: Math.max(40, Math.round(startRef.current.w + dx)), height: Math.max(30, Math.round(startRef.current.h + dy)) })
    }
  }

  const stopAll = () => { if (dragging || resizing) { setDragging(false); setResizing(false) } }

  useEffect(() => {
    const onUp = () => stopAll()
    const onMove = (e) => onMouseMove(e)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mousemove', onMove)
    return () => { window.removeEventListener('mouseup', onUp); window.removeEventListener('mousemove', onMove) }
  })

  return (
    <div
      ref={nodeRef}
      className={`absolute rounded-md border ${selected ? 'border-indigo-400 ring-2 ring-indigo-500/60' : 'border-white/40'}`}
      style={{ left, top, width, height, zIndex: widget.z_index || 0, userSelect: 'none', cursor: 'move' }}
      onMouseDown={onMouseDown}
    >
      <div className="w-full h-full bg-black/50 backdrop-blur-sm text-white p-2 overflow-hidden">
        {widget.type === 'text' && (
          <div style={{ fontSize: (widget.logic_config?.fontSize || 36) * scale, color: widget.logic_config?.color || '#fff', textAlign: widget.logic_config?.align || 'left' }}>
            {widget.logic_config?.text || 'Text'}
          </div>
        )}
        {widget.type === 'timer' && (
          <div className="w-full h-full flex items-center justify-center" style={{ fontSize: 36 * scale }}>
            ⏱ Timer
          </div>
        )}
      </div>
      <div data-handle="resize" className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-sm border border-black/20 cursor-se-resize" />
    </div>
  )
}

function EditorCanvas({ widgets, onWidgetChange, overlayMeta, onSelect, selectedId }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const resize = () => {
      const wrap = containerRef.current
      if (!wrap) return
      const { clientWidth, clientHeight } = wrap
      const sx = clientWidth / overlayMeta.width
      const sy = (clientHeight - 0) / overlayMeta.height
      const s = Math.min(sx, sy)
      setScale(s)
    }
    resize()
    const obs = new ResizeObserver(resize)
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [overlayMeta.width, overlayMeta.height])

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-auto" onMouseDown={() => onSelect(null)}>
      <div
        className="relative mx-auto"
        style={{ width: overlayMeta.width * scale, height: overlayMeta.height * scale, backgroundImage: 'linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)', backgroundSize: `${20 * scale}px ${20 * scale}px`, backgroundPosition: `0 0, 0 ${10 * scale}px, ${10 * scale}px -${10 * scale}px, -${10 * scale}px 0px` }}
      >
        {widgets.map((w) => (
          <WidgetNode key={w.id} widget={w} scale={scale} onChange={(u) => onWidgetChange(w.id, u)} onSelect={onSelect} selected={selectedId === w.id} />
        ))}
      </div>
    </div>
  )
}

export default function Editor() {
  const { token, loading } = useAuth()
  const overlayId = window.location.pathname.split('/').pop()
  const { widgets, overlayMeta, setOverlayMeta, loading: loadingData, error, addWidget, updateWidget } = useOverlayEditor(overlayId, token)

  useEffect(() => {
    if (!token && !loading) {
      window.location.href = '/login'
    }
  }, [token, loading])

  const [selectedId, setSelectedId] = useState(null)

  const selected = useMemo(() => widgets.find((w) => w.id === selectedId), [widgets, selectedId])

  const onWidgetChange = (id, updates) => {
    updateWidget(id, updates)
  }

  const changeSelectedConfig = (key, value) => {
    if (!selected) return
    const updated = { ...selected.logic_config, [key]: value }
    updateWidget(selected.id, { logic_config: updated })
  }

  return (
    <div className="w-screen h-screen grid grid-cols-[280px_1fr_320px] grid-rows-[56px_1fr] bg-slate-900 text-white">
      <header className="col-span-3 h-14 border-b border-white/10 flex items-center px-4 gap-3">
        <a href="/dashboard" className="text-sm text-slate-300 hover:text-white">← Back</a>
        <div className="font-semibold">Overlay Editor</div>
      </header>

      <aside className="border-r border-white/10 p-3 space-y-3">
        <div className="text-xs uppercase tracking-wide text-slate-400">Add widget</div>
        <button onClick={() => addWidget('text')} className="w-full px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500">Text</button>
        <button onClick={() => addWidget('timer')} className="w-full px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600">Timer</button>
        <div className="h-px bg-white/10 my-3" />
        <div className="text-xs uppercase tracking-wide text-slate-400">Canvas</div>
        <label className="block text-sm opacity-80 mb-1">Resolution</label>
        <div className="flex gap-2">
          <input type="number" className="w-20 bg-slate-800 border border-white/10 rounded px-2 py-1" value={overlayMeta.width} onChange={(e)=> setOverlayMeta((m)=> ({...m, width: parseInt(e.target.value||'0',10)||0}))} />
          <span className="opacity-60">×</span>
          <input type="number" className="w-20 bg-slate-800 border border-white/10 rounded px-2 py-1" value={overlayMeta.height} onChange={(e)=> setOverlayMeta((m)=> ({...m, height: parseInt(e.target.value||'0',10)||0}))} />
        </div>
        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
      </aside>

      <main className="relative">
        {loadingData ? (
          <div className="absolute inset-0 grid place-items-center text-slate-400">Loading…</div>
        ) : (
          <EditorCanvas widgets={widgets} onWidgetChange={onWidgetChange} overlayMeta={overlayMeta} onSelect={setSelectedId} selectedId={selectedId} />
        )}
      </main>

      <aside className="border-l border-white/10 p-3">
        <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Inspector</div>
        {!selected && <div className="text-slate-400 text-sm">Select a widget to edit its properties.</div>}
        {selected && (
          <div className="space-y-3">
            <div className="text-sm font-medium">{selected.type.toUpperCase()} widget</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="opacity-80">X<input type="number" className="mt-1 w-full bg-slate-800 border border-white/10 rounded px-2 py-1" value={selected.x} onChange={(e)=> onWidgetChange(selected.id, { x: parseInt(e.target.value||'0',10)||0 })} /></label>
              <label className="opacity-80">Y<input type="number" className="mt-1 w-full bg-slate-800 border border-white/10 rounded px-2 py-1" value={selected.y} onChange={(e)=> onWidgetChange(selected.id, { y: parseInt(e.target.value||'0',10)||0 })} /></label>
              <label className="opacity-80">W<input type="number" className="mt-1 w-full bg-slate-800 border border-white/10 rounded px-2 py-1" value={selected.width} onChange={(e)=> onWidgetChange(selected.id, { width: parseInt(e.target.value||'0',10)||0 })} /></label>
              <label className="opacity-80">H<input type="number" className="mt-1 w-full bg-slate-800 border border-white/10 rounded px-2 py-1" value={selected.height} onChange={(e)=> onWidgetChange(selected.id, { height: parseInt(e.target.value||'0',10)||0 })} /></label>
            </div>
            {selected.type === 'text' && (
              <div className="space-y-2 text-sm">
                <label className="block">Text<textarea className="mt-1 w-full bg-slate-800 border border-white/10 rounded px-2 py-1" rows={3} value={selected.logic_config?.text || ''} onChange={(e)=> changeSelectedConfig('text', e.target.value)} /></label>
                <label className="block">Font size<input type="number" className="mt-1 w-full bg-slate-800 border border-white/10 rounded px-2 py-1" value={selected.logic_config?.fontSize || 36} onChange={(e)=> changeSelectedConfig('fontSize', parseInt(e.target.value||'0',10)||0)} /></label>
                <label className="block">Color<input type="color" className="mt-1 w-full bg-slate-800 border border-white/10 rounded px-2 py-1" value={selected.logic_config?.color || '#ffffff'} onChange={(e)=> changeSelectedConfig('color', e.target.value)} /></label>
                <label className="block">Align<select className="mt-1 w-full bg-slate-800 border border-white/10 rounded px-2 py-1" value={selected.logic_config?.align || 'left'} onChange={(e)=> changeSelectedConfig('align', e.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}
