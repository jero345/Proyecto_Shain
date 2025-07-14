import { useState } from 'react';
import Calendar from 'react-calendar';

export const BookAppointment = () => {
  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');

  const timeslots = [
    '08:30 - 09:30 AM',
    '09:30 - 10:30 AM',
    '10:30 - 11:30 AM',
    '11:30 - 12:30 PM',
    '12:30 - 01:30 PM',
    '01:00 - 05:00 PM',
    '05:00 - 06:00 PM',
    '06:00 - 07:00 PM',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName || !description || !selectedTime) {
      alert('Completa todos los campos y selecciona un horario.');
      return;
    }
    console.log({
      date,
      selectedTime,
      clientName,
      description,
    });
    alert('✅ Cita reservada correctamente');
    setClientName('');
    setDescription('');
    setSelectedTime('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f] px-4 py-12">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-10">

        {/* 📅 Calendario + horarios */}
        <div className="w-full lg:w-1/2 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white">
            Agendar Cita
          </h1>

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
            {timeslots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`rounded-md px-4 py-2 font-semibold text-xs transition ${
                  selectedTime === time
                    ? 'bg-black/60 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white/80'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* 📝 Formulario */}
        <div className="w-full lg:w-1/2">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Fecha seleccionada */}
            <div>
              <label className="block text-sm mb-1 text-white">Fecha seleccionada</label>
              <input
                type="text"
                value={date.toLocaleDateString()}
                readOnly
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50"
              />
            </div>

            {/* Hora seleccionada */}
            <div>
              <label className="block text-sm mb-1 text-white">Hora seleccionada</label>
              <input
                type="text"
                value={selectedTime}
                readOnly
                placeholder="Selecciona un horario"
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-white">Nombre del Cliente</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#a32063]"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-white">Descripción / Tipo de corte</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Corte degradado, barba..."
                rows={4}
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#a32063]"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-[#a32063] to-[#4b1d69] hover:opacity-90 px-6 py-3 rounded-full text-white font-semibold transition w-full"
            >
              CONFIRMAR CITA
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
