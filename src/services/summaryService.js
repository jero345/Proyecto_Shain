// src/services/summaryService.js
import { axiosApi } from "@services/axiosclient";

/**
 * Obtener el resumen diario del dashboard
 * Incluye: dailyBalance, totalTransactionsDay, totalTransactionsMonth, monthBalance, calculationSales
 * @returns {Promise<any>} Resumen completo del día y mes
 */
export const getDailySummaryService = async () => {
  console.log('📊 Solicitando resumen diario al backend...');
  
  try {
    const res = await axiosApi.get('/summary/daily', {
      withCredentials: true,
    });

    console.log('✅ Resumen recibido del backend:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error obteniendo resumen diario:', error);
    throw error;
  }
};