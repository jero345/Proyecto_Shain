// src/views/AddMovement.jsx
import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  addMovementService,
  getLastMovements,
} from "@services/addMovementService";

// helpers
const getToday = () => new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'
const DRAFT_KEY = "addMovement:draft";
const RECENT_KEY = (date) => `recentMovements:${date}`;
const money = (n) => Number(n || 0).toLocaleString("es-CO");
// compara por string para evitar líos de zona horaria
const ymd = (d) => (d ? String(d).slice(0, 10) : null);
const ymdSlash = (d) => (ymd(d) ? ymd(d).replaceAll("-", "/") : "");

// cache utils
const readCache = (k) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const writeCache = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

// formateo de miles para el input (muestra con puntos pero guarda solo dígitos)
const toDigits = (str) => (str || "").replace(/\D+/g, "");
const formatThousands = (digits) =>
  digits ? Number(digits).toLocaleString("es-CO") : "";

export const AddMovement = () => {
  const [form, setForm] = useState({
    type: "ingreso",
    // frequencyType ahora es OPCIONAL. Arranca vacío.
    frequencyType: "",
    value: "", // guardamos SOLO dígitos aquí
    description: "",
    date: getToday(),
  });

  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Hidrata borrador una sola vez al montar
  useEffect(() => {
    const draft = readCache(DRAFT_KEY);
    if (draft) {
      if (!draft.date) draft.date = getToday();
      setForm((prev) => ({ ...prev, ...draft }));
    }
  }, []);

  // Cargar recientes de la fecha seleccionada (cache + revalidación)
  useEffect(() => {
    const cached = readCache(RECENT_KEY(form.date));
    if (cached?.length) setRecentMovements(cached);

    const loadForDate = async () => {
      try {
        setLoadingRecent(true);
        const list = await getLastMovements(2); // mezcla ingresos + egresos
        const onlySelected = (Array.isArray(list) ? list : [])
          .filter((m) => ymd(m.date) === form.date)
          .sort((a, b) =>
            (ymd(b.date) || "").localeCompare(ymd(a.date) || "")
          )
          .slice(0, 6);

        setRecentMovements(onlySelected);
        writeCache(RECENT_KEY(form.date), onlySelected);
      } catch (e) {
        console.error("❌ Error trayendo movimientos:", e);
      } finally {
        setLoadingRecent(false);
      }
    };

    loadForDate();
  }, [form.date]);

  // Guardar borrador siempre
  useEffect(() => {
    writeCache(DRAFT_KEY, form);
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // valor: mostrar con puntos, guardar dígitos
    if (name === "value") {
      const digits = toDigits(value);
      setForm((prev) => ({ ...prev, value: digits }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Cambiar tipo (ingreso/egreso)
  const toggleType = (type) => {
    setForm((prev) => ({ ...prev, type }));
  };

  // Nuevo/Recurrente opcional: si clicas el activo, se des-selecciona
  const toggleFrequency = (freq) => {
    setForm((prev) => ({
      ...prev,
      frequencyType: prev.frequencyType === freq ? "" : freq,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones mínimas
    const valueNumber = Number(form.value || 0);
    if (!valueNumber || valueNumber <= 0) {
      alert("Ingresa un valor válido mayor que 0.");
      return;
    }

    if (form.type === "egreso" && !String(form.description || "").trim()) {
      alert("La descripción es obligatoria para un egreso.");
      return;
    }

    try {
      setLoading(true);

      // construir payload: SIEMPRE enviar 'frecuencyType' ("" si no hay selección)
      const payload = {
        type: form.type,
        value: form.value.toString(), // enviamos solo dígitos como string
        description: form.description,
        date: form.date, // 'YYYY-MM-DD'
        // el backend espera 'frecuencyType'
        frecuencyType: form.frequencyType || "",
      };

      const response = await addMovementService(payload);
      const saved = response?.data || response;

      const normalized = {
        id: saved.id || saved._id,
        type: (saved.type || form.type || "").toLowerCase(),
        value: Number(saved.value ?? form.value) || 0,
        description: saved.description ?? form.description ?? "",
        date: saved.date ?? form.date,
      };

      if (ymd(normalized.date) === form.date) {
        setRecentMovements((prev) => {
          const next = [normalized, ...prev].slice(0, 6);
          writeCache(RECENT_KEY(form.date), next);
          return next;
        });
      }

      const reset = {
        type: form.type, // mantenemos el tipo actual seleccionado
        frequencyType: "", // como es opcional, lo reiniciamos vacío
        value: "",
        description: "",
        date: form.date,
      };
      setForm(reset);
      writeCache(DRAFT_KEY, reset);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el movimiento");
    } finally {
      setLoading(false);
    }
  };

  const valueDisplay = formatThousands(form.value);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-2">Agregar Movimiento</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-gradientStart via-gradientMid2 to-gradientEnd p-8 rounded-xl border border-white/10 backdrop-blur-md space-y-6"
        >
          {/* Tipo Ingreso/Egreso */}
          <div className="flex gap-4">
            {["ingreso", "egreso"].map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => toggleType(type)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
                  form.type === type
                    ? type === "ingreso"
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha */}
            <div>
              <label className="block text-sm mb-1">Fecha*</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50"
              />
            </div>

            {/* Frecuencia (OPCIONAL) */}
            <div>
              <label className="block text-sm mb-1">
                ¿Qué tipo es? <span className="opacity-70">(opcional)</span>
              </label>
              <div className="flex items-center gap-4 mt-2">
                {["nuevo", "recurrente"].map((freq) => {
                  const isActive = form.frequencyType === freq;
                  const activeCls =
                    freq === "nuevo"
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-indigo-600 text-white border-indigo-500";

                  return (
                    <button
                      type="button"
                      key={freq}
                      onClick={() => toggleFrequency(freq)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                        isActive
                          ? activeCls
                          : "bg-transparent border-white/30 text-white/60 hover:border-white/50"
                      }`}
                      title="Clic de nuevo para des-seleccionar"
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-white/60 mt-1">
                Puedes dejarlo vacío si no aplica.
              </p>
            </div>
          </div>

          {/* Valor (con puntos de miles) */}
          <div>
            <label className="block text-sm mb-1">Valor del movimiento*</label>
            <input
              type="text"
              inputMode="numeric"
              name="value"
              value={valueDisplay}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50"
              required
            />
            <p className="text-xs text-white/50 mt-1">
              Se formatea automáticamente: 3000000 →{" "}
              <span className="font-semibold">3.000.000</span>
            </p>
          </div>

          {/* Descripción (obligatoria si es egreso) */}
          <div>
            <label className="block text-sm mb-1">
              Descripción{form.type === "egreso" ? " *" : ""}
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={
                form.type === "egreso"
                  ? "Describe el egreso (obligatorio)…"
                  : "Ej: Venta de producto, pago de factura... (opcional)"
              }
              className="w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50"
              required={form.type === "egreso"}
              aria-invalid={
                form.type === "egreso" && !form.description ? true : undefined
              }
            />
            {form.type === "egreso" && (
              <p className="text-xs text-red-300 mt-1">
                La descripción es obligatoria para egresos.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white font-semibold transition ${
              form.type === "ingreso"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading
              ? "Guardando..."
              : `Agregar ${form.type === "ingreso" ? "Ingreso" : "Egreso"}`}
          </button>

          <p className="text-xs text-white/60 mt-4">
            Revisa bien la información antes de guardar el movimiento.
          </p>
        </form>

        {/* Movimientos recientes para la fecha seleccionada */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Movimientos recientes</h2>
            <span className="text-sm text-white/70">{ymdSlash(form.date)}</span>
          </div>

          {loadingRecent && recentMovements.length === 0 ? (
            <p className="text-white/60">Cargando movimientos…</p>
          ) : (
            <ul className="space-y-4">
              {recentMovements.slice(0, 6).map((item, idx) => {
                const isIngreso =
                  (item.type || "").toLowerCase() === "ingreso";
                return (
                  <li
                    key={item.id || item._id || idx}
                    className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isIngreso ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {isIngreso ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <ArrowDownRight size={16} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {isIngreso ? "Ingreso" : "Egreso"}
                        </p>
                        <p className="text-xs text-white/70">
                          {item.description || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          isIngreso ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {isIngreso ? "+" : "-"}${money(item.value)}
                      </p>
                      <p className="text-xs text-white/60">
                        {ymdSlash(item.date) || ymdSlash(form.date)}
                      </p>
                    </div>
                  </li>
                );
              })}
              {recentMovements.length === 0 && (
                <li className="text-white/60">
                  Sin movimientos para {ymdSlash(form.date)}.
                </li>
              )}
            </ul>
          )}
          <div className="mt-4">
            <Link
              to="/dashboard/historial"
              className="text-sm underline text-white/70 hover:text-white"
            >
              Ver todo el historial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMovement;
