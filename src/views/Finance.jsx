import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertTriangle, BarChart } from "lucide-react";
import { Chart } from "@components/Chart";
import { MiniCardChart } from "@components/MiniCardChart";
import { getFinanceSummary, getLastMovements, getBusinessFinanceSummary } from "@services/financeService";
import { getBusinessByUser } from "@services/businessService";
import { useAuth } from "@context/AuthContext";
import { TrendingUp, TrendingDown } from "lucide-react";

export const Finance = () => {
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const userId = user?.id || user?._id || user?.userId || "";

  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState(5000); // Se actualizará con la meta del negocio
  const [businessId, setBusinessId] = useState(null); // Guardamos el businessId

  const todayDate = new Date().toISOString().split("T")[0];

  const parseGoal = (v) => {
    if (v == null) return 0;
    const n = Number(String(v).replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  // 🔧 Convertir movimientos para la gráfica
  const buildChartFromMovements = (movements) => {
    const grouped = {};
    (Array.isArray(movements) ? movements : []).forEach((m) => {
      const date = new Date(m.date).toLocaleDateString("es-CO");
      if (!grouped[date]) grouped[date] = { date, Ingresos: 0, Egresos: 0 };
      // Normaliza tipos
      const t = (m.type || "").toLowerCase();
      if (t === "ingreso") grouped[date].Ingresos += Number(m.value) || 0;
      if (t === "egreso") grouped[date].Egresos += Number(m.value) || 0;
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  // 1) Cargar meta mensual (goal) desde cache y/o API
  useEffect(() => {
    const cached = localStorage.getItem("business");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.goal != null) {
          setGoal(parseGoal(parsed.goal));
        }
      } catch {}
    }

    let ignore = false;
    const loadGoal = async () => {
      if (!userId) return;
      try {
        const business = await getBusinessByUser(userId);
        if (ignore) return;
        if (business?.goal != null) {
          setGoal(parseGoal(business.goal));
          setBusinessId(business.id); // Guardamos el businessId
        }
      } catch (error) {
        console.error('❌ Error al cargar la meta del negocio:', error);
      }
    };
    loadGoal();

    const onStorage = (e) => {
      if (e.key === "business" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.goal != null) {
            setGoal(parseGoal(parsed.goal));
          }
        } catch (error) {
          console.error('❌ Error al parsear los datos del negocio', error);
        }
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      ignore = true;
      window.removeEventListener("storage", onStorage);
    };
  }, [userId]);

  // 2) Resumen y movimientos
  useEffect(() => {
    const cachedSummary = localStorage.getItem("financeSummary");
    if (cachedSummary) {
      setSummary(JSON.parse(cachedSummary));
    }

    const fetchData = async () => {
      try {
        const [summaryData, movements] = await Promise.all([
          getFinanceSummary(todayDate),
          getLastMovements(30),
        ]);

        if (summaryData) {
          setSummary(summaryData);
          localStorage.setItem("financeSummary", JSON.stringify(summaryData));
        }

        setChartData(buildChartFromMovements(movements));
      } catch (error) {
        console.error("❌ Error en Finance:", error);
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      getBusinessFinanceSummary(businessId)
        .then((businessSummary) => {
          if (businessSummary) {
            setSummary((prevSummary) => ({
              ...prevSummary,
              goal: businessSummary.goal,
            }));
          }
        })
        .catch((error) => {
          console.error("❌ Error al obtener resumen del negocio:", error);
        });
    }

    fetchData(); // Ejecutamos la función asíncrona
  }, [todayDate, businessId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        ⏳ Cargando Finanzas...
      </div>
    );
  }

  const ingresos = Number(summary?.ingresos) || 0;
  const egresos = Number(summary?.egresos) || 0;
  const safeGoal = parseGoal(goal);
  const percentage =
    safeGoal > 0 ? Math.min((ingresos / safeGoal) * 100, 100) : 0;

  const circleRadius = 40;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const progress =
    circleCircumference - (percentage / 100) * circleCircumference;

  const isOk = ingresos >= egresos;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10 text-white">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-8">
        <BarChart size={16} className="text-white/70" />
        <h1 className="text-lg font-semibold text-white/80">Finanzas</h1>
      </div>

      {/* GRID: Resumen + Meta + Alerta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Panel Resumen */}
        <div className="flex flex-col md:flex-row justify-between lg:col-span-2 bg-[#0f172a] rounded-xl border border-white/10 p-6 shadow gap-6">
          <div>
            <h2 className="text-4xl font-bold mb-1">
              ${(Number(summary?.balanceMonth) || 0).toLocaleString()}
            </h2>
            <p className="text-xs text-white/70 mb-4">Balance mensual</p>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-green-400 text-sm font-semibold">
                  + ${ingresos.toLocaleString()}
                </span>
                <span className="text-xs text-white/50">Ingresos</span>
              </div>
              <div className="flex flex-col">
                <span className="text-red-400 text-sm font-semibold">
                  - ${egresos.toLocaleString()}
                </span>
                <span className="text-xs text-white/50">Egresos</span>
              </div>
            </div>
          </div>

          {/* Meta Mensual con gráfico circular */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r={circleRadius}
                  strokeWidth="6"
                  stroke="#1f2937"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={circleRadius}
                  strokeWidth="6"
                  stroke="#8b5cf6"
                  fill="transparent"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={progress}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">
                  {Math.round(percentage)}%
                </span>
                <span className="text-[10px] text-white/70">Completado</span>
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">Meta Mensual</h3>
              <p className="text-2xl text-green-400 font-bold mb-1">
                ${safeGoal.toLocaleString()}
              </p>
              <p className="text-xs text-white/50 leading-snug mb-3">
                Llevas un total de {Math.round(percentage)}% completado
              </p>
              <button
                onClick={() => navigate("/dashboard/agregar-movimiento")}
                className="flex items-center justify-center gap-2 text-xs bg-white text-black px-4 py-1.5 rounded-full font-semibold shadow hover:opacity-90 transition"
              >
                Agregar Movimiento
              </button>
            </div>
          </div>
        </div>

        {/* Panel: Alerta */}
        <div
          className={`rounded-xl p-5 shadow border ${
            isOk ? "bg-[#14532d] border-green-800" : "bg-[#991b1b] border-red-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-1 text-white">
            <AlertTriangle size={18} /> <span className="font-semibold">Shain</span>
          </div>
          <p className="text-sm">
            {isOk
              ? "Todo en orden: los ingresos superan (o igualan) los egresos."
              : "Alerta: Los egresos están superando los ingresos."}
          </p>
          <p className="text-xs text-white/80 mt-1">Reporte del mes actual</p>
          <p className="text-xs text-white/60">
            {isOk
              ? "Continúa con la estrategia actual"
              : "Se recomienda generar nuevos ingresos"}
          </p>
        </div>
      </div>

      {/* GRÁFICA */}
      <div className="bg-gradient-to-b from-[#0f172a] to-black rounded-xl border border-white/10 p-6 mb-6">
        <h3 className="text-sm font-semibold mb-4">
          Ingresos vs Egresos (últimos 30 días)
        </h3>
        <div className="bg-black/20 rounded-xl p-6">
          {chartData.length > 0 ? <Chart data={chartData} /> : (
            <p className="text-center text-white/60">📊 Sin datos disponibles</p>
          )}
        </div>
      </div>

      {/* Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-10">
        <MiniCardChart
          title="Ingresos Totales"
          value={`$${Number(ingresos).toLocaleString()}`}
          percent={5}
          color="green"
          icon={<TrendingUp size={14} />}
          data={chartData.map((d) => ({ value: d.Ingresos }))}
        />
        <MiniCardChart
          title="Gastos Totales"
          value={`-$${Number(egresos).toLocaleString()}`}
          percent={-15}
          color="red"
          icon={<TrendingDown size={14} />}
          data={chartData.map((d) => ({ value: d.Egresos }))}
        />
      </div>
    </div>
  );
};

export default Finance;
