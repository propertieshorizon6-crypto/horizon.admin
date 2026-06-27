// 📁 src/features/admin/pages/InquiriesPage.jsx

import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Inbox, X, Mail, Phone, Building2, Clock, AlertCircle, CheckCircle2, Info } from "lucide-react";
import useInquiries from "../hooks/useInquiries";
import { updateInquiryStatus, STATUS_TO_API } from "../api/inquiriesApi";

const PAGE_SIZE = 10;
const EMPTY = [];

// ── Helpers ────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff  = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (hours < 1)  return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const fmtDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ── Badge configs ──────────────────────────────────────────────────────────
const STATUS_STYLE = {
  "Open":        { bg: "#dbeafe", color: "#1d4ed8" },
  "In Progress": { bg: "#fef9c3", color: "#a16207" },
  "Pending":     { bg: "#fee2e2", color: "#dc2626" },
  "Resolved":    { bg: "#dcfce7", color: "#15803d" },
  "Closed":      { bg: "#f1f5f9", color: "#475569" },
};

const STATUS_OPTIONS = ["Open", "In Progress", "Closed"];

// ── Inquiry Detail Modal ───────────────────────────────────────────────────
function InquiryDetailModal({ inquiry, onClose, onStatusUpdate }) {
  const queryClient                         = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState(inquiry.status);
  const [toast, setToast]                   = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const mutation = useMutation({
    mutationFn: (status) => updateInquiryStatus(inquiry._id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      onStatusUpdate?.(updated);
      showToast("success", "Status updated successfully");
    },
    onError: (err) => {
      showToast("error", err?.response?.data?.message || "Could not update status");
      setSelectedStatus(inquiry.status); // revert
    },
  });

  const handleStatusChange = (newStatus) => {
    if (newStatus === selectedStatus) return;
    setSelectedStatus(newStatus);
    mutation.mutate(newStatus);
  };

  const statusSty = STATUS_STYLE[selectedStatus] ?? STATUS_STYLE["Closed"];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 4000,
        background: "rgba(15,23,42,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 540,
          background: "#fff", borderRadius: 16,
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >

        {/* ── Header ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          padding: "18px 20px 14px", borderBottom: "1px solid #f1f5f9",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#000000" }}>
                {inquiry.id}
              </h3>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px",
                borderRadius: 99, background: statusSty.bg, color: statusSty.color,
              }}>
                {selectedStatus}
              </span>
              {inquiry.sla.urgent && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", display: "flex", alignItems: "center", gap: 3 }}>
                  <AlertCircle size={12} /> {inquiry.sla.label}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
              Received {fmtDate(inquiry.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div style={{
            margin: "12px 20px 0",
            padding: "9px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 7,
            background: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
            border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
            color: toast.type === "error" ? "#b91c1c" : "#166534",
          }}>
            {toast.type === "error"
              ? <AlertCircle size={13} />
              : <CheckCircle2 size={13} />
            }
            {toast.message}
          </div>
        )}

        {/* ── Body ── */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Property */}
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <Building2 size={16} color="#64748b" />
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Property</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: "#000000" }}>{inquiry.property}</p>
            </div>
          </div>

          {/* Customer info */}
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ margin: "0 0 3px", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Name</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#000000" }}>{inquiry.customer.name}</p>
              </div>
              {inquiry.customer.email && (
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <Mail size={13} color="#94a3b8" />
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Email</p>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#000000" }}>{inquiry.customer.email}</p>
                  </div>
                </div>
              )}
              {inquiry.customer.phone && (
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <Phone size={13} color="#94a3b8" />
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Phone</p>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#000000" }}>{inquiry.customer.phone}</p>
                  </div>
                </div>
              )}
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ margin: "0 0 3px", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Agent</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: inquiry.agent ? "#000000" : "#94a3b8", fontStyle: inquiry.agent ? "normal" : "italic" }}>
                  {inquiry.agent ?? "Unassigned"}
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          {inquiry.message && (
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Message</p>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#374151", lineHeight: 1.6, border: "1px solid #f1f5f9" }}>
                {inquiry.message}
              </div>
            </div>
          )}

          {/* SLA */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: inquiry.sla.urgent ? "#dc2626" : "#64748b" }}>
            <Clock size={13} />
            <span style={{ fontWeight: 600 }}>SLA: {inquiry.sla.label}</span>
          </div>

          {/* ── Status Update ── */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Update Status
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {STATUS_OPTIONS.map((status) => {
                const ALLOWED_TRANSITIONS = {
                  "Open":        ["Open", "In Progress", "Closed"],
                  "In Progress": ["In Progress", "Closed"],
                  "Closed":      ["Closed"],
                };
                const allowedStatuses = ALLOWED_TRANSITIONS[inquiry.status] ?? STATUS_OPTIONS;
                const isAllowed = allowedStatuses.includes(status);
                const sty      = STATUS_STYLE[status] ?? STATUS_STYLE["Closed"];
                const isActive = selectedStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    disabled={mutation.isPending || !isAllowed}
                    title={!isAllowed ? "Cannot go back to this status" : undefined}
                    style={{
                      padding: "8px 18px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                      cursor: (mutation.isPending || !isAllowed) ? "not-allowed" : "pointer",
                      border: isActive ? `2px solid ${sty.color}` : "2px solid #e2e8f0",
                      background: isActive ? sty.bg : "#fff",
                      color: isActive ? sty.color : "#64748b",
                      opacity: !isAllowed ? 0.35 : mutation.isPending ? 0.7 : 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {mutation.isPending && isActive ? "Saving..." : status}
                  </button>
                );
              })}
            </div>
            {inquiry.status === "In Progress" && (
              <p style={{ margin: "8px 0 0", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                <Info size={11} /> Status can only move forward — cannot revert to Open
              </p>
            )}
            {inquiry.status === "Closed" && (
              <p style={{ margin: "8px 0 0", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                <Info size={11} /> This inquiry is closed and cannot be reopened
              </p>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "12px 20px", borderTop: "1px solid #f1f5f9",
          display: "flex", justifyContent: "flex-end",
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 20px", borderRadius: 9,
              border: "1px solid #e2e8f0", background: "#fff",
              color: "#000000", fontSize: 13, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Column helper ──────────────────────────────────────────────────────────
const columnHelper = createColumnHelper();

// ── Main Page ──────────────────────────────────────────────────────────────
export default function InquiriesPage() {
  const [globalFilter,  setGlobalFilter]   = useState("");
  const [searchQuery,   setSearchQuery]    = useState(""); // debounced
  const [showFilters,   setShowFilters]    = useState(false);
  const [statusFilter,  setStatusFilter]   = useState("");
  const [page,          setPage]           = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(globalFilter.trim()), 400);
    return () => clearTimeout(t);
  }, [globalFilter]);

  // Any filter change resets to the first page.
  useEffect(() => { setPage(1); }, [searchQuery, statusFilter]);

  // ── Server-side params ───────────────────────────────────────────────────
  const apiParams = useMemo(() => ({
    status: statusFilter ? STATUS_TO_API[statusFilter] : undefined,
    search: searchQuery || undefined,
    page,
    limit: PAGE_SIZE,
  }), [statusFilter, searchQuery, page]);

  const { data, isLoading, isFetching } = useInquiries(apiParams);
  const inquiries  = data?.inquiries  ?? EMPTY;
  const pagination = data?.pagination ?? { page: 1, total: 0, pages: 1 };

  const filteredData = inquiries;

  // ── Columns ────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    columnHelper.accessor("id", {
      header: "Inquiry ID",
      cell: (info) => (
        <span className="text-sm font-bold text-slate-700 font-mono">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => <span className="text-sm text-slate-500">{timeAgo(info.getValue())}</span>,
    }),
    columnHelper.accessor("property", {
      header: "Property",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-slate-400 shrink-0" />
          <span className="text-sm text-slate-700 font-medium truncate max-w-[160px]">{info.getValue()}</span>
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
            {c.email && <p className="text-xs text-slate-400 mt-0.5">{c.email}</p>}
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
          <span style={{ background: sty.bg, color: sty.color }}
            className="inline-block text-xs font-bold px-2.5 py-1 rounded-full">
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
          <span className={`text-xs font-semibold ${sla.urgent ? "text-red-500" : "text-slate-400"}`}>
            {sla.urgent && "⚠ "}{sla.label}
          </span>
        );
      },
    }),
  ], []);

  // ── Table ──────────────────────────────────────────────────────────────
  const table = useReactTable({
    data:              filteredData,
    columns,
    getCoreRowModel:   getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // sorts the current page only
    manualPagination:  true,
    pageCount:         pagination.pages,
  });

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
    <div className="p-4 md:p-8 min-h-full bg-slate-50">

      {/* Detail Modal */}
      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onStatusUpdate={(updated) => {
            if (updated) setSelectedInquiry((prev) => ({ ...prev, ...updated }));
          }}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Inquiries</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage customer inquiries and property interest requests
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full pl-9 pr-9 py-2.5 border border-slate-200 bg-white rounded-xl text-sm text-slate-700 focus:outline-none focus:border-orange-400 transition-colors"
          />
          <div className="group absolute right-3 top-1/2 -translate-y-1/2">
            <Info size={15} className="text-slate-400 hover:text-slate-600 cursor-help" />
            <div className="invisible group-hover:visible absolute right-0 top-6 z-20 w-64 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg">
              <p className="mb-1 font-semibold text-slate-800">You can search by:</p>
              <ul className="list-disc space-y-0.5 pl-4">
                <li>Inquiry ID (e.g. INQ-AB12CD)</li>
                <li>Property name</li>
                <li>Customer name</li>
                <li>Agent name or email</li>
                <li>Customer email</li>
                <li>Phone number</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-colors ${
            showFilters ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>

        {showFilters && (
          <>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 bg-white focus:outline-none cursor-pointer">
              <option value="">All Status</option>
              {["Open","In Progress","Closed"].map((s) => <option key={s}>{s}</option>)}
            </select>
            {statusFilter && (
              <button onClick={() => setStatusFilter("")}
                className="text-xs font-semibold text-red-500 hover:text-red-600">
                Clear filters
              </button>
            )}
          </>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {table.getHeaderGroups().map((hg) =>
                  hg.headers.map((header) => (
                    <th key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-slate-600 transition-colors">
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
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Inbox size={48} className="text-slate-300" strokeWidth={1.2} />
                      <p className="text-base font-semibold text-slate-600">No inquiries found</p>
                      <p className="text-sm text-slate-400">Inquiries will appear here when customers submit them</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedInquiry(row.original)}
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

        {pagination.total > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-400">
              Showing <span className="font-semibold text-slate-600">{filteredData.length}</span>{" "}
              on page {pagination.page} of{" "}
              <span className="font-semibold text-slate-600">{pagination.total}</span> inquiries
              {isFetching && <span className="ml-2 text-slate-300">updating…</span>}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                    pagination.page === i + 1
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}