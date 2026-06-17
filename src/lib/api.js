import axios from "axios";

// Backend origin. Change here if the server runs elsewhere.
export const API_ORIGIN = "https://passportbackend-production.up.railway.app";

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
