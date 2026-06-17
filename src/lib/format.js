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
