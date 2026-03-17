// 📁 src/features/admin/pages/TourRequestsPage.jsx
//
// 🧠 CONCEPT:
// Yeh page tour requests ki list dikhata hai TanStack Table mein
// Jab koi row click hoti hai → right side se TourDetailDrawer slide-in hota hai
//
// 📦 DATA FLOW:
// useTourRequests() → tours array → table rows render
// Row click → selectedTour state set → Drawer open
// Drawer action → handleTourUpdate() → tours state update → UI refresh

import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel,
  flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, ChevronDown, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, User } from "lucide-react";
import useTourRequests from "../hooks/useTourRequests";
import TourDetailDrawer from "../components/TourDetailDrawer";

// ── Source Icon ───────────────────────────────────────────────────────────────
function SourceIcon({ source }) {
  if (source === "app") return (
    <div style={{ width: 28, height: 28, borderRadius: 6, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    </div>
  );
  if (source === "website") return (
    <div style={{ width: 28, height: 28, borderRadius: 6, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    </div>
  );
  return (
    <div style={{ width: 28, height: 28, borderRadius: 6, background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4 19.79 19.79 0 0 1 1.61 4.83 2 2 0 0 1 3.59 2.63h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.17a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17.5z"/>
      </svg>
    </div>
  );
}

function VisitBadge({ type }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 5, background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
      {type === "virtual"
        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      }
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "Requested": { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    "Proposed":  { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
    "Confirmed": { bg: "transparent", color: "#16a34a", border: "transparent" },
    "Completed": { bg: "transparent", color: "#16a34a", border: "transparent" },
    "Cancelled": { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  };
  const s = styles[status] ?? styles["Proposed"];
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 99, whiteSpace: "nowrap", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

const columnHelper = createColumnHelper();

export default function TourRequestsPage() {
  const location = useLocation();
  const {
    data: initialTours = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTourRequests();

  // 🔑 LOCAL STATE for tours
  // useMemo/useQuery se aaya data → local state mein copy karte hain
  // Kyunki drawer se update hone par UI ko re-render karna hai
  const [tours,        setTours]        = useState(null); // null = use API data
  const [selectedTour, setSelectedTour] = useState(null); // currently open drawer tour

  // Actual tours: local update hai to use karo, warna API data
  const tourData = tours ?? initialTours;

  // If navigated with state, open drawer for that tour
  useEffect(() => {
    if (location.state && location.state.tourId && tourData.length) {
      const found = tourData.find(t => t.id === location.state.tourId);
      if (found) setSelectedTour(found);
    }
    // eslint-disable-next-line
  }, [location.state, tourData]);

  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  // Stats — tourData se calculate hote hain (real-time update)
  const stats = useMemo(() => ({
    total:     tourData.length,
    requested: tourData.filter((t) => t.status === "Requested").length,
    overdue:   tourData.filter((t) => t.sla === "Overdue").length,
    confirmed: tourData.filter((t) => t.status === "Confirmed").length,
    completed: tourData.filter((t) => t.status === "Completed").length,
  }), [tourData]);

  // Filtered data
  const filteredData = useMemo(() => {
    let data = tourData;
    if (statusFilter) data = data.filter((t) => t.status === statusFilter);
    if (typeFilter)   data = data.filter((t) => t.visitType === typeFilter);
    if (sourceFilter) data = data.filter((t) => t.source === sourceFilter);
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      data = data.filter((t) =>
        t.id.toLowerCase().includes(q)            ||
        t.customer.name.toLowerCase().includes(q) ||
        t.customer.phone.includes(q)              ||
        t.property.name.toLowerCase().includes(q)
      );
    }
    return data;
  }, [tourData, globalFilter, statusFilter, typeFilter, sourceFilter]);

  // ── HANDLE TOUR UPDATE ─────────────────────────────────────────────────────
  // 🧠 Concept:
  //   Drawer se action hone par (status change, agent reassign, etc.)
  //   Is function ko call kiya jaata hai with updated tour object
  //   Hum tours array mein us ID ka item replace kar dete hain
  //   React re-render karta hai → table aur drawer dono update ho jaate hain
  const handleTourUpdate = (updatedTour) => {
    // Pehle initialTours se copy banao agar pehli baar update ho raha hai
    const base = tours ?? initialTours;
    // Updated tour ko find karke replace karo
    setTours(base.map((t) => t.id === updatedTour.id ? updatedTour : t));
    // Drawer mein bhi updated data dikhao
    setSelectedTour(updatedTour);
  };

  // Columns
  const columns = useMemo(() => [
    columnHelper.accessor("id", {
      header: "Tour ID",
      cell: (i) => <span style={{ fontSize: 12, fontFamily: "monospace", color: "#475569" }}>{i.getValue()}</span>,
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (i) => <span style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>{i.getValue()}</span>,
    }),
    columnHelper.accessor("source", {
      header: "Src",
      cell: (i) => <SourceIcon source={i.getValue()} />,
    }),
    columnHelper.accessor("property", {
      header: "Property",
      cell: (i) => {
        const p = i.getValue();
        return (
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>{p.name}</p>
            <p style={{ fontSize: 10, color: "#94a3b8", margin: "1px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>📍 {p.location}</p>
          </div>
        );
      },
    }),
    columnHelper.accessor("customer", {
      header: "Customer",
      cell: (i) => {
        const c = i.getValue();
        return (
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", margin: 0 }}>{c.name}</p>
            <p style={{ fontSize: 10, color: "#94a3b8", margin: "1px 0 0" }}>{c.phone}</p>
          </div>
        );
      },
    }),
    columnHelper.accessor("visitType", {
      header: "Visit",
      cell: (i) => <VisitBadge type={i.getValue()} />,
    }),
    columnHelper.accessor("preferredSlot", {
      header: "Pref. Slot",
      cell: (i) => <span style={{ fontSize: 11, color: "#475569", whiteSpace: "nowrap" }}>{i.getValue()}</span>,
    }),
    columnHelper.accessor("finalSlot", {
      header: "Final Slot",
      cell: (i) => {
        const val = i.getValue();
        return val
          ? <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", whiteSpace: "nowrap" }}>{val}</span>
          : <span style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>Not set</span>;
      },
    }),
    columnHelper.accessor("agent", {
      header: "Agent",
      cell: (i) => {
        const a = i.getValue();
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <User size={11} color="#94a3b8" />
            {a
              ? <span style={{ fontSize: 12, color: "#374151", whiteSpace: "nowrap" }}>{a}</span>
              : <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Unassigned</span>
            }
          </div>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (i) => <StatusBadge status={i.getValue()} />,
    }),
    columnHelper.accessor("sla", {
      header: "SLA",
      cell: (i) => {
        const sla = i.getValue();
        if (!sla) return null;
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600, background: "#fff1f2", color: "#e11d48", border: "1px solid #fecdd3", padding: "2px 7px", borderRadius: 99, whiteSpace: "nowrap" }}>
            <AlertTriangle size={10} /> {sla}
          </span>
        );
      },
    }),
  ], []);

  const table = useReactTable({
    data: filteredData, columns,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  if (isLoading) return (
    <div style={{ padding: 32 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ height: 52, background: "#f1f5f9", borderRadius: 10, marginBottom: 10 }} />
      ))}
    </div>
  );

  if (isError) return (
    <div style={{ padding: 32 }}>
      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 12, padding: 16, maxWidth: 640 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Unable to load tour requests</p>
        <p style={{ margin: "6px 0 12px", fontSize: 12 }}>
          {error?.response?.data?.message || error?.message || "Something went wrong while fetching data."}
        </p>
        <button
          onClick={() => refetch()}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#b91c1c", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          Retry
        </button>
      </div>
    </div>
  );

  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    // 🔑 position: relative nahi chahiye — drawer fixed position mein hai
    <div style={{ padding: "28px 24px", minHeight: "100%", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Tour Requests</h1>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Manage property viewing requests and schedules</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#64748b" }}>
          <span>Demo Role:</span>
          <div style={{ position: "relative" }}>
            <select style={{ appearance: "none", paddingLeft: 9, paddingRight: 24, paddingTop: 5, paddingBottom: 5, border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#1e293b", background: "#fff", cursor: "pointer", outline: "none" }}>
              <option>Admin</option><option>Agent</option>
            </select>
            <ChevronDown size={11} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#475569" }}>Total <strong style={{ color: "#0f172a" }}>{stats.total}</strong></span>
        <span style={{ width: 1, height: 14, background: "#e2e8f0" }} />
        <span style={{ fontSize: 13, color: "#2563eb", fontWeight: 600 }}>Requested <strong>{stats.requested}</strong></span>
        <span style={{ width: 1, height: 14, background: "#e2e8f0" }} />
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#f97316", fontWeight: 600 }}>
          <AlertTriangle size={12} /> Overdue <strong>{stats.overdue}</strong>
        </span>
        <span style={{ width: 1, height: 14, background: "#e2e8f0" }} />
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
          <CheckCircle size={12} /> Confirmed <strong>{stats.confirmed}</strong>
        </span>
        <span style={{ width: 1, height: 14, background: "#e2e8f0" }} />
        <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>Completed <strong>{stats.completed}</strong></span>
      </div>

      {/* Search + Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by ID, name, phone, property..."
            style={{ width: "100%", paddingLeft: 30, paddingRight: 10, paddingTop: 8, paddingBottom: 8, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: "#334155", background: "#fff", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        {[
          { value: statusFilter, set: setStatusFilter, label: "All Status",  opts: ["Requested","Proposed","Confirmed","Completed","Cancelled"] },
          { value: typeFilter,   set: setTypeFilter,   label: "All Types",   opts: ["virtual","physical"] },
          { value: sourceFilter, set: setSourceFilter, label: "All Sources", opts: ["app","website","call"] },
        ].map(({ value, set, label, opts }) => (
          <div key={label} style={{ position: "relative" }}>
            <select value={value} onChange={(e) => set(e.target.value)} style={{ appearance: "none", paddingLeft: 10, paddingRight: 26, paddingTop: 8, paddingBottom: 8, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: "#475569", background: "#fff", cursor: "pointer", outline: "none", minWidth: 110 }}>
              <option value="">{label}</option>
              {opts.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
            <ChevronDown size={11} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "7%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "4%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "7%" }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
              {table.getHeaderGroups().map((hg) =>
                hg.headers.map((header) => (
                  <th key={header.id} onClick={header.column.getToggleSortingHandler()} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", userSelect: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: "↑", desc: "↓" }[header.column.getIsSorted()] ?? ""}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={11} style={{ padding: "50px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No tour requests found</td></tr>
            ) : (
              table.getRowModel().rows.map((row, idx) => {
                // 🔑 Selected row highlighting — kaunsi row drawer mein open hai
                const isSelected = selectedTour?.id === row.original.id;
                return (
                  <tr
                    key={row.id}
                    // 🔑 Row click → selectedTour set → drawer open
                    onClick={() => setSelectedTour(row.original)}
                    style={{
                      borderBottom: idx < table.getRowModel().rows.length - 1 ? "1px solid #f8fafc" : "none",
                      // Selected row ko blue border + light bg se highlight karo
                      background:   isSelected ? "#eff6ff" : "#fff",
                      borderLeft:   isSelected ? "3px solid #3b82f6" : "3px solid transparent",
                      cursor:       "pointer",
                      transition:   "background 0.1s",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "#fff"; }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} style={{ padding: "12px 12px", verticalAlign: "middle", overflow: "hidden" }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid #f1f5f9" }}>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, filteredData.length)} of <strong style={{ color: "#475569" }}>{filteredData.length}</strong> results
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, fontWeight: 500, color: "#475569", background: "#fff", cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed", opacity: table.getCanPreviousPage() ? 1 : 0.4 }}>
              <ChevronLeft size={13} /> Previous
            </button>
            {Array.from({ length: table.getPageCount() }).map((_, i) => (
              <button key={i} onClick={() => table.setPageIndex(i)} style={{ width: 30, height: 30, borderRadius: 7, fontSize: 12, fontWeight: 700, border: pageIndex === i ? "none" : "1px solid #e2e8f0", background: pageIndex === i ? "#1e293b" : "#fff", color: pageIndex === i ? "#fff" : "#475569", cursor: "pointer" }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, fontWeight: 500, color: "#475569", background: "#fff", cursor: table.getCanNextPage() ? "pointer" : "not-allowed", opacity: table.getCanNextPage() ? 1 : 0.4 }}>
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── TOUR DETAIL DRAWER ─────────────────────────────────────────────────
          🧠 Drawer ko page ke bahar render karo (fixed position)
          tour prop pass karo → drawer automatically open/close hoga
          onUpdate → handleTourUpdate → tours state update
      ─── */}
      <TourDetailDrawer
        tour={selectedTour}
        onClose={() => setSelectedTour(null)}
        onUpdate={handleTourUpdate}
      />
    </div>
  );
}
