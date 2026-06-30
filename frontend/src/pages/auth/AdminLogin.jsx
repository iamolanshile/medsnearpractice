import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [setupForm, setSetupForm] = useState({ email: '', password: '' })
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/admin/login', form)
      login(data.token, { role: 'admin', email: form.email, name: 'Admin' })
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleSetup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/admin/setup', setupForm)
      setMode('login')
      setForm({ email: setupForm.email, password: '' })
    } catch (err) {
      setError(err.error || 'Setup failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-black">M</span>
            </div>
            <span className="font-black text-primary text-xl tracking-tight">MedsNear</span>
          </Link>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">
            {mode === 'login' ? 'Admin login' : 'First time setup'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {mode === 'login' ? 'Sign in to the admin dashboard' : 'Create your admin credentials'}
          </p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span>{error}</span>
              </div>
              <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-red-600 shrink-0">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input required type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Password</label>
                <input required type="password" autoComplete="current-password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input required type="email" className="input-field" placeholder="admin@medsnear.com" value={setupForm.email} onChange={(e) => setSetupForm({ ...setupForm, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Password</label>
                <input required type="password" autoComplete="new-password" className="input-field" placeholder="Min 8 characters" value={setupForm.password} onChange={(e) => setSetupForm({ ...setupForm, password: e.target.value })} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-4">
          {mode === 'login' ? (
            <button onClick={() => { setMode('setup'); setError('') }} className="text-primary font-semibold hover:underline">First time? Create account</button>
          ) : (
            <button onClick={() => { setMode('login'); setError('') }} className="text-primary font-semibold hover:underline">Already have an account?</button>
          )}
        </p>
      </div>
    </div>
  )
}
