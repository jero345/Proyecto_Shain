import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, User } from "lucide-react";
import { getEmployeeDetail } from "@services/employeeDetailService";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [movements, setMovements] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Obtener el mes y año actual
  const getCurrentMonthYear = () => {
    const now = new Date();
    return {
      month: now.getMonth(),
      year: now.getFullYear()
    };
  };

  // Helper para parsear fechas YYYY-MM-DD sin problemas de timezone
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  };

  // Filtrar movimientos del mes actual
  const filterMovementsByCurrentMonth = (movements) => {
    const { month, year } = getCurrentMonthYear();

    return movements.filter((movement) => {
      const dateStr = movement.date || movement.createdAt || movement.fecha;
      if (!dateStr) return false;

      const movementDate = parseLocalDate(dateStr);
      if (!movementDate || isNaN(movementDate.getTime())) return false;

      return (
        movementDate.getMonth() === month &&
        movementDate.getFullYear() === year
      );
    });
  };

  // Cargar los tres endpoints
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getEmployeeDetail(id);

        setEmployee(data.user);

        // Filtrar solo movimientos del mes actual
        const currentMonthMovements = filterMovementsByCurrentMonth(data.movements || []);

        // Ordenar movimientos del más reciente al más antiguo
        const sortedMovements = currentMonthMovements.sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt || 0);
          const dateB = new Date(b.date || b.createdAt || 0);
          return dateB - dateA;
        });

        setMovements(sortedMovements);
        setSummary(data.summary || {});
      } catch (err) {
        setError(err.message || "No se pudo cargar la información del empleado.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setTimeout(() => window.location.reload(), 400);
  };

  // Loader visual mejorado
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#0f172a]">
        <div className="text-center">
          {/* Spinner animado con icono de usuario */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
          </div>

          {/* Texto con gradiente */}
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Cargando Empleado
          </h2>
          <p className="text-white/60 text-sm">Obteniendo información del perfil...</p>

          {/* Puntos animados */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error visual mejorado
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#0f172a]">
        <div className="text-center px-4">
          {/* Icono de error */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>

          <h2 className="text-xl font-bold text-red-400 mb-2">Error al cargar</h2>
          <p className="text-white/60 text-sm mb-6 max-w-sm">{error}</p>

          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#0f172a]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
            <User className="w-10 h-10 text-white/40" />
          </div>
          <p className="text-white/60">Empleado no encontrado.</p>
          <button
            onClick={() => navigate("/dashboard/employees")}
            className="mt-4 text-purple-400 hover:text-purple-300 text-sm"
          >
            ← Volver a empleados
          </button>
        </div>
      </div>
    );
  }

  // Calcular totales (ya son solo del mes actual)
  const totalIngresos =
    movements
      .filter((m) => m.type === "ingreso")
      .reduce((sum, m) => sum + Number(m.value || 0), 0) || 0;
  const totalEgresos =
    movements
      .filter((m) => m.type === "egreso")
      .reduce((sum, m) => sum + Number(m.value || 0), 0) || 0;

  const balance = totalIngresos - totalEgresos;

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-[#0f172a] to-[#0f172a] text-white">
      {/* Botón volver */}
      <button
        onClick={() => navigate("/dashboard/employees")}
        className="flex items-center gap-2 text-purple-400 mb-6 hover:text-purple-300 transition group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span>Volver</span>
      </button>

      {/* Header del empleado */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          {employee.name} {employee.lastName}
        </h1>
        <p className="text-white/60 capitalize text-sm">{employee.role}</p>
      </div>

      {/* --- Resumen financiero --- */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 sm:p-5 shadow-lg border border-white/10 mb-6">
        <h2 className="font-semibold text-base sm:text-lg mb-4 text-white flex items-center gap-2">
          Resumen del mes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Ingresos */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-300/80">Total ingresos</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-emerald-400">
              ${totalIngresos.toLocaleString("es-CO")}
            </p>
          </div>

          {/* Egresos */}
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-rose-300/80">Total egresos</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-rose-400">
              ${totalEgresos.toLocaleString("es-CO")}
            </p>
          </div>

          {/* Balance */}
          <div className={`${balance >= 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-orange-500/10 border-orange-500/20'} border rounded-xl p-3 sm:p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className={`w-4 h-4 ${balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`} />
              <span className={`text-xs ${balance >= 0 ? 'text-blue-300/80' : 'text-orange-300/80'}`}>Balance del mes</span>
            </div>
            <p className={`text-lg sm:text-xl font-bold ${balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
              ${balance.toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      </div>

      {/* --- Historial de movimientos --- */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 sm:p-5 shadow-lg border border-white/10">
        <h2 className="font-semibold text-base sm:text-lg mb-4 text-white flex items-center gap-2">
          <div className="w-1.5 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          Movimientos del mes
        </h2>

        {movements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No hay movimientos registrados este mes.</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {movements.map((m) => {
              const isIngreso = m.type === "ingreso";
              return (
                <div
                  key={m._id || m.id}
                  className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all"
                >
                  {/* Icono */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isIngreso
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                      : "bg-gradient-to-br from-rose-500 to-rose-600"
                    }`}>
                    {isIngreso ? (
                      <ArrowUpRight size={16} className="text-white" />
                    ) : (
                      <ArrowDownRight size={16} className="text-white" />
                    )}
                  </div>

                  {/* Descripción y fecha */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {m.description || m.desc || "Sin descripción"}
                    </p>
                    <p className="text-xs text-white/50">
                      {formatDate(m.date)}
                    </p>
                  </div>

                  {/* Monto */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm sm:text-base font-bold ${isIngreso ? "text-emerald-400" : "text-rose-400"
                      }`}>
                      {isIngreso ? "+" : "-"}${Number(m.value || 0).toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}