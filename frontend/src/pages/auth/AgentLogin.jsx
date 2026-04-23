import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function AgentLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/agent/login', form)
      login(data.token, { ...data.agent, role: 'agent' })
      navigate('/agent/dashboard')
    } catch (err) {
      setError(err.error || 'Invalid credentials')
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
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Agent login</h1>
          <p className="text-sm text-on-surface-variant mt-1">Sign in to your agent dashboard</p>
        </div>

        <div className="card p-6">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input required type="email" className="input-field" placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Password</label>
              <input required type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-4">
          Don't have an account?{' '}
          <Link to="/agents#apply" className="text-primary font-semibold hover:underline">Apply to become an agent</Link>
        </p>
        <p className="text-center text-sm text-on-surface-variant mt-2">
          <Link to="/admin/login" className="text-on-surface-variant hover:text-on-surface transition-colors text-xs">Admin login →</Link>
        </p>
      </div>
    </div>
  )
}
