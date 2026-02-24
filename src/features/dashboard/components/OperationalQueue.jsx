// 📁 src/features/dashboard/components/OperationalQueue.jsx
// Props: queue = [{ id, name, priority, property, source, elapsed, status }]
// Uses @tanstack/react-table for table logic
// Tabs: Unassigned | Overdue | Stale — with counts

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

// ── Priority badge config ─────────────────────────────────────────────────
const PRIORITY = {
  high:   { bg: "bg-red-100",    text: "text-red-700",    label: "high"   },
  medium: { bg: "bg-amber-100",  text: "text-amber-700",  label: "medium" },
  low:    { bg: "bg-green-100",  text: "text-green-700",  label: "low"    },
};

// ── Tab config ─────────────────────────────────────────────────────────────
const TABS = ["unassigned", "overdue", "stale"];

const TAB_ICON = {
  unassigned: "👤",
  overdue:    "🕐",
  stale:      "🕐",
};

const columnHelper = createColumnHelper();

export default function OperationalQueue({ queue = [] }) {
  const [activeTab, setActiveTab] = useState("unassigned");

  // Count per tab
  const counts = useMemo(() =>
    TABS.reduce((acc, tab) => {
      acc[tab] = queue.filter((r) => r.status === tab).length;
      return acc;
    }, {}),
    [queue]
  );

  // Filtered rows by active tab
  const filteredData = useMemo(
    () => queue.filter((r) => r.status === activeTab),
    [queue, activeTab]
  );

  // ── Column definitions ──────────────────────────────────────────────────
  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "",
      cell: (info) => {
        const row = info.row.original;
        const p   = PRIORITY[row.priority] ?? PRIORITY.low;
        return (
          <div>
            {/* Name + priority badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900">{row.name}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}>
                {p.label}
              </span>
            </div>
            {/* Property • Source • Time */}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 flex-wrap">
              <span className="text-slate-500 font-medium">{row.property}</span>
              <span>•</span>
              <span>{row.source}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <span>🕐</span>
                {row.elapsed}
              </span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("id", {
      header: "",
      cell: () => (
        <button className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors whitespace-nowrap">
          Assign →
        </button>
      ),
      size: 80,
    }),
  ], []);

  const table = useReactTable({
    data:             filteredData,
    columns,
    getCoreRowModel:  getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-50">
        <h3 className="text-sm font-bold text-slate-900">Operational Queues</h3>
        <p className="text-xs text-slate-400 mt-0.5">Leads requiring attention</p>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              <span>{TAB_ICON[tab]}</span>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold min-w-[18px] text-center ${
                isActive ? "bg-white text-slate-900" : "bg-slate-200 text-slate-600"
              }`}>
                {counts[tab] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* TanStack Table */}
      <div className="overflow-y-auto max-h-[320px]">
        {table.getRowModel().rows.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">
            No {activeTab} leads
          </div>
        ) : (
          <table className="w-full">
            <tbody className="divide-y divide-slate-50">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4"
                      style={
                        cell.column.columnDef.size
                          ? { width: cell.column.columnDef.size }
                          : {}
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}