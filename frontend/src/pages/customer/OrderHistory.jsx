import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
]

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Ongoing',
  in_progress: 'Ongoing',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const statusStyles = {
  pending: 'bg-warning-container text-warning',
  confirmed: 'bg-primary-container text-primary',
  in_progress: 'bg-primary-container text-primary',
  delivered: 'bg-success-container text-success',
  cancelled: 'bg-error-container text-error',
}

const statusDotStyles = {
  pending: 'bg-warning',
  confirmed: 'bg-primary',
  in_progress: 'bg-primary',
  delivered: 'bg-success',
  cancelled: 'bg-error',
}

export default function OrderHistory() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.phone && !user?.name) return
      setLoadingOrders(true)
      try {
        const params = new URLSearchParams()
        if (user.phone) params.append('customer_phone', user.phone)
        if (!user.phone && user.name) params.append('customer_name', user.name)
        const response = await api.get(`/orders?${params.toString()}`)
        setOrders(response.data || response)
      } catch (error) {
        console.error('Failed to load orders', error)
      } finally {
        setLoadingOrders(false)
      }
    }

    if (!loading) fetchOrders()
  }, [loading, user])

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (statusFilter === 'ongoing') {
          return ['pending', 'confirmed', 'in_progress'].includes(order.status)
        }
        if (statusFilter === 'completed') {
          return order.status === 'delivered'
        }
        return true
      })
      .filter((order) => {
        if (!searchText.trim()) return true
        const term = searchText.trim().toLowerCase()
        const orderId = order._id ? `#MF-${order._id.slice(-8).toUpperCase()}` : order.id
        return (
          orderId.toLowerCase().includes(term) ||
          order.drug_name?.toLowerCase().includes(term) ||
          order.customer_name?.toLowerCase().includes(term)
        )
      })
      .filter((order) => {
        if (!startDate && !endDate) return true
        const created = new Date(order.createdAt)
        if (startDate && created < new Date(startDate + 'T00:00:00')) return false
        if (endDate && created > new Date(endDate + 'T23:59:59')) return false
        return true
      })
  }, [orders, searchText, startDate, endDate, statusFilter])

  const totalOrders = orders.length
  const totalSpend = orders.reduce((sum, order) => sum + (order.total_price || 0), 0)

  const exportStatement = () => {
    const headers = ['Order ID', 'Date', 'Drug Name', 'Quantity', 'Total Price', 'Status']
    const rows = filteredOrders.map((order) => [
      `#MF-${order._id.slice(-8).toUpperCase()}`,
      new Date(order.createdAt).toLocaleDateString(),
      order.drug_name || '—',
      order.quantity || 0,
      `₦${(order.total_price || 0).toLocaleString()}`,
      statusLabels[order.status] || order.status,
    ])
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'medsnear-order-history.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
  }

  const closeDetails = () => {
    setSelectedOrder(null)
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="bg-surface border-b border-outline-variant py-4 px-margin-mobile md:px-margin-desktop sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">My Orders › History</p>
            <h1 className="mt-2 text-3xl font-bold text-on-surface">Order History</h1>
          </div>
          <button
            type="button"
            onClick={exportStatement}
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-white px-5 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">download</span>
            Export Statement
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-3">
                  {statusTabs.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setStatusFilter(tab.value)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${statusFilter === tab.value ? 'bg-primary text-white' : 'bg-surface text-on-surface hover:bg-surface-container'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-2xl border border-outline px-4 py-3 bg-white text-sm text-on-surface"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-2xl border border-outline px-4 py-3 bg-white text-sm text-on-surface"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Search</p>
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search Order ID or Drug"
                    className="mt-2 w-full rounded-3xl border border-outline px-4 py-3 bg-white text-sm text-on-surface shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="text-right text-sm text-on-surface-variant">
                  Showing {filteredOrders.length} of {totalOrders} orders
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-outline-variant bg-white shadow-sm">
              <table className="min-w-full divide-y divide-outline">
                <thead className="bg-surface-container-lowest">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-on-surface-variant uppercase tracking-[0.12em]">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-on-surface-variant uppercase tracking-[0.12em]">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-on-surface-variant uppercase tracking-[0.12em]">Drug Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-on-surface-variant uppercase tracking-[0.12em]">Quantity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-on-surface-variant uppercase tracking-[0.12em]">Total Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-on-surface-variant uppercase tracking-[0.12em]">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-on-surface-variant uppercase tracking-[0.12em]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline">
                  {loadingOrders ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">Loading orders…</td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">No orders found for this account.</td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const orderId = order._id ? `#MF-${order._id.slice(-8).toUpperCase()}` : order.id
                      return (
                        <tr key={order._id || order.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="px-6 py-4 font-semibold text-on-surface">{orderId}</td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-on-surface">{order.drug_name || '—'}</td>
                          <td className="px-6 py-4 text-on-surface">{order.quantity || 0} Pack{order.quantity === 1 ? '' : 's'}</td>
                          <td className="px-6 py-4 font-semibold text-on-surface">₦{(order.total_price || 0).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusStyles[order.status] || 'bg-surface text-on-surface-variant'}`}>
                                <span className={`h-3.5 w-3.5 rounded-full ${statusDotStyles[order.status] || 'bg-surface-variant'} ${['confirmed', 'in_progress'].includes(order.status) ? 'animate-pulse' : ''}`} />
                                {statusLabels[order.status] || order.status}
                              </span>
                              {['confirmed', 'in_progress', 'pending', 'delivered'].includes(order.status) && (
                                <div className="h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${order.status === 'delivered' ? 'bg-success' : order.status === 'pending' ? 'bg-warning' : 'bg-primary'} ${order.status === 'pending' ? 'w-2/5' : order.status === 'confirmed' ? 'w-3/5' : order.status === 'in_progress' ? 'w-4/5' : 'w-full'} ${['pending', 'confirmed', 'in_progress'].includes(order.status) ? 'animate-progress' : ''}`}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleViewDetails(order)}
                              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-container transition-all"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-sm">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-4">Summary</h2>
              <div className="space-y-4">
                <div className="rounded-3xl bg-surface-container p-5">
                  <p className="text-label-sm text-on-surface-variant">Total orders in history</p>
                  <p className="mt-2 text-3xl font-bold text-on-surface">{totalOrders}</p>
                </div>
                <div className="rounded-3xl bg-surface-container p-5">
                  <p className="text-label-sm text-on-surface-variant">Total health spending</p>
                  <p className="mt-2 text-3xl font-bold text-on-surface">₦{totalSpend.toLocaleString()}</p>
                </div>
                <div className="rounded-3xl bg-primary text-on-primary p-5">
                  <p className="text-label-sm uppercase tracking-[0.18em] text-on-primary-container">100% Secure</p>
                  <p className="mt-2 font-bold">Verified pharmacies only</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-outline-variant bg-surface-container p-6 shadow-sm">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">Quick Actions</h3>
              <button
                type="button"
                onClick={() => navigate('/payment-proof')}
                className="w-full rounded-3xl border border-outline-variant bg-white px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container transition-all"
              >
                Upload payment proof
              </button>
              <button
                type="button"
                onClick={() => navigate('/track-order')}
                className="mt-3 w-full rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-container transition-all"
              >
                Track a delivery
              </button>
            </div>
          </aside>
        </div>
      </main>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-surface/40 backdrop-blur-sm flex items-end md:items-center justify-center px-4 py-6 md:p-8">
          <div className="relative w-full max-w-4xl rounded-[32px] bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-outline-variant bg-surface-container-highest px-6 py-5">
              <div>
                <p className="text-label-sm text-on-surface-variant">Order details</p>
                <h2 className="mt-1 text-2xl font-bold text-on-surface">#MF-{selectedOrder._id.slice(-8).toUpperCase()}</h2>
              </div>
              <button type="button" onClick={closeDetails} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-outline bg-surface text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-3xl border border-outline-variant bg-surface-container p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <p className="text-label-sm text-on-surface-variant">Ordered on</p>
                      <p className="mt-2 font-semibold text-on-surface">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-surface-variant">Payment status</p>
                      <p className="mt-2 font-semibold text-on-surface">{selectedOrder.payment_confirmed ? 'Confirmed' : 'Pending verification'}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-surface-variant">Order status</p>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedOrder.status] || 'bg-surface text-on-surface-variant'}`}>
                        {statusLabels[selectedOrder.status] || selectedOrder.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-3xl bg-white p-5 border border-outline-variant">
                      <p className="text-label-sm text-on-surface-variant">Drug</p>
                      <p className="mt-2 font-semibold text-on-surface">{selectedOrder.drug_name || '—'}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-5 border border-outline-variant">
                      <p className="text-label-sm text-on-surface-variant">Quantity</p>
                      <p className="mt-2 font-semibold text-on-surface">{selectedOrder.quantity || 0} Pack{selectedOrder.quantity === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-outline-variant bg-white p-6">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-4">Delivery & payment</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-surface-container p-4">
                      <p className="text-label-sm text-on-surface-variant">Delivery address</p>
                      <p className="mt-2 text-on-surface">{selectedOrder.delivery_address || 'No address provided'}</p>
                    </div>
                    <div className="rounded-3xl bg-surface-container p-4">
                      <p className="text-label-sm text-on-surface-variant">Total paid</p>
                      <p className="mt-2 font-semibold text-on-surface">₦{(selectedOrder.total_price || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-outline-variant bg-surface-container p-6">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-4">Payment proof</h3>
                  {selectedOrder.payment_proof?.original_name ? (
                    <div className="rounded-3xl bg-white border border-outline-variant px-5 py-4">
                      <p className="text-label-sm text-on-surface-variant">Uploaded file</p>
                      <p className="mt-2 font-semibold text-on-surface">{selectedOrder.payment_proof.original_name}</p>
                      <p className="text-sm text-on-surface-variant mt-1">{selectedOrder.payment_proof.mime_type} · {(selectedOrder.payment_proof.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <p className="text-on-surface-variant">No proof has been uploaded yet.</p>
                  )}
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-sm">
                  <p className="text-label-sm text-on-surface-variant">Customer</p>
                  <p className="mt-2 font-semibold text-on-surface">{selectedOrder.customer_name || 'Customer'}</p>
                  <p className="text-sm text-on-surface-variant mt-1">{selectedOrder.customer_phone || 'No phone'}</p>
                </div>
                <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-sm">
                  <p className="text-label-sm text-on-surface-variant">Order notes</p>
                  <p className="mt-2 text-on-surface">{selectedOrder.notes || 'No additional notes.'}</p>
                </div>
                <div className="rounded-3xl border border-outline-variant bg-surface-container p-6">
                  <p className="text-label-sm text-on-surface-variant">Quick actions</p>
                  <button
                    type="button"
                    onClick={() => {
                      closeDetails()
                      navigate('/track-order', { state: { orderId: selectedOrder._id } })
                    }}
                    className="mt-4 w-full rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-container transition-all"
                  >
                    Track this order
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
