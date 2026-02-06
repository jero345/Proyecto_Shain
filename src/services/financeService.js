// src/services/financeService.js

import { axiosApi } from '@services/axiosclient';

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} true if valid
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[a-fA-F0-9]{24}$/.test(id);
};

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
  } catch {
    return [];
  }
};

// Resumen de finanzas del negocio (para propietarios)
export const getBusinessFinanceSummary = async (businessId, type) => {
  try {
    if (!businessId || businessId === "undefined" || businessId === "null") {
      return [];
    }

    if (!isValidObjectId(businessId)) {
      return [];
    }

    const { data } = await axiosApi.get(
      `/movements/business/${businessId}?type=${type}`,
      { withCredentials: true }
    );

    const responseData = data?.data || {};
    return Array.isArray(responseData) ? responseData : (responseData?.movements || []);
  } catch {
    return [];
  }
};

// Resumen de finanzas del usuario (para prestadores de servicios)
export const getUserFinanceSummary = async (userId) => {
  try {
    if (!userId || userId === "undefined" || userId === "null") {
      return [];
    }

    if (!isValidObjectId(userId)) {
      return [];
    }

    const { data } = await axiosApi.get(
      `/movements/user/${userId}`,
      { withCredentials: true }
    );

    const responseData = data?.data || {};
    return Array.isArray(responseData) ? responseData : (responseData?.movements || []);
  } catch {
    return [];
  }
};