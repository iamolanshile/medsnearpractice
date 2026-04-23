import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/agent/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/agent/upload', icon: '↑', label: 'Upload' },
  { to: '/agent/uploads', icon: '☰', label: 'My Uploads' },
  { to: '/agent/earnings', icon: '₦', label: 'Earnings' },
  { to: '/agent/profile', icon: '◯', label: 'Profile' },
]

export default function AgentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/agent/login') }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-white border-r border-outline/30 sticky top-0 h-screen">
        <div className="p-5 border-b border-outline/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-black text-xs">M</span>
            </div>
            <span className="font-black text-primary text-base tracking-tight">MedsNear</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60 mt-1 font-label">Agent Portal</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`
            }>
              <span className="font-semibold">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-outline/20">
          <p className="text-xs font-semibold text-on-surface truncate mb-2">{user?.name}</p>
          <button onClick={handleLogout} className="text-xs text-on-surface-variant hover:text-error transition-colors font-label font-bold uppercase tracking-wider">
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-outline/30 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-black text-xs">M</span>
            </div>
            <span className="font-black text-primary text-base tracking-tight">MedsNear</span>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant">{user?.name}</span>
        </header>

        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline/30 flex justify-around px-2 py-2 z-40">
          {navItems.slice(0, 5).map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`
            }>
              <span className="text-[9px] font-bold uppercase tracking-wider font-label">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
