// src/services/employeeDetailService.js
import { axiosApi } from "@services/axiosclient";

/**
 * Validates if a string is a valid MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[a-fA-F0-9]{24}$/.test(id);
};

/**
 * Obtiene la información completa de un empleado:
 * - /api/users/:id
 * - /api/movements/user/:userId
 *
 * NOTA: Se eliminó la llamada a /movements/summary/:userId porque:
 * 1. El backend valida que el ID coincida con el usuario autenticado
 * 2. Cuando un propietario ve los detalles de un empleado, el token es del propietario
 *    pero el ID es del empleado, causando error 401
 * 3. El summary no se usa en la vista - los totales se calculan de los movements
 */
export const getEmployeeDetail = async (userId) => {
  if (!userId || !isValidObjectId(userId)) {
    throw new Error('ID de empleado no valido');
  }

  try {
    const [userRes, movementsRes] = await Promise.all([
      axiosApi.get(`users/${userId}`, { withCredentials: true }),
      axiosApi.get(`movements/user/${userId}`, { withCredentials: true }),
    ]);

    const movementsData = movementsRes?.data?.data || movementsRes?.data || {};
    const movementsArray = Array.isArray(movementsData) ? movementsData : (movementsData?.movements || []);

    const totalIncomes = movementsArray
      .filter(m => m.type === 'ingreso')
      .reduce((sum, m) => sum + Number(m.value || 0), 0);
    const totalExpenses = movementsArray
      .filter(m => m.type === 'egreso')
      .reduce((sum, m) => sum + Number(m.value || 0), 0);

    return {
      user: userRes?.data?.data || userRes?.data || null,
      movements: movementsArray,
      summary: {
        totalIncomes,
        totalExpenses,
        balance: totalIncomes - totalExpenses,
      },
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "No se pudo cargar la información del empleado.";
    throw new Error(message);
  }
};
