import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AgentProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/agent/login') }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-black text-on-surface tracking-tight">Profile</h1>

      <div className="bg-white rounded-xl border border-outline/40 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-black text-xl">{user?.name?.[0]}</span>
          </div>
          <div>
            <p className="font-bold text-on-surface text-lg">{user?.name}</p>
            <p className="text-sm text-on-surface-variant">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-outline/20 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Region</span>
            <span className="font-medium text-on-surface">{user?.region || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Verification</span>
            <span className={`font-semibold ${user?.verification_status === 'verified' ? 'text-green-600' : 'text-amber-600'}`}>
              {user?.verification_status || 'Not submitted'}
            </span>
          </div>
        </div>
      </div>

      <button onClick={handleLogout} className="w-full py-3 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
        Log out
      </button>
    </div>
  )
}
