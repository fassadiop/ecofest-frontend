// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/config";

const AuthContext = createContext(null);

// helper decode
function decodeJwt(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch (e) {
    return null;
  }
}

/**
 * Named export: AuthProvider
 * Also default-exported at the bottom to avoid import errors.
 */
export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [access, setAccess] = useState(() => localStorage.getItem("access"));
  const [refresh, setRefresh] = useState(() => localStorage.getItem("refresh"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const refreshTimer = useRef(null);

  const saveTokens = useCallback((newAccess, newRefresh) => {
    if (newAccess) { localStorage.setItem("access", newAccess); setAccess(newAccess); } else { localStorage.removeItem("access"); setAccess(null); }
    if (newRefresh) { localStorage.setItem("refresh", newRefresh); setRefresh(newRefresh); } else { localStorage.removeItem("refresh"); setRefresh(null); }
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem("access"); localStorage.removeItem("refresh"); localStorage.removeItem("user");
    setAccess(null); setRefresh(null); setUser(null);
    if (refreshTimer.current) { clearTimeout(refreshTimer.current); refreshTimer.current = null; }
  }, []);

  const fetchMe = useCallback(async (tok) => {
    if (!tok) return null;
    try {
      const res = await fetch(`${API_URL}/auth/me/`, { headers: { Authorization: `Bearer ${tok}` } });
      if (res.ok) {
        const j = await res.json();
        try { localStorage.setItem("user", JSON.stringify(j)); } catch {}
        setUser(j);
        return j;
      }
    } catch (e) { /* ignore */ }
    // fallback decode
    const payload = decodeJwt(tok);
    if (payload) {
      const normalized = {
        username: payload.username || payload.user || payload.sub,
        email: payload.email,
        role: payload.role || payload.roles || payload.user_role || null,
        is_staff: payload.is_staff || false,
        is_superuser: payload.is_superuser || false,
        raw_payload: payload,
      };
      try { localStorage.setItem("user", JSON.stringify(normalized)); } catch {}
      setUser(normalized);
      return normalized;
    }
    return null;
  }, []);

  const scheduleRefresh = useCallback((tok) => {
    if (refreshTimer.current) { clearTimeout(refreshTimer.current); refreshTimer.current = null; }
    if (!tok) return;
    const p = decodeJwt(tok);
    if (!p || !p.exp) return;
    const expiresAt = p.exp * 1000;
    const ms = Math.max(1000, expiresAt - Date.now() - 60 * 1000); // refresh 60s before expiry
    refreshTimer.current = setTimeout(() => { refreshAccess().catch(() => {}); }, ms);
  }, []);

  const refreshAccess = useCallback(async () => {
    if (!refresh) { clearAll(); return null; }
    try {
      const res = await fetch(`${API_URL}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh })
      });
      if (res.ok) {
        const j = await res.json();
        if (j.access) {
          saveTokens(j.access, j.refresh || refresh);
          scheduleRefresh(j.access);
          await fetchMe(j.access);
          return j.access;
        }
      } else {
        clearAll();
      }
    } catch (e) {
      console.error("refreshAccess error", e);
      clearAll();
    }
    return null;
  }, [refresh, clearAll, fetchMe, saveTokens, scheduleRefresh]);

  const login = useCallback(async ({ username, password }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const j = await res.json();
      if (!res.ok) {
        const msg = j.detail || j.error || JSON.stringify(j);
        throw new Error(msg);
      }
      if (j.access) saveTokens(j.access, j.refresh || null);
      await fetchMe(j.access);
      scheduleRefresh(j.access);
      setLoading(false);
      navigate("/admin");
      return { ok: true };
    } catch (err) {
      setLoading(false);
      clearAll();
      throw err;
    }
  }, [fetchMe, saveTokens, scheduleRefresh, clearAll, navigate]);

  const logout = useCallback(() => {
    clearAll();
    navigate("/admin/login");
  }, [clearAll, navigate]);

  // startup: populate user and schedule refresh
  useEffect(() => {
    (async () => {
      const tok = access || localStorage.getItem("access");
      if (!tok) { clearAll(); return; }
      try {
        const cached = localStorage.getItem("user");
        if (cached) setUser(JSON.parse(cached));
      } catch {}
      await fetchMe(tok);
      scheduleRefresh(tok);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); };
  }, []);

  const value = {
    user,
    access,
    refresh,
    login,
    logout,
    refreshAccess,
    fetchMe,
    getAuthHeaders: () => (access ? { Authorization: `Bearer ${access}` } : {}),
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// named and default export to cover any import style
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth must be used inside AuthProvider"); return ctx; }
export default AuthProvider;
