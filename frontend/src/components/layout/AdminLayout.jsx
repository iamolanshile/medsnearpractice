import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/admin/dashboard',             label: 'Dashboard',      icon: 'dashboard',      end: true },
  { to: '/admin/analytics',             label: 'Analytics',      icon: 'analytics',      end: true },
  { to: '/admin/pharmacies',            label: 'Pharmacies',     icon: 'storefront',     end: true },
  { to: '/admin/orders',                label: 'Orders',         icon: 'shopping_cart',  end: true },
  { to: '/admin/payment-verifications', label: 'Verifications',  icon: 'verified',       end: true },
  { to: '/admin/payouts',               label: 'Payouts',        icon: 'payments',       end: true },
  { to: '/admin/agents',                label: 'Agents',         icon: 'group',          end: true },
  { to: '/admin/auth-logs',             label: 'Auth Logs',      icon: 'security',       end: true },
]

function NavItems({ onNavigate }) {
  return (
    <>
      {navItems.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary text-white'
                : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
          {label}
        </NavLink>
      ))}
    </>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD'

  return (
    <div className="min-h-screen bg-surface flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-56 flex-col bg-white border-r border-outline/20 sticky top-0 h-screen">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-outline/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <div>
              <p className="font-black text-primary text-sm tracking-tight leading-none">MedsNear</p>
              <p className="text-[9px] text-on-surface-variant/70 uppercase tracking-widest">Admin Console</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavItems />
        </nav>

        {/* Settings */}
        <div className="px-3 pb-2 space-y-0.5">
          <button
            onClick={() => {}}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-low hover:text-error transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>

        {/* Admin identity */}
        <div className="px-4 py-4 border-t border-outline/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-on-surface-variant">System Lead</p>
          </div>
        </div>
      </aside>

      {/* ── Right column: header + content ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-outline/20 flex items-center justify-between px-6 shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-high transition-colors mr-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by agent name, ID, or phone..."
              className="w-full rounded-full border border-outline/30 bg-surface-low py-2 pl-10 pr-4 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
            />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3 ml-4">
            <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-high transition-colors" aria-label="Notifications">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-high transition-colors" aria-label="Help">
              <span className="material-symbols-outlined text-[20px]">help</span>
            </button>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {}}
              role="button"
              aria-label="Admin profile"
            >
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs">
                {initials}
              </div>
              <span className="hidden lg:block text-sm font-semibold text-on-surface">Admin Console</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />

          <div className="relative w-64 flex flex-col bg-white h-full shadow-xl">
            <div className="px-5 py-4 border-b border-outline/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">M</span>
                </div>
                <div>
                  <p className="font-black text-primary text-sm tracking-tight leading-none">MedsNear</p>
                  <p className="text-[9px] text-on-surface-variant/70 uppercase tracking-widest">Admin Console</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-high transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              <NavItems onNavigate={() => setDrawerOpen(false)} />
            </nav>

            <div className="px-3 pb-2 space-y-0.5">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-low hover:text-error transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Logout
              </button>
            </div>

            <div className="px-4 py-4 border-t border-outline/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-on-surface-variant">System Lead</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
