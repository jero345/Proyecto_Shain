import { axiosInstance } from '@services/axiosclient';

const pick = (r) => r?.data?.data ?? r?.data ?? r;

/**
 * Horarios disponibles por fecha (YYYY-MM-DD)
 */
export const getAvailableTimeslots = async (date) => {
  try {
    const res = await axiosInstance.get(`/timeslots/available`, {
      params: { date },
      withCredentials: true,
    });

    const list = pick(res) ?? [];
    // Normalizamos: _id, label(hora), available
    return list.map((item) => ({
      _id: item._id || item.id,
      label: item.hour,
      available: !!item.available,
    }));
  } catch (error) {
    console.error('❌ Error al obtener horarios:', error);
    return [];
  }
};

/**
 * Crear cita
 */
export const bookAppointmentService = async (appointment) => {
  try {
    const { data } = await axiosInstance.post('/bookings', appointment, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error('❌ Error en la creación de la cita:', error);
    throw error?.response?.data || error;
  }
};

/**
 * Traer todas las citas con el timeSlot poblado para obtener la HORA
 * (Si tu backend usa otro nombre de parámetro, cambia "populate" por include/expand/etc.)
 */
export const getAllAppointmentsService = async () => {
  try {
    const res = await axiosInstance.get('/bookings', {
      params: { populate: 'timeSlot' }, // <= ajusta si tu API usa otro nombre
      withCredentials: true,
    });

    const list = pick(res) ?? [];

    // Normalizamos para la UI
    return list.map((a) => ({
      id: a._id || a.id,
      date: a.date || a.day || a.appointmentDate || null,
      customerName: a.customerName || a.clientName || a.client || a.name || '',
      description: a.description || a.notes || '',
      timeSlotId:
        typeof a.timeSlot === 'string'
          ? a.timeSlot
          : a.timeSlot?._id || a.timeSlot?.id || null,
      // Hora robusta: usa la del timeSlot poblado si viene
      hour:
        a.hour ||
        a.time ||
        a.timeSlot?.hour ||
        a.timeslot?.hour ||
        (typeof a.timeSlot === 'string' ? null : a.timeSlot?.hour) ||
        null,
    }));
  } catch (error) {
    console.error('❌ Error al obtener las citas:', error);
    return [];
  }
};
