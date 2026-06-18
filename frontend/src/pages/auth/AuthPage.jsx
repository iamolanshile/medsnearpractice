import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AuthPage() {
  const location = useLocation()
  const { login } = useAuth()
  const [tab, setTab] = useState('signin')
  const [selectedRole, setSelectedRole] = useState('customer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const returnPath = location.state?.from || '/search'

  useEffect(() => {
    if (location.pathname === '/signup') {
      setTab('signup')
    } else {
      setTab('signin')
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-surface">
      <div className="min-h-screen md:flex">
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
              <p className="mt-6 text-lg leading-8 text-primary-fixed max-w-lg">
                Bridging the gap between pharmacies and patients with speed, security, and professional excellence.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 shadow-2xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBs38SF-K4DikwrK9PK7l7CRZzTlSME7KGnBhLst1aQ_Vkkf1YQe3Ow_ULBbqXwGV_u0b64cVp5xuijttEEzHKu2849L6TCym8mDaSU5A9X6usNVAjqyyiWZgTPc7ZxgzKQY1iIYdgT-0j0ATG1clBf5yF7QEAaoAXz8joCEk82B7jivUMjPH_PhSE0aFopNKW4fD8dz-hfxVZQXYsRoZKr7OFb9hq4NruomVbJ2-gMNYSWIW2H244rmXM-AUab0_V1g80BQ4ce0fM"
                alt="Pharmacy illustration"
                className="h-72 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
            </div>
          </div>
          <footer className="absolute bottom-6 left-10 text-white/60 font-label-sm text-label-sm">
            © 2026 MedsNear. Trusted by over 500+ Local Pharmacies.
          </footer>
        </section>

        <main className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10 lg:px-16 bg-surface">
          <div className="w-full max-w-[520px]">
            <div className="md:hidden mb-8 flex items-center justify-between px-4 py-4 bg-primary text-white rounded-3xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  medical_services
                </span>
                <span className="font-bold text-lg">MedsNear</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex gap-8 border-b border-outline-variant mb-8">
                <button
                  type="button"
                  className={`pb-2 font-label-md text-label-md transition-all ${tab === 'signin' ? 'tab-active' : 'tab-inactive'}`}
                  onClick={() => navigate('/signin')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`pb-2 font-label-md text-label-md transition-all ${tab === 'signup' ? 'tab-active' : 'tab-inactive'}`}
                  onClick={() => navigate('/signup')}
                >
                  Create Account
                </button>
              </div>

              {tab === 'signin' ? (
                <div className="bg-white rounded-[32px] border border-outline-variant p-8 shadow-sm">
                  <header className="mb-6">
                    <h2 className="font-headline-md text-headline-md text-on-surface">Welcome back</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Access your healthcare portal.</p>
                  </header>

                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 border border-outline px-4 py-3 rounded-xl font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors mb-6"
                    onClick={() => navigate('/agent/login')}
                  >
                    <img
                      alt="Google"
                      className="w-5 h-5"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-WiiBXnXFKIcqDd_30dF59BknM0F5Eo_bc1oTjDP7Dy2Ns0WLjFy2k7drHhFJK6O9pywuA0-BVUbZjBZiTsXa9eufvmoIyr5YNQr_2KqS60Wl7-_5paNVeTGy4LrWIUXUyF1UU65_FKgkyUDHf8rPW2r29Uwv2_9Uh24TVp6xk_rhBSXKHw6mkcK2wDb15YTLdH5K8gUCf3gnC1RobgcKzR9bMBzxsRORvUGotPcAlQs1j5lx7dektztdxPVSKZrhokpMO1c_4kQ"
                    />
                    Continue with Google
                  </button>

                  <div className="relative flex items-center gap-4 mb-6">
                    <div className="flex-grow border-t border-outline-variant"></div>
                    <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest">OR EMAIL</span>
                    <div className="flex-grow border-t border-outline-variant"></div>
                  </div>

                  <form className="space-y-4" onSubmit={(event) => {
                      event.preventDefault()
                      login('dummy_token', { name: 'James O.', role: 'customer' })
                      navigate(returnPath, { replace: true, state: location.state })
                    }}>
                    <div>
                      <label htmlFor="signin-email" className="block font-label-md text-label-md text-on-surface mb-1.5">Email Address</label>
                      <input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="name@pharmacy.com.ng"
                        className="w-full border border-outline rounded-xl px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="signin-password" className="block font-label-md text-label-md text-on-surface">Password</label>
                        <Link to="/agent/login" className="text-primary font-label-sm text-label-sm hover:underline">Forgot password?</Link>
                      </div>
                      <input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        className="w-full border border-outline rounded-xl px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-14 bg-primary text-white rounded-xl font-label-md text-label-md font-bold shadow-sm hover:bg-primary-container active:scale-[0.98] transition-all"
                    >
                      Sign In
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-[32px] border border-outline-variant p-8 shadow-sm">
                  <header className="mb-6">
                    <h2 className="font-headline-md text-headline-md text-on-surface">Join the Network</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Sign up to access professional healthcare logistics services.</p>
                  </header>

                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 border border-outline px-4 py-3 rounded-xl font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors mb-6"
                  >
                    <svg fill="none" height="20" viewBox="0 0 48 48" width="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M47.532 24.5528C47.532 22.8886 47.396 21.2819 47.1463 19.7417H24.3994V28.9889H37.3694C36.8111 32.0039 35.1102 34.5583 32.5542 36.2647V42.2744H40.3514C44.9089 38.0822 47.532 31.8928 47.532 24.5528Z" fill="#4285F4"></path>
                      <path d="M24.3994 48.0001C30.8808 48.0001 36.3119 45.8598 40.3541 42.2745L32.5569 36.2648C30.3953 37.7126 27.6436 38.5639 24.3994 38.5639C18.1569 38.5639 12.8711 34.3417 10.9789 28.6501H2.94922V34.8723C6.91366 42.7423 15.0162 48.0001 24.3994 48.0001Z" fill="#34A853"></path>
                      <path d="M10.9764 28.6501C10.4792 23.1612 10.4792 17.5833 10.9764 12.0944V5.87219H2.94678C1.049 9.65831 0.0527344 13.8889 0.0527344 18.2223C0.0527344 22.5557 1.049 26.7863 2.94678 30.5724L10.9764 28.6501Z" fill="#FBBC04"></path>
                      <path d="M24.3994 9.43611C27.8464 9.40111 31.1719 10.7111 33.65 13.0917L40.5161 6.225C36.1642 2.16917 30.3953 -0.0522222 24.3994 0C15.0162 0 6.91366 5.25778 2.94922 13.1278L10.9789 19.35C12.8711 13.6583 18.1569 9.43611 24.3994 9.43611Z" fill="#EA4335"></path>
                    </svg>
                    Continue with Google
                  </button>

                  <div className="relative flex items-center mb-8">
                    <div className="flex-grow border-t border-outline-variant"></div>
                    <span className="mx-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">OR EMAIL</span>
                    <div className="flex-grow border-t border-outline-variant"></div>
                  </div>

                  <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                    <div>
                      <label htmlFor="full_name" className="block font-label-md text-label-md text-on-surface mb-1.5">Full Name</label>
                      <input
                        id="full_name"
                        type="text"
                        placeholder="John Doe"
                        className="w-full border border-outline rounded-xl px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="signup-email" className="block font-label-md text-label-md text-on-surface mb-1.5">Email Address</label>
                      <input
                        id="signup-email"
                        type="email"
                        placeholder="john@example.com"
                        className="w-full border border-outline rounded-xl px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="signup-phone" className="block font-label-md text-label-md text-on-surface mb-1.5">Phone Number</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 pr-3 text-on-surface-variant border-r border-outline-variant">
                          +234
                        </div>
                        <input
                          id="signup-phone"
                          type="tel"
                          placeholder="8012345678"
                          className="w-full h-12 pl-20 pr-4 border border-outline rounded-xl text-body-md focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-3">I am a...</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className={`h-12 rounded-xl border font-label-md text-label-md flex items-center justify-center gap-2 transition-all ${selectedRole === 'customer' ? 'border-primary bg-primary text-white' : 'border-outline text-on-surface-variant bg-white hover:bg-surface'}`}
                          onClick={() => setSelectedRole('customer')}
                        >
                          <span className="material-symbols-outlined">person</span>
                          Customer
                        </button>
                        <button
                          type="button"
                          className={`h-12 rounded-xl border font-label-md text-label-md flex items-center justify-center gap-2 transition-all ${selectedRole === 'agent' ? 'border-primary bg-primary text-white' : 'border-outline text-on-surface-variant bg-white hover:bg-surface'}`}
                          onClick={() => setSelectedRole('agent')}
                        >
                          <span className="material-symbols-outlined">delivery_dining</span>
                          Agent
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="signup-password" className="block font-label-md text-label-md text-on-surface mb-1.5">Password</label>
                      <div className="relative">
                        <input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          className="w-full border border-outline rounded-xl px-4 py-3 pr-12 text-body-md focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all"
                        />
                        <button type="button" className="absolute inset-y-0 right-4 flex items-center text-on-surface-variant">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </div>
                      <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">Must be at least 8 characters long.</p>
                    </div>
                    <button
                      type="submit"
                      className="w-full h-14 bg-primary text-white rounded-xl font-label-md text-label-md font-bold shadow-md hover:bg-primary-container active:scale-[0.98] transition-all"
                    >
                      Create Account
                    </button>
                  </form>
                </div>
              )}
            </div>

            <p className="text-center text-on-surface-variant font-label-sm text-label-sm px-4">
              By continuing, you agree to MedsNear's{' '}
              <Link to="/" className="text-primary font-bold hover:underline">Terms of Service</Link> and{' '}
              <Link to="/" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
