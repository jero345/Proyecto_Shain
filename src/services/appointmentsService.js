import { axiosApi } from '@services/axiosclient';

const pick = (r) => r?.data?.data ?? r?.data ?? r;

/**
 * Horarios disponibles por fecha (YYYY-MM-DD)
 */
export const getAvailableTimeslots = async (date) => {
  try {
    const res = await axiosApi.get(`/timeslots/available`, {
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
    const { data } = await axiosApi.post('/bookings', appointment, {
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
  console.log('🚀 FUNCIÓN getAllAppointmentsService INICIADA');
  
  try {
    console.log('🔍 Solicitando citas al backend...');
    
    const res = await axiosApi.get('/bookings', {
      withCredentials: true,
    });

    console.log('📦 Respuesta completa del backend:', res);
    console.log('📊 Data cruda:', res.data);

    const list = pick(res) ?? [];
    
    console.log('📋 Lista extraída (después de pick):', list);
    console.log('📏 Cantidad de citas:', list.length);

    // Normalizamos para la UI según la estructura real del backend
    const normalized = list.map((a, index) => {
      console.log(`\n--- 🔎 Procesando cita ${index + 1} ---`);
      console.log('Raw appointment:', a);
      console.log('  · _id:', a._id);
      console.log('  · id:', a.id);
      console.log('  · date:', a.date);
      console.log('  · customerName:', a.customerName);
      console.log('  · description:', a.description);
      console.log('  · timeSlot:', a.timeSlot);
      
      // Extraer hora del timeSlot (que es un objeto)
      let hour = null;
      if (a.timeSlot && typeof a.timeSlot === 'object' && a.timeSlot.hour) {
        hour = a.timeSlot.hour;
        console.log('  · hora extraída de timeSlot.hour:', hour);
      }

      const normalized = {
        _id: a._id,
        id: a.id || a._id,
        date: a.date,
        customerName: a.customerName || '',
        description: a.description || '',
        timeSlotId: a.timeSlot?._id || a.timeSlot?.id || null,
        hour: hour, // Hora extraída del objeto timeSlot
      };

      console.log('✅ Normalizada:', normalized);
      return normalized;
    });

    console.log('\n📦 RESULTADO FINAL (todas las citas normalizadas):', normalized);
    console.log('📊 Total de citas procesadas:', normalized.length);

    return normalized;
  } catch (error) {
    console.error('❌ Error al obtener las citas:', error);
    console.error('❌ Error completo:', error.response || error);
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
    console.error('❌ Error al eliminar la cita:', error);
    throw error?.response?.data || error;
  }
};

/**
 * Traer todas las citas con un filtro (today, currentMonth, all)
 */
export const getAppointmentsWithFilterService = async (filter) => {
  try {
    const { data } = await axiosApi.get(`/bookings`, {
      params: { filter }, // today - month - all
      withCredentials: true,
    });

    const list = data?.data ?? [];

    // Normalizamos las citas para la UI
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
  } catch (error) {
    console.error('❌ Error al obtener las citas con filtro:', error);
    return [];
  }
};