import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function AuthPage() {
  const location = useLocation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const returnPath = location.state?.from || '/search'

  const [tab, setTab] = useState(location.pathname === '/signup' ? 'signup' : 'signin')

  // Sign-in state
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // Sign-up state
  const [signupName, setSignupName]             = useState('')
  const [signupEmail, setSignupEmail]           = useState('')
  const [signupPhone, setSignupPhone]           = useState('')
  const [signupPassword, setSignupPassword]     = useState('')
  const [signupError, setSignupError]           = useState('')
  const [signupLoading, setSignupLoading]       = useState(false)

  // Keep tab in sync when URL changes
  useEffect(() => {
    setTab(location.pathname === '/signup' ? 'signup' : 'signin')
  }, [location.pathname])

  // Where to land after login based on role
  const redirectForRole = (role) => {
    if (role === 'agent') return '/agent/dashboard'
    if (role === 'admin') return '/admin/dashboard'
    return returnPath
  }

  // Sign-in: call /api/customers/login
  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/customers/login', { email, password })
      login(data.token, { ...data.user, role: 'customer' })
      navigate(redirectForRole(data.user.role), { replace: true })
    } catch (err) {
      setError(err.error || err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  // Sign-up: call /api/customers/register
  const handleSignUp = async (e) => {
    e.preventDefault()
    setSignupError('')
    setSignupLoading(true)
    try {
      const data = await api.post('/customers/register', {
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
      })
      login(data.token, { ...data.user, role: 'customer' })
      navigate(redirectForRole(data.user.role), { replace: true })
    } catch (err) {
      setSignupError(err.error || err.message || 'Registration failed. Please try again.')
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="min-h-screen md:flex">

        {/* ── Left panel ── */}
        <section className="hidden md:flex md:w-1/2 bg-primary text-white p-10 lg:p-16 relative overflow-hidden">
          <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-white/10 shadow-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  medical_services
                </span>
              </div>
              <span className="text-sm uppercase tracking-[0.32em] text-primary-container font-semibold">MedsNear</span>
            </div>
            <div>
              <h1 className="text-5xl font-black leading-tight tracking-tight">Reliable Healthcare Logistics for Nigeria</h1>
              <p className="mt-6 text-lg leading-8 text-white/80 max-w-lg">
                Bridging the gap between pharmacies and patients with speed, security, and professional excellence.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 shadow-2xl">
              {/* Pharmacy illustration — CSS gradient replaces external image to avoid tracking-prevention warnings */}
              <div
                className="h-72 w-full flex items-end justify-center"
                style={{ background: 'linear-gradient(135deg, #003a73 0%, #005232 50%, #006d44 100%)' }}
              >
                <div className="flex items-center gap-8 pb-8 opacity-80">
                  {['medication', 'local_pharmacy', 'vaccines'].map((icon) => (
                    <div key={icon} className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                      <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <footer className="absolute bottom-6 left-10 text-white/60 text-xs">
            © 2026 MedsNear. Trusted by over 500+ Local Pharmacies.
          </footer>
        </section>

        {/* ── Right panel ── */}
        <main className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10 lg:px-16 bg-surface">
          <div className="w-full max-w-[520px]">

            {/* Mobile brand */}
            <div className="md:hidden mb-8 flex items-center gap-3 px-4 py-4 bg-primary text-white rounded-3xl shadow-sm">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
              <span className="font-bold text-lg">MedsNear</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-outline/30 mb-8">
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className={`pb-3 text-sm font-semibold transition-all ${tab === 'signin' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className={`pb-3 text-sm font-semibold transition-all ${tab === 'signup' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Create Account
              </button>
            </div>

            {/* ── Sign In ── */}
            {tab === 'signin' && (
              <div className="bg-white rounded-[32px] border border-outline/30 p-8 shadow-sm">
                <header className="mb-6">
                  <h2 className="text-2xl font-black text-on-surface">Welcome back</h2>
                  <p className="text-sm text-on-surface-variant mt-1">Access your healthcare portal.</p>
                </header>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label htmlFor="signin-email" className="block text-sm font-semibold text-on-surface mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="signin-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full border border-outline rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="signin-password" className="block text-sm font-semibold text-on-surface">
                        Password
                      </label>
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      id="signin-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-outline rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>
                </form>

                <div className="mt-6 text-center space-y-2">
                  <p className="text-xs text-on-surface-variant">
                    Are you an agent?{' '}
                    <Link to="/agent/login" className="text-primary font-semibold hover:underline">
                      Agent login →
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* ── Sign Up ── */}
            {tab === 'signup' && (
              <div className="bg-white rounded-[32px] border border-outline/30 p-8 shadow-sm">
                <header className="mb-6">
                  <h2 className="text-2xl font-black text-on-surface">Join the Network</h2>
                  <p className="text-sm text-on-surface-variant mt-1">Sign up to order medications near you.</p>
                </header>

                {signupError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
                    {signupError}
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label htmlFor="signup-name" className="block text-sm font-semibold text-on-surface mb-1.5">Full Name</label>
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full border border-outline rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-email" className="block text-sm font-semibold text-on-surface mb-1.5">Email Address</label>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full border border-outline rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-phone" className="block text-sm font-semibold text-on-surface mb-1.5">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 border border-r-0 border-outline rounded-l-xl text-sm text-on-surface-variant bg-surface-low">
                        +234
                      </span>
                      <input
                        id="signup-phone"
                        type="tel"
                        required
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="8012345678"
                        className="flex-1 border border-outline rounded-r-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-semibold text-on-surface mb-1.5">Password</label>
                    <input
                      id="signup-password"
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full border border-outline rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full h-14 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {signupLoading ? 'Creating account…' : 'Create Account'}
                  </button>
                </form>

                <p className="mt-6 text-center text-xs text-on-surface-variant">
                  Want to deliver?{' '}
                  <Link to="/agent/register" className="text-primary font-semibold hover:underline">
                    Apply as an agent →
                  </Link>
                </p>
              </div>
            )}

            <p className="text-center text-on-surface-variant text-xs mt-6 px-4">
              By continuing, you agree to MedsNear's{' '}
              <Link to="/" className="text-primary font-semibold hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/" className="text-primary font-semibold hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
