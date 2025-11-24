// src/services/addMovementService.js
import { axiosApi } from "@services/axiosclient";

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
  return res.data?.data ?? [];
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
  } catch (error) {
    console.error("❌ Error al obtener últimos movimientos:", error);
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
  if (!businessId) throw new Error("businessId requerido para obtener movimientos");

  const url = `/movements/business/${businessId}?type=${type}&filterDate=${filterDate}`;
  const res = await axiosApi.get(url, { withCredentials: true });
  return res.data?.data ?? [];
};

/**
 * Obtener los movimientos de un prestador de servicio
 * @param {string} userId - ID del usuario
 * @param {string} type - Tipo de movimiento ('ingreso' | 'egreso')
 * @param {string} filterDate - Filtro de fecha (sevenDays, month, quarter, year, all)
 * @returns {Promise<any>} Los movimientos del prestador
 */
export const getMovementsForServiceProvider = async (userId, type = "", filterDate = "all") => {
  if (!userId) throw new Error("userId requerido para obtener movimientos");

  const url = `/movements/user/${userId}?type=${type}&filterDate=${filterDate}`;
  const res = await axiosApi.get(url, { withCredentials: true });
  return res.data?.data ?? [];
};

/**
 * Obtener el resumen diario del dashboard
 * Endpoint: GET /api/movements/summary/691d0d44f0aab1a15cf96664
 * Incluye: dailyBalance, totalTransactionsDay, totalTransactionsMonth, monthBalance, calculationSales
 * @returns {Promise<any>} Resumen completo del día y mes
 */
export const getDailySummaryService = async () => {
  console.log('📊 Solicitando resumen diario al backend...');
  
  try {
    const userId = localStorage.getItem('user_id');
    const businessId = localStorage.getItem('business_id');
    const id = userId || businessId;

    if (!id) {
      throw new Error('No se encontró el ID del usuario o negocio');
    }

    // La URL es fija, sin parámetros de fecha
    const url = `/movements/summary/${id}`;

    console.log('🔗 URL:', url);

    const res = await axiosApi.get(url, {
      withCredentials: true,
    });

    console.log('✅ Respuesta completa del backend:', res.data);
    
    // Retornamos directamente res.data.data
    if (res.data && res.data.data) {
      console.log('✅ Datos del resumen:', res.data.data);
      return res.data.data;
    }
    
    // Fallback por si la estructura es diferente
    console.warn('⚠️ Estructura inesperada, retornando res.data');
    return res.data;
    
  } catch (error) {
    console.error('❌ Error obteniendo resumen diario:', error);
    throw error;
  }
};