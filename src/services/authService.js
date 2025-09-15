// src/services/authService.js
import { axiosApi } from '@services/axiosclient';

// Helpers para leer env (Vite y fallback)
function readEnv(key, fallback) {
  try { if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) return import.meta.env[key]; } catch {}
  try { if (typeof window !== 'undefined' && window.__env && window.__env[key] !== undefined) return window.__env[key]; } catch {}
  try { if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) return process.env[key]; } catch {}
  return fallback;
}

const TOKEN_EXCHANGE_PATH = readEnv('VITE_TOKEN_EXCHANGE_PATH', '/auth/token'); // cookie -> token
const FAKE_TOKEN = readEnv('VITE_FAKE_TOKEN', ''); // solo dev

async function ensureClientToken(initialToken) {
  // 1) Si ya vino en el body, úsalo
  if (initialToken) {
    try { localStorage.setItem('token_shain', initialToken); } catch {}
    return initialToken;
  }
  // 2) Intenta canjear la cookie httpOnly por un token
  try {
    const r = await axiosApi.get(TOKEN_EXCHANGE_PATH, { withCredentials: true });
    const token = r?.data?.token || r?.data?.accessToken || null;
    if (token) {
      try { localStorage.setItem('token_shain', token); } catch {}
      return token;
    }
  } catch (e) {
  }
  // 3) (Dev) Fuerza token dummy si lo definiste en .env
  if (FAKE_TOKEN) {
    try { localStorage.setItem('token_shain', FAKE_TOKEN); } catch {}
    console.warn('[auth] usando VITE_FAKE_TOKEN (solo dev)');
    return FAKE_TOKEN;
  }
  return null;
}

/** Construye la ruta respetando si baseURL ya termina en /api */
function apiPath(path) {
  const base = (axiosApi?.defaults?.baseURL || '').replace(/\/+$/, '');
  return base.endsWith('/api') ? path : `/api${path}`;
}

/** Quita campos vacíos/undefined/null y trimea strings */
function stripEmpty(obj) {
  const out = {};
  Object.keys(obj || {}).forEach((k) => {
    const v = obj[k];
    if (
      v === undefined ||
      v === null ||
      (typeof v === 'string' && v.trim() === '')
    ) return;
    out[k] = typeof v === 'string' ? v.trim() : v;
  });
  return out;
}
/**
 * Normaliza y añade ALIAS por si el backend usa otros nombres:
 * - firstName (+ name, fullName)
 * - lastName (+ last_name)
 * - username (+ user, userName)
 * - email
 * - phone (+ phoneNumber, telefono)
 * - password
 * - confirmPassword (+ passwordConfirm, password_confirmation, confirm_password)
 * - acceptedTerms (+ terms, termsAccepted)
 * - referredByCode (+ referralCode, referrerCode, ref_code, referredBy)
 * - role
 */
function normalizeRegisterPayload(form) {
  const f = stripEmpty(form);

  // Normalizar nombres
  const firstName = f.firstName ?? f.name ?? '';
  const lastName = f.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  // Construir el payload con los alias adecuados
  const payload = stripEmpty({
    firstName,
    lastName,
    fullName,           // alias común
    name: firstName,    // alias común
    last_name: lastName,// alias común

    username: f.username,
    user: f.username,
    userName: f.username,

    email: f.email,

    phone: f.phone ?? f.phoneNumber,
    phoneNumber: f.phone ?? f.phoneNumber,
    telefono: f.phone ?? f.phoneNumber,

    password: f.password,

    confirmPassword: f.confirmPassword,
    passwordConfirm: f.confirmPassword,
    password_confirmation: f.confirmPassword,
    confirm_password: f.confirmPassword,

    // Asegurar que los términos sean válidos
    acceptedTerms: Boolean(f.acceptedTerms),
    terms: Boolean(f.acceptedTerms),
    termsAccepted: Boolean(f.acceptedTerms),

    // Normalización del código de referido, permitiendo valores nulos o indefinidos
    referredByCode: f.referredByCode || f.referralCode || f.referrerCode || f.ref_code || f.referredBy || undefined,
    referralCode: f.referredByCode || f.referralCode || undefined,
    referrerCode: f.referredByCode || f.referrerCode || undefined,
    ref_code: f.referredByCode || f.ref_code || undefined,
    referredBy: f.referredByCode || f.referredBy || undefined,

    role: f.role,
  });

  return payload;
}


export const loginRequest = async (credentials) => {
  try {
    const base = (axiosApi.defaults?.baseURL || '').replace(/\/+$/, '');
    const loginPath = base.endsWith('/api') ? '/auth/login' : '/api/auth/login';

    const res = await axiosApi.post(loginPath, credentials, { withCredentials: true });

    const token =
      res.data?.token ||
      res.data?.accessToken ||
      null;

    // Asegura token en localStorage (body -> ok; si no, intenta canje/cookie)
    const finalToken = await ensureClientToken(token);

    return {
      status: res.data?.status ?? 'success',
      data: res.data?.data ?? res.data,
      token: finalToken
    };
  } catch (error) {
    if (error.response) throw error;
    throw new Error('Error de conexión con el servidor');
  }
};

/** POST /auth/register — lanza el error para que la vista lo maneje */
export const registerRequest = async (form) => {
  const payload = normalizeRegisterPayload(form);
  const url = apiPath('/auth/register');

  // DEBUG (solo en dev): ver payload que se envía
  try {
    if (import.meta?.env?.MODE !== 'production') {
      console.debug('[register] POST', url, payload);
    }
  } catch {}

  try {
    const res = await axiosApi.post(url, payload, { withCredentials: true });
    return res.data; // { status, message, data?, token? }
  } catch (err) {
    // DEBUG (solo en dev): ver respuesta del backend
    try {
      if (import.meta?.env?.MODE !== 'production') {
        console.error('[register] 400/err ->', err?.response?.status, err?.response?.data);
      }
    } catch {}
    throw err;
  }
};

export const userProfile  = async (form) => {
  const res = await axiosApi.get('/user', form);
  return res.data;
};

export const getUserByIdService = async (id) => {
  const res = await axiosApi.get(`/users/${id}`, { withCredentials: true });
  return res.data.data;
};

export const updateUserService = async (id, payload) => {
  const res = await axiosApi.patch(`/users/${id}`, payload, { withCredentials: true });
  return res.data.data;
};

export const changePasswordService = async (userId, data) => {
  const res = await axiosApi.patch(`/users/${userId}/change-password`, data, {
    withCredentials: true,
  });
  return res.data;
};

// --- Forgot password: POST /auth/forgot-password ---
export const forgotPasswordService = async (email) => {
  const res = await axiosApi.post(
    '/auth/forgot-password',
    { email: String(email || '').trim() },
    { withCredentials: true }
  );
  return res.data; // { status, message, ... } según tu API
};

// --- Reset password: POST /auth/reset-password ---
export const resetPasswordService = async ({ token, password, confirmPassword }) => {
  const body = {
    token: String(token || '').trim(),
    password: String(password || ''),
  };
  if (confirmPassword !== undefined) body.confirmPassword = String(confirmPassword || '');

  const res = await axiosApi.post(
    '/auth/reset-password',
    body,
    { withCredentials: true }
  );
  return res.data; // { success, message, ... }
};


// (Opcional) Verificar trial si lo usas en rutas protegidas
export const checkTrialService = async () => {
  const res = await axiosApi.get(apiPath('/auth/check-trial'), { withCredentials: true });
  return res.data;
};
