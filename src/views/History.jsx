// src/views/History.jsx
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Pencil, Trash2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import {
  getMovementsService,
  deleteMovementService,
  updateMovementService,
} from "@services/addMovementService";
import { useAuth } from "@context/AuthContext";

/* ===== Helpers ===== */
const getSafeId = (obj) => obj?.id ?? obj?._id;
const money = (n) => Number(n || 0).toLocaleString("es-CO");
const ymd = (d) => (d ? String(d).slice(0, 10) : "");
const ymdSlash = (d) => (d ? ymd(d).replaceAll("-", "/") : "");

// Extraer solo dígitos
const toDigits = (str) => String(str || "").replace(/\D+/g, "");

// Formatear número con separadores de miles
const formatThousands = (value) => {
  const digits = toDigits(value);
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CO");
};

// clave secundaria por si fechas son iguales
const secondaryKey = (x) =>
  x?.createdAt ?? x?._createdAt ?? x?.updatedAt ?? getSafeId(x) ?? "";

/** Orden descendente por fecha (YYYY-MM-DD/ISO). Antiguos al final */
const sortDescByDate = (a, b) => {
  const da = ymd(a?.date);
  const db = ymd(b?.date);
  const cmp = db.localeCompare(da); // descendente
  if (cmp !== 0) return cmp;
  // Desempate consistente por createdAt/updatedAt/id (también descendente)
  return String(secondaryKey(b)).localeCompare(String(secondaryKey(a)));
};

// Función para invalidar cache de finanzas
const invalidateFinanceCache = () => {
  localStorage.removeItem("financeSummary");
  // Disparar evento para que Finance recargue
  window.dispatchEvent(new Event("financeCacheInvalidated"));
};

export const History = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [movements, setMovements] = useState([]);
  const [filterType, setFilterType] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [editForm, setEditForm] = useState({ value: "", description: "" });

  const [toast, setToast] = useState(null);

  /* Cargar movimientos según el filtro y el usuario */
  useEffect(() => {
    if (!userId) return;

    const fetchMovements = async () => {
      try {
        setLoading(true);
        const data = await getMovementsService(userId, filterType);
        const arr = Array.isArray(data) ? data : [];
        setMovements([...arr].sort(sortDescByDate));
      } catch {
        setToast({
          type: "error",
          message: "No se pudieron cargar los movimientos.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, [filterType, userId]);

  /* Autocierre del toast */
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  /* Filtrado + orden (desc) memoizado */
  const visibleMovements = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = movements.filter((item) =>
      (item?.description || "").toLowerCase().includes(term)
    );
    return [...filtered].sort(sortDescByDate);
  }, [movements, searchTerm]);

  /* Editar */
  const handleEditClick = (item) => {
    setSelectedMovement(item);
    setEditForm({
      value: String(item?.value ?? ""),
      description: item?.description || "",
    });
    setEditModalOpen(true);
  };

  // Manejar cambio en el valor (con formato de miles)
  const handleValueChange = (e) => {
    const digits = toDigits(e.target.value);
    setEditForm({ ...editForm, value: digits });
  };

  const handleEditSubmit = async () => {
    // Validar que haya un valor
    if (!editForm.value || Number(editForm.value) <= 0) {
      setToast({ message: "Ingresa un valor válido.", type: "error" });
      return;
    }

    try {
      const base = selectedMovement ?? {};
      const updated = {
        ...base,
        value: String(editForm.value),
        description: editForm.description,
      };
      await updateMovementService(getSafeId(base), updated);

      setMovements((prev) => {
        const next = prev.map((m) =>
          getSafeId(m) === getSafeId(base) ? updated : m
        );
        return next.sort(sortDescByDate);
      });

      // Invalidar cache de finanzas después de actualizar
      invalidateFinanceCache();

      setEditModalOpen(false);
      setToast({ message: "Movimiento actualizado.", type: "success" });
    } catch (err) {
      setToast({ message: "Error al actualizar.", type: "error" });
    }
  };

  /* Eliminar (optimista) */
  const handleDeleteClick = (item) => {
    setSelectedMovement(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMovement) return;
    const safeId = getSafeId(selectedMovement);
    const snapshot = movements;

    setMovements((prev) => prev.filter((m) => getSafeId(m) !== safeId));
    setDeleteModalOpen(false);
    setSelectedMovement(null);

    try {
      await deleteMovementService(safeId);
      setToast({ type: "success", message: "Movimiento eliminado." });

      // Invalidar cache de finanzas después de eliminar
      invalidateFinanceCache();
    } catch (err) {
      const status = err?.response?.status ?? err?.status;
      if (status === 404) {
        setToast({ type: "success", message: "Movimiento eliminado." });
        // Invalidar cache incluso si el movimiento ya no existe en el servidor
        invalidateFinanceCache();
      } else {
        setMovements(snapshot);
        setToast({
          type: "error",
          message: "No se pudo eliminar el movimiento.",
        });
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10 text-white">
      {/* Header mejorado */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
        <h1 className="text-base font-semibold text-white/90">Historial</h1>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          Movimientos recientes
        </h2>
        <Link to="/dashboard/agregar-movimiento">
          <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105">
            + Agregar Movimiento
          </button>
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col gap-3 mb-6 sm:mb-8">
        {/* Filtros */}
        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex">
          {["todos", "ingreso", "egreso"].map((type) => {
            const isActive = filterType === type;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${type === "todos"
                    ? isActive
                      ? "bg-indigo-600 text-white border-2 border-indigo-400 shadow-lg shadow-indigo-500/30"
                      : "bg-slate-800/80 hover:bg-indigo-600/20 text-white/70 hover:text-indigo-300 border border-slate-600 hover:border-indigo-400/50"
                    : type === "ingreso"
                      ? isActive
                        ? "bg-emerald-600 text-white border-2 border-emerald-400 shadow-lg shadow-emerald-500/30"
                        : "bg-slate-800/80 hover:bg-emerald-600/20 text-white/70 hover:text-emerald-300 border border-slate-600 hover:border-emerald-400/50"
                      : isActive
                        ? "bg-rose-600 text-white border-2 border-rose-400 shadow-lg shadow-rose-500/30"
                        : "bg-slate-800/80 hover:bg-rose-600/20 text-white/70 hover:text-rose-300 border border-slate-600 hover:border-rose-400/50"
                  }`}
              >
                {type === "todos" ? "Ver Todos" : type === "ingreso" ? "Ver Ingreso" : "Ver Egreso"}
              </button>
            );
          })}
        </div>

        {/* Búsqueda */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
          />
        </div>
      </div>

      {/* Lista de movimientos mejorada */}
      <div className="bg-gradient-to-br from-[#0b0f19] to-[#0f172a] rounded-2xl p-4 sm:p-6 border border-white/5 shadow-2xl">
        <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          Todos los movimientos
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-white/60 text-sm">Cargando movimientos...</p>
            </div>
          </div>
        ) : visibleMovements.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-base sm:text-lg text-white/60 font-medium">No se encontraron movimientos</p>
            <p className="text-sm text-white/40 mt-2">Intenta ajustar los filtros o agrega un nuevo movimiento</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {visibleMovements.map((item) => {
              const itemId = getSafeId(item);
              const isIngreso = (item?.type || "").toLowerCase() === "ingreso";
              return (
                <li
                  key={itemId}
                  className="group bg-[#0f172a]/50 border border-white/5 hover:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all hover:shadow-lg"
                >
                  {/* Layout móvil: 2 filas */}
                  <div className="flex flex-col gap-3">
                    {/* Fila 1: Icono + Info + Monto */}
                    <div className="flex items-center gap-3">
                      {/* Icono */}
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 ${isIngreso
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20"
                            : "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/20"
                          } shadow-lg`}
                      >
                        {isIngreso ? (
                          <ArrowUpRight size={18} className="text-white" />
                        ) : (
                          <ArrowDownRight size={18} className="text-white" />
                        )}
                      </div>

                      {/* Info: Tipo + Fecha */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold capitalize text-white">
                          {isIngreso ? "Ingreso" : "Egreso"}
                        </p>
                        <p className="text-xs text-white/50 font-medium">
                          {ymdSlash(item?.date)}
                        </p>
                      </div>

                      {/* Monto - alineado a la derecha */}
                      <div className="text-right flex-shrink-0">
                        <p className={`text-base sm:text-lg font-bold ${isIngreso ? "text-emerald-400" : "text-red-400"
                          }`}>
                          {isIngreso ? "+" : "-"}${money(item?.value)}
                        </p>
                      </div>
                    </div>

                    {/* Fila 2: Descripción + Botones */}
                    <div className="flex items-center justify-between gap-2 pl-[52px] sm:pl-[56px]">
                      {/* Descripción */}
                      {item?.description ? (
                        <p className="text-xs text-white/50 truncate flex-1">
                          {item.description}
                        </p>
                      ) : (
                        <p className="text-xs text-white/30 italic flex-1">Sin descripción</p>
                      )}

                      {/* Botones de acción */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1 text-white transition-all"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-1 text-white transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal Editar */}
      <Dialog open={editModalOpen} onClose={setEditModalOpen} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[#1c1c1e] p-6 rounded-xl w-full max-w-md text-white space-y-4 border border-white/10">
            <Dialog.Title className="text-lg font-semibold">
              Editar Movimiento
            </Dialog.Title>

            <div>
              <label className="block text-sm font-medium mb-2">Valor</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-semibold">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatThousands(editForm.value)}
                  onChange={handleValueChange}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <input
                type="text"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSubmit}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-xl font-semibold hover:opacity-90 transition-all"
              >
                Guardar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={deleteModalOpen} onClose={setDeleteModalOpen} className="relative z-50">
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-[#1c1c1e] rounded-xl p-6 w-full max-w-md text-white space-y-4 border border-white/10">
            <Dialog.Title className="text-lg font-semibold">
              ¿Eliminar movimiento?
            </Dialog.Title>
            <Dialog.Description className="text-sm text-white/60">
              Esta acción no se puede deshacer.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-6 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 font-semibold transition-all"
              >
                Eliminar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-[9999] px-4 py-2 rounded-lg text-white shadow-lg ${toast.type === "success" ? "bg-green-600" : "bg-red-600"
            } animate-[fadeIn_150ms_ease-out,fadeOut_300ms_ease-in_2200ms_forwards]`}
        >
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { to { opacity: 0; transform: translateY(8px); } }
      `}</style>
    </div>
  );
};

export default History;