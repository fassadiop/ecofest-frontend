// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { API_URL } from "../api/config";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Helper: decode JWT payload (safe)
 */
function decodeJwt(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

/**
 * AuthProvider: manages tokens + current user + auto-refresh.
 *
 * Assumptions:
 * - token endpoints:
 *   POST  ${API_URL}/token/            -> { access, refresh }
 *   POST  ${API_URL}/token/refresh/    -> { access }
 * - optional endpoint: GET ${API_URL}/api/auth/me/ -> returns user object (id, username, role, is_staff, is_superuser...)
 * Adapt endpoints if yours differ.
 */
export function AuthProvider({ children }) {
  const [access, setAccess] = useState(() => localStorage.getItem("access"));
  const [refresh, setRefresh] = useState(() => localStorage.getItem("refresh"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const refreshTimeoutRef = useRef(null);

  const saveTokens = (newAccess, newRefresh) => {
    if (newAccess) {
      localStorage.setItem("access", newAccess);
      setAccess(newAccess);
    }
    if (newRefresh) {
      localStorage.setItem("refresh", newRefresh);
      setRefresh(newRefresh);
    }
  };

  const clearAll = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setAccess(null);
    setRefresh(null);
    setUser(null);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const scheduleRefresh = useCallback((token) => {
    // schedule refresh 60s before expiry
    try {
      if (!token) return;
      const payload = decodeJwt(token);
      if (!payload || !payload.exp) return;
      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      const ms = Math.max(1000, expiresAt - now - 60 * 1000); // at least 1s
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = setTimeout(() => {
        refreshAccess().catch(() => { /* ignore */ });
      }, ms);
    } catch (e) {
      // ignore scheduling errors
    }
  }, []);

  const fetchMe = useCallback(async (tok) => {
    if (!tok) return null;
    // Prefer backend /api/auth/me/ which should return role and flags
    try {
      const res = await fetch(`${API_URL}/auth/me/`, {
        headers: { Authorization: `Bearer ${tok}` }
      });
      if (res.ok) {
        const j = await res.json();
        localStorage.setItem("user", JSON.stringify(j));
        setUser(j);
        return j;
      }
    } catch (err) {
      // ignore; fallback below
    }
    // fallback: try decode token payload for user-like fields
    try {
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
        localStorage.setItem("user", JSON.stringify(normalized));
        setUser(normalized);
        return normalized;
      }
    } catch (e) { /* ignore */ }
    return null;
  }, []);

  const refreshAccess = useCallback(async () => {
    if (!refresh) {
      clearAll();
      return null;
    }
    try {
      const res = await fetch(`${API_URL}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh })
      });
      if (res.ok) {
        const j = await res.json();
        if (j.access) {
          saveTokens(j.access, null);
          scheduleRefresh(j.access);
          // optionally re-fetch user if payload changed
          await fetchMe(j.access);
          return j.access;
        }
      } else {
        // refresh invalid -> clear
        clearAll();
      }
    } catch (e) {
      console.error("refreshAccess error", e);
    }
    return null;
  }, [refresh, fetchMe, scheduleRefresh]);

  // login(username/password) -> store tokens and load user
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
        const msg = j.detail || (j.error || JSON.stringify(j));
        throw new Error(msg);
      }
      // expected: { access, refresh }
      if (j.access) saveTokens(j.access, j.refresh || null);
      await fetchMe(j.access);
      scheduleRefresh(j.access);
      setLoading(false);
      return { ok: true, data: j };
    } catch (err) {
      setLoading(false);
      clearAll();
      throw err;
    }
  }, [fetchMe, scheduleRefresh]);

  const logout = useCallback(() => {
    clearAll();
    // optionally notify backend here
    // e.g. POST /api/auth/logout/ with refresh token invalidation
  }, []);

  // helper for adding auth header quickly
  const getAuthHeaders = useCallback(() => {
    return access ? { Authorization: `Bearer ${access}` } : {};
  }, [access]);

  // load user on mount if token exists
  useEffect(() => {
    (async () => {
      try {
        const tok = access || localStorage.getItem("access");
        if (!tok) {
          clearAll();
          return;
        }
        // populate user from cache first (fast)
        try {
          const cached = localStorage.getItem("user");
          if (cached) {
            setUser(JSON.parse(cached));
          }
        } catch (e) { /* ignore */ }

        await fetchMe(tok);
        scheduleRefresh(tok);
      } catch (e) {
        // ignore startup errors
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, []);

  const value = {
    user,
    access,
    refresh,
    loading,
    login,
    logout,
    refreshAccess,
    fetchMe,
    getAuthHeaders
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
