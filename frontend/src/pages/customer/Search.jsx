import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const STATUS_BADGE = {
  true: 'bg-tertiary-fixed text-on-tertiary-fixed',
  false: 'bg-error-container text-on-error-container',
}

export default function DrugSearch() {
  const [drug, setDrug] = useState('')
  const [area, setArea] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!drug.trim()) return
    setLoading(true)
    setHasSearched(true)
    try {
      const data = await api.get(
        `/customer/search?drug=${encodeURIComponent(drug)}&area=${encodeURIComponent(area)}`
      )
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Search header */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm mb-8">
        <h1 className="text-xl font-black text-on-surface tracking-tight mb-5">Find medication near you</h1>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              className="w-full pl-12 pr-4 h-12 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface text-sm outline-none transition-colors"
              placeholder="Drug name, e.g. Paracetamol 500mg"
              value={drug}
              onChange={e => setDrug(e.target.value)}
            />
          </div>
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeWidth="2" /><circle cx="12" cy="10" r="3" strokeWidth="2" />
            </svg>
            <input
              className="w-full pl-12 pr-4 h-12 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface text-sm outline-none transition-colors"
              placeholder="Area or City"
              value={area}
              onChange={e => setArea(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading || drug.trim().length === 0}
            className="bg-primary text-on-primary h-12 px-8 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60 whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Update Search'}
          </button>
        </form>

        {hasSearched && !loading && (
          <div className="mt-4 flex items-center justify-between text-sm text-on-surface-variant">
            <span>
              {results && results.length > 0
                ? `Showing ${results.length} results for "${drug}"${area ? ` in "${area}"` : ''}`
                : `No results for "${drug}"`}
            </span>
          </div>
        )}
      </div>

      {/* Results grid */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-outline-variant overflow-hidden">
              <div className="h-48 bg-surface-container-high animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-surface-container-high rounded animate-pulse w-3/4" />
                <div className="h-4 bg-surface-container-high rounded animate-pulse w-1/2" />
                <div className="h-10 bg-surface-container-high rounded animate-pulse mt-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {hasSearched && !loading && results && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((r) => (
            <div
              key={r._id}
              className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm group hover:border-primary hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Image placeholder */}
              <div className="relative h-48 bg-surface-container-high flex items-center justify-center">
                <svg className="w-16 h-16 text-outline-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_BADGE[r.in_stock]}`}>
                    {r.in_stock ? 'In Stock' : 'Low Stock'}
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-on-surface text-base leading-snug">{r.drug_name}</h3>
                    <span className="font-black text-primary text-base ml-2 flex-shrink-0">₦{r.price?.toLocaleString()}</span>
                  </div>
                  {r.brand && (
                    <div className="flex items-center gap-1 text-on-surface-variant text-xs mb-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" /></svg>
                      {r.brand}
                    </div>
                  )}
                  {r.area && (
                    <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeWidth="2" /><circle cx="12" cy="10" r="3" strokeWidth="2" />
                      </svg>
                      {r.area}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-outline-variant flex gap-3">
                  <button
                    onClick={() => navigate('/order', { state: { item: r } })}
                    className="flex-1 bg-primary text-on-primary h-11 rounded-lg text-sm font-semibold active:opacity-80 transition-opacity"
                  >
                    Order Now
                  </button>
                  <button className="w-11 h-11 rounded-lg border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors">
                    <svg className="w-5 h-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasSearched && !loading && results && results.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">💊</p>
          <p className="font-semibold text-on-surface text-lg">No results found</p>
          <p className="text-sm text-on-surface-variant mt-2">Try a different drug name or area.</p>
        </div>
      )}

      {!hasSearched && (
        <div className="text-center py-20 text-on-surface-variant">
          <svg className="w-16 h-16 mx-auto mb-4 text-outline-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="1.5" /><path d="m21 21-4.35-4.35" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm">Search for a drug above to see results</p>
        </div>
      )}
    </div>
  )
}
