import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../services/api'

const defaultOrder = {
  id: '#MF-88231',
  estimatedDelivery: 'Today, 2:45 PM',
  status: 'dispatched',
  address: 'Plot 24, Admiralty Way, Lekki Phase 1, Lagos, Nigeria.',
  total: 2200,
  items: [
    { name: 'Amoxicillin 500mg', quantity: 1, price: 1200 },
    { name: 'Paracetamol 500mg', quantity: 2, price: 600 },
  ],
  timeline: [
    { label: 'Pending', time: '10:05 AM', completed: true },
    { label: 'Confirmed', time: '10:12 AM', completed: true },
    { label: 'Dispatched', time: '1:30 PM', completed: true },
    { label: 'Delivered', time: '--:--', completed: false },
  ],
  rider: {
    name: 'Ibrahim Ahmed',
    role: 'Delivery Hero',
    rating: 4.9,
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy6yRZuooZVV5kS-ilCFh1-_txkBy4bs4lMumRnh6NT4Q8BDgLuYPK82rrMfdT2888J34tqGt8uI4RzXujPpvPmBBu7YFvVUovyttrZYiNkoJWKBwL8LAXVyMiKMwe6AOgsOBVxCOJ5u_lW0TZBdNfHsYXB4GGpmEnX04qfScUbR_YGwFOhIkF0JVK8NUkSpzk5rvY8IYuZmY6wXHAPSGIXuThOYJJsK3r5_t-I3LOfezZEGtn2vtebv3KBw_ABKLQtbJMhgJwSgY',
  },
}

export default function TrackOrder() {
  const location = useLocation()
  const navigate = useNavigate()
  const [order, setOrder] = useState(location.state?.order || defaultOrder)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const orderId = location.state?.orderId
    if (!location.state?.order && orderId) {
      setLoading(true)
      api.get(`/orders/${orderId}`)
        .then((fetchedOrder) => {
          setOrder({
            id: `#${fetchedOrder._id.slice(-8).toUpperCase()}`,
            estimatedDelivery: 'Today, 2:45 PM',
            status: fetchedOrder.status || 'pending',
            address: fetchedOrder.delivery_address || 'Lekki Phase 1, Lagos',
            total: fetchedOrder.total_price || 0,
            items: [
              { name: fetchedOrder.drug_name, quantity: fetchedOrder.quantity || 1, price: fetchedOrder.total_price || 0 },
            ],
            timeline: [
              { label: 'Pending', time: '--:--', completed: fetchedOrder.status !== 'pending' },
              { label: 'Confirmed', time: '--:--', completed: fetchedOrder.status === 'confirmed' || fetchedOrder.status === 'in_progress' || fetchedOrder.status === 'delivered' },
              { label: 'Dispatched', time: '--:--', completed: fetchedOrder.status === 'in_progress' || fetchedOrder.status === 'delivered' },
              { label: 'Delivered', time: '--:--', completed: fetchedOrder.status === 'delivered' },
            ],
            rider: {
              name: 'Ibrahim Ahmed',
              role: 'Delivery Hero',
              rating: 4.9,
              photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy6yRZuooZVV5kS-ilCFh1-_txkBy4bs4lMumRnh6NT4Q8BDgLuYPK82rrMfdT2888J34tqGt8uI4RzXujPpvPmBBu7YFvVUovyttrZYiNkoJWKBwL8LAXVyMiKMwe6AOgsOBVxCOJ5u_lW0TZBdNfHsYXB4GGpmEnX04qfScUbR_YGwFOhIkF0JVK8NUkSpzk5rvY8IYuZmY6wXHAPSGIXuThOYJJsK3r5_t-I3LOfezZEGtn2vtebv3KBw_ABKLQtbJMhgJwSgY',
            },
          })
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
          navigate('/customer/search')
        })
    }
  }, [location.state, navigate])

  const activeProgress = order.timeline.filter((step) => step.completed).length

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-body-md text-body-md text-on-surface-variant">Loading your order status…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="bg-surface border-b border-outline-variant py-4 px-margin-mobile md:px-margin-desktop sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Track Your Medicine</h1>
            <p className="text-body-md text-on-surface-variant">Real-time status of your pharmaceutical supplies.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/customer/search')}
            className="rounded-full border border-outline-variant bg-white px-5 py-2 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
          >
            Back to search
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Order ID</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">{order.id}</h2>
                </div>
                <div className="text-left md:text-right">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estimated Delivery</span>
                  <p className="font-body-lg text-body-lg font-bold text-primary">{order.estimatedDelivery}</p>
                </div>
              </div>

              <div className="relative py-8">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-surface rounded transform -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-0 h-1 bg-primary rounded transform -translate-y-1/2" style={{ width: `${(activeProgress / order.timeline.length) * 100}%` }} />
                <div className="relative flex justify-between">
                  {order.timeline.map((step, index) => (
                    <div key={step.label} className="flex flex-col items-center text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant border border-outline-variant'}`}>
                        {step.completed ? (
                          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: `'FILL' 1` }}>check_circle</span>
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <span className={`mt-3 font-label-md text-label-md ${step.completed ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{step.label}</span>
                      <span className="text-label-sm text-on-surface-variant mt-1">{step.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm h-[420px] relative">
              <div className="absolute top-4 left-4 z-20 bg-surface/90 backdrop-blur-md px-4 py-2 rounded-lg border border-outline-variant shadow-sm flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="font-label-md text-label-md font-semibold text-primary">Rider is 1.2km away</span>
              </div>
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80')" }} />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-3xl p-4 border border-outline-variant shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={order.rider.photo} alt={order.rider.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
                  <div>
                    <p className="font-label-md text-label-md font-bold text-on-surface">{order.rider.name}</p>
                    <p className="text-label-sm text-on-surface-variant">{order.rider.role} • ★ {order.rider.rating}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => alert('Calling rider...')} className="rounded-full bg-surface-container p-3 text-primary hover:bg-primary-container/10 transition-all">
                    <span className="material-symbols-outlined">call</span>
                  </button>
                  <button type="button" onClick={() => alert('Opening chat...')} className="rounded-full bg-primary text-white p-3 hover:bg-primary-container transition-all">
                    <span className="material-symbols-outlined">chat</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h3 className="font-label-md text-label-md font-bold text-on-surface mb-4 border-b border-outline-variant pb-2">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {order.items.map((item) => (
                  <div key={item.name} className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-body-md text-body-md text-on-surface">{item.name}</p>
                      <p className="text-sm text-on-surface-variant">x{item.quantity}</p>
                    </div>
                    <p className="font-label-md text-label-md font-bold text-on-surface">₦{item.price}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t border-outline-variant pt-4">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>₦{order.items.reduce((sum, item) => sum + item.price, 0)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Delivery Fee</span>
                  <span>₦400</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Service Fee</span>
                  <span>₦200</span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-on-surface">
                  <span>Total Amount</span>
                  <span>₦{order.total}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm">
              <h3 className="font-label-md text-label-md font-bold text-on-surface mb-4">Payment Details</h3>
              <div className="space-y-3 text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-semibold text-on-surface">{order.payment_confirmed ? 'Confirmed' : 'Pending'}</span>
                </div>
                {order.paymentProofName && (
                  <div>
                    <span className="block text-sm text-on-surface-variant">Proof file</span>
                    <p className="font-semibold text-on-surface">{order.paymentProofName}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-surface-container rounded-xl border border-outline-variant p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <p className="font-label-md text-label-md font-bold text-on-surface">Delivery Address</p>
              </div>
              <p className="text-label-sm text-on-surface-variant leading-relaxed">{order.address}</p>
            </div>

            <div className="bg-primary-container text-on-primary-container rounded-xl p-6 shadow-sm">
              <h3 className="font-label-md text-label-md font-bold mb-3">Need Help with this Order?</h3>
              <p className="text-label-sm text-on-primary-container mb-4">Our support team is available 24/7 for medical emergencies or delivery issues.</p>
              <button type="button" onClick={() => alert('Connecting to support...')} className="w-full bg-white text-primary font-semibold rounded-xl py-3 hover:bg-surface transition-all">
                Chat with Support
              </button>
              <button type="button" onClick={() => alert('Reporting issue...')} className="mt-3 w-full border border-white/40 bg-transparent text-white font-semibold rounded-xl py-3 hover:bg-white/10 transition-all">
                Report an Issue
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
