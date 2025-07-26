import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { getAvailableTimeslots, bookAppointmentService } from '@services/appointmentsService';

export const BookAppointment = () => {
  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  const allTimeslots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00', 
    '05:00', 
    '06:00',
    '07:00',  
    '08:00',
  ];

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const formattedDate = date.toISOString().split('T')[0];
        const available = await getAvailableTimeslots(formattedDate);
        setAvailableTimes(available);
      } catch (error) {
        console.error('❌ Error al cargar horarios disponibles:', error);
        setAvailableTimes([]);
      }
    };

    fetchTimes();
  }, [date]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientName || !description || !selectedTime) {
      alert('⚠️ Completa todos los campos y selecciona un horario.');
      return;
    }

    if (!availableTimes.includes(selectedTime)) {
      alert('⚠️ El horario seleccionado ya no está disponible.');
      return;
    }

    const newAppointment = {
      date: date.toISOString(),
      time: selectedTime,
      name: clientName,
      description,
    };

    try {
      const saved = await bookAppointmentService(newAppointment);

      setAppointments([
        ...appointments,
        {
          ...saved,
          date: new Date(saved.date).toDateString(),
        },
      ]);

      alert('✅ Cita reservada correctamente');
      setClientName('');
      setDescription('');
      setSelectedTime('');
    } catch (err) {
      console.error('❌ Error al registrar cita:', err);
      alert('Error al registrar la cita. Intenta más tarde.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f] px-4 py-12 text-white">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-10 mb-10">
        <div className="w-full lg:w-1/2 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Agendar Cita</h1>

          <div className="bg-white/10 rounded-xl p-4 mb-6 flex justify-center shadow-md">
            <Calendar
              onChange={setDate}
              value={date}
              className="!bg-transparent text-white [&_.react-calendar__tile]:text-sm"
              next2Label={null}
              prev2Label={null}
              tileClassName={({ date: day, view }) =>
                view === 'month' && day.toDateString() === new Date(date).toDateString()
                  ? 'bg-[#1f1f3c] text-white rounded-full font-bold'
                  : 'rounded-full text-white/80 hover:bg-white/20 transition'
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {allTimeslots.map((time) => {
              const isDisabled = !availableTimes.includes(time);
              return (
                <button
                  key={time}
                  onClick={() => !isDisabled && setSelectedTime(time)}
                  disabled={isDisabled}
                  className={`rounded-md px-4 py-2 font-semibold text-xs transition
                    ${isDisabled
                      ? 'bg-white/5 text-white/40 cursor-not-allowed'
                      : selectedTime === time
                      ? 'bg-black/60 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                    }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* 📝 Formulario */}
        <div className="w-full lg:w-1/2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Fecha seleccionada</label>
              <input
                type="text"
                value={date.toLocaleDateString()}
                readOnly
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Hora seleccionada</label>
              <input
                type="text"
                value={selectedTime}
                readOnly
                placeholder="Selecciona un horario"
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Nombre del Cliente</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Descripción / Tipo de corte</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Corte degradado, barba..."
                rows={4}
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-[#a32063] to-[#4b1d69] hover:opacity-90 px-6 py-3 rounded-full text-white font-semibold w-full"
            >
              CONFIRMAR CITA
            </button>
          </form>
        </div>
      </div>

      {appointments.length > 0 && (
        <div className="w-full max-w-4xl bg-white/10 p-6 rounded-lg mt-6 shadow">
          <h2 className="text-lg font-semibold mb-4 text-white">📋 Citas Registradas</h2>
          <ul className="space-y-3 text-sm">
            {appointments.map((appt, index) => (
              <li key={index} className="bg-white/5 p-4 rounded-md text-white/90">
                <p><strong>📅 Fecha:</strong> {appt.date}</p>
                <p><strong>⏰ Hora:</strong> {appt.time}</p>
                <p><strong>👤 Cliente:</strong> {appt.name}</p>
                <p><strong>📝 Descripción:</strong> {appt.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
