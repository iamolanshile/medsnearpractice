import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../../services/api'

const DRUG_SUGGESTIONS = [
  'Paracetamol 500mg', 'Amoxicillin 500mg', 'Amoxicillin 250mg',
  'Artemether-Lumefantrine', 'Metformin 500mg', 'Lisinopril 10mg',
  'Ciprofloxacin 500mg', 'Ibuprofen 400mg', 'Omeprazole 20mg',
  'Insulin Glargine', 'Loratadine 10mg', 'Cotrimoxazole 480mg',
  'Vitamin C 500mg', 'Folic Acid 5mg', 'Diclofenac 50mg',
]

function StockBadge({ qty }) {
  if (qty > 10) return <span className="px-2 py-0.5 bg-green-100 text-green-700 font-bold text-[10px] rounded">{qty} in stock</span>
  if (qty > 0)  return <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded">Low Stock: {qty}</span>
  return <span className="px-2 py-0.5 bg-surface-high text-on-surface-variant font-bold text-[10px] rounded">Out of stock</span>
}

export default function AgentUpload() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const [form, setForm] = useState({
    pharmacy_id: '', drug_name: '', brand: '', price: '', quantity: 1, expiry_date: '',
  })
  const [selectedPharmacy, setSelectedPharmacy] = useState(null)
  const [photo, setPhoto]           = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSugg, setShowSugg]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [errorMsg, setErrorMsg]     = useState('')
  const [recent, setRecent]         = useState([])
  const [recentKey, setRecentKey]   = useState(0)

  const suggRef = useRef(null)
  const fileRef = useRef(null)

  // Receive pharmacy from Pharmacies page
  useEffect(() => {
    const p = location.state?.selectedPharmacy
    if (p) {
      setSelectedPharmacy(p)
      setForm((f) => ({ ...f, pharmacy_id: p._id }))
      window.history.replaceState({}, '')
    }
  }, [location.state])

  // Load recent uploads
  useEffect(() => {
    api.get('/agent/inventory/history?page=1')
      .then((res) => setRecent((res.data || []).slice(0, 3)))
      .catch(() => {})
  }, [recentKey])

  // Drug name autocomplete filter
  useEffect(() => {
    const q = form.drug_name.trim().toLowerCase()
    if (q.length < 2) { setSuggestions([]); return }
    setSuggestions(DRUG_SUGGESTIONS.filter((d) => d.toLowerCase().includes(q)).slice(0, 5))
  }, [form.drug_name])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (suggRef.current && !suggRef.current.contains(e.target)) setShowSugg(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const adjustQty = (delta) =>
    setForm((f) => ({ ...f, quantity: Math.max(0, Number(f.quantity) + delta) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.pharmacy_id) { setErrorMsg('Please select a pharmacy first.'); return }
    setErrorMsg('')
    setLoading(true)
    try {
      const payload = new FormData()
      Object.entries(form).forEach(([k, v]) => payload.append(k, k === 'quantity' ? Number(v) : k === 'price' ? Number(v) : v))
      if (photo) payload.append('photo', photo)
      await api.post('/agent/inventory', payload)
      navigate('/agent/upload/success', {
        state: {
          pharmacyName: selectedPharmacy.name,
          pharmacy:     selectedPharmacy,
          drugName:     form.drug_name,
          txRef:        `INV-${Math.floor(Math.random() * 90000 + 10000)}-${Date.now().toString(36).toUpperCase()}`,
        },
      })
      setForm({ pharmacy_id: form.pharmacy_id, drug_name: '', brand: '', price: '', quantity: 1, expiry_date: '' })
      setPhoto(null)
      setRecentKey((k) => k + 1)
    } catch (err) {
      setErrorMsg(err.error || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setForm({ pharmacy_id: '', drug_name: '', brand: '', price: '', quantity: 1, expiry_date: '' })
    setSelectedPharmacy(null)
    setPhoto(null)
    setErrorMsg('')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">

      {/* ── Header ── */}
      <header>
        <h1 className="text-3xl font-black text-primary tracking-tight">Upload Inventory</h1>
        {selectedPharmacy ? (
          <div className="flex items-center gap-2 text-on-surface-variant mt-1.5">
            <span className="material-symbols-outlined text-[20px]">local_pharmacy</span>
            <p className="text-sm">{selectedPharmacy.name}{selectedPharmacy.address ? ` · ${selectedPharmacy.address}` : ''}</p>
            <button
              type="button"
              onClick={() => { setSelectedPharmacy(null); setForm((f) => ({ ...f, pharmacy_id: '' })) }}
              className="text-xs text-primary font-semibold hover:underline ml-1"
            >
              Change
            </button>
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant mt-1">Select a pharmacy to begin logging inventory.</p>
        )}
      </header>

      {/* ── Error banner ── */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>{errorMsg}
        </div>
      )}

      {/* ── Form ── */}
      <section className="bg-white border border-outline/40 rounded-xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Pharmacy picker */}
          {!selectedPharmacy ? (
            <div>
              <label className="label">Pharmacy *</label>
              <button
                type="button"
                onClick={() => navigate('/agent/pharmacies', { state: { returnTo: '/agent/upload' } })}
                className="w-full flex items-center justify-between border-2 border-dashed border-outline/40 rounded-xl px-4 py-4 hover:bg-surface-low hover:border-primary transition-all group"
              >
                <span className="flex items-center gap-3 text-sm text-on-surface-variant group-hover:text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[22px]">storefront</span>
                  Browse and select a pharmacy…
                </span>
                <span className="material-symbols-outlined text-primary">arrow_forward</span>
              </button>
            </div>
          ) : null}

          {/* Drug fields grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Drug name with autocomplete */}
            <div ref={suggRef} className="relative">
              <label className="label">Drug Name *</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  required
                  type="text"
                  className="input-field pl-11"
                  placeholder="Search drug name (e.g. Paracetamol)"
                  value={form.drug_name}
                  onChange={(e) => { set('drug_name')(e); setShowSugg(true) }}
                  onFocus={() => setShowSugg(true)}
                  autoComplete="off"
                />
              </div>
              {showSugg && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-outline/40 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={() => { setForm({ ...form, drug_name: s }); setShowSugg(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-low transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Brand */}
            <div>
              <label className="label">Brand / Manufacturer</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Emzor, GSK"
                value={form.brand}
                onChange={set('brand')}
              />
            </div>

            {/* Price */}
            <div>
              <label className="label">Price *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-sm">₦</span>
                <input
                  required
                  type="number"
                  min="0"
                  className="input-field pl-8"
                  placeholder="0.00"
                  value={form.price}
                  onChange={set('price')}
                />
              </div>
            </div>

            {/* Quantity stepper */}
            <div>
              <label className="label">Quantity in Stock *</label>
              <div className="flex items-center border border-outline rounded-xl overflow-hidden h-[46px]">
                <button
                  type="button"
                  onClick={() => adjustQty(-1)}
                  className="px-4 h-full bg-surface-low hover:bg-surface-high active:bg-outline/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <input
                  required
                  type="number"
                  min="0"
                  className="flex-1 text-center border-none bg-white h-full text-sm font-semibold focus:ring-0 outline-none"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Math.max(0, Number(e.target.value)) })}
                />
                <button
                  type="button"
                  onClick={() => adjustQty(1)}
                  className="px-4 h-full bg-surface-low hover:bg-surface-high active:bg-outline/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
            </div>

            {/* Expiry date */}
            <div className="md:col-span-2">
              <label className="label">Expiry Date</label>
              <input
                type="date"
                className="input-field"
                value={form.expiry_date}
                onChange={set('expiry_date')}
              />
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label className="label">Photo of Medication</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-outline/40 rounded-xl p-10 bg-surface-low flex flex-col items-center justify-center text-center hover:border-primary hover:bg-white transition-all cursor-pointer group"
            >
              {photo ? (
                <>
                  <div className="w-16 h-16 bg-green-100 flex items-center justify-center rounded-full mb-3">
                    <span className="material-symbols-outlined text-green-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <p className="text-sm font-semibold text-on-surface">{photo.name}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Click to change photo</p>
                </>
              ) : (
                <>
                  <div className="mb-4 w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
                  </div>
                  <p className="text-sm font-semibold text-on-surface mb-1">Drag and drop or click to upload</p>
                  <p className="text-xs text-on-surface-variant max-w-xs">
                    Upload a clear photo showing the drug name and expiry date.
                  </p>
                  <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-wider mt-2">Max 5MB · JPG, PNG, WEBP</p>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary h-12 justify-center text-sm font-bold disabled:opacity-60 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Submit to Inventory
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-8 h-12 border border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary/5 transition-all"
            >
              Clear Form
            </button>
          </div>
        </form>
      </section>

      {/* ── Recently Added ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-primary">Recently Added</h2>
          <Link
            to="/agent/uploads"
            className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
          >
            View All Inventory
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 bg-surface-high rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recent.map((u) => (
              <div key={u._id} className="bg-white border border-outline/40 rounded-xl overflow-hidden shadow-sm">
                {/* Placeholder image area */}
                <div className="h-32 bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary/40 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    medication
                  </span>
                </div>
                <div className="p-4">
                  {u.brand && (
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">{u.brand}</p>
                  )}
                  <h3 className="text-sm font-bold text-on-surface mb-2 truncate">{u.drug_name}</h3>
                  <div className="flex justify-between items-center">
                    <StockBadge qty={u.quantity} />
                    <span className="text-sm font-bold text-on-surface-variant">₦{u.price?.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-2">
                    {u.pharmacy_id?.name || 'Unknown pharmacy'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
