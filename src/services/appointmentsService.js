import { axiosInstance } from '@services/axiosclient';

/**
 * Obtiene los horarios disponibles para una fecha específica.
 * @param {string} date - Fecha en formato YYYY-MM-DD.
 * @returns {Promise<string[]>} - Array de horas disponibles.
 */
export const getAvailableTimeslots = async (date) => {
  const res = await axiosInstance.get(`/timeslots/available?date=${date}`, {
    withCredentials: true,
  });
console.log("📥 Horarios disponibles:", res.data.data);
  // Extraemos solo las horas disponibles
  return res.data.data
    .filter((item) => item.available)
    .map((item) => item.hour);
};

/**
 * Registra una nueva cita.
 * @param {Object} appointmentData - Datos de la cita.
 * @returns {Promise<Object>} - Datos de la cita registrada.
 */
export const bookAppointmentService = async (appointmentData) => {
  const res = await axiosInstance.post('/appointments', appointmentData, {
    withCredentials: true,
  });
  return res.data;
};