export default function StatsCard({ icon, label, value, pct, up }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm border-l-4 border-l-orange-500">
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg">
          {icon}
        </div>
        {/* Badge */}
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            up
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {up ? "↑" : "↓"} {pct}
        </span>
      </div>

      <p className="text-3xl font-black text-[#2D368E] leading-none">{value}</p>
      <p className="text-xs text-slate-400 font-medium mt-1.5">{label}</p>
    </div>
  );
}


