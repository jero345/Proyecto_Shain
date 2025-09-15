// src/services/axiosclient.js
import axios from "axios";

/**
 * ---------------------------------------------------------
 *  Axios clients centralizados para:
 *   - API principal (axiosApi)
 *   - Chatbot (axiosChatbot)
 *
 *  Features:
 *   - Lee vars de entorno (Vite + fallback REACT_APP)
 *   - Normaliza baseURL y asegura sufijo /api
 *   - withCredentials:true para cookies (token_shain)
 *   - Interceptor: agrega Authorization si existe token
 *   - Helper para set/clear token en caliente
 *   - (Opcional) endpoint de intercambio de token
 * ---------------------------------------------------------
 */

/* ------------- env helpers ------------- */
const pick = (keys, fallback) => {
  for (const k of keys) {
    try {
      // Vite
      if (typeof import.meta !== "undefined" && import.meta.env && k in import.meta.env) {
        const v = import.meta.env[k];
        if (v !== undefined) return v;
      }
    } catch {}
    try {
      // Window runtime (si inyectas window.__env)
      if (typeof window !== "undefined" && window.__env && k in window.__env) {
        const v = window.__env[k];
        if (v !== undefined) return v;
      }
    } catch {}
    try {
      // Node (tests / SSR)
      if (typeof process !== "undefined" && process.env && k in process.env) {
        const v = process.env[k];
        if (v !== undefined) return v;
      }
    } catch {}
  }
  return fallback;
};

const ensureApiSuffix = (url) => {
  const base = String(url || "").replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
};

/* ------------- env keys ------------- */
const KEYS = {
  CHATBOT_BASE: ["VITE_CHATBOT_BASE", "REACT_APP_CHATBOT_BASE"],
  BACKEND_BASE: ["VITE_BACKEND_BASE", "REACT_APP_BACKEND_BASE"],
  CHAT_VIA_PROXY: ["VITE_CHAT_VIA_PROXY", "REACT_APP_CHAT_VIA_PROXY"],
  TOKEN_EXCHANGE_PATH: ["VITE_TOKEN_EXCHANGE_PATH", "REACT_APP_TOKEN_EXCHANGE_PATH"],
};

/* ------------- defaults (dev) ------------- */
const DEFAULTS = {
  CHATBOT_BASE: "https://m807p3lf-5051.use.devtunnels.ms",
  BACKEND_BASE: "https://5qz4wrdx-4000.use2.devtunnels.ms",
  CHAT_VIA_PROXY: "false",
  TOKEN_EXCHANGE_PATH: "/auth/token-exchange",
};

/* ------------- resolved config ------------- */
const RAW_CHATBOT_BASE = pick(KEYS.CHATBOT_BASE, DEFAULTS.CHATBOT_BASE);
const RAW_API_BASE = pick(KEYS.BACKEND_BASE, DEFAULTS.BACKEND_BASE);
const CHAT_VIA_PROXY = String(pick(KEYS.CHAT_VIA_PROXY, DEFAULTS.CHAT_VIA_PROXY)).toLowerCase() === "true";
const TOKEN_EXCHANGE_PATH = pick(KEYS.TOKEN_EXCHANGE_PATH, DEFAULTS.TOKEN_EXCHANGE_PATH);

// agregamos /api si no viene
const CHATBOT_BASE = ensureApiSuffix(RAW_CHATBOT_BASE);
const API_BASE = ensureApiSuffix(RAW_API_BASE);

// storage key que usa tu app/back
export const TOKEN_STORAGE_KEY = "token_shain";

/* ------------- axios factory ------------- */
function createClient(baseURL) {
  const instance = axios.create({
    baseURL,
    withCredentials: true, // importante para cookie token_shain
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
  });

  // Request: agrega Authorization si hay token guardado
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

  // Response: pasa tal cual; si quieres manejar 401 global, hazlo acá.
  instance.interceptors.response.use(
    (r) => r,
    (err) => Promise.reject(err)
  );

  return instance;
}

/* ------------- exported clients ------------- */
// API principal (Railway / devtunnel)
export const axiosApi = createClient(API_BASE);

// Chatbot: si decides rutear via backend proxy, puedes usar axiosApi al endpoint proxy.
// Por defecto exponemos también el cliente directo al chatbot.
export const axiosChatbot = createClient(CHATBOT_BASE);

/* ------------- token helpers ------------- */
export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      axiosApi.defaults.headers.common.Authorization = `Bearer ${token}`;
      axiosChatbot.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  } catch {}
};

export const clearAuthToken = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    delete axiosApi.defaults.headers.common.Authorization;
    delete axiosChatbot.defaults.headers.common.Authorization;
  } catch {}
};

/**
 * Intercambia la cookie/credencial por un token de chatbot (opcional)
 * Útil cuando el front le pasa cookies del back 1 al back del chatbot.
 * Tu backend debería validar la cookie y devolver un JWT temporal.
 *
 * Ejemplo back (Node):
 *  POST /auth/token-exchange  -> { chatToken: "xxx" }
 */
export async function exchangeTokenForChatbot(extra = {}) {
  // Llama SIEMPRE a tu API (no directo al chatbot) para mantener seguridad.
  // El API usa la cookie HttpOnly y retorna un token temporal para el chatbot.
  const url = `${TOKEN_EXCHANGE_PATH}`; // ya es relativo a axiosApi
  const { data } = await axiosApi.post(url, extra, { withCredentials: true });
  const chatToken = data?.chatToken || data?.token || null;
  if (chatToken) {
    // opcional: setear como Authorization para axiosChatbot
    axiosChatbot.defaults.headers.common.Authorization = `Bearer ${chatToken}`;
  }
  return chatToken;
}
