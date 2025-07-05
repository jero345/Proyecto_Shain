import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  ScrollText,
} from 'lucide-react';

export const Finance = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 text-white">
      {/* Header & Acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Finanzas</h1>
          <p className="text-sm text-white/60">Control diario y metas mensuales</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="flex items-center gap-1 bg-gradientStart hover:bg-gradientMid1 px-4 py-2 rounded-md text-sm font-medium transition">
            <Plus size={16} /> Agregar Movimiento
          </button>
          <button className="flex items-center gap-1 border border-white/20 hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition">
            <ScrollText size={16} /> Ver Historial Financiero
          </button>
        </div>
      </div>

      {/* Resumen Diario + Meta + Alerta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Panel Resumen Diario */}
        <div className="bg-white/5 rounded-xl p-5 lg:col-span-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
            <div>
              <p className="text-sm text-white/60 mb-1">Resumen del día (24 jun 2025)</p>
              <h2 className="text-3xl font-bold">$2,550.00</h2>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-green-300">Ingresos: $2,550.00</p>
              <p className="text-sm text-red-300">Egresos: $1,200.00</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-purple-200 mb-1">Meta Mensual</p>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full w-[75%]" />
            </div>
            <p className="text-xs text-white/70 mt-1">75% completado</p>
          </div>
        </div>

        {/* Panel de Alerta */}
        <div className="bg-red-500/10 p-4 rounded-xl flex flex-col gap-1">
          <div className="flex items-center gap-2 text-red-400 font-semibold">
            <AlertTriangle size={18} /> Alerta financiera
          </div>
          <p className="text-sm text-white/80 mt-1">
            Tus egresos están superando tus ingresos desde el <strong>11 Jun 2025</strong>.
          </p>
          <p className="text-sm text-white/60">Te recomendamos generar nuevos ingresos.</p>
        </div>
      </div>

      {/* Gráfica Placeholder */}
      <div className="bg-white/5 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold mb-4">
          Ingresos vs Egresos (últimos 15 días)
        </h3>
        <div className="h-48 bg-white/10 rounded-md flex items-center justify-center text-white/30 text-sm">
          [Gráfico interactivo aquí]
        </div>
      </div>

      {/* Alertas Complementarias */}
      <div className="space-y-2 mb-6 text-sm">
        <div className="bg-red-500/20 px-4 py-2 rounded-md">
          🔴 <span className="font-medium">Hoy:</span> Los egresos superan los ingresos.
        </div>
        <div className="bg-yellow-500/20 px-4 py-2 rounded-md">
          🟡 <span className="font-medium">Ayer:</span> Pocas unidades de pantalón beige talla L.
        </div>
        <div className="bg-purple-500/20 px-4 py-2 rounded-md">
          🔄 <span className="font-medium">12 Jun:</span> Actualiza a la versión <code>v2.0.17</code>
        </div>
      </div>

      {/* Historial Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-4 overflow-x-auto">
          <h3 className="text-sm font-semibold mb-3">Últimos movimientos</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-green-400">
                <ArrowUpRight size={16} /> Ingreso
              </div>
              <span>$1,200.00</span>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-400">
                <ArrowDownRight size={16} /> Egreso
              </div>
              <span>$900.00</span>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-green-400">
                <ArrowUpRight size={16} /> Ingreso
              </div>
              <span>$1,350.00</span>
            </li>
          </ul>
        </div>

        {/* Panel resumen visual */}
        <div className="flex flex-col gap-4">
          <div className="bg-white/5 p-4 rounded-xl">
            <h4 className="text-xs text-green-300">Ingreso promedio</h4>
            <div className="h-20 bg-green-400/20 rounded mt-2" />
          </div>
          <div className="bg-white/5 p-4 rounded-xl">
            <h4 className="text-xs text-red-300">Egreso promedio</h4>
            <div className="h-20 bg-red-400/20 rounded mt-2" />
          </div>
          <div className="bg-white/5 p-4 rounded-xl">
            <h4 className="text-xs text-yellow-300">Tendencia financiera</h4>
            <div className="h-20 bg-yellow-400/20 rounded mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
};
