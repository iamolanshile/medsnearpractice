import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const DELIVERY_FEE = 850
const SERVICE_FEE = 150

export default function OrderConfirmation() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const product = location.state?.product
  const [quantity, setQuantity] = useState(1)
  const [confirming, setConfirming] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!product) {
      navigate('/customer/search', { replace: true })
    }
  }, [product, navigate])

  const unitPrice = useMemo(() => {
    if (!product?.price) return 0
    return Number(product.price.replace(/[^0-9]/g, '')) || 0
  }, [product])

  const subtotal = unitPrice * quantity
  const total = subtotal + DELIVERY_FEE + SERVICE_FEE

  const decrement = () => setQuantity((current) => Math.max(1, current - 1))
  const increment = () => setQuantity((current) => current + 1)

  const deliveryAddress = user?.address || 'Lekki Phase 1, Lagos'
  const customerPhone = user?.phone || '08000000000'

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      const orderPayload = {
        customer_name: user?.name || 'Customer',
        customer_phone: customerPhone,
        drug_name: product.name,
        quantity,
        total_price: total,
        delivery_address: deliveryAddress,
        notes: `Order from ${product.location}`,
      }
      const createdOrder = await api.post('/orders', orderPayload)
      setConfirming(false)
      navigate('/payment-proof', { state: { product, quantity, subtotal, total, order: createdOrder } })
    } catch (error) {
      setConfirming(false)
      alert(error?.error || 'Unable to place order. Please try again.')
    }
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="bg-surface border-b border-outline-variant py-4 px-margin-mobile md:px-margin-desktop sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Search Results › Order Details</p>
            <h1 className="mt-2 text-3xl font-bold text-on-surface">Order Confirmation</h1>
          </div>
          <div className="text-right">
            <p className="font-label-sm text-label-sm text-on-surface-variant">Ordering as</p>
            <p className="font-body-md text-body-md font-semibold">{user?.name || 'Customer'}</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-outline-variant shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-56 h-56 rounded-3xl overflow-hidden bg-surface-container">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{product.name}</h2>
                        <p className="mt-3 font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">location_on</span>
                          {product.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-headline-md text-headline-md font-bold text-primary">{product.price}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Per Blister Pack</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-primary-container/10 px-3 py-1 text-primary text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: `'FILL' 1` }}>verified</span>
                        Verified Pharmacy
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-tertiary-container/10 px-3 py-1 text-tertiary text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: `'FILL' 1` }}>inventory_2</span>
                        In Stock
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="font-label-md text-label-md text-on-surface mb-3">Quantity</p>
                    <div className="inline-flex items-center rounded-2xl border border-outline overflow-hidden">
                      <button type="button" onClick={decrement} className="px-4 py-3 text-primary hover:bg-surface-container transition-colors">-</button>
                      <span className="w-16 text-center font-headline-md text-headline-md">{quantity}</span>
                      <button type="button" onClick={increment} className="px-4 py-3 text-primary hover:bg-surface-container transition-colors">+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className="bg-white rounded-3xl border border-outline-variant shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Delivery Address</h2>
                <button type="button" onClick={() => navigate('/customer/profile')} className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Change
                </button>
              </div>
              <div className="rounded-3xl border border-primary-container bg-primary-container/5 p-5 flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-3xl mt-1">home</span>
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface">Home Address</p>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">{deliveryAddress}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">{customerPhone}</p>
                </div>
              </div>
            </section>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between rounded-3xl border border-outline-variant bg-surface-container-high p-5">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary">lock</span>
                <span className="font-body-md text-body-md">Secure 256-bit SSL Transaction</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                <span className="font-body-md text-body-md">Government Registered Pharmacies</span>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-3xl border border-outline-variant shadow-sm p-6">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Delivery Fee</span>
                    <span>₦{DELIVERY_FEE.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Service Fee</span>
                    <span>₦{SERVICE_FEE.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-outline-variant my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-headline-md text-headline-md font-semibold">Total</span>
                    <span className="font-headline-md text-headline-md font-bold text-primary">₦{total.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={confirming || success}
                  className={`mt-6 w-full h-14 rounded-2xl font-label-md text-label-md font-bold transition-all ${success ? 'bg-tertiary-container text-on-tertiary' : 'bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]'}`}
                >
                  {success ? 'Order Confirmed' : confirming ? 'Confirming...' : 'Confirm Order'}
                </button>
                {success && (
                  <p className="mt-4 rounded-2xl bg-primary-container/10 border border-primary-container p-4 text-sm text-primary">
                    Your order has been placed successfully. A delivery rider will be assigned shortly.
                  </p>
                )}
              </div>
              <div className="bg-surface-container-highest rounded-3xl border border-outline-variant p-5 text-on-surface-variant">
                <p className="font-label-sm text-label-sm">Orders are typically delivered within 45-60 minutes in Lekki Phase 1 area.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
