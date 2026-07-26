import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authAPI.getProfile()
        .then(res => setUser(res.data))
        .catch(() => { localStorage.clear(); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await authAPI.login(credentials)
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    setUser(res.data.user)
    return res.data
  }, [])

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data)
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    setUser(res.data.user)
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await authAPI.logout({ refresh })
    } catch {}
    localStorage.clear()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await authAPI.getProfile()
    setUser(res.data)
    return res.data
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
