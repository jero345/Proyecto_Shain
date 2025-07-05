import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ScrollText,
  Pencil,
} from 'lucide-react';

import { Chart } from '@components/Chart'; // 👈 Asegúrate de importar bien tu componente Chart

// Datos simulados para la gráfica
const mockData = [
  { date: '19 May', ingresos: 8000, egresos: 2800 },
  { date: '22 May', ingresos: 4000, egresos: 1200 },
  { date: '28 May', ingresos: 3500, egresos: 3100 },
  { date: '31 May', ingresos: 2000, egresos: 2200 },
  { date: '3 Jun', ingresos: 3300, egresos: 1500 },
  { date: '6 Jun', ingresos: 2800, egresos: 3200 },
  { date: '9 Jun', ingresos: 4100, egresos: 2500 },
  { date: '12 Jun', ingresos: 1000, egresos: 4000 },
  { date: '15 Jun', ingresos: 3200, egresos: 2000 },
];

export const Home = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 text-white bg-zinc-900">
      {/* Encabezado */}
      <div className="mb-6 space-y-1">
        <p className="text-sm text-white/60">
          Hola Sebastian, este es tu resumen de 24 abr 2025
        </p>
        <h1 className="text-2xl font-bold">Resumen</h1>
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button className="flex items-center justify-center gap-2 bg-gradientStart hover:bg-gradientMid1 px-4 py-2 rounded-md text-sm font-medium transition">
          <Plus size={16} /> Agregar Movimiento
        </button>
        <button className="flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition">
          <ScrollText size={16} /> Ver Historial Financiero
        </button>
      </div>

      {/* Balance del día */}
      <div className="bg-gradient-to-br from-gradientMid2 to-gradientMid1 p-5 rounded-xl shadow-lg mb-4">
        <h2 className="text-sm text-purple-200 mb-1">Balance del día</h2>
        <div className="text-3xl font-bold text-green-400 mb-1">+$2,300</div>
        <p className="text-sm text-purple-300">
          +20% respecto ayer • Tus ventas incrementaron +$460
        </p>
      </div>

      {/* Ingresos totales */}
      <div className="bg-green-900/50 p-4 rounded-xl mb-6">
        <p className="text-xs text-green-300">Ingresos totales</p>
        <p className="text-xl font-semibold text-green-400">
          +$5,400,200.00
        </p>
      </div>

      {/* Notificaciones */}
      <div className="space-y-2 mb-6 text-sm">
        <div className="bg-red-500/20 px-4 py-2 rounded-md">
          🔴 <span className="font-medium">Hoy:</span> Los egresos superan los ingresos.
        </div>
        <div className="bg-yellow-500/20 px-4 py-2 rounded-md">
          🟡 <span className="font-medium">Ayer:</span> Pocas unidades de pantalón beige talla L.
        </div>
        <div className="bg-purple-500/20 px-4 py-2 rounded-md">
          🔄 <span className="font-medium">12 Jun:</span> Recomendación de actualizar a v2.0.17
        </div>
      </div>

      {/* Gráfica dinámica */}
      <Chart data={mockData} />

      {/* Movimientos recientes */}
      <div className="bg-white/5 rounded-xl p-4 mb-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h3 className="text-sm font-semibold">Movimientos recientes</h3>
          <button className="text-white/60 hover:text-white/90 transition text-xs flex items-center gap-1">
            <Pencil size={14} /> Editar
          </button>
        </div>
        <ul className="space-y-2 text-sm min-w-[300px]">
          <li className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-green-400">
              <ArrowUpRight size={16} /> Ingreso
            </div>
            <span>$300.00</span>
          </li>
          <li className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-green-400">
              <ArrowUpRight size={16} /> Ingreso
            </div>
            <span>$2,100.00</span>
          </li>
          <li className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-red-400">
              <ArrowDownRight size={16} /> Egreso
            </div>
            <span>$1,700.00</span>
          </li>
          <li className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-red-400">
              <ArrowDownRight size={16} /> Egreso
            </div>
            <span>$3,400.00</span>
          </li>
        </ul>
      </div>

      {/* Resumen visual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white/5 p-4 rounded-xl">
          <h4 className="text-xs text-green-300">Ingresos Totales</h4>
          <div className="h-20 bg-green-400/20 rounded mt-2" />
        </div>
        <div className="bg-white/5 p-4 rounded-xl">
          <h4 className="text-xs text-red-300">Gastos Totales</h4>
          <div className="h-20 bg-red-400/20 rounded mt-2" />
        </div>
        <div className="bg-white/5 p-4 rounded-xl">
          <h4 className="text-xs text-purple-300">Margen de Beneficio</h4>
          <div className="h-20 bg-purple-400/20 rounded mt-2" />
        </div>
      </div>
    </div>
  );
};
