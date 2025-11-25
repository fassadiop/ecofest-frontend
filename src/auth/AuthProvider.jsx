// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/** Petit jwtDecode local (évite dépendance et compat issues) */
function jwtDecode(token) {
  try {
    const payload = token.split(".")[1];
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    const padded = pad ? b64 + "=".repeat(4 - pad) : b64;
    const json = atob(padded);
    // decodeURIComponent/escape to handle utf8
    try {
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return JSON.parse(json);
    }
  } catch (e) {
    console.warn("jwtDecode failed", e);
    return null;
  }
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [access, setAccess] = useState(() => localStorage.getItem("access"));
  const [refresh, setRefresh] = useState(() => localStorage.getItem("refresh"));
  const [user, setUser] = useState(() => (access ? jwtDecode(access) : null));
  const [loading, setLoading] = useState(false);

  const saveTokens = (a, r) => {
    if (a) localStorage.setItem("access", a);
    else localStorage.removeItem("access");
    if (r) localStorage.setItem("refresh", r);
    else localStorage.removeItem("refresh");
    setAccess(a || null);
    setRefresh(r || null);
    setUser(a ? jwtDecode(a) : null);
  };

  const clearTokens = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAccess(null);
    setRefresh(null);
    setUser(null);
  };

  const login = async ({ username, password }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Login failed");
      }
      const data = await res.json();
      saveTokens(data.access, data.refresh);
      setLoading(false);
      navigate("/admin");
    } catch (err) {
      setLoading(false);
      clearTokens();
      throw err;
    }
  };

  const logout = useCallback(() => {
    clearTokens();
    navigate("/admin/login");
  }, [navigate]);

  const refreshAccess = useCallback(async () => {
    if (!refresh) {
      logout();
      return null;
    }
    try {
      const res = await fetch(`${API_URL}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) throw new Error("Refresh failed");
      const data = await res.json();
      saveTokens(data.access, data.refresh ?? refresh);
      return data.access;
    } catch (err) {
      logout();
      return null;
    }
  }, [refresh, logout]);

  useEffect(() => {
    (async () => {
      try {
        if (!access && refresh) {
          await refreshAccess();
        } else if (access) {
          const decoded = jwtDecode(access);
          if (!decoded) {
            await refreshAccess();
            return;
          }
          const { exp } = decoded;
          if (Date.now() >= exp * 1000) {
            await refreshAccess();
          } else {
            setUser(decoded);
          }
        }
      } catch {
        clearTokens();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ access, refresh, user, loading, isAuthenticated: !!user, login, logout, refreshAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
