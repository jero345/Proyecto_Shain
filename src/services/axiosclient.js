import axios from 'axios';

// ---- helpers env ----
function getFromImportMeta(key) {
  try { return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) ?? undefined; } catch (e) {}
  return undefined;
}
function getFromWindow(key) {
  try { return (typeof window !== 'undefined' && window.__env && window.__env[key]) ?? undefined; } catch (e) {}
  return undefined;
}
function getFromProcess(key) {
  try { return (typeof process !== 'undefined' && process.env && process.env[key]) ?? undefined; } catch (e) {}
  return undefined;
}
function pickEnv(keys, fallback) {
  for (const k of keys) {
    const v = getFromImportMeta(k) ?? getFromWindow(k) ?? getFromProcess(k);
    if (v !== undefined) return v;
  }
  return fallback;
}
function normalizeBase(url) {
  const clean = String(url || '').replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

// ---- keys (Vite + CRA compat) ----
const CHATBOT_KEYS = ['VITE_CHATBOT_BASE', 'REACT_APP_CHATBOT_BASE'];
const BACKEND_KEYS = ['VITE_BACKEND_BASE', 'REACT_APP_BACKEND_BASE'];
const VIA_PROXY_KEYS = ['VITE_CHAT_VIA_PROXY', 'REACT_APP_CHAT_VIA_PROXY'];

// ---- defaults ----
const CHATBOT_DEFAULT = 'https://m807p3lf-5051.use.devtunnels.ms/api';
const BACKEND_DEFAULT = 'https://5qz4wrdx-4000.use2.devtunnels.ms/api';

// ---- resolved bases ----
const RAW_CHATBOT_BASE = pickEnv(CHATBOT_KEYS, CHATBOT_DEFAULT);
const RAW_API_BASE     = pickEnv(BACKEND_KEYS, BACKEND_DEFAULT);
const CHAT_VIA_PROXY   = String(pickEnv(VIA_PROXY_KEYS, 'false')).toLowerCase() === 'true';

const CHATBOT_BASE = normalizeBase(RAW_CHATBOT_BASE);
const API_BASE     = normalizeBase(RAW_API_BASE);

// ---- axios factory ----
function makeInstance(baseURL) {
  const inst = axios.create({
    baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
  });

  // Adjunta Authorization si existe token en localStorage (necesario en opción B)
  inst.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem('token_shain');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  }, (err) => Promise.reject(err));

  return inst;
}

// Tu backend (Railway / devtunnel)
export const axiosApi = makeInstance(API_BASE);

// Chatbot: en opción B, vamos DIRECTO
export const axiosChatbot = makeInstance(CHATBOT_BASE);

export default axiosChatbot;
