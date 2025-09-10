// @services/adminPanelService.js
import { axiosApi } from '@services/axiosclient';

/**
 * GET /users?page=&limit=
 * Devuelve { data, totalPages, page }
 */
export const getAllUsersService = async (page = 1, limit = 10) => {
  const res = await axiosApi.get('/users', {
    params: { page, limit },
    withCredentials: true,
  });

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
};

/**
 * PATCH /users/:id/status  { status }
 * Cambiar estado (active | inactive)
 */
export const updateUserStatusService = async (id, status) => {
  const res = await axiosApi.patch(
    `/users/${id}/status`,
    { status },
    { withCredentials: true }
  );
  // mayoría de backends retornan { data: { ...user } }
  return res.data?.data ?? res.data;
};

/**
 * PATCH /users/:id  { name, email, role, ... }
 * Actualiza datos generales del usuario.
 */
export const updateUserService = async (id, payload) => {
  // limpia keys undefined/null/'' (opcional, quita la línea de '' si quieres permitir vacío)
  const sanitizedPayload = Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) =>
        value !== undefined && value !== null
    )
  );

  const res = await axiosApi.patch(
    `/users/${id}`,
    sanitizedPayload,
    { withCredentials: true }
  );
  return res.data?.data ?? res.data;
};

/**
 * GET /users/:id
 * Traer un usuario por id (útil para refrescar luego de un update)
 */
export const getUserByIdService = async (id) => {
  const res = await axiosApi.get(`/users/${id}`, { withCredentials: true });
  return res.data?.data ?? res.data;
};
