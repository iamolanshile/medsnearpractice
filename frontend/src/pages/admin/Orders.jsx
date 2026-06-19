import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-sky-100 text-sky-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const badges = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-sky-100 text-sky-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

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
    const summary = { totalOrders: total, pending: 0, in_progress: 0, delivered: 0, confirmed: 0 }
    orders.forEach((order) => {
      if (summary[order.status] !== undefined) summary[order.status] += 1
    })
    return summary
  }, [orders, total])

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return orders
    return orders.filter((order) => {
      return [order.drug_name, order.customer_name, order.customer_phone, order.pharmacy_id?.name, order.pharmacy_id?.address]
        .some((value) => value?.toLowerCase?.().includes(query))
    })
  }, [orders, search])

  const handleRefresh = () => fetchOrders(page, statusFilter)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Overview & Controls</h1>
          <p className="text-sm text-on-surface-variant mt-1">Monitor and fulfill medication orders across the network.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {['all', 'pending', 'confirmed', 'in_progress', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${statusFilter === status ? 'bg-primary text-white' : 'bg-white text-on-surface shadow-sm hover:bg-surface-low'}`}
            >
              {status === 'all' ? 'All Orders' : STATUS_LABEL[status]}
            </button>
          ))}
          <button className="flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition-all">
            <span className="material-symbols-outlined">file_download</span>
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="rounded-3xl border border-outline/40 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2">Total Orders</p>
              <p className="text-3xl font-black text-on-surface">{total.toLocaleString()}</p>
            </div>
            <span className="rounded-2xl bg-surface-container px-3 py-3 text-primary">
              <span className="material-symbols-outlined">analytics</span>
            </span>
          </div>
          <p className="text-sm text-green-700 flex items-center gap-1 mt-3"><span className="material-symbols-outlined text-xs">trending_up</span> +12% from last month</p>
        </div>
        <div className="rounded-3xl border border-outline/40 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2">Pending Fulfillment</p>
              <p className="text-3xl font-black text-on-surface">{stats.pending}</p>
            </div>
            <span className="rounded-2xl bg-yellow-50 px-3 py-3 text-yellow-700">
              <span className="material-symbols-outlined">pending_actions</span>
            </span>
          </div>
          <p className="text-sm text-error font-semibold mt-3">Urgent</p>
        </div>
        <div className="rounded-3xl border border-outline/40 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2">Active Deliveries</p>
              <p className="text-3xl font-black text-on-surface">{stats.in_progress}</p>
            </div>
            <span className="rounded-2xl bg-blue-50 px-3 py-3 text-blue-700">
              <span className="material-symbols-outlined">local_shipping</span>
            </span>
          </div>
        </div>
        <div className="rounded-3xl border border-outline/40 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2">Fulfillment Rate</p>
              <p className="text-3xl font-black text-on-surface">98.2%</p>
            </div>
            <span className="rounded-2xl bg-green-50 px-3 py-3 text-primary">
              <span className="material-symbols-outlined">verified</span>
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-outline/40 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-on-surface">Recent Orders</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="p-2 text-secondary hover:bg-surface-low rounded-lg transition-colors">
              <span className="material-symbols-outlined">refresh</span>
            </button>
            <button className="p-2 text-secondary hover:bg-surface-low rounded-lg transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-outline-variant flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="w-full rounded-full border border-outline-variant bg-surface-container-lowest py-3 pl-11 pr-4 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-lg border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-low transition-all">Filter Status</button>
            <button className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition-all">Export CSV</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant">
                {['Order ID', 'Drug Name', 'Qty', 'Total (₦)', 'Customer Area', 'Status', 'Agent', 'Actions'].map((label) => (
                  <th key={label} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${label === 'Qty' ? 'text-center' : label === 'Actions' ? 'text-right' : ''}`}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                [...Array(4)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    {Array.from({ length: 8 }).map((__, colIndex) => (
                      <td key={colIndex} className="px-6 py-5 h-12" />
                    ))}
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-on-surface-variant">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface">#{order._id.slice(-4).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant">
                          <span className="material-symbols-outlined text-primary">medication</span>
                        </div>
                        <span className="font-semibold text-on-surface">{order.drug_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">{order.quantity}</td>
                    <td className="px-6 py-4 font-bold">{order.total_price?.toLocaleString() ?? '—'}</td>
                    <td className="px-6 py-4 text-secondary">{order.pharmacy_id?.address || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`status-pill ${badges[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'pending' ? 'bg-yellow-600' : order.status === 'confirmed' ? 'bg-blue-600' : order.status === 'in_progress' ? 'bg-sky-600' : order.status === 'delivered' ? 'bg-green-600' : 'bg-red-600'}`} />
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.agent_id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full border border-outline-variant overflow-hidden">
                            <img src="https://via.placeholder.com/24" alt="Agent" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm text-on-surface">{order.agent_id.name || order.agent_id.phone}</span>
                        </div>
                      ) : (
                        <button className="text-primary font-semibold hover:underline">Assign Agent</button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-secondary hover:text-primary transition-colors" title="Payment Proof">
                          <span className="material-symbols-outlined">receipt_long</span>
                        </button>
                        <button className="p-2 text-secondary hover:text-primary transition-colors" title="Details">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant bg-surface flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-secondary">Showing {filteredOrders.length} of {total.toLocaleString()} orders</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-white border border-outline-variant text-secondary hover:bg-surface-low transition-colors" disabled={page === 1} onClick={() => fetchOrders(page - 1)}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="px-3 py-2 rounded-lg bg-primary text-white font-bold">{page}</button>
            <button className="p-2 rounded-lg bg-white border border-outline-variant text-secondary hover:bg-surface-low transition-colors" disabled={orders.length < 25} onClick={() => fetchOrders(page + 1)}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
