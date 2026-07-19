/**
 * ChartWrapper — Recharts components with theme-aware styling
 */
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#8DB600', '#A0522D', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const customTooltipStyle = {
  backgroundColor: 'var(--pb-surface)',
  border: '1px solid var(--pb-border)',
  borderRadius: '12px',
  padding: '8px 12px',
  fontSize: '12px',
  color: 'var(--pb-text)',
};

export function SalesAreaChart({ data, dataKey = 'revenue', xKey = 'date', height = 300, title }) {
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
      {title && <h3 className="text-sm font-bold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8DB600" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8DB600" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--pb-border)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'var(--pb-text-secondary)' }} tickFormatter={v => v.slice(5)} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--pb-text-secondary)' }} />
          <Tooltip contentStyle={customTooltipStyle} />
          <Area type="monotone" dataKey={dataKey} stroke="#8DB600" fill="url(#salesGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersBarChart({ data, height = 300, title }) {
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
      {title && <h3 className="text-sm font-bold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--pb-border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--pb-text-secondary)' }} tickFormatter={v => v.slice(5)} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--pb-text-secondary)' }} />
          <Tooltip contentStyle={customTooltipStyle} />
          <Bar dataKey="orders" fill="#8DB600" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({ data, height = 300, title }) {
  const chartData = data?.map(d => ({ name: d._id || d.category, value: d.revenue || d.count || 0 })) || [];
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
      {title && <h3 className="text-sm font-bold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={customTooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusBreakdownChart({ data, height = 300, title }) {
  const chartData = data?.map(d => ({ name: d._id, count: d.count })) || [];
  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
      {title && <h3 className="text-sm font-bold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--pb-border)" />
          <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--pb-text-secondary)' }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'var(--pb-text-secondary)' }} width={120} />
          <Tooltip contentStyle={customTooltipStyle} />
          <Bar dataKey="count" fill="#A0522D" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
