import { useState, useEffect } from "react";
import { getAppointmentsWithFilterService, deleteAppointmentService } from "@services/appointmentsService";
import { motion, AnimatePresence } from "framer-motion";

export const AppointmentsList = () => {
  // ============================================
  // ESTADO
  // ============================================
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirmationMessage, setConfirmationMessage] = useState("");

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    console.log('🔄 useEffect ejecutado - Filter:', filter);
    fetchAppointments();
  }, [filter]);

  // ============================================
  // FUNCIONES DE DATOS
  // ============================================
  const fetchAppointments = async () => {
    console.log('📞 Llamando a fetchAppointments con filtro:', filter);
    setLoading(true);
    setError("");
    
    try {
      const data = await getAppointmentsWithFilterService(filter);
      console.log('📦 Datos recibidos en componente:', data);
      
      const validAppointments = Array.isArray(data) ? data.filter(appt => appt?.date) : [];
      console.log('✅ Citas válidas (con fecha):', validAppointments);
      
      setAppointments(validAppointments);
    } catch (err) {
      console.error("❌ Error cargando citas:", err);
      setError("No se pudieron cargar las citas.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("¿Estás seguro que deseas completar esta cita?");
    if (!ok) return;

    const idStr = String(id);
    
    // Eliminación optimista
    setAppointments(prev => prev.filter(a => String(a._id || a.id || '') !== idStr));
    setConfirmationMessage("✅ Cita completada correctamente.");
    setTimeout(() => setConfirmationMessage(""), 3000);

    try {
      await deleteAppointmentService(id);
    } catch (error) {
      console.error("❌ Error al completar la cita:", error);
      await fetchAppointments();
      setConfirmationMessage("❌ No se pudo completar la cita.");
      setTimeout(() => setConfirmationMessage(""), 3000);
    }
  };

  // ============================================
  // FUNCIONES DE FORMATO
  // ============================================
  const formatFechaLarga = (fechaStr) => {
    if (!fechaStr) return "—";
    
    try {
      // Parsear la fecha correctamente (formato YYYY-MM-DD)
      const [year, month, day] = fechaStr.split('-').map(Number);
      const fecha = new Date(year, month - 1, day);
      
      console.log('📅 Formateando fecha:', fechaStr, '→', fecha);
      
      const opciones = {
        weekday: "long",
        day: "numeric",
        month: "long",
      };
      
      const texto = fecha.toLocaleDateString("es-ES", opciones);
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return fechaStr;
    }
  };

  const formatHora = (h) => {
    console.log('🕐 Formateando hora:', h, 'tipo:', typeof h);
    
    if (h === null || h === undefined || h === '') {
      return "Sin hora asignada";
    }

    let horaStr = String(h).trim();

    // Si es número, convertir a formato HH:00
    if (typeof h === 'number') {
      horaStr = `${Math.floor(h % 24)}:00`;
    }

    // Formato AM/PM (ejemplo: "7:00 PM")
    const regexAMPM = /^([0-9]{1,2}):([0-9]{2})\s*(AM|PM)$/i;
    if (regexAMPM.test(horaStr)) {
      const match = horaStr.match(regexAMPM);
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const ampm = match[3].toUpperCase();

      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      const fecha = new Date();
      fecha.setHours(hours, minutes, 0, 0);
      
      const formatted = fecha.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      
      console.log('  ✅ Hora formateada (AM/PM):', formatted);
      return formatted;
    }

    // Formato 24 horas (ejemplo: "19:00")
    const regexHHMM = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (regexHHMM.test(horaStr)) {
      const [hours, minutes] = horaStr.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
        return "Hora inválida";
      }

      const fecha = new Date();
      fecha.setHours(hours, minutes, 0, 0);
      
      const formatted = fecha.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      
      console.log('  ✅ Hora formateada (24h):', formatted);
      return formatted;
    }

    console.log('  ⚠️ Formato no reconocido, devolviendo original');
    return horaStr;
  };

  // ============================================
  // FUNCIONES DE FILTRADO (CORREGIDAS)
  // ============================================
  const filterAppointments = (appts) => {
    console.log('🔍 Filtrando citas. Total:', appts.length, 'Filtro:', filter);
    
    // Obtener fecha de hoy en formato YYYY-MM-DD para comparación directa
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    console.log('📅 Fecha de hoy (string):', todayStr);
    
    switch (filter) {
      case "today":
        const todayFiltered = appts.filter((appt) => {
          const apptDate = appt?.date; // Ya viene en formato YYYY-MM-DD
          console.log('  Comparando:', apptDate, '===', todayStr, '→', apptDate === todayStr);
          return apptDate === todayStr;
        });
        console.log('✅ Citas filtradas para hoy:', todayFiltered.length);
        return todayFiltered;

      case "currentMonth":
        const monthFiltered = appts.filter((appt) => {
          const apptDate = appt?.date;
          if (!apptDate) return false;
          
          const [year, month] = apptDate.split('-').map(Number);
          const matches = year === today.getFullYear() && month === (today.getMonth() + 1);
          console.log('  Mes:', apptDate, '→', matches);
          return matches;
        });
        console.log('✅ Citas filtradas para este mes:', monthFiltered.length);
        return monthFiltered;

      case "all":
      default:
        console.log('✅ Mostrando todas las citas:', appts.length);
        return appts;
    }
  };

  // Aplicar filtro y ordenar por fecha y hora
  const filteredAndSortedAppointments = filterAppointments(appointments)
    .sort((a, b) => {
      // Primero por fecha
      const dateA = a?.date || '';
      const dateB = b?.date || '';
      
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      
      // Si las fechas son iguales, ordenar por hora
      const hourA = a?.hour || '';
      const hourB = b?.hour || '';
      return hourA.localeCompare(hourB);
    });

  console.log('📊 Citas después de filtrar y ordenar:', filteredAndSortedAppointments.length);

  // ============================================
  // ESTADOS DE CARGA Y ERROR
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Cargando citas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f]">
        <div className="text-center">
          <p className="text-red-400 text-xl font-semibold mb-4">❌ {error}</p>
          <button
            onClick={fetchAppointments}
            className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition text-white"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-8 text-center text-white">
          📅 Citas Agendadas
        </h1>

        {/* Filtro */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-sm border border-white/20 shadow-lg">
            <label className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-sm font-medium text-white">
              <span className="whitespace-nowrap">Mostrar:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white/20 text-white border border-white/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer transition w-full sm:w-auto"
                style={{ minWidth: "180px" }}
              >
                <option value="all" className="bg-[#4b1d69] text-white">Todas las citas</option>
                <option value="today" className="bg-[#4b1d69] text-white">Solo hoy</option>
                <option value="currentMonth" className="bg-[#4b1d69] text-white">Mes actual</option>
              </select>
            </label>
          </div>
        </div>

        {/* Mensaje de confirmación */}
        <AnimatePresence>
          {confirmationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-6"
            >
              <div className={`inline-block px-6 py-3 rounded-lg font-semibold shadow-lg ${
                confirmationMessage.includes('❌') 
                  ? 'bg-red-500/20 text-red-300 border border-red-400/30' 
                  : 'bg-green-500/20 text-green-300 border border-green-400/30'
              }`}>
                {confirmationMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabla o mensaje vacío */}
        {filteredAndSortedAppointments.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block bg-white/10 rounded-2xl px-8 py-12 backdrop-blur-sm border border-white/20">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-xl text-white/90 font-medium">
                {filter === "today"
                  ? "No hay citas programadas para hoy"
                  : filter === "currentMonth"
                  ? "No hay citas programadas este mes"
                  : "No hay citas registradas"}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/90">
                <thead>
                  <tr className="bg-white/20 text-white text-xs sm:text-sm uppercase tracking-wider">
                    <th className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">📅 FECHA</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">⏰ HORA</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">👤 CLIENTE</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">📝 DESCRIPCIÓN</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center whitespace-nowrap">✓</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredAndSortedAppointments.map((appt) => {
                      const fecha = formatFechaLarga(appt?.date);
                      const hora = formatHora(appt?.hour);
                      const id = appt._id || appt.id;

                      console.log('🎯 Renderizando cita:', { id, fecha, hora, customer: appt?.customerName });

                      return (
                        <motion.tr
                          key={id}
                          initial={{ opacity: 1, y: 0 }}
                          exit={{ 
                            opacity: 0, 
                            x: -100, 
                            transition: { duration: 0.3 } 
                          }}
                          className="border-b border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-medium">
                            {fecha}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-medium">
                            {hora}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            {appt?.customerName || "—"}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            {appt?.description?.trim() || "—"}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                            <button
                              onClick={() => handleDelete(id)}
                              className="bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center transition-all hover:scale-110 border border-white/30 mx-auto"
                              title="Completar cita"
                            >
                              <span className="text-white text-lg font-bold">✓</span>
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsList;