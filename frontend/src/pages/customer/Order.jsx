import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function PlaceOrder() {
  const { state } = useLocation()
  const item = state?.item
  const { user } = useAuth()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')


  const total = item.price * qty

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.post('/customer/orders', {
        inventory_id: item._id,
        quantity: qty,
        delivery_address: address
      })
      navigate('/payment', { state: { order: res.order } })
    } catch (err) {
      setError(err.error || 'Failed to place order')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-on-surface tracking-tight mb-6">Confirm order</h1>

      <div className="bg-white rounded-xl border border-outline/40 p-5 mb-4">
        <p className="font-bold text-on-surface text-lg">{item.drug_name}</p>
        {item.brand && <p className="text-sm text-on-surface-variant">{item.brand}</p>}
        <p className="text-2xl font-black text-primary mt-2">₦{item.price?.toLocaleString()} <span className="text-sm font-normal text-on-surface-variant">per unit</span></p>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Quantity</label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full border border-outline/40 flex items-center justify-center text-lg font-bold hover:bg-surface-low">−</button>
            <span className="text-xl font-black text-on-surface w-8 text-center">{qty}</span>
            <button type="button" onClick={() => setQty(q => Math.min(item.quantity, q + 1))} className="w-10 h-10 rounded-full border border-outline/40 flex items-center justify-center text-lg font-bold hover:bg-surface-low">+</button>
            <span className="text-sm text-on-surface-variant">{item.quantity} available</span>
          </div>
        </div>

        <div>
          <label className="label">Delivery address</label>
          <textarea required className="input-field" rows={3} placeholder="House number, street, area, LGA" value={address} onChange={e => setAddress(e.target.value)} style={{resize:'none'}} />
        </div>

        <div className="bg-surface-low rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-on-surface-variant">Total</span>
          <span className="text-2xl font-black text-on-surface">₦{total.toLocaleString()}</span>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60">
          {loading ? 'Placing order...' : 'Place order →'}
        </button>
      </form>
    </div>
  )
}
