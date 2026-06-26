import { useState, useEffect } from "react";
import { ShoppingBag, Package, Gem, AlertCircle } from "lucide-react";
import api from "../lib/api";
import { formatMoney, formatDate } from "../lib/format";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";

const titleCase = (s) =>
  s ? s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "";

const financialColor = (s) => {
  switch (s) {
    case "PAID":
      return "bg-green-100 text-green-700";
    case "PARTIALLY_PAID":
    case "PARTIALLY_REFUNDED":
    case "AUTHORIZED":
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "REFUNDED":
    case "VOIDED":
    case "EXPIRED":
      return "bg-red-100 text-red-600";
    default:
      return "bg-cream-200 text-espresso-700";
  }
};

const fulfillmentColor = (s) => {
  switch (s) {
    case "FULFILLED":
      return "bg-green-100 text-green-700";
    case "PARTIALLY_FULFILLED":
    case "IN_PROGRESS":
    case "SCHEDULED":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-cream-200 text-espresso-700";
  }
};

function OrderCard({ order }) {
  return (
    <div className="card p-5">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-ink">{order.name}</h3>
            {order.financialStatus && (
              <span className={`chip ${financialColor(order.financialStatus)}`}>
                {titleCase(order.financialStatus)}
              </span>
            )}
            {order.fulfillmentStatus && (
              <span className={`chip ${fulfillmentColor(order.fulfillmentStatus)}`}>
                {titleCase(order.fulfillmentStatus)}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">{formatDate(order.processedAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted">
            Total
          </p>
          <p className="font-display text-lg font-semibold text-gold-600">
            {formatMoney(order.total)}
          </p>
        </div>
      </div>

      {/* Line items */}
      <ul className="mt-3 divide-y divide-line/70">
        {order.lineItems.map((li, i) => (
          <li key={i} className="flex items-center gap-3 py-2.5">
            {li.image ? (
              <img
                src={li.image}
                alt={li.title}
                className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover"
              />
            ) : (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-cream-200 text-gold-400">
                <Gem size={20} strokeWidth={1.5} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{li.title}</p>
              {li.variantTitle && (
                <p className="truncate text-xs text-muted">{li.variantTitle}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted">× {li.quantity}</p>
              <p className="text-sm font-medium text-ink">{formatMoney(li.price)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PurchaseOrders() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/shopify/orders")
      .then((res) => setData(res.data))
      .catch(() =>
        setData({ linked: true, orders: [], message: "Could not load your orders." })
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading your Shopify orders…" />;

  const linked = data?.linked;
  const orders = data?.orders || [];
  const message = data?.message;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2.5 font-display text-2xl font-semibold text-ink sm:text-3xl">
          <ShoppingBag size={26} className="text-gold-500" />
          Purchase Orders
        </h1>
        <p className="mt-1 text-sm text-muted">
          Orders you've placed in the LIALI Shopify store.
        </p>
      </div>

      {!linked ? (
        <EmptyState
          icon={ShoppingBag}
          title="Not linked to Shopify"
          message="Your purchase orders are synced from your Shopify account. Sign in through Shopify to see the pieces you've bought."
        />
      ) : (
        <>
          {message && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <AlertCircle size={18} className="mt-px shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {orders.length === 0 ? (
            !message && (
              <EmptyState
                icon={Package}
                title="No orders yet"
                message="Orders you place in the LIALI Shopify store will appear here automatically."
              />
            )
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
