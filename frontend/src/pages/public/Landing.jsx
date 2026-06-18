import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const [activeTab, setActiveTab] = useState('customers')
  const [searchQuery, setSearchQuery] = useState('Paracetamol')
  const [searchLocation, setSearchLocation] = useState('Lagos')
  const navigate = useNavigate()

  const flowCards = activeTab === 'customers'
    ? [
      { icon: 'search', label: 'Search', description: 'Enter the name of the medication or healthcare supply you need in our real-time network.' },
      { icon: 'map', label: 'Locate', description: 'Find the nearest verified pharmacy with available stock and transparent pricing.' },
      { icon: 'shopping_cart_checkout', label: 'Order', description: 'Reserve your item for pickup or choose delivery to your doorstep.' },
    ]
    : [
      { icon: 'assignment', label: 'Verify Requests', description: 'Receive and validate medication requests from nearby patients in your area.' },
      { icon: 'inventory', label: 'Collect Supply', description: 'Coordinate with partner pharmacies to secure and package medical inventory.' },
      { icon: 'local_shipping', label: 'Deliver & Close', description: 'Execute delivery and finalize payments through the MedsNear console.' },
    ]

  return (
    <div className="overflow-x-hidden">
      <section className="relative overflow-hidden bg-[#f7fbfa] pt-24 pb-20 sm:pt-28 sm:pb-24">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-10 h-56 w-56 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700 mb-6">
              24/7 pharmacy network
            </span>
            <h1 className="max-w-3xl text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-primary leading-tight">
              Find medications near you <span className="text-primary-dark">instantly.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-on-surface-variant leading-relaxed">
              Real-time inventory tracking across hundreds of pharmacies in Nigeria. No more calling around—find, reserve, and track your essential healthcare needs.
            </p>
            <form onSubmit={(event) => {
              event.preventDefault()
              navigate(`/search?q=${encodeURIComponent(searchQuery.trim() || 'Paracetamol')}&location=${encodeURIComponent(searchLocation.trim() || 'Lagos')}`)
            }} className="mt-10 w-full max-w-3xl">
              <div className="grid gap-3 sm:grid-cols-[1.8fr_1fr_auto] rounded-full bg-white p-2 shadow-lg shadow-slate-200/70 border border-surface-high">
                <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 border border-transparent focus-within:border-primary/20">
                  <span className="material-symbols-outlined text-primary">search</span>
                  <input
                    className="w-full bg-transparent text-sm sm:text-base text-on-surface focus:outline-none"
                    placeholder="Enter medication name..."
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 border border-transparent focus-within:border-primary/20">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <input
                    className="w-full bg-transparent text-sm sm:text-base text-on-surface focus:outline-none"
                    placeholder="Lagos"
                    type="text"
                    value={searchLocation}
                    onChange={(event) => setSearchLocation(event.target.value)}
                  />
                </div>
                <button type="submit" className="rounded-full bg-primary px-6 py-3 text-sm sm:text-base font-semibold text-white hover:bg-primary-dark transition-all">
                  Search Now
                </button>
              </div>
            </form>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-on-surface-variant">
              <div className="inline-flex items-center gap-2">
                <span className="material-symbols-outlined">verified_user</span>
                Verified Suppliers
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="material-symbols-outlined">bolt</span>
                Instant Confirmation
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-surface py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-black text-on-surface mb-4">How it Works</h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Streamlining the path between patients and life-saving medication through professional logistics and real-time data.
              </p>
            </div>
            <div className="inline-flex rounded-full bg-white border border-outline shadow-sm p-1">
              <button
                type="button"
                onClick={() => setActiveTab('customers')}
                className={`px-5 py-2 rounded-full font-medium text-sm transition ${activeTab === 'customers' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              >
                For Customers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('agents')}
                className={`px-5 py-2 rounded-full font-medium text-sm transition ${activeTab === 'agents' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              >
                For Agents
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {flowCards.map((step) => (
              <div key={step.label} className="group bg-white p-7 md:p-8 rounded-[2rem] border border-outline hover:border-primary transition-colors shadow-sm hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 text-2xl group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-on-surface mb-3">{step.label}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-on-surface mb-4">Our Trusted Pharmacy Network</h2>
          <p className="text-base text-on-surface-variant leading-relaxed mx-auto max-w-2xl">
            We partner with Nigeria's leading pharmaceutical institutions to guarantee quality and availability.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              name: 'HealthPlus',
              src: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Pharmacy_logo.svg',
              alt: 'HealthPlus logo',
            },
            {
              name: 'MedPlus',
              src: 'https://1000logos.net/wp-content/uploads/2021/06/MedPlus-logo.png',
              alt: 'MedPlus logo',
            },
            {
              name: 'Emzor',
              src: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Pharmacy_Cross.svg',
              alt: 'Emzor logo',
            },
            {
              name: 'Ilorin Pharmacy',
              src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Placeholder_full.svg/2560px-Placeholder_full.svg.png',
              alt: 'Ilorin Pharmacy logo',
            },
          ].map((partner) => (
            <div key={partner.name} className="bg-white p-6 rounded-3xl border border-outline flex items-center justify-center h-32 hover:shadow-lg transition-shadow">
              <img src={partner.src} alt={partner.alt} className="max-h-16 object-contain" />
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-[2rem] bg-primary/95 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_35%)]" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Ready to secure your medication?</h2>
              <p className="text-lg text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of Nigerians using MedsNear to bypass the stress of drug hunting. Your health cannot wait.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="https://wa.me/2348157537642" target="_blank" rel="noreferrer" className="rounded-2xl bg-white text-primary px-10 py-4 font-semibold hover:bg-slate-100 transition-all shadow-xl">
                  Start Searching
                </a>
                <button className="rounded-2xl border border-white/30 bg-transparent text-white px-10 py-4 font-semibold hover:bg-white/10 transition-all">
                  Download Mobile App
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
