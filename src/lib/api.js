import axios from "axios";

// Backend origin. Defaults to the deployed Railway API; override locally with
// VITE_API_ORIGIN in a .env.local (e.g. http://localhost:5000).
export const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "https://passportbackend-production.up.railway.app";

export const TOKEN_KEY = "liali_token";

// Shopify storefront origin. Set VITE_SHOP_ORIGIN=https://lialijewellery.com on
// Vercel for production; defaults to the dev store.
export const SHOP_ORIGIN =
  import.meta.env.VITE_SHOP_ORIGIN || "https://tarun-yzuldbwu.myshopify.com";

// App Proxy entry — only Shopify knows whether the visitor is signed in, so we
// bounce through this to find out. It redirects back to /sso?token=… when they
// are, or to the Shopify login page when they aren't.
export const CLUB_ENTRY_URL = `${SHOP_ORIGIN}/apps/club`;

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
});

// Attach the JWT (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Resolve a stored image path ("/uploads/x.jpg") to an absolute URL.
export const imageUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
};

export default api;
