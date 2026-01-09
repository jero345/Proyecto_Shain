import { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import { Calendar as CalendarIcon, Clock, User, FileText, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getAvailableTimeslots, bookAppointmentService } from '@services/appointmentsService';

// Límite de caracteres para descripción
const DESCRIPTION_MAX_LENGTH = 1000;

export const BookAppointment = () => {
  const [date, setDate] = useState(new Date());
  const [selectedTimeId, setSelectedTimeId] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [expandedHour, setExpandedHour] = useState(null);

  const formatDateToYYYYMMDD = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTo12h = (time) => {
    if (!time) return '';
    
    // Si ya tiene AM/PM, devolverlo tal cual
    if (time.toUpperCase().includes('AM') || time.toUpperCase().includes('PM')) {
      return time;
    }
    
    const parts = time.split(':');
    if (parts.length < 2) return time;
    
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    
    if (isNaN(h) || isNaN(m)) return time;
    
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  };

  const getBaseHour = (slot) => {
    const time = slot.label || slot.hour || '';
    const parts = time.split(':');
    if (parts.length < 2) return time;
    return parts[0];
  };

  const isFullHour = (slot) => {
    const time = slot.label || slot.hour || '';
    const parts = time.split(':');
    if (parts.length < 2) return true;
    const minutes = parseInt(parts[1], 10);
    return minutes === 0;
  };

  const groupedTimes = availableTimes.reduce((acc, slot) => {
    const baseHour = getBaseHour(slot);
    
    if (!acc[baseHour]) {
      acc[baseHour] = {
        main: null,
        half: null
      };
    }
    
    if (isFullHour(slot)) {
      acc[baseHour].main = slot;
    } else {
      acc[baseHour].half = slot;
    }
    
    return acc;
  }, {});

  const sortedHours = Object.keys(groupedTimes).sort((a, b) => parseInt(a) - parseInt(b));

  // Función para cargar horarios
  const fetchTimes = useCallback(async (selectedDate) => {
    try {
      setLoadingTimes(true);
      setSelectedTimeId(''); // Limpiar selección al cambiar fecha
      setExpandedHour(null);
      
      const formattedDate = formatDateToYYYYMMDD(selectedDate);
      
      console.log('🔄 Cargando horarios para fecha:', formattedDate);
      
      const slots = await getAvailableTimeslots(formattedDate);
      
      console.log('📦 Slots recibidos del servicio:', slots);
      
      // Los slots ya vienen normalizados del servicio
      setAvailableTimes(slots);
      
    } catch (error) {
      console.error('❌ Error al cargar horarios:', error);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  }, []);

  // Cargar horarios cuando cambia la fecha
  useEffect(() => {
    fetchTimes(date);
  }, [date, fetchTimes]);

  const handleDateChange = (newDate) => {
    console.log('📅 Fecha cambiada a:', newDate);
    setDate(newDate);
  };

  const handleSelectTime = (slot) => {
    if (!slot.available) return;
    setSelectedTimeId(slot._id);
  };

  const toggleExpand = (hour) => {
    setExpandedHour(expandedHour === hour ? null : hour);
  };

  // Handler para descripción con límite
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= DESCRIPTION_MAX_LENGTH) {
      setDescription(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTimeId) {
      alert('⚠️ Selecciona un horario.');
      return;
    }

    // Validar límite de caracteres
    if (description.length > DESCRIPTION_MAX_LENGTH) {
      alert(`⚠️ La descripción no puede superar los ${DESCRIPTION_MAX_LENGTH.toLocaleString()} caracteres.`);
      return;
    }

    const selectedSlot = availableTimes.find(s => s._id === selectedTimeId);
    if (selectedSlot && !selectedSlot.available) {
      alert('⚠️ Este horario ya fue reservado. Por favor selecciona otro.');
      setSelectedTimeId('');
      return;
    }

    const formattedDate = formatDateToYYYYMMDD(date);

    const newAppointment = {
      date: formattedDate,
      timeSlot: selectedTimeId,
      customerName: clientName.trim() || 'Sin nombre',
      description: description.trim() || 'Sin descripción',
    };

    try {
      setLoading(true);
      await bookAppointmentService(newAppointment);
      
      // Actualizar estado local inmediatamente
      setAvailableTimes(prevTimes => 
        prevTimes.map(slot => 
          slot._id === selectedTimeId 
            ? { ...slot, available: false } 
            : slot
        )
      );
      
      alert('✅ Cita reservada correctamente');
      setClientName('');
      setDescription('');
      setSelectedTimeId('');
    } catch (err) {
      console.error('❌ Error al registrar cita:', err);
      
      const errorMsg = err.message || '';
      if (errorMsg.toLowerCase().includes('reservad') || 
          errorMsg.toLowerCase().includes('ocupad') ||
          errorMsg.toLowerCase().includes('no disponible')) {
        setAvailableTimes(prevTimes => 
          prevTimes.map(slot => 
            slot._id === selectedTimeId 
              ? { ...slot, available: false } 
              : slot
          )
        );
        setSelectedTimeId('');
        alert('⚠️ Este horario ya fue reservado por otra persona. Por favor selecciona otro.');
      } else {
        alert(err.message || 'Error al registrar la cita. Intenta más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const availableCount = availableTimes.filter(s => s.available).length;
  const reservedCount = availableTimes.filter(s => !s.available).length;

  // Calcular caracteres restantes y porcentaje
  const descriptionLength = description.length;
  const descriptionPercentage = (descriptionLength / DESCRIPTION_MAX_LENGTH) * 100;
  const isNearLimit = descriptionPercentage >= 80;
  const isAtLimit = descriptionLength >= DESCRIPTION_MAX_LENGTH;

  const TimeSlotButton = ({ slot, isSubSlot = false }) => {
    if (!slot) return null;
    
    const isSelected = selectedTimeId === slot._id;
    const isReserved = !slot.available;
    
    return (
      <button
        type="button"
        onClick={() => handleSelectTime(slot)}
        disabled={isReserved}
        className={`relative rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm transition-all duration-200 w-full
          ${isReserved
            ? 'bg-red-950/50 text-red-300/60 cursor-not-allowed border-2 border-red-500/40 opacity-70'
            : isSelected
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105 border-2 border-purple-400'
            : isSubSlot
            ? 'bg-white/10 hover:bg-white/15 text-white/80 border border-white/20 hover:border-purple-500/50'
            : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 hover:border-purple-500/50 hover:scale-[1.02]'
          }`}
      >
        <span className={isReserved ? 'line-through' : ''}>
          {formatTo12h(slot.label || slot.hour)}
        </span>
        {isReserved && (
          <span className="flex items-center justify-center gap-1 text-[10px] text-red-400 mt-1">
            <XCircle className="w-3 h-3" />
            Reservado
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#0f172a] px-3 sm:px-4 py-6 sm:py-12 text-white">
      <div className="max-w-7xl mx-auto mb-8 sm:mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 sm:w-1.5 h-10 sm:h-12 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          <h1 className="text-2xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Agenda 
          </h1>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 sm:gap-8">
        <div className="w-full lg:w-1/2 space-y-4 sm:space-y-6">
          {/* Calendario */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg sm:text-xl font-bold">Selecciona una Fecha</h2>
            </div>
            <style>{`
              .react-calendar {
                border: none !important;
                font-family: inherit !important;
                width: 100% !important;
                background: transparent !important;
              }
              .react-calendar__navigation {
                display: flex !important;
                margin-bottom: 0.75rem !important;
                gap: 0.5rem !important;
              }
              .react-calendar__navigation button {
                background: rgba(139, 92, 246, 0.2) !important;
                border: 1px solid rgba(139, 92, 246, 0.3) !important;
                border-radius: 0.75rem !important;
                color: white !important;
                font-weight: 600 !important;
                padding: 0.5rem 0.75rem !important;
                transition: all 0.2s !important;
                min-width: auto !important;
                font-size: 0.875rem !important;
              }
              .react-calendar__navigation button:hover:not(:disabled) {
                background: rgba(139, 92, 246, 0.4) !important;
                border-color: rgba(139, 92, 246, 0.5) !important;
                transform: scale(1.05) !important;
              }
              .react-calendar__navigation button:disabled {
                opacity: 0.3 !important;
                cursor: not-allowed !important;
              }
              .react-calendar__navigation__label {
                flex-grow: 1 !important;
                font-size: 0.9375rem !important;
                background: rgba(139, 92, 246, 0.3) !important;
                border-color: rgba(139, 92, 246, 0.4) !important;
              }
              .react-calendar__navigation__arrow {
                font-size: 1rem !important;
                width: 2.5rem !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
              }
              .react-calendar__month-view__weekdays {
                text-transform: uppercase !important;
                font-size: 0.6875rem !important;
                font-weight: 600 !important;
                color: rgba(255, 255, 255, 0.6) !important;
                margin-bottom: 0.5rem !important;
              }
              .react-calendar__month-view__weekdays__weekday {
                padding: 0.5rem 0 !important;
                text-align: center !important;
              }
              .react-calendar__month-view__weekdays__weekday abbr {
                text-decoration: none !important;
              }
              .react-calendar__month-view__days {
                display: grid !important;
                grid-template-columns: repeat(7, 1fr) !important;
                gap: 0.375rem !important;
              }
              .react-calendar__tile {
                padding: 0.75rem !important;
                font-size: 0.875rem !important;
                aspect-ratio: 1 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                max-width: 100% !important;
                background: transparent !important;
                color: rgba(255, 255, 255, 0.8) !important;
              }
              .react-calendar__month-view__days__day--neighboringMonth {
                opacity: 0.3 !important;
              }
              .react-calendar__tile:hover {
                background: rgba(255, 255, 255, 0.1) !important;
                border-radius: 0.75rem !important;
              }
              .react-calendar__tile--active {
                background: linear-gradient(to bottom right, #9333ea, #db2777) !important;
                border-radius: 0.75rem !important;
                color: white !important;
                font-weight: bold !important;
              }
              .react-calendar__tile--now {
                background: rgba(139, 92, 246, 0.3) !important;
                border-radius: 0.75rem !important;
              }
            `}</style>
            <Calendar
              onChange={handleDateChange}
              value={date}
              className="!bg-transparent text-white w-full"
              next2Label={null}
              prev2Label={null}
            />
          </div>

          {/* Horarios Agrupados */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg sm:text-xl font-bold">Horarios Disponibles</h2>
              </div>
              {!loadingTimes && availableTimes.length > 0 && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    {availableCount} libre{availableCount !== 1 ? 's' : ''}
                  </span>
                  {reservedCount > 0 && (
                    <span className="flex items-center gap-1 text-red-400">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      {reservedCount} reservado{reservedCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {loadingTimes ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-white/60 text-sm">Cargando horarios...</p>
              </div>
            ) : availableTimes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60 text-sm">No hay horarios configurados para esta fecha</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sortedHours.map((hour) => {
                  const group = groupedTimes[hour];
                  const hasHalf = group.half !== null;
                  const isExpanded = expandedHour === hour;
                  const mainSlot = group.main;
                  const halfSlot = group.half;
                  
                  if (!mainSlot && halfSlot) {
                    return (
                      <div key={hour} className="space-y-2">
                        <TimeSlotButton slot={halfSlot} />
                      </div>
                    );
                  }
                  
                  if (mainSlot && !halfSlot) {
                    return (
                      <div key={hour} className="space-y-2">
                        <TimeSlotButton slot={mainSlot} />
                      </div>
                    );
                  }
                  
                  return (
                    <div key={hour} className="space-y-2">
                      <div className="relative">
                        <TimeSlotButton slot={mainSlot} />
                        {hasHalf && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(hour);
                            }}
                            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-6 rounded-full 
                              flex items-center justify-center transition-all duration-200 z-10
                              ${isExpanded 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-slate-700 text-white/70 hover:bg-purple-600 hover:text-white'
                              }
                              border-2 border-slate-900`}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      {hasHalf && isExpanded && (
                        <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                          <div className="pl-2 border-l-2 border-purple-500/50">
                            <TimeSlotButton slot={halfSlot} isSubSlot />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {!loadingTimes && availableTimes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
              </div>
            )}
          </div>
        </div>

        {/* Formulario */}
        <div className="w-full lg:w-1/2">
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-6 sm:mb-8">
              <FileText className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg sm:text-xl font-bold">Información de la Cita</h2>
            </div>

            {selectedTimeId && (
              <div className="mb-6 p-4 rounded-xl bg-purple-600/20 border border-purple-500/30">
                <p className="text-sm text-white/70">Horario seleccionado:</p>
                <p className="text-lg font-bold text-purple-300">
                  {formatTo12h(availableTimes.find(s => s._id === selectedTimeId)?.label || 
                              availableTimes.find(s => s._id === selectedTimeId)?.hour)}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm text-white/90 mb-2">
                  <User className="w-4 h-4 text-purple-400" />
                  Nombre
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder=""
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>

              {/* Descripción con contador */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm text-white/90">
                    <FileText className="w-4 h-4 text-purple-400" />
                    Descripción
                  </label>
                  <span className={`text-xs font-medium transition-colors ${
                    isAtLimit 
                      ? 'text-red-400' 
                      : isNearLimit 
                        ? 'text-yellow-400' 
                        : 'text-white/50'
                  }`}>
                    {descriptionLength.toLocaleString()}/{DESCRIPTION_MAX_LENGTH.toLocaleString()}
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  rows={4}
                  placeholder=""
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder:text-white/40 focus:outline-none focus:ring-2 transition-all resize-none ${
                    isAtLimit
                      ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                      : 'border-white/10 focus:ring-purple-500/50 focus:border-purple-500/50'
                  }`}
                ></textarea>
                {/* Mensaje cuando se alcanza el límite */}
                {isAtLimit && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <span>⚠️</span>
                    Has alcanzado el límite de {DESCRIPTION_MAX_LENGTH.toLocaleString()} caracteres
                  </p>
                )}
                {/* Barra de progreso visual */}
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      isAtLimit 
                        ? 'bg-red-500' 
                        : isNearLimit 
                          ? 'bg-yellow-500' 
                          : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(descriptionPercentage, 100)}%` }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedTimeId}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-white font-bold w-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Confirmando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>CONFIRMAR CITA</span>
                  </>
                )}
              </button>

              {!selectedTimeId && (
                <p className="text-center text-xs text-white/50">
                  Selecciona un horario disponible para continuar
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;