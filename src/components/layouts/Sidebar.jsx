import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Target,
  Users,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { getInitials } from "../../utils/formatters";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", end: true },
  { label: "Leads", icon: Target, path: "/admin/leads", end: false },
  { label: "Inquiries", icon: Mail, path: "/admin/inquiries", end: false },
  { label: "Tour Requests", icon: CalendarDays, path: "/admin/tour-requests", end: false },
  { label: "Conversations", icon: MessageSquare, path: "/admin/conversations", end: false },
  { label: "Properties", icon: Building2, path: "/admin/listings", end: false },
  { label: "Users & Agents", icon: Users, path: "/admin/agents", end: false },
  { label: "Notifications", icon: Bell, path: "/admin/notifications", end: false },
  { label: "Audit Logs", icon: ClipboardList, path: "/admin/audit-logs", end: false },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const displayName =
    user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin";

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <aside
      style={{
        width: 232,
        minHeight: "100vh",
        background: "#0d1828",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        fontFamily: "'Sora','DM Sans',system-ui,sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "22px 20px 20px",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "linear-gradient(135deg,#f97316,#f59e0b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <div>
          <div
            style={{
              color: "#f1f5f9",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Horizon
          </div>
          <div
            style={{
              color: "#475569",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Properties
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "8px 12px" }}>
        {NAV_ITEMS.map(({ label, icon: Icon, path, end }) => (
          <NavLink
            key={label}
            to={path}
            end={end}
            className={({ isActive }) =>
              [
                "mb-0.5 flex items-center gap-3 rounded-[10px] border-l-[3px] px-3.5 py-2.5 text-sm no-underline transition-colors duration-150",
                isActive
                  ? "border-l-orange-500 bg-white/10 text-slate-100 font-semibold"
                  : "border-l-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300 font-normal",
              ].join(" ")
            }
          >
            <Icon size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          padding: "16px 20px 20px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#f97316,#f59e0b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {getInitials(displayName)}
          </div>

          <div>
            <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
              {displayName}
            </div>
            <span
              style={{
                display: "inline-block",
                background: "#22c55e",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 99,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: 2,
              }}
            >
              {user?.role ?? "Admin"}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-left text-sm font-normal text-slate-500 transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400"
          style={{ border: "none", background: "transparent", cursor: "pointer" }}
        >
          <LogOut size={17} strokeWidth={1.8} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
