// src/components/Chart.jsx

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area
} from 'recharts';

export const Chart = ({ data }) => {
  return (
    <div className="bg-white/5 dark:bg-gray-900/10 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-semibold mb-4">
        Ingresos vs Egresos (últimos 30 días)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="date" stroke="#999" />
          <YAxis stroke="#999" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="ingresos"
            stroke="#22c55e"
            fillOpacity={1}
            fill="url(#colorIngresos)"
          />
          <Line
            type="monotone"
            dataKey="egresos"
            stroke="#ef4444"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex justify-end gap-4 mt-2 text-xs">
        <span className="text-green-400">+Ingresos</span>
        <span className="text-red-400">-Egresos</span>
      </div>
    </div>
  );
};
