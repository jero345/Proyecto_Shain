// ✅ services/adminPanelService.js
import { axiosInstance } from '@services/axiosclient';

// Obtener todos los usuarios con paginación
export const getAllUsersService = async (page = 1, limit = 10) => {
  const res = await axiosInstance.get(`/users?page=${page}&limit=${limit}`, {
    withCredentials: true,
  });
  return res.data;
};

// Cambiar estado activo/inactivo
export const updateUserStatusService = async (id, status) => {
  const res = await axiosInstance.patch(
    `/users/${id}/status`,
    { status },
    { withCredentials: true }
  );
  return res.data.data;
};

// Actualizar datos del usuario
export const updateUserService = async (id, payload) => {
  const sanitizedPayload = Object.fromEntries(
    Object.entries(payload).filter(
      ([_, value]) => value !== undefined && value !== null
    )
  );

  console.log('🔄 Enviando payload limpio:', sanitizedPayload);

  const res = await axiosInstance.patch(`/users/${id}`, sanitizedPayload, {
    withCredentials: true,
  });

  return res.data.data;
};
