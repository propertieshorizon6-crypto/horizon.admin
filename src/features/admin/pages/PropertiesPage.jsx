import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronDown, Plus, Download } from "lucide-react";
import useProperties from "../hooks/useProperties";
import PropertyActionsMenu from "../components/PropertyActionsMenu";
import PropertyDetailPage from "../components/PropertyDetailPage";
import { assignPropertyAgent, markPropertySold } from "../api/propertiesApi";
import { fetchFacebookImport, fetchImportStatus, cancelImportBatch } from "../api/facebookApi";
import { fetchUsers, MOCK_MODE as USERS_MOCK_MODE, MOCK_USERS } from "../api/usersApi";
import AddPropertyPage from "./AddPropertyPage";
import EditPropertyModal from "../components/EditPropertyModal";

const BedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v6H2M2 20h20M7 8v4" />
  </svg>
);

const BathIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    <line x1="10" y1="5" x2="8" y2="7" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

const AreaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

const PhotoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const DocIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const PinIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

function StatusBadge({ status }) {
  const map = {
    Active:   { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
    Draft:    { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
    Archived: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
    Sold:     { bg: "#ede9fe", color: "#6d28d9", border: "#ddd6fe" },
    Rejected: { bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
    Inactive: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
  };

  const style = map[status] ?? map.Draft;

  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 99,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function ComplianceBadge({ value, issues = [] }) {
  const [hovered, setHovered] = useState(false);
  const hasIssues = issues.length > 0;

  if (value === "Compliant") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 99,
          background: "#dcfce7",
          color: "#15803d",
          border: "1px solid #bbf7d0",
          whiteSpace: "nowrap",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Compliant
      </span>
    );
  }

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => hasIssues && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 99,
          background: "#fef9c3",
          color: "#a16207",
          border: "1px solid #fde68a",
          whiteSpace: "nowrap",
          cursor: "default",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        {value}
      </span>

      {hovered && hasIssues && (
        <span style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1e293b",
          color: "#f8fafc",
          fontSize: 11,
          fontWeight: 500,
          borderRadius: 6,
          padding: "6px 10px",
          whiteSpace: "nowrap",
          zIndex: 9999,
          pointerEvents: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}>
          {issues.map((issue) => (
            <span key={issue} style={{ display: "block" }}>• {issue}</span>
          ))}
          {/* arrow */}
          <span style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid #1e293b",
          }} />
        </span>
      )}
    </span>
  );
}


const STATUS_META = {
  queued:     { label:"Queued",     bg:"#f1f5f9", color:"#475569", dot:"#94a3b8" },
  processing: { label:"Processing", bg:"#fef9c3", color:"#854d0e", dot:"#eab308" },
  completed:  { label:"Imported",   bg:"#dcfce7", color:"#15803d", dot:"#22c55e" },
  filtered:   { label:"Filtered",   bg:"#f1f5f9", color:"#64748b", dot:"#cbd5e1" },
  failed:     { label:"Failed",     bg:"#fee2e2", color:"#dc2626", dot:"#f87171" },
};

const PROP_STATUS_STYLE = {
  draft:    { bg:"#f1f5f9", color:"#475569" },
  active:   { bg:"#dcfce7", color:"#15803d" },
  sold:     { bg:"#ede9fe", color:"#6d28d9" },
  pending:  { bg:"#fef9c3", color:"#854d0e" },
  rejected: { bg:"#fee2e2", color:"#dc2626" },
};

function FacebookImportDialog({ batchId, onClose }) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [cancelError, setCancelError] = useState("");
  const LIMIT = 15;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["fb-import-status", statusFilter, page],
    queryFn: () => fetchImportStatus({ ...(statusFilter ? { status: statusFilter } : {}), page, limit: LIMIT }),
    // Poll every 3s while work is in flight; stop once nothing is queued/processing.
    refetchInterval: (query) => {
      const jobs = query.state.data?.jobs;
      if (!jobs) return 3000; // first load — keep polling until we have data
      const running = jobs.some((j) => ["queued", "processing"].includes(j.status));
      // A freshly started batch may have no jobs yet — keep polling until they appear.
      if (running || (batchId && jobs.length === 0)) return 3000;
      return false;
    },
  });

  const items      = Array.isArray(data?.jobs) ? data.jobs : [];
  const total      = data?.pagination?.total ?? items.length;
  const totalPages = data?.pagination?.pages ?? Math.max(1, Math.ceil(total / LIMIT));

  // Compute counts from current page items when API doesn't return them
  const counts = useMemo(() => {
    const c = {};
    items.forEach(item => {
      const s = item.status ?? "queued";
      c[s] = (c[s] ?? 0) + 1;
    });
    return c;
  }, [items]);

  const hasActive = items.some(i => ["queued","processing"].includes(i.status));
  const allDone   = !isLoading && items.length > 0 && !hasActive;

  const cancelMutation = useMutation({
    mutationFn: () => cancelImportBatch(batchId),
    onSuccess: () => {
      setCancelError("");
      queryClient.invalidateQueries({ queryKey: ["fb-import-status"] });
    },
    onError: (err) => {
      setCancelError(err?.response?.data?.error?.message
        || err?.response?.data?.message
        || "Could not cancel — the batch may have already finished.");
    },
  });

  return (
    <div
      onClick={onClose}
      style={{ position:"fixed", inset:0, zIndex:4000, background:"rgba(15,23,42,0.5)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width:"100%", maxWidth:600, maxHeight:"85vh", display:"flex", flexDirection:"column",
          background:"#fff", borderRadius:16, border:"1px solid #e2e8f0",
          boxShadow:"0 20px 60px rgba(0,0,0,0.18)", overflow:"hidden" }}
      >
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"16px 20px", borderBottom:"1px solid #f1f5f9", flexShrink:0 }}>
          <div>
            <p style={{ margin:0, fontSize:16, fontWeight:800, color:"#000" }}>Facebook Import</p>
            <p style={{ margin:"2px 0 0", fontSize:12, color:"#94a3b8" }}>
              {allDone ? `Import complete · ${items.length} posts processed`
                : hasActive ? "Processing posts…"
                : isFetching ? "Updating…"
                : `${items.length} posts`}
            </p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {hasActive && (
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e",
                display:"inline-block", animation:"pulse 1.5s infinite" }} />
            )}
            {batchId && hasActive && (
              <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}
                style={{ border:"1px solid #fecaca", background:"#fff", borderRadius:8,
                  color:"#dc2626", padding:"6px 12px", fontSize:12, fontWeight:600,
                  cursor: cancelMutation.isPending ? "not-allowed" : "pointer",
                  opacity: cancelMutation.isPending ? 0.6 : 1 }}>
                {cancelMutation.isPending ? "Cancelling…" : "Cancel Import"}
              </button>
            )}
            <button onClick={onClose}
              style={{ border:"1px solid #e2e8f0", background:"#fff", borderRadius:8,
                color:"#475569", padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              Close
            </button>
          </div>
        </div>

        {cancelError && (
          <div style={{ padding:"10px 20px", background:"#fef2f2", borderBottom:"1px solid #fecaca",
            color:"#b91c1c", fontSize:12, fontWeight:500, flexShrink:0 }}>
            {cancelError}
          </div>
        )}

        {/* Summary counts */}
        {Object.keys(counts).length > 0 && (
          <div style={{ display:"flex", gap:8, padding:"12px 20px", borderBottom:"1px solid #f1f5f9",
            flexWrap:"wrap", flexShrink:0 }}>
            {Object.entries(counts).map(([key, val]) => {
              const m = STATUS_META[key] ?? STATUS_META.queued;
              return (
                <div key={key} style={{ display:"flex", alignItems:"center", gap:6,
                  padding:"4px 12px", borderRadius:99, background:m.bg }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:m.dot, flexShrink:0 }} />
                  <span style={{ fontSize:12, fontWeight:700, color:m.color }}>{val} {m.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:0, padding:"0 20px", borderBottom:"1px solid #f1f5f9",
          overflow:"hidden", flexShrink:0 }}>
          {["", "queued", "processing", "completed", "filtered", "failed"].map(s => {
            const active = statusFilter === s;
            const label = s ? (STATUS_META[s]?.label ?? s) : "All";
            return (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                style={{ padding:"10px 14px", border:"none", background:"transparent", cursor:"pointer",
                  fontSize:12, fontWeight: active ? 700 : 500, whiteSpace:"nowrap",
                  color: active ? "#000" : "#64748b",
                  borderBottom: active ? "2px solid #2D368E" : "2px solid transparent" }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div style={{ overflowY:"auto", flex:1 }}>
          {isLoading ? (
            [...Array(5)].map((_,i) => (
              <div key={i} style={{ display:"flex", gap:12, padding:"12px 20px", borderBottom:"1px solid #f8fafc" }}>
                <div style={{ width:52, height:40, borderRadius:6, background:"#f1f5f9", flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ height:12, background:"#f1f5f9", borderRadius:4, marginBottom:6, width:"60%" }} />
                  <div style={{ height:10, background:"#f8fafc", borderRadius:4, width:"40%" }} />
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <p style={{ textAlign:"center", color:"#94a3b8", fontSize:13, padding:"40px 0" }}>
              No posts found{statusFilter ? ` with status "${STATUS_META[statusFilter]?.label}"` : ""}
            </p>
          ) : items.map((item, i) => {
            const s  = item.status ?? "queued";
            const m  = STATUS_META[s] ?? STATUS_META.queued;
            const title = item.openAiResponse?.title ?? item.propertyId?.title
              ?? item.rawData?.message?.split("\n")[0] ?? `Post #${i+1}`;
            const snippet = item.rawData?.message
              ? item.rawData.message.split("\n").slice(0,2).join(" · ").slice(0,80)
              : null;
            const thumb = item.rawData?.full_picture;
            const prop  = item.propertyId;
            const propStatus = prop?.status;
            const propStyle  = PROP_STATUS_STYLE[propStatus] ?? PROP_STATUS_STYLE.draft;

            return (
              <div key={item._id ?? i}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 20px",
                  borderBottom:"1px solid #f8fafc" }}>
                {/* Thumbnail */}
                {thumb
                  ? <img src={thumb} alt="" style={{ width:52, height:40, objectFit:"cover",
                      borderRadius:6, border:"1px solid #e2e8f0", flexShrink:0 }} />
                  : <div style={{ width:52, height:40, borderRadius:6, background:"#f1f5f9",
                      border:"1px solid #e2e8f0", flexShrink:0, display:"flex",
                      alignItems:"center", justifyContent:"center", fontSize:16 }}>🏠</div>
                }

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#000",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {title}
                  </p>
                  {snippet && (
                    <p style={{ margin:"2px 0 0", fontSize:11, color:"#94a3b8",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {snippet}
                    </p>
                  )}
                  {item.error && (
                    <p style={{ margin:"2px 0 0", fontSize:11, color:"#dc2626" }}>
                      {typeof item.error === "string" ? item.error : item.error?.message ?? "An error occurred"}
                    </p>
                  )}
                  {!item.error && item.filterReason && (
                    <p style={{ margin:"2px 0 0", fontSize:11, color:"#94a3b8", fontStyle:"italic" }}>
                      {item.filterReason}
                    </p>
                  )}
                </div>

                {/* Right side */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:99,
                    background:m.bg, color:m.color }}>
                    {m.label}
                  </span>
                  {prop && propStatus && (
                    <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:99,
                      background:propStyle.bg, color:propStyle.color }}>
                      {propStatus}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"10px 20px", borderTop:"1px solid #f1f5f9", flexShrink:0 }}>
            <p style={{ margin:0, fontSize:12, color:"#94a3b8" }}>
              Page {page} of {totalPages} · {total} posts
            </p>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                style={{ padding:"5px 12px", border:"1px solid #e2e8f0", borderRadius:7,
                  fontSize:12, background:"#fff", color:"#475569", cursor: page===1?"not-allowed":"pointer",
                  opacity: page===1 ? 0.4 : 1 }}>Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                style={{ padding:"5px 12px", border:"1px solid #2D368E", borderRadius:7,
                  fontSize:12, background:"#2D368E", color:"#fff", cursor: page===totalPages?"not-allowed":"pointer",
                  opacity: page===totalPages ? 0.4 : 1 }}>Next</button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}

const TABS = ["All", "Draft", "Active", "Sold", "Rejected", "Inactive"];
const columnHelper = createColumnHelper();

export default function PropertiesPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [compFilter, setCompFilter] = useState("");

  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: 20,
    ...(activeTab !== "All" ? { status: activeTab.toLowerCase() } : {}),
  }), [currentPage, activeTab]);

  const { data: propertiesData, isLoading, isFetching } = useProperties(queryParams);
  const properties  = propertiesData?.properties ?? [];
  const metaCounts  = propertiesData?.meta ?? {};
  const pagination  = propertiesData?.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 1 };
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAddPage, setShowAddPage] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [assigningProperty, setAssigningProperty] = useState(null);
  const [selectedAgentId,   setSelectedAgentId]   = useState("");
  const [assignError,       setAssignError]        = useState("");
  const [agentsEnabled,     setAgentsEnabled]      = useState(false);
  const [importDialog,      setImportDialog]       = useState(false);
  const [importBatchId,     setImportBatchId]      = useState(null);
  const [importToast,       setImportToast]        = useState(null);

  const showImportToast = (type, message) => {
    setImportToast({ type, message });
    setTimeout(() => setImportToast(null), 5000);
  };

  const fbImportMutation = useMutation({
    mutationFn: () => fetchFacebookImport(30),
    onSuccess: (data) => {
      setImportBatchId(data?.batchId ?? null);
      setImportDialog(true);
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["properties"] }), 8000);
    },
    onError: (err) => {
      showImportToast("error", err?.response?.data?.message || "Facebook import failed.");
    },
  });

  // ── Agents query — lazy: only fires after the user first opens the modal ───
  const {
    data: agentUsers = [],
    isLoading: isAgentsLoading,
    isError: isAgentsError,
    error: agentsQueryError,
  } = useQuery({
    queryKey: ["users", "agents", "active"],
    enabled: agentsEnabled,
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

  // ── Assign property mutation ────────────────────────────────────────────────
  const assignPropertyMutation = useMutation({
    mutationFn: ({ propertyId, agentId }) => assignPropertyAgent(propertyId, agentId || null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      setAssigningProperty(null);
      setSelectedAgentId("");
      setAssignError("");
    },
    onError: (err) => {
      setAssignError(err?.response?.data?.message || "Could not update agent assignment.");
    },
  });

  // ── Mark sold / rented mutation ────────────────────────────────────────────
  const markSoldMutation = useMutation({
    mutationFn: (propertyId) => markPropertySold(propertyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["properties"] }),
  });

  const openAssignModal  = (prop) => {
    setAgentsEnabled(true);
    setAssigningProperty(prop);
    setSelectedAgentId(prop?.assignedAgentId || "");
    setAssignError("");
  };

  const closeAssignModal = () => {
    if (assignPropertyMutation.isPending) return;
    setAssigningProperty(null);
    setSelectedAgentId("");
    setAssignError("");
  };

  const submitAssignModal = () => {
    if (!assigningProperty?.id) return;
    assignPropertyMutation.mutate({ propertyId: assigningProperty.id, agentId: selectedAgentId || null });
  };

  const agentsErrorMessage = isAgentsError
    ? agentsQueryError?.response?.data?.message || agentsQueryError?.message || "Could not load agents list."
    : "";

  // Tab counts come from API meta; fall back to counting current page only
  const tabCounts = useMemo(() => ({
    All:    metaCounts.all    ?? pagination.total,
    Draft:  metaCounts.draft  ?? 0,
    Active: metaCounts.active ?? 0,
    Sold:     metaCounts.sold     ?? 0,
    Rejected: metaCounts.rejected ?? 0,
    Inactive: metaCounts.inactive ?? 0,
  }), [metaCounts, pagination.total]);

  const typeOptions = useMemo(
    () =>
      Array.from(new Set(properties.map((p) => p.type).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [properties],
  );

  // Status filtering is server-side; type/compliance/search filter the current page
  const filteredData = useMemo(() => {
    let data = properties;
    if (typeFilter) data = data.filter((p) => p.type === typeFilter);
    if (compFilter === "Compliant") data = data.filter((p) => p.compliance === "Compliant");
    else if (compFilter === "Issues") data = data.filter((p) => p.compliance !== "Compliant");
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      data = data.filter((p) => p.title?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q));
    }
    return data;
  }, [properties, typeFilter, compFilter, globalFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Property",
        cell: (info) => {
          const property = info.row.original;
          return (
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#000000",
                }}
              >
                {property.title}
              </p>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: 11,
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <PinIcon /> {property.location}
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => (
          <span style={{ fontSize: 13, fontWeight: 600, color: "#000000" }}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("beds", {
        header: "Details",
        cell: (info) => {
          const property = info.row.original;
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 12,
                color: "#475569",
              }}
            >
              {property.beds ? (
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <BedIcon /> {property.beds}
                </span>
              ) : null}
              {property.baths ? (
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <BathIcon /> {property.baths}
                </span>
              ) : null}
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <AreaIcon /> {property.area} sqm
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("media", {
        header: "Media",
        cell: (info) => {
          const media = info.getValue();
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "#475569",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <PhotoIcon /> {media?.photos ?? 0}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <DocIcon /> {media?.docs ?? 0}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("compliance", {
        header: "Compliance",
        cell: (info) => (
          <ComplianceBadge
            value={info.getValue()}
            issues={info.row.original.complianceIssues ?? []}
          />
        ),
      }),
      columnHelper.accessor("assignedTo", {
        header: "Agent",
        cell: (info) => {
          const name = info.getValue();
          return name
            ? <span style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>{name}</span>
            : <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>;
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const prop = info.row.original;
          return (
            <PropertyActionsMenu
              property={prop}
              onDeleteProperty={prop.assignedAgentId
                ? (p) => assignPropertyMutation.mutate({ propertyId: p.id, agentId: null })
                : undefined}
              deleteTitle="Remove Agent"
              onAssignAgent={openAssignModal}
              onMarkSold={prop.status === "Active"
                ? (p) => markSoldMutation.mutate(p.id)
                : undefined}
            />
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (selectedProperty) {
    return (
      <>
        <PropertyDetailPage
          propertyId={selectedProperty.id}
          property={selectedProperty}
          onBack={() => setSelectedProperty(null)}
          onEditProperty={setEditingProperty}
          onAssignAgent={openAssignModal}
        />
        {editingProperty && (
          <EditPropertyModal
            property={editingProperty}
            onClose={() => setEditingProperty(null)}
          />
        )}
        {assigningProperty && (
          <div
            onClick={assignPropertyMutation.isPending ? undefined : closeAssignModal}
            style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 520, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#000000" }}>Assign Agent</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{assigningProperty.title}</p>
                </div>
                <button type="button" onClick={closeAssignModal} disabled={assignPropertyMutation.isPending}
                  style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, color: "#475569", padding: "6px 10px", fontSize: 12, cursor: assignPropertyMutation.isPending ? "not-allowed" : "pointer", opacity: assignPropertyMutation.isPending ? 0.6 : 1 }}>
                  Close
                </button>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>Assigned Agent</p>
                  <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)}
                    disabled={assignPropertyMutation.isPending || isAgentsLoading}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid #cbd5e1", fontSize: 13, color: "#000000", background: "#fff", outline: "none" }}>
                    <option value="">Unassigned</option>
                    {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                {isAgentsLoading && <div style={{ marginBottom: 12, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", borderRadius: 10, padding: 10, fontSize: 12 }}>Loading active agents...</div>}
                {agentsErrorMessage && <div style={{ marginBottom: 12, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: 10, fontSize: 12 }}>{agentsErrorMessage}</div>}
                {!isAgentsLoading && !agentsErrorMessage && agents.length === 0 && <div style={{ marginBottom: 12, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", borderRadius: 10, padding: 10, fontSize: 12 }}>No active agents available.</div>}
                {assignError && <div style={{ marginBottom: 12, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: 10, fontSize: 12 }}>{assignError}</div>}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button type="button" onClick={closeAssignModal} disabled={assignPropertyMutation.isPending}
                    style={{ border: "1px solid #e2e8f0", background: "#fff", color: "#000000", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: assignPropertyMutation.isPending ? "not-allowed" : "pointer", opacity: assignPropertyMutation.isPending ? 0.6 : 1 }}>
                    Cancel
                  </button>
                  <button type="button" onClick={submitAssignModal}
                    disabled={assignPropertyMutation.isPending || (selectedAgentId || "") === (assigningProperty?.assignedAgentId || "")}
                    style={{ border: "1px solid #2D368E", background: "#2D368E", color: "#fff", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: assignPropertyMutation.isPending ? "not-allowed" : "pointer", opacity: (assignPropertyMutation.isPending || (selectedAgentId || "") === (assigningProperty?.assignedAgentId || "")) ? 0.5 : 1 }}>
                    {assignPropertyMutation.isPending ? "Saving..." : selectedAgentId ? "Save Assignment" : "Unassign Agent"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (showAddPage) {
    return <AddPropertyPage onBack={() => setShowAddPage(false)} />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: 32 }}>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            style={{
              height: 56,
              background: "#f1f5f9",
              borderRadius: 10,
              marginBottom: 10,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="p-4 md:p-6 min-h-full"
      style={{
        background: "#f8fafc",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      {importDialog && (
        <FacebookImportDialog
          batchId={importBatchId}
          onClose={() => setImportDialog(false)}
        />
      )}

      {importToast && (
        <div style={{
          position:"fixed", bottom:24, right:24, zIndex:9999,
          padding:"12px 18px", borderRadius:12,
          background: importToast.type === "error" ? "#fef2f2" : "#f0fdf4",
          border: `1px solid ${importToast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
          color: importToast.type === "error" ? "#b91c1c" : "#166534",
          fontSize:13, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,0.12)",
          maxWidth:380, fontFamily:"system-ui,sans-serif",
        }}>
          {importToast.message}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 10 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#000000" }}>
              Properties
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
              Manage property listings and compliance
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setImportDialog(true)}
            className="flex-1 md:flex-none"
            style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              padding:"9px 14px", borderRadius:9,
              border:"1px solid #e2e8f0", background:"#fff",
              color:"#475569", fontSize:13, fontWeight:600, cursor:"pointer",
            }}
          >
            View Status
          </button>
          <button
            onClick={() => fbImportMutation.mutate()}
            disabled={fbImportMutation.isPending}
            className="flex-1 md:flex-none"
            style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              padding:"9px 18px", borderRadius:9,
              border:"1px solid #1877f2",
              background: fbImportMutation.isPending ? "#e7f0fd" : "#fff",
              color:"#1877f2", fontSize:13, fontWeight:700,
              cursor: fbImportMutation.isPending ? "not-allowed" : "pointer",
              opacity: fbImportMutation.isPending ? 0.7 : 1,
            }}
          >
            <Download size={15} />
            {fbImportMutation.isPending ? "Importing..." : "Import from Facebook"}
          </button>
          <button
            onClick={() => setShowAddPage(true)}
            className="flex-1 md:flex-none"
            style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              padding:"9px 18px", borderRadius:9, border:"1px solid #2D368E",
              background:"#2D368E", color:"#fff", fontSize:13, fontWeight:700,
              cursor:"pointer",
            }}
          >
            <Plus size={15} /> Add Property
          </button>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          padding: "14px 16px",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Search by title or location..."
            style={{
              width: "100%",
              paddingLeft: 32,
              paddingRight: 12,
              paddingTop: 9,
              paddingBottom: 9,
              border: "1px solid #e2e8f0",
              borderRadius: 9,
              fontSize: 13,
              color: "#000000",
              outline: "none",
              boxSizing: "border-box",
              background: "#fafafa",
            }}
          />
        </div>

        {[
          {
            value: typeFilter,
            setValue: setTypeFilter,
            label: "Type",
            options: typeOptions,
          },
          {
            value: compFilter,
            setValue: setCompFilter,
            label: "Compliance",
            options: ["Compliant", "Issues"],
          },
        ].map(({ value, setValue, label, options }) => (
          <div key={label} style={{ position: "relative" }}>
            <select
              value={value}
              onChange={(event) => setValue(event.target.value)}
              style={{
                appearance: "none",
                paddingLeft: 12,
                paddingRight: 28,
                paddingTop: 9,
                paddingBottom: 9,
                border: "1px solid #e2e8f0",
                borderRadius: 9,
                fontSize: 13,
                color: value ? "#000000" : "#64748b",
                background: "#fff",
                cursor: "pointer",
                outline: "none",
                minWidth: 130,
              }}
            >
              <option value="">{label}</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              style={{
                position: "absolute",
                right: 9,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid #f1f5f9",
            gap: 4,
          }}
        >
          {TABS.map((tab) => {
            const count = tabCounts[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: isActive ? "#f1f5f9" : "transparent",
                  color: isActive ? "#000000" : "#64748b",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tab}
                {count > 0 ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "1px 7px",
                      borderRadius: 99,
                      background: isActive ? "#2D368E" : "#e2e8f0",
                      color: isActive ? "#fff" : "#64748b",
                    }}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      padding: "11px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#00000",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "48px 0",
                    textAlign: "center",
                    color: "#00000",
                    fontSize: 13,
                  }}
                >
                  No properties found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedProperty(row.original)}
                  style={{
                    borderBottom:
                      index < table.getRowModel().rows.length - 1
                        ? "1px solid #f8fafc"
                        : "none",
                    background: "#fff",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(event) =>
                    (event.currentTarget.style.background = "#fafafa")
                  }
                  onMouseLeave={(event) =>
                    (event.currentTarget.style.background = "#fff")
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ padding: "14px 16px", verticalAlign: "middle" }}
                      onClick={(e) => {
                        if (cell.column.id === "actions") {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            {isFetching && !isLoading && (
              <span style={{ marginRight: 8, color: "#94a3b8" }}>Updating…</span>
            )}
            Page <strong style={{ color: "#475569" }}>{pagination.page}</strong> of{" "}
            <strong style={{ color: "#475569" }}>{pagination.totalPages}</strong>
            {" · "}
            <strong style={{ color: "#475569" }}>{pagination.total}</strong> total
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isFetching}
              style={{
                padding: "5px 14px", border: "1px solid #e2e8f0", borderRadius: 7,
                fontSize: 12, fontWeight: 500, color: "#475569", background: "#fff",
                cursor: currentPage <= 1 || isFetching ? "not-allowed" : "pointer",
                opacity: currentPage <= 1 || isFetching ? 0.4 : 1,
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage >= pagination.totalPages || isFetching}
              style={{
                padding: "5px 14px", border: "1px solid #2D368E", borderRadius: 7,
                fontSize: 12, fontWeight: 600, color: "#fff", background: "#2D368E",
                cursor: currentPage >= pagination.totalPages || isFetching ? "not-allowed" : "pointer",
                opacity: currentPage >= pagination.totalPages || isFetching ? 0.4 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Assign Agent Modal */}
      {assigningProperty && (
        <div
          onClick={assignPropertyMutation.isPending ? undefined : closeAssignModal}
          style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 520, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#000000" }}>Assign Agent</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{assigningProperty.title}</p>
              </div>
              <button type="button" onClick={closeAssignModal} disabled={assignPropertyMutation.isPending}
                style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, color: "#475569", padding: "6px 10px", fontSize: 12, cursor: assignPropertyMutation.isPending ? "not-allowed" : "pointer", opacity: assignPropertyMutation.isPending ? 0.6 : 1 }}>
                Close
              </button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>Assigned Agent</p>
                <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)}
                  disabled={assignPropertyMutation.isPending || isAgentsLoading}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid #cbd5e1", fontSize: 13, color: "#000000", background: "#fff", outline: "none" }}>
                  <option value="">Unassigned</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              {isAgentsLoading && <div style={{ marginBottom: 12, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", borderRadius: 10, padding: 10, fontSize: 12 }}>Loading active agents...</div>}
              {agentsErrorMessage && <div style={{ marginBottom: 12, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: 10, fontSize: 12 }}>{agentsErrorMessage}</div>}
              {!isAgentsLoading && !agentsErrorMessage && agents.length === 0 && <div style={{ marginBottom: 12, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", borderRadius: 10, padding: 10, fontSize: 12 }}>No active agents available.</div>}
              {assignError && <div style={{ marginBottom: 12, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: 10, fontSize: 12 }}>{assignError}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" onClick={closeAssignModal} disabled={assignPropertyMutation.isPending}
                  style={{ border: "1px solid #e2e8f0", background: "#fff", color: "#000000", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: assignPropertyMutation.isPending ? "not-allowed" : "pointer", opacity: assignPropertyMutation.isPending ? 0.6 : 1 }}>
                  Cancel
                </button>
                <button type="button" onClick={submitAssignModal}
                  disabled={assignPropertyMutation.isPending || (selectedAgentId || "") === (assigningProperty?.assignedAgentId || "")}
                  style={{ border: "1px solid #2D368E", background: "#2D368E", color: "#fff", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: assignPropertyMutation.isPending ? "not-allowed" : "pointer", opacity: (assignPropertyMutation.isPending || (selectedAgentId || "") === (assigningProperty?.assignedAgentId || "")) ? 0.5 : 1 }}>
                  {assignPropertyMutation.isPending ? "Saving..." : selectedAgentId ? "Save Assignment" : "Unassign Agent"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
