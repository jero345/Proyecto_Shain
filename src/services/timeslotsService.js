// src/services/timeslotsService.js
import { axiosApi } from '@services/axiosclient';

/**
 * Normaliza la respuesta del backend para extraer el array de timeslots
 */
const normalizeResponse = (response) => {
  // Si la respuesta es directamente un array
  if (Array.isArray(response)) {
    return response;
  }

  // Si viene en response.data
  if (response?.data && Array.isArray(response.data)) {
    return response.data;
  }

  // Si viene en response.timeslots
  if (response?.timeslots && Array.isArray(response.timeslots)) {
    return response.timeslots;
  }

  // Si viene en response.slots
  if (response?.slots && Array.isArray(response.slots)) {
    return response.slots;
  }

  // Si viene en response.results
  if (response?.results && Array.isArray(response.results)) {
    return response.results;
  }

  // Si es un objeto con propiedades que parecen timeslots
  if (response && typeof response === 'object' && !Array.isArray(response)) {
    // Intentar encontrar alguna propiedad que sea un array
    const keys = Object.keys(response);
    for (const key of keys) {
      if (Array.isArray(response[key])) {
        return response[key];
      }
    }
  }

  return [];
};

/**
 * Crear un nuevo timeslot
 */
export const createTimeslotsService = async (payload) => {
  const { data } = await axiosApi.post("/timeslots", payload, {
    withCredentials: true,
  });
  return data;
};

/**
 * Obtener todos los timeslots
 * Intenta múltiples rutas porque el backend puede tener diferentes endpoints
 */
export const getTimeslotsService = async () => {
  // Lista de posibles rutas a intentar
  const possibleRoutes = [
    "/timeslots/available",
    "/timeslots",
    "/timeslots/all",
    "/admin/timeslots",
    "/api/timeslots",
  ];

  for (const route of possibleRoutes) {
    try {
      const { data } = await axiosApi.get(route, {
        withCredentials: true,
      });
      return normalizeResponse(data);
    } catch (error) {
      const status = error.response?.status;

      // Si es 401, el problema es autenticación - no seguir intentando
      if (status === 401) {
        throw error;
      }

      // Si es 404, intentar siguiente ruta
      if (status === 404) {
        continue;
      }

      // Cualquier otro error, lanzarlo
      throw error;
    }
  }

  // Si ninguna ruta funcionó
  throw new Error('No se encontró una ruta válida para timeslots. Verifica la configuración del backend.');
};

/**
 * Obtener timeslots para una fecha específica (para la agenda)
 */
export const getTimeslotsByDate = async (date) => {
  const { data } = await axiosApi.get(`/timeslots/available?date=${date}`, {
    withCredentials: true,
  });
  return normalizeResponse(data);
};

/**
 * Actualizar un timeslot
 */
export const updateTimeslotsService = async (timeslotId, payload) => {
  const { data } = await axiosApi.put(`/timeslots/${timeslotId}`, payload, {
    withCredentials: true,
  });
  return data;
};

/**
 * Eliminar un timeslot
 */
export const deleteTimeslotsService = async (timeslotId) => {
  const { data } = await axiosApi.delete(`/timeslots/${timeslotId}`, {
    withCredentials: true,
  });
  return data;
};
