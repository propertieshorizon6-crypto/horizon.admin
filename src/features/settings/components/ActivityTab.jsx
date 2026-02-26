// 📁 src/features/settings/components/ActivityTab.jsx

const ACTIVITY_LOG = [
  { id: 1, action: "Logged in",              detail: "Chrome on Windows",    time: "Today, 10:23 AM",      icon: "🔑", color: "bg-green-100 text-green-600"  },
  { id: 2, action: "Lead assigned",          detail: "Robert Chen → You",    time: "Today, 9:45 AM",       icon: "👤", color: "bg-blue-100 text-blue-600"    },
  { id: 3, action: "Tour scheduled",         detail: "Marina View Tower 3BR", time: "Yesterday, 3:12 PM",  icon: "📅", color: "bg-orange-100 text-orange-600" },
  { id: 4, action: "Profile updated",        detail: "Email changed",         time: "Feb 20, 2:00 PM",     icon: "✏️", color: "bg-slate-100 text-slate-600"   },
  { id: 5, action: "Export downloaded",      detail: "Leads report (CSV)",    time: "Feb 18, 11:30 AM",    icon: "📄", color: "bg-purple-100 text-purple-600" },
  { id: 6, action: "Conversation started",   detail: "With Priya Mehta",      time: "Feb 17, 4:50 PM",     icon: "💬", color: "bg-teal-100 text-teal-600"    },
];

export default function ActivityTab() {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
        <p className="text-xs text-slate-400 mt-0.5">Your last 30 days of account activity</p>
      </div>

      <div className="space-y-1">
        {ACTIVITY_LOG.map(({ id, action, detail, time, icon, color }, i) => (
          <div key={id}>
            <div className="flex items-start gap-4 py-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${color}`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{action}</p>
                <p className="text-xs text-slate-400 mt-0.5">{detail}</p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">{time}</span>
            </div>
            {i < ACTIVITY_LOG.length - 1 && <div className="h-px bg-slate-50" />}
          </div>
        ))}
      </div>
    </div>
  );
}