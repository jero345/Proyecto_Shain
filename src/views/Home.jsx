import {
  ArrowUpRight,
  Plus,
  ScrollText,
  Home as HomeIcon,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Chart } from "@components/Chart";
import { MiniCardChart } from "@components/MiniCardChart";
import { getFinanceSummary, getLastMovements } from "@services/financeService";

export const Home = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const todayDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const buildChartFromMovements = (movements) => {
    if (!movements || !Array.isArray(movements)) return [];

    const grouped = {};

    movements.forEach((m) => {
      if (!m.date || !m.type || !m.value) return;

      const date = new Date(m.date).toLocaleDateString("es-CO");
      if (!grouped[date]) grouped[date] = { date, Ingresos: 0, Egresos: 0 };

      if (m.type.toLowerCase() === "ingreso")
        grouped[date].Ingresos += Number(m.value) || 0;
      if (m.type.toLowerCase() === "egreso")
        grouped[date].Egresos += Number(m.value) || 0;
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("📡 Consultando backend para la fecha:", todayDate);

        const [summaryData, movements] = await Promise.all([
          getFinanceSummary(todayDate),
          getLastMovements(30),
        ]);

        console.log("✅ summaryData:", summaryData);
        console.log("✅ movements:", movements);

        if (summaryData) {
          setSummary(summaryData);
          localStorage.setItem("financeSummary", JSON.stringify(summaryData));
        }

        if (movements && movements.length > 0) {
          setChartData(buildChartFromMovements(movements));
        }
      } catch (err) {
        console.error("❌ Error en fetchData:", err);
        setError("No se pudo cargar el resumen financiero");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        ⏳ Cargando resumen financiero...
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#a32063] via-[#4b1d69] to-[#0b0b2f] text-white px-4 py-10">
      <div className="w-full max-w-7xl mx-auto">
        {/* 🏠 Encabezado */}
        <div className="flex items-center gap-2 text-sm text-white font-semibold mb-1">
          <HomeIcon size={16} className="text-white/80" /> Inicio
        </div>
        <h1 className="text-5xl font-extrabold mb-8">Resumen</h1>

        {/* Balance + Totales */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center justify-between bg-[#421953]/80 p-6 rounded-xl border border-purple-700 shadow-md">
            <div>
              <p className="text-sm text-green-200 mb-1">Balance del día</p>
              <h2 className="text-4xl font-extrabold text-lime-300">
                {summary
                  ? summary.balanceDay >= 0
                    ? `+$${summary.balanceDay.toLocaleString()}`
                    : `-$${Math.abs(summary.balanceDay).toLocaleString()}`
                  : "+$0"}
              </h2>
            </div>
            <div className="flex flex-col text-right ml-4">
              <div className="flex items-center justify-end gap-1 text-sm mb-1 text-green-300">
                <ArrowUpRight size={16} /> 0% respecto ayer
              </div>
              <p className="text-green-300 text-sm">
                Tus ventas incrementaron ${summary?.incomesDay?.toLocaleString() || 0}
              </p>
            </div>
          </div>
          <div className="bg-black/20 p-6 rounded-xl border border-white/10 flex flex-col justify-center">
            <p className="text-green-400 font-bold mb-1">Ingresos totales</p>
            <p className="text-3xl font-bold text-green-300 mb-4">
              +${summary?.ingresos?.toLocaleString() || 0}
            </p>
            <p className="text-red-400 font-bold mb-1">Egresos totales</p>
            <p className="text-3xl font-bold text-red-300">
              -${summary?.egresos?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Botones acción */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard/agregar-movimiento")}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 text-white px-5 py-2 rounded-full text-sm font-semibold transition"
          >
            <Plus size={16} /> Agregar Movimiento
          </button>
          <button
            onClick={() => navigate("/dashboard/historial")}
            className="flex items-center gap-2 border border-white/30 hover:bg-white/10 px-5 py-2 rounded-full text-sm font-semibold transition"
          >
            <ScrollText size={16} /> Ver Historial Financiero
          </button>
        </div>

        {/* 🔔 Notificaciones */}
        <h2 className="text-base font-bold mb-3">Notificaciones</h2>
        {(!chartData || chartData.length === 0) && (
          <p className="text-white/70 text-sm">
            No hay movimientos registrados en los últimos días.
          </p>
        )}

        {/* Gráfica */}
        <div className="mt-10">
          <h3 className="text-sm font-bold mb-2">
            Ingresos vs Egresos (últimos 30 días)
          </h3>
          <div className="bg-black/20 rounded-xl p-6">
            {chartData.length > 0 ? (
              <Chart data={chartData} />
            ) : (
              <p className="text-center text-white/60">
                📊 Sin datos disponibles
              </p>
            )}
          </div>
        </div>

        {/* MiniCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          <MiniCardChart
            title="Ingresos Totales"
            value={`$${summary?.ingresos?.toLocaleString() || 0}`}
            percent={5}
            color="green"
            icon={<TrendingUp size={14} />}
            data={chartData.map((d) => ({ value: d.Ingresos }))}
          />
          <MiniCardChart
            title="Gastos Totales"
            value={`-$${summary?.egresos?.toLocaleString() || 0}`}
            percent={-15}
            color="red"
            icon={<TrendingDown size={14} />}
            data={chartData.map((d) => ({ value: d.Egresos }))}
          />
          <MiniCardChart
            title="Margen de beneficio"
            value={`$${((summary?.ingresos || 0) - (summary?.egresos || 0)).toLocaleString()}`}
            percent={21}
            color="cyan"
            icon={<RefreshCcw size={14} />}
            data={chartData.map((d) => ({
              value: d.Ingresos - d.Egresos,
            }))}
          />
        </div>
      </div>
    </div>
  );
};
