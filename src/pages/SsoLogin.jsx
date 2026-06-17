import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Handoff page for Shopify SSO: /sso?token=<jwt>
// Stores the token, loads the user, then enters the app.
export default function SsoLogin() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setSessionFromToken } = useAuth();
  const [failed, setFailed] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard against StrictMode double-run
    ran.current = true;
    const token = params.get("token");
    if (!token) {
      setFailed(true);
      return;
    }
    setSessionFromToken(token)
      .then(() => navigate("/", { replace: true }))
      .catch(() => setFailed(true));
  }, [params, navigate, setSessionFromToken]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-cream-100 text-center">
      <div className="font-display text-3xl font-semibold tracking-[0.3em] text-gold-600">
        LIALI
      </div>
      {failed ? (
        <>
          <p className="mt-4 text-sm text-muted">
            We couldn't sign you in from Shopify.
          </p>
          <Link to="/login" className="btn btn-primary mt-5">
            Go to login
          </Link>
        </>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-300 border-t-gold-500" />
          Signing you in…
        </p>
      )}
    </div>
  );
}
