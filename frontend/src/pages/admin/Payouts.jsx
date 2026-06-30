import { useEffect, useState, useMemo } from 'react'
import api from '../../services/api'

const PAYOUT_STATUS = {
  pending:   { label: 'Pending',    cls: 'bg-red-100 text-red-700' },
  approved:  { label: 'Processing', cls: 'bg-yellow-100 text-yellow-800' },
  paid:      { label: 'Paid',       cls: 'bg-green-100 text-green-700' },
}

const HISTORY_MOCK = [
  { date: 'Oct 24, 2023', agent: 'Bose Adedayo',   amount: 18450, ref: 'TRX-MFNG-890212' },
  { date: 'Oct 23, 2023', agent: 'Ibrahim Musa',    amount: 22100, ref: 'TRX-MFNG-771234' },
  { date: 'Oct 23, 2023', agent: 'Emeka Nwosu',     amount: 12050, ref: 'TRX-MFNG-665121' },
]

export default function AdminPayouts() {
  const [payouts, setPayouts]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage]           = useState('')
  const [historySearch, setHistorySearch] = useState('')
  const [rate, setRate]                 = useState(150)
  const [volume, setVolume]             = useState(500)
  const [historyPage, setHistoryPage]   = useState(1)
  const month = new Date().toISOString().slice(0, 7)

  const fetchPayouts = async () => {
    setLoading(true)
    try {
      const data = await api.get(`/admin/payouts?month=${month}`)
      setPayouts(data || [])
    } catch (err) {
      console.error('Failed to load payouts', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPayouts() }, [])

  const approve = async (agentId) => {
    setActionLoading(true)
    try {
      await api.post('/admin/payouts/approve', { agent_id: agentId, month })
      setMessage('Payout approved.')
      await fetchPayouts()
    } catch (err) {
      setMessage(err.error || 'Failed to approve payout.')
    } finally {
      setActionLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const markPaid = async (payoutId) => {
    setActionLoading(true)
    try {
      await api.patch(`/admin/payouts/${payoutId}/paid`)
      setMessage('Payout marked as paid.')
      await fetchPayouts()
    } catch (err) {
      setMessage(err.error || 'Failed to mark as paid.')
    } finally {
      setActionLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const approveAll = async () => {
    const pending = payouts.filter((p) => p.status === 'pending')
    setActionLoading(true)
    try {
      await Promise.all(pending.map((p) => api.post('/admin/payouts/approve', { agent_id: p.agent._id, month })))
      setMessage(`${pending.length} payout(s) approved.`)
      await fetchPayouts()
    } catch {
      setMessage('Some approvals failed. Please retry.')
    } finally {
      setActionLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Summary stats
  const totalPending   = payouts.filter((p) => p.status === 'pending').reduce((s, p) => s + p.total, 0)
  const totalUploads   = payouts.reduce((s, p) => s + p.uploadCount, 0)
  const agentsToPay    = payouts.filter((p) => p.status === 'pending').length
  const totalPaid      = payouts.filter((p) => p.status === 'paid').reduce((s, p) => s + p.total, 0)

  const filteredHistory = useMemo(() => {
    const term = historySearch.trim().toLowerCase()
    if (!term) return HISTORY_MOCK
    return HISTORY_MOCK.filter((r) =>
      r.agent.toLowerCase().includes(term) || r.ref.toLowerCase().includes(term)
    )
  }, [historySearch])

  const estimatedPayout = volume * rate

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Payout Management</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {new Date().toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })} cycle
          </p>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary font-medium">
          {message}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: 'pending_actions', iconBg: 'bg-red-100 text-red-700',
            label: 'Total Pending Payouts', value: `₦${totalPending.toLocaleString()}`,
            sub: '+12% vs LW', subCls: 'text-on-surface-variant',
          },
          {
            icon: 'upload_file', iconBg: 'bg-primary/10 text-primary',
            label: 'Monthly Upload Volume', value: totalUploads.toLocaleString(),
            sub: 'Active month', subCls: 'text-primary',
          },
          {
            icon: 'group', iconBg: 'bg-yellow-100 text-yellow-700',
            label: 'Agents to Pay', value: agentsToPay,
            sub: 'Verified', subCls: 'text-on-surface-variant',
          },
          {
            icon: 'check_circle', iconBg: 'bg-primary-container text-on-primary-container',
            label: 'Total Paid This Month', value: `₦${(totalPaid / 1000000).toFixed(1)}M`,
            sub: totalPaid > 0 ? '85% Complete' : '—', subCls: 'text-primary',
          },
        ].map(({ icon, iconBg, label, value, sub, subCls }) => (
          <div key={label} className="bg-white rounded-xl border border-outline/40 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className={`p-2 rounded-lg material-symbols-outlined ${iconBg}`}>{icon}</span>
              <span className={`text-xs font-semibold ${subCls}`}>{sub}</span>
            </div>
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-3xl font-black text-on-surface">{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Main grid: table + calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Payout Approval Table */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-outline/40 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-outline/20 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-on-surface">Payout Approval</h2>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-low text-on-surface text-sm font-semibold rounded-lg hover:bg-surface-high transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filter
              </button>
              <button
                onClick={approveAll}
                disabled={actionLoading || agentsToPay === 0}
                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                Approve All Pending
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white border-b border-outline/20 z-10">
                <tr className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  <th className="px-6 py-4">Agent Name & ID</th>
                  <th className="px-6 py-4">Uploads</th>
                  <th className="px-6 py-4">Rate</th>
                  <th className="px-6 py-4">Total Earnings</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/20">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-6 py-5"><div className="h-4 bg-surface-high rounded" /></td>
                      ))}
                    </tr>
                  ))
                ) : payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                      No payout data for this month.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => {
                    const initials = p.agent?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'AG'
                    const st = PAYOUT_STATUS[p.status] || PAYOUT_STATUS.pending
                    return (
                      <tr key={p.agent._id} className="hover:bg-surface-low/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center text-on-surface-variant font-bold text-xs shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-on-surface text-sm">{p.agent.name}</p>
                              <p className="text-xs text-on-surface-variant">{p.agent._id?.slice(-10).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface">{p.uploadCount}</td>
                        <td className="px-6 py-4 text-sm text-on-surface">₦{p.rate}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">₦{p.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${st.cls}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-3">
                            {p.status === 'pending' && (
                              <button
                                disabled={actionLoading}
                                onClick={() => approve(p.agent._id)}
                                className="text-primary text-sm font-semibold hover:underline disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            {p.status === 'approved' && p.payout_id && (
                              <button
                                disabled={actionLoading}
                                onClick={() => markPaid(p.payout_id)}
                                className="text-primary text-sm font-semibold hover:underline disabled:opacity-50"
                              >
                                Mark Paid
                              </button>
                            )}
                            {p.status === 'paid' && (
                              <span className="text-sm text-on-surface-variant opacity-60">Paid</span>
                            )}
                            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
                              <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Earnings Calculator + Auto-Pay Widget */}
        <div className="lg:col-span-3 space-y-6">
          {/* Calculator */}
          <div className="bg-white rounded-xl border border-outline/40 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-primary">calculate</span>
              <h3 className="font-bold text-on-surface">Earnings Calculator</h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Global Rate (₦/Upload)
                </label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline/40 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Simulate Agent Volume
                </label>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={50}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                  <span>0</span>
                  <span className="font-semibold text-on-surface">{volume} uploads</span>
                  <span>2k</span>
                </div>
              </div>
              <div className="pt-4 border-t border-outline/20">
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Estimated Payout</p>
                <p className="text-2xl font-black text-primary">₦{estimatedPayout.toLocaleString()}</p>
              </div>
              <button className="w-full py-2.5 bg-surface-high text-on-surface text-sm font-semibold rounded-lg hover:bg-surface-container transition-colors">
                Update Global Rate
              </button>
            </div>
          </div>

          {/* Auto-Pay widget */}
          <div className="bg-primary rounded-xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-base mb-2">Automate Payouts?</h4>
              <p className="text-sm text-white/80 mb-4 leading-relaxed">
                Switch to automated weekly payments for all verified agents via Paystack integration.
              </p>
              <button className="px-4 py-2 bg-white text-primary text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all hover:bg-surface-low">
                Enable Auto-Pay
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payout History Log */}
      <div className="bg-white rounded-xl border border-outline/40 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-outline/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Payout History</h2>
            <p className="text-sm text-on-surface-variant">Full log of disbursed funds across the platform.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search agent name or ref..."
                className="w-full pl-10 pr-4 py-2.5 border border-outline/30 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <button className="px-3 py-2.5 bg-surface-low border border-outline/30 rounded-lg text-on-surface-variant hover:bg-surface-high transition-colors">
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-low border-b border-outline/20">
              <tr className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Agent</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/20 text-sm">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant">No history found.</td>
                </tr>
              ) : (
                filteredHistory.map((row) => (
                  <tr key={row.ref} className="hover:bg-surface-low/40 transition-colors">
                    <td className="px-6 py-4 text-on-surface-variant">{row.date}</td>
                    <td className="px-6 py-4 font-semibold text-on-surface">{row.agent}</td>
                    <td className="px-6 py-4 text-on-surface">₦{row.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-on-surface-variant">Bank Transfer</td>
                    <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{row.ref}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-primary font-bold">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        Successful
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-outline/20 bg-surface-low flex items-center justify-between text-sm text-on-surface-variant">
          <span>Showing {filteredHistory.length} of {HISTORY_MOCK.length} payouts</span>
          <div className="flex gap-2">
            <button
              disabled={historyPage === 1}
              onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded border border-outline/30 hover:bg-white transition-colors disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled
              className="px-3 py-1.5 rounded border border-outline/30 hover:bg-white transition-colors disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
