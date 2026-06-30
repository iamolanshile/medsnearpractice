import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const STATUS_STYLES = { pending:'bg-yellow-100 text-yellow-800', confirmed:'bg-blue-100 text-blue-700', dispatched:'bg-purple-100 text-purple-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700' }

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/customer/orders').then(setOrders).catch(console.error).finally(() => setLoading(false)) }, [])
  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-black text-on-surface tracking-tight mb-6'>My orders</h1>
      {loading ? (
        <div className='space-y-3'>{[...Array(3)].map((_,i)=><div key={i} className='h-20 bg-surface-high rounded-xl animate-pulse'/>)}</div>
      ) : orders.length === 0 ? (
        <div className='text-center py-16'>
          <p className='text-4xl mb-3'>📦</p>
          <p className='font-semibold text-on-surface'>No orders yet</p>
          <Link to='/search' className='btn-primary mt-4 inline-flex px-6 py-2.5 text-sm'>Find medication</Link>
        </div>
      ) : (
        <div className='space-y-3'>
          {orders.map(o => (
            <Link key={o._id} to={String.fromCharCode(96)+'/orders/'+String.fromCharCode(36)+'{o._id}'+String.fromCharCode(96)}
              className='block bg-white rounded-xl border border-outline/40 p-5 hover:border-primary/40 transition-colors'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='font-bold text-on-surface'>{o.drug_name}</p>
                  <p className='text-xs text-on-surface-variant mt-0.5'>Qty: {o.quantity}</p>
                </div>
                <div className='text-right'>
                  <p className='font-black text-on-surface'>₦{o.total_price?.toLocaleString()}</p>
                  <span className={String.fromCharCode(96)+'inline-block px-2 py-0.5 rounded-full text-xs font-bold mt-1 '+String.fromCharCode(36)+'{STATUS_STYLES[o.status]||'+String.fromCharCode(39)+'bg-surface-high text-on-surface-variant'+String.fromCharCode(39)+'}'+String.fromCharCode(96)}>{o.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}