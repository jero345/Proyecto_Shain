import { useState, useEffect } from "react";
import { getAppointmentsWithFilterService, deleteAppointmentService } from "@services/appointmentsService";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, FileText, CheckCircle, Filter, ChevronDown, ChevronUp, X } from "lucide-react";

export const AppointmentsList = () => {
  // ============================================
  // ESTADO
  // ============================================
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("today"); // Cambiado a "today" por defecto
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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

  // Toggle para expandir/colapsar descripción
  const toggleDescription = (id) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openModal = (appt) => {
    setSelectedAppointment(appt);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  // ============================================
  // FUNCIONES DE FORMATO
  // ============================================
  const formatFechaLarga = (fechaStr) => {
    if (!fechaStr) return "—";
    
    try {
      const [year, month, day] = fechaStr.split('-').map(Number);
      const fecha = new Date(year, month - 1, day);
      
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
    if (h === null || h === undefined || h === '') {
      return "Sin hora asignada";
    }

    let horaStr = String(h).trim();

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

    return horaStr;
  };

  // ============================================
  // FUNCIONES DE FILTRADO
  // ============================================
  const filterAppointments = (appts) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    switch (filter) {
      case "today":
        return appts.filter((appt) => appt?.date === todayStr);

      case "currentMonth":
        return appts.filter((appt) => {
          const apptDate = appt?.date;
          if (!apptDate) return false;
          
          const [year, month] = apptDate.split('-').map(Number);
          return year === today.getFullYear() && month === (today.getMonth() + 1);
        });

      case "all":
      default:
        return appts;
    }
  };

  const filteredAndSortedAppointments = filterAppointments(appointments)
    .sort((a, b) => {
      const dateA = a?.date || '';
      const dateB = b?.date || '';
      
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      
      const hourA = a?.hour || '';
      const hourB = b?.hour || '';
      return hourA.localeCompare(hourB);
    });

  // ============================================
  // ESTADOS DE CARGA Y ERROR
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Cargando Citas
          </h2>
          <p className="text-white/60 text-sm">Obteniendo tus citas agendadas...</p>
          
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-red-400 text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={fetchAppointments}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2.5 rounded-xl transition-all text-white font-semibold shadow-lg hover:scale-105 text-sm"
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#0f172a] px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header y Filtro en la misma fila */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 sm:h-10 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Citas Agendadas
            </h1>
          </div>

          {/* Filtro compacto */}
          <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10">
            <Filter className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer pr-2"
            >
              <option value="today" className="bg-[#1e293b]">Hoy</option>
              <option value="all" className="bg-[#1e293b]">Todas</option>
              <option value="currentMonth" className="bg-[#1e293b]">Este mes</option>
            </select>
          </div>
        </div>

        {/* Mensaje de confirmación */}
        <AnimatePresence>
          {confirmationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <div className={`inline-block px-4 py-2 rounded-xl font-semibold text-sm shadow-lg ${
                confirmationMessage.includes('❌') 
                  ? 'bg-red-500/20 text-red-300 border border-red-400/30' 
                  : 'bg-green-500/20 text-green-300 border border-green-400/30'
              }`}>
                {confirmationMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de citas */}
        {filteredAndSortedAppointments.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-block bg-slate-800/60 backdrop-blur-sm rounded-2xl px-8 py-10 border border-white/10">
              <div className="text-4xl mb-4 opacity-30"></div>
              <p className="text-lg sm:text-xl text-white font-semibold mb-1">
                {filter === "today"
                  ? "No hay citas para hoy"
                  : filter === "currentMonth"
                  ? "No hay citas este mes"
                  : "No hay citas registradas"}
              </p>
              <p className="text-white/50 text-xs sm:text-sm">Las citas aparecerán aquí cuando se agenden</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredAndSortedAppointments.map((appt) => {
                const fecha = formatFechaLarga(appt?.date);
                const hora = formatHora(appt?.hour);
                const id = appt._id || appt.id;
                const description = appt?.description?.trim() || "Sin descripción";
                const isExpanded = expandedDescriptions[id];
                const isLongDescription = description.length > 30;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.95,
                      x: -50,
                      transition: { duration: 0.3 } 
                    }}
                    layout
                    className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-lg border border-white/10 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Información de la cita */}
                      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* Fecha */}
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs text-white/50">Fecha</p>
                            <p className="text-xs sm:text-sm font-semibold text-white truncate">{fecha}</p>
                          </div>
                        </div>

                        {/* Hora */}
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-pink-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs text-white/50">Hora</p>
                            <p className="text-xs sm:text-sm font-semibold text-white">{hora}</p>
                          </div>
                        </div>

                        {/* Cliente */}
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs text-white/50">Cliente</p>
                            <p className="text-xs sm:text-sm font-semibold text-white truncate">{appt?.customerName || "—"}</p>
                          </div>
                        </div>

                        {/* Descripción - Expandible */}
                        <div className="flex items-start gap-2 col-span-2 lg:col-span-1">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs text-white/50">Descripción</p>
                            
                            {/* Contenedor de descripción */}
                            <div 
                              onClick={() => isLongDescription && toggleDescription(id)}
                              className={`${isLongDescription ? 'cursor-pointer' : ''}`}
                            >
                              <motion.div
                                initial={false}
                                animate={{ height: 'auto' }}
                                className="overflow-hidden"
                              >
                                <p className={`text-xs sm:text-sm text-white/80 ${
                                  !isExpanded && isLongDescription ? 'line-clamp-1' : ''
                                }`}>
                                  {description}
                                </p>
                              </motion.div>
                              
                              {/* Indicador de expandir */}
                              {isLongDescription && (
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDescription(id);
                                  }}
                                  className="flex items-center gap-1 mt-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-3 h-3" />
                                      <span>Ver menos</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3 h-3" />
                                      <span>Ver más</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botón de completar */}
                      <div className="flex justify-end lg:justify-center lg:pt-1">
                        <button
                          onClick={() => openModal(appt)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all hover:scale-105 shadow-md text-sm mr-2"
                          title="Ver detalles"
                        >
                          <FileText className="w-4 h-4 text-white" />
                          <span className="text-white font-semibold text-xs sm:text-sm">Ver</span>
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all hover:scale-105 shadow-md text-sm"
                          title="Completar cita"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                          <span className="text-white font-semibold text-xs sm:text-sm">Finalizar</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      <AnimatePresence>
        {selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">Detalles de la Cita</h3>
                <button
                  onClick={closeModal}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Fecha */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Fecha</p>
                    <p className="text-sm font-semibold text-white">
                      {formatFechaLarga(selectedAppointment.date)}
                    </p>
                    <p className="text-xs text-white/60">{selectedAppointment.date}</p>
                  </div>
                </div>

                {/* Hora */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Hora</p>
                    <p className="text-sm font-semibold text-white">
                      {formatHora(selectedAppointment.hour)}
                    </p>
                  </div>
                </div>

                {/* Cliente */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Cliente</p>
                    <p className="text-sm font-semibold text-white">
                      {selectedAppointment.customerName || "—"}
                    </p>
                  </div>
                </div>

                {/* Descripción */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Descripción</p>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {selectedAppointment.description || "Sin descripción"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedAppointment._id || selectedAppointment.id);
                    closeModal();
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-4 py-2 rounded-lg text-white font-semibold transition-all"
                >
                  Finalizar Cita
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentsList;