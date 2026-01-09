// src/views/AddMovement.jsx
import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Calendar, DollarSign, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { addMovementService, getMovementsService } from "@services/addMovementService";
import { useAuth } from "@context/AuthContext";

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const money = (n) => Number(n || 0).toLocaleString("es-CO");
const ymd = (d) => (d ? String(d).slice(0, 10) : null);
const ymdSlash = (d) => (ymd(d) ? ymd(d).replaceAll("-", "/") : "");
const toDigits = (str) => (str || "").replace(/\D+/g, "");
const formatThousands = (digits) => digits ? Number(digits).toLocaleString("es-CO") : "";

// Límite de caracteres para descripción (interno, sin mostrar)
const DESCRIPTION_MAX_LENGTH = 1000;

export const AddMovement = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [form, setForm] = useState({
    type: "ingreso",
    value: "",
    description: "",
    date: getToday(),
  });

  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadForDate = async () => {
      try {
        setLoadingRecent(true);
        const list = await getMovementsService(userId, "todos");
        
        console.log("📦 Movimientos recibidos:", list);
        
        const filtered = (Array.isArray(list) ? list : [])
          .map((m) => ({
            id: m.id || m._id,
            type: m.type || "ingreso",
            value: Number(m.value ?? 0),
            description: m.description || "",
            date: m.date || m.createdAt || "",
          }))
          .filter((m) => ymd(m.date) === form.date)
          .slice(0, 6);

        console.log("✅ Movimientos filtrados para", form.date, ":", filtered);
        setRecentMovements(filtered);
      } catch (e) {
        console.error("❌ Error trayendo movimientos:", e);
        setRecentMovements([]);
      } finally {
        setLoadingRecent(false);
      }
    };

    loadForDate();
  }, [form.date, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "value") {
      const digits = toDigits(value);
      setForm((prev) => ({ ...prev, value: digits }));
      return;
    }
    // Para descripción, permitir escribir hasta el límite (silenciosamente)
    if (name === "description") {
      if (value.length <= DESCRIPTION_MAX_LENGTH) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleType = (type) => {
    setForm((prev) => ({ ...prev, type }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const valueNumber = Number(form.value || 0);
    if (!valueNumber || valueNumber <= 0) {
      alert("Ingresa un valor válido mayor que 0.");
      return;
    }

    if (form.type === "egreso" && !String(form.description || "").trim()) {
      alert("La descripción es obligatoria para egresos.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        type: form.type,
        value: form.value.toString(),
        description: form.description,
        date: form.date,
      };

      console.log("🚀 Enviando movimiento:", payload);

      const response = await addMovementService(payload);
      const saved = response?.data || response;

      console.log("✅ Respuesta del servidor:", saved);

      const newMovement = {
        id: saved.id || saved._id || Date.now().toString(),
        type: form.type,
        value: Number(form.value) || 0,
        description: form.description || "",
        date: form.date,
      };

      if (ymd(newMovement.date) === form.date) {
        setRecentMovements((prev) => [newMovement, ...prev].slice(0, 6));
      }

      setForm({
        type: form.type,
        value: "",
        description: "",
        date: form.date,
      });

      alert("✅ Movimiento guardado correctamente");
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Error al guardar el movimiento");
    } finally {
      setLoading(false);
    }
  };

  const valueDisplay = formatThousands(form.value);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#0f172a] px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-10">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-1 sm:w-1.5 h-12 sm:h-16 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full flex-shrink-0"></div>
            <div className="min-w-0 flex-1 py-1">
              <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent break-words leading-tight pb-1">
                Agregar Movimiento
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Formulario */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/10 overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 w-full">
              {/* Tipo Ingreso/Egreso */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  Tipo de movimiento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toggleType("ingreso")}
                    className={`px-3 sm:px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                      form.type === "ingreso"
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg scale-[1.02]"
                        : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Ingreso</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleType("egreso")}
                    className={`px-3 sm:px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                      form.type === "egreso"
                        ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg scale-[1.02]"
                        : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Egreso</span>
                  </button>
                </div>
              </div>

              {/* Fecha */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Fecha
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm sm:text-base appearance-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer max-w-full box-border"
                  style={{ minWidth: 0 }}
                />
              </div>

              {/* Valor */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
                  <DollarSign className="w-4 h-4 text-purple-400" />
                  Valor del movimiento
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-semibold text-lg">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="value"
                    value={valueDisplay}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-lg font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Descripción (sin contador visible) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder=""
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                  required={form.type === "egreso"}
                />
              </div>

              {/* Botón submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 sm:py-4 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 text-sm sm:text-base ${
                  form.type === "ingreso"
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                    : "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    {form.type === "ingreso" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span>Agregar {form.type === "ingreso" ? "Ingreso" : "Egreso"}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Movimientos recientes */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">Registros Recientes</h2>
              <span className="text-xs sm:text-sm text-white/60 bg-white/5 px-2.5 sm:px-3 py-1 rounded-full">
                {ymdSlash(form.date)}
              </span>
            </div>

            {loadingRecent && recentMovements.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin h-10 w-10 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-white/60 text-sm">Cargando movimientos...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2 sm:space-y-3">
                  {recentMovements.map((item, idx) => {
                    const isIngreso = (item.type || "").toLowerCase() === "ingreso";
                    return (
                      <div
                        key={item.id || idx}
                        className="flex justify-between items-center bg-white/5 hover:bg-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all border border-white/10"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isIngreso ? "bg-emerald-500/20" : "bg-rose-500/20"
                            }`}
                          >
                            {isIngreso ? (
                              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-white capitalize">
                              {isIngreso ? "Ingreso" : "Egreso"}
                            </p>
                            <p className="text-[10px] sm:text-xs text-white/60 truncate">
                              {item.description || "Sin descripción"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p
                            className={`font-bold text-sm sm:text-base ${
                              isIngreso ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isIngreso ? "+" : "-"}${money(item.value)}
                          </p>
                          <p className="text-[10px] sm:text-xs text-white/50">
                            {ymdSlash(item.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {recentMovements.length === 0 && !loadingRecent && (
                    <div className="text-center py-10 sm:py-12">
                      <div className="text-4xl mb-3 opacity-30">📋</div>
                      <p className="text-white/60 text-sm">
                        Sin movimientos para {ymdSlash(form.date)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
                  <Link
                    to="/dashboard/historial"
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 font-medium"
                  >
                    Ver todo el historial
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMovement;