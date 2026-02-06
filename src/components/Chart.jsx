import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useState, useEffect, useMemo } from 'react';

// Validar y sanitizar un valor numérico
const sanitizeNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? 0 : num;
};

// Validar y normalizar los datos del chart
const validateChartData = (data) => {
  if (!Array.isArray(data)) return [];

  return data
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      date: item.date || 'Sin fecha',
      Ingresos: sanitizeNumber(item.Ingresos),
      Egresos: sanitizeNumber(item.Egresos),
    }));
};

// Componente personalizado para el Tooltip (ajustado para móvil)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F1F1F] border border-white/10 rounded-lg p-2 sm:p-3 shadow-lg text-xs sm:text-sm">
        <p className="text-white font-semibold mb-1 sm:mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-1 sm:gap-2 mb-1">
            <span
              className="font-semibold"
              style={{ color: entry.color }}
            >
              {entry.name}:
            </span>
            <span className="text-white font-medium">
              ${sanitizeNumber(entry.value).toLocaleString('es-CO')}
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
  return `$${sanitizeNumber(value).toLocaleString('es-CO')}`;
};

// Formatear números con separadores de miles
const formatMoney = (value) => {
  return sanitizeNumber(value).toLocaleString('es-CO');
};

export const Chart = ({ data }) => {
  // Validar y normalizar datos
  const validatedData = useMemo(() => validateChartData(data), [data]);

  // Calcular totales del mes (memoizado)
  const totals = useMemo(() => {
    return validatedData.reduce(
      (acc, item) => {
        acc.ingresos += item.Ingresos;
        acc.egresos += item.Egresos;
        return acc;
      },
      { ingresos: 0, egresos: 0 }
    );
  }, [validatedData]);

  // Detectar si es móvil (opcional: puedes usar useMediaQuery de @mui o similar)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Móvil: menos de 768px
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Altura dinámica según dispositivo
  const chartHeight = isMobile ? 250 : 350;

  // Márgenes dinámicos
  const chartMargin = isMobile
    ? { top: 5, right: 15, left: 15, bottom: 5 }
    : { top: 10, right: 30, left: 20, bottom: 0 };

  return (
    <div className="bg-white/5 rounded-xl p-2 sm:p-3 mb-6">
      <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
        {/* Puedes agregar título aquí si lo necesitas */}
      </h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={validatedData} margin={chartMargin}>
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
          <XAxis dataKey="date" stroke="#ccc" fontSize={isMobile ? 10 : 12} />
          <YAxis 
            stroke="#ccc" 
            tickFormatter={formatYAxis}
            width={isMobile ? 60 : 100}
            fontSize={isMobile ? 10 : 12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Ingresos"
            stroke="#00FF00"
            fillOpacity={1}
            fill="url(#colorIngresos)"
            strokeWidth={isMobile ? 1.5 : 2}
          />
          <Area
            type="monotone"
            dataKey="Egresos"
            stroke="#FF0000"
            fillOpacity={1}
            fill="url(#colorEgresos)"
            strokeWidth={isMobile ? 1.5 : 2}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Leyenda personalizada con totales del mes */}
      <div className={`flex ${isMobile ? 'flex-col' : 'justify-center'} items-center gap-2 sm:gap-6 mt-3 pt-2 border-t border-white/10`}>
        {/* Ingresos */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00FF00' }}></div>
          <span className="text-white/80 text-xs sm:text-sm">Ingresos</span>
          <span className="font-semibold text-xs sm:text-sm" style={{ color: '#00FF00' }}>
            ${formatMoney(totals.ingresos)}
          </span>
        </div>
        
        {/* Egresos */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF0000' }}></div>
          <span className="text-white/80 text-xs sm:text-sm">Egresos</span>
          <span className="font-semibold text-xs sm:text-sm" style={{ color: '#FF0000' }}>
            ${formatMoney(totals.egresos)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Chart;