// src/services/addMovementService.js
import { axiosApi } from "@services/axiosclient";

/**
 * Valida si un string es un ObjectId de MongoDB válido
 * @param {string} id - ID a validar
 * @returns {boolean} true si es válido
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  // MongoDB ObjectId: 24 caracteres hexadecimales
  return /^[a-fA-F0-9]{24}$/.test(id);
};

/**
 * Limpia y valida un ID de localStorage
 * @param {string} key - Clave de localStorage
 * @returns {string|null} ID válido o null
 */
const getValidIdFromStorage = (key) => {
  let value = localStorage.getItem(key);

  // Limpiar strings inválidos
  if (!value || value === "undefined" || value === "null" || value === "[object Object]") {
    return null;
  }

  // Verificar que sea un ObjectId válido
  if (!isValidObjectId(value)) {
    return null;
  }

  return value;
};

/**
 * Crear un movimiento
 * @param {{type:'ingreso'|'egreso', frecuencyType:'nuevo'|'recurrente', value:string|number, description?:string, date:string}}
 * @returns {Promise<any>} payload del backend (normalmente { data: {...} })
 */
export const addMovementService = async (movement) => {
  const res = await axiosApi.post("/movements", movement, {
    withCredentials: true,
  });
  return res.data;
};

/**
 * Obtener los movimientos de un usuario (prestador de servicio)
 * @param {string} userId - ID del usuario
 * @param {string} type - Tipo de movimiento ('ingreso' | 'egreso')
 * @returns {Promise<any>} Lista de movimientos
 */
export const getMovementsService = async (userId, type = "") => {
  if (!userId) throw new Error("userId requerido para obtener movimientos");

  const baseUrl = `/movements/user/${userId}`;
  const url = type && type !== "todos" ? `${baseUrl}?type=${type}` : baseUrl;

  const res = await axiosApi.get(url, { withCredentials: true });
  // Backend devuelve { data: { movements: [...], totalExpenses, totalIncomes } }
  const responseData = res.data?.data ?? {};
  return Array.isArray(responseData) ? responseData : (responseData?.movements || []);
};

/**
 * Traer últimos movimientos de N días y normalizarlos a:
 * [{ id, type:'ingreso'|'egreso', value:number, description:string, date:string }]
 * NOTA: preservamos la fecha como string (no new Date()) para comparar por YYYY-MM-DD.
 * @param {number} days - Número de días para obtener los últimos movimientos
 * @returns {Promise<any>} Lista de movimientos normalizados
 */
export const getLastMovements = async (days = 30) => {
  try {
    const { data } = await axiosApi.get(`/movements/last?days=${days}`, {
      withCredentials: true,
    });

    const payload = data?.data || {};

    // El backend puede responder "expenses" o "expense"
    const incomes = Array.isArray(payload.incomes) ? payload.incomes : [];
    const expensesRaw = Array.isArray(payload.expenses)
      ? payload.expenses
      : Array.isArray(payload.expense)
        ? payload.expense
        : [];

    const normalize = (arr, type) =>
      arr.map((x) => ({
        id: x.id || x._id,
        type, // 'ingreso' | 'egreso'
        value: Number(x.value ?? 0),
        description: x.description || "",
        date: (x.date || x.createdAt || "").toString(), // 👈 conservar string
      }));

    // Mezcla ingresos + egresos
    return [...normalize(incomes, "ingreso"), ...normalize(expensesRaw, "egreso")];
  } catch {
    return [];
  }
};

/**
 * Actualizar un movimiento
 * @param {string} id - ID del movimiento a actualizar
 * @param {object} data - Datos a actualizar en el movimiento
 * @returns {Promise<any>} Respuesta del backend
 */
export const updateMovementService = async (id, data) =>
  axiosApi.patch(`/movements/${id}`, data, { withCredentials: true });

/**
 * Eliminar un movimiento
 * @param {string} id - ID del movimiento a eliminar
 * @returns {Promise<any>} Respuesta del backend
 */
export const deleteMovementService = async (id) =>
  axiosApi.delete(`/movements/${id}`, { withCredentials: true });

/**
 * Obtener los movimientos de un negocio (propietario)
 * @param {string} businessId - ID del negocio
 * @param {string} type - Tipo de movimiento ('ingreso' | 'egreso')
 * @param {string} filterDate - Filtro de fecha (sevenDays, month, quarter, year, all)
 * @returns {Promise<any>} Los movimientos del negocio
 */

export const getMovementsForBusinessOwner = async (businessId, type = "", filterDate = "all") => {
  if (!businessId || businessId === "undefined" || businessId === "null") {
    throw new Error("businessId requerido y válido para obtener movimientos");
  }

  // Validar formato de ObjectId
  if (!isValidObjectId(businessId)) {
    throw new Error("El ID del negocio no tiene un formato válido");
  }

  const url = `/movements/business/${businessId}?type=${type}&filterDate=${filterDate}`;
  const res = await axiosApi.get(url, { withCredentials: true });
  const responseData = res.data?.data ?? {};
  return Array.isArray(responseData) ? responseData : (responseData?.movements || []);
};

/**
 * Obtener los movimientos de un prestador de servicio
 * @param {string} userId - ID del usuario
 * @param {string} type - Tipo de movimiento ('ingreso' | 'egreso')
 * @param {string} filterDate - Filtro de fecha (sevenDays, month, quarter, year, all)
 * @returns {Promise<any>} Los movimientos del prestador
 */
export const getMovementsForServiceProvider = async (userId, type = "", filterDate = "all") => {
  if (!userId || userId === "undefined" || userId === "null") {
    throw new Error("userId requerido y válido para obtener movimientos");
  }

  // Validar formato de ObjectId
  if (!isValidObjectId(userId)) {
    throw new Error("El ID del usuario no tiene un formato válido");
  }

  const url = `/movements/user/${userId}?type=${type}&filterDate=${filterDate}`;
  const res = await axiosApi.get(url, { withCredentials: true });
  const responseData = res.data?.data ?? {};
  return Array.isArray(responseData) ? responseData : (responseData?.movements || []);
};

/**
 * Obtener el resumen diario del dashboard
 * Endpoint: GET /api/movements/summary/691d0d44f0aab1a15cf96664
 * Incluye: dailyBalance, totalTransactionsDay, totalTransactionsMonth, monthBalance, calculationSales
 * @returns {Promise<any>} Resumen completo del día y mes
 */
export const getDailySummaryService = async () => {
  try {
    // Limpiar IDs invalidos primero
    const rawUserId = localStorage.getItem('user_id');
    const rawBusinessId = localStorage.getItem('business_id');

    if (rawUserId && !isValidObjectId(rawUserId)) {
      localStorage.removeItem('user_id');
    }
    if (rawBusinessId && !isValidObjectId(rawBusinessId)) {
      localStorage.removeItem('business_id');
    }

    // Obtener el ID limpio
    const id = getValidIdFromStorage('user_id');

    if (!id || !isValidObjectId(id)) {
      return null;
    }

    const res = await axiosApi.get(`/movements/summary/${id}`, {
      withCredentials: true,
    });

    if (res.data && res.data.data) {
      return res.data.data;
    }

    return res.data;
  } catch {
    throw new Error("Error obteniendo resumen diario");
  }
};