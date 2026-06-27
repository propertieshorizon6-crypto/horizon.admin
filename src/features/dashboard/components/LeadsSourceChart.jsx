// 📁 src/features/dashboard/components/LeadsSourceChart.jsx
// Props: data = [{ day, App, Website, Call, Whatsapp }]

import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import DashboardChartCard from "./DashboardChartCard";


const SOURCES = [
  { key: "Website",  color: "#f97316", gradId: "src-web"  },
  { key: "App",      color: "#000000", gradId: "src-app"  },
];

export default function LeadsSourceChart({ data = [] }) {
  return (
    <DashboardChartCard title="Leads by Source" subtitle="Last 7 days">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            {SOURCES.map(({ gradId, color }) => (
              <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} />
          {SOURCES.map(({ key, color, gradId }) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              fill={`url(#${gradId})`}
              strokeWidth={key === "Website" ? 2.5 : 2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: "#64748b", paddingTop: 8 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </DashboardChartCard>
  );
}

const tooltipStyle = {
  background: "#2D368E",
  border: "none",
  borderRadius: 8,
  fontSize: 12,
  color: "#f1f5f9",
};
