// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { axiosApi } from "@services/axiosclient";

export const AuthContext = createContext(null);

const USER_KEY = "user";
const TOKEN_KEY = "token_shain"; // ⚡ usamos el mismo nombre de tu backend

function normalizeUser(raw) {
  if (!raw || typeof raw !== "object") return null;
  const role =
    raw.role ||
    raw?.user?.role ||
    raw?.data?.role ||
    raw?.profile?.role ||
    null;
  return { ...raw, role: role ? String(role) : null };
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

  // Hidratar token y user al montar
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          axiosApi.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;
        }

        // validar sesión con backend
        const { data } = await axiosApi.get("/auth/me", {
          withCredentials: true,
        });
        if (data) {
          const normalized = normalizeUser(data);
          setUser(normalized);
          localStorage.setItem(USER_KEY, JSON.stringify(normalized));
        }
      } catch {
        // si falla no limpiamos el token para que no se pierda al recargar
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
      await axiosApi
        .post("/auth/logout", null, { withCredentials: true })
        .catch(() => {});
    } finally {
      setUser(null);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      delete axiosApi.defaults.headers.common["Authorization"];
      window.location.replace("/"); // salida limpia
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

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
