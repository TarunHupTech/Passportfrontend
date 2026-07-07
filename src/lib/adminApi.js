import axios from "axios";
import { API_ORIGIN } from "./api";

export const ADMIN_TOKEN_KEY = "liali_admin_token";

// Separate axios instance + token for the admin portal (distinct from customers).
const adminApi = axios.create({ baseURL: `${API_ORIGIN}/api` });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default adminApi;
