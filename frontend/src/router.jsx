import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Public pages
import Landing from './pages/public/Landing'
import SearchResults from './pages/public/SearchResults'
import SearchResultsAuth from './pages/public/SearchResultsAuth'
import OrderConfirmation from './pages/customer/OrderConfirmation'
import AgentsPage from './pages/public/Agents'
import HowItWorks from './pages/public/HowItWorks'
import NotFound from './pages/public/NotFound'

// Auth pages
import AuthPage from './pages/auth/AuthPage'
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
import AdminAuthLogs from './pages/admin/AuthLogs'
import AdminPharmacies from './pages/admin/Pharmacies'
import AdminOrders from './pages/admin/Orders'
import PaymentVerifications from './pages/admin/PaymentVerifications'
import PaymentProof from './pages/customer/PaymentProof'
import TrackOrder from './pages/customer/TrackOrder'
import OrderHistory from './pages/customer/OrderHistory'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import AgentLayout from './components/layout/AgentLayout'
import AdminLayout from './components/layout/AdminLayout'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!user) {
    if (role === 'admin') return <Navigate to="/admin/login" replace />
    if (role === 'agent') return <Navigate to="/agent/login" replace />
    return <Navigate to="/signin" replace />
  }
  if (user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/customer/search" element={<ProtectedRoute role="customer"><SearchResultsAuth /></ProtectedRoute>} />
        <Route path="/customer/orders" element={<ProtectedRoute role="customer"><OrderHistory /></ProtectedRoute>} />
        <Route path="/order" element={<ProtectedRoute role="customer"><OrderConfirmation /></ProtectedRoute>} />
        <Route path="/payment-proof" element={<ProtectedRoute role="customer"><PaymentProof /></ProtectedRoute>} />
        <Route path="/track-order" element={<ProtectedRoute role="customer"><TrackOrder /></ProtectedRoute>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/signin" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
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
        <Route path="orders" element={<AdminOrders />} />
        <Route path="payment-verifications" element={<PaymentVerifications />} />
        <Route path="auth-logs" element={<AdminAuthLogs />} />
        <Route path="pharmacies" element={<AdminPharmacies />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
