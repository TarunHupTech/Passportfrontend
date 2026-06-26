import axios from "axios";

// Backend origin. Defaults to the deployed Railway API; override locally with
// VITE_API_ORIGIN in a .env.local (e.g. http://localhost:5000).
export const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "https://passportbackend-production.up.railway.app";

export const TOKEN_KEY = "liali_token";

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
