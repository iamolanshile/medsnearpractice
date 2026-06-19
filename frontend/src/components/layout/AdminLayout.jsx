import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/admin/login') }

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="hidden lg:flex w-60 flex-col bg-white border-r border-outline/30 sticky top-0 h-screen">
        <div className="p-5 border-b border-outline/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-black text-xs">M</span>
            </div>
            <span className="font-black text-primary text-base tracking-tight">MedsNear</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60 mt-1 font-label">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <NavLink to="/admin/dashboard" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`
          }>
            Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`
          }>
            Orders
          </NavLink>
          <NavLink to="/admin/payment-verifications" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`
          }>
            Payment Verifications
          </NavLink>
          <NavLink to="/admin/pharmacies" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`
          }>
            Pharmacies
          </NavLink>
          <NavLink to="/admin/auth-logs" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`
          }>
            Auth Logs
          </NavLink>
        </nav>

        <div className="p-4 border-t border-outline/20">
          <button onClick={handleLogout} className="text-xs text-on-surface-variant hover:text-error transition-colors font-label font-bold uppercase tracking-wider">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
