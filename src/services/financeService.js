// src/services/financeService.js

import { axiosApi } from '@services/axiosclient';

// Obtener resumen financiero
export const getFinanceSummary = async (date) => {
  try {
    const { data } = await axiosApi.get(`/movements/summary?date=${date}`, {
      withCredentials: true,
    });

    const d = data?.data;
    if (!d) return null;

    // Normalizamos los datos
    const incomesDay = d.totalTransactionsDay?.incomes ?? 0;
    const expensesDay = d.totalTransactionsDay?.expenses ?? 0;
    const incomesMonth = d.totalTransactionsMonth?.incomes ?? 0;
    const expensesMonth = d.totalTransactionsMonth?.expenses ?? 0;

    return {
      balanceDay: d.dailyBalance ?? (incomesDay - expensesDay),
      incomesDay,
      expensesDay,
      ingresos: incomesMonth,
      egresos: expensesMonth,
      monthBalance: d.monthBalance ?? (incomesMonth - expensesMonth),
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

// Obtener movimientos recientes
export const getLastMovements = async (days = 30) => {
  try {
    const { data } = await axiosApi.get(`/movements/last?days=${days}`, {
      withCredentials: true,
    });

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

// Resumen de finanzas del negocio
export const getBusinessFinanceSummary = async (businessId) => {
  try {
    const { data } = await axiosApi.get(`/movements/business/${businessId}`, {
      withCredentials: true,
    });

    const d = data?.data;
    if (!d) return null;

    const incomesMonth = d.totalTransactionsMonth?.incomes ?? 0;
    const expensesMonth = d.totalTransactionsMonth?.expenses ?? 0;

    return {
      ingresos: incomesMonth,
      egresos: expensesMonth,
      balanceMonth: d.monthBalance ?? (incomesMonth - expensesMonth),
      goal: d.goal ?? 0,
    };
  } catch (error) {
    console.error("❌ Error al obtener resumen financiero del negocio:", error);
    throw error.response?.data || error;
  }
};
