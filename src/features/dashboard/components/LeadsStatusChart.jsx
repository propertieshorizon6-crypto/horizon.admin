// 📁 src/features/dashboard/components/LeadsStatusChart.jsx
// Props: data = [{ name, value, color }]

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from "recharts";
import DashboardChartCard from "./DashboardChartCard";

function DonutCenter({ viewBox, total }) {
  if (!viewBox || typeof viewBox.cx !== "number" || typeof viewBox.cy !== "number") {
    return null;
  }

  const { cx, cy } = viewBox;
  return (
    <>
      <text
        x={cx} y={cy - 6}
        textAnchor="middle"
        fill="#0f172a"
        fontSize={26}
        fontWeight={900}
      >
        {total}
      </text>
      <text
        x={cx} y={cy + 16}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={12}
        fontWeight={500}
      >
        Total
      </text>
    </>
  );
}

export default function LeadsStatusChart({ data = [] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <DashboardChartCard title="Leads by Status" subtitle="Current distribution">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <Label content={(props) => <DonutCenter viewBox={props?.viewBox} total={total} />} />
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: color }}
            />
            <span className="text-xs text-slate-500 font-medium">{name}</span>
            <span className="text-xs text-slate-700 font-bold ml-auto">{value}</span>
          </div>
        ))}
      </div>
    </DashboardChartCard>
  );
}

const tooltipStyle = {
  background: "#1e293b",
  border: "none",
  borderRadius: 8,
  fontSize: 12,
  color: "#f1f5f9",
};
