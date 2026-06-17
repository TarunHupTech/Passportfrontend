import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import AuthShell from "../components/auth/AuthShell";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="font-display text-3xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">
        Sign in to access your private jewellery portfolio.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-3 text-muted" />
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              className="input pl-11"
            />
          </div>
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-3 text-muted" />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={update("password")}
              placeholder="••••••••"
              className="input pl-11"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-muted">
        New to LIALI?{" "}
        <Link to="/register" className="font-semibold text-gold-600 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
