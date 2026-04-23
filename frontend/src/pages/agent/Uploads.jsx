import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AgentUploads() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/agent/inventory/history?page=${page}`)
      .then((res) => { setData(res.data); setTotal(res.total) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">My uploads</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{total} total entries</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-outline/40 overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-surface-high rounded-lg animate-pulse" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant text-sm">No uploads yet.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-low border-b border-outline/20">
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Drug</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Pharmacy</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Price</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Qty</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/20">
                  {data.map((u) => (
                    <tr key={u._id} className="hover:bg-surface-low transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-on-surface">{u.drug_name}</p>
                        {u.brand && <p className="text-xs text-on-surface-variant">{u.brand}</p>}
                      </td>
                      <td className="px-5 py-3.5 text-on-surface-variant">{u.pharmacy_id?.name || '—'}</td>
                      <td className="px-5 py-3.5 font-semibold text-on-surface">₦{u.price?.toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className={`badge-${u.quantity > 10 ? 'green' : u.quantity > 0 ? 'yellow' : 'red'}`}>
                          {u.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-on-surface-variant text-xs">
                        {new Date(u.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-outline/20 flex justify-between items-center">
                <p className="text-xs text-on-surface-variant font-label">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs border border-outline/40 rounded-lg disabled:opacity-40 hover:bg-surface-low transition-colors">Prev</button>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs border border-outline/40 rounded-lg disabled:opacity-40 hover:bg-surface-low transition-colors">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
