// src/services/authService.js
import { axiosApi } from '@services/axiosclient';

// Helpers para leer env (Vite y fallback)
function readEnv(key, fallback) {
  try { if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) return import.meta.env[key]; } catch {}
  try { if (typeof window !== 'undefined' && window.__env && window.__env[key] !== undefined) return window.__env[key]; } catch {}
  try { if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) return process.env[key]; } catch {}
  return fallback;
}

const TOKEN_EXCHANGE_PATH = readEnv('VITE_TOKEN_EXCHANGE_PATH', '/auth/token');
const FAKE_TOKEN = readEnv('VITE_FAKE_TOKEN', '');

// ⚠️ KEYS SINCRONIZADAS CON AuthContext.jsx
const USER_KEY = "auth:user";
const TOKEN_KEY = "token_shain";

async function ensureClientToken(initialToken) {
  if (initialToken) {
    try { localStorage.setItem(TOKEN_KEY, initialToken); } catch {}
    return initialToken;
  }
  try {
    const r = await axiosApi.get(TOKEN_EXCHANGE_PATH, { withCredentials: true });
    const token = r?.data?.token || r?.data?.accessToken || null;
    if (token) {
      try { localStorage.setItem(TOKEN_KEY, token); } catch {}
      return token;
    }
  } catch (e) {}
  if (FAKE_TOKEN) {
    try { localStorage.setItem(TOKEN_KEY, FAKE_TOKEN); } catch {}
    console.warn('[auth] usando VITE_FAKE_TOKEN (solo dev)');
    return FAKE_TOKEN;
  }
  return null;
}

function apiPath(path) {
  const base = (axiosApi?.defaults?.baseURL || '').replace(/\/+$/, '');
  return base.endsWith('/api') ? path : `/api${path}`;
}

function stripEmpty(obj) {
  const out = {};
  Object.keys(obj || {}).forEach((k) => {
    const v = obj[k];
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) return;
    out[k] = typeof v === 'string' ? v.trim() : v;
  });
  return out;
}

function normalizeRegisterPayload(form) {
  const f = stripEmpty(form);
  const firstName = f.firstName ?? f.name ?? '';
  const lastName = f.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  const payload = stripEmpty({
    firstName,
    lastName,
    fullName,
    name: firstName,
    last_name: lastName,
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
    acceptedTerms: Boolean(f.acceptedTerms),
    terms: Boolean(f.acceptedTerms),
    termsAccepted: Boolean(f.acceptedTerms),
    referredByCode: f.referredByCode || f.referralCode || f.referrerCode || f.ref_code || f.referredBy || undefined,
    referralCode: f.referredByCode || f.referralCode || undefined,
    referrerCode: f.referredByCode || f.referrerCode || undefined,
    ref_code: f.referredByCode || f.ref_code || undefined,
    referredBy: f.referredByCode || f.referredBy || undefined,
    role: f.role,
    businessCode: f.businessCode || '',
  });

  return payload;
}

/**
 * Guarda todos los datos necesarios en localStorage después del login
 * ⚠️ SINCRONIZADO CON AuthContext.jsx
 */
function saveUserDataToStorage(userData, token) {
  if (!userData) {
    console.error('[auth] saveUserDataToStorage: userData es null/undefined');
    return;
  }

  console.log('[auth] Guardando datos en localStorage:', userData);

  // 1. Guardar usuario con la KEY correcta para AuthContext
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    console.log('[auth] ✅ Usuario guardado en', USER_KEY);
  } catch (e) {
    console.error('[auth] Error guardando user:', e);
  }

  // 2. Guardar token con la KEY correcta
  if (token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('[auth] ✅ Token guardado en', TOKEN_KEY);
    } catch (e) {
      console.error('[auth] Error guardando token:', e);
    }
  } else {
    console.warn('[auth] ⚠️ NO HAY TOKEN PARA GUARDAR');
  }

  // 3. Guardar user_id (para compatibilidad con otros componentes)
  const userId = userData.id || userData._id || userData.userId;
  if (userId) {
    localStorage.setItem('user_id', userId);
    console.log('[auth] ✅ user_id guardado:', userId);
  }

  // 4. Guardar business y business_id
  const businessValue = userData.business;
  if (businessValue) {
    if (typeof businessValue === 'string') {
      localStorage.setItem('business', businessValue);
      localStorage.setItem('business_id', businessValue);
      console.log('[auth] ✅ business_id guardado (string):', businessValue);
    } else if (typeof businessValue === 'object') {
      const businessId = businessValue.id || businessValue._id;
      if (businessId) {
        localStorage.setItem('business_id', businessId);
        console.log('[auth] ✅ business_id guardado (object):', businessId);
      }
      localStorage.setItem('business', JSON.stringify(businessValue));
    }
  }

  if (userData.businessId) {
    localStorage.setItem('business_id', userData.businessId);
    if (!businessValue) {
      localStorage.setItem('business', userData.businessId);
    }
  }

  // 5. DEBUG: Verificar lo guardado
  console.log('[auth] === VERIFICACIÓN localStorage ===');
  console.log('[auth] auth:user:', localStorage.getItem(USER_KEY) ? 'OK' : 'FALTA');
  console.log('[auth] token_shain:', localStorage.getItem(TOKEN_KEY) ? 'OK' : 'FALTA');
  console.log('[auth] user_id:', localStorage.getItem('user_id'));
  console.log('[auth] business_id:', localStorage.getItem('business_id'));
}

/**
 * Busca el token en diferentes lugares de la respuesta del backend
 */
function findTokenInResponse(res) {
  let token = null;
  
  // 1. Buscar en res.data directamente
  if (res.data?.token) token = res.data.token;
  else if (res.data?.accessToken) token = res.data.accessToken;
  else if (res.data?.access_token) token = res.data.access_token;
  else if (res.data?.jwt) token = res.data.jwt;
  else if (res.data?.authToken) token = res.data.authToken;
  
  // 2. Buscar en res.data.data
  if (!token && res.data?.data) {
    token = res.data.data.token || res.data.data.accessToken || res.data.data.access_token || res.data.data.jwt;
  }
  
  // 3. Buscar en res.data.user
  if (!token && res.data?.user) {
    token = res.data.user.token || res.data.user.accessToken;
  }
  
  // 4. Buscar en res.data.auth
  if (!token && res.data?.auth) {
    token = res.data.auth.token || res.data.auth.accessToken;
  }

  // 5. Buscar en headers (algunos backends envían el token en headers)
  if (!token && res.headers) {
    token = res.headers['x-auth-token'] || res.headers['x-access-token'];
    const authHeader = res.headers['authorization'];
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    }
  }
  
  return token;
}

export const loginRequest = async (credentials) => {
  try {
    const base = (axiosApi.defaults?.baseURL || '').replace(/\/+$/, '');
    const loginPath = base.endsWith('/api') ? '/auth/login' : '/api/auth/login';

    console.log('[auth] Intentando login en:', loginPath);

    const res = await axiosApi.post(loginPath, credentials, { withCredentials: true });

    console.log('[auth] ========================================');
    console.log('[auth] RESPUESTA COMPLETA DEL LOGIN:');
    console.log('[auth] res.data:', JSON.stringify(res.data, null, 2));
    console.log('[auth] ========================================');

    // Buscar token usando la función mejorada
    const token = findTokenInResponse(res);
    
    if (token) {
      console.log('[auth] ✅ Token encontrado:', token.substring(0, 30) + '...');
    } else {
      console.error('[auth] ❌ NO SE ENCONTRÓ TOKEN EN LA RESPUESTA');
      console.error('[auth] Estructura de res.data:', Object.keys(res.data || {}));
      if (res.data?.data) console.error('[auth] Estructura de res.data.data:', Object.keys(res.data.data || {}));
      if (res.data?.user) console.error('[auth] Estructura de res.data.user:', Object.keys(res.data.user || {}));
    }

    const finalToken = await ensureClientToken(token);
    
    if (finalToken) {
      console.log('[auth] ✅ Token final guardado');
    } else {
      console.error('[auth] ❌ NO HAY TOKEN FINAL - Las peticiones fallarán con 401');
    }

    // Obtener datos del usuario - manejar diferentes estructuras de respuesta
    let userData = null;
    
    if (res.data?.data && typeof res.data.data === 'object') {
      userData = res.data.data;
    } else if (res.data?.user && typeof res.data.user === 'object') {
      userData = res.data.user;
    } else if (res.data && typeof res.data === 'object' && (res.data.id || res.data._id || res.data.username)) {
      userData = res.data;
    }

    console.log('[auth] userData extraído:', userData ? 'OK' : 'NULL');

    if (!userData || typeof userData !== 'object') {
      console.error('[auth] ❌ No se pudo extraer userData de la respuesta');
    }

    // Guardar TODOS los datos necesarios en localStorage
    saveUserDataToStorage(userData, finalToken);

    // Verificación final
    console.log('[auth] ========================================');
    console.log('[auth] VERIFICACIÓN FINAL:');
    console.log('[auth] token_shain en localStorage:', localStorage.getItem(TOKEN_KEY) ? 'SÍ' : 'NO');
    console.log('[auth] auth:user en localStorage:', localStorage.getItem(USER_KEY) ? 'SÍ' : 'NO');
    console.log('[auth] ========================================');

    return {
      status: res.data?.status ?? 'success',
      data: userData,
      token: finalToken
    };
  } catch (error) {
    console.error('[auth] Error en loginRequest:', error);
    console.error('[auth] Error response:', error.response?.data);
    if (error.response) throw error;
    throw new Error('Error de conexión con el servidor');
  }
};

export const registerRequest = async (form) => {
  const payload = normalizeRegisterPayload(form);
  const url = apiPath('/auth/register');

  try {
    if (import.meta?.env?.MODE !== 'production') {
      console.debug('[register] POST', url, payload);
    }
  } catch {}

  try {
    const res = await axiosApi.post(url, payload, { withCredentials: true });
    return res.data;
  } catch (err) {
    try {
      if (import.meta?.env?.MODE !== 'production') {
        console.error('[register] 400/err ->', err?.response?.status, err?.response?.data);
      }
    } catch {}
    throw err;
  }
};

export const userProfile = async (form) => {
  const res = await axiosApi.get('/user', form);
  return res.data;
};

export const getUserByIdService = async (id) => {
  const res = await axiosApi.get(`/users/${id}`, { withCredentials: true });
  return res.data.data;
};

export const updateUserService = async (payload) => {
  try {
    const { data } = await axiosApi.patch('/users/me', payload, {
      withCredentials: true,
    });
    
    // Actualizar el localStorage con los nuevos datos (usando la KEY correcta)
    const currentUser = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
    const updatedUser = { ...currentUser, ...data.data };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    
    return data.data;
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    throw error.response?.data || error;
  }
};

export const changePasswordService = async (userId, data) => {
  const res = await axiosApi.patch(`/users/${userId}/change-password`, data, {
    withCredentials: true,
  });
  return res.data;
};

export const forgotPasswordService = async (email) => {
  const res = await axiosApi.post(
    '/auth/forgot-password',
    { email: String(email || '').trim() },
    { withCredentials: true }
  );
  return res.data;
};

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
  return res.data;
};

export const checkTrialService = async () => {
  const res = await axiosApi.get(apiPath('/auth/check-trial'), { withCredentials: true });
  return res.data;
};