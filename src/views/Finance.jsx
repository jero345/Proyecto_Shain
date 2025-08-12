// src/views/Finance.jsx
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AlertTriangle, BarChart } from 'lucide-react';
import { Chart } from '@components/Chart';
import { MiniCardChart } from '@components/MiniCardChart';
import { getFinanceSummary, getLastMovements } from '@services/financeService';
import { getBusinessByUser } from '@services/businessService';
import { useAuth } from '@context/AuthContext';

export const Finance = () => {
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const userId = user?.id || user?._id || user?.userId || '';

  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState(5000); // se actualizará con la meta del negocio

  const todayDate = new Date().toISOString().split('T')[0];

  const parseGoal = (v) => {
    // Convierte "100000" / "100.000" / "$100,000" -> número
    if (v == null) return 0;
    const n = Number(String(v).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  // 🔧 Convertir movimientos para la gráfica
  const buildChartFromMovements = (movements) => {
    const grouped = {};
    movements.forEach((m) => {
      const date = new Date(m.date).toLocaleDateString('es-CO');
      if (!grouped[date]) grouped[date] = { date, Ingresos: 0, Egresos: 0 };

      if (m.type === 'Ingreso') grouped[date].Ingresos += Number(m.value) || 0;
      if (m.type === 'Egreso') grouped[date].Egresos += Number(m.value) || 0;
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  // 1) Cargar meta mensual (goal) desde cache y/o API
  useEffect(() => {
    // a) cache local para pintar rápido
    const cached = localStorage.getItem('business');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.goal != null) {
          setGoal(parseGoal(parsed.goal));
        }
      } catch {}
    }

    // b) fetch real si tenemos userId
    let ignore = false;
    const loadGoal = async () => {
      if (!userId) return;
      try {
        const business = await getBusinessByUser(userId);
        if (ignore) return;
        if (business?.goal != null) {
          setGoal(parseGoal(business.goal));
        }
      } catch {
        // silencioso: si falla, se queda con el cached o default
      }
    };
    loadGoal();

    // c) escuchar cambios desde otras pestañas
    const onStorage = (e) => {
      if (e.key === 'business' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.goal != null) {
            setGoal(parseGoal(parsed.goal));
          }
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      ignore = true;
      window.removeEventListener('storage', onStorage);
    };
  }, [userId]);

  // 2) Resumen y movimientos
  useEffect(() => {
    const cachedSummary = localStorage.getItem('financeSummary');
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
          localStorage.setItem('financeSummary', JSON.stringify(summaryData));
        }

        setChartData(buildChartFromMovements(movements));
      } catch (error) {
        console.error("❌ Error en Finance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [todayDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        ⏳ Cargando Finanzas...
      </div>
    );
  }

  // 🔹 Cálculo de porcentaje de meta cumplida (seguro)
  const ingresos = Number(summary?.ingresos) || 0;
  const safeGoal = parseGoal(goal);
  const percentage = safeGoal > 0 ? Math.min((ingresos / safeGoal) * 100, 100) : 0;

  const circleRadius = 40;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const progress = circleCircumference - (percentage / 100) * circleCircumference;

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
              ${summary?.balanceMonth?.toLocaleString() || 0}
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
                  - ${summary?.egresos?.toLocaleString() || 0}
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
                <span className="text-lg font-bold">{Math.round(percentage)}%</span>
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
                onClick={() => navigate('/dashboard/agregar-movimiento')}
                className="flex items-center justify-center gap-2 text-xs bg-white text-black px-4 py-1.5 rounded-full font-semibold shadow hover:opacity-90 transition"
              >
                Agregar Movimiento
              </button>
            </div>
          </div>
        </div>

        {/* Panel: Alerta */}
        <div className="bg-[#991b1b] rounded-xl border border-red-800 p-5 shadow">
          <div className="flex items-center gap-2 mb-1 text-white">
            <AlertTriangle size={18} /> <span className="font-semibold">Shain</span>
          </div>
          <p className="text-sm">
            {summary?.egresos > ingresos
              ? 'Alerta: Los egresos están superando los ingresos.'
              : 'Todo en orden: los ingresos superan los egresos.'}
          </p>
          <p className="text-xs text-white/80 mt-1">Reporte del mes actual</p>
          <p className="text-xs text-white/60">
            {summary?.egresos > ingresos
              ? 'Se recomienda generar nuevos ingresos'
              : 'Continúa con la estrategia actual'}
          </p>
        </div>
      </div>

      {/* GRÁFICA */}
      <div className="bg-gradient-to-b from-[#0f172a] to-black rounded-xl border border-white/10 p-6 mb-6">
        <h3 className="text-sm font-semibold mb-4">Ingresos vs Egresos (últimos 30 días)</h3>
        {chartData.length > 0 ? (
          <Chart data={chartData} />
        ) : (
          <p className="text-center text-white/60">📊 Sin datos disponibles</p>
        )}
      </div>

      {/* Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <MiniCardChart
          title="Ingresos Totales"
          value={`$${ingresos.toLocaleString()}`}
          percent={5}
          color="green"
          data={chartData.map((d) => ({ value: d.Ingresos }))}
        />
        <MiniCardChart
          title="Gastos Totales"
          value={`-$${(summary?.egresos || 0).toLocaleString()}`}
          percent={-15}
          color="red"
          data={chartData.map((d) => ({ value: d.Egresos }))}
        />
        <MiniCardChart
          title="Margen de beneficio"
          value={`$${(ingresos - (summary?.egresos || 0)).toLocaleString()}`}
          percent={21}
          color="blue"
          data={chartData.map((d) => ({ value: d.Ingresos - d.Egresos }))}
        />
      </div>
    </div>
  );
};
