// src/services/employeeDetailService.js
import { axiosApi } from "@services/axiosclient";

/**
 * Obtiene la información completa de un empleado:
 * - /api/users/:id
 * - /api/movements/user/:userId
 * - /api/movements/summary/:userId
 */
export const getEmployeeDetail = async (userId) => {
  try {
    const [userRes, movementsRes, summaryRes] = await Promise.all([
      axiosApi.get(`users/${userId}`, { withCredentials: true }),
      axiosApi.get(`movements/user/${userId}`, { withCredentials: true }),
      axiosApi.get(`movements/summary/${userId}`, { withCredentials: true }),
    ]);

    return {
      user: userRes?.data?.data || userRes?.data || null,
      movements: movementsRes?.data?.data || movementsRes?.data || [],
      summary: summaryRes?.data?.data || summaryRes?.data || {},
    };
  } catch (error) {
    console.error("❌ Error obteniendo detalle del empleado:", error);
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "No se pudo cargar la información del empleado.";
    throw new Error(message);
  }
};
