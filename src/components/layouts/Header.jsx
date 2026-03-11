// 📁 src/components/layouts/Header.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Settings } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { getInitials } from "../../utils/formatters";
import useUnreadNotificationCount from "../../features/admin/hooks/useUnreadNotificationCount";

export default function Header() {
  const { user }  = useAuthStore();
  const navigate  = useNavigate();
  const [search, setSearch] = useState("");
  const { data: unreadCountData } = useUnreadNotificationCount({
    refetchInterval: 1000 * 20,
    refetchIntervalInBackground: true,
  });

  const unreadCount = Number(unreadCountData ?? 0);
  const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div className="bg-white shadow-sm border-b border-slate-100 px-6 h-[60px] flex justify-between items-center sticky top-0 z-50">

      {/* Search */}
      <div className="relative w-1/3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads, properties, agents..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-orange-400 transition-colors"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">

        {/* Bell */}
        <button
          onClick={() => navigate("/admin/notifications")}
          className="relative p-2 rounded-xl hover:bg-slate-50 transition-colors"
          title="Notifications"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell size={19} className="text-slate-500" />
          {unreadCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadLabel}
            </span>
          ) : null}
        </button>

        {/* Settings → navigates to /admin/settings */}
        <button
          onClick={() => navigate("/admin/settings")}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          title="Settings"
        >
          <Settings size={17} className="text-slate-500" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200" />

        {/* User */}
        <button
          onClick={() => navigate("/admin/settings")}
          className="flex items-center gap-2.5 hover:bg-slate-50 px-2 py-1.5 rounded-xl transition-colors"
        >
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800 leading-tight">
              {user?.name ?? "Akash"}
            </p>
            <p className="text-xs text-slate-400 capitalize leading-tight">
              {user?.role ?? "Agent"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {getInitials(user?.name ?? "Akash")}
          </div>
        </button>

      </div>
    </div>
  );
}
