import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CLUB_ENTRY_URL } from "../lib/api";

// Remember the last hand-off attempt so a failed one can't bounce in a loop.
const SSO_ATTEMPT_KEY = "liali_sso_attempt";
const RETRY_WINDOW_MS = 15000;

// Set once the redirect is in flight, so re-renders keep showing the splash
// instead of flashing the login page while the browser navigates away.
let redirecting = false;

function Splash({ message }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-cream-100 text-center">
      <div className="font-display text-3xl font-semibold tracking-[0.3em] text-gold-600">
        LIALI
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-300 border-t-gold-500" />
        {message}
      </p>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    sessionStorage.removeItem(SSO_ATTEMPT_KEY);
    return children;
  }

  if (redirecting) return <Splash message="Checking your Shopify session…" />;

  // Landing on the club entry (the storefront footer link) without a session:
  // only Shopify knows if they're signed in, so hand off to the App Proxy.
  // Deep links still fall through to the normal login page.
  if (location.pathname === "/") {
    const last = Number(sessionStorage.getItem(SSO_ATTEMPT_KEY) || 0);
    if (Date.now() - last > RETRY_WINDOW_MS) {
      sessionStorage.setItem(SSO_ATTEMPT_KEY, String(Date.now()));
      redirecting = true;
      window.location.replace(CLUB_ENTRY_URL);
      return <Splash message="Checking your Shopify session…" />;
    }
  }

  return <Navigate to="/login" replace />;
}
