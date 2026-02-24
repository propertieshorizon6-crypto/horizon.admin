// 📁 src/components/layouts/Sidebar.jsx
// Requires: npm install lucide-react

import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  Mail,
  CalendarDays,
  MessageSquare,
  Building2,
  Users,
  Bell,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { useAuthStore }   from "../../store/useAuthStore";

import { getInitials }    from "../../utils/formatters";

// ── Nav config ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",      icon: LayoutDashboard, path: "/admin/dashboard",                end: true  },
  { label: "Leads",          icon: Target,          path: "/admin/leads",                    end: false },
  { label: "Inquiries",      icon: Mail,            path: "/admin/inquiries",                end: false },
  { label: "Tour Requests",  icon: CalendarDays,    path: "/admin/tour-requests",            end: false },
  { label: "Conversations",  icon: MessageSquare,   path: "/admin/conversations",            end: false },
  { label: "Properties",     icon: Building2,       path: "/admin/listings",                 end: false },
  { label: "Users & Agents", icon: Users,           path: "/admin/agents",                   end: false },
  { label: "Notifications",  icon: Bell,            path: "/admin/notifications",            end: false },
  { label: "Audit Logs",     icon: ClipboardList,   path: "/admin/audit-logs",               end: false },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate         = useNavigate();

  const handleLogout = async () => {
    // logout API — add when backend ready
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <aside
      style={{
        width:         232,
        minHeight:     "100vh",
        background:    "#0d1828",
        display:       "flex",
        flexDirection: "column",
        flexShrink:    0,
        fontFamily:    "'Sora','DM Sans',system-ui,sans-serif",
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          display:    "flex",
          alignItems: "center",
          gap:        12,
          padding:    "22px 20px 20px",
        }}
      >
        <div
          style={{
            width:          42,
            height:         42,
            borderRadius:   12,
            background:     "linear-gradient(135deg,#f97316,#f59e0b)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
          }}
        >
          {/* Building/grid logo icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3"  y="3"  width="7" height="7" rx="1" />
            <rect x="14" y="3"  width="7" height="7" rx="1" />
            <rect x="3"  y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Horizon
          </div>
          <div style={{ color: "#475569", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Properties
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: "8px 12px" }}>
        {NAV_ITEMS.map(({ label, icon: Icon, path, end }) => (
          <NavLink
            key={label}
            to={path}
            end={end}
            style={({ isActive }) => ({
              display:        "flex",
              alignItems:     "center",
              gap:            13,
              padding:        "11px 14px",
              borderRadius:   10,
              marginBottom:   2,
              textDecoration: "none",
              background:     isActive ? "rgba(255,255,255,0.08)" : "transparent",
              color:          isActive ? "#f1f5f9" : "#64748b",
              fontWeight:     isActive ? 600 : 400,
              fontSize:       14,
              transition:     "all 0.15s",
              borderLeft:     isActive ? "3px solid #f97316" : "3px solid transparent",
              boxSizing:      "border-box",
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.style.borderLeft.includes("#f97316")) {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color      = "#94a3b8";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.style.borderLeft.includes("#f97316")) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color      = "#64748b";
              }
            }}
          >
            <Icon size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── User + Sign Out ── */}
      <div
        style={{
          padding:   "16px 20px 20px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* User row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          {/* Avatar */}
          <div
            style={{
              width:          38,
              height:         38,
              borderRadius:   "50%",
              background:     "linear-gradient(135deg,#f97316,#f59e0b)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              color:          "#fff",
              fontWeight:     800,
              fontSize:       14,
              flexShrink:     0,
            }}
          >
            {getInitials(user?.name ?? "Akash")}
          </div>

          <div>
            <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
              {user?.name ?? "Akash"}
            </div>
            {/* Role badge */}
            <span
              style={{
                display:       "inline-block",
                background:    "#22c55e",
                color:         "#fff",
                fontSize:      9,
                fontWeight:    800,
                padding:       "2px 8px",
                borderRadius:  99,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop:     2,
              }}
            >
              {user?.role ?? "Agent"}
            </span>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          style={{
            display:        "flex",
            alignItems:     "center",
            gap:            10,
            width:          "100%",
            padding:        "9px 14px",
            borderRadius:   10,
            border:         "none",
            background:     "transparent",
            color:          "#64748b",
            fontSize:       14,
            fontWeight:     400,
            cursor:         "pointer",
            transition:     "all 0.15s",
            boxSizing:      "border-box",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
            e.currentTarget.style.color      = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color      = "#64748b";
          }}
        >
          <LogOut size={17} strokeWidth={1.8} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
