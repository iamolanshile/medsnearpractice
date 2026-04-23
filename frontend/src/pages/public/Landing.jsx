import { useState } from 'react'
import { Link } from 'react-router-dom'

// ── WhatsApp Chat Mockup ──────────────────────────────
function WhatsAppMockup() {
  return (
    <div className="relative w-full max-w-[300px] mx-auto">
      {/* Phone frame */}
      <div className="bg-[#111] rounded-[2.5rem] p-3 shadow-2xl shadow-black/40">
        <div className="bg-[#ECE5DD] rounded-[2rem] overflow-hidden">
          {/* WA header */}
          <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">MN</div>
            <div>
              <p className="text-white text-xs font-semibold">MedsNear</p>
              <p className="text-white/70 text-[10px]">Online</p>
            </div>
          </div>
          {/* Chat */}
          <div className="p-3 space-y-2 min-h-[320px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTVkZGQ0Ii8+PC9zdmc+')]">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-[#DCF8C6] rounded-lg rounded-tr-sm px-3 py-2 max-w-[80%] shadow-sm">
                <p className="text-[11px] text-gray-800">Amoxicillin 500mg</p>
                <p className="text-[9px] text-gray-400 text-right mt-0.5">9:41 AM ✓✓</p>
              </div>
            </div>
            {/* Bot response */}
            <div className="flex justify-start">
              <div className="bg-white rounded-lg rounded-tl-sm px-3 py-2 max-w-[90%] shadow-sm">
                <p className="text-[11px] text-gray-800 mb-1.5">Hi! I found <strong>3 pharmacies</strong> near you with Amoxicillin 500mg in stock:</p>
                <div className="space-y-1.5">
                  {[
                    { n: '1. HealthPlus Lekki', p: '₦850', s: '24 in stock', d: '1.2km' },
                    { n: '2. Medplus V/I', p: '₦900', s: '8 in stock', d: '2.1km' },
                    { n: '3. Alpha Pharmacy', p: '₦780', s: '40 in stock', d: '3.4km' },
                  ].map((item) => (
                    <div key={item.n} className="bg-gray-50 rounded p-1.5">
                      <p className="text-[10px] font-semibold text-gray-800">{item.n}</p>
                      <p className="text-[9px] text-gray-500">{item.p} · {item.s} · {item.d}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-600 mt-1.5">Reply with 1, 2, or 3 to order 👇</p>
                <p className="text-[9px] text-gray-400 text-right mt-0.5">9:41 AM</p>
              </div>
            </div>
            {/* User picks */}
            <div className="flex justify-end">
              <div className="bg-[#DCF8C6] rounded-lg rounded-tr-sm px-3 py-2 shadow-sm">
                <p className="text-[11px] text-gray-800">1</p>
                <p className="text-[9px] text-gray-400 text-right mt-0.5">9:42 AM ✓✓</p>
              </div>
            </div>
            {/* Confirmation */}
            <div className="flex justify-start">
              <div className="bg-white rounded-lg rounded-tl-sm px-3 py-2 max-w-[90%] shadow-sm">
                <p className="text-[11px] text-gray-800">Order confirmed! Pay <strong>₦850</strong> to:</p>
                <p className="text-[10px] text-gray-600 mt-1">MedsNear — GTBank</p>
                <p className="text-[10px] font-mono font-bold text-gray-800">0123456789</p>
                <p className="text-[10px] text-gray-500">Ref: <span className="font-mono">MFN-00412</span> ✅</p>
                <p className="text-[9px] text-gray-400 text-right mt-0.5">9:42 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Glow */}
      <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl -z-10" />
    </div>
  )
}

// ── Earnings Estimator ────────────────────────────────
function EarningsEstimator() {
  const [uploads, setUploads] = useState(150)
  const rate = uploads >= 350 ? 200 : uploads >= 200 ? 170 : 150
  const bonus = uploads >= 200 ? uploads * 20 : 0
  const total = uploads * rate + bonus
  const tier = uploads >= 350 ? 'Top Agent' : uploads >= 200 ? 'Active' : 'Starter'
  const tierColor = uploads >= 350 ? 'text-amber-600' : uploads >= 200 ? 'text-blue-600' : 'text-gray-600'

  return (
    <div className="bg-white rounded-2xl border border-outline/40 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-on-surface">Uploads per month</p>
        <span className={`text-xs font-bold font-label uppercase tracking-wider ${tierColor}`}>{tier}</span>
      </div>
      <input
        type="range" min={50} max={500} step={10} value={uploads}
        onChange={(e) => setUploads(Number(e.target.value))}
        className="w-full accent-primary mb-3"
      />
      <div className="flex justify-between text-xs text-on-surface-variant font-label mb-5">
        <span>50</span><span>500</span>
      </div>
      <div className="bg-surface-low rounded-xl p-4">
        <p className="text-3xl font-black text-primary tracking-tight">₦{total.toLocaleString()}<span className="text-base font-semibold text-on-surface-variant"> / mo</span></p>
        <p className="text-xs text-on-surface-variant mt-1">{uploads} uploads × ₦{rate} = ₦{(uploads * rate).toLocaleString()}{bonus > 0 ? ` + ₦${bonus.toLocaleString()} bonus` : ''}</p>
      </div>
      {uploads >= 200 && (
        <p className="text-xs text-blue-600 font-semibold mt-3 flex items-center gap-1">
          <span>🎉</span> Bonus tier unlocked — +₦20 per upload
        </p>
      )}
    </div>
  )
}

// ── Step Card ─────────────────────────────────────────
function Step({ num, title, body }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary font-black text-sm flex items-center justify-center">{num}</div>
      <div>
        <p className="font-semibold text-on-surface text-sm">{title}</p>
        <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────
function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-black text-primary tracking-tight">{value}</p>
      <p className="text-sm text-on-surface-variant mt-1 leading-snug">{label}</p>
    </div>
  )
}

// ── Trust Point ───────────────────────────────────────
function TrustPoint({ icon, title, body }) {
  return (
    <div className="flex gap-4 p-5 bg-white rounded-xl border border-outline/30 hover:border-primary/30 hover:shadow-sm transition-all">
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div>
        <p className="font-semibold text-on-surface text-sm">{title}</p>
        <p className="text-sm text-on-surface-variant mt-0.5">{body}</p>
      </div>
    </div>
  )
}

// ── Main Landing ──────────────────────────────────────
export default function Landing() {
  return (
    <div className="overflow-x-hidden">

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#f0f5ff] via-white to-[#f9f9fc] pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full font-label mb-5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Now live in Lagos
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight leading-[1.1] mb-5">
                Find Your Medication.<br />
                <span className="text-primary">Anywhere in Nigeria.</span>
              </h1>
              <p className="text-base md:text-lg text-on-surface-variant leading-relaxed mb-8 max-w-md">
                Stop wasting time visiting pharmacy after pharmacy. MedsNear shows you which pharmacies near you have your medication in stock — right now, on WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <a href="https://wa.me/2348157537642" target="_blank" rel="noreferrer" className="btn-primary text-sm py-3.5 px-6">
                  Search for a drug on WhatsApp →
                </a>
                <Link to="/agents" className="btn-outline text-sm py-3.5 px-6">
                  Become an agent — earn monthly
                </Link>
              </div>
              <p className="text-xs text-on-surface-variant font-label">
                Free to use · No app download · Works on any phone
              </p>
            </div>
            <div className="flex justify-center">
              <WhatsAppMockup />
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 bg-[#0d1b2e] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary font-label">The problem</span>
            <h2 className="text-3xl md:text-4xl font-black mt-3 tracking-tight">Every Nigerian has been here.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { val: '3 in 5', label: 'Nigerians visit multiple pharmacies before finding their medication' },
              { val: '40%', label: 'Of drug searches end without finding what they need' },
              { val: '2hrs+', label: 'Average time spent searching for medication in Lagos' },
            ].map((s) => (
              <div key={s.val} className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                <p className="text-4xl font-black text-primary mb-2">{s.val}</p>
                <p className="text-sm text-white/70 leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-white/60 text-base max-w-lg mx-auto">
            We built MedsNear so that never has to happen again.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS — PATIENTS */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary font-label">For patients</span>
              <h2 className="text-3xl md:text-4xl font-black mt-3 mb-8 tracking-tight text-on-surface">Your pharmacy search, done in 60 seconds.</h2>
              <div className="space-y-6">
                <Step num="1" title="Message us on WhatsApp" body="Open WhatsApp and send us the name of your medication." />
                <Step num="2" title="See what's near you" body="Share your location once and we show nearby pharmacies with stock, price, and distance." />
                <Step num="3" title="Order and we deliver" body="Pick a pharmacy, confirm your order, and pay via transfer. Delivery follows." />
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href="https://wa.me/2348157537642" target="_blank" rel="noreferrer" className="btn-primary text-sm">
                  Try it now on WhatsApp →
                </a>
              </div>
              <p className="text-xs text-on-surface-variant mt-3 font-label">No account needed. Works on any Android or iPhone.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '💬', title: 'Message us', body: 'Send any drug name on WhatsApp' },
                { icon: '📍', title: 'Share location', body: 'One-time location share' },
                { icon: '🏥', title: 'See results', body: 'Nearby pharmacies with prices' },
                { icon: '✅', title: 'Order & pay', body: 'Confirm and pay via transfer' },
              ].map((c) => (
                <div key={c.title} className="bg-surface-low rounded-xl p-5 border border-outline/30">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <p className="font-semibold text-sm text-on-surface">{c.title}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — AGENTS */}
      <section className="py-20 bg-surface-low">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary font-label">For agents</span>
              <h2 className="text-3xl md:text-4xl font-black mt-3 mb-8 tracking-tight text-on-surface">Turn your pharmacy visits into a monthly income.</h2>
              <div className="space-y-6 mb-8">
                <Step num="1" title="Visit pharmacies" body="Log drug name, price, stock, expiry, and photo from your phone." />
                <Step num="2" title="Upload and earn" body="No daily targets. Work anytime. Every upload counts." />
                <Step num="3" title="Get paid at month end" body="Uploads are counted automatically. Paid on the 5th of every month." />
              </div>
              <Link to="/agents" className="btn-primary text-sm">Apply to become an agent →</Link>
            </div>
            <div>
              <EarningsEstimator />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary font-label">Why MedsNear</span>
            <h2 className="text-3xl md:text-4xl font-black mt-3 tracking-tight text-on-surface">Built for Nigeria. Built for right now.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TrustPoint icon="📱" title="No app to download" body="Everything runs on WhatsApp." />
            <TrustPoint icon="🔄" title="Real-time stock data" body="Agents update inventory regularly." />
            <TrustPoint icon="✅" title="Verified pharmacies only" body="All pharmacies are physically verified." />
            <TrustPoint icon="💰" title="See price before ordering" body="No hidden fees. Ever." />
          </div>
        </div>
      </section>

      {/* COVERAGE */}
      <section className="py-20 bg-gradient-to-br from-primary to-[#003a73] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-white/60 font-label">Where we operate</span>
          <h2 className="text-3xl md:text-4xl font-black mt-3 mb-4 tracking-tight">Starting in Lagos. Expanding across Nigeria.</h2>
          <p className="text-white/70 text-base max-w-lg mx-auto mb-4">
            Pilot areas: Lekki, Victoria Island, Surulere, Ikeja, Ajah.
          </p>
          <p className="text-white/50 text-sm mb-8">Coming next: Abuja, Port Harcourt, Kano.</p>
          <Link to="/agents" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-lg hover:bg-white/90 transition-colors text-sm">
            Join the waitlist for your city →
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight mb-4">
            Your medication is out there.<br />Let's help you find it.
          </h2>
          <p className="text-on-surface-variant text-base mb-8">
            Join thousands of Nigerians taking the stress out of pharmacy runs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/2348157537642" target="_blank" rel="noreferrer" className="btn-primary text-sm py-3.5 px-7">
              Search on WhatsApp →
            </a>
            <Link to="/agents" className="btn-outline text-sm py-3.5 px-7">
              Become an agent
            </Link>
          </div>
          <p className="text-xs text-on-surface-variant mt-4 font-label">Free to use · No app download · Available now in Lagos</p>
        </div>
      </section>

    </div>
  )
}
