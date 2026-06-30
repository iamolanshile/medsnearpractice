import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/agent/dashboard',   label: 'Dashboard',    icon: 'dashboard',       end: true },
  { to: '/agent/pharmacies',  label: 'Pharmacies',   icon: 'storefront',      end: true },
  { to: '/agent/upload',      label: 'Upload',        icon: 'upload_file',     end: true },
  { to: '/agent/uploads',     label: 'My Uploads',   icon: 'inventory_2',     end: true },
  { to: '/agent/earnings',    label: 'Earnings',      icon: 'payments',        end: true },
  { to: '/agent/profile',     label: 'Profile',       icon: 'manage_accounts', end: true },
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

function VerificationBadge({ status }) {
  if (status === 'verified')
    return <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Verified</span>
  if (status === 'pending')
    return <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Pending</span>
  return <span className="text-[10px] font-bold text-on-surface-variant/60 bg-surface-high px-1.5 py-0.5 rounded-full">Unverified</span>
}

export default function AgentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/agent/login') }

  const initials = user?.name?.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'AG'

  const IdentityBlock = () => (
    <div className="px-4 py-3 border-b border-outline/20 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm shrink-0">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">{user?.name || 'Agent'}</p>
        <VerificationBadge status={user?.verification_status} />
      </div>
    </div>
  )

  const LogoutButton = () => (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-red-50 hover:text-error transition-all"
    >
      <span className="material-symbols-outlined text-[20px]">logout</span>
      Log out
    </button>
  )

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
              <p className="text-[9px] text-on-surface-variant/60 uppercase tracking-widest">Agent Portal</p>
            </div>
          </div>
        </div>

        {/* Agent identity */}
        {user && <IdentityBlock />}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavItems />
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-4 space-y-0.5 border-t border-outline/20 pt-3">
          <LogoutButton />
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white border-b border-outline/20 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">M</span>
          </div>
          <span className="font-black text-primary text-sm tracking-tight">MedsNear</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-high transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-64 flex flex-col bg-white h-full shadow-xl">
            {/* Header */}
            <div className="px-5 py-4 border-b border-outline/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">M</span>
                </div>
                <div>
                  <p className="font-black text-primary text-sm tracking-tight leading-none">MedsNear</p>
                  <p className="text-[9px] text-on-surface-variant/60 uppercase tracking-widest">Agent Portal</p>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu"
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-high transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {user && <IdentityBlock />}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              <NavItems onNavigate={() => setDrawerOpen(false)} />
            </nav>
            <div className="px-3 pb-4 space-y-0.5 border-t border-outline/20 pt-3">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}

      {/* ── Page content ── */}
      <main className="flex-1 p-6 lg:pt-6 pt-20 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
