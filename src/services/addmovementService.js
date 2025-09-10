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
 * Traer últimos movimientos de N días y normalizarlos a:
 * [{ id, type:'ingreso'|'egreso', value:number, description:string, date:string }]
 * NOTA: preservamos la fecha como string (no new Date()) para comparar por YYYY-MM-DD.
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

/** Extras opcionales por si los usas en otras vistas */
export const getMovementsService = async (type = "") => {
  const url = type && type !== "todos" ? `/movements?type=${type}` : "/movements";
  const res = await axiosApi.get(url, { withCredentials: true });
  return res.data?.data ?? [];
};

export const updateMovementService = async (id, data) =>
  axiosApi.patch(`/movements/${id}`, data, { withCredentials: true });

export const deleteMovementService = async (id) =>
  axiosApi.delete(`/movements/${id}`, { withCredentials: true });
