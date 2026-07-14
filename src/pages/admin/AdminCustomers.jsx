import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search, ChevronRight } from "lucide-react";
import adminApi, { ADMIN_TOKEN_KEY } from "../../lib/adminApi";
import { formatAED, formatDate } from "../../lib/format";

export default function AdminCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    adminApi
      .get("/admin/customers")
      .then((r) => setCustomers(r.data.customers))
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          navigate("/admin/login", { replace: true });
          return;
        }
        setError("Could not load customers.");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const filtered = q.trim()
    ? customers.filter((c) =>
        `${c.name} ${c.email}`.toLowerCase().includes(q.trim().toLowerCase()),
      )
    : customers;

  if (loading)
    return (
      <div className="grid place-items-center py-24 text-gold-600">
        <Loader2 size={30} className="animate-spin" />
      </div>
    );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Customers
          </h1>
          <p className="mt-1 text-sm text-muted">
            {customers.length}{" "}
            {customers.length === 1 ? "customer" : "customers"}
          </p>
        </div>
        <div className="relative min-w-[240px]">
          <Search size={18} className="absolute left-3.5 top-2.5 text-muted" />
          <input
            className="input pl-11"
            placeholder="Search name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-cream-100 text-[0.7rem] uppercase tracking-wider text-muted">
                <th className="px-5 py-3.5 font-semibold">Customer</th>
                <th className="px-5 py-3.5 font-semibold">Source</th>
                <th className="px-5 py-3.5 text-right font-semibold">Items</th>
                <th className="px-5 py-3.5 text-right font-semibold">
                  Catalogued Value
                </th>
                <th className="px-5 py-3.5 font-semibold">Joined</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/admin/customers/${c.id}`)}
                  className="cursor-pointer border-b border-line/70 transition last:border-0 hover:bg-cream-50"
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold text-ink">{c.name}</p>
                    <p className="text-xs text-muted">{c.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`chip ${
                        c.source === "Shopify"
                          ? "bg-espresso-900 text-white/90"
                          : "bg-cream-200 text-espresso-700"
                      }`}
                    >
                      {c.source}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-ink/80">
                    {c.items}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-gold-600">
                    {formatAED(c.value)}
                  </td>
                  <td className="px-5 py-3 text-ink/70">
                    {formatDate(c.joinedAt)}
                  </td>
                  <td className="px-5 py-3 text-right text-muted">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-muted"
                  >
                    No customers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
