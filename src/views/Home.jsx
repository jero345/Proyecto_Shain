import {
  ArrowUpRight, Plus, ScrollText, Home as HomeIcon,
  TrendingUp, TrendingDown, RefreshCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Chart } from "@components/Chart";
import { MiniCardChart } from "@components/MiniCardChart";
import { getMovementsForServiceProvider, getMovementsForBusinessOwner } from "@services/addMovementService";

const SUMMARY_CACHE_KEY = (date) => `financeSummary:${date}`;
const MOVS_CACHE_KEY = (days) => `lastMovements:${days}`;

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const writeCache = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify({ value, ts: Date.now() }));
  } catch {}
};

export const Home = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState("all");
  const [type, setType] = useState("ingreso");

  const todayDate = new Date().toISOString().split("T")[0];
  const daysRange = 30;

  // Hidratar desde cache inmediatamente
  useEffect(() => {
    const cachedSummary = readCache(SUMMARY_CACHE_KEY(todayDate));
    if (cachedSummary?.value) setSummary(cachedSummary.value);

    const cachedMovs = readCache(MOVS_CACHE_KEY(daysRange));
    if (cachedMovs?.value?.length) {
      setChartData(buildChartFromMovements(cachedMovs.value));
    }

    // Revalidar en segundo plano
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const businessId = localStorage.getItem('business_id');
        if (!userId && !businessId) {
          throw new Error('No se encontró el ID del usuario o negocio.');
        }

        // Validar si es un prestador de servicio o un propietario de negocio
        const movements = userId
          ? await getMovementsForServiceProvider(userId, type, filterDate)
          : businessId
          ? await getMovementsForBusinessOwner(businessId, type, filterDate)
          : [];

        if (movements?.length) {
          const chart = buildChartFromMovements(movements);
          setChartData(chart);
          // Calcular summary a partir de movimientos y guardarlo en state/cache
          const summaryFromMovs = computeSummaryFromMovements(movements);
          setSummary(summaryFromMovs);
          writeCache(SUMMARY_CACHE_KEY(todayDate), summaryFromMovs);
          writeCache(MOVS_CACHE_KEY(daysRange), movements);
        }
      } catch (err) {
        console.error("❌ Error en fetchData:", err);
        if (!summary) setError("No se pudo cargar los movimientos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [todayDate, filterDate, type]);

  // Lógica para construir el gráfico
  const buildChartFromMovements = (movements) => {
    if (!movements || !Array.isArray(movements)) return [];
    const grouped = {};
    movements.forEach((m) => {
      if (!m.date || !m.type || m.value == null) return;
      const date = new Date(m.date).toLocaleDateString("es-CO");
      if (!grouped[date]) grouped[date] = { date, Ingresos: 0, Egresos: 0 };
      const val = Number(m.value) || 0;
      if (m.type.toLowerCase() === "ingreso") grouped[date].Ingresos += val;
      if (m.type.toLowerCase() === "egreso") grouped[date].Egresos += val;
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Construir summary a partir de los movimientos (hoy vs ayer, ingresos/egresos mes)
  const computeSummaryFromMovements = (movements) => {
    const safeNum = (v) => Number(v) || 0;

    const isSameDay = (d, dateStr) => {
      try {
        const dt = new Date(dateStr);
        return dt.getFullYear() === d.getFullYear() &&
               dt.getMonth() === d.getMonth() &&
               dt.getDate() === d.getDate();
      } catch { return false; }
    };

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let ingresosToday = 0;
    let ingresosYesterday = 0;
    let egresosToday = 0;
    let ingresosMes = 0;
    let egresosMes = 0;

    movements.forEach((m) => {
      if (!m || m.value == null) return;
      const val = safeNum(m.value);
      const type = (m.type || '').toLowerCase();
      const date = m.date;
      if (isSameDay(today, date)) {
        if (type === 'ingreso') ingresosToday += val;
        if (type === 'egreso') egresosToday += val;
      }
      if (isSameDay(yesterday, date)) {
        if (type === 'ingreso') ingresosYesterday += val;
      }
      // Mes actual (basado en fecha del movimiento)
      try {
        const dt = new Date(date);
        if (dt.getFullYear() === today.getFullYear() && dt.getMonth() === today.getMonth()) {
          if (type === 'ingreso') ingresosMes += val;
          if (type === 'egreso') egresosMes += val;
        }
      } catch {}
    });

    const balanceDay = ingresosToday - egresosToday;
    const salesIncreaseAmountDay = ingresosToday - ingresosYesterday;
    let salesGrowthPercentageDay = 0;
    if (ingresosYesterday > 0) {
      salesGrowthPercentageDay = (salesIncreaseAmountDay / ingresosYesterday) * 100;
    } else if (ingresosToday > 0) {
      salesGrowthPercentageDay = 100;
    }

    return {
      balanceDay,
      salesIncreaseAmountDay,
      salesGrowthPercentageDay,
      ingresos: ingresosMes,
      egresos: egresosMes,
    };
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">⏳ Cargando...</div>;
  }

  if (error && !summary) {
    return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;
  }

  const balanceDay = summary?.balanceDay ?? 0;
  const salesIncreaseAmountDay = summary?.salesIncreaseAmountDay ?? 0;
  const salesGrowthPercentageDay = summary?.salesGrowthPercentageDay ?? 0;
  const ingresosMes = summary?.ingresos ?? 0;
  const egresosMes = summary?.egresos ?? 0;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f] text-white px-4 py-10">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-white font-semibold mb-1">
          <HomeIcon size={16} className="text-white/80" /> Inicio
        </div>
        <h1 className="text-5xl font-extrabold mb-8">Resumen</h1>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center justify-between bg-[#421953]/80 p-6 rounded-xl border border-purple-700 shadow-md">
            <div>
              <p className="text-sm text-white mb-1">Total del día</p>
              <h2 className="text-4xl font-extrabold text-green-300">
                {balanceDay >= 0 ? `+$${Number(balanceDay).toLocaleString()}` : `-$${Math.abs(Number(balanceDay)).toLocaleString()}`}
              </h2>
            </div>
            <div className="flex flex-col text-right ml-4">
              <div className="flex items-center justify-end gap-1 text-sm mb-1 text-green-300">
                <ArrowUpRight size={16} />
                {Number(salesGrowthPercentageDay).toFixed(1)}% respecto ayer
              </div>
              <p className="text-green-300 text-sm">
                Tus ventas incrementaron ${Number(salesIncreaseAmountDay).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-black/20 p-6 rounded-xl border border-white/10 flex flex-col justify-center">
            <p className="text-white font-bold mb-1">Ingresos totales</p>
            <p className="text-3xl font-bold text-green-300 mb-4">
              +${Number(ingresosMes).toLocaleString()}
            </p>
            <p className="text-white font-bold mb-1">Egresos totales</p>
            <p className="text-3xl font-bold text-red-300">
              -${Number(egresosMes).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <select
            // Clase modificada: fondo verde, texto blanco, borde y efecto hover/focus
            className="p-2 rounded-md bg-green-600 text-white border border-green-700 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
          <select
            // Clase modificada: fondo morado, texto blanco, borde y efecto hover/focus
            className="p-2 rounded-md bg-purple-600 text-white border border-purple-700 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="sevenDays">Últimos 7 días</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
            <option value="all">Todos</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button onClick={() => navigate("/dashboard/agregar-movimiento")}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 text-white px-5 py-2 rounded-full text-sm font-semibold transition">
            <Plus size={16} /> Agregar Movimiento
          </button>
          <button onClick={() => navigate("/dashboard/historial")}
                  className="flex items-center gap-2 border border-white/30 hover:bg-white/10 px-5 py-2 rounded-full text-sm font-semibold transition">
            <ScrollText size={16} /> Ver Historial Financiero
          </button>
        </div>

        <h2 className="text-base font-bold mb-3">Notificaciones</h2>
        {(!chartData || chartData.length === 0) && (
          <p className="text-white/70 text-sm">No hay movimientos registrados en los últimos días.</p>
        )}

        <div className="mt-10">
          <h3 className="text-sm font-bold mb-2">Ingresos vs Egresos (últimos 30 días)</h3>
          <div className="bg-black/20 rounded-xl p-6">
            {chartData.length > 0 ? <Chart data={chartData} /> : (
              <p className="text-center text-white/60">📊 Sin datos disponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
