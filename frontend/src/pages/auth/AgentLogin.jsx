import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function AgentLogin() {
  const [form, setForm]             = useState({ email: '', password: '' })
  const [error, setError]           = useState('')
  const [pendingMsg, setPendingMsg] = useState('')
  const [loading, setLoading]       = useState(false)
  const { login }                   = useAuth()
  const navigate                    = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPendingMsg('')
    setLoading(true)
    try {
      const data = await api.post('/agent/login', form)
      login(data.token, { ...data.agent, role: 'agent' })
      navigate('/agent/dashboard', { replace: true })
    } catch (err) {
      // Backend sends code: 'ACCOUNT_PENDING' for unverified agents
      if (err.code === 'ACCOUNT_PENDING') {
        setPendingMsg(err.error)
      } else {
        setError(err.error || err.message || 'Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
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

        {/* ── Pending verification notice ── */}
        {pendingMsg && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-amber-600 text-[36px]">hourglass_top</span>
            </div>
            <h3 className="font-black text-amber-900 text-lg mb-2">
              Account Pending Verification
            </h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              {pendingMsg}
            </p>
            <button
              type="button"
              onClick={() => setPendingMsg('')}
              className="mt-5 text-xs font-semibold text-amber-700 hover:text-amber-900 hover:underline transition-colors"
            >
              ← Try a different account
            </button>
          </div>
        )}

        {/* ── Login form — hidden while pending notice is showing ── */}
        {!pendingMsg && (
          <div className="card p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-600 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  className="input-field"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  className="input-field"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 disabled:opacity-60"
              >
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in…
                    </span>
                  : 'Sign in'
                }
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-sm text-on-surface-variant mt-4">
          Don't have an account?{' '}
          <Link to="/agent/register" className="text-primary font-semibold hover:underline">
            Register as an agent
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link to="/admin/login" className="text-on-surface-variant hover:text-on-surface transition-colors text-xs">
            Admin login →
          </Link>
        </p>

      </div>
    </div>
  )
}
