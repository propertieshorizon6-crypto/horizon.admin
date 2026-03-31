// 📁 src/components/layouts/Sidebar.jsx
// Logo file: src/assets/logo.png  ← copy the logo.png file here

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Target, Mail, CalendarDays,
  MessageSquare, Building2, Users, Bell, ClipboardList, LogOut, X,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import useLogout from "../../features/auth/hooks/useLogout";
import { getInitials }  from "../../utils/formatters";
import logo             from "../../assets/horizon-logo.png";

const NAV_ITEMS = [
  { label: "Dashboard",      icon: LayoutDashboard, path: "/admin/dashboard",     end: true  },
  { label: "Leads",          icon: Target,          path: "/admin/leads",          end: false },
  { label: "Inquiries",      icon: Mail,            path: "/admin/inquiries",      end: false },
  { label: "Tour Requests",  icon: CalendarDays,    path: "/admin/tour-requests",  end: false },
  { label: "Conversations",  icon: MessageSquare,   path: "/admin/conversations",  end: false },
  { label: "Properties",     icon: Building2,       path: "/admin/listings",       end: false },
  { label: "Users & Agents", icon: Users,           path: "/admin/agents",         end: false },
  { label: "Notifications",  icon: Bell,            path: "/admin/notifications",  end: false },
  { label: "Audit Logs",     icon: ClipboardList,   path: "/admin/audit-logs",     end: false },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    if (logoutMutation.isPending) return;
    logoutMutation.mutate();
  };

  return (
    <aside
      className={[
        // On mobile: fixed overlay starting BELOW the header (top-15 = 60px)
        "fixed top-15 bottom-0 left-0 z-30 shadow-2xl",
        // On desktop (md+): back in normal flow, full height, no shadow needed
        "md:relative md:top-auto md:bottom-auto md:z-auto md:translate-x-0 md:shadow-none",
        // Width
        "w-58 shrink-0",
        // Slide transition
        "transition-transform duration-300 ease-in-out",
        // Mobile open/closed
        isOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
      style={{
        background: "#0d1828",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Close button — mobile only */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Close menu"
      >
        <X size={18} />
      </button>

      {/* ── Logo ── */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <img
          src={logo}
          alt="Horizon Properties"
          style={{
            height: 72, width: "auto", objectFit: "contain",
          }}
        />
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: "10px 12px", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.end}
              onClick={onClose}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 13,
                padding: "11px 14px", borderRadius: 10, marginBottom: 2,
                textDecoration: "none",
                background:  isActive ? "rgba(255,255,255,0.08)" : "transparent",
                color:       isActive ? "#f1f5f9"               : "#64748b",
                fontWeight:  isActive ? 600                     : 400,
                fontSize: 14, transition: "all 0.15s",
                borderLeft: isActive ? "3px solid #CA5428" : "3px solid transparent",
                boxSizing: "border-box",
              })}
            >
              <IconComponent size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User + Sign Out ── */}
      <div style={{ padding: "16px 20px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "#22225E",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0,
            border: "2px solid rgba(202,84,40,0.5)",
          }}>
            {getInitials(user?.name ?? "A")}
          </div>
          <div>
            <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
              {user?.name ?? "User"}
            </div>
            <span style={{
              display: "inline-block", background: "#22c55e", color: "#fff",
              fontSize: 9, fontWeight: 800, padding: "2px 8px",
              borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2,
            }}>
              {user?.role ?? "Agent"}
            </span>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          aria-busy={logoutMutation.isPending}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "9px 14px", borderRadius: 10,
            border: "none", background: "transparent",
            color: "#64748b", fontSize: 14, fontWeight: 400,
            cursor: logoutMutation.isPending ? "not-allowed" : "pointer",
            opacity: logoutMutation.isPending ? 0.7 : 1,
            transition: "all 0.15s", boxSizing: "border-box",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#f87171"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
        >
          <LogOut size={17} strokeWidth={1.8} />
          {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
