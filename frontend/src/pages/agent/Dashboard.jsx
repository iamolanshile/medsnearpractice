import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

// Weekly bar heights as % — index 0=Week1 … 3=Week4
const BAR_DATA = [
  { label: 'Week 1', pct: 40, amount: '₦4,200' },
  { label: 'Week 2', pct: 65, amount: '₦6,800' },
  { label: 'Week 3', pct: 90, amount: '₦9,400', highlight: true },
  { label: 'Week 4', pct: 55, amount: '₦5,100' },
]

const PHARMACY_ICONS = ['health_and_safety', 'medication', 'vaccines', 'pill']

const STATUS_CFG = {
  paid:     { label: 'PAID',     cls: 'bg-green-100 text-green-800' },
  approved: { label: 'APPROVED', cls: 'bg-yellow-100 text-yellow-800' },
  pending:  { label: 'PENDING',  cls: 'bg-surface-high text-on-surface-variant' },
}

// History rows derived from recentUploads — grouped by pharmacy
function buildHistory(uploads = []) {
  const map = {}
  uploads.forEach((u) => {
    const key = u.pharmacy_id?._id || u.pharmacy_id || 'unknown'
    if (!map[key]) {
      map[key] = {
        date: u.createdAt,
        pharmacy: u.pharmacy_id?.name || 'Unknown Pharmacy',
        uploads: 0,
        amount: 0,
        status: 'approved',
      }
    }
    map[key].uploads += 1
    map[key].amount  += (u.price || 0)
  })
  return Object.values(map).slice(0, 4)
}

export default function AgentDashboard() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartMode, setChartMode] = useState('weekly')

  useEffect(() => {
    api.get('/agent/dashboard')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const uploadCount = data?.uploadCount ?? 0
  const projected   = data?.projectedEarnings ?? 0
  const goalUploads = 1000
  const progressPct = Math.min((uploadCount / goalUploads) * 100, 100)
  const toGoal      = Math.max(goalUploads - uploadCount, 0)
  const historyRows = buildHistory(data?.recentUploads)

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── KPI cards ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Uploads */}
        <div className="bg-white p-6 rounded-xl border border-outline/40 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-sm text-on-surface-variant">Monthly Upload Count</span>
            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
              <span className="material-symbols-outlined text-[20px]">inventory</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[32px] font-black text-on-surface leading-none">
              {loading ? '—' : uploadCount.toLocaleString()}
            </span>
            <span className="text-sm text-on-surface-variant">entries</span>
          </div>
          <div className="flex items-center gap-1 text-green-700 mt-2">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span className="text-xs font-semibold">12% vs last month</span>
          </div>
        </div>

        {/* Earnings */}
        <div className="bg-white p-6 rounded-xl border border-outline/40 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-sm text-on-surface-variant">Estimated Earnings</span>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[32px] font-black text-on-surface leading-none">
              {loading ? '—' : `₦${projected.toLocaleString()}`}
            </span>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant mt-2">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span className="text-xs font-semibold">Next Payout: 5th of month</span>
          </div>
        </div>

        {/* Payout status */}
        <div className="bg-white p-6 rounded-xl border border-outline/40 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-sm text-on-surface-variant">Payout Status</span>
            <div className="p-2 bg-surface-high text-on-surface-variant rounded-lg">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse inline-block" />
              Approved
            </span>
            <span className="text-sm text-on-surface-variant">Latest this month</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-2 opacity-70">Processing via Bank Transfer</p>
        </div>
      </section>

      {/* ── Bento grid ── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Earnings bar chart */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl border border-outline/40 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-on-surface">Earnings Breakdown</h2>
            <div className="flex gap-2">
              {['daily', 'weekly'].map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMode(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    chartMode === m ? 'bg-primary text-white' : 'bg-surface-high text-on-surface-variant hover:bg-surface-container transition-colors'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Bars */}
          <div className="h-56 flex items-end justify-between gap-3 px-2 border-b border-outline/20 pb-2">
            {BAR_DATA.map(({ label, pct, amount, highlight }) => (
              <div key={label} className="w-full flex flex-col items-center gap-2 group">
                <div
                  className={`w-full rounded-t-lg transition-all relative cursor-pointer ${
                    highlight ? 'bg-primary' : 'bg-primary/20 hover:bg-primary/40'
                  }`}
                  style={{ height: `${pct}%` }}
                >
                  {/* Tooltip */}
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

          {/* Legend */}
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

        {/* Agent Rewards card */}
        <div className="col-span-12 lg:col-span-4 bg-primary-container text-on-primary-container p-6 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2">Agent Rewards</h3>
            <p className="text-sm opacity-90 mb-6 leading-relaxed">
              Hit {goalUploads.toLocaleString()} uploads this month to unlock a ₦5,000 bonus!
            </p>
            <div className="w-full bg-white/20 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="bg-white h-3 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs font-semibold">
              {uploadCount.toLocaleString()} / {goalUploads.toLocaleString()} entries completed
            </p>
            {toGoal > 0 && (
              <p className="text-[11px] opacity-70 mt-1">{toGoal} more to unlock the bonus</p>
            )}
          </div>

          <button
            onClick={() => navigate('/agent/upload')}
            className="mt-8 relative z-10 w-full bg-white text-primary font-bold py-3 rounded-xl hover:bg-surface-low transition-colors active:scale-[0.98] text-sm"
          >
            New Inventory Upload
          </button>

          {/* Background blob */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Earnings history table */}
        <div className="col-span-12 bg-white rounded-xl border border-outline/40 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-outline/20 flex justify-between items-center">
            <h2 className="text-lg font-bold text-on-surface">Recent Earnings History</h2>
            <Link
              to="/agent/earnings"
              className="flex items-center gap-1 text-primary text-sm font-semibold hover:underline"
            >
              View All History
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-surface-high rounded-lg animate-pulse" />)}
            </div>
          ) : historyRows.length === 0 ? (
            <div className="p-10 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">receipt_long</span>
              <p className="text-sm text-on-surface-variant mt-3">No earnings history yet.</p>
              <button onClick={() => navigate('/agent/upload')} className="btn-primary text-sm mt-4 inline-flex">
                Start uploading
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-low border-b border-outline/20">
                    <tr className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      {['Date', 'Pharmacy Name', 'Uploads', 'Amount Earned', 'Status'].map((h) => (
                        <th key={h} className={`px-6 py-4 ${h === 'Status' ? 'text-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/20">
                    {historyRows.map((row, i) => {
                      const st = STATUS_CFG[row.status] || STATUS_CFG.pending
                      return (
                        <tr key={i} className="hover:bg-surface-low transition-colors">
                          <td className="px-6 py-4 text-sm text-on-surface">
                            {new Date(row.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-surface-high flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary text-[18px]">
                                  {PHARMACY_ICONS[i % PHARMACY_ICONS.length]}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-on-surface">{row.pharmacy}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-on-surface">{row.uploads} items</td>
                          <td className="px-6 py-4 text-sm font-bold text-on-surface">₦{row.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold ${st.cls}`}>
                              {st.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-surface-low flex justify-between items-center text-xs text-on-surface-variant">
                <span>Showing {historyRows.length} of {uploadCount} entries</span>
                <div className="flex gap-2">
                  <button disabled className="w-8 h-8 border border-outline/30 flex items-center justify-center rounded hover:bg-white transition-colors disabled:opacity-40">
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <Link to="/agent/earnings" className="w-8 h-8 border border-outline/30 flex items-center justify-center rounded hover:bg-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Floating upload button ── */}
      <div className="fixed bottom-8 right-8 z-40 hidden lg:block">
        <button
          onClick={() => navigate('/agent/upload')}
          title="New Upload"
          className="bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group relative"
        >
          <span className="material-symbols-outlined text-[28px] group-hover:rotate-90 transition-transform duration-300">add</span>
          <span className="absolute right-16 bg-on-surface text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            New Upload
          </span>
        </button>
      </div>
    </div>
  )
}
