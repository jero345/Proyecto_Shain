// @services/adminPanelService.js
import { axiosApi } from '@services/axiosclient';

/**
 * GET /users?page=&limit=
 * Devuelve { data, totalPages, page }
 */
export const getAllUsersService = async (page = 1, limit = 10) => {
  console.log('[AdminService] Obteniendo usuarios, página:', page);
  
  try {
    const res = await axiosApi.get('/users', {
      params: { page, limit },
    });

    console.log('[AdminService] Respuesta usuarios:', res.data);

    const payload = res.data || {};
    return {
      data:
        payload.data?.users ??
        payload.users ??
        payload.data ??
        [],
      totalPages:
        payload.totalPages ??
        payload.pagination?.totalPages ??
        1,
      page: payload.page ?? payload.pagination?.page ?? page,
    };
  } catch (error) {
    console.error('[AdminService] Error obteniendo usuarios:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

/**
 * PATCH /users/:id/status  { status }
 * Cambiar estado (active | inactive)
 */
export const updateUserStatusService = async (id, status) => {
  console.log('[AdminService] Actualizando estado:', id, '->', status);
  
  try {
    const res = await axiosApi.patch(
      `/users/${id}/status`,
      { status }
    );
    
    console.log('[AdminService] ✅ Estado actualizado:', res.data);
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error('[AdminService] ❌ Error actualizando estado:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

/**
 * PATCH /users/:id  { name, email, role, ... }
 * Actualiza datos generales del usuario.
 */
export const updateUserService = async (id, payload) => {
  console.log('[AdminService] Actualizando usuario:', id, payload);
  
  // Limpiar keys undefined/null
  const sanitizedPayload = Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== undefined && value !== null
    )
  );

  console.log('[AdminService] Payload sanitizado:', sanitizedPayload);

  try {
    const res = await axiosApi.patch(
      `/users/${id}`,
      sanitizedPayload
    );
    
    console.log('[AdminService] ✅ Usuario actualizado:', res.data);
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error('[AdminService] ❌ Error actualizando usuario:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

/**
 * GET /users/:id
 * Traer un usuario por id (útil para refrescar luego de un update)
 */
export const getUserByIdService = async (id) => {
  console.log('[AdminService] Obteniendo usuario:', id);
  
  try {
    const res = await axiosApi.get(`/users/${id}`);
    console.log('[AdminService] Usuario obtenido:', res.data);
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error('[AdminService] Error obteniendo usuario:', {
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};