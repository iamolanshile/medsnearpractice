import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

const LABELS = {
  all: 'All',
  pending: 'Pending Review',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
}

const STATUS_CHIP = {
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border border-green-200',
  cancelled: 'bg-red-100 text-red-800 border border-red-200',
}

const PAYMENT_STATUS_LABEL = {
  true: 'Confirmed',
  false: 'Pending Review',
}

function formatPrice(value) {
  if (value === undefined || value === null) return '—'
  return `₦${Number(value).toLocaleString()}`
}

export default function PaymentVerifications() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const queryKey = useMemo(() => {
    if (filter === 'pending') return { payment_confirmed: false }
    if (filter === 'confirmed') return { payment_confirmed: true }
    if (filter === 'rejected') return { status: 'cancelled' }
    return {}
  }, [filter])

  const fetchOrders = async (pageNumber = 1, activeFilter = filter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', pageNumber)
      if (activeFilter === 'pending') params.set('payment_confirmed', 'false')
      if (activeFilter === 'confirmed') params.set('payment_confirmed', 'true')
      if (activeFilter === 'rejected') params.set('status', 'cancelled')
      const result = await api.get(`/admin/orders?${params.toString()}`)
      setOrders(result.data || [])
      setTotal(result.total || 0)
      setPage(result.page || pageNumber)
    } catch (error) {
      console.error('Failed to load payment verifications', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(1, filter)
  }, [filter])

  const visibleOrders = useMemo(() => orders, [orders])

  const counts = useMemo(() => {
    const summary = { all: 0, pending: 0, confirmed: 0, rejected: 0 }
    orders.forEach((order) => {
      summary.all += 1
      if (order.payment_confirmed) summary.confirmed += 1
      else if (order.status === 'cancelled') summary.rejected += 1
      else summary.pending += 1
    })
    return summary
  }, [orders])

  const selectOrder = (order) => {
    setSelectedOrder(order)
    setRejectMode(false)
    setRejectionReason('')
  }

  const closePanel = () => {
    setSelectedOrder(null)
    setRejectMode(false)
    setRejectionReason('')
  }

  const proofUrl = (order) => {
    const path = order?.payment_proof?.path
    if (!path) return undefined
    return path.startsWith('http') ? path : `${window.location.origin}${path}`
  }

  const handleConfirm = async () => {
    if (!selectedOrder) return
    setLoading(true)
    try {
      await api.patch(`/admin/orders/${selectedOrder._id}`, { payment_confirmed: true, status: 'confirmed' })
      await fetchOrders(page, filter)
      closePanel()
    } catch (error) {
      console.error('Unable to confirm payment', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedOrder) return
    setLoading(true)
    try {
      await api.patch(`/admin/orders/${selectedOrder._id}`, { status: 'cancelled', payment_confirmed: false })
      await fetchOrders(page, filter)
      closePanel()
    } catch (error) {
      console.error('Unable to reject payment proof', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Payment Verifications</h1>
          <p className="text-sm text-on-surface-variant mt-1">Review and process customer payment proofs for pending orders.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.keys(LABELS).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === key ? 'bg-primary text-white' : 'bg-white text-on-surface shadow-sm hover:bg-surface-low'}`}
            >
              {LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-outline/40 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-on-surface-variant">Showing {counts[filter]} verification{counts[filter] === 1 ? '' : 's'}</p>
            <p className="text-lg font-semibold text-on-surface">{filter === 'all' ? 'All payment verifications' : LABELS[filter]}</p>
          </div>
          <button onClick={() => fetchOrders(page, filter)} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-all">
            <span className="material-symbols-outlined">refresh</span>
            Refresh list
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-outline/40 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container text-on-surface-variant">
              <tr>
                {['Order details', 'Customer', 'Payment proof', 'Status', 'Actions'].map((label) => (
                  <th key={label} className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider ${label === 'Actions' ? 'text-right' : ''}`}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/40">
              {loading ? (
                [...Array(4)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="animate-pulse">
                    {Array.from({ length: 5 }).map((__, colIndex) => (<td key={colIndex} className="px-6 py-5 h-16" />))}
                  </tr>
                ))
              ) : visibleOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-on-surface-variant">No payment verifications found.</td>
                </tr>
              ) : (
                visibleOrders.map((order) => {
                  const proofExists = Boolean(order.payment_proof?.path)
                  const statusLabel = order.status === 'cancelled' ? 'Rejected' : order.payment_confirmed ? 'Confirmed' : 'Pending Review'
                  return (
                    <tr key={order._id} className="hover:bg-surface-low transition-colors cursor-pointer" onClick={() => selectOrder(order)}>
                      <td className="px-6 py-5">
                        <div className="font-semibold text-on-surface">#MD-{order._id.slice(-6).toUpperCase()}-NG</div>
                        <div className="text-xs text-on-surface-variant mt-1">{new Date(order.createdAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="mt-2 font-bold text-on-surface">{formatPrice(order.total_price)}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-semibold text-on-surface">{order.customer_name || order.customer_phone}</div>
                        <div className="text-xs text-on-surface-variant mt-1">{order.customer_phone}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`w-16 h-16 rounded-xl overflow-hidden border ${proofExists ? 'border-outline/50' : 'border-dashed border-outline/40 bg-surface-high'} flex items-center justify-center`}>
                          {proofExists ? (
                            <img src={proofUrl(order)} alt={order.payment_proof?.original_name || 'Payment proof'} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-on-surface-variant">No proof</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CHIP[order.status] || STATUS_CHIP.pending}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {order.payment_confirmed || order.status === 'cancelled' ? (
                          <span className="text-sm text-on-surface-variant">No actions</span>
                        ) : (
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => selectOrder(order)}
                              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-all"
                            >
                              Review
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-outline/40 bg-surface-container flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-on-surface-variant">Page {page} · {total.toLocaleString()} total orders</p>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-outline/40 px-3 py-2 text-sm text-on-surface-variant disabled:opacity-50" disabled={page === 1} onClick={() => fetchOrders(page - 1, filter)}>
              Previous
            </button>
            <button className="rounded-full border border-outline/40 px-3 py-2 text-sm text-on-surface-variant" disabled>
              {page}
            </button>
            <button className="rounded-full border border-outline/40 px-3 py-2 text-sm text-on-surface-variant disabled:opacity-50" disabled={orders.length < 25} onClick={() => fetchOrders(page + 1, filter)}>
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 p-6" onClick={closePanel}>
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 border-b border-outline/40 p-6">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-on-surface-variant mb-2">Verify Payment</p>
                <h2 className="text-2xl font-black text-on-surface">Order #MD-{selectedOrder._id.slice(-6).toUpperCase()}-NG</h2>
              </div>
              <button type="button" className="rounded-full p-2 text-on-surface-variant hover:bg-surface-low" onClick={closePanel}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-6 p-6">
              <div className="rounded-3xl border border-outline/40 bg-surface-container p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant mb-2">Customer information</p>
                <p className="font-semibold text-on-surface">{selectedOrder.customer_name || selectedOrder.customer_phone}</p>
                <p className="text-sm text-on-surface-variant">Date: {new Date(selectedOrder.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="mt-3 text-3xl font-black text-primary">{formatPrice(selectedOrder.total_price)}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant mb-2">Payment proof</p>
                    <button type="button" className="text-sm font-semibold text-primary hover:text-primary/80" onClick={() => proofUrl(selectedOrder) && window.open(proofUrl(selectedOrder), '_blank')}>
                      <span className="material-symbols-outlined align-middle text-base">open_in_full</span>
                      View Fullsize
                    </button>
                  </div>
                </div>
                <div className="aspect-[3/4] rounded-3xl border border-outline/40 bg-surface-container-high overflow-hidden shadow-inner flex items-center justify-center">
                  {proofUrl(selectedOrder) ? (
                    <img src={proofUrl(selectedOrder)} alt={selectedOrder.payment_proof?.original_name || 'Payment proof'} className="h-full w-full object-contain" />
                  ) : (
                    <div className="text-sm text-on-surface-variant">No payment proof available</div>
                  )}
                </div>
              </div>
              <div className="rounded-3xl border border-outline/40 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant mb-3">Target account info</p>
                <div className="grid gap-3">
                  <div className="flex justify-between text-sm text-on-surface-variant"><span>Bank:</span><span className="font-semibold text-on-surface">Zenith Bank PLC</span></div>
                  <div className="flex justify-between text-sm text-on-surface-variant"><span>Account Name:</span><span className="font-semibold text-on-surface">MedFind Nigeria Ltd</span></div>
                  <div className="flex justify-between text-sm text-on-surface-variant"><span>Account Number:</span><span className="font-semibold text-on-surface font-mono">1012345678</span></div>
                </div>
              </div>
              {rejectMode && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-error">Rejection reason</label>
                  <textarea
                    className="w-full min-h-[120px] rounded-3xl border border-outline/40 p-4 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Explain why the payment proof is rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="border-t border-outline/40 bg-surface p-6 flex flex-col gap-3">
              {rejectMode ? (
                <div className="flex flex-col gap-3">
                  <button type="button" className="w-full rounded-3xl bg-error text-white py-3 font-semibold hover:brightness-95 transition-all" onClick={handleReject}>
                    Confirm Rejection
                  </button>
                  <button type="button" className="w-full rounded-3xl border border-outline/40 bg-white py-3 font-semibold text-on-surface hover:bg-surface-low transition-all" onClick={() => setRejectMode(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button type="button" className="w-full rounded-3xl bg-primary text-white py-3 font-semibold hover:brightness-95 transition-all" onClick={handleConfirm}>
                    Confirm Payment
                  </button>
                  <button type="button" className="w-full rounded-3xl border border-outline/40 bg-white py-3 font-semibold text-on-surface hover:bg-surface-low transition-all" onClick={() => setRejectMode(true)}>
                    Reject Proof
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
