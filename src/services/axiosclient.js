// src/services/axiosclient.js
import axios from "axios";

/* ------------- env helpers ------------- */
const pick = (keys, fallback) => {
  for (const k of keys) {
    try {
      if (typeof import.meta !== "undefined" && import.meta.env && k in import.meta.env) {
        const v = import.meta.env[k];
        if (v !== undefined) return v;
      }
    } catch {}
    try {
      if (typeof window !== "undefined" && window.__env && k in window.__env) {
        const v = window.__env[k];
        if (v !== undefined) return v;
      }
    } catch {}
    try {
      if (typeof process !== "undefined" && process.env && k in process.env) {
        const v = process.env[k];
        if (v !== undefined) return v;
      }
    } catch {}
  }
  return fallback;
};

const normalizeUrl = (url) => String(url || "").replace(/\/+$/, "");
const ensureApiSuffix = (url) => {
  const base = normalizeUrl(url);
  return base.endsWith("/api") ? base : `${base}/api`;
};
const ensureApiV1Suffix = (url) => {
  const base = normalizeUrl(url);
  if (base.endsWith("/api/v1")) return base;
  if (base.endsWith("/api")) return `${base}/v1`;
  return `${base}/api/v1`;
};

/* ------------- env keys ------------- */
const KEYS = {
  CHATBOT_BASE: ["VITE_CHATBOT_BASE", "REACT_APP_CHATBOT_BASE"],
  BACKEND_BASE: ["VITE_BACKEND_BASE", "REACT_APP_BACKEND_BASE"],
  TOKEN_EXCHANGE_PATH: ["VITE_TOKEN_EXCHANGE_PATH", "REACT_APP_TOKEN_EXCHANGE_PATH"],
};

const DEFAULTS = {
  CHATBOT_BASE: "https://5qz4wrdx-4020.use2.devtunnels.ms",
  BACKEND_BASE: "https://5qz4wrdx-4000.use2.devtunnels.ms",
  TOKEN_EXCHANGE_PATH: "/auth/token-exchange",
};

/* ------------- resolved config ------------- */
const RAW_CHATBOT_BASE = pick(KEYS.CHATBOT_BASE, DEFAULTS.CHATBOT_BASE);
const RAW_API_BASE = pick(KEYS.BACKEND_BASE, DEFAULTS.BACKEND_BASE);
const TOKEN_EXCHANGE_PATH = pick(KEYS.TOKEN_EXCHANGE_PATH, DEFAULTS.TOKEN_EXCHANGE_PATH);

const API_BASE = ensureApiSuffix(RAW_API_BASE);
const CHATBOT_BASE = ensureApiV1Suffix(RAW_CHATBOT_BASE);

export const TOKEN_STORAGE_KEY = "token_shain";
const USER_KEY = "auth:user";

/* ============================================
   MANEJO DE SESIÓN EXPIRADA - SIMPLE Y DIRECTO
   ============================================ */

let isRedirecting = false;

const clearAllStorage = () => {
  const keysToRemove = [
    TOKEN_STORAGE_KEY,
    USER_KEY,
    "user",
    "user_id",
    "business_id",
    "business",
    "token",
    "financeSummary"
  ];
  
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });
};

const isLoginPage = () => {
  const hash = window.location.hash || "";
  const pathname = window.location.pathname || "";
  return hash.includes("/login") || pathname.includes("/login");
};

// Endpoints de autenticación que NO deben triggear redirect
const isAuthEndpoint = (url) => {
  if (!url) return false;
  const authPaths = ["/auth/login", "/auth/register", "/auth/logout", "/auth/forgot", "/auth/reset", "/auth/verify"];
  return authPaths.some(path => url.includes(path));
};

// Verificar si estamos en una página de admin
const isAdminPage = () => {
  const hash = window.location.hash || "";
  const pathname = window.location.pathname || "";
  return hash.includes("/admin") || pathname.includes("/admin") || 
         hash.includes("/portal-admin") || pathname.includes("/portal-admin");
};

/**
 * Maneja sesión expirada - SIMPLE Y DIRECTO
 * Limpia storage y redirige inmediatamente
 */
const handleSessionExpired = (url) => {
  // No hacer nada si ya estamos redirigiendo o en login
  if (isRedirecting || isLoginPage()) {
    console.log("[Axios] Ignorando 401 - ya redirigiendo o en login");
    return;
  }

  // En páginas de admin, solo loguear el error pero NO redirigir
  // Esto permite ver los errores de permisos reales
  if (isAdminPage()) {
    console.warn("[Axios] 401 en página admin - NO redirigiendo para debug");
    console.warn("[Axios] URL que falló:", url);
    return;
  }

  console.log("[Axios] ⚠️ SESIÓN EXPIRADA en:", url);
  isRedirecting = true;

  // 1. Limpiar storage
  clearAllStorage();

  // 2. Limpiar headers de axios
  delete axiosApi.defaults.headers.common["Authorization"];
  delete axiosChatbot.defaults.headers.common["Authorization"];

  // 3. Redirigir AL INSTANTE
  window.location.href = "/#/login";
};

/* ------------- axios factory ------------- */
function createClient(baseURL, options = {}) {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
    timeout: options.timeout || 30000,
    ...options,
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      try {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {}
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - DETECTAR 401
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const url = error.config?.url || "";

      // Si es 401 y NO es un endpoint de auth → sesión expirada
      if (status === 401 && !isAuthEndpoint(url)) {
        handleSessionExpired(url);
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

/* ------------- exported clients ------------- */
export const axiosApi = createClient(API_BASE);
export const axiosChatbot = createClient(CHATBOT_BASE, { timeout: 60000 });

/* ------------- token helpers ------------- */
export const setAuthToken = (token) => {
  if (!token) return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    axiosApi.defaults.headers.common.Authorization = `Bearer ${token}`;
    axiosChatbot.defaults.headers.common.Authorization = `Bearer ${token}`;
    isRedirecting = false; // Reset flag al establecer nuevo token
  } catch {}
};

export const clearAuthToken = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    delete axiosApi.defaults.headers.common.Authorization;
    delete axiosChatbot.defaults.headers.common.Authorization;
  } catch {}
};

export async function exchangeTokenForChatbot(extra = {}) {
  const { data } = await axiosApi.post(TOKEN_EXCHANGE_PATH, extra, { withCredentials: true });
  const chatToken = data?.chatToken || data?.token || null;
  if (chatToken) {
    axiosChatbot.defaults.headers.common.Authorization = `Bearer ${chatToken}`;
  }
  return chatToken;
}

export const hasActiveSession = () => {
  return !!localStorage.getItem(TOKEN_STORAGE_KEY) && !!localStorage.getItem(USER_KEY);
};

/* ------------- Reset redirect flag (para uso externo) ------------- */
export const resetRedirectFlag = () => {
  isRedirecting = false;
};

/* ------------- debug ------------- */
if (import.meta?.env?.DEV) {
  console.log("[AxiosClient] API_BASE:", API_BASE);
  console.log("[AxiosClient] CHATBOT_BASE:", CHATBOT_BASE);
}