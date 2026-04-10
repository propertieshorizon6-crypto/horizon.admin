// Shared wrapper used by all chart components.

export default function DashboardChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#2D368E]">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function ChartSkeleton({ height = "h-48" }) {
  return (
    <div className={`${height} rounded-xl bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse`} />
  );
}
