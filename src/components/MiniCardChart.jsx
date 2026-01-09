import { AreaChart, Area, ResponsiveContainer } from "recharts";

export const MiniCardChart = ({ title, value, color = "green", icon, data = [] }) => {
  // Definir colores según el tipo
  const colorConfig = {
    green: {
      text: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      stroke: "#22c55e",
      fill: "url(#greenGradient)",
      iconBg: "bg-green-500/20",
    },
    red: {
      text: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      stroke: "#ef4444",
      fill: "url(#redGradient)",
      iconBg: "bg-red-500/20",
    },
    blue: {
      text: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      stroke: "#3b82f6",
      fill: "url(#blueGradient)",
      iconBg: "bg-blue-500/20",
    },
    purple: {
      text: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      stroke: "#a855f7",
      fill: "url(#purpleGradient)",
      iconBg: "bg-purple-500/20",
    },
    yellow: {
      text: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      stroke: "#eab308",
      fill: "url(#yellowGradient)",
      iconBg: "bg-yellow-500/20",
    },
  };

  const colors = colorConfig[color] || colorConfig.green;

  // Asegurar que hay datos para la gráfica
  const chartData = data.length > 0 ? data : [{ value: 0 }, { value: 0 }];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} p-4 sm:p-5 transition-all hover:scale-[1.02] hover:shadow-lg`}
    >
      {/* Icono */}
      <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full ${colors.iconBg} flex items-center justify-center`}>
        <span className={colors.text}>{icon}</span>
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        <p className="text-xs sm:text-sm text-white/60 mb-1 pr-10">{title}</p>
        <p className={`text-xl sm:text-2xl font-bold ${colors.text} mb-3`}>{value}</p>
      </div>

      {/* Mini gráfica */}
      <div className="h-12 sm:h-16 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eab308" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.stroke}
              strokeWidth={2}
              fill={colors.fill}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MiniCardChart;