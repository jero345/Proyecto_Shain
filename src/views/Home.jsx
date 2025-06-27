// src/views/Home.jsx
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Pencil,
  ScrollText,
} from 'lucide-react';

export const Home = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-custom-gradient bg-cover p-6 text-white overflow-x-hidden">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-sm text-white/50">
            Hola Sebastian, este es tu resumen de 24 abr 2025
          </h2>
          <h1 className="text-2xl font-semibold mt-1">Resumen</h1>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 bg-gradientStart hover:bg-gradientMid1 px-4 py-2 rounded-md text-sm font-medium transition">
            <Plus size={16} /> Agregar Movimiento
          </button>
          <button className="flex items-center gap-1 border border-white/20 hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition">
            <ScrollText size={16} /> Ver Historial Financiero
          </button>
        </div>
      </div>

      {/* Balance e Ingresos/Egresos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gradientMid2 to-gradientMid1 p-5 rounded-xl shadow-lg col-span-2">
          <h2 className="text-sm text-purple-200 mb-1">Balance del día</h2>
          <div className="text-3xl font-bold text-green-400 mb-1">+$2.300</div>
          <p className="text-sm text-purple-300">
            +20% respecto ayer • Tus ventas incrementaron +$460
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-green-900/50 p-4 rounded-xl">
            <p className="text-xs text-green-300">Ingresos totales</p>
            <p className="text-xl font-semibold text-green-400">+$5.400.200,00</p>
          </div>
          <div className="bg-red-900/50 p-4 rounded-xl">
            <p className="text-xs text-red-300">Egresos totales</p>
            <p className="text-xl font-semibold text-red-400">-6.200.100,00</p>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="space-y-2 mb-6 text-sm">
        <div className="bg-red-500/20 px-4 py-2 rounded-md">
          🔴 <span className="font-medium">Hoy:</span> Los egresos superan los ingresos
        </div>
        <div className="bg-yellow-500/20 px-4 py-2 rounded-md">
          🟡 <span className="font-medium">Ayer:</span> Pocas unidades de pantalón beige talla L
        </div>
        <div className="bg-purple-500/20 px-4 py-2 rounded-md">
          🔄 <span className="font-medium">12 Jun:</span> Recomendación de actualizar a v2.0.17
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-white/5 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold mb-4">
          Ingresos vs Egresos (últimos 30 días)
        </h3>
        <div className="h-48 bg-white/10 rounded-md flex items-center justify-center text-white/30">
          [Aquí irá la gráfica]
        </div>
      </div>

      {/* Historial + Visuales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold">Historial</h3>
            <button className="text-white/60 hover:text-white/90 transition text-xs flex items-center gap-1">
              <Pencil size={14} /> Editar
            </button>
          </div>
          <ul className="space-y-2 text-sm">
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
              <span>$2.100.00</span>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-400">
                <ArrowDownRight size={16} /> Egreso
              </div>
              <span>$1.700.00</span>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-400">
                <ArrowDownRight size={16} /> Egreso
              </div>
              <span>$3.400.00</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
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
    </div>
  );
};