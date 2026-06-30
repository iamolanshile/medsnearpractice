import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const TIERS = [
  { label: 'Starter',   range: '50–199',  rate: 150, min: 0,   max: 199 },
  { label: 'Active',    range: '200–349', rate: 170, min: 200, max: 349 },
  { label: 'Top Agent', range: '350+',    rate: 200, min: 350, max: Infinity },
]

const BAR_DATA = [
  { label: 'Week 1', pct: 40, amount: '₦4,200' },
  { label: 'Week 2', pct: 65, amount: '₦6,800' },
  { label: 'Week 3', pct: 90, amount: '₦9,400', highlight: true },
  { label: 'Week 4', pct: 55, amount: '₦5,100' },
]

const PAYOUT_HISTORY = [
  { month: 'This month', amount: null,   status: 'upcoming', date: 'Due 5th' },
  { month: 'April 2026', amount: 18500,  status: 'paid',     date: 'Apr 5, 2026' },
  { month: 'March 2026', amount: 12000,  status: 'paid',     date: 'Mar 5, 2026' },
  { month: 'Feb 2026',   amount: 9500,   status: 'paid',     date: 'Feb 5, 2026' },
]

const STATUS_CFG = {
  paid:     { label: 'PAID',     cls: 'bg-green-100 text-green-800',  icon: 'check_circle' },
  approved: { label: 'APPROVED', cls: 'bg-yellow-100 text-yellow-800', icon: 'check_circle' },
  pending:  { label: 'PENDING',  cls: 'bg-surface-high text-on-surface-variant', icon: 'schedule' },
  upcoming: { label: 'UPCOMING', cls: 'bg-primary/10 text-primary',   icon: 'schedule' },
}

export default function AgentEarnings() {
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [chartMode, setChartMode] = useState('weekly')

  useEffect(() => {
    api.get('/agent/dashboard')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const uploadCount = data?.uploadCount ?? 0
  const projected   = data?.projectedEarnings ?? 0
  const rate        = data?.rate ?? 150
  const bonus       = data?.bonus ?? 0
  const currentTier = TIERS.find((t) => uploadCount >= t.min && uploadCount <= t.max) || TIERS[0]

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Earnings</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Payouts are processed on the 5th of every month.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-surface-high rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* ── KPI row ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Projected hero */}
            <div className="md:col-span-2 bg-primary rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-2">
                  Projected This Month
                </p>
                <p className="text-5xl font-black tracking-tight mb-1">
                  ₦{projected.toLocaleString()}
                </p>
                <p className="text-white/60 text-sm">
                  {uploadCount} uploads · ₦{rate}/upload · {currentTier.label}
                </p>
                {bonus > 0 && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]">stars</span>
                    +₦{bonus.toLocaleString()} tier bonus
                  </div>
                )}
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_balance_wallet
                </span>
              </div>
            </div>

            {/* Mini stats */}
            <div className="flex flex-col gap-4">
              {[
                { label: 'Uploads',  value: uploadCount },
                { label: 'Rate',     value: `₦${rate}` },
                { label: 'Bonus',    value: bonus > 0 ? `₦${bonus.toLocaleString()}` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-outline/40 px-4 py-3 flex justify-between items-center">
                  <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">{label}</p>
                  <p className="text-lg font-black text-on-surface">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Earnings bar chart ── */}
          <div className="bg-white p-6 rounded-xl border border-outline/40 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-on-surface">Earnings Breakdown</h2>
              <div className="flex gap-2">
                {['daily', 'weekly'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartMode(m)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      chartMode === m ? 'bg-primary text-white' : 'bg-surface-high text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-52 flex items-end justify-between gap-3 px-2 border-b border-outline/20 pb-2">
              {BAR_DATA.map(({ label, pct, amount, highlight }) => (
                <div key={label} className="w-full flex flex-col items-center gap-2 group">
                  <div
                    className={`w-full rounded-t-lg transition-all relative cursor-pointer ${
                      highlight ? 'bg-primary' : 'bg-primary/20 hover:bg-primary/40'
                    }`}
                    style={{ height: `${pct}%` }}
                  >
                    <div className="hidden group-hover:flex absolute -top-9 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap z-10">
                      {amount}
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold ${highlight ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-6">
              <span className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                Current Month
              </span>
              <span className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-primary/20 inline-block" />
                Average
              </span>
            </div>
          </div>

          {/* ── Tier breakdown ── */}
          <div className="bg-white rounded-xl border border-outline/40 p-6">
            <h2 className="text-base font-bold text-on-surface mb-4">Tier Breakdown</h2>
            <div className="space-y-2.5">
              {TIERS.map((t) => {
                const isActive = currentTier.label === t.label
                return (
                  <div
                    key={t.label}
                    className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                      isActive ? 'bg-primary/10 border border-primary/20' : 'bg-surface-low'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isActive && (
                        <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      )}
                      <div>
                        <p className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {t.label}
                          {isActive && (
                            <span className="ml-2 text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-on-surface-variant">{t.range} uploads / month</p>
                      </div>
                    </div>
                    <p className={`font-bold text-sm ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                      ₦{t.rate}/upload
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Payout history ── */}
          <div className="bg-white rounded-xl border border-outline/40 overflow-hidden">
            <div className="px-6 py-5 border-b border-outline/20 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-on-surface">Payout History</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Past and upcoming disbursements</p>
              </div>
              <Link to="/agent/uploads" className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
                View Uploads
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
            <div className="divide-y divide-outline/20">
              {PAYOUT_HISTORY.map((p) => {
                const st = STATUS_CFG[p.status] || STATUS_CFG.pending
                return (
                  <div key={p.month} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        p.status === 'paid' ? 'bg-green-100' : 'bg-surface-high'
                      }`}>
                        <span className={`material-symbols-outlined text-[18px] ${
                          p.status === 'paid' ? 'text-green-600' : 'text-on-surface-variant/50'
                        }`} style={{ fontVariationSettings: p.status === 'paid' ? "'FILL' 1" : "'FILL' 0" }}>
                          {st.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{p.month}</p>
                        <p className={`text-xs font-semibold ${p.status === 'paid' ? 'text-green-600' : 'text-on-surface-variant'}`}>
                          {p.status === 'paid' ? `Paid · ${p.date}` : p.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`font-bold text-sm ${p.amount ? 'text-on-surface' : 'text-on-surface-variant/40'}`}>
                        {p.amount ? `₦${p.amount.toLocaleString()}` : '—'}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
