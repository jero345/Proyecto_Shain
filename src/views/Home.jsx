import {
  ArrowUpRight, Plus, ScrollText, Home as HomeIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Chart } from "@components/Chart";
import { getDailySummaryService, getMovementsForServiceProvider, getMovementsForBusinessOwner } from "@services/addMovementService";
import { useAuth } from "@context/AuthContext";
import { ROLES, normalizeRole } from "../constant/roles";

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const userRole = normalizeRole(user?.role || "");

  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwner = userRole === ROLES.OWNER;

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Helper para validar ObjectId de MongoDB
      const isValidObjectId = (id) => {
        if (!id || typeof id !== 'string') return false;
        return /^[a-fA-F0-9]{24}$/.test(id);
      };

      // Obtener IDs desde múltiples fuentes
      let userId = localStorage.getItem('user_id');
      let businessId = localStorage.getItem('business_id');

      // Limpiar strings inválidos
      if (!userId || userId === "undefined" || userId === "null" || userId === "[object Object]") userId = null;
      if (!businessId || businessId === "undefined" || businessId === "null" || businessId === "[object Object]") businessId = null;

      // Validar formato de ObjectId
      if (userId && !isValidObjectId(userId)) {
        localStorage.removeItem('user_id');
        userId = null;
      }
      if (businessId && !isValidObjectId(businessId)) {
        localStorage.removeItem('business_id');
        businessId = null;
      }

      // Si no están en localStorage, intentar desde user
      if (!userId) {
        const candidateUserId = user?.id || user?._id || user?.userId;
        if (candidateUserId && isValidObjectId(candidateUserId)) {
          userId = candidateUserId;
          localStorage.setItem('user_id', userId);
        }
      }

      if (!businessId) {
        const businessValue = user?.business || user?.businessId;
        if (typeof businessValue === 'string' && isValidObjectId(businessValue)) {
          businessId = businessValue;
          localStorage.setItem('business_id', businessId);
        } else if (businessValue && typeof businessValue === 'object') {
          const candidateBizId = businessValue.id || businessValue._id;
          if (candidateBizId && isValidObjectId(candidateBizId)) {
            businessId = candidateBizId;
            localStorage.setItem('business_id', businessId);
          }
        }
      }

      // Obtener el resumen del backend (solo si hay ID valido)
      if (userId || businessId) {
        try {
          const summaryData = await getDailySummaryService();
          if (summaryData) {
            setSummary(summaryData);
          }
        } catch {
          // Continuar sin resumen
        }
      }

      // Obtener movimientos para el gráfico según ROL

      let movements = [];

      try {
        if (!isOwner && userId) {
          movements = await getMovementsForServiceProvider(userId, '', 'month');
        } else if (isOwner && businessId) {
          movements = await getMovementsForBusinessOwner(businessId, '', 'month');
        }

        if (movements?.length) {
          const chart = buildChartFromMovements(movements);
          setChartData(chart);
        } else {
          setChartData([]);
        }
      } catch (movementsError) {
        if (movementsError?.response?.status !== 401) {
          setChartData([]);
        }
      }

    } catch (err) {
      setError(err.message || "No se pudo cargar la información del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const buildChartFromMovements = (movements) => {
    if (!movements || !Array.isArray(movements)) return [];

    const grouped = {};

    movements.forEach((m) => {
      if (!m.date || !m.type || m.value == null) return;

      // Formato de fecha sin desfase
      const [year, month, day] = m.date.split('-').map(Number);
      const fecha = new Date(year, month - 1, day);
      const dateKey = fecha.toLocaleDateString("es-CO", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, Ingresos: 0, Egresos: 0 };
      }

      const val = Number(m.value) || 0;
      const type = (m.type || '').toLowerCase();

      if (type === "ingreso") {
        grouped[dateKey].Ingresos += val;
      } else if (type === "egreso") {
        grouped[dateKey].Egresos += val;
      }
    });

    // Ordenar por fecha
    return Object.values(grouped).sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('/').map(Number);
      const [dayB, monthB, yearB] = b.date.split('/').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA - dateB;
    });
  };

  // Función para formatear porcentaje sin decimales innecesarios
  const formatPercentage = (value) => {
    const num = Number(value) || 0;
    if (Number.isInteger(num)) {
      return num.toString();
    }
    return Math.round(num).toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#0f172a]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <HomeIcon className="w-10 h-10 text-purple-400 animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Cargando Dashboard
          </h2>
          <p className="text-white/60 text-sm">Preparando tu información...</p>

          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a]  to-[#0f172a]">
        <div className="text-center">
          <div className="bg-gradient-to-br from-red-900/40 to-red-950/60 border-2 border-red-500/30 rounded-2xl p-8 max-w-md">
            <p className="text-red-400 text-xl font-semibold mb-4">❌ {error}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={fetchData}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl transition-all text-white font-semibold shadow-lg hover:scale-105"
              >
                Reintentar
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/#/login";
                }}
                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all text-white font-semibold"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extraer datos del summary
  const dayStatistics = summary?.dayStatistics || {};
  const totalTransactionsDay = dayStatistics?.totalTransactionsDay || {};

  const incomesToday = Number(totalTransactionsDay?.incomes || 0);
  const expensesToday = Number(totalTransactionsDay?.expenses || 0);
  const totalDelDia = incomesToday - expensesToday;

  const salesIncreaseAmountDay = Number(dayStatistics?.salesIncreaseAmountDay || 0);
  const salesGrowthPercentageDay = Number(dayStatistics?.salesGrowthPercentageDay || 0);

  const monthStatistics = summary?.monthStatistics || {};
  const totalTransactionsMonth = monthStatistics?.totalTransactionsMonth || {};

  const ingresosMonth = Number(totalTransactionsMonth?.incomes || 0);
  const egresosMonth = Number(totalTransactionsMonth?.expenses || 0);
  const monthBalance = Number(monthStatistics?.monthBalance || 0);

  const profitMargin = Number(summary?.profitMargin || 0);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0f172a]  to-[#0f172a] text-white px-4 py-10">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header mejorado */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-12 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Resumen
              </h1>
              <p className="text-white/60 mt-1"></p>
            </div>
          </div>
        </div>

        {/* Tarjetas principales */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Ingresos del día */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">
            <p className="text-sm text-white/70 font-medium mb-3">Ingresos del día</p>
            <h2 className="text-4xl font-extrabold text-emerald-400 mb-6">
              +${incomesToday.toLocaleString()}
            </h2>
            <div className="pt-4 border-t border-white/10">
              {salesGrowthPercentageDay > 0 && (
                <div className="flex justify-end">
                  <div className="flex flex-col items-end text-xs gap-1">
                    <div className="flex items-center gap-1 font-semibold text-emerald-400">
                      <ArrowUpRight size={14} />
                      <span>{formatPercentage(salesGrowthPercentageDay)}% respecto al día anterior</span>
                    </div>
                    <span className="mt-1 text-emerald-400">
                      Tus ventas incrementaron ${salesIncreaseAmountDay.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Ingresos y Egresos del mes */}
          <div className="flex flex-col gap-4">
            {/* Ingresos del mes */}
            <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 backdrop-blur-xl p-5 rounded-2xl border border-emerald-500/30 shadow-xl">
              <p className="text-sm text-emerald-300/90 font-medium mb-2">Ingresos del mes</p>
              <p className="text-3xl font-extrabold text-emerald-400">
                +${ingresosMonth.toLocaleString()}
              </p>
            </div>

            {/* Egresos del mes */}
            <div className="bg-gradient-to-br from-rose-900/40 to-rose-950/60 backdrop-blur-xl p-5 rounded-2xl border border-rose-500/30 shadow-xl">
              <p className="text-sm text-rose-300/90 font-medium mb-2">Egresos del mes</p>
              <p className="text-3xl font-extrabold text-rose-400">
                -${egresosMonth.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acciones */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard/agregar-movimiento")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus size={18} /> Agregar Movimiento
          </button>
          <button
            onClick={() => navigate("/dashboard/historial")}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
          >
            <ScrollText size={18} /> Ver Historial Financiero
          </button>
        </div>

        {/* Gráfico */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold">Movimientos del Mes Actual</h3>
          </div>
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
            {chartData.length > 0 ? (
              <Chart data={chartData} />
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 opacity-30">📈</div>
                <p className="text-white/60 text-lg font-medium">Sin datos disponibles</p>
                <p className="text-white/40 text-sm mt-2">Agrega movimientos para visualizar el gráfico</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};