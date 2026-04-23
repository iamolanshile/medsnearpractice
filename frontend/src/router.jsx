import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Public pages
import Landing from './pages/public/Landing'
import AgentsPage from './pages/public/Agents'
import HowItWorks from './pages/public/HowItWorks'
import NotFound from './pages/public/NotFound'

// Auth pages
import AgentLogin from './pages/auth/AgentLogin'
import AdminLogin from './pages/auth/AdminLogin'
import AgentRegister from './pages/auth/AgentRegister'

// Agent pages
import AgentDashboard from './pages/agent/Dashboard'
import AgentUpload from './pages/agent/Upload'
import AgentUploads from './pages/agent/Uploads'
import AgentEarnings from './pages/agent/Earnings'
import AgentProfile from './pages/agent/Profile'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import AgentLayout from './components/layout/AgentLayout'
import AdminLayout from './components/layout/AdminLayout'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to={role === 'admin' ? '/admin/login' : '/agent/login'} replace />
  if (user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Route>

      {/* Auth */}
      <Route path="/agent/login" element={<AgentLogin />} />
      <Route path="/agent/register" element={<AgentRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Agent dashboard */}
      <Route path="/agent" element={<ProtectedRoute role="agent"><AgentLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AgentDashboard />} />
        <Route path="upload" element={<AgentUpload />} />
        <Route path="uploads" element={<AgentUploads />} />
        <Route path="earnings" element={<AgentEarnings />} />
        <Route path="profile" element={<AgentProfile />} />
      </Route>

      {/* Admin dashboard */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
