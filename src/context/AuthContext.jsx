// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { axiosApi } from "@services/axiosclient";
import { normalizeRole } from "../constant/roles";

export const AuthContext = createContext(null);

const USER_KEY = "auth:user";
const TOKEN_KEY = "token_shain"; // usa el mismo nombre que tu backend

function normalizeUser(raw) {
  if (!raw || typeof raw !== "object") return null;

  // intenta leer role en estructuras comunes
  const roleRaw =
    raw.role ??
    raw?.user?.role ??
    raw?.data?.role ??
    raw?.profile?.role ??
    null;

  const role = normalizeRole(roleRaw);
  return { ...raw, role };
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? normalizeUser(JSON.parse(stored)) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Bootstrap sesión en recargas (PRODUCCIÓN friendly)
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        // valida sesión con backend (si hay cookie o token)
        const { data } = await axiosApi
          .get("/auth/me", { withCredentials: true })
          .catch(() => ({ data: null }));

        if (data) {
          const normalized = normalizeUser(data);
          if (normalized) {
            setUser(normalized);
            localStorage.setItem(USER_KEY, JSON.stringify(normalized));
          }
        }
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const loginUser = (userData, token = null) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  };

  const updateUser = (partial) => {
    setUser((prev) => {
      const next = normalizeUser({ ...(prev || {}), ...(partial || {}) });
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  };

  const logout = async () => {
    try {
      await axiosApi.post("/auth/logout", null, { withCredentials: true }).catch(() => {});
    } finally {
      setUser(null);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      delete axiosApi.defaults.headers.common["Authorization"];
      // Redirección limpia (evita estados intermedios)
      window.location.replace("/login");
    }
  };

  const hasRole = (roles) => {
    const current = user?.role;
    if (!current) return false;
    const list = Array.isArray(roles) ? roles : [roles];
    return list.includes(current);
  };

  const value = useMemo(
    () => ({ user, loading, loginUser, logout, updateUser, hasRole }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook de conveniencia
export const useAuth = () => useContext(AuthContext);
