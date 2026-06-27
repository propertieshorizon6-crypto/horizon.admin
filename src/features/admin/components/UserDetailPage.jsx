// 📁 src/features/admin/components/UserDetailPage.jsx

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, MapPin, Calendar, Clock, User } from "lucide-react";
import { MOCK_MODE as USERS_MOCK_MODE, fetchUserDetail } from "../api/usersApi";
import { MOCK_MODE as PROPERTIES_MOCK_MODE, fetchProperties } from "../api/propertiesApi";

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fmtDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function timeAgoStr(val) {
  if (!val) return "—";
  const diff = Date.now() - new Date(val).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge components
// ─────────────────────────────────────────────────────────────────────────────
const normalizeText = (value = "") => String(value || "").trim().toLowerCase();

const getUserNameKeys = (user = {}) => {
  const keys = new Set();

  const fullName = normalizeText(user.name);
  const firstName = normalizeText(user.firstName);
  const lastName = normalizeText(user.lastName);
  const combined = normalizeText(`${firstName} ${lastName}`);

  if (fullName) keys.add(fullName);
  if (combined) keys.add(combined);

  return keys;
};

const isPropertyAssignedToUser = (property = {}, user = {}) => {
  const userId = String(user.id || "").trim();
  if (!userId) return false;

  const assignedAgentId = String(property.assignedAgentId || "").trim();
  const assignedOwnerId = String(property.assignedOwnerId || "").trim();

  if (assignedAgentId === userId || assignedOwnerId === userId) return true;

  const assignedName = normalizeText(property.assignedTo);
  if (!assignedName) return false;

  return getUserNameKeys(user).has(assignedName);
};

function RoleBadge({ role }) {
  const map = {
    Agent:   { bg: "transparent", color: "#64748b", border: "#cbd5e1" },
    Manager: { bg: "transparent", color: "#1d4ed8", border: "#93c5fd" },
    Admin:   { bg: "transparent", color: "#b45309", border: "#fde68a" },
  };
  const s = map[role] ?? map.Agent;
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const active = status?.toLowerCase() === "active";
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: active ? "#dcfce7" : "#f1f5f9", color: active ? "#15803d" : "#64748b", border: `1px solid ${active ? "#bbf7d0" : "#e2e8f0"}` }}>
      {status ?? "—"}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat card (top row)
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, iconBg = "#f8fafc" }) {
  return (
    <div style={{ flex: 1, background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#000000", lineHeight: 1 }}>{value ?? 0}</p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview tab
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ user, onViewAssignedProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Contact Details */}
      <div>
        <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#000000" }}>Contact Details</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Email */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 18px" }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <Mail size={11} /> Email
            </p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#000000" }}>{user.email ?? "—"}</p>
          </div>
          {/* Phone */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 18px" }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#94a3b8", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <Phone size={11} /> Phone
            </p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#000000" }}>{user.phone ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Assigned Territories */}
      <div>
        <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#000000" }}>Assigned Territories</p>
        {user.territories?.length > 0 ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {user.territories.map((t) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 99, background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" }}>
                <MapPin size={10} color="#94a3b8" /> {t}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>No territories assigned</p>
        )}
      </div>

      {/* Reports To */}
      <div>
        <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#000000" }}>Reports To</p>
        {user.manager ? (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e2e8f0", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {getInitials(user.manager)}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#000000" }}>{user.manager}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{user.managerRole ?? "Manager"}</p>
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>No manager assigned</p>
        )}
      </div>

      {/* Assigned Properties */}
      <div>
        <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#000000" }}>Assigned Properties</p>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600, color: "#374151" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            {user.assignedProperties ?? 0} active listings
          </span>
          <button
            type="button"
            onClick={onViewAssignedProperties}
            style={{ fontSize: 12, fontWeight: 600, color: "#000000", background: "transparent", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            View All
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent Activity tab
// ─────────────────────────────────────────────────────────────────────────────
function ActivityTab({ user }) {
  const activities = user.recentActivity ?? [
    { action: "Closed lead",     detail: "Mohammed Al-Rashid — Villa JBR", time: "2h ago" },
    { action: "Tour completed",  detail: "Marina View Tower — 3BR Apt",    time: "5h ago" },
    { action: "New lead assigned", detail: "Priya Sharma — Studio",        time: "1d ago" },
    { action: "Property updated", detail: "Downtown Penthouse",             time: "2d ago" },
    { action: "Tour scheduled",  detail: "Jumeirah Heights — 2BR",         time: "3d ago" },
  ];

  if (!activities.length) {
    return (
      <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "24px 0" }}>
        No recent activity available
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {activities.map((a, i) => (
        <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < activities.length - 1 ? "1px solid #f8fafc" : "none", alignItems: "flex-start" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2D368E", marginTop: 5, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>{a.action}</p>
            {a.detail && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{a.detail}</p>}
          </div>
          <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0 }}>{a.time}</span>
        </div>
      ))}
    </div>
  );
}

function AssignedPropertiesModal({
  open,
  userName,
  properties,
  isLoading,
  isError,
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 16px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#000000" }}>
              Assigned Properties
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
              {userName || "User"} - {properties.length} item(s)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid #e2e8f0",
              background: "#fff",
              borderRadius: 8,
              color: "#475569",
              padding: "6px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        <div style={{ maxHeight: 420, overflowY: "auto", padding: 12 }}>
          {isLoading && (
            <div style={{ display: "grid", gap: 8 }}>
              {[...Array(4)].map((_, idx) => (
                <div key={idx} style={{ height: 56, borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9" }} />
              ))}
            </div>
          )}

          {!isLoading && isError && (
            <div style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: 12, fontSize: 13 }}>
              Could not load assigned properties right now.
            </div>
          )}

          {!isLoading && !isError && properties.length === 0 && (
            <div style={{ border: "1px dashed #e2e8f0", background: "#f8fafc", color: "#64748b", borderRadius: 10, padding: 14, fontSize: 13 }}>
              No assigned properties found.
            </div>
          )}

          {!isLoading && !isError && properties.length > 0 && (
            <div style={{ display: "grid", gap: 8 }}>
              {properties.map((property) => (
                <div
                  key={property.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "10px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#000000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {property.title}
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {property.location}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: property.status === "Active" ? "#15803d" : "#64748b",
                      background: property.status === "Active" ? "#dcfce7" : "#f1f5f9",
                      border: `1px solid ${property.status === "Active" ? "#bbf7d0" : "#e2e8f0"}`,
                      borderRadius: 99,
                      padding: "3px 10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {property.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingView({ onBack }) {
  return (
    <div style={{ padding: "24px 28px", minHeight: "100%", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: 16,
          padding: "7px 9px",
          border: "1px solid #e2e8f0",
          borderRadius: 9,
          background: "#fff",
          cursor: "pointer",
          color: "#64748b",
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      {[...Array(6)].map((_, idx) => (
        <div key={idx} style={{ height: 52, background: "#f1f5f9", borderRadius: 10, marginBottom: 10 }} />
      ))}
    </div>
  );
}

function EmptyView({ onBack }) {
  return (
    <div style={{ padding: "24px 28px", minHeight: "100%", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: 20,
          padding: "7px 9px",
          border: "1px solid #e2e8f0",
          borderRadius: 9,
          background: "#fff",
          cursor: "pointer",
          color: "#64748b",
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 20,
          textAlign: "center",
          color: "#64748b",
          fontSize: 14,
        }}
      >
        User details unavailable.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function UserDetailPage({ user: selectedUser, onBack }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [assignedPropertiesUserId, setAssignedPropertiesUserId] = useState(null);

  const fallbackUser = useMemo(() => {
    if (!selectedUser) return null;

    return {
      ...selectedUser,
      territories: Array.isArray(selectedUser.territories)
        ? selectedUser.territories
        : [],
      recentActivity: Array.isArray(selectedUser.recentActivity)
        ? selectedUser.recentActivity
        : null,
    };
  }, [selectedUser]);

  const userId = selectedUser?.id;
  const shouldFetch = Boolean(userId) && !USERS_MOCK_MODE;
  const { data: apiUser, isLoading, isError } = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => fetchUserDetail(userId),
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 2,
  });

  const user = apiUser ?? fallbackUser;
  const showAssignedProperties = Boolean(userId) && assignedPropertiesUserId === userId;

  const shouldFetchAssignedProperties =
    showAssignedProperties && Boolean(user?.id) && !PROPERTIES_MOCK_MODE;

  const {
    data: assignedProperties = [],
    isLoading: isAssignedPropertiesLoading,
    isError: isAssignedPropertiesError,
  } = useQuery({
    queryKey: ["admin-user-assigned-properties", user?.id, user?.name],
    queryFn: async () => {
      const { properties } = await fetchProperties({ agentId: user.id, page: 1, limit: 100 });
      return properties.filter((property) => isPropertyAssignedToUser(property, user));
    },
    enabled: shouldFetchAssignedProperties,
    staleTime: 1000 * 60 * 2,
  });

  if (isLoading && !user) return <LoadingView onBack={onBack} />;
  if (!user) return <EmptyView onBack={onBack} />;

  const initials = getInitials(user.name);
  const activityCount = user.recentActivity?.length ?? 5;

  return (
    <div style={{ padding: "24px 28px", minHeight: "100%", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>
      {isError && fallbackUser ? (
        <div
          style={{
            marginBottom: 12,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 12,
          }}
        >
          Could not load latest user details. Showing available data.
        </div>
      ) : null}

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

          {/* Back */}
          <button
            onClick={onBack}
            style={{ padding: "7px 9px", border: "1px solid #e2e8f0", borderRadius: 9, background: "#fff", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>

          {/* Avatar */}
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#e2e8f0", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0, border: "2px solid #fff", boxShadow: "0 0 0 2px #e2e8f0" }}>
            {initials}
          </div>

          {/* Name + badges + contact */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#000000" }}>{user.name}</h1>
              <RoleBadge   role={user.role} />
              <StatusBadge status={user.status} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#94a3b8" }}>
              {user.email && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Mail size={11} /> {user.email}
                </span>
              )}
              {user.phone && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  · <Phone size={11} style={{ marginLeft: 4 }} /> {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── STAT CARDS ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard
          value={user.activeLeads ?? 0}
          label="Active Leads"
          iconBg="#f0f9ff"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>}
        />
        <StatCard
          value={user.leadsClosed ?? 0}
          label="Leads Closed"
          iconBg="#f0fdf4"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
        />
        <StatCard
          value={user.toursDone ?? 0}
          label="Tours Done"
          iconBg="#faf5ff"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
        />
        <StatCard
          value={user.conversations ?? 0}
          label="Conversations"
          iconBg="#fff7ed"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
        />
      </div>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* ── LEFT: Tabs card ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>

            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "0 8px", background: "#fafafa" }}>
              {["Overview", "Recent Activity"].map((tab) => {
                const label = tab === "Recent Activity" ? `Recent Activity` : tab;
                const badge = tab === "Recent Activity" ? activityCount : null;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "13px 18px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: activeTab === tab ? 700 : 500,
                      color: activeTab === tab ? "#000000" : "#94a3b8",
                      borderBottom: activeTab === tab ? "2px solid #2D368E" : "2px solid transparent",
                      marginBottom: -1,
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                    {badge !== null && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: activeTab === tab ? "#2D368E" : "#e2e8f0", color: activeTab === tab ? "#fff" : "#64748b" }}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div style={{ padding: 24 }}>
              {activeTab === "Overview"         && <OverviewTab  user={user} onViewAssignedProperties={() => setAssignedPropertiesUserId(user.id)} />}
              {activeTab === "Recent Activity"  && <ActivityTab  user={user} />}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Account Info ──────────────────────────────────────────── */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 20 }}>
            <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#374151" }}>Account Info</p>

            {/* Role */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
              <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 7 }}>
                <User size={13} color="#94a3b8" /> Role
              </span>
              <RoleBadge role={user.role} />
            </div>

            {/* Status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
              <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 7 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Status
              </span>
              <StatusBadge status={user.status} />
            </div>

            {/* Last Login */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
              <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 7 }}>
                <Clock size={13} color="#94a3b8" /> Last Login
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>
                {user.lastLoginRaw ? timeAgoStr(user.lastLoginRaw) : (user.lastLogin ?? "—")}
              </span>
            </div>

            {/* Member Since */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
              <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 7 }}>
                <Calendar size={13} color="#94a3b8" /> Member Since
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>
                {fmtDate(user.createdAt) !== "—" ? fmtDate(user.createdAt) : (user.memberSince ?? "—")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <AssignedPropertiesModal
        open={showAssignedProperties}
        userName={user.name}
        properties={assignedProperties}
        isLoading={isAssignedPropertiesLoading}
        isError={isAssignedPropertiesError}
        onClose={() => setAssignedPropertiesUserId(null)}
      />
    </div>
  );
}
