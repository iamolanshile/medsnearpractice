import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const TIERS = [
  { label: 'Starter', range: '50–199 uploads', rate: 150, example: 150, color: 'border-gray-200' },
  { label: 'Active', range: '200–349 uploads', rate: 170, example: 250, color: 'border-blue-200 bg-blue-50/50' },
  { label: 'Top Agent', range: '350+ uploads', rate: 200, example: 400, color: 'border-amber-200 bg-amber-50/50' },
]

const FAQS = [
  { q: 'Do I need experience?', a: 'No experience needed. We provide a short guide to get you started.' },
  { q: 'What do I need?', a: 'Just a smartphone with WhatsApp and internet access.' },
  { q: 'Is there a minimum number of uploads?', a: 'No minimum. Work at your own pace.' },
  { q: 'Do I need permission from pharmacies?', a: 'No. You\'re logging publicly visible information.' },
  { q: 'When do I get paid?', a: 'On the 5th of every month for the previous month\'s uploads.' },
  { q: 'Can I fix a mistake?', a: 'Yes. You can edit or delete any upload from your dashboard.' },
  { q: 'Can I work in multiple areas?', a: 'Yes. You can log inventory from any pharmacy anywhere.' },
]

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-outline/40 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-low transition-colors">
        <span className="text-sm font-semibold text-on-surface">{q}</span>
        <span className={`text-on-surface-variant transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && <div className="px-5 pb-4 text-sm text-on-surface-variant leading-relaxed">{a}</div>}
    </div>
  )
}

export default function AgentsPage() {
  const [uploads, setUploads] = useState(150)
  const rate = uploads >= 350 ? 200 : uploads >= 200 ? 170 : 150
  const bonus = uploads >= 200 ? uploads * 20 : 0
  const total = uploads * rate + bonus

  const [form, setForm] = useState({ name: '', phone: '', email: '', state: '', area: '', smartphone: 'yes', source: '', agree: false })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.agree) return setStatus({ type: 'error', msg: 'Please accept the terms to continue.' })
    setLoading(true)
    try {
      await api.post('/agent/register', {
        name: form.name, phone: form.phone, email: form.email,
        state: form.state, lga: form.area, password: form.phone, // temp password = phone
      })
      setStatus({ type: 'success', msg: 'Application received. You\'ll get login details within 24 hours.' })
      setForm({ name: '', phone: '', email: '', state: '', area: '', smartphone: 'yes', source: '', agree: false })
    } catch (err) {
      setStatus({ type: 'error', msg: err.error || 'Something went wrong. Please try again.' })
    } finally { setLoading(false) }
  }

  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#f0f5ff] via-white to-surface pt-16 pb-20 md:pt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full font-label mb-5">
            We're hiring agents across Lagos
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight leading-[1.1] mb-5">
            Get paid to walk into pharmacies.
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant max-w-lg mx-auto mb-8">
            Agents earn monthly by logging pharmacy inventory. Flexible hours. No selling. No targets.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <a href="#apply" className="btn-primary text-sm py-3.5 px-7">Apply to become an agent →</a>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-on-surface-variant">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full" />₦150 per upload</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-500 rounded-full" />Flexible hours</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-purple-500 rounded-full" />Paid monthly</span>
          </div>
        </div>
      </section>

      {/* WHAT IS AN AGENT */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-on-surface tracking-tight mb-4">What does a MedsNear agent actually do?</h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Visit pharmacies and log inventory using your phone. No selling. No targets. Just walk in, check the shelves, and upload what you see.
              </p>
              <div className="space-y-3">
                {['Work when you want', 'All you need is a phone', 'Work your own area', 'No pharmacy permission needed'].map((h) => (
                  <div key={h} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm font-medium text-on-surface">{h}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { step: '01', title: 'Fill the form', body: 'Apply below in 2 minutes' },
                { step: '02', title: 'Get approved', body: 'Admin reviews within 24hrs' },
                { step: '03', title: 'Watch the guide', body: '5-minute onboarding video' },
                { step: '04', title: 'Start uploading', body: 'Log inventory and earn' },
              ].map((s) => (
                <div key={s.step} className="bg-surface-low rounded-xl p-5 border border-outline/30">
                  <p className="text-xs font-bold text-primary font-label mb-2">{s.step}</p>
                  <p className="font-semibold text-sm text-on-surface">{s.title}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EARNINGS */}
      <section className="py-20 bg-surface-low">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-on-surface tracking-tight">Transparent pay. No surprises.</h2>
            <p className="text-on-surface-variant mt-2">Paid on the 5th of every month.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mb-12">
            {TIERS.map((t) => (
              <div key={t.label} className={`bg-white rounded-2xl border-2 p-6 ${t.color}`}>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label mb-3">{t.label}</p>
                <p className="text-sm text-on-surface-variant mb-1">{t.range}</p>
                <p className="text-3xl font-black text-primary mb-1">₦{t.rate}<span className="text-sm font-semibold text-on-surface-variant"> / upload</span></p>
                <p className="text-xs text-on-surface-variant">Example: ₦{(t.example * t.rate + (t.example >= 200 ? t.example * 20 : 0)).toLocaleString()} / month</p>
              </div>
            ))}
          </div>

          {/* Calculator */}
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-outline/40 p-6 shadow-sm">
            <p className="text-sm font-semibold text-on-surface mb-4">Calculate your earnings</p>
            <input type="range" min={50} max={500} step={10} value={uploads} onChange={(e) => setUploads(Number(e.target.value))} className="w-full accent-primary mb-2" />
            <div className="flex justify-between text-xs text-on-surface-variant font-label mb-4"><span>50</span><span>{uploads} uploads</span><span>500</span></div>
            <div className="bg-surface-low rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-primary">₦{total.toLocaleString()}</p>
              <p className="text-xs text-on-surface-variant mt-1">{uploads} × ₦{rate}{bonus > 0 ? ` + ₦${bonus.toLocaleString()} bonus` : ''}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-black text-on-surface tracking-tight mb-8 text-center">Common questions</h2>
          <div className="space-y-3">
            {FAQS.map((f) => <FAQ key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section id="apply" className="py-20 bg-surface-low">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-on-surface tracking-tight">Apply to become an agent</h2>
            <p className="text-on-surface-variant mt-2 text-sm">Takes 2 minutes. We'll review within 24 hours.</p>
          </div>

          {status?.type === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-bold text-green-800 text-lg mb-1">Application received!</p>
              <p className="text-green-700 text-sm">{status.msg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-outline/40 p-6 shadow-sm space-y-4">
              {status?.type === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{status.msg}</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full name</label>
                  <input required className="input-field" placeholder="Amara Okafor" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input required className="input-field" placeholder="08012345678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input required type="email" className="input-field" placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">State</label>
                  <input required className="input-field" placeholder="Lagos" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </div>
                <div>
                  <label className="label">Area / LGA</label>
                  <input required className="input-field" placeholder="Lekki" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Do you have a smartphone?</label>
                <select className="input-field" value={form.smartphone} onChange={(e) => setForm({ ...form, smartphone: e.target.value })}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="label">How did you hear about us?</label>
                <input className="input-field" placeholder="WhatsApp, friend, social media..." value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-primary" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} />
                <span className="text-xs text-on-surface-variant leading-relaxed">I agree to MedsNear's terms and understand that my account requires admin approval before I can start uploading.</span>
              </label>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
                {loading ? 'Submitting...' : 'Submit my application →'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
