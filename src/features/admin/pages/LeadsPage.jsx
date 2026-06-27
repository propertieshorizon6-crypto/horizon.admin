// 📁 src/features/admin/pages/LeadsPage.jsx

import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel,
  flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { Search, ChevronDown, LayoutList, LayoutGrid, Mail, Phone, Building2 } from "lucide-react";

import useLeads            from "../hooks/useLeads";
import { updateLeadPriority, assignLead, updateLeadStatus, archiveLead, unarchiveLead, UI_TO_API_STATUS, UI_TO_API_PRIORITY } from "../api/leadsApi";
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
  PRIORITY_STYLE, SOURCE_ICON, INTENT_ICON, SOURCE_ICON_FALLBACK, INTENT_ICON_FALLBACK,
} from "../constants/leadsConfig";
import { timeAgo } from "../../../utils/timeAgo";

const columnHelper = createColumnHelper();

// UI source label → backend lead source.type (the only real origins are
// enquiry/tour; Whatsapp/Call have no backing data).
const SOURCE_TO_API = { Website: "enquiry", App: "tour" };

const thStyle = {
  padding: "11px 18px", textAlign: "left", fontSize: 10, fontWeight: 700,
  color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em",
  whiteSpace: "nowrap", cursor: "pointer", userSelect: "none",
};

export default function LeadsPage() {
  const queryClient = useQueryClient();

  const [view,           setView]           = useState("table");
  const [activeTab,      setActiveTab]      = useState("All");
  const [globalFilter,   setGlobalFilter]   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sourceFilter,   setSourceFilter]   = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [agentFilter,    setAgentFilter]    = useState("");
  const [page,           setPage]           = useState(1);
  const [selectedLead,   setSelectedLead]   = useState(null);
  const [priorityLead,   setPriorityLead]   = useState(null);
  const [activeLead,     setActiveLead]     = useState(null);
  const LIMIT = 10;

  // Debounce the free-text search before it hits the server.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(globalFilter.trim()), 400);
    return () => clearTimeout(t);
  }, [globalFilter]);

  // Any server-driven filter change resets to the first page.
  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch, agentFilter, sourceFilter, priorityFilter]);

  // ── "Load all" query: powers Kanban, tab counts, DnD, and optimistic updates ──
  const ALL_PARAMS = useMemo(() => ({ archived: "all", limit: 1000 }), []);
  const { data: allData, isLoading } = useLeads(ALL_PARAMS);
  const leads = allData?.leads ?? [];

  // ── Server-paginated query: powers the Table view ──────────────────────────
  const tableParams = useMemo(() => {
    const p = { page, limit: LIMIT };
    if (activeTab === "Archived")      p.archived = "true";
    else if (activeTab !== "All")      p.status = UI_TO_API_STATUS[activeTab] ?? activeTab.toLowerCase();
    if (debouncedSearch)               p.search = debouncedSearch;
    if (agentFilter)                   p.agentId = agentFilter;
    if (SOURCE_TO_API[sourceFilter])   p.source = SOURCE_TO_API[sourceFilter];
    if (priorityFilter)                p.priority = UI_TO_API_PRIORITY[priorityFilter] ?? priorityFilter.toLowerCase();
    return p;
  }, [page, activeTab, debouncedSearch, agentFilter, sourceFilter, priorityFilter]);

  const { data: tableData, isFetching: isTableFetching } = useLeads(tableParams, { enabled: view === "table" });
  const tableLeads = tableData?.leads ?? [];
  const tablePagination = tableData?.pagination ?? { total: 0, page: 1, limit: LIMIT, pages: 1 };

  // ── DnD sensors ────────────────────────────────────────────────────────────
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // ── Update lead status mutation ─────────────────────────────────────────────
  const updateStatusMutation = useMutation({
    mutationFn: ({ leadId, status }) => updateLeadStatus(leadId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });

  // ── Archive / Unarchive mutations ───────────────────────────────────────────
  const archiveMutation = useMutation({
    mutationFn: ({ leadId, isArchived }) =>
      isArchived ? unarchiveLead(leadId) : archiveLead(leadId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });

  const unarchiveMoveMutation = useMutation({
    mutationFn: async ({ leadId, targetStatus }) => {
      await unarchiveLead(leadId);
      await updateLeadStatus(leadId, targetStatus);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });

  const handleArchive = (lead) => {
    if (!lead?.id) return;
    archiveMutation.mutate({ leadId: lead.id, isArchived: lead.status === "Archived" });
  };

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
    const allKey = ["leads", ALL_PARAMS];
    const previousAll = queryClient.getQueryData(allKey);
    const previousSelectedLead = selectedLead;

    queryClient.setQueryData(allKey, (prev) => {
      if (!prev?.leads) return prev;
      return {
        ...prev,
        leads: prev.leads.map((lead) => (
          isSameLead(lead, targetLead) ? { ...lead, priority: newPriority } : lead
        )),
      };
    });

    if (selectedLead && isSameLead(selectedLead, targetLead)) {
      setSelectedLead((prev) => (prev ? { ...prev, priority: newPriority } : prev));
    }

    if (!targetLead.id) return;

    try {
      await updateLeadPriority(targetLead.id, newPriority);
    } catch {
      queryClient.setQueryData(allKey, previousAll);
      setSelectedLead(previousSelectedLead);
    } finally {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  };

  // ── Derived data (must be before useReactTable) ────────────────────────────
  // Counts come from the "load all" query. "All" excludes archived (it has its own tab).
  const tabCounts = useMemo(() => (
    leads.reduce((acc, l) => {
      if (l.status !== "Archived") acc["All"] = (acc["All"] ?? 0) + 1;
      acc[l.status] = (acc[l.status] ?? 0) + 1;
      return acc;
    }, {})
  ), [leads]);

  // Table view: status/search/agent/archived/source/priority/pagination are all
  // server-side, so the rows come straight from the paginated query.
  const tableRows = tableLeads;

  // Kanban view: all filtering stays client-side over the full lead set.
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
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#000000" }}>{r.name}</p>
          {r.email && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}><Mail size={10} /> {r.email}</p>}
          {r.phone && <p style={{ margin: "1px 0 0", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}><Phone size={10} /> {r.phone}</p>}
        </div>
      ),
    }),
    columnHelper.accessor("property", {
      header: "Property",
      cell: (info) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#475569" }}>
          <Building2 size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
          <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("source", {
      header: "Source / Intent",
      cell: ({ row: { original: r } }) => (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(() => { const SrcIcon = SOURCE_ICON[r.source] ?? SOURCE_ICON_FALLBACK; return (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f1f5f9", color: "#475569" }}>
              <SrcIcon size={10} /> {r.source}
            </span>
          ); })()}
          {(() => { const IntIcon = INTENT_ICON[r.intent] ?? INTENT_ICON_FALLBACK; return (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f1f5f9", color: "#475569" }}>
              <IntIcon size={10} /> {r.intent}
            </span>
          ); })()}
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
          onArchive={handleArchive}
        />
      ),
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  const table = useReactTable({
    data: tableRows,
    columns,
    getRowId: (row, index) => row.id ?? row.email ?? row.phone ?? String(index),
    getCoreRowModel:     getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel:   getSortedRowModel(),
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
    <div className="p-4 md:p-6 min-h-full" style={{ background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#000000" }}>Leads</h1>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Manage and track all incoming leads</p>
        </div>
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4, gap: 2 }}>
          {[{ id: "table", label: "Table" }, { id: "kanban", label: "Board" }].map(({ id, label }) => (
            <button key={id} onClick={() => setView(id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: view === id ? "#fff" : "transparent", color: view === id ? "#000000" : "#64748b", boxShadow: view === id ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}>
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
            placeholder="Search by name, email, phone, property, or location..."
            style={{ width: "100%", paddingLeft: 32, paddingRight: 10, paddingTop: 9, paddingBottom: 9, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#000000", outline: "none", boxSizing: "border-box", background: "#fafafa" }}
          />
        </div>
        {[
          { value: sourceFilter,   set: setSourceFilter,   label: "Source",   opts: ["Website", "App"] },
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
        {/* Agent filter — server-side (admin/manager only) */}
        <div style={{ position: "relative" }}>
          <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} disabled={isAgentsLoading} style={{ appearance: "none", paddingLeft: 12, paddingRight: 28, paddingTop: 9, paddingBottom: 9, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#64748b", background: "#fff", cursor: "pointer", outline: "none", minWidth: 130 }}>
            <option value="">{isAgentsLoading ? "Loading agents…" : "Agent"}</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
        </div>
        <button
          onClick={() => { setGlobalFilter(""); setSourceFilter(""); setPriorityFilter(""); setAgentFilter(""); }}
          style={{ padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: 9, background: "#fff", cursor: "pointer", color: "#64748b", fontSize: 13, whiteSpace: "nowrap" }}
        >
          Clear Filters
        </button>
      </div>

      {/* TABLE VIEW */}
      {view === "table" && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflowX: "auto" }}>
          {/* Status tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "10px 14px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap" }}>
            {TABS.map((tab) => {
              const count    = tabCounts[tab] ?? 0;
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, border: "none", background: isActive ? "#f1f5f9" : "transparent", color: isActive ? "#000000" : "#64748b", fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.15s" }}>
                  {tab}
                  {count > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: isActive ? "#2D368E" : "#e2e8f0", color: isActive ? "#fff" : "#64748b" }}>{count}</span>}
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

          {/* Pagination — server-driven */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              {isTableFetching && <span style={{ marginRight: 8 }}>Updating…</span>}
              Page <strong style={{ color: "#475569" }}>{tablePagination.page}</strong> of <strong style={{ color: "#475569" }}>{tablePagination.pages}</strong>
              {" · "}<strong style={{ color: "#475569" }}>{tablePagination.total}</strong> leads
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || isTableFetching} style={{ padding: "5px 14px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, color: "#475569", background: "#fff", cursor: page <= 1 || isTableFetching ? "not-allowed" : "pointer", opacity: page <= 1 || isTableFetching ? 0.4 : 1 }}>Previous</button>
              {Array.from({ length: tablePagination.pages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} disabled={isTableFetching} style={{ width: 30, height: 30, borderRadius: 7, fontSize: 12, fontWeight: 700, border: page === i + 1 ? "none" : "1px solid #e2e8f0", background: page === i + 1 ? "#2D368E" : "#fff", color: page === i + 1 ? "#fff" : "#475569", cursor: isTableFetching ? "not-allowed" : "pointer" }}>{i + 1}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(tablePagination.pages, p + 1))} disabled={page >= tablePagination.pages || isTableFetching} style={{ padding: "5px 14px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, color: "#475569", background: "#fff", cursor: page >= tablePagination.pages || isTableFetching ? "not-allowed" : "pointer", opacity: page >= tablePagination.pages || isTableFetching ? 0.4 : 1 }}>Next</button>
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
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: `1px solid ${isActive ? "#2D368E" : "#e2e8f0"}`, background: isActive ? "#2D368E" : "#fff", color: isActive ? "#fff" : "#64748b", fontSize: 12, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.15s" }}>
                  {tab}
                  {count > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 99, background: isActive ? "rgba(255,255,255,0.2)" : "#e2e8f0", color: isActive ? "#fff" : "#64748b" }}>{count}</span>}
                </button>
              );
            })}
          </div>
          <DndContext
            sensors={sensors}
            onDragStart={({ active }) => setActiveLead(active.data.current?.lead ?? null)}
            onDragEnd={({ active, over }) => {
              setActiveLead(null);
              if (!over || active.id === over.id) return;
              const lead = leads.find((l) => l.id === active.id);
              if (!lead || lead.status === over.id) return;

              if (over.id === "Archived") {
                archiveMutation.mutate({ leadId: active.id, isArchived: false });
              } else if (lead.status === "Archived") {
                unarchiveMoveMutation.mutate({ leadId: active.id, targetStatus: over.id });
              } else {
                updateStatusMutation.mutate({ leadId: active.id, status: over.id });
              }
            }}
            onDragCancel={() => setActiveLead(null)}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", overflowX: "auto", paddingBottom: 8 }}>
              {kanbanGroups.map((col) => (
                <div key={col.status} style={{ flex: "1 1 0", minWidth: 220, maxWidth: 300 }}>
                  <KanbanColumn col={col} leads={col.leads} />
                </div>
              ))}
            </div>
            <DragOverlay dropAnimation={null}>
              {activeLead ? (
                <div style={{ opacity: 0.9, transform: "rotate(2deg)", pointerEvents: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 14, boxShadow: "0 12px 32px rgba(0,0,0,0.18)", minWidth: 220 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#000000" }}>{activeLead.name}</p>
                    {activeLead.email && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}><Mail size={10} /> {activeLead.email}</p>}
                    <p style={{ margin: "6px 0 0", fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 3 }}><Building2 size={10} /> {activeLead.property}</p>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
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
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#000000" }}>Assign Agent</p>
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
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid #cbd5e1", fontSize: 13, color: "#000000", background: "#fff", outline: "none" }}
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
                  style={{ border: "1px solid #e2e8f0", background: "#fff", color: "#000000", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: assignLeadMutation.isPending ? "not-allowed" : "pointer", opacity: assignLeadMutation.isPending ? 0.6 : 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={submitAssignModal}
                  disabled={assignLeadMutation.isPending || (selectedAgentId || "") === (assigningLead?.assignedAgentId || "")}
                  style={{ border: "1px solid #2D368E", background: "#2D368E", color: "#fff", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: assignLeadMutation.isPending ? "not-allowed" : "pointer", opacity: (assignLeadMutation.isPending || (selectedAgentId || "") === (assigningLead?.assignedAgentId || "")) ? 0.5 : 1 }}
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
