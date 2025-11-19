import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAuthToken } from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  const login = ({ token: t, user: u }) => {
    // Persist immediately to avoid a brief race where components
    // (like SavedJobs) read localStorage for the token before
    // React's effects have run and the token was written.
    try {
      if (t) localStorage.setItem('token', t)
      if (u) localStorage.setItem('user', JSON.stringify(u))
    } catch (e) {
      // ignore storage errors in environments where localStorage isn't available
    }

    // Also update the api module's in-memory token so API helpers use
    // the context-provided token immediately instead of reading localStorage.
    try { setAuthToken(t) } catch (e) { /* ignore in case import fails during tests */ }

    setToken(t)
    setUser(u)
  }

  const logout = () => {
    // Clear both in-memory and persisted tokens
    try { setAuthToken(null) } catch (e) { /* ignore */ }
    setToken(null)
    setUser(null)
    navigate('/signIn')
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
