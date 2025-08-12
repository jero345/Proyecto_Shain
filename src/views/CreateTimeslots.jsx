import { useState } from "react";
import { createTimeslotsService } from "@services/timeslotsService"; // ya lo tienes

export const CreateTimeslots = () => {
  const [hour, setHour] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [created, setCreated] = useState(null); // para mostrar respuesta del backend
  const [fieldError, setFieldError] = useState("");

  const validateHour = (h) => {
    // HH:mm de 00:00 a 23:59
    const re = /^([01]?\d|2[0-3]):[0-5]\d$/;
    return re.test(h.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setFieldError("");
    setCreated(null);

    if (!validateHour(hour)) {
      setFieldError("La hora debe tener formato HH:mm (ej. 07:00, 7:30, 18:15).");
      return;
    }

    try {
      setLoading(true);
      const data = await createTimeslotsService({ hour: hour.trim() });
      setCreated(data?.data || null);
      setMsg("✅ Horario creado correctamente.");
      setHour("");
    } catch (err) {
      const m =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "❌ No se pudo crear el horario.";
      setMsg(m);
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Crear horarios</h1>
          <a
            href="/portal-admin"
            className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm"
          >
            ← Volver al panel
          </a>
        </div>

        {msg && (
          <div
            className={`mb-4 rounded px-3 py-2 text-sm ${
              msg.startsWith("✅")
                ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-200"
                : "bg-red-500/15 border border-red-500/40 text-red-200"
            }`}
          >
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-4 rounded-lg">
          <div>
            <label className="block text-sm mb-1">Hora (HH:mm)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="7:00 / 07:00 / 18:30"
              value={hour}
              onChange={(e) => {
                setHour(e.target.value);
                setFieldError("");
              }}
              className={`${inputBase} ${fieldError ? "ring-2 ring-red-500 focus:ring-red-500" : ""}`}
              aria-invalid={!!fieldError}
            />
            {fieldError && <p className="text-red-300 text-xs mt-1">{fieldError}</p>}
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            {["7:00", "7:30", "8:00", "8:30", "9:00", "10:00"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setHour(preset)}
                className="px-2 py-2 rounded-md bg-gray-700 hover:bg-gray-600"
              >
                {preset}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 font-semibold disabled:opacity-60"
          >
            {loading ? "Creando..." : "Crear horario"}
          </button>
        </form>

        {created && (
          <div className="mt-6 bg-gray-800 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Horario creado</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-200">
              <p><span className="text-gray-400">ID:</span> {created.id}</p>
              <p><span className="text-gray-400">Hora:</span> {created.hour}</p>
              <p><span className="text-gray-400">Activo:</span> {String(created.isActive)}</p>
              <p><span className="text-gray-400">Creado:</span> {new Date(created.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
