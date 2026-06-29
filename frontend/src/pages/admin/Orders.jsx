import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_PILL = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-sky-100 text-sky-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const DOT_COLOR = {
  pending: 'bg-yellow-600',
  confirmed: 'bg-blue-600',
  in_progress: 'bg-sky-600',
  delivered: 'bg-green-600',
  cancelled: 'bg-red-600',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchOrders = async (pageNumber = 1, status = statusFilter) => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      query.set('page', pageNumber)
      if (status !== 'all') query.set('status', status)
      const result = await api.get(`/admin/orders?${query.toString()}`)
      setOrders(result.data || [])
      setTotal(result.total || 0)
      setPage(result.page || pageNumber)
    } catch (error) {
      console.error('Failed to load orders', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(1, statusFilter)
  }, [statusFilter])

  const stats = useMemo(() => {
    const s = { pending: 0, in_progress: 0, delivered: 0, confirmed: 0 }
    orders.forEach((o) => { if (s[o.status] !== undefined) s[o.status] += 1 })
    return s
  }, [orders])

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) =>
      [o.drug_name, o.customer_name, o.customer_phone, o.pharmacy_id?.name, o.pharmacy_id?.address]
        .some((v) => v?.toLowerCase?.().includes(q))
    )
  }, [orders, search])

  const exportCSV = (rows, filename) => {
    const csv = rows.map((r) => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = filename
    a.click()
  }

  const csvRows = (list) => [
    ['Order ID', 'Drug', 'Qty', 'Total', 'Status', 'Agent', 'Date'],
    ...list.map((o) => [
      o._id, o.drug_name, o.quantity, o.total_price ?? '',
      o.status, o.agent_id?.name ?? '', new Date(o.createdAt).toLocaleDateString('en-NG'),
    ]),
  ]

  const updateOrderStatus = async (orderId, status) => {
    setActionLoading(true)
    try {
      await api.patch(`/admin/orders/${orderId}`, { status })
      await fetchOrders(page, statusFilter)
      setSelectedOrder(null)
    } catch (err) {
      console.error('Failed to update order status', err)
    } finally {
      setActionLoading(false)
    }
  }

  const proofUrl = (order) => {
    const p = order?.payment_proof?.path
    if (!p) return null
    return p.startsWith('http') ? p : `${window.location.origin}${p}`
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight">Orders</h1>
            <p className="text-sm text-on-surface-variant mt-1">Monitor and fulfill medication orders across the network.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'in_progress', 'delivered', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${statusFilter === s ? 'bg-primary text-white' : 'bg-white text-on-surface shadow-sm hover:bg-surface-low'}`}
              >
                {s === 'all' ? 'All' : STATUS_LABEL[s]}
              </button>
            ))}
            <button
              onClick={() => exportCSV(csvRows(orders), `orders-page${page}.csv`)}
              className="flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-sm">file_download</span>
              Export
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: 'Total Orders', value: total.toLocaleString(), icon: 'analytics', iconBg: 'bg-surface-container text-primary' },
            { label: 'Pending', value: stats.pending, icon: 'pending_actions', iconBg: 'bg-yellow-50 text-yellow-700' },
            { label: 'In Delivery', value: stats.in_progress, icon: 'local_shipping', iconBg: 'bg-blue-50 text-blue-700' },
            { label: 'Delivered', value: stats.delivered, icon: 'verified', iconBg: 'bg-green-50 text-green-700' },
          ].map(({ label, value, icon, iconBg }) => (
            <div key={label} className="rounded-3xl border border-outline/40 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2">{label}</p>
                  <p className="text-3xl font-black text-on-surface">{value}</p>
                </div>
                <span className={`rounded-2xl px-3 py-3 ${iconBg}`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-outline/40 bg-white shadow-sm overflow-hidden">
          {/* Table toolbar */}
          <div className="px-6 py-4 border-b border-outline/20 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-on-surface">Recent Orders</h2>
            <button onClick={() => fetchOrders(page, statusFilter)} className="p-2 text-on-surface-variant hover:bg-surface-low rounded-lg transition-colors">
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
          <div className="px-6 py-4 border-b border-outline/20 flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative w-full lg:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="w-full rounded-full border border-outline/30 bg-surface-low py-2.5 pl-11 pr-4 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 ml-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-outline/30 bg-white px-3 py-2 text-sm text-on-surface"
              >
                <option value="all">All Statuses</option>
                {['pending', 'confirmed', 'in_progress', 'delivered', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
              <button
                onClick={() => exportCSV(csvRows(filteredOrders), 'orders-filtered.csv')}
                className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:opacity-90"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-low text-on-surface-variant">
                  {['Order ID', 'Drug', 'Qty', 'Total (₦)', 'Location', 'Status', 'Agent', 'Actions'].map((h) => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider ${h === 'Qty' ? 'text-center' : h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/20">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-5 py-5 h-12"><div className="h-4 bg-surface-high rounded" /></td>
                      ))}
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-10 text-center text-on-surface-variant">No orders found.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-surface-low transition-colors">
                      <td className="px-5 py-4 font-bold text-on-surface text-sm">#{order._id.slice(-4).toUpperCase()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-surface-high flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-sm">medication</span>
                          </div>
                          <span className="font-semibold text-on-surface text-sm">{order.drug_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center text-sm">{order.quantity}</td>
                      <td className="px-5 py-4 font-semibold text-sm">{order.total_price?.toLocaleString() ?? '—'}</td>
                      <td className="px-5 py-4 text-on-surface-variant text-sm">{order.pharmacy_id?.address || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`status-pill ${STATUS_PILL[order.status] || 'bg-gray-100 text-gray-800'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLOR[order.status] || 'bg-gray-600'}`} />
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {order.agent_id
                          ? <span className="text-on-surface">{order.agent_id.name || order.agent_id.phone}</span>
                          : <span className="text-on-surface-variant italic">Unassigned</span>
                        }
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { const u = proofUrl(order); if (u) window.open(u, '_blank') }}
                            disabled={!proofUrl(order)}
                            title={proofUrl(order) ? 'View payment proof' : 'No proof uploaded'}
                            className="p-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-sm">receipt_long</span>
                          </button>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            title="View / update order"
                            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-outline/20 bg-surface-low flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-on-surface-variant">Showing {filteredOrders.length} of {total.toLocaleString()} orders</p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => fetchOrders(page - 1)}
                className="p-2 rounded-lg bg-white border border-outline/30 text-on-surface-variant hover:bg-surface-low transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="px-3 py-2 rounded-lg bg-primary text-white font-bold text-sm">{page}</span>
              <button
                disabled={orders.length < 25}
                onClick={() => fetchOrders(page + 1)}
                className="p-2 rounded-lg bg-white border border-outline/30 text-on-surface-variant hover:bg-surface-low transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order detail panel */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 p-6"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-outline/40 p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-on-surface-variant">Order Details</p>
                <h2 className="text-xl font-black text-on-surface">#{selectedOrder._id.slice(-6).toUpperCase()}</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-2 text-on-surface-variant hover:bg-surface-low"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Drug', value: selectedOrder.drug_name },
                  { label: 'Quantity', value: selectedOrder.quantity },
                  { label: 'Total', value: `₦${selectedOrder.total_price?.toLocaleString() ?? '—'}` },
                  {
                    label: 'Payment',
                    value: selectedOrder.payment_confirmed ? 'Confirmed' : 'Pending',
                    className: selectedOrder.payment_confirmed ? 'text-green-700' : 'text-yellow-700',
                  },
                ].map(({ label, value, className }) => (
                  <div key={label} className="rounded-xl bg-surface-low p-4">
                    <p className="text-xs text-on-surface-variant mb-1">{label}</p>
                    <p className={`font-semibold text-on-surface ${className ?? ''}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-surface-low p-4 space-y-1">
                <p className="text-xs text-on-surface-variant">Customer</p>
                <p className="font-semibold text-on-surface">{selectedOrder.customer_name || selectedOrder.customer_phone}</p>
                <p className="text-xs text-on-surface-variant">{selectedOrder.customer_phone}</p>
              </div>

              {selectedOrder.pharmacy_id && (
                <div className="rounded-xl bg-surface-low p-4">
                  <p className="text-xs text-on-surface-variant mb-1">Pharmacy</p>
                  <p className="font-semibold text-on-surface">{selectedOrder.pharmacy_id.name}</p>
                  <p className="text-xs text-on-surface-variant">{selectedOrder.pharmacy_id.address}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-on-surface-variant mb-2 uppercase tracking-wider font-semibold">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'confirmed', 'in_progress', 'delivered', 'cancelled'].map((s) => (
                    <button
                      key={s}
                      disabled={actionLoading || selectedOrder.status === s}
                      onClick={() => updateOrderStatus(selectedOrder._id, s)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                        selectedOrder.status === s
                          ? 'bg-primary text-white'
                          : 'border border-outline/40 bg-white text-on-surface-variant hover:bg-surface-low'
                      }`}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
