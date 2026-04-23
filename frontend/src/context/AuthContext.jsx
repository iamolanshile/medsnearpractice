import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('mn_token')
    const userData = localStorage.getItem('mn_user')
    if (token && userData) {
      try { setUser(JSON.parse(userData)) } catch { /* ignore */ }
    }
    setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('mn_token', token)
    localStorage.setItem('mn_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('mn_token')
    localStorage.removeItem('mn_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
