import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River',
  'Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina',
  'Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara']

export default function AgentRegister() {
  const [step, setStep]     = useState(1)
  const [form, setForm]     = useState({
    name: '', email: '', phone: '',
    state: '', lga: '', region: '',
    password: '', confirm: '',
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim())  return 'Full name is required.'
      if (!form.email.trim()) return 'Email address is required.'
      if (!form.phone.trim()) return 'Phone number is required.'
    }
    if (step === 2) {
      if (!form.state) return 'Please select your state.'
      if (!form.lga.trim()) return 'LGA / area is required.'
    }
    if (step === 3) {
      if (form.password.length < 8) return 'Password must be at least 8 characters.'
      if (form.password !== form.confirm) return 'Passwords do not match.'
    }
    return null
  }

  const handleNext = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep((s) => s + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/agent/register', {
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        phone:    form.phone.trim(),
        state:    form.state,
        lga:      form.lga.trim(),
        region:   form.region.trim() || `${form.lga}, ${form.state}`,
        password: form.password,
      })
      // Registration creates a pending account — show success, don't auto-login
      setStep('done')
    } catch (err) {
      setError(err.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const STEPS = ['Personal Info', 'Location', 'Credentials']

  // ── Registration success screen ──
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl border border-outline/30 p-10 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-amber-600 text-[44px]">hourglass_top</span>
            </div>
            <h2 className="text-2xl font-black text-on-surface mb-3">Registration Submitted!</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-2">
              Thank you, <span className="font-semibold text-on-surface">{form.name}</span>.
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Your agent account is <span className="font-semibold text-amber-700">pending verification</span>.
              An admin will review your application and activate your account.
              Please check back later to sign in.
            </p>

            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">What happens next?</p>
              {[
                'Our admin team reviews your registration',
                'You receive confirmation once approved',
                'Sign in and start uploading inventory',
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-amber-800">{s}</p>
                </div>
              ))}
            </div>

            <Link
              to="/agent/login"
              className="mt-8 btn-primary w-full justify-center py-3 inline-flex"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-base">M</span>
          </div>
          <div>
            <p className="font-black text-primary text-base leading-none">MedsNear</p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Agent Registration</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => {
            const n = i + 1
            const done    = n < step
            const active  = n === step
            return (
              <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                  done ? 'bg-primary text-white' : active ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-surface-high text-on-surface-variant'
                }`}>
                  {done
                    ? <span className="material-symbols-outlined text-[14px]">check</span>
                    : n
                  }
                </div>
                <span className={`text-xs font-semibold truncate ${active ? 'text-on-surface' : 'text-on-surface-variant/60'}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full ${n < step ? 'bg-primary' : 'bg-surface-high'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-outline/30 p-7 shadow-sm">
          <h2 className="text-xl font-black text-on-surface mb-1">{STEPS[step - 1]}</h2>
          <p className="text-sm text-on-surface-variant mb-6">
            {step === 1 && 'Tell us who you are.'}
            {step === 2 && 'Where will you be operating?'}
            {step === 3 && 'Secure your account.'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>{error}
            </div>
          )}

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }} className="space-y-4">

            {/* Step 1 — Personal */}
            {step === 1 && (
              <>
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" required value={form.name} onChange={set('name')}
                    placeholder="Amara Okafor" className="input-field" />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" required value={form.email} onChange={set('email')}
                    placeholder="amara@email.com" className="input-field" />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-outline rounded-l-xl text-sm text-on-surface-variant bg-surface-low">+234</span>
                    <input type="tel" required value={form.phone} onChange={set('phone')}
                      placeholder="8012345678"
                      className="flex-1 border border-outline rounded-r-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white outline-none transition-all" />
                  </div>
                </div>
              </>
            )}

            {/* Step 2 — Location */}
            {step === 2 && (
              <>
                <div>
                  <label className="label">State</label>
                  <select required value={form.state} onChange={set('state')} className="input-field">
                    <option value="">Select your state</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">LGA / Area</label>
                  <input type="text" required value={form.lga} onChange={set('lga')}
                    placeholder="e.g. Lekki" className="input-field" />
                </div>
                <div>
                  <label className="label">Coverage Region <span className="text-on-surface-variant font-normal">(optional)</span></label>
                  <input type="text" value={form.region} onChange={set('region')}
                    placeholder="e.g. Lekki Phase 1 to Ajah" className="input-field" />
                  <p className="text-xs text-on-surface-variant mt-1">Describe the area you will cover for pharmacy visits.</p>
                </div>
              </>
            )}

            {/* Step 3 — Credentials */}
            {step === 3 && (
              <>
                <div>
                  <label className="label">Password</label>
                  <input type="password" required autoComplete="new-password" value={form.password} onChange={set('password')}
                    placeholder="Min. 8 characters" className="input-field" />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input type="password" required autoComplete="new-password" value={form.confirm} onChange={set('confirm')}
                    placeholder="Repeat password" className="input-field" />
                </div>
                <p className="text-xs text-on-surface-variant">
                  By registering you agree to MedsNear's agent terms and payout policies.
                </p>
              </>
            )}

            <div className="flex gap-3 pt-1">
              {step > 1 && (
                <button type="button" onClick={() => { setStep((s) => s - 1); setError('') }}
                  className="flex-1 py-3 border border-outline/40 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-low transition-colors">
                  Back
                </button>
              )}
              <button type="submit" disabled={loading}
                className="btn-primary flex-1 justify-center py-3 disabled:opacity-60">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : step === 3 ? 'Create Account' : 'Continue'
                }
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Already have an account?{' '}
          <Link to="/agent/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
