import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-outline/30 shadow-sm shadow-black/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-sm shadow-primary/20">
            <span className="text-white font-black text-base">M</span>
          </div>
          <div>
            <p className="font-black text-primary text-base tracking-tight leading-none">MedsNear</p>
            <p className="text-[11px] text-on-surface-variant uppercase tracking-[0.18em]">Medication Near You</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-label-md text-label-md text-on-surface-variant">
          <Link to="/search" className="hover:text-primary transition-colors">Search Drugs</Link>
          <Link to="/customer/orders" className="hover:text-primary transition-colors">My Orders</Link>
          <Link to="/track-order" className="hover:text-primary transition-colors">Track Delivery</Link>
          <a href="#support" className="hover:text-primary transition-colors">Support</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden lg:flex items-center gap-3 rounded-full border border-outline-variant bg-surface px-3 py-2">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-semibold">
                  {user.name?.split(' ').map((part) => part[0]).join('')}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-label-md text-label-md text-on-surface">{user.name}</span>
                  <span className="text-xs text-on-surface-variant">Customer</span>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('mn_token')
                  localStorage.removeItem('mn_user')
                  window.location.href = '/signin'
                }}
                className="hidden lg:inline-flex items-center gap-2 rounded-full border border-outline-variant px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/signin" className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
              Sign In
            </Link>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-high transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-outline/30 px-4 py-4 space-y-2">
          <Link to="/search" onClick={() => setOpen(false)} className="block px-3 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors">
            Search Drugs
          </Link>
          <Link to="/customer/orders" onClick={() => setOpen(false)} className="block px-3 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors">
            My Orders
          </Link>
          <Link to="/track-order" onClick={() => setOpen(false)} className="block px-3 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors">
            Track Delivery
          </Link>
          <a href="#support" className="block px-3 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors">
            Support
          </a>
          {user ? (
            <Link to="/customer/orders" onClick={() => setOpen(false)} className="block w-full text-left px-3 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors">
              Account
            </Link>
          ) : (
            <Link to="/signin" onClick={() => setOpen(false)} className="block px-3 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors">
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
