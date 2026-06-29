import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Read user from localStorage synchronously at module load time.
// This means user is never null on first render if they're already logged in.
function readStoredUser() {
  try {
    const token = localStorage.getItem('mn_token')
    const raw   = localStorage.getItem('mn_user')
    if (token && raw) return JSON.parse(raw)
  } catch { /* corrupted data — ignore */ }
  return null
}

export function AuthProvider({ children }) {
  // Initialize directly from localStorage — no useEffect delay, no loading state
  const [user, setUser] = useState(() => readStoredUser())

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
    // loading is always false — user is known synchronously on first render
    <AuthContext.Provider value={{ user, loading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
