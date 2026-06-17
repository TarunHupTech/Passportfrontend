import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import SsoLogin from './pages/SsoLogin'
import Dashboard from './pages/Dashboard'
import MyJewellery from './pages/MyJewellery'
import Collections from './pages/Collections'
import ValuationCertificate from './pages/ValuationCertificate'

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

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/jewellery" element={<MyJewellery />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/certificate" element={<ValuationCertificate />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
