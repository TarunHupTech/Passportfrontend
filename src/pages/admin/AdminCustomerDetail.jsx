import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Gem, Wallet, TrendingUp, Tag, Gift, Loader2 } from "lucide-react";
import adminApi, { ADMIN_TOKEN_KEY } from "../../lib/adminApi";
import { formatAED, formatDate } from "../../lib/format";
import {
  Panel,
  BarList,
  Donut,
  Histogram,
  Kpi,
  SectionTitle,
  compactAED,
  PALETTE,
} from "../../components/admin/Charts";

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .get(`/admin/customers/${id}`)
      .then((r) => setData(r.data))
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          navigate("/admin/login", { replace: true });
          return;
        }
        setError(err.response?.status === 404 ? "Customer not found." : "Could not load customer.");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading)
    return (
      <div className="grid place-items-center py-24 text-gold-600">
        <Loader2 size={30} className="animate-spin" />
      </div>
    );

  if (error)
    return (
      <div>
        <BackLink />
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </div>
    );

  const c = data.customer;
  const t = data.totals;
  const metalSegments = (data.byMetal || []).map((m, i) => ({
    label: m.label,
    value: m.count,
    color: PALETTE[i % PALETTE.length],
  }));
  const giftSegments = [
    { label: "Self-purchase", value: data.giftSplit?.purchased || 0, color: PALETTE[0] },
    { label: "Gifted", value: data.giftSplit?.gift || 0, color: PALETTE[1] },
  ];

  return (
    <div>
      <BackLink />

      {/* Customer header */}
      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-espresso-900 font-display text-lg font-semibold text-gold-300">
            {(c.name || "?")
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{c.name}</h1>
            <p className="text-sm text-muted">{c.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <span
            className={`chip ${
              c.source === "Shopify" ? "bg-espresso-900 text-white/90" : "bg-cream-200 text-espresso-700"
            }`}
          >
            {c.source}
          </span>
          <span>Joined {formatDate(c.joinedAt)}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi icon={Gem} label="Items" value={t?.items ?? 0} />
        <Kpi icon={Wallet} label="Catalogued Value" value={compactAED(t?.totalValue)} />
        <Kpi icon={TrendingUp} label="Avg / Item" value={compactAED(t?.avgValue)} />
        <Kpi icon={Tag} label="Brands" value={t?.brands ?? 0} />
        <Kpi icon={Gift} label="Gifted" value={`${t?.giftPct ?? 0}%`} sub={`${t?.giftCount ?? 0} items`} />
      </div>

      {t?.items === 0 ? (
        <div className="card mt-6 px-6 py-14 text-center text-sm text-muted">
          This customer hasn't catalogued any jewellery yet.
        </div>
      ) : (
        <>
          {/* Buying patterns */}
          <SectionTitle>Buying patterns</SectionTitle>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel title="Items by type">
              <BarList data={data.byItemType} metric="count" />
            </Panel>
            <Panel title="Metal mix">
              <Donut segments={metalSegments} centerValue={t?.items ?? 0} centerLabel="items" />
            </Panel>
            <Panel title="Top brands" hint="by catalogued value">
              <BarList data={data.topBrands} metric="value" format={compactAED} />
            </Panel>
            <Panel title="Stones">
              <BarList data={data.byStone} metric="count" />
            </Panel>
            <Panel title="Gift vs self-purchase">
              <Donut segments={giftSegments} centerValue={`${t?.giftPct ?? 0}%`} centerLabel="gifted" />
            </Panel>
            <Panel title="Occasions" hint="when filled in">
              <BarList data={data.byOccasion} metric="count" />
            </Panel>
          </div>

          {/* Price range gaps */}
          <SectionTitle>Price range gaps</SectionTitle>
          <Panel title="Distribution by invoice amount" hint="dashed = gap (no items in this range)">
            <Histogram data={data.priceBuckets || []} />
          </Panel>

          {/* Items */}
          <SectionTitle>Jewellery ({data.items?.length || 0})</SectionTitle>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-cream-100 text-[0.7rem] uppercase tracking-wider text-muted">
                    <th className="px-5 py-3 font-semibold">Item</th>
                    <th className="px-5 py-3 font-semibold">Brand</th>
                    <th className="px-5 py-3 font-semibold">Metal</th>
                    <th className="px-5 py-3 font-semibold">Stone</th>
                    <th className="px-5 py-3 text-right font-semibold">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.items || []).map((p) => (
                    <tr key={p.id} className="border-b border-line/70 last:border-0">
                      <td className="px-5 py-3">
                        <span className="font-medium text-ink">{p.name}</span>
                        {p.isGift && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded bg-gold-100 px-1.5 py-0.5 text-[0.6rem] font-semibold text-gold-700">
                            <Gift size={10} /> Gift
                          </span>
                        )}
                        <span className="block text-xs text-muted">{p.itemType}</span>
                      </td>
                      <td className="px-5 py-3 text-ink/80">{p.brand || "—"}</td>
                      <td className="px-5 py-3 text-ink/80">
                        {p.metalType} {p.purity}
                      </td>
                      <td className="px-5 py-3 text-ink/80">
                        {p.stoneType && p.stoneType !== "None" ? p.stoneType : "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-gold-600">
                        {formatAED(p.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/customers"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-gold-600"
    >
      <ArrowLeft size={16} /> All customers
    </Link>
  );
}
