import { Navigate } from "react-router-dom";
import { ADMIN_TOKEN_KEY } from "../../lib/adminApi";

// Guards the admin area — redirects to the admin login if there's no token.
export default function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}
