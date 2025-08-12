// src/views/AppointmentsList.jsx
import { useState, useEffect } from 'react';
import { getAllAppointmentsService } from '@services/appointmentsService';

export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAllAppointmentsService();
        setAppointments(data);
      } catch (err) {
        setError('No se pudieron cargar las citas.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f] px-6 py-12 text-white">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-10 text-center">
        📋 Citas Agendadas
      </h1>

      {appointments.length === 0 ? (
        <p className="text-center text-lg text-white/70">No hay citas registradas.</p>
      ) : (
        <div className="overflow-x-auto bg-white/10 rounded-2xl shadow-lg">
          <table className="w-full text-left text-sm text-white/90">
            <thead>
              <tr className="bg-white/20 text-white text-sm uppercase">
                <th className="px-6 py-3">📅 Fecha</th>
                <th className="px-6 py-3">⏰ Hora</th>
                <th className="px-6 py-3">👤 Cliente</th>
                <th className="px-6 py-3">📝 Descripción</th>
              </tr>
            </thead>
            <tbody>
              {[...appointments]
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((appt) => (
                  <tr key={appt.id} className="border-b border-white/10 hover:bg-white/10">
                    <td className="px-6 py-4">
                      {appt.date ? new Date(appt.date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">{appt.hour ?? '—'}</td>
                    <td className="px-6 py-4">{appt.customerName || '—'}</td>
                    <td className="px-6 py-4">{appt.description || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
