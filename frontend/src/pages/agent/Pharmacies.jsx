import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../services/api'

// Static nearby placeholders (real app would use geolocation + API)
const NEARBY_STATIC = [
  { name: 'HealthPlus Lekki',  distance: '0.8 km', status: 'verified' },
  { name: 'Medix Care Plaza',  distance: '1.2 km', status: 'verified' },
  { name: "St. Mary's Chemist", distance: '2.5 km', status: 'pending' },
]

function StatusBadge({ status }) {
  if (status === 'verified')
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700">Verified</span>
  if (status === 'pending')
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-high text-on-surface-variant">Pending</span>
  return null
}

export default function AgentPharmacies() {
  const navigate   = useNavigate()
  const location   = useLocation()
  // If navigated from Upload with returnTo, go back there on selection
  const returnTo   = location.state?.returnTo || '/agent/upload'

  const [search, setSearch]         = useState('')
  const [results, setResults]       = useState([])
  const [searching, setSearching]   = useState(false)
  const [recent, setRecent]         = useState([])

  // Flag new pharmacy form
  const [flagForm, setFlagForm]     = useState({ name: '', address: '', contact: '', phone: '' })
  const [flagPhoto, setFlagPhoto]   = useState(null)
  const [flagLoading, setFlagLoading] = useState(false)
  const [flagMsg, setFlagMsg]       = useState(null)
  const fileRef                     = useRef(null)

  // Load recent pharmacies on mount
  useEffect(() => {
    api.get('/agent/pharmacies?recent=true').then((res) => setRecent(res || [])).catch(() => {})
  }, [])

  // Live search
  useEffect(() => {
    if (search.length < 2) { setResults([]); return }
    const timer = setTimeout(() => {
      setSearching(true)
      api.get(`/agent/pharmacies?q=${encodeURIComponent(search)}`)
        .then((res) => setResults(res || []))
        .catch(() => setResults([]))
        .finally(() => setSearching(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const selectPharmacy = (pharmacy) => {
    navigate(returnTo, { state: { selectedPharmacy: pharmacy }, replace: true })
  }

  const handleFlag = async (e) => {
    e.preventDefault()
    if (!flagForm.name || !flagForm.address) {
      setFlagMsg({ type: 'error', text: 'Name and address are required.' })
      return
    }
    setFlagLoading(true)
    setFlagMsg(null)
    try {
      const formData = new FormData()
      Object.entries(flagForm).forEach(([k, v]) => formData.append(k, v))
      if (flagPhoto) formData.append('photo', flagPhoto)
      await api.post('/agent/pharmacies/flag', formData)
      setFlagMsg({ type: 'success', text: 'Submitted for admin review. Thank you!' })
      setFlagForm({ name: '', address: '', contact: '', phone: '' })
      setFlagPhoto(null)
    } catch (err) {
      setFlagMsg({ type: 'error', text: err.error || 'Submission failed. Please try again.' })
    } finally {
      setFlagLoading(false)
    }
  }

  const displayList = search.length >= 2 ? results : recent

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Pharmacy Selector</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Find a pharmacy to log inventory against.</p>
        </div>
        <button
          onClick={() => navigate('/agent/upload')}
          className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Upload
        </button>
      </div>

      {/* ── Search bar ── */}
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pharmacy by name, LGA, or street address..."
          className="w-full bg-white border border-outline/30 rounded-xl py-4 pl-12 pr-36 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm text-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
          {searching && (
            <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          <button
            type="button"
            onClick={() => {}}
            className="flex items-center gap-1 bg-surface-high px-3 py-1.5 rounded-lg text-on-surface-variant text-xs font-semibold hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">near_me</span>
            Nearby
          </button>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left column */}
        <div className="lg:col-span-8 space-y-8">

          {/* Recent / Search results */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  {search.length >= 2 ? 'search' : 'history'}
                </span>
                {search.length >= 2 ? `Results for "${search}"` : 'Recent Pharmacies'}
              </h2>
            </div>

            {displayList.length === 0 && search.length >= 2 && !searching ? (
              <div className="bg-white rounded-xl border border-outline/40 p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">store_mall_directory</span>
                <p className="text-on-surface-variant text-sm mt-3">No pharmacies found for "{search}".</p>
                <p className="text-xs text-on-surface-variant/60 mt-1">Try a different name, or flag it as new using the form →</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayList.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => selectPharmacy(p)}
                    className={`text-left bg-white border rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group ${
                      p.status === 'verified' ? 'border-l-4 border-l-primary border-outline/40' : 'border-l-4 border-l-on-surface-variant/30 border-outline/40'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2 rounded-lg ${p.status === 'verified' ? 'bg-primary/10 text-primary' : 'bg-surface-high text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_pharmacy</span>
                      </div>
                      <StatusBadge status={p.status || 'verified'} />
                    </div>
                    <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">{p.name}</h3>
                    <p className="text-sm text-on-surface-variant mt-1 leading-snug">{p.address}</p>
                    <div className="mt-4 pt-3 border-t border-outline/10 flex justify-between items-center text-xs text-on-surface-variant">
                      {p.phone ? (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">call</span>{p.phone}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant/40">No phone on file</span>
                      )}
                      <span className="text-primary font-semibold flex items-center gap-1">
                        Select
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Skeleton while loading recent */}
            {displayList.length === 0 && search.length < 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-40 bg-surface-high rounded-xl animate-pulse" />
                ))}
              </div>
            )}
          </section>

          {/* Nearby section */}
          <section>
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">location_on</span>
              Pharmacies Near Your Location
            </h2>

            <div className="bg-white rounded-2xl border border-outline/40 overflow-hidden shadow-sm">
              {/* Map placeholder */}
              <div className="relative h-44 bg-surface-high overflow-hidden">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(#005232 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-primary text-white p-3 rounded-full shadow-lg animate-pulse">
                    <span className="material-symbols-outlined">my_location</span>
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-outline/20 rounded-lg px-3 py-1.5 text-xs font-semibold text-on-surface shadow-sm">
                  Lagos · Lekki Phase 1
                </div>
              </div>

              {/* Nearby table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-low border-b border-outline/20">
                    <tr className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      <th className="px-5 py-3">Pharmacy Name</th>
                      <th className="px-5 py-3">Distance</th>
                      <th className="px-5 py-3 hidden sm:table-cell">Status</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/20">
                    {NEARBY_STATIC.map((p) => (
                      <tr key={p.name} className="hover:bg-surface-low transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-on-surface text-sm">{p.name}</td>
                        <td className="px-5 py-3.5 text-on-surface-variant text-sm">{p.distance}</td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => selectPharmacy({ _id: p.name, name: p.name, address: '', status: p.status })}
                            className="text-primary font-semibold text-sm hover:underline"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* ── Right column: Flag new pharmacy ── */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-outline/40 shadow-sm sticky top-6 overflow-hidden">
            {/* Green header */}
            <div className="bg-primary text-white p-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">add_location_alt</span>
                Flag New Pharmacy
              </h3>
              <p className="text-sm text-white/80 mt-1.5 leading-relaxed">
                Can't find the pharmacy? Submit it for admin review and system entry.
              </p>
            </div>

            <form onSubmit={handleFlag} className="p-6 space-y-4">
              {flagMsg && (
                <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
                  flagMsg.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {flagMsg.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  {flagMsg.text}
                </div>
              )}

              <div>
                <label className="label">Pharmacy Name *</label>
                <input
                  required
                  type="text"
                  value={flagForm.name}
                  onChange={(e) => setFlagForm({ ...flagForm, name: e.target.value })}
                  placeholder="Enter business name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Full Address *</label>
                <textarea
                  required
                  rows={3}
                  value={flagForm.address}
                  onChange={(e) => setFlagForm({ ...flagForm, address: e.target.value })}
                  placeholder="Street, Building, LGA, State"
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Contact Person</label>
                  <input
                    type="text"
                    value={flagForm.contact}
                    onChange={(e) => setFlagForm({ ...flagForm, contact: e.target.value })}
                    placeholder="Manager name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    value={flagForm.phone}
                    onChange={(e) => setFlagForm({ ...flagForm, phone: e.target.value })}
                    placeholder="+234..."
                    className="input-field"
                  />
                </div>
              </div>

              {/* Photo upload */}
              <div>
                <label className="label">Storefront Photo</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => setFlagPhoto(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-outline/40 rounded-xl p-5 flex flex-col items-center gap-2 hover:bg-surface-low hover:border-primary transition-all group"
                >
                  {flagPhoto ? (
                    <>
                      <span className="material-symbols-outlined text-2xl text-green-600">check_circle</span>
                      <p className="text-xs font-semibold text-green-700">{flagPhoto.name}</p>
                      <p className="text-[10px] text-on-surface-variant">Click to change</p>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl text-primary group-hover:scale-110 transition-transform">add_a_photo</span>
                      <p className="text-xs font-semibold text-on-surface-variant group-hover:text-primary transition-colors">Upload Storefront Photo</p>
                      <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-wide">Max 5MB · JPG, PNG</p>
                    </>
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={flagLoading}
                className="btn-primary w-full justify-center py-3.5 disabled:opacity-60 shadow-lg shadow-primary/20"
              >
                {flagLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Submit for Review
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
