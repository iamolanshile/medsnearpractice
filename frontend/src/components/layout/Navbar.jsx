import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-outline/30 shadow-sm shadow-black/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">M</span>
          </div>
          <span className="font-black text-primary text-lg tracking-tight">MedsNear</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/how-it-works" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            How it works
          </NavLink>
          <NavLink to="/agents" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
            For agents
          </NavLink>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/agent/login" className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
            Agent login
          </Link>
          <a href="https://wa.me/2348157537642" target="_blank" rel="noreferrer" className="btn-primary text-xs py-2 px-4">
            Search on WhatsApp →
          </a>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-high transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-outline/30 px-4 py-4 space-y-1">
          <NavLink to="/how-it-works" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors">How it works</NavLink>
          <NavLink to="/agents" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors">For agents</NavLink>
          <NavLink to="/agent/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors">Agent login</NavLink>
          <div className="pt-2">
            <a href="https://wa.me/2348157537642" target="_blank" rel="noreferrer" className="btn-primary w-full justify-center text-sm">
              Search on WhatsApp →
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
