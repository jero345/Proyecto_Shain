// src/components/MiniCardChart.jsx
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

export const MiniCardChart = ({ title, value, percent, color, icon, data }) => {
  return (
    <div className="bg-white/5 p-4 rounded-xl flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className={`flex items-center gap-1 text-${color}-400`}>
            {icon}
            <h4 className="text-xs font-semibold">{title}</h4>
          </div>
          <div className="text-sm font-semibold">{value}</div>
          <div className={`text-xs ${percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {percent >= 0 ? '+' : ''}{percent}%
          </div>
        </div>
      </div>

      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`#22c55e`} stopOpacity={0.8} />
                <stop offset="95%" stopColor={`#22c55e`} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke={`#22c55e`} // Puedes mapear por color dinámico
              fill={`url(#gradient-${color})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
