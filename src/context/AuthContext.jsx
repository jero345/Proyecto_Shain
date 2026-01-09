// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { axiosApi, TOKEN_STORAGE_KEY, resetRedirectFlag } from "@services/axiosclient";
import { normalizeRole } from "../constant/roles";

export const AuthContext = createContext(null);

const USER_KEY = "auth:user";

function normalizeUser(raw) {
  if (!raw || typeof raw !== "object") return null;
  const roleRaw = raw.role ?? raw?.user?.role ?? raw?.data?.role ?? raw?.profile?.role ?? null;
  const role = normalizeRole(roleRaw);
  return { ...raw, role };
}

function getStoredUser() {
  try {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    return normalizeUser(JSON.parse(stored));
  } catch {
    return null;
  }
}

function hasToken() {
  try {
    return !!localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return false;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(() => {
    // Solo mostrar loading si hay token pero no hay usuario guardado
    return hasToken() && !getStoredUser();
  });
  
  const bootstrapDone = useRef(false);

  // Limpiar sesión local
  const clearSession = useCallback(() => {
    console.log("[AUTH] Limpiando sesión...");
    setUser(null);
    const keys = [USER_KEY, TOKEN_STORAGE_KEY, "user_id", "business_id", "business", "user", "token"];
    keys.forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });
    delete axiosApi.defaults.headers.common["Authorization"];
  }, []);

  // Bootstrap - verificar token al iniciar
  useEffect(() => {
    // Si ya hay usuario o no hay token, no hacer nada
    if (user || !hasToken() || bootstrapDone.current) {
      setLoading(false);
      return;
    }

    bootstrapDone.current = true;

    const verifySession = async () => {
      console.log("[AUTH] Verificando sesión con el servidor...");
      
      try {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
          axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        const { data } = await axiosApi.get("/auth/me", { timeout: 5000 });

        if (data && (data.id || data._id || data.email)) {
          const normalized = normalizeUser(data);
          setUser(normalized);
          localStorage.setItem(USER_KEY, JSON.stringify(normalized));
          
          // Guardar IDs adicionales
          const userId = normalized?.id || normalized?._id || data?.id || data?._id;
          if (userId) localStorage.setItem("user_id", userId);
          
          const business = normalized?.business || data?.business;
          if (business) {
            if (typeof business === "string") {
              localStorage.setItem("business_id", business);
              localStorage.setItem("business", business);
            } else if (business.id || business._id) {
              localStorage.setItem("business_id", business.id || business._id);
              localStorage.setItem("business", JSON.stringify(business));
            }
          }
          
          if (normalized?.businessId || data?.businessId) {
            localStorage.setItem("business_id", normalized?.businessId || data?.businessId);
          }
          
          console.log("[AUTH] ✅ Sesión válida");
        } else {
          console.log("[AUTH] Respuesta inválida de /auth/me");
          clearSession();
        }
      } catch (err) {
        // Si es 401, axios ya manejará la redirección
        console.log("[AUTH] Error verificando sesión:", err?.response?.status || err.message);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [user, clearSession]);

  // Login
  const loginUser = useCallback((userData, token = null) => {
    console.log("[AUTH] Login...");
    
    const normalized = normalizeUser(userData);
    if (!normalized) {
      console.error("[AUTH] Error normalizando usuario");
      return;
    }

    // Reset del flag de redirección (por si había quedado activo)
    resetRedirectFlag();

    // Guardar token
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Guardar usuario
    localStorage.setItem(USER_KEY, JSON.stringify(normalized));

    // Guardar IDs adicionales
    const userId = normalized?.id || normalized?._id || userData?.id || userData?._id;
    if (userId) {
      localStorage.setItem("user_id", userId);
      localStorage.setItem("user", JSON.stringify(normalized));
    }

    const business = normalized?.business || userData?.business;
    if (business) {
      if (typeof business === "string") {
        localStorage.setItem("business_id", business);
        localStorage.setItem("business", business);
      } else if (typeof business === "object") {
        const bizId = business.id || business._id;
        if (bizId) localStorage.setItem("business_id", bizId);
        localStorage.setItem("business", JSON.stringify(business));
      }
    }

    if (normalized?.businessId || userData?.businessId) {
      localStorage.setItem("business_id", normalized?.businessId || userData?.businessId);
    }

    setUser(normalized);
    setLoading(false);
    console.log("[AUTH] ✅ Login completado");
  }, []);

  // Update user
  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      const next = normalizeUser({ ...(prev || {}), ...(partial || {}) });
      if (next) {
        localStorage.setItem(USER_KEY, JSON.stringify(next));
        const userId = next?.id || next?._id;
        if (userId) localStorage.setItem("user_id", userId);
      }
      return next;
    });
  }, []);

  // Logout
  const logout = useCallback(async () => {
    console.log("[AUTH] Logout...");
    clearSession();
    
    try {
      await axiosApi.post("/auth/logout", null, { timeout: 3000 }).catch(() => {});
    } catch {}
    
    window.location.href = "/#/login";
  }, [clearSession]);

  // Check role
  const hasRole = useCallback((roles) => {
    if (!user?.role) return false;
    const list = Array.isArray(roles) ? roles : [roles];
    return list.includes(user.role);
  }, [user?.role]);

  // Sync entre pestañas
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === TOKEN_STORAGE_KEY && !e.newValue) {
        setUser(null);
      }
      if (e.key === USER_KEY) {
        const parsed = e.newValue ? normalizeUser(JSON.parse(e.newValue)) : null;
        setUser(parsed);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(() => ({ 
    user, 
    loading, 
    loginUser, 
    logout, 
    updateUser, 
    hasRole,
    isAuthenticated: !!user
  }), [user, loading, loginUser, logout, updateUser, hasRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};