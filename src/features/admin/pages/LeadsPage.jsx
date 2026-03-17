// 📁 src/features/admin/pages/LeadsPage.jsx

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel,
  flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, SlidersHorizontal, ChevronDown, LayoutList, LayoutGrid } from "lucide-react";

import useLeads            from "../hooks/useLeads";
import { updateLeadPriority, assignLead } from "../api/leadsApi";
import {
  fetchUsers,
  MOCK_MODE as USERS_MOCK_MODE,
  MOCK_USERS,
} from "../api/usersApi";
import LeadActionsMenu     from "../components/LeadActionsMenu";
import LeadDetailView      from "../components/LeadDetailView";
import ChangePriorityModal from "../components/ChangePriorityModal";
import KanbanColumn        from "../components/KanbanColumn";
import {
  TABS, KANBAN_COLS,
  STATUS_STYLE, STATUS_DOT,
  PRIORITY_STYLE, SOURCE_ICON, INTENT_ICON,
} from "../constants/leadsConfig";
import { timeAgo } from "../../../utils/timeAgo";

const columnHelper = createColumnHelper();
const thStyle = {
  padding: "11px 18px", textAlign: "left", fontSize: 10, fontWeight: 700,
  color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em",
  whiteSpace: "nowrap", cursor: "pointer", userSelect: "none",
};

export default function LeadsPage() {
  const { data: leads = [], isLoading } = useLeads();
  const queryClient = useQueryClient();

  const [view,           setView]           = useState("table");
  const [activeTab,      setActiveTab]      = useState("All");
  const [globalFilter,   setGlobalFilter]   = useState("");
  const [sourceFilter,   setSourceFilter]   = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedLead,   setSelectedLead]   = useState(null);
  const [priorityLead,   setPriorityLead]   = useState(null);

  // ── Assign Agent state ─────────────────────────────────────────────────────
  const [assigningLead,    setAssigningLead]    = useState(null);
  const [selectedAgentId,  setSelectedAgentId]  = useState("");
  const [assignError,      setAssignError]      = useState("");

  // ── Agents query ───────────────────────────────────────────────────────────
  const {
    data: agentUsers = [],
    isLoading: isAgentsLoading,
    isError: isAgentsError,
    error: agentsQueryError,
  } = useQuery({
    queryKey: ["users", "agents", "active"],
    queryFn: USERS_MOCK_MODE
      ? () => Promise.resolve(
          (MOCK_USERS || []).filter(
            (u) =>
              String(u?.roleKey || u?.role || "").toLowerCase() === "agent" &&
              String(u?.statusKey || u?.status || "").toLowerCase() === "active",
          ),
        )
      : async () => {
          let primaryError = null;
          try {
            const strict = await fetchUsers({ role: "agent", status: "active", page: 1, limit: 100 });
            if (Array.isArray(strict) && strict.length > 0) return strict;
          } catch (e) { primaryError = e; }
          try {
            const fallback = await fetchUsers({ role: "agent", page: 1, limit: 100 });
            return (fallback || []).filter(
              (u) => String(u?.statusKey || u?.status || "").toLowerCase() === "active",
            );
          } catch (e2) { throw primaryError || e2; }
        },
    staleTime: 1000 * 60 * 5,
  });

  const agents = useMemo(
    () =>
      (agentUsers || [])
        .map((u) => ({ id: u?.id, name: u?.name }))
        .filter((u) => u.id && u.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [agentUsers],
  );

  // ── Assign agent mutation ──────────────────────────────────────────────────
  const assignLeadMutation = useMutation({
    mutationFn: ({ leadId, agentId }) => assignLead(leadId, agentId || null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      setAssigningLead(null);
      setSelectedAgentId("");
      setAssignError("");
    },
    onError: (error) => {
      setAssignError(
        error?.response?.data?.message || "Could not update agent assignment.",
      );
    },
  });

  const openAssignModal  = (lead) => {
    setAssigningLead(lead);
    setSelectedAgentId(lead?.assignedAgentId || "");
    setAssignError("");
  };

  const closeAssignModal = () => {
    if (assignLeadMutation.isPending) return;
    setAssigningLead(null);
    setSelectedAgentId("");
    setAssignError("");
  };

  const submitAssignModal = () => {
    if (!assigningLead?.id) return;
    assignLeadMutation.mutate({ leadId: assigningLead.id, agentId: selectedAgentId || null });
  };

  const agentsErrorMessage = isAgentsError
    ? agentsQueryError?.response?.data?.message || agentsQueryError?.message || "Could not load agents list."
    : "";

  const isSameLead = (left, right) => {
    if (!left || !right) return false;
    if (left.id && right.id) return left.id === right.id;
    if (left.email && right.email) return left.email === right.email;
    if (left.phone && right.phone) return left.phone === right.phone;
    return false;
  };

  const handlePrioritySave = async (newPriority) => {
    if (!priorityLead) return;

    const targetLead = priorityLead;
    const previousLeads = queryClient.getQueryData(["leads"]);
    const previousSelectedLead = selectedLead;

    queryClient.setQueryData(["leads"], (prev) => {
      if (!Array.isArray(prev)) return prev;
      return prev.map((lead) => (
        isSameLead(lead, targetLead) ? { ...lead, priority: newPriority } : lead
      ));
    });

    if (selectedLead && isSameLead(selectedLead, targetLead)) {
      setSelectedLead((prev) => (prev ? { ...prev, priority: newPriority } : prev));
    }

    if (!targetLead.id) return;

    try {
      await updateLeadPriority(targetLead.id, newPriority);
    } catch (error) {
      queryClient.setQueryData(["leads"], previousLeads);
      setSelectedLead(previousSelectedLead);
    } finally {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  };

  // ── Derived data (must be before useReactTable) ────────────────────────────
  const tabCounts = useMemo(() => (
    leads.reduce((acc, l) => {
      acc["All"]    = (acc["All"]    ?? 0) + 1;
      acc[l.status] = (acc[l.status] ?? 0) + 1;
      return acc;
    }, {})
  ), [leads]);

  const filteredData = useMemo(() => {
    const q = globalFilter.trim().toLowerCase();

    return leads.filter((l) => {
      if (activeTab !== "All" && l.status !== activeTab)   return false;
      if (sourceFilter   && l.source   !== sourceFilter)   return false;
      if (priorityFilter && l.priority !== priorityFilter) return false;
      if (q && ![l.name, l.email, l.phone, l.property].some((v) => v?.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [activeTab, globalFilter, leads, priorityFilter, sourceFilter]);

  const kanbanGroups = useMemo(() => (
    KANBAN_COLS.map((col) => ({
      ...col, leads: filteredData.filter((l) => l.status === col.status),
    }))
  ), [filteredData]);

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "Contact",
      cell: ({ row: { original: r } }) => (
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{r.name}</p>
          {r.email && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>✉ {r.email}</p>}
          {r.phone && <p style={{ margin: "1px 0 0", fontSize: 11, color: "#94a3b8" }}>📞 {r.phone}</p>}
        </div>
      ),
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
      cell: ({ row: { original: r } }) => (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f1f5f9", color: "#475569" }}>
            {SOURCE_ICON[r.source] ?? "🔗"} {r.source}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f1f5f9", color: "#475569" }}>
            {INTENT_ICON[r.intent] ?? "📌"} {r.intent}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const s   = info.getValue();
        const sty = STATUS_STYLE[s] ?? STATUS_STYLE["Archived"];
        const dot = STATUS_DOT[s]   ?? "#94a3b8";
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: sty.bg, color: sty.color }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block" }} />
            {s}
          </span>
        );
      },
    }),
    columnHelper.accessor("priority", {
      header: "Priority",
      cell: (info) => {
        const sty = PRIORITY_STYLE[info.getValue()] ?? PRIORITY_STYLE["Low"];
        return (
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: sty.bg, color: sty.color, border: `1px solid ${sty.border}` }}>
            {info.getValue()}
          </span>
        );
      },
    }),
    columnHelper.accessor("assignedTo", {
      header: "Assigned To",
      cell: (info) => info.getValue()
        ? <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{info.getValue()}</span>
        : <span style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>Unassigned</span>,
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => <span style={{ fontSize: 12, color: "#94a3b8" }}>{timeAgo(info.getValue())}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <LeadActionsMenu
          lead={row.original}
          onViewDetails={setSelectedLead}
          onChangePriority={setPriorityLead}
          onAssignAgent={openAssignModal}
        />
      ),
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    getRowId: (row, index) => row.id ?? row.email ?? row.phone ?? String(index),
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });
  const visibleRows = table.getRowModel().rows;


  // ── Early returns AFTER all hooks ──────────────────────────────────────────
  if (selectedLead) {
    return <LeadDetailView lead={selectedLead} onBack={() => setSelectedLead(null)} />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ height: 28, background: "#e2e8f0", borderRadius: 8, width: 80, marginBottom: 8 }} />
        <div style={{ height: 14, background: "#f1f5f9", borderRadius: 6, width: 200, marginBottom: 24 }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ height: 52, background: "#f1f5f9", borderRadius: 10, marginBottom: 10 }} />
        ))}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "28px 24px", minHeight: "100%", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Leads</h1>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Manage and track all incoming leads</p>
        </div>
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4, gap: 2 }}>
          {[{ id: "table", label: "Table" }, { id: "kanban", label: "Board" }].map(({ id, label }) => (
            <button key={id} onClick={() => setView(id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: view === id ? "#fff" : "transparent", color: view === id ? "#0f172a" : "#64748b", boxShadow: view === id ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}>
              {id === "table" ? <LayoutList size={15} /> : <LayoutGrid size={15} />} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by name, email, phone, or property..."
            style={{ width: "100%", paddingLeft: 32, paddingRight: 10, paddingTop: 9, paddingBottom: 9, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#334155", outline: "none", boxSizing: "border-box", background: "#fafafa" }}
          />
        </div>
        {[
          { value: sourceFilter,   set: setSourceFilter,   label: "Source",   opts: ["Website", "App", "Whatsapp", "Call"] },
          { value: priorityFilter, set: setPriorityFilter, label: "Priority", opts: ["High", "Medium", "Low", "Urgent"] },
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

      {/* TABLE VIEW */}
      {view === "table" && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {/* Status tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "10px 14px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap" }}>
            {TABS.map((tab) => {
              const count    = tabCounts[tab] ?? 0;
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, border: "none", background: isActive ? "#f1f5f9" : "transparent", color: isActive ? "#0f172a" : "#64748b", fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.15s" }}>
                  {tab}
                  {count > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: isActive ? "#1e293b" : "#e2e8f0", color: isActive ? "#fff" : "#64748b" }}>{count}</span>}
                </button>
              );
            })}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
                {table.getHeaderGroups().map((hg) =>
                  hg.headers.map((h) => (
                    <th key={h.id} onClick={h.column.getToggleSortingHandler()} style={thStyle}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted()] ?? ""}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No leads found</td></tr>
              ) : (
                visibleRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: idx < visibleRows.length - 1 ? "1px solid #f8fafc" : "none", background: "#fff", cursor: "pointer", transition: "background 0.1s" }}
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
              Showing <strong style={{ color: "#475569" }}>{visibleRows.length}</strong> of <strong style={{ color: "#475569" }}>{filteredData.length}</strong> leads
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} style={{ padding: "5px 14px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, color: "#475569", background: "#fff", cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed", opacity: table.getCanPreviousPage() ? 1 : 0.4 }}>Previous</button>
              {Array.from({ length: table.getPageCount() }).map((_, i) => (
                <button key={i} onClick={() => table.setPageIndex(i)} style={{ width: 30, height: 30, borderRadius: 7, fontSize: 12, fontWeight: 700, border: table.getState().pagination.pageIndex === i ? "none" : "1px solid #e2e8f0", background: table.getState().pagination.pageIndex === i ? "#1e293b" : "#fff", color: table.getState().pagination.pageIndex === i ? "#fff" : "#475569", cursor: "pointer" }}>{i + 1}</button>
              ))}
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} style={{ padding: "5px 14px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, color: "#475569", background: "#fff", cursor: table.getCanNextPage() ? "pointer" : "not-allowed", opacity: table.getCanNextPage() ? 1 : 0.4 }}>Next</button>
            </div>
          </div>
        </div>
      )}

      {/* KANBAN VIEW */}
      {view === "kanban" && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {TABS.map((tab) => {
              const count    = tabCounts[tab] ?? 0;
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: `1px solid ${isActive ? "#1e293b" : "#e2e8f0"}`, background: isActive ? "#1e293b" : "#fff", color: isActive ? "#fff" : "#64748b", fontSize: 12, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.15s" }}>
                  {tab}
                  {count > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 99, background: isActive ? "rgba(255,255,255,0.2)" : "#e2e8f0", color: isActive ? "#fff" : "#64748b" }}>{count}</span>}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", overflowX: "auto", paddingBottom: 8 }}>
            {kanbanGroups.map((col) => (
              <div key={col.status} style={{ flex: "1 1 0", minWidth: 220, maxWidth: 300 }}>
                <KanbanColumn col={col} leads={col.leads} />
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
            Showing <strong style={{ color: "#475569" }}>{filteredData.length}</strong> leads across {kanbanGroups.filter((c) => c.leads.length > 0).length} columns
          </p>
        </div>
      )}

      {/* Change Priority Modal */}
      {priorityLead && (
        <ChangePriorityModal
          lead={priorityLead}
          onClose={() => setPriorityLead(null)}
          onSave={handlePrioritySave}
        />
      )}

      {/* Assign Agent Modal */}
      {assigningLead && (
        <div
          onClick={assignLeadMutation.isPending ? undefined : closeAssignModal}
          style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 520, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Assign Agent</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{assigningLead.name}</p>
              </div>
              <button
                type="button"
                onClick={closeAssignModal}
                disabled={assignLeadMutation.isPending}
                style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, color: "#475569", padding: "6px 10px", fontSize: 12, cursor: assignLeadMutation.isPending ? "not-allowed" : "pointer", opacity: assignLeadMutation.isPending ? 0.6 : 1 }}
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>Assigned Agent</p>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  disabled={assignLeadMutation.isPending || isAgentsLoading}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid #cbd5e1", fontSize: 13, color: "#0f172a", background: "#fff", outline: "none" }}
                >
                  <option value="">Unassigned</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              {isAgentsLoading && (
                <div style={{ marginBottom: 12, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", borderRadius: 10, padding: 10, fontSize: 12 }}>
                  Loading active agents...
                </div>
              )}

              {agentsErrorMessage && (
                <div style={{ marginBottom: 12, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: 10, fontSize: 12 }}>
                  {agentsErrorMessage}
                </div>
              )}

              {!isAgentsLoading && !agentsErrorMessage && agents.length === 0 && (
                <div style={{ marginBottom: 12, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", borderRadius: 10, padding: 10, fontSize: 12 }}>
                  No active agents available.
                </div>
              )}

              {assignError && (
                <div style={{ marginBottom: 12, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: 10, fontSize: 12 }}>
                  {assignError}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={closeAssignModal}
                  disabled={assignLeadMutation.isPending}
                  style={{ border: "1px solid #e2e8f0", background: "#fff", color: "#334155", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: assignLeadMutation.isPending ? "not-allowed" : "pointer", opacity: assignLeadMutation.isPending ? 0.6 : 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={submitAssignModal}
                  disabled={assignLeadMutation.isPending || (selectedAgentId || "") === (assigningLead?.assignedAgentId || "")}
                  style={{ border: "1px solid #1e293b", background: "#1e293b", color: "#fff", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: assignLeadMutation.isPending ? "not-allowed" : "pointer", opacity: (assignLeadMutation.isPending || (selectedAgentId || "") === (assigningLead?.assignedAgentId || "")) ? 0.5 : 1 }}
                >
                  {assignLeadMutation.isPending ? "Saving..." : selectedAgentId ? "Save Assignment" : "Unassign Agent"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
