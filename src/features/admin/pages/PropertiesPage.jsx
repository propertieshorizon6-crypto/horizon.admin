// 📁 src/features/admin/pages/PropertiesPage.jsx

import { useState, useMemo } from "react";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, createColumnHelper, flexRender,
} from "@tanstack/react-table";
import { Search, ChevronDown, MoreHorizontal } from "lucide-react";
import useProperties from "../hooks/useProperties";

// ── SVG Icons ────────────────────────────────────────────────────────────────
const BedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v6H2M2 20h20M7 8v4"/>
  </svg>
);
const BathIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>
    <line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/>
  </svg>
);
const AreaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
  </svg>
);
const PhotoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);
const DocIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);
const PinIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Active:   { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
    Draft:    { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
    Archived: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
  };
  const s = map[status] ?? map.Draft;
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

// ── Compliance badge ──────────────────────────────────────────────────────────
function ComplianceBadge({ value }) {
  if (value === "Compliant") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", whiteSpace: "nowrap" }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      Compliant
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "#fef9c3", color: "#a16207", border: "1px solid #fde68a", whiteSpace: "nowrap" }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      {value}
    </span>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ["All", "Draft", "Active", "Archived"];

const columnHelper = createColumnHelper();

export default function PropertiesPage() {
  const { data: properties = [], isLoading } = useProperties();
  const [activeTab,    setActiveTab]    = useState("All");
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [agentFilter,  setAgentFilter]  = useState("");
  const [compFilter,   setCompFilter]   = useState("");

  // Tab counts
  const tabCounts = useMemo(() =>
    TABS.reduce((acc, tab) => {
      acc[tab] = tab === "All" ? properties.length : properties.filter((p) => p.status === tab).length;
      return acc;
    }, {}), [properties]);

  // Filtered data
  const filteredData = useMemo(() => {
    let data = properties;
    if (activeTab !== "All") data = data.filter((p) => p.status === activeTab);
    if (typeFilter)          data = data.filter((p) => p.type === typeFilter);
    if (agentFilter === "Unassigned") data = data.filter((p) => !p.assignedTo);
    else if (agentFilter)    data = data.filter((p) => p.assignedTo === agentFilter);
    if (compFilter === "Compliant")   data = data.filter((p) => p.compliance === "Compliant");
    else if (compFilter === "Issues") data = data.filter((p) => p.compliance !== "Compliant");
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      data = data.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }
    return data;
  }, [properties, activeTab, typeFilter, agentFilter, compFilter, globalFilter]);

  // Columns
  const columns = useMemo(() => [
    columnHelper.accessor("title", {
      header: "Property",
      cell: (i) => {
        const p = i.row.original;
        return (
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{p.title}</p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}>
              <PinIcon /> {p.location}
            </p>
          </div>
        );
      },
    }),
    columnHelper.accessor("price", {
      header: "Price",
      cell: (i) => <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{i.getValue()}</span>,
    }),
    columnHelper.accessor("beds", {
      header: "Details",
      cell: (i) => {
        const p = i.row.original;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#475569" }}>
            {p.beds && (
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <BedIcon /> {p.beds}
              </span>
            )}
            {p.baths && (
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <BathIcon /> {p.baths}
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <AreaIcon /> {p.area} sqm
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (i) => <StatusBadge status={i.getValue()} />,
    }),
    columnHelper.accessor("media", {
      header: "Media",
      cell: (i) => {
        const m = i.getValue();
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <PhotoIcon /> {m.photos}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <DocIcon /> {m.docs}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("compliance", {
      header: "Compliance",
      cell: (i) => <ComplianceBadge value={i.getValue()} />,
    }),
    columnHelper.accessor("assignedTo", {
      header: "Assigned To",
      cell: (i) => {
        const a = i.getValue();
        return a
          ? <span style={{ fontSize: 13, color: "#374151" }}>{a}</span>
          : <span style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>Unassigned</span>;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: () => (
        <button style={{ padding: 6, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}
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
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return (
    <div style={{ padding: 32 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ height: 56, background: "#f1f5f9", borderRadius: 10, marginBottom: 10 }} />
      ))}
    </div>
  );

  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <div style={{ padding: "28px 24px", minHeight: "100%", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Properties</h1>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Manage property listings and compliance</p>
      </div>

      {/* Search + Filters */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "14px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by title or location..."
            style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#334155", outline: "none", boxSizing: "border-box", background: "#fafafa" }}
          />
        </div>

        {[
          { value: typeFilter,  set: setTypeFilter,  label: "Type",           opts: ["Apartment","Villa","Penthouse","Commercial"] },
          { value: agentFilter, set: setAgentFilter, label: "Assigned Agent", opts: ["Sarah Mitchell","Ahmed Khan","John Davis","Unassigned"] },
          { value: compFilter,  set: setCompFilter,  label: "Compliance",     opts: ["Compliant","Issues"] },
        ].map(({ value, set, label, opts }) => (
          <div key={label} style={{ position: "relative" }}>
            <select value={value} onChange={(e) => set(e.target.value)} style={{ appearance: "none", paddingLeft: 12, paddingRight: 28, paddingTop: 9, paddingBottom: 9, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: value ? "#1e293b" : "#64748b", background: "#fff", cursor: "pointer", outline: "none", minWidth: 130 }}>
              <option value="">{label}</option>
              {opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", gap: 4 }}>
          {TABS.map((tab) => {
            const count    = tabCounts[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 12px", borderRadius: 8, border: "none",
                  background: isActive ? "#f1f5f9" : "transparent",
                  color: isActive ? "#0f172a" : "#64748b",
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {tab}
                {count > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: isActive ? "#1e293b" : "#e2e8f0", color: isActive ? "#fff" : "#64748b" }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              {table.getHeaderGroups().map((hg) =>
                hg.headers.map((header) => (
                  <th key={header.id} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No properties found</td></tr>
            ) : (
              table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: idx < table.getRowModel().rows.length - 1 ? "1px solid #f8fafc" : "none", background: "#fff", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid #f1f5f9" }}>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            Showing <strong style={{ color: "#475569" }}>{filteredData.length}</strong> of <strong style={{ color: "#475569" }}>{properties.length}</strong> properties
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              style={{ padding: "5px 14px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, fontWeight: 500, color: "#475569", background: "#fff", cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed", opacity: table.getCanPreviousPage() ? 1 : 0.4 }}
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              style={{ padding: "5px 14px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#fff", background: "#1e293b", cursor: table.getCanNextPage() ? "pointer" : "not-allowed", opacity: table.getCanNextPage() ? 1 : 0.4 }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}