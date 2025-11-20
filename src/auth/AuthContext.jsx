import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

function getBackendUrl() {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)
  const baseUrl = getBackendUrl()

  useEffect(() => {
    if (!token) return
    setLoading(true)
    fetch(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load profile'))))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [token, baseUrl])

  const signin = async (email, password) => {
    const r = await fetch(`${baseUrl}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!r.ok) throw new Error((await r.json()).detail || 'Invalid credentials')
    const data = await r.json()
    localStorage.setItem('auth_token', data.token)
    setToken(data.token)
    return data
  }

  const signup = async (email, password) => {
    const r = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!r.ok) throw new Error((await r.json()).detail || 'Sign up failed')
    const data = await r.json()
    localStorage.setItem('auth_token', data.token)
    setToken(data.token)
    return data
  }

  const signout = () => {
    localStorage.removeItem('auth_token')
    setToken('')
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, loading, signin, signup, signout }), [token, user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
