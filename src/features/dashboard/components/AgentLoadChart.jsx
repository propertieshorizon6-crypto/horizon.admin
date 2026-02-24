// 📁 src/features/dashboard/components/AgentLoadChart.jsx
// Props: data = [{ name, leads }]

import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, ResponsiveContainer,
} from "recharts";
import DashboardChartCard from "./DashboardChartCard";

const TOP_N = 5; // top 5 get orange, rest get dark blue

export default function AgentLoadChart({ data = [] }) {
  return (
    <DashboardChartCard title="Agent Lead Load" subtitle="Active leads per agent">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 14, left: 14, bottom: 0 }}
          barSize={10}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            stroke="#f1f5f9"
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 30]}
            ticks={[0, 7, 14, 21, 28]}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={58}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgba(249,115,22,0.06)" }}
          />
          <Bar dataKey="leads" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i < TOP_N ? "#f97316" : "#1e3a5f"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
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
