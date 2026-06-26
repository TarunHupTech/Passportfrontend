// AED currency, with no decimals by default (matches the prototype's figures).
export const formatAED = (value, decimals = 0) => {
  const n = Number(value) || 0;
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
};

// Compact AED for large headline numbers if ever needed.
export const formatNumber = (value) =>
  new Intl.NumberFormat("en-AE").format(Number(value) || 0);

// Format a Shopify money object { amount, currencyCode } in its own currency.
export const formatMoney = (money) => {
  if (!money || money.amount == null) return "—";
  const n = Number(money.amount) || 0;
  try {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: money.currencyCode || "AED",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${money.currencyCode || ""} ${n.toFixed(2)}`.trim();
  }
};

export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Time-of-day greeting used on the dashboard.
export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};
