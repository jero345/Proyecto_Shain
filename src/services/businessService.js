// ============================================
// businessService.js - SIN DUPLICADOS
// ============================================
import { axiosApi } from '@services/axiosclient';

const BASE = '/business';

// Helpers
const pick = (res) => res?.data?.data ?? res?.data ?? res;
const toStr = (v) => (v === null || v === undefined ? '' : String(v));

/**
 * Normaliza la respuesta del backend a un formato consistente
 */
const normalizeBusinessData = (raw) => {
  return {
    id: raw?._id ?? raw?.id ?? '',
    user: toStr(raw?.user),
    name: toStr(raw?.name),
    goal: toStr(raw?.goal),
    type: toStr(raw?.type),
    description: toStr(raw?.description),
    image: toStr(raw?.image),
    code: toStr(raw?.businessJoinCode ?? raw?.code),
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
};

/**
 * GET /business/{id}
 * Obtiene información de un negocio por ID
 */
export const getBusinessById = async (id) => {
  try {
    console.log('🔍 Buscando negocio con ID:', id);
    const response = await axiosApi.get(`${BASE}/${id}`, { 
      withCredentials: true 
    });
    console.log('📦 Respuesta cruda:', response);
    const raw = pick(response);
    console.log('📋 Datos extraídos:', raw);
    const normalized = normalizeBusinessData(raw);
    console.log('✅ Datos normalizados:', normalized);
    return normalized;
  } catch (error) {
    console.error('❌ Error obteniendo negocio:', error);
    console.error('❌ Respuesta error:', error.response?.data);
    throw error;
  }
};

/**
 * GET /business/{userId}
 * Obtiene información de un negocio por User ID
 * (Alias para compatibilidad con Finance.jsx)
 */
export const getBusinessByUser = async (userId) => {
  try {
    const response = await axiosApi.get(`${BASE}/${userId}`, { 
      withCredentials: true 
    });
    const raw = pick(response);
    return normalizeBusinessData(raw);
  } catch (error) {
    console.error('❌ Error obteniendo negocio por usuario:', error);
    throw error;
  }
};

/**
 * PATCH /business/{id}
 * Actualiza información del negocio con FormData
 */
export const saveBusinessFD = async (id, payload) => {
  try {
    const formData = new FormData();
    
    if (payload.name) formData.append('name', toStr(payload.name));
    if (payload.goal) formData.append('goal', toStr(payload.goal));
    if (payload.type) formData.append('type', toStr(payload.type));
    if (payload.description) formData.append('description', toStr(payload.description));
    if (payload.imageFile) formData.append('image', payload.imageFile);

    const response = await axiosApi.patch(`${BASE}/${id}`, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    const raw = pick(response);
    return normalizeBusinessData(raw);
  } catch (error) {
    console.error('❌ Error guardando negocio:', error);
    throw error;
  }
};
