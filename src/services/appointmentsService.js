import { axiosInstance } from '@services/axiosclient';


/**
 * Obtiene los horarios disponibles para una fecha específica.
 * @param {string} date - Fecha en formato YYYY-MM-DD.
 * @returns {Promise<Object[]>} - Array de objetos {_id, label, available}.
 */
export const getAvailableTimeslots = async (date) => {
  try {
    const res = await axiosInstance.get(`/timeslots/available?date=${date}`, {
      withCredentials: true,
    });

    console.log("📥 Horarios disponibles:", res.data.data);

    return res.data.data.map((item) => ({
      _id: item.id,
      label: item.hour,
      available: item.available,
    }));
  } catch (error) {
    console.error("❌ Error al obtener horarios:", error);
    return [];
  }
};

/**
 * Registra una nueva cita.
 */
export const bookAppointmentService = async (appointment) => {
  try {
    const { data } = await axiosInstance.post('/bookings', appointment, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error('❌ Error en la creación de la cita:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtiene todas las citas agendadas.
 * @returns {Promise<Object[]>} - Array de citas.
 */
export const getAllAppointmentsService = async () => {
  try {
    const { data } = await axiosInstance.get('/bookings', {
      withCredentials: true,
    });
    return data.data; // asumiendo que el backend devuelve { data: [...] }
  } catch (error) {
    console.error('❌ Error al obtener las citas:', error);
    return [];
  }
};