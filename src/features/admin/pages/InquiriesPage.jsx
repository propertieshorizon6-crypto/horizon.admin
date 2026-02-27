// 📁 src/features/admin/pages/InquiriesPage.jsx
// npm install @tanstack/react-table lucide-react

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
import { Search, SlidersHorizontal, Inbox } from "lucide-react";
import useInquiries from "../hooks/useInquiries";

// ── Helpers ────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff  = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 1)  return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ── Badge configs ──────────────────────────────────────────────────────────
const STATUS_STYLE = {
  "Open":        { bg: "#dbeafe", color: "#1d4ed8" },
  "In Progress": { bg: "#fef9c3", color: "#a16207" },
  "Pending":     { bg: "#fee2e2", color: "#dc2626" },
  "Resolved":    { bg: "#dcfce7", color: "#15803d" },
  "Closed":      { bg: "#f1f5f9", color: "#475569" },
};

const SOURCE_ICON = {
  Website:  "🌐",
  App:      "📱",
  Whatsapp: "💬",
  Call:     "📞",
};

const columnHelper = createColumnHelper();

export default function InquiriesPage() {
  const { data: inquiries = [], isLoading } = useInquiries();
  const [globalFilter, setGlobalFilter]     = useState("");
  const [showFilters,  setShowFilters]      = useState(false);
  const [statusFilter, setStatusFilter]     = useState("");
  const [sourceFilter, setSourceFilter]     = useState("");

  // ── Filtered data ──────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let data = inquiries;
    if (statusFilter) data = data.filter((i) => i.status === statusFilter);
    if (sourceFilter) data = data.filter((i) => i.source === sourceFilter);
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      data = data.filter((i) =>
        i.id.toLowerCase().includes(q)               ||
        i.property.toLowerCase().includes(q)         ||
        i.customer.name.toLowerCase().includes(q)    ||
        i.customer.email?.toLowerCase().includes(q)  ||
        i.agent?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [inquiries, globalFilter, statusFilter, sourceFilter]);

  // ── Columns ────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    columnHelper.accessor("id", {
      header: "Inquiry ID",
      cell: (info) => (
        <span className="text-sm font-bold text-slate-700 font-mono">
          {info.getValue()}
        </span>
      ),
    }),

    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => (
        <span className="text-sm text-slate-500">{timeAgo(info.getValue())}</span>
      ),
    }),

    columnHelper.accessor("source", {
      header: "Source",
      cell: (info) => {
        const s = info.getValue();
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            <span>{SOURCE_ICON[s] ?? "🔗"}</span> {s}
          </span>
        );
      },
    }),

    columnHelper.accessor("property", {
      header: "Property",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">🏢</span>
          <span className="text-sm text-slate-700 font-medium truncate max-w-[160px]">
            {info.getValue()}
          </span>
        </div>
      ),
    }),

    columnHelper.accessor("customer", {
      header: "Customer",
      cell: (info) => {
        const c = info.getValue();
        return (
          <div>
            <p className="text-sm font-semibold text-slate-800">{c.name}</p>
            {c.email && (
              <p className="text-xs text-slate-400 mt-0.5">{c.email}</p>
            )}
          </div>
        );
      },
    }),

    columnHelper.accessor("agent", {
      header: "Agent",
      cell: (info) => {
        const agent = info.getValue();
        return agent
          ? <span className="text-sm text-slate-700 font-medium">{agent}</span>
          : <span className="text-sm text-slate-400 italic">Unassigned</span>;
      },
    }),

    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const s   = info.getValue();
        const sty = STATUS_STYLE[s] ?? STATUS_STYLE["Closed"];
        return (
          <span
            style={{ background: sty.bg, color: sty.color }}
            className="inline-block text-xs font-bold px-2.5 py-1 rounded-full"
          >
            {s}
          </span>
        );
      },
    }),

    columnHelper.accessor("sla", {
      header: "SLA",
      cell: (info) => {
        const sla = info.getValue();
        return (
          <span className={`text-xs font-semibold ${
            sla.urgent ? "text-red-500" : "text-slate-400"
          }`}>
            {sla.urgent && "⚠ "}{sla.label}
          </span>
        );
      },
    }),
  ], []);

  // ── TanStack Table ─────────────────────────────────────────────────────
  const table = useReactTable({
    data:                  filteredData,
    columns,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-7 bg-slate-200 rounded w-32 mb-2 animate-pulse" />
        <div className="h-4 bg-slate-100 rounded w-80 mb-6 animate-pulse" />
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
        <h1 className="text-2xl font-bold text-slate-900">Inquiries</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage customer inquiries and property interest requests
        </p>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:border-orange-400 transition-colors"
          />
        </div>

        {/* Filters toggle */}
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-colors ${
            showFilters
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>

        {/* Filter dropdowns — show when Filters clicked */}
        {showFilters && (
          <>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:outline-none focus:border-orange-400 cursor-pointer"
            >
              <option value="">All Status</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Pending</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:outline-none focus:border-orange-400 cursor-pointer"
            >
              <option value="">All Sources</option>
              <option>Website</option>
              <option>App</option>
              <option>Whatsapp</option>
              <option>Call</option>
            </select>

            {(statusFilter || sourceFilter) && (
              <button
                onClick={() => { setStatusFilter(""); setSourceFilter(""); }}
                className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                Clear filters
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="border-b border-slate-100">
                {table.getHeaderGroups().map((hg) =>
                  hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-slate-600 transition-colors"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted()] ?? ""}
                    </th>
                  ))
                )}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-50">
              {table.getRowModel().rows.length === 0 ? (
                // ── Empty State matching screenshot ──
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Inbox size={48} className="text-slate-300" strokeWidth={1.2} />
                      <p className="text-base font-semibold text-slate-600">
                        No inquiries found
                      </p>
                      <p className="text-sm text-slate-400">
                        Inquiries will appear here when customers submit them
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
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

        {/* Pagination — only show if rows exist */}
        {table.getRowModel().rows.length > 0 && (
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
              inquiries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
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
        )}
      </div>
    </div>
  );
}