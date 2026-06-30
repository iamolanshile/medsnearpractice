import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const products = [
  {
    id: 1,
    name: 'Amoxicillin 500mg',
    price: '₦1,200',
    status: 'IN STOCK',
    location: 'Lekki Phase 1, Lagos',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-k_-5HCmVSYGXOU1jbe5h7kFvYFK7_YVaMUEz0jK4kZiV8_h5ST3tRofNQCUMkWAoTC4S1rT9hx-CzajlOzt8bL8jYHO97dDop904RfuNotIjyLLG52DO4FbjG71SxxrnCkgTwDWaejnG2mgyoUj5YUaBBbJ7cflcpkH0Sj9l-Y8Lzh1X5pKZp3jCLj0wys1cxmIBmbdVQ6H3Y-BAcws4CsmFESrhF4H1Ld8P3ZSfC4W3NjmjE6SVeXQPYEEreC29zEqYTh_1GZ8',
    stockVariant: 'primary',
  },
  {
    id: 2,
    name: 'Augmentin 625mg',
    price: '₦4,500',
    status: 'IN STOCK',
    location: 'Lekki Phase 1, Lagos',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6TdCbv27eG2ycvCkBkjTwtp3BvzSpXU5G5E9pYOoB6kk1TqQjpdNwSFuM5l75glo72EzdB3UMXh03pwdumBpkBKX51FyEziyUTVhPYIgHigMXS3LZlEfbs2pn3vo3oYbii0gLymF_G3a91v5wnhSAgyfwfSokcsdwCERoQ4YdSpyNs6jfjCY0v3ZiUccRkQmiZiPi638WTGkQo217ufyEMEeTPRnKfBcgEb7GNKd-pFQ-03Fwi2kF9iBsLV0cB2rsO85_w6HS76I',
    stockVariant: 'primary',
  },
  {
    id: 3,
    name: 'Clamoxin 500mg',
    price: '₦2,800',
    status: 'LOW STOCK',
    location: 'Oniru, Lagos',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKdQorZV-pGOgsDcApYSdjHTg82GSEI5mCZP9twJUrrfc1zpp0sd4IOvx8dR76sN459VCSatOQ3EFhDI_iX0Ua4Adv2R4Nb971eIR2KkCA2GtXOywXYmViywoLvG9qlKmj1twlR8iY0hOrW3tt8s2dU9LcMZd3MTILCAZsa6pmtu9OOP-oJ2Rsxhf6APMt6omfUVw1F0awF6n30WDMY0Pkjy1QqdJ7bnCGVwNCrj2LdVOP1sBcCYXkAEqp1eYMz96D1emGq6jDe4E',
    stockVariant: 'error-container',
  },
  {
    id: 4,
    name: 'Amoxiclav Syrup',
    price: '₦1,850',
    status: 'IN STOCK',
    location: 'Lekki Phase 1, Lagos',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyweOB3IOxajcudySqPAjSmYMIAu4TOSiBjFXZZRP3D8n9QG-yjTMxeBhcjAHQD6tHHtQEAl-pxrjDyfVioVPA7IJtnnz9ICHKH-3xLpQ-vjPHSO5CjL3oLU6y-auqSH52Ty-1EaXy4j3J71tSIbYXlvVnu0TCDUtyQq2JhA4Ad8u2Bn58xsKd4fp8oMvS3N2NVorT7FTR-XL40XqGnsKSC2FUE0OE_3Dbj5vZB5Lnc_JSHTTvoW5ShtZsasL4dDYanrF99Hgc8fM',
    stockVariant: 'primary',
  },
  {
    id: 5,
    name: 'Amoxil Forte 500mg',
    price: '₦3,100',
    status: 'IN STOCK',
    location: 'Ikoyi, Lagos',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDujRpWXUiaJ-zDWaDIXYP9fK9icyj4ALaspkJaCmC2xxnWpzlm3JOsRPICUDuZZzbp5f70G1Bd--eTcaN9WYEKUo3QcU_fBeswLfEMbyL87O_orNOhoRZ7jn10gMKnV8CUFATpZ2VtU1e4iuUfD5GKhjyvjhxMwEyn6TNE2LaxA53cLkS0pV81Fqa51EVKlAueqts0t2gFP4esroxuwrDA3PaYISbtdWW8cIqheZn_8NMyJDtVsuvIr9lMAyYqAN1L4pTmYvk2VYg',
    stockVariant: 'primary',
  },
  {
    id: 6,
    name: 'Zinnat 500mg',
    price: '₦7,200',
    status: 'IN STOCK',
    location: 'Lekki Phase 1, Lagos',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3LzVdWLqkTRAw9sEEV7By6g7p2KDAE032FFPfCRJ3YP8h6b3BSSCh4XKTNVWo0P77EFXp3WzanZJzZWkxgccNV4e4XizmQIYp5o2s2x0xW3C1AekhWB6D8ePBuPaG4bH3DInCOgY1A7gI8voK_Z0hlHyRSf5Pm7tZuQYOcJImXfLKhGXdLtGvZKUEz3Wptamgp381UfHrmvMkIsmmtOZUFOoYxWf7IWDsLa2et0a3Ay7XAwbvuy0luWtE9OjzD4BKhrtzok-Me_o',
    stockVariant: 'primary',
  },
]

const dosageOptions = ['Tablet', 'Syrup', 'Injection', 'Capsule']
const popularAreas = ['Lekki', 'Ikoyi', 'Victoria Island']

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const locationHook = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [query, setQuery] = useState('Amoxicillin 500mg')
  const [location, setLocation] = useState('Lekki Phase 1, Lagos')
  const [priceRange, setPriceRange] = useState(1200)
  const [selectedDosage, setSelectedDosage] = useState(['Tablet'])
  const [selectedAreas, setSelectedAreas] = useState(['Lekki'])
  const [likedItems, setLikedItems] = useState([1])

  useEffect(() => {
    setQuery(searchParams.get('q') || 'Amoxicillin 500mg')
    setLocation(searchParams.get('location') || 'Lekki Phase 1, Lagos')
  }, [searchParams])

  useEffect(() => {
    if (user) {
      navigate(`/customer/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`, { replace: true })
    }
  }, [user, query, location, navigate])

  const handleSearch = (event) => {
    event.preventDefault()
    navigate(`/search?q=${encodeURIComponent(query.trim() || 'Amoxicillin 500mg')}&location=${encodeURIComponent(location.trim() || 'Lekki Phase 1, Lagos')}`)
  }

  const handleCompleteOrder = (product) => {
    if (!user) {
      navigate('/signin', {
        state: {
          from: '/order',
          product,
          query,
          location,
        },
      })
      return
    }

    navigate('/order', { state: { product } })
  }

  const toggleDosage = (option) => {
    setSelectedDosage((current) =>
      current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option]
    )
  }

  const toggleArea = (area) => {
    setSelectedAreas((current) =>
      current.includes(area) ? current.filter((value) => value !== area) : [...current, area]
    )
  }

  const toggleLike = (id) => {
    setLikedItems((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  const visibleProducts = useMemo(
    () => products.filter((product) => selectedAreas.includes('Lekki') ? true : true),
    [selectedAreas]
  )

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="bg-surface border-b border-outline-variant py-4 px-margin-mobile md:px-margin-desktop sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={handleSearch} className="w-full flex flex-col md:flex-row gap-4">
            <label className="relative flex-1 block">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Drug Name"
                className="w-full pl-12 pr-4 py-3 bg-white border border-outline rounded-lg focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </label>
            <label className="relative flex-1 block">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">location_on</span>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Area"
                className="w-full pl-12 pr-4 py-3 bg-white border border-outline rounded-lg focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </label>
            <button className="w-full md:w-auto bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all">
              Update Search
            </button>
          </form>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-8 flex flex-col md:flex-row gap-8">
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-8">
          <section className="bg-white rounded-2xl border border-outline p-5 shadow-sm">
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-4 uppercase tracking-wider">Price Range (₦)</h3>
            <div className="space-y-4">
              <input
                type="range"
                min="500"
                max="20000"
                value={priceRange}
                onChange={(event) => setPriceRange(Number(event.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span>₦500</span>
                <span>₦20,000</span>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-outline p-5 shadow-sm">
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-4 uppercase tracking-wider">Dosage Form</h3>
            <div className="space-y-3">
              {dosageOptions.map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedDosage.includes(option)}
                    onChange={() => toggleDosage(option)}
                    className="w-5 h-5 border-outline rounded text-primary focus:ring-primary"
                  />
                  <span className="font-body-md text-body-md group-hover:text-primary transition-colors">{option}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-outline p-5 shadow-sm">
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-4 uppercase tracking-wider">Popular Areas</h3>
            <div className="space-y-3">
              {popularAreas.map((area) => (
                <label key={area} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedAreas.includes(area)}
                    onChange={() => toggleArea(area)}
                    className="w-5 h-5 border-outline rounded text-primary focus:ring-primary"
                  />
                  <span className="font-body-md text-body-md group-hover:text-primary transition-colors">{area}</span>
                </label>
              ))}
            </div>
          </section>
        </aside>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="font-headline-md text-headline-md text-on-surface">12 Results for “{query}”</h2>
            <div className="flex items-center gap-2 text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              <span className="font-label-md text-label-md">Sort by: Relevance</span>
              <span className="material-symbols-outlined">filter_list</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProducts.map((product) => (
              <article key={product.id} className="bg-white rounded-2xl border border-outline-variant overflow-hidden flex flex-col group hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 bg-surface-container overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    type="button"
                    onClick={() => toggleLike(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className={`material-symbols-outlined text-[20px] ${likedItems.includes(product.id) ? 'filled-icon' : ''}`}>
                      favorite
                    </span>
                  </button>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-headline-md text-[18px] text-on-surface leading-tight">{product.name}</h3>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${product.stockVariant === 'error-container' ? 'bg-error-container text-on-error-container' : 'bg-on-primary-container/10 text-primary'}`}>
                      {product.status}
                    </span>
                  </div>
                  <p className="font-headline-md text-headline-md text-primary mb-3">{product.price}</p>
                  <div className="flex items-center gap-2 text-on-surface-variant mb-6">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span className="font-body-md text-body-md">{product.location}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompleteOrder(product)}
                    className="mt-auto w-full bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md hover:bg-primary-container active:scale-95 transition-all"
                  >
                    Order Now
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline text-on-surface-variant hover:border-primary hover:text-primary transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline text-on-surface-variant hover:border-primary hover:text-primary transition-all">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline text-on-surface-variant hover:border-primary hover:text-primary transition-all">3</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline text-on-surface-variant hover:border-primary hover:text-primary transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 h-touch-target bg-surface border-t border-outline-variant shadow-lg rounded-t-xl">
        <div className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl p-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" 1` }}>search</span>
          <span className="font-label-sm text-label-sm">Search</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-secondary-container p-2 hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="font-label-sm text-label-sm">Orders</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-secondary-container p-2 hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined">local_shipping</span>
          <span className="font-label-sm text-label-sm">Tracking</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-secondary-container p-2 hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="font-label-sm text-label-sm">Profile</span>
        </div>
      </div>
    </div>
  )
}
