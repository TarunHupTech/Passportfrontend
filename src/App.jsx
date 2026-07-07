import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import SsoLogin from './pages/SsoLogin'
import Dashboard from './pages/Dashboard'
import MyJewellery from './pages/MyJewellery'
import Brands from './pages/Brands'
import PurchaseOrders from './pages/PurchaseOrders'
import ValuationCertificate from './pages/ValuationCertificate'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAttributes from './pages/admin/AdminAttributes'
import AdminLayout from './components/admin/AdminLayout'
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream-100">
        <div className="font-display text-2xl tracking-[0.3em] text-gold-600 animate-pulse">
          LIALI
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/sso" element={<SsoLogin />} />

      {/* Separate admin portal */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/attributes" element={<AdminAttributes />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/jewellery" element={<MyJewellery />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/orders" element={<PurchaseOrders />} />
        <Route path="/certificate" element={<ValuationCertificate />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
