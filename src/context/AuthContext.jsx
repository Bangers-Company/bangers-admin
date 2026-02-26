import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { authApi } from '@/api/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const userData = await authApi.me()
      setUser(userData.data || userData)
      localStorage.setItem('user', JSON.stringify(userData.data || userData))
    } catch (error) {
      console.error('Auth check failed', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
    checkAuth()
  }, [checkAuth])

  const login = useCallback(async (credentials, options = {}) => {
    const response = await authApi.login(credentials, options)
    const userData = response.user || response.data?.user || response
    setUser(userData)
    return response
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth
  }), [user, loading, login, logout, checkAuth])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
