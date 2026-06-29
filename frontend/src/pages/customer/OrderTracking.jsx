import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

const STEPS = ['pending','confirmed','dispatched','delivered']
const LABELS = { pending:'Order placed', confirmed:'Payment confirmed', dispatched:'Out for delivery', delivered:'Delivered' }

export default function OrderTracking() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(String.fromCharCode(96) + '/customer/orders/' + String.fromCharCode(36) + '{id}' + String.fromCharCode(96))
      .then(setOrder).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className='flex justify-center py-20'><div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' /></div>

  const current = STEPS.indexOf(order.status)

  return (
    <div className='max-w-lg mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-black text-on-surface tracking-tight'>Order tracking</h1>
          <p className='text-xs text-on-surface-variant font-mono mt-0.5'>{order._id}</p>
        </div>
        <span className={String.fromCharCode(96) + 'px-3 py-1 rounded-full text-xs font-bold ' + String.fromCharCode(36) + '{order.status===' + String.fromCharCode(39) + 'delivered' + String.fromCharCode(39) + ' ? ' + String.fromCharCode(39) + 'bg-green-100 text-green-700' + String.fromCharCode(39) + ' : order.status===' + String.fromCharCode(39) + 'cancelled' + String.fromCharCode(39) + ' ? ' + String.fromCharCode(39) + 'bg-red-100 text-red-700' + String.fromCharCode(39) + ' : ' + String.fromCharCode(39) + 'bg-blue-100 text-blue-700' + String.fromCharCode(39) + '}' + String.fromCharCode(96)}>{order.status}</span>
      </div>
      <div className='bg-white rounded-xl border border-outline/40 p-5 mb-6'>
        <p className='font-bold text-on-surface'>{order.drug_name}</p>
        <div className='flex justify-between mt-3'><span className='text-sm text-on-surface-variant'>Qty: {order.quantity}</span><span className='font-black'>₦{order.total_price?.toLocaleString()}</span></div>
        <p className='text-xs text-on-surface-variant mt-1'>{order.delivery_address}</p>
      </div>
      <div className='space-y-4'>
        {STEPS.map((step, i) => (
          <div key={step} className='flex items-center gap-3'>
            <div className={String.fromCharCode(96) + 'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + String.fromCharCode(36) + '{i<=current ? ' + String.fromCharCode(39) + 'bg-primary text-white' + String.fromCharCode(39) + ' : ' + String.fromCharCode(39) + 'bg-surface-high text-on-surface-variant' + String.fromCharCode(39) + '}' + String.fromCharCode(96)}>
              {i < current ? '✓' : <span className='w-2 h-2 rounded-full bg-current' />}
            </div>
            <p className={String.fromCharCode(96) + 'text-sm font-semibold ' + String.fromCharCode(36) + '{i<=current ? ' + String.fromCharCode(39) + 'text-on-surface' + String.fromCharCode(39) + ' : ' + String.fromCharCode(39) + 'text-on-surface-variant' + String.fromCharCode(39) + '}' + String.fromCharCode(96)}>{LABELS[step]}</p>
          </div>
        ))}
      </div>
      <Link to='/orders' className='text-sm text-primary font-semibold mt-6 inline-block'>All orders</Link>
    </div>
  )
}