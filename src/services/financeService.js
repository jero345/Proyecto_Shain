import { axiosInstance } from '@services/axiosclient';

/**
 * 📌 Resumen financiero de un día
 */
export const getFinanceSummary = async (date) => {
  try {
    const { data } = await axiosInstance.get(`/movements/summary?date=${date}`, {
      withCredentials: true,
    });

    console.log("📥 Respuesta /summary:", data);

    if (!data?.data) return null;

    const { incomesDay = 0, incomesMonth = 0, expensesMonth = 0 } = data.data;

    return {
      balanceDay: incomesDay - expensesMonth, // ⚡ saldo del día
      ingresos: incomesMonth,
      egresos: expensesMonth,
      incomesDay,
    };
  } catch (error) {
    console.error("❌ Error al obtener resumen financiero:", error);
    throw error.response?.data || error;
  }
};

/**
 * 📌 Histórico de movimientos (para gráfica)
 */
export const getLastMovements = async (days = 30) => {
  try {
    const { data } = await axiosInstance.get(`/movements/last?days=${days}`, {
      withCredentials: true,
    });

    console.log("📥 Respuesta /last:", data);

    const { incomes = [], expense = [] } = data?.data || {};

    return [
      ...incomes.map((i) => ({ ...i, type: 'Ingreso' })),
      ...expense.map((e) => ({ ...e, type: 'Egreso' })),
    ];
  } catch (error) {
    console.error("❌ Error al obtener últimos movimientos:", error);
    return [];
  }
};
