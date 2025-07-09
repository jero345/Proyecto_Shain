import {
  ArrowUpRight,
  Plus,
  ScrollText,
  Home as HomeIcon,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Chart } from '@components/Chart';
import { MiniCardChart } from '@components/MiniCardChart';

export const Home = () => {
  const navigate = useNavigate();

  // Datos de prueba
  const chartData = [
    { date: '1 Jun', Ingresos: 2500, Egresos: 1200 },
    { date: '2 Jun', Ingresos: 3000, Egresos: 1500 },
    { date: '3 Jun', Ingresos: 2800, Egresos: 2000 },
    { date: '4 Jun', Ingresos: 3200, Egresos: 2500 },
    { date: '5 Jun', Ingresos: 2900, Egresos: 2100 },
  ];

  const ingresosData = [{ value: 1200 }, { value: 1500 }, { value: 2000 }, { value: 1800 }, { value: 2200 }];
  const gastosData = [{ value: 700 }, { value: 900 }, { value: 1200 }, { value: 1500 }, { value: 1400 }];
  const margenData = [{ value: 300 }, { value: 400 }, { value: 350 }, { value: 500 }, { value: 450 }];

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
              <h2 className="text-4xl font-extrabold text-lime-300">+$2.300</h2>
            </div>
            <div className="flex flex-col text-right ml-4">
              <div className="flex items-center justify-end gap-1 text-green-300 text-sm mb-1">
                <ArrowUpRight size={16} /> +20% respecto ayer
              </div>
              <p className="text-green-300 text-sm">Tus ventas incrementaron $460</p>
            </div>
          </div>
          <div className="bg-black/20 p-6 rounded-xl border border-white/10 flex flex-col justify-center">
            <p className="text-green-400 font-bold mb-1">Ingresos totales</p>
            <p className="text-3xl font-bold text-green-300 mb-4">+$5.400.200,00</p>
            <p className="text-red-400 font-bold mb-1">Egresos totales</p>
            <p className="text-3xl font-bold text-red-300">-$6.200.100,00</p>
          </div>
        </div>

        {/* Botones acción */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard/agregar-movimiento')}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 text-white px-5 py-2 rounded-full text-sm font-semibold transition"
          >
            <Plus size={16} /> Agregar Movimiento
          </button>
          <button
            onClick={() => navigate('/dashboard/historial')}
            className="flex items-center gap-2 border border-white/30 hover:bg-white/10 px-5 py-2 rounded-full text-sm font-semibold transition"
          >
            <ScrollText size={16} /> Ver Historial Financiero
          </button>
        </div>

        {/* 🔔 Notificaciones */}
        <h2 className="text-base font-bold mb-3">Notificaciones</h2>
        {/* ... tus notificaciones aquí ... */}

        {/* Gráfica */}
        <div className="mt-10">
          <h3 className="text-sm font-bold mb-2">Ingresos vs Egresos</h3>
          <div className="bg-black/20 rounded-xl p-6">
            <Chart data={chartData} />
          </div>
        </div>

        {/* MiniCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          <MiniCardChart
            title="Ingresos Totales"
            value="$5.4k"
            percent={5}
            color="green"
            icon={<TrendingUp size={14} />}
            data={ingresosData}
          />
          <MiniCardChart
            title="Gastos Totales"
            value="-$7.1k"
            percent={-15}
            color="red"
            icon={<TrendingDown size={14} />}
            data={gastosData}
          />
          <MiniCardChart
            title="Margen de beneficio"
            value="$1.2k"
            percent={21}
            color="cyan"
            icon={<RefreshCcw size={14} />}
            data={margenData}
          />
        </div>
      </div>
    </div>
  );
};
