import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Users, SlidersHorizontal, LogOut, ShieldCheck } from "lucide-react";
import adminApi, { ADMIN_TOKEN_KEY } from "../../lib/adminApi";

const NAV = [
  { to: "/admin", label: "Insights", icon: BarChart3, end: true },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/attributes", label: "Attributes", icon: SlidersHorizontal },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    adminApi
      .get("/admin/me")
      .then((r) => setAdmin(r.data.admin))
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          navigate("/admin/login", { replace: true });
        }
      });
  }, [navigate]);

  const signOut = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-espresso-900 px-6 py-3.5 text-cream-100">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="font-display text-2xl font-semibold tracking-[0.16em] text-gold-300">
              LIALI
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-cream-100/10 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-cream-100/80">
              <ShieldCheck size={12} /> Admin
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                    isActive
                      ? "bg-gold-500 text-white"
                      : "text-cream-100/70 hover:bg-cream-100/10 hover:text-cream-100",
                  ].join(" ")
                }
              >
                <Icon size={15} /> {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-cream-100/70 sm:block">{admin?.email}</span>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-lg bg-cream-100/10 px-3 py-1.5 text-sm font-medium transition hover:bg-cream-100/20"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-7">
        <Outlet />
      </main>
    </div>
  );
}
