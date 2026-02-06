// src/services/summaryService.js
import { axiosApi } from "@services/axiosclient";

/**
 * Obtener el resumen diario del dashboard
 * Incluye: dailyBalance, totalTransactionsDay, totalTransactionsMonth, monthBalance, calculationSales
 * @returns {Promise<any>} Resumen completo del día y mes
 */
export const getDailySummaryService = async () => {
  const res = await axiosApi.get('/summary/daily', {
    withCredentials: true,
  });
  return res.data;
};
