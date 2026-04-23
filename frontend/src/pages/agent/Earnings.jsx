import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AgentEarnings() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/agent/dashboard').then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  const tier = data?.uploadCount >= 350 ? 'Top Agent' : data?.uploadCount >= 200 ? 'Active' : 'Starter'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Earnings</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Paid on the 5th of every month.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-surface-high rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="bg-primary rounded-2xl p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70 font-label mb-2">Projected this month</p>
            <p className="text-5xl font-black tracking-tight">₦{(data?.projectedEarnings ?? 0).toLocaleString()}</p>
            <p className="text-white/60 text-sm mt-2">{data?.uploadCount} uploads · ₦{data?.rate}/upload · {tier}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-outline/40 p-4 text-center">
              <p className="text-2xl font-black text-on-surface">{data?.uploadCount}</p>
              <p className="text-xs text-on-surface-variant font-label mt-1">Uploads</p>
            </div>
            <div className="bg-white rounded-xl border border-outline/40 p-4 text-center">
              <p className="text-2xl font-black text-on-surface">₦{data?.rate}</p>
              <p className="text-xs text-on-surface-variant font-label mt-1">Rate</p>
            </div>
            <div className="bg-white rounded-xl border border-outline/40 p-4 text-center">
              <p className="text-2xl font-black text-on-surface">{data?.bonus > 0 ? `₦${data.bonus.toLocaleString()}` : '—'}</p>
              <p className="text-xs text-on-surface-variant font-label mt-1">Bonus</p>
            </div>
          </div>

          {/* Tier breakdown */}
          <div className="bg-white rounded-xl border border-outline/40 p-5">
            <p className="text-sm font-bold text-on-surface mb-4">Tier breakdown</p>
            <div className="space-y-3">
              {[
                { label: 'Starter', range: '50–199', rate: 150, active: data?.uploadCount < 200 },
                { label: 'Active', range: '200–349', rate: 170, active: data?.uploadCount >= 200 && data?.uploadCount < 350 },
                { label: 'Top Agent', range: '350+', rate: 200, active: data?.uploadCount >= 350 },
              ].map((t) => (
                <div key={t.label} className={`flex items-center justify-between p-3 rounded-lg ${t.active ? 'bg-primary/10 border border-primary/20' : 'bg-surface-low'}`}>
                  <div>
                    <p className={`text-sm font-semibold ${t.active ? 'text-primary' : 'text-on-surface-variant'}`}>{t.label}</p>
                    <p className="text-xs text-on-surface-variant">{t.range} uploads</p>
                  </div>
                  <p className={`font-bold ${t.active ? 'text-primary' : 'text-on-surface-variant'}`}>₦{t.rate}/upload</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
