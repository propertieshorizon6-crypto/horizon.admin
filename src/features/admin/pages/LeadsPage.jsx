// 📁 src/features/admin/pages/LeadsPage.jsx

import { useState, useMemo } from "react";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel,
  flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { MoreHorizontal, Search, SlidersHorizontal, ChevronDown, LayoutList, LayoutGrid } from "lucide-react";
import useLeads from "../hooks/useLeads";

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff  = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ── Badge configs ─────────────────────────────────────────────────────────────
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

const SOURCE_ICON = { Website: "🌐", App: "📱", Whatsapp: "💬", Call: "📞" };
const INTENT_ICON = { Inquiry: "✉", Tour: "📅", Call: "📞", Message: "💬" };

// ── Kanban column config ──────────────────────────────────────────────────────
const KANBAN_COLS = [
  { status: "New",         label: "New",         color: "#38bdf8", bg: "#f0f9ff", border: "#bae6fd" },
  { status: "Assigned",    label: "Assigned",    color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  { status: "In Progress", label: "In Progress", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  { status: "Closed",      label: "Closed",      color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
  { status: "Archived",    label: "Archived",    color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0" },
];

const TABS   = ["All", "New", "Assigned", "In Progress", "Closed", "Archived"];
const columnHelper = createColumnHelper();

// ── Kanban Card ───────────────────────────────────────────────────────────────
function KanbanCard({ lead }) {
  const pri = PRIORITY_STYLE[lead.priority] ?? PRIORITY_STYLE["Low"];
  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
      padding: "14px", marginBottom: 10, cursor: "pointer",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.15s, transform 0.15s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Name + priority */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{lead.name}</p>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: pri.bg, color: pri.color, border: `1px solid ${pri.border}`, whiteSpace: "nowrap", marginLeft: 6 }}>
          {lead.priority}
        </span>
      </div>

      {/* Email / Phone */}
      {lead.email && (
        <p style={{ margin: "0 0 2px", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
          <span>✉</span> {lead.email}
        </p>
      )}
      {lead.phone && (
        <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
          <span>📞</span> {lead.phone}
        </p>
      )}

      {/* Property */}
      <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
        <span>🏢</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.property}</span>
      </p>

      {/* Source + Intent badges */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "#f1f5f9", color: "#475569" }}>
          {SOURCE_ICON[lead.source] ?? "🔗"} {lead.source}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "#f1f5f9", color: "#475569" }}>
          {INTENT_ICON[lead.intent] ?? "📌"} {lead.intent}
        </span>
      </div>

      {/* Footer: assigned + time */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
        <span style={{ fontSize: 11, color: lead.assignedTo ? "#475569" : "#94a3b8", fontStyle: lead.assignedTo ? "normal" : "italic" }}>
          {lead.assignedTo ?? "Unassigned"}
        </span>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>{timeAgo(lead.createdAt)}</span>
      </div>
    </div>
  );
}

// ── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({ col, leads }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column" }}>
      {/* Column header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: col.color, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em" }}>{col.label}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: col.bg, color: col.color, border: `1px solid ${col.border}` }}>
          {leads.length}
        </span>
      </div>

      {/* Drop zone */}
      <div style={{
        flex: 1, borderRadius: 12, padding: "10px 8px",
        background: col.bg, border: `1.5px dashed ${col.border}`,
        minHeight: 120,
      }}>
        {leads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#cbd5e1", fontSize: 12 }}>No leads</div>
        ) : (
          leads.map((lead) => <KanbanCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}

// ── Main LeadsPage ────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const { data: leads = [], isLoading } = useLeads();

  const [view,          setView]          = useState("table"); // "table" | "kanban"
  const [activeTab,     setActiveTab]     = useState("All");
  const [globalFilter,  setGlobalFilter]  = useState("");
  const [sourceFilter,  setSourceFilter]  = useState("");
  const [priorityFilter,setPriorityFilter]= useState("");

  // Tab counts
  const tabCounts = useMemo(() =>
    TABS.reduce((acc, tab) => {
      acc[tab] = tab === "All" ? leads.length : leads.filter((l) => l.status === tab).length;
      return acc;
    }, {}), [leads]);

  // Filtered data (shared between table + kanban)
  const filteredData = useMemo(() => {
    let data = leads;
    if (activeTab !== "All") data = data.filter((l) => l.status === activeTab);
    if (sourceFilter)        data = data.filter((l) => l.source === sourceFilter);
    if (priorityFilter)      data = data.filter((l) => l.priority === priorityFilter);
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      data = data.filter((l) =>
        l.name.toLowerCase().includes(q)   ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.includes(q)               ||
        l.property.toLowerCase().includes(q)
      );
    }
    return data;
  }, [leads, activeTab, sourceFilter, priorityFilter, globalFilter]);

  // Kanban — group by status
  const kanbanGroups = useMemo(() =>
    KANBAN_COLS.map((col) => ({
      ...col,
      leads: filteredData.filter((l) => l.status === col.status),
    })), [filteredData]);

  // ── Table columns ────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Contact",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{row.name}</p>
            {row.email && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>✉ {row.email}</p>}
            {row.phone && <p style={{ margin: "1px 0 0", fontSize: 11, color: "#94a3b8" }}>📞 {row.phone}</p>}
          </div>
        );
      },
    }),
    columnHelper.accessor("property", {
      header: "Property",
      cell: (info) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#475569" }}>
          <span style={{ color: "#94a3b8" }}>🏢</span>
          <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("source", {
      header: "Source / Intent",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f1f5f9", color: "#475569" }}>
              {SOURCE_ICON[row.source] ?? "🔗"} {row.source}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f1f5f9", color: "#475569" }}>
              {INTENT_ICON[row.intent] ?? "📌"} {row.intent}
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
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: sty.bg, color: sty.color }}>
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
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: sty.bg, color: sty.color, border: `1px solid ${sty.border}` }}>
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
          ? <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{val}</span>
          : <span style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>Unassigned</span>;
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => <span style={{ fontSize: 12, color: "#94a3b8" }}>{timeAgo(info.getValue())}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: () => (
        <button style={{ padding: 6, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8", display: "flex" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <MoreHorizontal size={16} />
        </button>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: filteredData, columns,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ height: 28, background: "#e2e8f0", borderRadius: 8, width: 80, marginBottom: 8 }} />
        <div style={{ height: 14, background: "#f1f5f9", borderRadius: 6, width: 200, marginBottom: 24 }} />
        {[...Array(5)].map((_, i) => <div key={i} style={{ height: 52, background: "#f1f5f9", borderRadius: 10, marginBottom: 10 }} />)}
      </div>
    );
  }

  const thStyle = { padding: "11px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", cursor: "pointer", userSelect: "none" };

  return (
    <div style={{ padding: "28px 24px", minHeight: "100%", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Leads</h1>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Manage and track all incoming leads</p>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4, gap: 2 }}>
          <button
            onClick={() => setView("table")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: view === "table" ? "#fff" : "transparent", color: view === "table" ? "#0f172a" : "#64748b", boxShadow: view === "table" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}
          >
            <LayoutList size={15} /> Table
          </button>
          <button
            onClick={() => setView("kanban")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: view === "kanban" ? "#fff" : "transparent", color: view === "kanban" ? "#0f172a" : "#64748b", boxShadow: view === "kanban" ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}
          >
            <LayoutGrid size={15} /> Board
          </button>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search by name, email, phone, or property..." style={{ width: "100%", paddingLeft: 32, paddingRight: 10, paddingTop: 9, paddingBottom: 9, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#334155", outline: "none", boxSizing: "border-box", background: "#fafafa" }} />
        </div>
        {[
          { value: sourceFilter,   set: setSourceFilter,   label: "Source",   opts: ["Website","App","Whatsapp","Call"] },
          { value: priorityFilter, set: setPriorityFilter, label: "Priority", opts: ["High","Medium","Low"] },
        ].map(({ value, set, label, opts }) => (
          <div key={label} style={{ position: "relative" }}>
            <select value={value} onChange={(e) => set(e.target.value)} style={{ appearance: "none", paddingLeft: 12, paddingRight: 28, paddingTop: 9, paddingBottom: 9, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#64748b", background: "#fff", cursor: "pointer", outline: "none", minWidth: 110 }}>
              <option value="">{label}</option>
              {opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
          </div>
        ))}
        <button style={{ padding: "9px 11px", border: "1px solid #e2e8f0", borderRadius: 9, background: "#fff", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center" }}>
          <SlidersHorizontal size={15} />
        </button>
      </div>

      {/* ── TABLE VIEW ── */}
      {view === "table" && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "10px 14px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap" }}>
            {TABS.map((tab) => {
              const count    = tabCounts[tab];
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, border: "none", background: isActive ? "#f1f5f9" : "transparent", color: isActive ? "#0f172a" : "#64748b", fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.15s" }}>
                  {tab}
                  {count > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: isActive ? "#1e293b" : "#e2e8f0", color: isActive ? "#fff" : "#64748b" }}>{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
                {table.getHeaderGroups().map((hg) => hg.headers.map((header) => (
                  <th key={header.id} onClick={header.column.getToggleSortingHandler()} style={thStyle}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted()] ?? ""}
                  </th>
                )))}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No leads found</td></tr>
              ) : (
                table.getRowModel().rows.map((row, idx) => (
                  <tr key={row.id} style={{ borderBottom: idx < table.getRowModel().rows.length - 1 ? "1px solid #f8fafc" : "none", background: "#fff", cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              Showing <strong style={{ color: "#475569" }}>{table.getRowModel().rows.length}</strong> of <strong style={{ color: "#475569" }}>{filteredData.length}</strong> leads
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} style={{ padding: "5px 14px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, fontWeight: 500, color: "#475569", background: "#fff", cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed", opacity: table.getCanPreviousPage() ? 1 : 0.4 }}>Previous</button>
              {Array.from({ length: table.getPageCount() }).map((_, i) => (
                <button key={i} onClick={() => table.setPageIndex(i)} style={{ width: 30, height: 30, borderRadius: 7, fontSize: 12, fontWeight: 700, border: table.getState().pagination.pageIndex === i ? "none" : "1px solid #e2e8f0", background: table.getState().pagination.pageIndex === i ? "#1e293b" : "#fff", color: table.getState().pagination.pageIndex === i ? "#fff" : "#475569", cursor: "pointer" }}>{i + 1}</button>
              ))}
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} style={{ padding: "5px 14px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, fontWeight: 500, color: "#475569", background: "#fff", cursor: table.getCanNextPage() ? "pointer" : "not-allowed", opacity: table.getCanNextPage() ? 1 : 0.4 }}>Next</button>
            </div>
          </div>
        </div>
      )}

      {/* ── KANBAN VIEW ── */}
      {view === "kanban" && (
        <div>
          {/* Kanban tab filter — only show in kanban */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {TABS.map((tab) => {
              const count    = tabCounts[tab];
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: `1px solid ${isActive ? "#1e293b" : "#e2e8f0"}`, background: isActive ? "#1e293b" : "#fff", color: isActive ? "#fff" : "#64748b", fontSize: 12, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.15s" }}>
                  {tab}
                  {count > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 99, background: isActive ? "rgba(255,255,255,0.2)" : "#e2e8f0", color: isActive ? "#fff" : "#64748b" }}>{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Kanban columns */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", overflowX: "auto", paddingBottom: 8 }}>
            {kanbanGroups.map((col) => (
              <div key={col.status} style={{ flex: "1 1 0", minWidth: 220, maxWidth: 300 }}>
                <KanbanColumn col={col} leads={col.leads} />
              </div>
            ))}
          </div>

          {/* Kanban total */}
          <p style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
            Showing <strong style={{ color: "#475569" }}>{filteredData.length}</strong> leads across {kanbanGroups.filter((c) => c.leads.length > 0).length} columns
          </p>
        </div>
      )}
    </div>
  );
}