import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const PER_PAGE = 20

const STATUS_CFG = {
  live:       { label: 'Live',       dot: true,  dotCls: 'bg-green-600',  pillCls: 'bg-green-100 text-green-800', icon: null },
  processing: { label: 'Processing', dot: true,  dotCls: 'bg-amber-500 animate-pulse', pillCls: 'bg-amber-100 text-amber-800', icon: null },
  flagged:    { label: 'Flagged',    dot: false, dotCls: '',              pillCls: 'bg-red-100 text-red-800',     icon: 'error' },
  approved:   { label: 'Approved',   dot: true,  dotCls: 'bg-green-600',  pillCls: 'bg-green-100 text-green-800', icon: null },
  pending:    { label: 'Pending',    dot: true,  dotCls: 'bg-amber-500',  pillCls: 'bg-amber-100 text-amber-800', icon: null },
}

function deriveStatus(u) {
  if (u.status) return u.status
  if (u.flagged) return 'flagged'
  if (u.quantity <= 0) return 'processing'
  return 'live'
}

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.live
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.pillCls}`}>
      {cfg.icon
        ? <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
        : <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotCls}`} />
      }
      {cfg.label}
    </span>
  )
}

function ActionButton({ status, onClick }) {
  if (status === 'flagged')
    return (
      <button onClick={onClick} className="p-2 text-error hover:bg-red-50 rounded-lg transition-colors" title="View flag details">
        <span className="material-symbols-outlined text-[20px]">report_problem</span>
      </button>
    )
  if (status === 'processing')
    return (
      <button onClick={onClick} className="p-2 text-on-surface-variant hover:bg-surface-high rounded-lg transition-colors" title="Edit entry">
        <span className="material-symbols-outlined text-[20px]">edit</span>
      </button>
    )
  return (
    <button onClick={onClick} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors" title="View details">
      <span className="material-symbols-outlined text-[20px]">visibility</span>
    </button>
  )
}

function buildPageNums(page, totalPages) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
  if (page <= 3) return [1, 2, 3, '...', totalPages]
  if (page >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages]
  return [1, '...', page - 1, page, page + 1, '...', totalPages]
}

export default function AgentUploads() {
  const navigate = useNavigate()

  const [data, setData]           = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [pharmacyFilter, setPharmacyFilter] = useState('all')
  const [statusFilter, setStatusFilter]     = useState('all')
  const [selectedItem, setSelectedItem]     = useState(null)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page })
    if (search.trim()) params.append('q', search.trim())
    if (pharmacyFilter !== 'all') params.append('pharmacy', pharmacyFilter)
    if (statusFilter !== 'all') params.append('status', statusFilter)
    api.get(`/agent/inventory/history?${params.toString()}`)
      .then((res) => { setData(res.data || []); setTotal(res.total || 0) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, search, pharmacyFilter, statusFilter])

  // Derive unique pharmacies from loaded data for the filter dropdown
  const pharmacies = useMemo(() => {
    const names = [...new Set(data.map((u) => u.pharmacy_id?.name).filter(Boolean))]
    return names
  }, [data])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const pageNums   = buildPageNums(page, totalPages)
  const hasFilters = search || pharmacyFilter !== 'all' || statusFilter !== 'all'

  const clearFilters = () => {
    setSearch('')
    setPharmacyFilter('all')
    setStatusFilter('all')
    setPage(1)
  }

  return (
    <div className="space-y-0">

      {/* ── Page header ── */}
      <header className="pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Upload History</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Review and manage your medical supply inventory submissions.
            </p>
          </div>
          <button
            onClick={() => navigate('/agent/upload')}
            className="btn-primary text-sm shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
            Upload New Inventory
          </button>
        </div>
      </header>

      {/* ── Search & filters ── */}
      <section className="bg-white rounded-xl border border-outline/40 p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="label">Search Drug or Brand</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="e.g. Paracetamol 500mg"
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Pharmacy filter */}
          <div>
            <label className="label">Pharmacy</label>
            <select
              value={pharmacyFilter}
              onChange={(e) => { setPharmacyFilter(e.target.value); setPage(1) }}
              className="input-field"
            >
              <option value="all">All Partners</option>
              {pharmacies.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="input-field"
            >
              <option value="all">All Statuses</option>
              <option value="live">Live</option>
              <option value="processing">Processing</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>

          {/* Clear */}
          <div className="flex items-end">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 h-[46px]"
              >
                <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Data table ── */}
      <div className="bg-white rounded-xl border border-outline/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-low border-b border-outline/20 text-on-surface-variant">
                {['Drug Name & Brand', 'Partner Pharmacy', 'Date & Time', 'Status', 'Price & Qty', 'Action'].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${
                      h === 'Action' ? 'text-center' : h === 'Price & Qty' ? 'text-right' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/20">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-6 py-5">
                        <div className="h-4 bg-surface-high rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? null : (
                data.map((u) => {
                  const status = deriveStatus(u)
                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-surface-low transition-colors cursor-pointer"
                      onClick={() => setSelectedItem(u)}
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-on-surface text-sm">{u.drug_name}</p>
                        {u.brand && <p className="text-xs text-on-surface-variant">{u.brand}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {u.pharmacy_id?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {new Date(u.createdAt).toLocaleDateString('en-NG', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                        {' • '}
                        {new Date(u.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-primary text-sm">₦{u.price?.toLocaleString()}</p>
                        <p className="text-xs text-on-surface-variant">{u.quantity?.toLocaleString()} units</p>
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <ActionButton status={status} onClick={() => setSelectedItem(u)} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Empty state ── */}
        {!loading && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="w-20 h-20 rounded-full bg-surface-high flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">inventory_2</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">No Uploads Found</h3>
            <p className="text-sm text-on-surface-variant max-w-sm">
              {hasFilters
                ? "We couldn't find any history matching your current filters. Try adjusting your search criteria."
                : 'You haven\'t uploaded any inventory yet. Start by selecting a pharmacy.'}
            </p>
            {hasFilters ? (
              <button onClick={clearFilters} className="mt-6 text-primary font-bold text-sm hover:underline">
                Clear all filters
              </button>
            ) : (
              <button onClick={() => navigate('/agent/pharmacies', { state: { returnTo: '/agent/upload' } })}
                className="btn-primary text-sm mt-6">
                Start uploading
              </button>
            )}
          </div>
        )}

        {/* ── Pagination footer ── */}
        {total > PER_PAGE && (
          <footer className="bg-surface-low border-t border-outline/20 px-6 py-4 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total.toLocaleString()} uploads
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg border border-outline/30 hover:bg-white transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {pageNums.map((n, i) =>
                n === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-on-surface-variant text-sm">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                      page === n
                        ? 'bg-primary text-white'
                        : 'border border-outline/30 hover:bg-white text-on-surface'
                    }`}
                  >
                    {n}
                  </button>
                )
              )}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border border-outline/30 hover:bg-white transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </footer>
        )}
      </div>

      {/* ── Detail panel (slide-in) ── */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm p-6"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-outline/20 px-6 py-5">
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider">Upload Detail</p>
                <h2 className="text-xl font-black text-on-surface mt-0.5">{selectedItem.drug_name}</h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full text-on-surface-variant hover:bg-surface-low transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Panel body */}
            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</p>
                <StatusPill status={deriveStatus(selectedItem)} />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Brand',    value: selectedItem.brand || '—' },
                  { label: 'Price',    value: `₦${selectedItem.price?.toLocaleString()}` },
                  { label: 'Quantity', value: `${selectedItem.quantity?.toLocaleString()} units` },
                  { label: 'Expiry',   value: selectedItem.expiry_date
                      ? new Date(selectedItem.expiry_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface-low rounded-xl p-4">
                    <p className="text-xs text-on-surface-variant mb-1">{label}</p>
                    <p className="font-semibold text-on-surface text-sm">{value}</p>
                  </div>
                ))}
              </div>

              {/* Pharmacy */}
              <div className="bg-surface-low rounded-xl p-4">
                <p className="text-xs text-on-surface-variant mb-1">Pharmacy</p>
                <p className="font-semibold text-on-surface text-sm">
                  {selectedItem.pharmacy_id?.name || '—'}
                </p>
                {selectedItem.pharmacy_id?.address && (
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {selectedItem.pharmacy_id.address}
                  </p>
                )}
              </div>

              {/* Upload time */}
              <div className="bg-surface-low rounded-xl p-4">
                <p className="text-xs text-on-surface-variant mb-1">Uploaded</p>
                <p className="font-semibold text-on-surface text-sm">
                  {new Date(selectedItem.createdAt).toLocaleString('en-NG', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Panel footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => { setSelectedItem(null); navigate('/agent/upload') }}
                className="btn-primary flex-1 justify-center py-3 text-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                New Upload
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-3 border border-outline/40 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-low transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
