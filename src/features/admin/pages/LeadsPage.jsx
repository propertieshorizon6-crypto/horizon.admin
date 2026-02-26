// 📁 src/features/admin/pages/LeadsPage.jsx
// Uses @tanstack/react-table
// npm install @tanstack/react-table

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { MoreHorizontal, Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import useLeads from "../hooks/useLeads";

// ── Helpers ────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff  = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ── Badge configs ──────────────────────────────────────────────────────────
const STATUS_STYLE = {
  "New":         { bg: "#1e3a5f", color: "#fff"    },
  "Assigned":    { bg: "#1e3a5f", color: "#fff"    },
  "In Progress": { bg: "#1e3a5f", color: "#fff"    },
  "Closed":      { bg: "#334155", color: "#fff"    },
  "Archived":    { bg: "#e2e8f0", color: "#64748b" },
};

const STATUS_DOT = {
  "New":         "#38bdf8",
  "Assigned":    "#f97316",
  "In Progress": "#f59e0b",
  "Closed":      "#22c55e",
  "Archived":    "#94a3b8",
};

const PRIORITY_STYLE = {
  "High":   { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  "Medium": { bg: "#fff7ed", color: "#ea580c", border: "#fdba74" },
  "Low":    { bg: "#f0fdf4", color: "#16a34a", border: "#86efac" },
};

const SOURCE_ICON = {
  Website:  "🌐",
  App:      "📱",
  Whatsapp: "💬",
  Call:     "📞",
};

const INTENT_ICON = {
  Inquiry: "✉",
  Tour:    "📅",
  Call:    "📞",
  Message: "💬",
};

const TABS = ["All", "New", "Assigned", "In Progress", "Closed", "Archived"];

const columnHelper = createColumnHelper();

export default function LeadsPage() {
  const { data: leads = [], isLoading } = useLeads();

  const [activeTab,   setActiveTab]   = useState("All");
  const [globalFilter, setGlobalFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // ── Tab counts ────────────────────────────────────────────────────────────
  const tabCounts = useMemo(() =>
    TABS.reduce((acc, tab) => {
      acc[tab] = tab === "All"
        ? leads.length
        : leads.filter((l) => l.status === tab).length;
      return acc;
    }, {}),
    [leads]
  );

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let data = leads;
    if (activeTab !== "All") data = data.filter((l) => l.status === activeTab);
    if (sourceFilter)        data = data.filter((l) => l.source === sourceFilter);
    if (priorityFilter)      data = data.filter((l) => l.priority === priorityFilter);
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      data = data.filter((l) =>
        l.name.toLowerCase().includes(q)      ||
        l.email?.toLowerCase().includes(q)    ||
        l.phone?.includes(q)                  ||
        l.property.toLowerCase().includes(q)
      );
    }
    return data;
  }, [leads, activeTab, sourceFilter, priorityFilter, globalFilter]);

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Contact",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div>
            <p className="text-sm font-bold text-slate-900">{row.name}</p>
            {row.email && (
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <span>✉</span> {row.email}
              </p>
            )}
            {row.phone && (
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <span>📞</span> {row.phone}
              </p>
            )}
          </div>
        );
      },
    }),

    columnHelper.accessor("property", {
      header: "Property",
      cell: (info) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="text-slate-400">🏢</span>
          <span className="font-medium truncate max-w-[180px]">{info.getValue()}</span>
        </div>
      ),
    }),

    columnHelper.accessor("source", {
      header: "Source / Intent",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              <span>{SOURCE_ICON[row.source] ?? "🔗"}</span> {row.source}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              <span>{INTENT_ICON[row.intent] ?? "📌"}</span> {row.intent}
            </span>
          </div>
        );
      },
    }),

    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const s   = info.getValue();
        const sty = STATUS_STYLE[s] ?? STATUS_STYLE["Archived"];
        const dot = STATUS_DOT[s]   ?? "#94a3b8";
        return (
          <span
            style={{ background: sty.bg, color: sty.color }}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block", flexShrink: 0 }} />
            {s}
          </span>
        );
      },
    }),

    columnHelper.accessor("priority", {
      header: "Priority",
      cell: (info) => {
        const p   = info.getValue();
        const sty = PRIORITY_STYLE[p] ?? PRIORITY_STYLE["Low"];
        return (
          <span
            style={{ background: sty.bg, color: sty.color, border: `1px solid ${sty.border}` }}
            className="inline-block text-xs font-bold px-2.5 py-1 rounded-full"
          >
            {p}
          </span>
        );
      },
    }),

    columnHelper.accessor("assignedTo", {
      header: "Assigned To",
      cell: (info) => {
        const val = info.getValue();
        return val
          ? <span className="text-sm text-slate-700 font-medium">{val}</span>
          : <span className="text-sm text-slate-400 italic">Unassigned</span>;
      },
    }),

    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => (
        <span className="text-sm text-slate-400">{timeAgo(info.getValue())}</span>
      ),
    }),

    // Actions column
    columnHelper.display({
      id: "actions",
      header: "",
      cell: () => (
        <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
          <MoreHorizontal size={16} />
        </button>
      ),
    }),
  ], []);

  // ── TanStack Table ─────────────────────────────────────────────────────────
  const table = useReactTable({
    data:                  filteredData,
    columns,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-7 bg-slate-200 rounded w-24 mb-2 animate-pulse" />
        <div className="h-4 bg-slate-100 rounded w-64 mb-6 animate-pulse" />
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-full bg-slate-50">

      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and track all incoming leads</p>
      </div>

      {/* ── Search + Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-4 flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by name, email, phone, or property..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-orange-400 transition-colors"
          />
        </div>

        {/* Source dropdown */}
        <div className="relative">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:outline-none focus:border-orange-400 cursor-pointer transition-colors"
          >
            <option value="">Source</option>
            <option value="Website">Website</option>
            <option value="App">App</option>
            <option value="Whatsapp">Whatsapp</option>
            <option value="Call">Call</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Priority dropdown */}
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:outline-none focus:border-orange-400 cursor-pointer transition-colors"
          >
            <option value="">Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Assigned Agent dropdown */}
        <div className="relative">
          <select className="appearance-none pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:outline-none focus:border-orange-400 cursor-pointer transition-colors">
            <option value="">Assigned Agent</option>
            <option>Sarah Mitchell</option>
            <option>John Davis</option>
            <option>Ahmed Khan</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Filter icon button */}
        <button className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500">
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Status Tabs */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-slate-100">
          {TABS.map((tab) => {
            const count     = tabCounts[tab];
            const isActive  = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {table.getHeaderGroups().map((hg) =>
                  hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-slate-600 transition-colors"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted()] ?? ""}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-slate-400 text-sm">
                    No leads found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer — count + pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {table.getRowModel().rows.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {filteredData.length}
            </span>{" "}
            leads
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {/* Page numbers */}
            {Array.from({ length: table.getPageCount() }).map((_, i) => (
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                  table.getState().pagination.pageIndex === i
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}