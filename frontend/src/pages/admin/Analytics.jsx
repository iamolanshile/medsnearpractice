import { useState, useEffect } from 'react'
import api from '../../services/api'

const TIME_FILTERS = ['Today', 'Last 7 Days', 'Last 30 Days']

const MOST_SEARCHED = [
  { name: 'Insulin Glargine',  volume: 4520, trend: 'up' },
  { name: 'Amoxicillin 500mg', volume: 3890, trend: 'up' },
  { name: 'Paracetamol BP',    volume: 3120, trend: 'flat' },
  { name: 'Metformin HCL',     volume: 2950, trend: 'down' },
  { name: 'Ciprofloxacin',     volume: 1840, trend: 'up' },
]

const MOST_ORDERED = [
  { name: 'Paracetamol BP',    orders: 2840, stock: 'stable' },
  { name: 'Amoxicillin 500mg', orders: 2110, stock: 'low' },
  { name: 'Insulin Glargine',  orders: 1980, stock: 'stable' },
  { name: 'Loratadine',        orders: 1420, stock: 'stable' },
  { name: 'Vitamin C Drops',   orders: 1250, stock: 'stable' },
]

// Weekly bar heights as percentages
const BAR_HEIGHTS = [40, 65, 55, 85, 45, 70, 95]
const WEEK_LABELS = ['Week 1', 'Week 2', 'Week 3', 'Week 4']

function TrendIcon({ trend }) {
  if (trend === 'up')
    return <span className="material-symbols-outlined text-sm align-middle text-primary">trending_up</span>
  if (trend === 'down')
    return <span className="material-symbols-outlined text-sm align-middle text-error">trending_down</span>
  return <span className="text-on-surface-variant/40">—</span>
}

function StockBadge({ stock }) {
  if (stock === 'low')
    return <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px] uppercase">Low Stock</span>
  return <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold text-[10px] uppercase">Stable</span>
}

export default function AdminAnalytics() {
  const [timeFilter, setTimeFilter] = useState('Today')
  const [analytics, setAnalytics]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [fading, setFading]         = useState(false)

  useEffect(() => {
    api.get('/admin/analytics')
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleTimeFilter = (f) => {
    setFading(true)
    setTimeout(() => { setTimeFilter(f); setFading(false) }, 280)
  }

  const totalRevenue   = analytics?.revenue ?? 4250000
  const dispensed      = analytics?.inventory ?? 14802
  const avgDelivery    = analytics?.avgDelivery ?? 32

  return (
    <div className={`space-y-6 transition-opacity duration-300 ${fading ? 'opacity-50' : 'opacity-100'}`}>

      {/* ── Header + filters ── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Analytics Overview</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Real-time performance metrics across the healthcare network.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Time filter pill group */}
          <div className="flex bg-surface-low border border-outline/30 rounded-lg p-1 gap-0.5">
            {TIME_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => handleTimeFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                  timeFilter === f
                    ? 'bg-white shadow-sm text-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Area filter */}
          <button className="flex items-center gap-2 px-4 py-2 border border-outline/30 rounded-lg text-sm bg-white hover:bg-surface-low transition-colors">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Area Filter
          </button>
        </div>
      </div>

      {/* ── Bento grid ── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Revenue card */}
        <div className="col-span-12 lg:col-span-4 bg-primary text-white p-6 rounded-xl relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70 mb-2">
              Total Revenue (Monthly)
            </p>
            <h2 className="text-4xl font-black tracking-tight mb-4">
              {loading ? '—' : `₦${(totalRevenue / 1000000).toFixed(2)}M`}
            </h2>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full w-fit px-3 py-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span className="text-sm font-semibold">+12.4% vs last month</span>
            </div>
          </div>
          {/* bg glow */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
          <div className="absolute right-6 top-6 opacity-20 pointer-events-none">
            <span className="material-symbols-outlined text-6xl">payments</span>
          </div>
        </div>

        {/* Dispensed drugs */}
        <div className="col-span-6 lg:col-span-4 bg-white p-6 rounded-xl border border-outline/40 hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex justify-between mb-4">
            <div className="p-2 bg-surface-high rounded-lg text-primary">
              <span className="material-symbols-outlined">medication</span>
            </div>
            <span className="text-error font-bold flex items-center text-xs gap-1">
              <span className="material-symbols-outlined text-sm">trending_down</span>2.1%
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Total Dispensed Drugs</p>
          <p className="text-2xl font-black text-on-surface">
            {loading ? '—' : dispensed.toLocaleString()}{' '}
            <span className="text-base font-normal text-on-surface-variant">units</span>
          </p>
        </div>

        {/* Avg delivery time */}
        <div className="col-span-6 lg:col-span-4 bg-white p-6 rounded-xl border border-outline/40 hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg text-green-700">
              <span className="material-symbols-outlined">motorcycle</span>
            </div>
            <span className="text-primary font-bold flex items-center text-xs gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>8.5%
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Avg. Delivery Time</p>
          <p className="text-2xl font-black text-on-surface">
            {loading ? '—' : avgDelivery}{' '}
            <span className="text-base font-normal text-on-surface-variant">minutes</span>
          </p>
        </div>

        {/* Order Volume Bar Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl border border-outline/40 flex flex-col h-[400px] hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-on-surface">Order Volume Trends</h3>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />Completed
              </span>
              <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-outline/40 inline-block" />Failed
              </span>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex-1 relative border-l border-b border-outline/20 flex items-end px-2">
            <div className="w-full flex items-end justify-around h-full gap-2 pt-10">
              {BAR_HEIGHTS.map((h, i) => {
                const isLast = i === BAR_HEIGHTS.length - 1
                return (
                  <div
                    key={i}
                    className={`w-full rounded-t transition-colors cursor-pointer group relative ${
                      isLast ? 'bg-primary' : 'bg-primary/20 hover:bg-primary'
                    }`}
                    style={{ height: `${h}%` }}
                  >
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                      {(Math.round(h * 20)).toLocaleString()} Orders
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex justify-between pt-4 text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">
            {WEEK_LABELS.map((w) => <span key={w}>{w}</span>)}
          </div>
        </div>

        {/* Active Agents Map */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl border border-outline/40 flex flex-col h-[400px] hover:-translate-y-0.5 hover:shadow-md transition-all">
          <h3 className="text-lg font-bold text-on-surface mb-4">Active Agents by Area</h3>
          <div className="flex-1 rounded-lg bg-surface-low overflow-hidden relative border border-outline/20">
            {/* Grid dot background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(#005232 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            {/* Lekki bubble */}
            <div className="absolute top-1/4 right-1/4 flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full animate-ping absolute" />
              <div className="w-8 h-8 bg-primary rounded-full shadow-lg flex items-center justify-center text-white text-[10px] font-bold z-10">42</div>
              <span className="text-[10px] font-bold bg-white px-2 py-0.5 mt-1 border border-outline/30 rounded shadow-sm">Lekki</span>
            </div>

            {/* Surulere bubble */}
            <div className="absolute bottom-1/3 left-1/3 flex flex-col items-center">
              <div className="w-6 h-6 bg-primary rounded-full shadow-lg flex items-center justify-center text-white text-[10px] font-bold">28</div>
              <span className="text-[10px] font-bold bg-white px-2 py-0.5 mt-1 border border-outline/30 rounded shadow-sm">Surulere</span>
            </div>

            {/* Ikeja bubble */}
            <div className="absolute top-1/2 left-1/4 flex flex-col items-center">
              <div className="w-10 h-10 bg-primary/60 rounded-full shadow-lg flex items-center justify-center text-white text-[10px] font-bold">35</div>
              <span className="text-[10px] font-bold bg-white px-2 py-0.5 mt-1 border border-outline/30 rounded shadow-sm">Ikeja</span>
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 right-3 p-2 bg-white border border-outline/30 rounded-lg shadow-sm text-[11px] space-y-1">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary inline-block" />High Density</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary/40 inline-block" />Moderate</div>
            </div>
          </div>
        </div>

        {/* Most Searched Drugs table */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-xl border border-outline/40 overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="px-5 py-4 border-b border-outline/20 bg-surface-low/30 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface">Most Searched Drugs</h3>
            <button className="text-primary text-xs font-bold hover:underline">View All</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-surface-low/20">
              <tr className="text-[11px] uppercase text-on-surface-variant font-bold">
                <th className="px-5 py-3">Drug Name</th>
                <th className="px-5 py-3">Search Volume</th>
                <th className="px-5 py-3">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/20 text-sm">
              {MOST_SEARCHED.map((d) => (
                <tr key={d.name} className="hover:bg-surface-low/20 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-on-surface">{d.name}</td>
                  <td className="px-5 py-3.5 text-on-surface-variant">{d.volume.toLocaleString()}</td>
                  <td className="px-5 py-3.5"><TrendIcon trend={d.trend} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Most Ordered Drugs table */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-xl border border-outline/40 overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="px-5 py-4 border-b border-outline/20 bg-surface-low/30 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface">Most Ordered Drugs</h3>
            <button className="text-primary text-xs font-bold hover:underline">View All</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-surface-low/20">
              <tr className="text-[11px] uppercase text-on-surface-variant font-bold">
                <th className="px-5 py-3">Drug Name</th>
                <th className="px-5 py-3">Completed Orders</th>
                <th className="px-5 py-3">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/20 text-sm">
              {MOST_ORDERED.map((d) => (
                <tr key={d.name} className="hover:bg-surface-low/20 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-on-surface">{d.name}</td>
                  <td className="px-5 py-3.5 text-on-surface-variant">{d.orders.toLocaleString()}</td>
                  <td className="px-5 py-3.5"><StockBadge stock={d.stock} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>{/* end bento grid */}
    </div>
  )
}
