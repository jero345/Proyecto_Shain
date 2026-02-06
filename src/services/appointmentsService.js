import { axiosApi } from '@services/axiosclient';

const pick = (r) => r?.data?.data ?? r?.data ?? r;

/**
 * Horarios disponibles por fecha (YYYY-MM-DD)
 * El backend ya devuelve el campo 'available' correcto
 */
export const getAvailableTimeslots = async (date) => {
  try {
    const response = await axiosApi.get(`/timeslots/available`, {
      params: { date },
      withCredentials: true,
    });

    const timeslots = pick(response) ?? [];

    // Usar directamente el valor 'available' que viene del backend
    return timeslots.map((item) => ({
      _id: item._id || item.id,
      label: item.hour,
      hour: item.hour,
      available: item.available === true, // Comparación estricta
    }));
  } catch {
    return [];
  }
};

/**
 * Crear cita
 */
export const bookAppointmentService = async (appointment) => {
  try {
    const { data } = await axiosApi.post('/bookings', appointment, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

/**
 * Traer todas las citas con el timeSlot poblado para obtener la HORA
 */
export const getAllAppointmentsService = async () => {
  try {
    const res = await axiosApi.get('/bookings', {
      withCredentials: true,
    });

    const list = pick(res) ?? [];

    // Normalizamos para la UI según la estructura real del backend
    const normalized = list.map((a) => {
      // Extraer hora del timeSlot (que es un objeto)
      let hour = null;
      if (a.timeSlot && typeof a.timeSlot === 'object' && a.timeSlot.hour) {
        hour = a.timeSlot.hour;
      }

      return {
        _id: a._id,
        id: a.id || a._id,
        date: a.date,
        customerName: a.customerName || '',
        description: a.description || '',
        timeSlotId: a.timeSlot?._id || a.timeSlot?.id || null,
        hour: hour,
      };
    });

    return normalized;
  } catch {
    return [];
  }
};


/**
 * Eliminar cita por ID
 */
export const deleteAppointmentService = async (id) => {
  try {
    const { data } = await axiosApi.delete(`/bookings/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

/**
 * Traer todas las citas con un filtro (today, currentMonth, all)
 */
export const getAppointmentsWithFilterService = async (filter) => {
  try {
    const { data } = await axiosApi.get(`/bookings`, {
      params: { filter },
      withCredentials: true,
    });

    const list = data?.data ?? [];

    return list.map((a) => ({
      id: a._id || a.id,
      date: a.date || a.day || a.appointmentDate || null,
      customerName: a.customerName || a.clientName || a.client || a.name || '',
      description: a.description || a.notes || '',
      timeSlotId: typeof a.timeSlot === 'string'
        ? a.timeSlot
        : a.timeSlot?._id || a.timeSlot?.id || null,
      hour: a.hour || a.time || a.timeSlot?.hour || a.timeslot?.hour || null,
    }));
  } catch {
    return [];
  }
};
