// src/views/AppointmentsList.jsx
import { useState, useEffect } from "react";
import { getAllAppointmentsService } from "@services/appointmentsService";

export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAllAppointmentsService();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("No se pudieron cargar las citas.");
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
        <p className="text-center text-lg text-white/70">
          No hay citas registradas.
        </p>
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
                .sort((a, b) => new Date(a?.date || 0) - new Date(b?.date || 0))
                .map((appt) => {
                  const hasDate = !!appt?.date;
                  const d = hasDate ? new Date(appt.date) : null;

                  // Si viene "hour" úsala; si no, formatea la hora del campo date si trae hora.
                  const horaStr =
                    (appt?.hour ?? "")
                      .toString()
                      .trim() ||
                    (hasDate
                      ? d.toLocaleTimeString("es-CO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—");

                  const fechaStr = hasDate
                    ? d.toLocaleDateString("es-CO")
                    : "—";

                  return (
                    <tr
                      key={appt.id || appt._id}
                      className="border-b border-white/10 hover:bg-white/10"
                    >
                      <td className="px-6 py-4">{fechaStr}</td>
                      <td className="px-6 py-4">{horaStr}</td>
                      <td className="px-6 py-4">
                        {appt?.customerName || appt?.clientName || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {appt?.description?.trim() || "—"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
