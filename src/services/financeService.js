import { axiosInstance } from '@services/axiosclient';

export const getFinanceSummary = async (date) => {
  try {
    const { data } = await axiosInstance.get(`/movements/summary?date=${date}`, {
      withCredentials: true,
    });

    const d = data?.data;
    if (!d) return null;

    // Normalizamos a lo que la vista necesita
    const incomesDay   = d.totalTransactionsDay?.incomes ?? 0;
    const expensesDay  = d.totalTransactionsDay?.expenses ?? 0;
    const incomesMonth = d.totalTransactionsMonth?.incomes ?? 0;
    const expensesMonth= d.totalTransactionsMonth?.expenses ?? 0;

    return {
      // día
      balanceDay: d.dailyBalance ?? (incomesDay - expensesDay),
      incomesDay,
      expensesDay,

      // mes
      ingresos: incomesMonth,
      egresos: expensesMonth,
      monthBalance: d.monthBalance ?? (incomesMonth - expensesMonth),

      // métricas calculadas por backend
      salesIncreaseAmountDay: d.calculationSales?.salesIncreaseAmountDay ?? 0,
      salesGrowthPercentageDay: d.calculationSales?.salesGrowthPercentageDay ?? 0,
      salesGrowthPercentageMonth: d.calculationSales?.salesGrowthPercentageMonth ?? 0,

      goal: d.goal ?? 0,
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
