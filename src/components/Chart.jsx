import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const Chart = ({ data }) => {
  return (
    <div className="bg-white/5 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-semibold mb-4">
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F1F1F',
              border: 'none',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{
              color: '#fff',
              paddingTop: '20px',
            }}
          />
          <Line
            type="monotone"
            dataKey="Ingresos"
            stroke="#00FF00"
            fill="#00FF00"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Egresos"
            stroke="#FF0000"
            fill="#FF0000"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
