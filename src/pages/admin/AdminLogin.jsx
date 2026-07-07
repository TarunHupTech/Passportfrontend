import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";
import adminApi, { ADMIN_TOKEN_KEY } from "../../lib/adminApi";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.post("/admin/login", form);
      localStorage.setItem(ADMIN_TOKEN_KEY, res.data.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-espresso-900 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-luxe-lg">
        <div className="mb-7 text-center">
          <div className="font-display text-3xl font-semibold tracking-[0.18em] text-gold-600">
            LIALI
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-muted">
            <ShieldCheck size={13} /> Admin Portal
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@liali.com"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
