import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AgentUpload() {
  const [pharmacies, setPharmacies] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ pharmacy_id: '', drug_name: '', brand: '', price: '', quantity: '', expiry_date: '' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showNewPharmacy, setShowNewPharmacy] = useState(false)
  const [newPharm, setNewPharm] = useState({ name: '', address: '', lga: '', state: 'Lagos' })

  useEffect(() => {
    if (search.length >= 2) {
      api.get(`/agent/pharmacies?q=${search}`).then(setPharmacies).catch(() => {})
    }
  }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.pharmacy_id) return setStatus({ type: 'error', msg: 'Please select a pharmacy.' })
    setLoading(true)
    setStatus(null)
    try {
      await api.post('/agent/inventory', { ...form, price: Number(form.price), quantity: Number(form.quantity) })
      setStatus({ type: 'success', msg: 'Upload successful! Keep going 💪' })
      setForm({ pharmacy_id: '', drug_name: '', brand: '', price: '', quantity: '', expiry_date: '' })
      setSearch('')
    } catch (err) {
      setStatus({ type: 'error', msg: err.error || 'Upload failed. Try again.' })
    } finally { setLoading(false) }
  }

  const handleAddPharmacy = async (e) => {
    e.preventDefault()
    try {
      const p = await api.post('/agent/pharmacies', newPharm)
      setPharmacies([p, ...pharmacies])
      setForm({ ...form, pharmacy_id: p._id })
      setSearch(p.name)
      setShowNewPharmacy(false)
      setNewPharm({ name: '', address: '', lga: '', state: 'Lagos' })
    } catch (err) {
      alert(err.error || 'Failed to add pharmacy')
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Upload inventory</h1>
        <p className="text-sm text-on-surface-variant mt-1">Log a drug from a pharmacy you're visiting.</p>
      </div>

      {status && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${status.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-outline/40 p-5 space-y-4">
        {/* Pharmacy selector */}
        <div>
          <label className="label">Pharmacy</label>
          <div className="relative">
            <input
              className="input-field"
              placeholder="Search pharmacy name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setForm({ ...form, pharmacy_id: '' }) }}
            />
            {pharmacies.length > 0 && !form.pharmacy_id && (
              <div className="absolute top-full left-0 right-0 bg-white border border-outline/40 rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                {pharmacies.map((p) => (
                  <button key={p._id} type="button" onClick={() => { setForm({ ...form, pharmacy_id: p._id }); setSearch(p.name); setPharmacies([]) }}
                    className="w-full text-left px-4 py-2.5 hover:bg-surface-low text-sm transition-colors">
                    <p className="font-medium text-on-surface">{p.name}</p>
                    <p className="text-xs text-on-surface-variant">{p.address}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={() => setShowNewPharmacy(!showNewPharmacy)} className="text-xs text-primary font-semibold mt-1.5 hover:underline">
            + Add new pharmacy
          </button>
        </div>

        {/* New pharmacy form */}
        {showNewPharmacy && (
          <div className="bg-surface-low rounded-xl p-4 space-y-3 border border-outline/30">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">New pharmacy</p>
            <input className="input-field" placeholder="Pharmacy name" value={newPharm.name} onChange={(e) => setNewPharm({ ...newPharm, name: e.target.value })} />
            <input className="input-field" placeholder="Address" value={newPharm.address} onChange={(e) => setNewPharm({ ...newPharm, address: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="LGA" value={newPharm.lga} onChange={(e) => setNewPharm({ ...newPharm, lga: e.target.value })} />
              <input className="input-field" placeholder="State" value={newPharm.state} onChange={(e) => setNewPharm({ ...newPharm, state: e.target.value })} />
            </div>
            <button type="button" onClick={handleAddPharmacy} className="btn-primary text-xs py-2 px-4">Add pharmacy</button>
          </div>
        )}

        {/* Drug details */}
        <div>
          <label className="label">Drug name *</label>
          <input required className="input-field" placeholder="e.g. Amoxicillin 500mg" value={form.drug_name} onChange={(e) => setForm({ ...form, drug_name: e.target.value })} />
        </div>
        <div>
          <label className="label">Brand / Manufacturer</label>
          <input className="input-field" placeholder="e.g. Beecham" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Price (₦) *</label>
            <input required type="number" min="0" className="input-field" placeholder="850" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="label">Quantity in stock *</label>
            <input required type="number" min="0" className="input-field" placeholder="24" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Expiry date</label>
          <input type="date" className="input-field" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
          {loading ? 'Uploading...' : 'Submit upload'}
        </button>
      </form>
    </div>
  )
}
