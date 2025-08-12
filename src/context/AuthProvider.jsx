import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";

const USER_KEY = "user";
const TOKEN_KEY = "token";

/** Asegura que user.role exista y sea string */
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

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? normalizeUser(JSON.parse(stored)) : null;
    } catch {
      return null;
    }
  });

  // Si vas a llamar /me al montar, pon esto en true y luego a false
  const [loading, setLoading] = useState(false);

  /** Login */
  const loginUser = (userData, token = null) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    if (token) localStorage.setItem(TOKEN_KEY, token);
  };

  /** Update perfil parcial */
  const updateUser = (partial) => {
    setUser((prev) => {
      const next = normalizeUser({ ...(prev || {}), ...(partial || {}) });
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  };

  /** Logout */
  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  /** ¿Tiene alguno de los roles? */
  const hasRole = (roles) => {
    const current = user?.role;
    if (!current) return false;
    const list = Array.isArray(roles) ? roles : [roles];
    return list.includes(current);
  };

  /** Sync entre pestañas */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === USER_KEY) {
        try {
          const parsed = e.newValue ? normalizeUser(JSON.parse(e.newValue)) : null;
          setUser(parsed);
        } catch {
          setUser(null);
        }
      }
      if (e.key === TOKEN_KEY && e.newValue == null) {
        setUser(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({ user, loading, loginUser, logout, updateUser, hasRole }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
