import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Componente personalizado para el Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F1F1F] border border-white/10 rounded-lg p-3 shadow-lg">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <span 
              className="font-semibold"
              style={{ color: entry.color }}
            >
              {entry.name}:
            </span>
            <span className="text-white font-medium">
              ${Number(entry.value).toLocaleString('es-CO')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Formatear números en el eje Y con separadores de miles
const formatYAxis = (value) => {
  return `$${Number(value).toLocaleString('es-CO')}`;
};

// Formatear números con separadores de miles
const formatMoney = (value) => {
  return Number(value || 0).toLocaleString('es-CO');
};

export const Chart = ({ data }) => {
  // Calcular totales del mes
  const totals = (data || []).reduce(
    (acc, item) => {
      acc.ingresos += Number(item.Ingresos || 0);
      acc.egresos += Number(item.Egresos || 0);
      return acc;
    },
    { ingresos: 0, egresos: 0 }
  );

  return (
    <div className="bg-white/5 rounded-xl p-3 mb-6">
      <h3 className="text-sm font-semibold mb-3">
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
          <defs>
            {/* Gradiente para Ingresos (verde) */}
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FF00" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00FF00" stopOpacity={0.1}/>
            </linearGradient>
            {/* Gradiente para Egresos (rojo) */}
            <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF0000" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#FF0000" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis 
            stroke="#ccc" 
            tickFormatter={formatYAxis}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Ingresos"
            stroke="#00FF00"
            fillOpacity={1}
            fill="url(#colorIngresos)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Egresos"
            stroke="#FF0000"
            fillOpacity={1}
            fill="url(#colorEgresos)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Leyenda personalizada con totales del mes */}
      <div className="flex justify-center items-center gap-6 sm:gap-8 mt-4 pt-3 border-t border-white/10">
        {/* Ingresos */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00FF00' }}></div>
          <span className="text-white/80 text-sm">Ingresos</span>
          <span className="font-semibold text-sm" style={{ color: '#00FF00' }}>
            ${formatMoney(totals.ingresos)}
          </span>
        </div>
        
        {/* Egresos */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF0000' }}></div>
          <span className="text-white/80 text-sm">Egresos</span>
          <span className="font-semibold text-sm" style={{ color: '#FF0000' }}>
            ${formatMoney(totals.egresos)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Chart;