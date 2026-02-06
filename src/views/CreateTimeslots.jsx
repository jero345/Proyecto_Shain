import { useState, useEffect } from "react";
import {
  createTimeslotsService,
  getTimeslotsService,
  updateTimeslotsService,
  deleteTimeslotsService,
} from "@services/timeslotsService";

export const CreateTimeslots = () => {
  const [hour, setHour] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [msg, setMsg] = useState("");
  const [timeslots, setTimeslots] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editHour, setEditHour] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchTimeslots();
  }, []);

  const fetchTimeslots = async () => {
    try {
      setLoadingList(true);
      setMsg("");
      
      const data = await getTimeslotsService();

      // El servicio ya normaliza la respuesta, pero por si acaso
      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (data?.data && Array.isArray(data.data)) {
        list = data.data;
      } else if (data?.timeslots && Array.isArray(data.timeslots)) {
        list = data.timeslots;
      } else {
        list = [];
      }

      setTimeslots(list);
      
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Error desconocido";
      setMsg(`❌ Error al cargar horarios: ${errorMsg}`);
      setTimeslots([]);
    } finally {
      setLoadingList(false);
    }
  };

  const parseHour = (input) => {
    const trimmed = input.trim().toUpperCase();
    
    // Formato 24h: 08:00, 14:30
    const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      const h = parseInt(match24[1], 10);
      const m = parseInt(match24[2], 10);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
      }
    }
    
    // Formato 12h: 8:00 AM, 2:30 PM
    const match12 = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
    if (match12) {
      let h = parseInt(match12[1], 10);
      const m = parseInt(match12[2] || "0", 10);
      const period = match12[3];
      
      if (h >= 1 && h <= 12 && m >= 0 && m <= 59) {
        if (period === "AM" && h === 12) h = 0;
        else if (period === "PM" && h !== 12) h += 12;
        
        return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
      }
    }
    
    return null;
  };

  const formatTo12h = (hour24) => {
    if (!hour24) return "";
    const parts = hour24.split(":");
    if (parts.length < 2) return hour24;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return hour24;
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return h12 + ":" + String(m).padStart(2, "0") + " " + period;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const parsedHour = parseHour(hour);
    
    if (!parsedHour) {
      setMsg("❌ Formato inválido. Usa: 8:00 AM, 2:30 PM, 08:00, 14:30");
      return;
    }

    try {
      setLoading(true);
      await createTimeslotsService({ hour: parsedHour });
      
      setMsg("✅ Horario creado correctamente.");
      setHour("");
      await fetchTimeslots();
    } catch (err) {
      const m = err?.response?.data?.message || err?.response?.data?.error || "No se pudo crear el horario.";
      setMsg(`❌ ${m}`);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (slot) => {
    setEditingId(slot.id || slot._id);
    setEditHour(slot.hour || slot.label || "");
    setMsg("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditHour("");
  };

  const saveEdit = async (id) => {
    const parsedHour = parseHour(editHour);
    
    if (!parsedHour) {
      setMsg("❌ Formato inválido. Usa: 8:00 AM, 2:30 PM, 08:00, 14:30");
      return;
    }

    try {
      setEditLoading(true);
      await updateTimeslotsService(id, { hour: parsedHour });
      setMsg("✅ Horario actualizado.");
      setEditingId(null);
      setEditHour("");
      await fetchTimeslots();
    } catch (err) {
      const m = err?.response?.data?.message || err?.response?.data?.error || "No se pudo actualizar el horario.";
      setMsg(`❌ ${m}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este horario?")) return;

    try {
      await deleteTimeslotsService(id);
      setMsg("✅ Horario eliminado.");
      await fetchTimeslots();
    } catch (err) {
      const m = err?.response?.data?.message || err?.response?.data?.error || "No se pudo eliminar el horario.";
      setMsg(`❌ ${m}`);
    }
  };

  const toggleActive = async (slot) => {
    const id = slot.id || slot._id;
    try {
      await updateTimeslotsService(id, { isActive: !slot.isActive });
      await fetchTimeslots();
    } catch (err) {
      setMsg("❌ No se pudo cambiar el estado.");
    }
  };

  // Obtener la hora del slot (puede venir como hour o label)
  const getSlotHour = (slot) => {
    return slot.hour || slot.label || slot.time || "";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestión de Horarios</h1>
          <a href="/portal-admin" className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm">
            ← Volver al panel
          </a>
        </div>

        {msg && (
          <div className={`mb-4 rounded px-3 py-2 text-sm ${msg.startsWith("✅") ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-200" : "bg-red-500/15 border border-red-500/40 text-red-200"}`}>
            {msg}
          </div>
        )}

        {/* Formulario crear */}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="font-semibold mb-3">Crear nuevo horario</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Ej: 8:00 AM, 2:30 PM, 14:30"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-gray-400 text-xs mt-1">Acepta formato 12h (8:00 AM) o 24h (08:00)</p>
            </div>
            <button
              type="submit"
              disabled={loading || !hour.trim()}
              className="px-6 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 font-semibold disabled:opacity-60 whitespace-nowrap"
            >
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>

        {/* Lista de horarios */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="font-semibold mb-3">
            Horarios existentes <span className="text-gray-400 font-normal ml-2">({timeslots.length})</span>
          </h2>

          {loadingList ? (
            <div className="text-center py-8 text-gray-400">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Cargando horarios...
            </div>
          ) : timeslots.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No hay horarios creados.</p>
              <p className="text-sm mt-2">Crea uno usando el formulario de arriba.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {timeslots.map((slot, index) => {
                const id = slot.id || slot._id || `slot-${index}`;
                const isEditing = editingId === id;
                const slotHour = getSlotHour(slot);
                const isActive = slot.isActive !== false; // default true si no está definido

                return (
                  <div key={id} className={`flex items-center justify-between p-3 rounded-md ${isActive ? "bg-gray-700" : "bg-gray-700/50"}`}>
                    {isEditing ? (
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="text"
                          value={editHour}
                          onChange={(e) => setEditHour(e.target.value)}
                          className="bg-gray-600 text-white px-3 py-1 rounded-md w-28 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          autoFocus
                        />
                        <button 
                          onClick={() => saveEdit(id)} 
                          disabled={editLoading} 
                          className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-sm disabled:opacity-60"
                        >
                          {editLoading ? "..." : "Guardar"}
                        </button>
                        <button 
                          onClick={cancelEdit} 
                          className="px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-500 text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <span className={`text-lg font-mono ${!isActive ? "text-gray-500" : ""}`}>
                            {formatTo12h(slotHour)}
                          </span>
                          <span className="text-gray-500 text-sm">({slotHour})</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-gray-600 text-gray-400"}`}>
                            {isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleActive(slot)}
                            className={`p-2 rounded-md text-sm ${isActive ? "bg-gray-600 hover:bg-gray-500 text-gray-300" : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300"}`}
                            title={isActive ? "Desactivar" : "Activar"}
                          >
                            {isActive ? "⏸" : "▶"}
                          </button>
                          <button 
                            onClick={() => startEdit(slot)} 
                            className="p-2 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm" 
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(id)} 
                            className="p-2 rounded-md bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm" 
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Debug info (solo en desarrollo) */}
        {import.meta?.env?.DEV && (
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Debug Info:</h3>
            <pre className="text-xs text-gray-500 overflow-auto max-h-40">
              {JSON.stringify({ count: timeslots.length, sample: timeslots[0] }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTimeslots;