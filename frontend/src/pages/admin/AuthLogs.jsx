import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

const userTypes = ['agent', 'admin', 'customer', 'system']
const actions = ['login', 'register', 'logout', 'token_refresh', 'auth_failure']
const statuses = ['success', 'failure']

export default function AdminAuthLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(25)
  const [total, setTotal] = useState(0)
  const [userType, setUserType] = useState('')
  const [action, setAction] = useState('')
  const [status, setStatus] = useState('')
  const [email, setEmail] = useState('')

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit,
        ...(userType ? { user_type: userType } : {}),
        ...(action ? { action } : {}),
        ...(status ? { status } : {}),
        ...(email ? { email } : {}),
      }
      const data = await api.get('/admin/auth-logs', { params })
      setLogs(data.data || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to load auth logs', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, userType, action, status, email])

  const pageCount = useMemo(() => Math.ceil(total / limit), [total, limit])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Authentication Logs</h1>
          <p className="text-sm text-on-surface-variant mt-1">View recent login and auth events for audits.</p>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-container"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <label className="space-y-2 text-sm text-on-surface-variant">
          User type
          <select value={userType} onChange={(event) => setUserType(event.target.value)} className="w-full rounded-xl border border-outline px-3 py-2 bg-white text-on-surface">
            <option value="">All</option>
            {userTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="space-y-2 text-sm text-on-surface-variant">
          Action
          <select value={action} onChange={(event) => setAction(event.target.value)} className="w-full rounded-xl border border-outline px-3 py-2 bg-white text-on-surface">
            <option value="">All</option>
            {actions.map((actionOption) => <option key={actionOption} value={actionOption}>{actionOption}</option>)}
          </select>
        </label>
        <label className="space-y-2 text-sm text-on-surface-variant">
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-outline px-3 py-2 bg-white text-on-surface">
            <option value="">All</option>
            {statuses.map((statusOption) => <option key={statusOption} value={statusOption}>{statusOption}</option>)}
          </select>
        </label>
        <label className="space-y-2 text-sm text-on-surface-variant md:col-span-2">
          Email filter
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="user@example.com"
            className="w-full rounded-xl border border-outline px-3 py-2 bg-white text-on-surface"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-outline/40 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-surface-low border-b border-outline/20">
            <tr>
              <th className="px-4 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">When</th>
              <th className="px-4 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">User</th>
              <th className="px-4 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">User type</th>
              <th className="px-4 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 font-semibold text-on-surface-variant uppercase tracking-wider">IP / agent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/20">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-on-surface-variant">Loading logs…</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-on-surface-variant">No logs found.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-surface-container transition-colors">
                  <td className="px-4 py-4 text-on-surface-variant">{new Date(log.createdAt).toLocaleString('en-NG')}</td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-on-surface">{log.email || 'Unknown'}</div>
                    {log.user_id && <div className="text-xs text-on-surface-variant">ID: {log.user_id}</div>}
                  </td>
                  <td className="px-4 py-4 capitalize text-on-surface-variant">{log.user_type}</td>
                  <td className="px-4 py-4 capitalize text-on-surface">{log.action.replace('_', ' ')}</td>
                  <td className="px-4 py-4 font-semibold text-on-surface">{log.status}</td>
                  <td className="px-4 py-4 text-on-surface-variant">{log.ip || '—'}{log.user_agent ? ` · ${log.user_agent}` : ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-outline/40 bg-surface-low p-4">
        <p className="text-sm text-on-surface-variant">Showing {logs.length} of {total} auth log records</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-xl border border-outline px-3 py-2 text-sm text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
          >Previous</button>
          <span className="text-sm text-on-surface-variant">Page {page} of {pageCount || 1}</span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pageCount || 1, current + 1))}
            disabled={page === pageCount || pageCount === 0}
            className="rounded-xl border border-outline px-3 py-2 text-sm text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
          >Next</button>
        </div>
      </div>
    </div>
  )
}
