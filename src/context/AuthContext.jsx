import { createContext, useContext, useEffect, useState } from "react";
import api, { TOKEN_KEY } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if we have a token, restore the session.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const persist = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    persist(res.data);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    persist(res.data);
    return res.data.user;
  };

  // Establish a session from a token issued elsewhere (e.g. Shopify SSO handoff).
  const setSessionFromToken = async (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    const res = await api.get("/auth/me");
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, setSessionFromToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
