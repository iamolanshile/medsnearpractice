import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

const STATUS_LABELS = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Flagged',
}

const STATUS_CLASSES = {
  active: 'badge-green',
  pending: 'badge-yellow',
  suspended: 'badge-red',
}

const topPerformerSeeds = [
  { name: 'Oluwaseun T.', region: 'Lagos Central', uploads: 1402 },
  { name: 'Amina J.', region: 'Kano South', uploads: 1210 },
  { name: 'David O.', region: 'Oyo West', uploads: 1185 },
]

const qualityFlags = [
  { title: 'Expired drug listed', agent: 'Chidi Bello', id: 'AG-33042', message: 'Uploaded paracetamol batch with expiry date 10/2023.' },
  { title: 'Inconsistent pricing', agent: 'Sarah Kunle', id: 'AG-21940', message: 'Price for Insulin Glargine 40% above market cap.' },
  { title: 'GPS Mismatch', agent: 'Ahmed Musa', id: 'AG-88210', message: 'Pharmacy location check-in is 2km from registered site.' },
]

function StatCard({ title, value, detail, accent }) {
  return (
    <div className={`rounded-3xl border ${accent ? 'border-primary bg-primary/5' : 'border-outline/40 bg-white'} p-5 shadow-sm`}>
      <p className={`text-xs uppercase tracking-[0.18em] font-bold mb-3 ${accent ? 'text-primary/70' : 'text-on-surface-variant'}`}>{title}</p>
      <p className={`text-3xl font-black ${accent ? 'text-primary' : 'text-on-surface'}`}>{value}</p>
      {detail && <p className={`text-sm mt-2 ${accent ? 'text-primary/70' : 'text-on-surface-variant'}`}>{detail}</p>}
    </div>
  )
}

export default function AdminAgents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const data = await api.get('/admin/agents')
      setAgents(data || [])
    } catch (error) {
      console.error('Failed to load agents', error)
      setMessage('Unable to load agents. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateAgentStatus = async (agentId, status) => {
    setActionLoading(true)
    try {
      await api.patch(`/admin/agents/${agentId}`, { status })
      setMessage(`Agent status updated to ${STATUS_LABELS[status]}.`)
      await fetchAgents()
    } catch (error) {
      console.error('Failed to update agent status', error)
      setMessage('Unable to update agent status. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      if (filter !== 'all' && agent.status !== filter) return false
      const term = search.trim().toLowerCase()
      if (!term) return true
      return [agent.name, agent.email, agent.phone, agent.region, agent.state, agent.lga, agent._id]
        .some((value) => value?.toLowerCase?.().includes(term))
    })
  }, [agents, filter, search])

  const totalActive = agents.filter((agent) => agent.status === 'active').length
  const pendingCount = agents.filter((agent) => agent.status === 'pending').length
  const suspendedCount = agents.filter((agent) => agent.status === 'suspended').length
  const avgQuality = agents.length ? Math.round(94 + ((agents.filter((a) => a.status === 'active').length / agents.length) * 2)) : 94

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Agent Network Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">Oversee field operations, data compliance, and performance metrics.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-2xl border border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-all">
            <span className="material-symbols-outlined">download</span>
            Export Performance Report
          </button>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-all">
            <span className="material-symbols-outlined">person_add</span>
            Approve New Agent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Active Agents" value={totalActive} detail={agents.length ? `${agents.length} total agents` : 'Loading...'} />
        <StatCard title="Pending Applications" value={pendingCount} detail="Awaiting review" />
        <StatCard title="Flagged Data Alerts" value={suspendedCount} detail="Requires immediate action" accent />
        <StatCard title="Avg. Data Quality" value={`${avgQuality}%`} detail="Performance indicator" />
      </div>

      {message && <div className="rounded-3xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-3xl border border-outline/40 shadow-sm overflow-hidden">
          <div className="flex flex-col gap-4 p-5 border-b border-outline/40 bg-white">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-on-surface">Agent Directory</h2>
                <p className="text-sm text-on-surface-variant">Status: {filter === 'all' ? 'All' : STATUS_LABELS[filter]} · Region: All</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full border border-outline/40 bg-white px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-low transition-all">
                <span className="material-symbols-outlined">filter_list</span>
                Advanced Filters
              </button>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {['all', 'active', 'pending', 'suspended'].map((key) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === key ? 'bg-primary text-white' : 'bg-white text-on-surface shadow-sm hover:bg-surface-low'}`}
                  >
                    {key === 'all' ? 'Status: All' : STATUS_LABELS[key]}
                  </button>
                ))}
              </div>
              <div className="relative w-full max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by agent name, ID, or phone..."
                  className="w-full rounded-full border border-outline/40 bg-white py-3 pl-11 pr-4 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Agent Name & ID</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Region</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Monthly Uploads</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Quality</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/40">
                {loading ? (
                  [...Array(5)].map((_, index) => (
                    <tr key={index} className="animate-pulse bg-white">
                      <td className="px-6 py-5 h-16" />
                      <td className="px-6 py-5" />
                      <td className="px-6 py-5" />
                      <td className="px-6 py-5" />
                      <td className="px-6 py-5" />
                      <td className="px-6 py-5 text-right" />
                    </tr>
                  ))
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-on-surface-variant">No agents match your filters.</td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => {
                    const region = agent.region || `${agent.state || 'Unknown'}${agent.lga ? ` · ${agent.lga}` : ''}`
                    const uploads = agent.status === 'active' ? 1240 : agent.status === 'pending' ? '--' : 210
                    const quality = agent.status === 'active' ? '98%' : agent.status === 'pending' ? '—' : '64%'
                    return (
                      <tr key={agent._id} className="hover:bg-surface-low transition-colors bg-white">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">{agent.name?.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()}</div>
                            <div>
                              <p className="font-semibold text-on-surface">{agent.name}</p>
                              <p className="text-[10px] text-on-surface-variant">ID: {agent._id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-on-surface-variant">{region}</td>
                        <td className="px-6 py-5">
                          <span className={STATUS_CLASSES[agent.status]}>{STATUS_LABELS[agent.status]}</span>
                        </td>
                        <td className="px-6 py-5 font-semibold text-on-surface">{uploads}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: `'FILL' 1` }}>star</span>
                            <span className="font-semibold text-on-surface">{quality}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="rounded-full px-3 py-2 bg-surface text-on-surface shadow-sm hover:bg-surface-low transition-all" title="View Details">
                              <span className="material-symbols-outlined text-sm">visibility</span>
                            </button>
                            {agent.status === 'pending' && (
                              <button
                                disabled={actionLoading}
                                onClick={() => updateAgentStatus(agent._id, 'active')}
                                className="rounded-full bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-all"
                              >
                                Approve
                              </button>
                            )}
                            {agent.status === 'active' && (
                              <button
                                disabled={actionLoading}
                                onClick={() => updateAgentStatus(agent._id, 'suspended')}
                                className="rounded-full bg-error px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-all"
                              >
                                Flag
                              </button>
                            )}
                            {agent.status === 'suspended' && (
                              <button
                                disabled={actionLoading}
                                onClick={() => updateAgentStatus(agent._id, 'active')}
                                className="rounded-full border border-outline/40 bg-white px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-low transition-all"
                              >
                                Reinstate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-outline/40 bg-surface-container-low flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">Showing {filteredAgents.length} of {agents.length} agents</span>
            <div className="flex gap-2">
              <button className="rounded-full border border-outline/40 px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-low transition-all">Previous</button>
              <button className="rounded-full bg-primary px-3 py-2 text-sm font-semibold text-white">Next</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-outline/40 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-5 bg-primary text-white">
              <h3 className="font-bold">Recent Quality Flags</h3>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.18em]">LIVE</span>
            </div>
            <div className="space-y-4 p-5">
              {qualityFlags.map((flag) => (
                <div key={flag.title} className="space-y-2 border-b border-outline/20 pb-3 last:border-b-0 last:pb-0">
                  <p className="font-semibold text-on-surface">{flag.title}</p>
                  <p className="text-[10px] text-on-surface-variant">Agent: {flag.agent} ({flag.id})</p>
                  <p className="text-sm text-error italic">{flag.message}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-surface-container-low text-center">
              <button className="text-sm font-semibold text-primary hover:underline">View All Critical Alerts</button>
            </div>
          </div>

          <div className="rounded-3xl border border-outline/40 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-outline/20 flex items-center justify-between">
              <h3 className="font-bold">Top Performers</h3>
            </div>
            <div className="space-y-3 p-5">
              {topPerformerSeeds.map((agent) => (
                <div key={agent.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">{agent.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>
                    <div>
                      <p className="font-semibold text-on-surface">{agent.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{agent.region}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{agent.uploads.toLocaleString()}</p>
                    <p className="text-[10px] text-on-surface-variant">Uploads</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-surface-container-low text-center">
              <button className="text-sm font-semibold text-primary hover:underline">Full Leaderboard</button>
            </div>
          </div>

          <div className="rounded-3xl border border-outline/40 bg-white shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary text-xl">map</span>
              <div>
                <p className="font-bold text-on-surface">Network Heatmap</p>
                <p className="text-xs text-on-surface-variant">Regional distribution across the field network</p>
              </div>
            </div>
            <div className="relative rounded-3xl border border-outline/40 bg-surface-container-high overflow-hidden h-40 flex items-center justify-center">
              <div className="text-center text-on-surface-variant">
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold">Lagos: Peak Density</p>
                <div className="mt-3 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse"></span>
                  <span className="w-2 h-2 rounded-full bg-primary/20 animate-pulse"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
