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
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  useReactTable, getCoreRowModel,
  getSortedRowModel,
  flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, ChevronDown, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import useTourRequests from "../hooks/useTourRequests";
import TourDetailDrawer from "../components/TourDetailDrawer";

const PAGE_SIZE = 20;
const EMPTY = [];

// UI status label → backend status (mapTour produces these labels).
const STATUS_TO_API = {
  Requested: "pending",
  Confirmed: "confirmed",
  Completed: "completed",
  Cancelled: "cancelled",
};

// UI visit-type label → backend visitType.
const VISIT_TO_API = { physical: "in-person", virtual: "virtual" };

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
    "Confirmed": { bg: "transparent", color: "#16a34a", border: "transparent" },
    "Completed": { bg: "transparent", color: "#16a34a", border: "transparent" },
    "Cancelled": { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  };
  const s = styles[status] ?? styles["Requested"];
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 99, whiteSpace: "nowrap", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

const columnHelper = createColumnHelper();

export default function TourRequestsPage() {
  const location = useLocation();
  const queryClient = useQueryClient();

  const [globalFilter, setGlobalFilter] = useState("");
  const [searchQuery,  setSearchQuery]  = useState(""); // debounced → server
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [page,         setPage]         = useState(1);
  const [selectedTour, setSelectedTour] = useState(null); // currently open drawer tour

  // Debounce search before it hits the server.
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(globalFilter.trim()), 400);
    return () => clearTimeout(t);
  }, [globalFilter]);

  // status/type/search are server-side → reset to first page when they change.
  useEffect(() => { setPage(1); }, [searchQuery, statusFilter, typeFilter]);

  // ── Server-paginated query powers the table ────────────────────────────────
  const tableParams = useMemo(() => {
    const p = { page, limit: PAGE_SIZE };
    if (statusFilter && STATUS_TO_API[statusFilter]) p.status = STATUS_TO_API[statusFilter];
    if (typeFilter && VISIT_TO_API[typeFilter]) p.visitType = VISIT_TO_API[typeFilter];
    if (searchQuery) p.search = searchQuery;
    return p;
  }, [page, statusFilter, typeFilter, searchQuery]);

  const { data: tableData, isLoading, isError, error, refetch, isFetching } =
    useTourRequests(tableParams);
  const tableTours      = tableData?.tours ?? EMPTY;
  const tablePagination = tableData?.pagination ?? { page: 1, total: 0, pages: 1 };

  // ── "Load all" query powers the stats bar (counts must be global, and Tours
  //    has no dedicated stats endpoint) ──────────────────────────────────────
  const STATS_PARAMS = useMemo(() => ({ limit: 1000 }), []);
  const { data: statsData } = useTourRequests(STATS_PARAMS);
  const allTours = statsData?.tours ?? EMPTY;

  // If navigated with state, open drawer for that tour
  useEffect(() => {
    if (location.state && location.state.tourId && allTours.length) {
      const found = allTours.find(t => t.id === location.state.tourId);
      if (found) setSelectedTour(found);
    }
  }, [location.state, allTours]);

  const stats = useMemo(() => ({
    total:     allTours.length,
    requested: allTours.filter((t) => t.status === "Requested").length,
    overdue:   allTours.filter((t) => t.sla === "Overdue").length,
    confirmed: allTours.filter((t) => t.status === "Confirmed").length,
    completed: allTours.filter((t) => t.status === "Completed").length,
  }), [allTours]);

  // status/type/search are all server-side.
  const filteredData = tableTours;

  // ── HANDLE TOUR UPDATE ─────────────────────────────────────────────────────
  // Drawer action (status change, reassign, etc.) → refetch both queries so the
  // table and stats stay in sync, and keep the drawer showing the updated tour.
  const handleTourUpdate = (updatedTour) => {
    queryClient.invalidateQueries({ queryKey: ["tour-requests"] });
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
    columnHelper.accessor("property", {
      header: "Property",
      cell: (i) => {
        const p = i.getValue();
        return (
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#000000", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>{p.name}</p>
            <p style={{ fontSize: 10, color: "#94a3b8", margin: "1px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150, display: "flex", alignItems: "center", gap: 3 }}><MapPin size={9} /> {p.location}</p>
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
            <p style={{ fontSize: 12, fontWeight: 600, color: "#000000", margin: 0 }}>{c.name}</p>
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
    getCoreRowModel:   getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // sorts the current page only
    manualPagination:  true,
    pageCount:         tablePagination.pages,
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

  return (
    // 🔑 position: relative nahi chahiye — drawer fixed position mein hai
    <div className="p-4 md:p-6 min-h-full" style={{ background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#000000" }}>Tour Requests</h1>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Manage property viewing requests and schedules</p>
        </div>
        
      </div>

      {/* Stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#475569" }}>Total <strong style={{ color: "#000000" }}>{stats.total}</strong></span>
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
            placeholder="Search by name, phone, property, location..."
            style={{ width: "100%", paddingLeft: 30, paddingRight: 10, paddingTop: 8, paddingBottom: 8, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 12, color: "#000000", background: "#fff", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        {[
          { value: statusFilter, set: setStatusFilter, label: "All Status",  opts: ["Requested","Confirmed","Completed","Cancelled"] },
          { value: typeFilter,   set: setTypeFilter,   label: "All Types",   opts: ["virtual","physical"] },
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
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "8%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "8%" }} />
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
              <tr><td colSpan={9} style={{ padding: "50px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No tour requests found</td></tr>
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

        {/* Pagination — server-driven */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid #f1f5f9" }}>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            {isFetching && <span style={{ marginRight: 8 }}>Updating…</span>}
            Page <strong style={{ color: "#475569" }}>{tablePagination.page}</strong> of <strong style={{ color: "#475569" }}>{tablePagination.pages}</strong>
            {" · "}<strong style={{ color: "#475569" }}>{tablePagination.total}</strong> results
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || isFetching} style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, fontWeight: 500, color: "#475569", background: "#fff", cursor: page <= 1 || isFetching ? "not-allowed" : "pointer", opacity: page <= 1 || isFetching ? 0.4 : 1 }}>
              <ChevronLeft size={13} /> Previous
            </button>
            {Array.from({ length: tablePagination.pages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} disabled={isFetching} style={{ width: 30, height: 30, borderRadius: 7, fontSize: 12, fontWeight: 700, border: page === i + 1 ? "none" : "1px solid #e2e8f0", background: page === i + 1 ? "#2D368E" : "#fff", color: page === i + 1 ? "#fff" : "#475569", cursor: isFetching ? "not-allowed" : "pointer" }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(tablePagination.pages, p + 1))} disabled={page >= tablePagination.pages || isFetching} style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, fontWeight: 500, color: "#475569", background: "#fff", cursor: page >= tablePagination.pages || isFetching ? "not-allowed" : "pointer", opacity: page >= tablePagination.pages || isFetching ? 0.4 : 1 }}>
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
