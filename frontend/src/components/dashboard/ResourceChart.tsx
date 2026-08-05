import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MetricPoint } from '@/types/domain';

interface ResourceChartProps {
  title: string;
  data: MetricPoint[];
  dataKey: keyof MetricPoint;
  color: string;
}

const ResourceChart = ({ title, data, dataKey, color }: ResourceChartProps) => (
  <div className="card p-4">
    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{title}</p>
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`grad-${String(dataKey)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
        <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
        <Tooltip />
        <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#grad-${String(dataKey)})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default ResourceChart;
