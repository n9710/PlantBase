/**
 * DashboardCard — Reusable stat card with animated counter
 */
import { useState, useEffect } from 'react';

export default function DashboardCard({ title, value, icon: Icon, trend, trendUp, prefix = '', suffix = '', color = 'var(--pb-accent)' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const num = typeof value === 'number' ? value : parseInt(value) || 0;
    if (num === 0) { setDisplay(0); return; }
    const duration = 800;
    const steps = 30;
    const increment = num / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) { setDisplay(num); clearInterval(timer); }
      else setDisplay(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="rounded-2xl border p-5 card-lift" style={{ backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20`, color }}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'text-green-600' : 'text-red-500'}`}
            style={{ backgroundColor: trendUp ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold">{prefix}{typeof value === 'number' ? display.toLocaleString('en-IN') : value}{suffix}</p>
      <p className="text-xs mt-1 font-medium" style={{ color: 'var(--pb-text-secondary)' }}>{title}</p>
    </div>
  );
}
