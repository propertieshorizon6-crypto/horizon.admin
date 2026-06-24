// 📁 src/features/settings/components/ActivityTab.jsx

import { useQuery }      from "@tanstack/react-query";
import { useAuthStore }  from "../../../store/useAuthStore";
import { fetchMyActivity } from "../api/settingsApi";
import { formatRelativeTime } from "../../../utils/formatters";
import {
  KeyRound, Lock, User, ClipboardList, Sparkles, FileText,
  CalendarDays, CheckCircle, XCircle, Home, RefreshCw,
  Building2, Pencil, MessageCircle, File, Users,
} from "lucide-react";

// Map audit log actions → { Icon, colorClass }
const ACTION_META = {
  login_success:         { Icon: KeyRound,       color: "bg-green-100 text-green-600"   },
  password_changed:      { Icon: Lock,           color: "bg-blue-100 text-blue-600"     },
  lead_assigned:         { Icon: User,           color: "bg-blue-100 text-blue-600"     },
  lead_reassigned:       { Icon: User,           color: "bg-indigo-100 text-indigo-600" },
  lead_status_changed:   { Icon: ClipboardList,  color: "bg-sky-100 text-sky-600"       },
  lead_created:          { Icon: Sparkles,       color: "bg-green-100 text-green-600"   },
  lead_note_added:       { Icon: FileText,       color: "bg-yellow-100 text-yellow-600" },
  tour_created:          { Icon: CalendarDays,   color: "bg-orange-100 text-orange-600" },
  tour_confirmed:        { Icon: CheckCircle,    color: "bg-green-100 text-green-600"   },
  tour_cancelled:        { Icon: XCircle,        color: "bg-red-100 text-red-600"       },
  tour_completed:        { Icon: Home,           color: "bg-teal-100 text-teal-600"     },
  tour_rescheduled:      { Icon: RefreshCw,      color: "bg-orange-100 text-orange-600" },
  property_created:      { Icon: Building2,      color: "bg-purple-100 text-purple-600" },
  property_updated:      { Icon: Pencil,         color: "bg-slate-100 text-slate-600"   },
  conversation_created:  { Icon: MessageCircle,  color: "bg-teal-100 text-teal-600"     },
  conversation_closed:   { Icon: MessageCircle,  color: "bg-slate-100 text-slate-600"   },
  export_completed:      { Icon: File,           color: "bg-purple-100 text-purple-600" },
  user_created:          { Icon: Users,          color: "bg-blue-100 text-blue-600"     },
  user_status_changed:   { Icon: RefreshCw,      color: "bg-amber-100 text-amber-600"   },
};

const DEFAULT_META = { Icon: ClipboardList, color: "bg-slate-100 text-slate-600" };

function formatAction(action = "") {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ActivityTab() {
  const { user } = useAuthStore();
  const userId   = user?._id;
  const canFetch = ["admin", "manager"].includes(user?.role);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-activity", userId],
    queryFn:  () => fetchMyActivity(userId, 20),
    enabled:  !!userId && canFetch,
    staleTime: 60_000,
  });

  const logs = data?.logs ?? [];

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
        <p className="text-xs text-slate-400 mt-0.5">Your last 20 account actions</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-2 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-center py-12 text-sm text-slate-400">
          Could not load activity log.
        </div>
      )}

      {/* No access for agents */}
      {!canFetch && !isLoading && (
        <div className="flex items-center justify-center py-12 text-sm text-slate-400">
          Activity log is available for admin and manager accounts only.
        </div>
      )}

      {/* Empty */}
      {canFetch && !isLoading && !isError && logs.length === 0 && (
        <div className="flex items-center justify-center py-12 text-sm text-slate-400">
          No activity recorded yet.
        </div>
      )}

      {/* Log rows */}
      {!isLoading && !isError && logs.length > 0 && (
        <div className="space-y-1">
          {logs.map((log, i) => {
            const meta = ACTION_META[log.action] ?? DEFAULT_META;
            return (
              <div key={log._id ?? i}>
                <div className="flex items-start gap-4 py-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                    <meta.Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {formatAction(log.action)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {log.resource?.description ?? ""}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {log.createdAt ? formatRelativeTime(log.createdAt) : ""}
                  </span>
                </div>
                {i < logs.length - 1 && <div className="h-px bg-slate-50" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
