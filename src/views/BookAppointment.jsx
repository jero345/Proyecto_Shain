import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { getAvailableTimeslots, bookAppointmentService } from '@services/appointmentsService';

export const BookAppointment = () => {
  const [date, setDate] = useState(new Date());
  const [selectedTimeId, setSelectedTimeId] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  // Función para formatear fecha sin desfase de zona horaria
  const formatDateToYYYYMMDD = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const formattedDate = formatDateToYYYYMMDD(date);
        console.log('📅 Fecha seleccionada para consultar horarios:', formattedDate);
        const available = await getAvailableTimeslots(formattedDate);
        setAvailableTimes(available);
        setSelectedTimeId('');
      } catch {
        setAvailableTimes([]);
      }
    };
    fetchTimes();
  }, [date]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientName.trim() || !description.trim() || !selectedTimeId) {
      alert('⚠️ Completa todos los campos y selecciona un horario.');
      return;
    }

    const formattedDate = formatDateToYYYYMMDD(date);

    const newAppointment = {
      date: formattedDate,
      timeSlot: selectedTimeId,
      customerName: clientName,
      description,
    };

    console.log("🚀 Enviando cita:", newAppointment);
    console.log("📅 Fecha que se enviará:", formattedDate);

    try {
      const saved = await bookAppointmentService(newAppointment);
      setAppointments([...appointments, { ...saved, date: saved.date }]);
      alert('✅ Cita reservada correctamente');
      setClientName('');
      setDescription('');
      setSelectedTimeId('');
    } catch (err) {
      console.error('❌ Error al registrar cita:', err);
      alert(err.message || 'Error al registrar la cita. Intenta más tarde.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f] px-4 py-12 text-white">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-10 text-center">Agenda</h1>
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-12">
        {/* 📌 Calendario + Horarios */}
        <div className="w-full lg:w-1/2 bg-white/10 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-center">Selecciona Fecha y Hora</h2>
          <Calendar
            onChange={setDate}
            value={date}
            className="!bg-transparent text-white [&_.react-calendar__tile]:text-sm mb-8"
            next2Label={null}
            prev2Label={null}
            tileClassName={({ date: day, view }) =>
              view === 'month' && day.toDateString() === date.toDateString()
                ? 'bg-[#1f1f3c] text-white rounded-full font-bold'
                : 'rounded-full text-white/80 hover:bg-white/20 transition'
            }
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {availableTimes.map((slot) => {
              const isSelected = selectedTimeId === slot._id;
              return (
                <button
                  key={slot._id}
                  onClick={() => slot.available && setSelectedTimeId(slot._id)}
                  disabled={!slot.available}
                  className={`rounded-md px-4 py-2 font-semibold text-sm transition
                    ${!slot.available
                      ? 'bg-gray-600/40 text-white/40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-gradient-to-r from-[#a32063] to-[#4b1d69] text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                    }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 📌 Formulario */}
        <div className="w-full lg:w-1/2 bg-white/10 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-center">Completa tu Información</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-1">📅 Fecha</label>
              <input
                type="text"
                value={date.toLocaleDateString('es-CO', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                readOnly
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">⏰ Hora</label>
              <input
                type="text"
                value={availableTimes.find((t) => t._id === selectedTimeId)?.label || 'Selecciona un horario'}
                readOnly
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">👤 Nombre</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">📝 Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe el servicio o motivo de la cita"
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder:text-white/50"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-[#a32063] to-[#4b1d69] hover:opacity-90 px-6 py-3 rounded-full text-white font-bold w-full transition"
            >
              CONFIRMAR CITA
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};