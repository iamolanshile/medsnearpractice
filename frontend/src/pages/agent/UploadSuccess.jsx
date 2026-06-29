import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function AgentUploadSuccess() {
  const location   = useLocation()
  const navigate   = useNavigate()
  const state      = location.state || {}

  const pharmacyName = state.pharmacyName || 'the pharmacy'
  const drugName     = state.drugName     || ''
  const txRef        = state.txRef        || `INV-${Math.floor(Math.random() * 90000 + 10000)}-${Date.now().toString(36).toUpperCase()}`

  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    // If navigated here without state (direct URL), send back to upload
    if (!location.state?.pharmacyName) {
      navigate('/agent/upload', { replace: true })
      return
    }
    api.get('/agent/dashboard').then(setDashboard).catch(() => {})
  }, [])

  const uploadCount    = dashboard?.uploadCount ?? state.uploadCount ?? 0
  const projected      = dashboard?.projectedEarnings ?? state.projected ?? 0
  const goalUploads    = 200
  const progressPct    = Math.min((uploadCount / goalUploads) * 100, 100)
  const toGoal         = Math.max(goalUploads - uploadCount, 0)

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Success card ── */}
      <section className="bg-white border border-outline/40 rounded-xl px-8 py-12 text-center shadow-sm relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Animated checkmark */}
          <div
            className="w-24 h-24 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/20"
            style={{ animation: 'scale-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}
          >
            <span
              className="material-symbols-outlined text-[48px]"
              style={{ fontVariationSettings: "'wght' 700, 'FILL' 1" }}
            >
              check
            </span>
          </div>

          <h1 className="text-3xl font-black text-on-surface mb-3 tracking-tight">
            Inventory Successfully Uploaded
          </h1>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto leading-relaxed">
            The inventory for{' '}
            <span className="font-bold text-on-surface">{pharmacyName}</span>
            {drugName ? <> — <span className="font-semibold text-primary">{drugName}</span></> : null}
            {' '}has been updated and is now live for customers.
          </p>
        </div>
      </section>

      {/* ── Earnings / progress widget ── */}
      <section className="bg-surface-low border border-outline/40 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Projected earnings */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">
            Month-to-Date Performance
          </p>
          <div className="flex items-end gap-2 mb-1">
            <span className="text-4xl font-black text-primary tracking-tight">
              ₦{projected.toLocaleString()}
            </span>
            <span className="text-on-surface-variant text-sm pb-1.5">Estimated Earnings</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-700 text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            +12% from last week
          </div>
        </div>

        {/* Upload progress toward goal */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-on-surface-variant">Total Uploads</p>
              <p className="text-2xl font-black text-on-surface">{uploadCount}</p>
            </div>
            <span className="text-xs text-on-surface-variant">Goal: {goalUploads}</span>
          </div>

          {/* Animated progress bar */}
          <div className="h-2 w-full bg-surface-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-[11px] text-on-surface-variant leading-snug">
            {toGoal > 0
              ? `You are ${toGoal} uploads away from reaching your Level 2 bonus tier! Keep going.`
              : '🏆 You have reached your bonus tier this month!'}
          </p>
        </div>
      </section>

      {/* ── Action buttons ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/agent/upload', {
            state: { selectedPharmacy: state.pharmacy },
            replace: true,
          })}
          className="flex-1 btn-primary h-12 justify-center text-sm font-bold shadow-md shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[18px]">add_box</span>
          Upload Another for this Pharmacy
        </button>
        <button
          onClick={() => navigate('/agent/pharmacies', {
            state: { returnTo: '/agent/upload' },
          })}
          className="flex-1 h-12 bg-white text-primary border border-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          Select Different Pharmacy
        </button>
      </div>

      {/* Transaction ref */}
      <p className="text-center text-[10px] text-on-surface-variant/60 uppercase tracking-[0.18em]">
        Transaction Ref: {txRef}
      </p>

      {/* Keyframe style */}
      <style>{`
        @keyframes scale-up {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
