import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`rounded-xl p-5 border ${accent ? 'bg-primary text-white border-primary' : 'bg-white border-outline/40'}`}>
      <p className={`text-xs font-bold uppercase tracking-widest font-label mb-2 ${accent ? 'text-white/70' : 'text-on-surface-variant'}`}>{label}</p>
      <p className={`text-3xl font-black tracking-tight ${accent ? 'text-white' : 'text-on-surface'}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${accent ? 'text-white/60' : 'text-on-surface-variant'}`}>{sub}</p>}
    </div>
  )
}

export default function AgentDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/agent/dashboard').then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  const tier = data?.uploadCount >= 350 ? 'Top Agent' : data?.uploadCount >= 200 ? 'Active' : 'Starter'
  const tierColor = data?.uploadCount >= 350 ? 'text-amber-600' : data?.uploadCount >= 200 ? 'text-blue-600' : 'text-gray-500'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Hey, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {new Date().toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })} · <span className={`font-semibold ${tierColor}`}>{tier}</span>
          </p>
        </div>
        <Link to="/agent/upload" className="btn-primary text-sm py-2.5 px-4">+ Upload</Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-surface-high rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Uploads this month" value={data?.uploadCount ?? 0} accent />
          <StatCard label="Projected earnings" value={`₦${(data?.projectedEarnings ?? 0).toLocaleString()}`} sub="Paid on 5th" />
          <StatCard label="Rate per upload" value={`₦${data?.rate ?? 150}`} sub={tier} />
          <StatCard label="Bonus" value={data?.bonus > 0 ? `₦${data.bonus.toLocaleString()}` : '—'} sub={data?.uploadCount >= 200 ? 'Tier unlocked' : '200+ to unlock'} />
        </div>
      )}

      {/* Progress bar */}
      {data && (
        <div className="bg-white rounded-xl border border-outline/40 p-5">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold text-on-surface">Monthly progress</p>
            <span className={`text-xs font-bold font-label ${tierColor}`}>{tier}</span>
          </div>
          <div className="h-2 bg-surface-high rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min((data.uploadCount / 500) * 100, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-on-surface-variant font-label mt-2">
            <span>{data.uploadCount} uploads</span>
            <span>{data.uploadCount < 200 ? `${200 - data.uploadCount} to Active tier` : data.uploadCount < 350 ? `${350 - data.uploadCount} to Top Agent` : '🏆 Top Agent!'}</span>
          </div>
        </div>
      )}

      {/* Recent uploads */}
      <div className="bg-white rounded-xl border border-outline/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline/20 flex justify-between items-center">
          <h2 className="font-bold text-on-surface">Recent uploads</h2>
          <Link to="/agent/uploads" className="text-xs text-primary font-semibold hover:underline font-label">View all →</Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-surface-high rounded-lg animate-pulse" />)}
          </div>
        ) : data?.recentUploads?.length ? (
          <div className="divide-y divide-outline/20">
            {data.recentUploads.map((u) => (
              <div key={u._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-low transition-colors">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{u.drug_name}</p>
                  <p className="text-xs text-on-surface-variant">{u.pharmacy_id?.name || 'Unknown pharmacy'} · {u.quantity} in stock</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-on-surface">₦{u.price?.toLocaleString()}</p>
                  <p className="text-xs text-on-surface-variant">{new Date(u.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-on-surface-variant text-sm">No uploads yet this month.</p>
            <Link to="/agent/upload" className="btn-primary text-sm mt-4 inline-flex">Make your first upload →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
