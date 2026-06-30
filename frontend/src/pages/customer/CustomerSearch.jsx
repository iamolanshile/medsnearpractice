import { useState } from 'react'
import { Link } from 'react-router-dom'

const recentSearches = [
  { query: 'Amoxicillin 500mg', location: 'Ikeja, Lagos' },
  { query: 'Vitamin C Drops', location: 'Surulere' },
  { query: 'Insulin Glargine', location: 'Abuja Municipal' },
]

const categories = [
  { label: 'Pain Relief', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCuaWMsAeCi-4rilsrSLYjwhL3MZxNEb1BbfkJtyN2V9DXEpSqKluHvGYzv0x5-4mMm8hNM_iFhis1mWG5zHiMDvvDhFRABOqhREKeNNPDju62gy2y7C1ifUM6s8OVD7jDTQsnmR7C4OXeje8ddATt6Ab0Bh-h5g4OoveSAZPoRL2F73901iy5zZRe52fRR7LdfCdkf1FIZis9uDECxv68iyJZ_VbI5LR2AHBRtPtTfgn3HISTgjfNvQwKxlYNX5Ft7diDLK8Jvi8' },
  { label: 'Antibiotics', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiZYUCYhODFgiPIqOSc1_bd6v_Z29w-ffc36a_6NfTMoc9ybBX6jVcfqSRd-Xd1395fD_IQrtJsCZPZtK9leP9iGCsVCUD32TaukaynA6NY3GWtCMNyY2PdJPMU1mcQkKmi2iectpatuFHkKVeohvlRbilEU2hDVSYTBKpE15qCsUAtTRutO0k5290cqUgdttNtC6yDqGICtePPDC9sxGwckkVAbP6q5nBiaHpqA_5DIXXuObEWgR8xyihdWJ6GwG7df79HBWJ3Gk' },
  { label: 'Cold & Flu', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRp6MzPINXG11ck9eCw8segKaLKkgi9w1GcvIkBVzmOIPuSbHBvRVnhmF3X6n3XGUgmd-QpOTfOrsSFC9x6daHWdsZkivEzxd37YcmWImsfi92PNiKY6fK8QX-sOJvjHHoBH0fEMj4jlbuCCQdPws4hht7i6UYEB-xbZrgyRD2elNQoVzzYHh7RM2pDfFYLcKBYqYHv0xRkf-jMGQWcxL_jPcc4SdFKlazndF_8e2qqXtLF-f7yNYqMFDM06mOFywqxnmFix_rWWs' },
  { label: 'Baby Care', icon: 'child_care' },
  { label: 'Chronic Care', icon: 'monitor_heart' },
  { label: 'All Categories', icon: 'grid_view' },
]

const features = [
  { icon: 'bolt', title: 'Instant Availability', body: "Real-time inventory tracking ensures you don't waste trips to pharmacies." },
  { icon: 'local_shipping', title: 'Swift Delivery', body: 'Order through our partner riders for delivery within 45 minutes.' },
  { icon: 'health_and_safety', title: 'Secure Payments', body: 'Pay safely online or on delivery with complete transaction security.' },
]

export default function CustomerSearch() {
  const [query, setQuery] = useState('Paracetamol')
  const [location, setLocation] = useState('Lekki')

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <header className="sticky top-0 z-40 bg-surface border-b border-outline-variant">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-margin-mobile py-4 md:px-margin-desktop">
          <div className="font-headline-md text-headline-md font-bold text-primary">MedsNear</div>
          <nav className="hidden md:flex items-center gap-8 font-label-md text-label-md text-on-surface-variant">
            <a href="#search" className="hover:text-primary transition-colors">Search Drugs</a>
            <a href="#orders" className="hover:text-primary transition-colors">My Orders</a>
            <a href="#delivery" className="hover:text-primary transition-colors">Track Delivery</a>
            <a href="#support" className="hover:text-primary transition-colors">Support</a>
          </nav>
          <div className="hidden lg:flex items-center gap-4">
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md">
              <span className="material-symbols-outlined">shopping_bag</span>
              My Orders
            </button>
            <div className="h-8 w-px bg-outline-variant" />
            <button className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-container transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                <span className="material-symbols-outlined">person</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">arrow_drop_down</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section id="search" className="relative w-full bg-surface-container-low py-16 md:py-24 px-margin-mobile md:px-margin-desktop overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10">
            <h1 className="font-display-lg text-display-lg text-primary text-center mb-4">Find reliable medications instantly.</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant text-center mb-12">
              Search across hundreds of verified pharmacies in your local area.
            </p>
            <form onSubmit={(event) => event.preventDefault()} className="bg-surface-container-lowest p-2 rounded-2xl shadow-lg border border-outline-variant flex flex-col md:flex-row items-stretch gap-2">
              <div className="flex-1 flex items-center px-4 py-3 bg-surface-container rounded-xl border border-transparent focus-within:border-primary transition-all">
                <span className="material-symbols-outlined text-primary mr-3">search</span>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="bg-transparent border-none focus:ring-0 w-full font-body-md text-body-md text-on-surface placeholder:text-outline"
                  placeholder="Enter drug name (e.g. Paracetamol)"
                />
              </div>
              <div className="md:w-1/3 flex items-center px-4 py-3 bg-surface-container rounded-xl border border-transparent focus-within:border-primary transition-all">
                <span className="material-symbols-outlined text-primary mr-3">location_on</span>
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="bg-transparent border-none focus:ring-0 w-full font-body-md text-body-md text-on-surface placeholder:text-outline"
                  placeholder="Area or LGA"
                />
              </div>
              <button className="bg-primary text-on-primary px-8 py-4 rounded-xl font-headline-md text-headline-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-headline-md text-headline-md text-on-surface">Recent Searches</h2>
                  <button className="text-primary font-label-sm text-label-sm hover:underline">Clear all</button>
                </div>
                <div className="flex flex-col gap-3">
                  {recentSearches.map((search) => (
                    <button type="button" key={`${search.query}-${search.location}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low transition-colors text-left">
                      <span className="material-symbols-outlined text-outline">history</span>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface">{search.query}</span>
                        <span className="font-label-sm text-label-sm text-outline">{search.location}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-primary-container p-6 rounded-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-headline-md text-headline-md text-on-primary-container mb-2">Verified Pharmacies Only</h3>
                  <p className="font-body-md text-body-md text-on-primary-container opacity-90">
                    Every vendor on MedsNear is vetted by the Pharmacists Council of Nigeria (PCN).
                  </p>
                </div>
                <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl text-on-primary-container opacity-10">verified_user</span>
              </div>
            </div>

            <div className="md:col-span-8">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant h-full">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-8">Popular Categories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category.label} className="group cursor-pointer">
                      <div className="aspect-square rounded-xl bg-surface-container overflow-hidden mb-3 border border-outline-variant group-hover:border-primary transition-all relative">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-on-secondary-container">{category.icon}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-white font-label-sm text-label-sm">Browse All</span>
                        </div>
                      </div>
                      <span className="font-label-md text-label-md text-on-surface block text-center">{category.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="orders" className="bg-surface-container-highest px-margin-mobile md:px-margin-desktop py-16">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
            {features.map((feature) => (
              <div key={feature.title}>
                <span className="material-symbols-outlined text-primary text-4xl mb-4">{feature.icon}</span>
                <h4 className="font-headline-md text-headline-md text-on-surface mb-2">{feature.title}</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full px-margin-mobile md:px-margin-desktop py-12 bg-surface-container-highest border-t border-outline-variant">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <div className="font-headline-md text-headline-md font-bold text-primary">MedsNear</div>
            <p className="font-body-md text-body-md text-on-surface-variant text-center md:text-left">© 2026 MedsNear. Reliable healthcare logistics.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-body-md text-body-md text-on-secondary-container">
            <a href="#" className="hover:text-on-surface transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-on-surface transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-on-surface transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>

      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-2 h-touch-target bg-surface border-t border-outline-variant shadow-xl rounded-t-xl">
        <button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl p-2 font-label-sm text-label-sm">
          <span className="material-symbols-outlined">local_pharmacy</span>
          Select Pharmacy
        </button>
        <button className="flex flex-col items-center justify-center text-on-secondary-container p-2 font-label-sm text-label-sm">
          <span className="material-symbols-outlined">add_a_photo</span>
          Upload
        </button>
        <button className="flex flex-col items-center justify-center text-on-secondary-container p-2 font-label-sm text-label-sm">
          <span className="material-symbols-outlined">payments</span>
          Earnings
        </button>
        <button className="flex flex-col items-center justify-center text-on-secondary-container p-2 font-label-sm text-label-sm">
          <span className="material-symbols-outlined">account_circle</span>
          Profile
        </button>
      </nav>
    </div>
  )
}
