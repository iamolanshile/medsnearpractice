import { useState, useEffect } from 'react'
import api from '../../services/api'

function KPI({ label, value, sub, accent }) {
  return (
    <div className={`rounded-xl p-5 border ${accent ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white border-outline/40'}`}>
      <p className={`text-xs font-bold uppercase tracking-widest font-label mb-2 ${accent ? 'text-white/70' : 'text-on-surface-variant'}`}>{label}</p>
      <p className={`text-3xl font-black tracking-tight ${accent ? 'text-white' : 'text-on-surface'}`}>{value ?? '—'}</p>
      {sub && <p className={`text-xs mt-1 ${accent ? 'text-white/60' : 'text-on-surface-variant'}`}>{sub}</p>}
    </div>
  )
}

const STATUS_COLORS = {
  pending: 'badge-yellow', confirmed: 'badge-blue', in_progress: 'badge-blue',
  delivered: 'badge-green', cancelled: 'badge-red',
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [orders, setOrders] = useState([])
  const [agents, setAgents] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/orders?page=1'),
      api.get('/admin/agents'),
    ]).then(([a, o, ag]) => {
      setAnalytics(a)
      setOrders(o.data || [])
      setAgents(ag || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const tabs = ['overview', 'orders', 'agents']

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-high rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-surface-high rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPI label="Total orders" value={analytics?.orders?.total} sub={`${analytics?.orders?.pending} pending`} />
              <KPI label="Active agents" value={analytics?.agents} />
              <KPI label="Pharmacies" value={analytics?.pharmacies} />
              <KPI label="Inventory entries" value={analytics?.inventory} accent />
            </div>
          )}

          {/* Top searches */}
          <div className="bg-white rounded-xl border border-outline/40 p-5">
            <h2 className="font-bold text-on-surface mb-4">Top searched drugs</h2>
            {loading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-surface-high rounded animate-pulse" />)}</div>
            ) : (
              <div className="space-y-2">
                {analytics?.mostSearched?.map((d, i) => (
                  <div key={d.drug} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-on-surface-variant w-5 font-label">{i + 1}</span>
                    <div className="flex-1 h-2 bg-surface-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(d.count / (analytics.mostSearched[0]?.count || 1)) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium text-on-surface w-32 truncate">{d.drug}</span>
                    <span className="text-xs text-on-surface-variant font-label w-8 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <div className="bg-white rounded-xl border border-outline/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-outline/20">
            <h2 className="font-bold text-on-surface">All orders</h2>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-surface-high rounded animate-pulse" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-low border-b border-outline/20">
                    {['Customer', 'Drug', 'Pharmacy', 'Status', 'Payment', 'Date'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/20">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-surface-low transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-on-surface">{o.customer_name || o.customer_phone}</p>
                        <p className="text-xs text-on-surface-variant">{o.customer_phone}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-on-surface">{o.drug_name}</td>
                      <td className="px-5 py-3.5 text-on-surface-variant">{o.pharmacy_id?.name || '—'}</td>
                      <td className="px-5 py-3.5"><span className={STATUS_COLORS[o.status] || 'badge-gray'}>{o.status}</span></td>
                      <td className="px-5 py-3.5">
                        <span className={o.payment_confirmed ? 'badge-green' : 'badge-yellow'}>{o.payment_confirmed ? 'Confirmed' : 'Pending'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-on-surface-variant">
                        {new Date(o.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <p className="text-center text-on-surface-variant text-sm py-10">No orders yet.</p>}
            </div>
          )}
        </div>
      )}

      {/* Agents */}
      {tab === 'agents' && (
        <div className="bg-white rounded-xl border border-outline/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-outline/20">
            <h2 className="font-bold text-on-surface">All agents</h2>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-surface-high rounded animate-pulse" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-low border-b border-outline/20">
                    {['Name', 'Email', 'State / LGA', 'Status', 'Verified', 'Joined'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/20">
                  {agents.map((a) => (
                    <tr key={a._id} className="hover:bg-surface-low transition-colors">
                      <td className="px-5 py-3.5 font-medium text-on-surface">{a.name}</td>
                      <td className="px-5 py-3.5 text-on-surface-variant">{a.email}</td>
                      <td className="px-5 py-3.5 text-on-surface-variant">{a.state} / {a.lga}</td>
                      <td className="px-5 py-3.5">
                        <span className={a.status === 'active' ? 'badge-green' : a.status === 'pending' ? 'badge-yellow' : 'badge-red'}>{a.status}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={a.verification_status === 'verified' ? 'badge-green' : 'badge-gray'}>{a.verification_status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-on-surface-variant">
                        {new Date(a.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {agents.length === 0 && <p className="text-center text-on-surface-variant text-sm py-10">No agents yet.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
