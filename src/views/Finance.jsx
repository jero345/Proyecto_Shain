import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AlertTriangle, BarChart } from 'lucide-react';
import { Chart } from '@components/Chart';
import { MiniCardChart } from '@components/MiniCardChart';

export const Finance = () => {
  const navigate = useNavigate();

  // 👉 Simula ingresos totales del mes (ajústalo a tu lógica real)
  const totalIngresos = 4200;

  // ✅ Lee meta mensual guardada
  const [goal, setGoal] = useState(5000);

  useEffect(() => {
    const savedBusiness = JSON.parse(localStorage.getItem('business'));
    if (savedBusiness?.goal) {
      setGoal(Number(savedBusiness.goal));
    }
  }, []);

  // ✅ Calcula porcentaje completado
  const percentage = goal > 0 ? Math.min((totalIngresos / goal) * 100, 100) : 0;
  const circleRadius = 35;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const progress = circleCircumference - (percentage / 100) * circleCircumference;

  const chartData = [
    { date: '1 Jun', Ingresos: 2200, Egresos: 1800 },
    { date: '2 Jun', Ingresos: 2500, Egresos: 2000 },
    { date: '3 Jun', Ingresos: 2300, Egresos: 2100 },
    { date: '4 Jun', Ingresos: 2800, Egresos: 2300 },
    { date: '5 Jun', Ingresos: 3000, Egresos: 2500 },
    { date: '6 Jun', Ingresos: 2700, Egresos: 2600 },
    { date: '7 Jun', Ingresos: 2900, Egresos: 2400 },
  ];

  const miniCardData = [
    {
      title: 'Ingresos Totales',
      amount: `$${(totalIngresos / 1000).toFixed(1)}k`,
      percentage: '+5%',
      data: [2000, 2400, 2100, 2800, 2500, 2900, 3200],
      color: 'green',
    },
    {
      title: 'Gastos Totales',
      amount: '-$7,100k',
      percentage: '-15%',
      data: [1800, 2200, 2500, 2700, 3000, 3300, 3500],
      color: 'red',
    },
    {
      title: 'Margen de Beneficio',
      amount: '$1,200k',
      percentage: '+21%',
      data: [500, 700, 800, 1200, 1400, 1600, 2000],
      color: 'blue',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10 text-white">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-8">
        <BarChart size={16} className="text-white/70" />
        <h1 className="text-lg font-semibold text-white/80">Finanzas</h1>
      </div>

      {/* GRID: Resumen + Meta + Alerta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Panel: Resumen + Meta */}
        <div className="flex flex-col md:flex-row justify-between lg:col-span-2 bg-[#0f172a] rounded-xl border border-white/10 p-6 shadow gap-6">
          {/* Izquierda: Resumen */}
          <div>
            <h2 className="text-4xl font-bold mb-1">
              ${totalIngresos.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-white/70 mb-4">Total hoy</p>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-green-400 text-sm font-semibold">
                  + ${totalIngresos.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-white/50">Ingresos</span>
              </div>
              <div className="flex flex-col">
                <span className="text-red-400 text-sm font-semibold">- $1,200.00</span>
                <span className="text-xs text-white/50">Egresos</span>
              </div>
            </div>
          </div>

          {/* Derecha: Meta Mensual */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r={circleRadius}
                  strokeWidth="6"
                  stroke="#1f2937"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
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
                ${goal.toLocaleString()}
              </p>
              <p className="text-xs text-white/50 leading-snug mb-3">
                Tu meta mensual actual.
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
          <p className="text-sm">Alerta: Los egresos están superando los ingresos.</p>
          <p className="text-xs text-white/80 mt-1">Reporte desde 11 Jun 2025</p>
          <p className="text-xs text-white/60">Se recomienda generar nuevos ingresos</p>
        </div>
      </div>

      {/* GRÁFICA */}
      <div className="bg-gradient-to-b from-[#0f172a] to-black rounded-xl border border-white/10 p-6 mb-6">
        <h3 className="text-sm font-semibold mb-4">Ingresos vs Egresos</h3>
        <div className="flex gap-6 text-xs mb-4">
          <button className="text-white underline">Últimos 15 días</button>
          <button className="text-white/50 hover:text-white">Últimos 30 días</button>
          <button className="text-white/50 hover:text-white">Últimos 90 días</button>
        </div>
        <Chart data={chartData} />
      </div>

      {/* Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {miniCardData.map((card, idx) => (
          <MiniCardChart
            key={idx}
            title={card.title}
            amount={card.amount}
            percentage={card.percentage}
            data={card.data}
            color={card.color}
          />
        ))}
      </div>

      {/* Otras Notificaciones */}
      <h4 className="text-sm font-semibold mb-2">Otras Notificaciones</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center bg-[#991b1b] px-4 py-2 rounded">
          <span>❗ Alerta: los egresos superan los ingresos</span>
          <span className="text-xs text-white/70">Hoy</span>
        </div>
        <div className="flex justify-between items-center bg-[#991b1b] px-4 py-2 rounded">
          <span>❗ Alerta: pocas unidades de pantalón beige talla L</span>
          <span className="text-xs text-white/70">Ayer</span>
        </div>
      </div>
    </div>
  );
};
