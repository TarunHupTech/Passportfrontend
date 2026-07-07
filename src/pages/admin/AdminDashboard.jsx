import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Gem, Wallet, TrendingUp, Tag, Gift, Loader2 } from "lucide-react";
import adminApi, { ADMIN_TOKEN_KEY } from "../../lib/adminApi";
import { formatAED } from "../../lib/format";
import { Panel, BarList, Donut, Histogram, TrendBars, PALETTE } from "../../components/admin/Charts";

const compactAED = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `AED ${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `AED ${(v / 1_000).toFixed(1)}K`;
  return formatAED(v);
};

function Kpi({ icon: Icon, label, value, sub }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cream-100 text-gold-600">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted">{label}</p>
        <p className="font-display text-xl font-semibold text-ink">{value}</p>
        {sub && <p className="truncate text-xs text-muted">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="mb-4 mt-2 font-display text-lg font-semibold text-ink">{children}</h2>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    adminApi
      .get("/admin/analytics")
      .then((res) => {
        if (active) setData(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          navigate("/admin/login", { replace: true });
          return;
        }
        setError("Could not load analytics.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  if (loading)
    return (
      <div className="grid place-items-center py-24 text-gold-600">
        <Loader2 size={30} className="animate-spin" />
      </div>
    );

  const t = data?.totals;
  const metalSegments = (data?.byMetal || []).map((m, i) => ({
    label: m.label,
    value: m.count,
    color: PALETTE[i % PALETTE.length],
  }));
  const giftSegments = [
    { label: "Self-purchase", value: data?.giftSplit?.purchased || 0, color: PALETTE[0] },
    { label: "Gifted", value: data?.giftSplit?.gift || 0, color: PALETTE[1] },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Customer Insights
        </h1>
        <p className="mt-1 text-sm text-muted">
          Buying patterns, trends and range gaps across all customer portfolios.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={Users} label="Customers" value={t?.customers ?? 0} />
        <Kpi icon={Gem} label="Items" value={t?.items ?? 0} />
        <Kpi icon={Wallet} label="Catalogued Value" value={compactAED(t?.totalValue)} />
        <Kpi icon={TrendingUp} label="Avg / Item" value={compactAED(t?.avgValue)} />
        <Kpi icon={Tag} label="Brands" value={t?.brands ?? 0} />
        <Kpi icon={Gift} label="Gifted" value={`${t?.giftPct ?? 0}%`} sub={`${t?.giftCount ?? 0} items`} />
      </div>

      {/* Buying patterns */}
      <SectionTitle>Buying patterns</SectionTitle>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Items by type">
          <BarList data={data?.byItemType} metric="count" />
        </Panel>
        <Panel title="Metal mix">
          <Donut segments={metalSegments} centerValue={t?.items ?? 0} centerLabel="items" />
        </Panel>
        <Panel title="Top brands" hint="by catalogued value">
          <BarList data={data?.topBrands} metric="value" format={compactAED} />
        </Panel>
        <Panel title="Stones">
          <BarList data={data?.byStone} metric="count" />
        </Panel>
        <Panel title="Gift vs self-purchase">
          <Donut segments={giftSegments} centerValue={`${t?.giftPct ?? 0}%`} centerLabel="gifted" />
        </Panel>
        <Panel title="Occasions" hint="when filled by customers">
          <BarList data={data?.byOccasion} metric="count" />
        </Panel>
      </div>

      {/* Trends */}
      <SectionTitle>Trends</SectionTitle>
      <Panel title="Items catalogued per month" hint="last 12 months">
        <TrendBars data={data?.monthlyTrend || []} format={compactAED} />
      </Panel>

      {/* Range gaps */}
      <SectionTitle>Price range gaps</SectionTitle>
      <Panel title="Distribution by invoice amount" hint="dashed = gap (no items in this range)">
        <Histogram data={data?.priceBuckets || []} />
      </Panel>

      {/* Tables */}
      <SectionTitle>Details</SectionTitle>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Top customers" hint="by catalogued value">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[0.65rem] uppercase tracking-wider text-muted">
                  <th className="py-2 font-semibold">Customer</th>
                  <th className="py-2 text-right font-semibold">Items</th>
                  <th className="py-2 text-right font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topCustomers || []).map((c, i) => (
                  <tr key={i} className="border-b border-line/60 last:border-0">
                    <td className="py-2.5">
                      <p className="font-medium text-ink">{c.name}</p>
                      <p className="text-xs text-muted">{c.email}</p>
                    </td>
                    <td className="py-2.5 text-right text-ink/80">{c.items}</td>
                    <td className="py-2.5 text-right font-medium text-gold-600">{formatAED(c.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Recent additions">
          <ul className="divide-y divide-line/60">
            {(data?.recentItems || []).map((p, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{p.name}</p>
                  <p className="truncate text-xs text-muted">
                    {p.itemType}
                    {p.brand ? ` · ${p.brand}` : ""} · {p.customer}
                  </p>
                </div>
                <span className="shrink-0 font-medium text-gold-600">{formatAED(p.value)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
