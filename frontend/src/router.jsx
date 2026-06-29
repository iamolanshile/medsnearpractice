import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// ── Layouts ──────────────────────────────────────────────────────────────────
import PublicLayout from './components/layout/PublicLayout'
import AgentLayout  from './components/layout/AgentLayout'
import AdminLayout  from './components/layout/AdminLayout'

// ── Public pages ─────────────────────────────────────────────────────────────
import Landing       from './pages/public/Landing'
import SearchResults from './pages/public/SearchResults'
import AgentsPage    from './pages/public/Agents'
import HowItWorks    from './pages/public/HowItWorks'
import NotFound      from './pages/public/NotFound'

// ── Auth pages ────────────────────────────────────────────────────────────────
import AuthPage       from './pages/auth/AuthPage'
import AgentLogin     from './pages/auth/AgentLogin'
import AgentRegister  from './pages/auth/AgentRegister'
import AdminLogin     from './pages/auth/AdminLogin'

// ── Customer pages ────────────────────────────────────────────────────────────
import SearchResultsAuth from './pages/public/SearchResultsAuth'
import OrderConfirmation from './pages/customer/OrderConfirmation'
import PaymentProof      from './pages/customer/PaymentProof'
import TrackOrder        from './pages/customer/TrackOrder'
import OrderHistory      from './pages/customer/OrderHistory'
import CustomerProfile   from './pages/customer/CustomerProfile'

// ── Agent pages ───────────────────────────────────────────────────────────────
import AgentDashboard     from './pages/agent/Dashboard'
import AgentPharmacies    from './pages/agent/Pharmacies'
import AgentUpload        from './pages/agent/Upload'
import AgentUploadSuccess from './pages/agent/UploadSuccess'
import AgentUploads       from './pages/agent/Uploads'
import AgentEarnings      from './pages/agent/Earnings'
import AgentProfile       from './pages/agent/Profile'

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminDashboard        from './pages/admin/Dashboard'
import AdminAnalytics        from './pages/admin/Analytics'
import AdminOrders           from './pages/admin/Orders'
import AdminPayouts          from './pages/admin/Payouts'
import AdminPharmacies       from './pages/admin/Pharmacies'
import AdminAgents           from './pages/admin/Agents'
import AdminAuthLogs         from './pages/admin/AuthLogs'
import PaymentVerifications  from './pages/admin/PaymentVerifications'

// ── Protected route ───────────────────────────────────────────────────────────
// Navigation after login now happens via useEffect inside each login page,
// which fires only after AuthContext.setUser() has committed. So by the time
// ProtectedRoute renders on /agent/dashboard, user is always already in state.
// The localStorage fallback below handles hard-refreshes.
function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // On hard-refresh: React state is null until useEffect fires, but
  // localStorage already has the user — read it synchronously here.
  const resolvedUser = user || (() => {
    try {
      const raw = localStorage.getItem('mn_user')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })()

  if (!resolvedUser) {
    if (role === 'admin') return <Navigate to="/admin/login" replace />
    if (role === 'agent') return <Navigate to="/agent/login" replace />
    return <Navigate to="/signin" replace />
  }

  if (resolvedUser.role !== role) {
    if (resolvedUser.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (resolvedUser.role === 'agent') return <Navigate to="/agent/dashboard" replace />
    return <Navigate to="/" replace />
  }

  return children
}

// ── App router ────────────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <Routes>

      {/* ── Public (Navbar + Footer layout) ── */}
      <Route element={<PublicLayout />}>
        <Route path="/"            element={<Landing />} />
        <Route path="/search"      element={<SearchResults />} />
        <Route path="/agents"      element={<AgentsPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />

        {/* Sign-in / sign-up share one page; the tab is driven by the path */}
        <Route path="/signin" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        {/* Legacy /auth alias → /signin */}
        <Route path="/auth"   element={<Navigate to="/signin" replace />} />

        {/* ── Customer-only pages ── */}
        <Route path="/customer/search"
          element={<ProtectedRoute role="customer"><SearchResultsAuth /></ProtectedRoute>} />
        <Route path="/customer/orders"
          element={<ProtectedRoute role="customer"><OrderHistory /></ProtectedRoute>} />
        <Route path="/customer/profile"
          element={<ProtectedRoute role="customer"><CustomerProfile /></ProtectedRoute>} />
        <Route path="/order"
          element={<ProtectedRoute role="customer"><OrderConfirmation /></ProtectedRoute>} />
        <Route path="/payment-proof"
          element={<ProtectedRoute role="customer"><PaymentProof /></ProtectedRoute>} />
        <Route path="/track-order"
          element={<ProtectedRoute role="customer"><TrackOrder /></ProtectedRoute>} />
      </Route>

      {/* ── Standalone auth pages (no public navbar) ── */}
      <Route path="/agent/login"    element={<AgentLogin />} />
      <Route path="/agent/register" element={<AgentRegister />} />
      <Route path="/admin/login"    element={<AdminLogin />} />

      {/* ── Agent section (sidebar layout, agent-only) ── */}
      <Route path="/agent" element={<ProtectedRoute role="agent"><AgentLayout /></ProtectedRoute>}>
        <Route index                element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<AgentDashboard />} />
        <Route path="pharmacies"    element={<AgentPharmacies />} />
        <Route path="upload"        element={<AgentUpload />} />
        <Route path="upload/success" element={<AgentUploadSuccess />} />
        <Route path="uploads"       element={<AgentUploads />} />
        <Route path="earnings"      element={<AgentEarnings />} />
        <Route path="profile"       element={<AgentProfile />} />
      </Route>

      {/* ── Admin section (sidebar layout, admin-only) ── */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index                        element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"             element={<AdminDashboard />} />
        <Route path="analytics"             element={<AdminAnalytics />} />
        <Route path="orders"                element={<AdminOrders />} />
        <Route path="payment-verifications" element={<PaymentVerifications />} />
        <Route path="payouts"               element={<AdminPayouts />} />
        <Route path="pharmacies"            element={<AdminPharmacies />} />
        <Route path="agents"                element={<AdminAgents />} />
        <Route path="auth-logs"             element={<AdminAuthLogs />} />
      </Route>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  )
}
