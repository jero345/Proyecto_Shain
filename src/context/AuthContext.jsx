// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { axiosApi, TOKEN_STORAGE_KEY, resetRedirectFlag } from "@services/axiosclient";
import { normalizeRole } from "../constant/roles";
import { getBusinessById } from "@services/businessService";

export const AuthContext = createContext(null);

const USER_KEY = "auth:user";

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} true if valid
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[a-fA-F0-9]{24}$/.test(id);
};

/**
 * Safely saves an ID to localStorage only if it's a valid ObjectId
 * @param {string} key - localStorage key
 * @param {string} value - ID value to save
 */
const safeSetId = (key, value) => {
  if (value && isValidObjectId(value)) {
    localStorage.setItem(key, value);
  }
};

/**
 * Cleans up invalid IDs from localStorage on app start
 * This runs once when the module loads
 */
const cleanupInvalidIds = () => {
  const keysToCheck = ['user_id', 'business_id'];
  keysToCheck.forEach(key => {
    const value = localStorage.getItem(key);
    if (value && (value === "undefined" || value === "null" || value === "[object Object]" || !isValidObjectId(value))) {
      localStorage.removeItem(key);
    }
  });
};

// Run cleanup on module load
cleanupInvalidIds();

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
    setUser(null);
    const keys = [USER_KEY, TOKEN_STORAGE_KEY, "user_id", "business_id", "business", "business_image", "user", "token"];
    keys.forEach(k => {
      try { localStorage.removeItem(k); } catch { }
    });
    delete axiosApi.defaults.headers.common["Authorization"];
  }, []);

  // Cargar datos completos del negocio (para todos los usuarios)
  const loadBusinessData = useCallback(async (businessId) => {
    if (!businessId) return;

    // Asegurarse de que businessId sea un string válido (no un objeto)
    let id = businessId;
    if (typeof businessId === 'object') {
      id = businessId.id || businessId._id || null;
    }

    if (!id || typeof id !== 'string' || !localStorage.getItem(TOKEN_STORAGE_KEY)) return;

    try {
      const businessData = await getBusinessById(id);
      if (businessData) {
        localStorage.setItem("business", JSON.stringify(businessData));
        localStorage.setItem("business_id", businessData.id || id);
        window.dispatchEvent(new Event("businessUpdated"));
      }
    } catch {
      // Silently fail
    }
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

          const userId = normalized?.id || normalized?._id || data?.id || data?._id;
          if (userId) safeSetId("user_id", userId);

          // Guardar businessImage si viene en la respuesta
          const businessImage = data?.businessImage || normalized?.businessImage;
          if (businessImage) {
            localStorage.setItem("business_image", businessImage);
          }

          const business = normalized?.business || data?.business;
          let businessId = null;

          if (business) {
            if (typeof business === "string") {
              businessId = business;
            } else if (business.id || business._id) {
              businessId = business.id || business._id;
              localStorage.setItem("business", JSON.stringify(business));
            }
          }

          if (!businessId) {
            const altBizId = normalized?.businessId || data?.businessId;
            if (typeof altBizId === 'string') {
              businessId = altBizId;
            } else if (altBizId && typeof altBizId === 'object') {
              businessId = altBizId.id || altBizId._id || null;
            }
          }

          if (businessId && typeof businessId === 'string') {
            safeSetId("business_id", businessId);
            if (isValidObjectId(businessId)) {
              loadBusinessData(businessId);
            }
          }
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [user, clearSession, loadBusinessData]);

  // Login
  const loginUser = useCallback((userData, token = null) => {
    const normalized = normalizeUser(userData);
    if (!normalized) return;

    // Reset del flag de redirección (por si había quedado activo)
    resetRedirectFlag();

    // Guardar token
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Guardar usuario
    localStorage.setItem(USER_KEY, JSON.stringify(normalized));

    // Guardar IDs adicionales con validacion
    const userId = normalized?.id || normalized?._id || userData?.id || userData?._id;
    if (userId) {
      safeSetId("user_id", userId);
      localStorage.setItem("user", JSON.stringify(normalized));
    }

    // Guardar businessImage si viene en la respuesta
    const businessImage = userData?.businessImage || normalized?.businessImage;
    if (businessImage) {
      localStorage.setItem("business_image", businessImage);
    }

    // Obtener businessId de cualquier fuente
    const business = normalized?.business || userData?.business;
    let businessId = null;

    if (business) {
      if (typeof business === "string") {
        businessId = business;
      } else if (typeof business === "object") {
        businessId = business.id || business._id;
        // Si ya viene completo, guardarlo
        if (business.image) {
          localStorage.setItem("business", JSON.stringify(business));
        }
      }
    }

    if (!businessId) {
      const altBizId = normalized?.businessId || userData?.businessId;
      if (typeof altBizId === 'string') {
        businessId = altBizId;
      } else if (altBizId && typeof altBizId === 'object') {
        businessId = altBizId.id || altBizId._id || null;
      }
    }

    if (businessId && typeof businessId === 'string') {
      safeSetId("business_id", businessId);
      // Cargar datos completos del negocio para todos los miembros
      if (isValidObjectId(businessId)) {
        loadBusinessData(businessId);
      }
    }

    setUser(normalized);
    setLoading(false);
  }, [loadBusinessData]);

  // Update user
  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      const next = normalizeUser({ ...(prev || {}), ...(partial || {}) });
      if (next) {
        localStorage.setItem(USER_KEY, JSON.stringify(next));
        const userId = next?.id || next?._id;
        if (userId) safeSetId("user_id", userId);
      }
      return next;
    });
  }, []);

  // Logout
  const logout = useCallback(async () => {
    clearSession();

    try {
      await axiosApi.post("/auth/logout", {}, { timeout: 3000 }).catch(() => { });
    } catch { }

    window.location.href = "/#/login";
  }, [clearSession]);

  // Check role
  const hasRole = useCallback((roles) => {
    if (!user?.role) return false;
    const list = Array.isArray(roles) ? roles : [roles];
    return list.includes(user.role);
  }, [user?.role]);

  // Sync entre pestañas (solo cuando se elimina token desde otra pestaña)
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

  // Escuchar evento de sesión expirada (disparado por axiosclient en 401)
  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener("sessionExpired", onSessionExpired);
    return () => window.removeEventListener("sessionExpired", onSessionExpired);
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