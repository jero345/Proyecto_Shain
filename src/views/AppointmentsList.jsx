import { useState, useEffect } from "react";
import { getAppointmentsWithFilterService, deleteAppointmentService } from "@services/appointmentsService";
import { motion, AnimatePresence } from "framer-motion";

export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // 'today', 'currentMonth', 'all'
  const [confirmationMessage, setConfirmationMessage] = useState(""); // Mensaje de confirmación de eliminación

  useEffect(() => {
    // Usar la función fetchAppointments definida abajo
    fetchAppointments();
  }, [filter]);

  // Función reutilizable para cargar citas (se usa en useEffect y como fallback)
  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAppointmentsWithFilterService(filter);
      const validAppointments = Array.isArray(data) ? data.filter(appt => appt?.date) : [];
      setAppointments(validAppointments);
    } catch (err) {
      console.error("❌ Error cargando citas:", err);
      setError("No se pudieron cargar las citas.");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar visualmente con animación
  const handleDelete = async (id) => {
    // Preguntar confirmación al usuario antes de eliminar
    const ok = window.confirm("¿Estás seguro que deseas eliminar esta cita?");
    if (!ok) return;

    // Eliminación optimista: quitar de UI inmediatamente (comparando en string para evitar mismatch)
    const idStr = String(id);
    const prevList = appointments;
    setAppointments(prev => prev.filter(a => String(a._id || a.id || '') !== idStr));
    setConfirmationMessage("✅ Cita eliminada correctamente.");
    setTimeout(() => setConfirmationMessage(""), 3000);

    try {
      // Llamada al backend
      await deleteAppointmentService(id);
      // éxito -> ya está removida en UI
    } catch (error) {
      console.error("❌ Error al eliminar la cita (backend):", error);
      // revertir cambios o revalidar desde servidor
      await fetchAppointments();
      setConfirmationMessage("❌ No se pudo eliminar la cita.");
      setTimeout(() => setConfirmationMessage(""), 3000);
    }
  };

  // Formatear fecha estilo “Martes 14 de Octubre”
  const formatFechaLarga = (fechaStr) => {
    if (!fechaStr) return "—";
    const fecha = new Date(fechaStr);
    const opciones = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    const texto = fecha.toLocaleDateString("es-ES", opciones);
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  // Formatear hora “07:00 p. m.” — ahora con mensaje cuando es null/undefined
  const formatHora = (h) => {
    if (h === null || h === undefined) {
      return "Sin hora asignada";
    }

    let horaStr = String(h).trim();

    // Si es un número, convertirlo a string con minutos por defecto
    if (typeof h === 'number') {
      horaStr = `${Math.floor(h % 24)}:00`;
    }

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
      return fecha.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    const regexHHMM = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (regexHHMM.test(horaStr)) {
      const [hours, minutes] = horaStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
        return "Hora inválida";
      }

      const fecha = new Date();
      fecha.setHours(hours, minutes, 0, 0);
      return fecha.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    return "Formato inválido";
  };

  const filterAppointments = (appts) => {
    switch (filter) {
      case "today":
        return appts.filter((appt) => {
          const today = new Date();
          const apptDate = new Date(appt?.date);
          return (
            apptDate.getFullYear() === today.getFullYear() &&
            apptDate.getMonth() === today.getMonth() &&
            apptDate.getDate() === today.getDate()
          );
        });

      case "currentMonth":
        return appts.filter((appt) => {
          const today = new Date();
          const apptDate = new Date(appt?.date);
          return apptDate.getMonth() === today.getMonth() && apptDate.getFullYear() === today.getFullYear();
        });

      case "all":
      default:
        return appts;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        ⏳ Cargando citas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 font-semibold">
        {error}
      </div>
    );
  }

  // Aplicar filtro y luego ordenar por fecha
  const filteredAndSortedAppointments = filterAppointments(appointments)
    .sort((a, b) => new Date(a?.date || 0) - new Date(b?.date || 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f] px-6 py-12 text-white">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-center">
        Citas Agendadas
      </h1>

      {/* Filtro visible */}
      <div className="mb-8 flex justify-center">
        <div className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm border border-white/20">
          <label className="flex items-center gap-3 text-sm font-medium">
            <span>Mostrar:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white/20 text-black border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
              style={{ minWidth: "180px" }}
            >
              <option value="all">Todas las citas</option>
              <option value="today">Solo hoy</option>
              <option value="currentMonth">Mes actual</option>
            </select>
          </label>
        </div>
      </div>

      {/* Mostrar mensaje de confirmación de eliminación */}
      {confirmationMessage && (
        <div className="text-center text-green-400 font-semibold mb-6">
          {confirmationMessage}
        </div>
      )}

      {filteredAndSortedAppointments.length === 0 ? (
        <p className="text-center text-lg text-white/70">
          {filter === "today"
            ? "No hay citas programadas para hoy."
            : filter === "currentMonth"
            ? "No hay citas programadas este mes."
            : "No hay citas registradas."}
        </p>
      ) : (
        <div className="overflow-x-auto bg-white/10 rounded-2xl shadow-lg backdrop-blur-sm">
          <table className="w-full text-left text-sm text-white/90">
            <thead>
              <tr className="bg-white/20 text-white text-sm uppercase tracking-wider">
                <th className="px-6 py-3">📅 FECHA</th>
                <th className="px-6 py-3">⏰ HORA</th>
                <th className="px-6 py-3">👤 CLIENTE</th>
                <th className="px-6 py-3">📝 DESCRIPCIÓN</th>
                <th className="px-6 py-3 text-right">❌</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredAndSortedAppointments.map((appt) => {
                  const fecha = formatFechaLarga(appt?.date);
                  const hora = formatHora(appt?.hour);
                  const id = appt._id || appt.id;

                  return (
                    <motion.tr
                      key={id}
                      initial={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
                      className="border-b border-white/10 hover:bg-white/10 transition"
                    >
                      <td className="px-6 py-4 capitalize">{fecha}</td>
                      <td className="px-6 py-4">{hora}</td>
                      <td className="px-6 py-4">
                        {appt?.customerName || appt?.clientName || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {appt?.description?.trim() || "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(id)}
                          className="text-white text-xl hover:scale-125 transition-transform"
                          title="Eliminar cita"
                        >
                          ❌
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
