// 📁 src/features/admin/pages/UsersAgentsPage.jsx

import { useState, useMemo } from "react";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, createColumnHelper, flexRender,
} from "@tanstack/react-table";
import { Search, ChevronDown, MoreHorizontal } from "lucide-react";
import useUsers from "../hooks/useUsers";

// ── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = {
  SM: { bg: "#e2e8f0", color: "#475569" },
  AK: { bg: "#e2e8f0", color: "#475569" },
  DL: { bg: "#e2e8f0", color: "#475569" },
  JD: { bg: "#e2e8f0", color: "#475569" },
  LR: { bg: "#e2e8f0", color: "#475569" },
  AU: { bg: "#e2e8f0", color: "#475569" },
};

function Avatar({ initials }) {
  const s = AVATAR_COLORS[initials] ?? { bg: "#e2e8f0", color: "#475569" };
  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const map = {
    Agent:   { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
    Manager: { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
    Admin:   { bg: "#fef3c7", color: "#b45309", border: "#fde68a" },
  };
  const s = map[role] ?? map.Agent;
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 99, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
      {role}
    </span>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const active = status === "Active";
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 99, background: active ? "#dcfce7" : "#f1f5f9", color: active ? "#15803d" : "#64748b", border: `1px solid ${active ? "#bbf7d0" : "#e2e8f0"}`, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

// ── Territory pill ───────────────────────────────────────────────────────────
function Territory({ name }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99, background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      {name}
    </span>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label }) {
  return (
    <div style={{ flex: 1, background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{value}</p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{label}</p>
      </div>
    </div>
  );
}

const columnHelper = createColumnHelper();

export default function UsersAgentsPage() {
  const { data: users = [], isLoading } = useUsers();
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter,   setRoleFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Stats
  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter((u) => u.status === "Active").length,
    agents:   users.filter((u) => u.role === "Agent").length,
    admins:   users.filter((u) => u.role === "Admin" || u.role === "Manager").length,
  }), [users]);

  // Filtered data
  const filteredData = useMemo(() => {
    let data = users;
    if (roleFilter)   data = data.filter((u) => u.role === roleFilter);
    if (statusFilter) data = data.filter((u) => u.status === statusFilter);
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      data = data.filter((u) =>
        u.name.toLowerCase().includes(q)  ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    return data;
  }, [users, roleFilter, statusFilter, globalFilter]);

  // Columns
  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "User",
      cell: (i) => {
        const u = i.row.original;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar initials={u.initials} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{u.name}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                {u.email}
              </p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (i) => <RoleBadge role={i.getValue()} />,
    }),
    columnHelper.accessor("manager", {
      header: "Manager",
      cell: (i) => {
        const m = i.getValue();
        return m
          ? <span style={{ fontSize: 13, color: "#374151" }}>{m}</span>
          : <span style={{ fontSize: 13, color: "#94a3b8" }}>—</span>;
      },
    }),
    columnHelper.accessor("territories", {
      header: "Territories",
      cell: (i) => {
        const arr = i.getValue();
        if (!arr || arr.length === 0) return <span style={{ fontSize: 13, color: "#94a3b8" }}>—</span>;
        return (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {arr.map((t) => <Territory key={t} name={t} />)}
          </div>
        );
      },
    }),
    columnHelper.accessor("activeLeads", {
      header: "Active Leads",
      cell: (i) => {
        const v = i.getValue();
        return v !== null && v !== undefined
          ? <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{v}</span>
          : <span style={{ fontSize: 13, color: "#94a3b8" }}>—</span>;
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (i) => <StatusBadge status={i.getValue()} />,
    }),
    columnHelper.accessor("lastLogin", {
      header: "Last Login",
      cell: (i) => (
        <span style={{ fontSize: 13, color: "#64748b" }}>{i.getValue()}</span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: () => (
        <button
          style={{ padding: 6, border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8", borderRadius: 6, display: "flex", alignItems: "center" }}
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
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => <div key={i} style={{ flex: 1, height: 80, background: "#f1f5f9", borderRadius: 14 }} />)}
      </div>
      {[...Array(5)].map((_, i) => <div key={i} style={{ height: 56, background: "#f1f5f9", borderRadius: 10, marginBottom: 10 }} />)}
    </div>
  );

  return (
    <div style={{ padding: "28px 24px", minHeight: "100%", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Users & Agents</h1>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Manage team members and their roles</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard
          value={stats.total}
          label="Total Users"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard
          value={stats.active}
          label="Active"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>}
        />
        <StatCard
          value={stats.agents}
          label="Agents"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>}
        />
        <StatCard
          value={stats.admins}
          label="Admins/Managers"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/><path d="M19 11l2 2-4 4-2-2"/></svg>}
        />
      </div>

      {/* Search + Filters */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search by name, email, or phone..."
            style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#334155", outline: "none", boxSizing: "border-box", background: "#fafafa" }}
          />
        </div>
        {[
          { value: roleFilter,   set: setRoleFilter,   label: "All Roles", opts: ["Agent","Manager","Admin"] },
          { value: statusFilter, set: setStatusFilter, label: "Status",    opts: ["Active","Inactive"] },
        ].map(({ value, set, label, opts }) => (
          <div key={label} style={{ position: "relative" }}>
            <select value={value} onChange={(e) => set(e.target.value)} style={{ appearance: "none", paddingLeft: 12, paddingRight: 28, paddingTop: 9, paddingBottom: 9, border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: value ? "#1e293b" : "#64748b", background: "#fff", cursor: "pointer", outline: "none", minWidth: 120 }}>
              <option value="">{label}</option>
              {opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              {table.getHeaderGroups().map((hg) =>
                hg.headers.map((header) => (
                  <th key={header.id} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No users found</td></tr>
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
            Showing <strong style={{ color: "#475569" }}>{filteredData.length}</strong> of <strong style={{ color: "#475569" }}>{users.length}</strong> users
          </p>
          <div style={{ display: "flex", gap: 6 }}>
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