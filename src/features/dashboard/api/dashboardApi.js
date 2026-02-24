// 📁 src/features/dashboard/api/dashboardApi.js

import apiClient from "../../../services/apiClient";

// ── Mock Data ──────────────────────────────────────────────────────────────

export const MOCK_DASHBOARD_DATA = {
  stats: [
    { label: "New Leads Today",  value: 47,  pct: "12%", up: true,  icon: "◎"  },
    { label: "Inquiries Today",  value: 128, pct: "8%",  up: true,  icon: "✉"  },
    { label: "Tour Requests",    value: 23,  pct: "3%",  up: false, icon: "📅" },
    { label: "Calls Today",      value: 34,  pct: "15%", up: true,  icon: "📞" },
    { label: "Messages Today",   value: 89,  pct: "22%", up: true,  icon: "💬" },
  ],

  leadsSource: [
    { day: "Mon", App: 12, Website: 18, Call: 8,  Whatsapp: 10 },
    { day: "Tue", App: 14, Website: 22, Call: 10, Whatsapp: 12 },
    { day: "Wed", App: 16, Website: 28, Call: 12, Whatsapp: 14 },
    { day: "Thu", App: 20, Website: 45, Call: 15, Whatsapp: 18 },
    { day: "Fri", App: 18, Website: 55, Call: 14, Whatsapp: 16 },
    { day: "Sat", App: 15, Website: 40, Call: 11, Whatsapp: 13 },
    { day: "Sun", App: 10, Website: 25, Call: 8,  Whatsapp: 9  },
  ],

  leadsStatus: [
    { name: "New",         value: 89,  color: "#38bdf8" },
    { name: "Assigned",    value: 142, color: "#f97316" },
    { name: "In Progress", value: 98,  color: "#1e3a5f" },
    { name: "Closed",      value: 33,  color: "#22c55e" },
  ],

  agentLoad: [
    { name: "Sarah M.", leads: 28 },
    { name: "John D.",  leads: 24 },
    { name: "Ahmed K.", leads: 21 },
    { name: "Lisa R.",  leads: 18 },
    { name: "Mike P.",  leads: 15 },
    { name: "Emma S.",  leads: 12 },
    { name: "David L.", leads: 10 },
    { name: "Nina T.",  leads: 7  },
  ],

  // LiveAlerts — contact initiated events
  // source: "website" | "app" | "whatsapp" | "call"
  // type:   "message" | "call" | "tour"
  liveAlerts: [
    {
      id: 1,
      type:     "message",
      action:   "Message started",
      source:   "website",
      property: "Marina View Tower - 3BR",
      person:   "John Smith",
      time:     "2 min ago",
    },
    {
      id: 2,
      type:     "call",
      action:   "Call initiated",
      source:   "app",
      property: "Palm Jumeirah Villa",
      person:   "Anonymous",
      time:     "5 min ago",
      anon:     true,
    },
    {
      id: 3,
      type:     "message",
      action:   "Message started",
      source:   "whatsapp",
      property: "Downtown Apt - Studio",
      person:   "Priya Mehta",
      time:     "12 min ago",
    },
    {
      id: 4,
      type:     "tour",
      action:   "Tour requested",
      source:   "website",
      property: "Jumeirah Golf Estate",
      person:   "Rahul Sharma",
      time:     "28 min ago",
    },
  ],

  // OperationalQueue — leads requiring attention
  // status: "unassigned" | "overdue" | "stale"
  // priority: "high" | "medium" | "low"
  queue: [
    {
      id:        1,
      name:      "Robert Chen",
      priority:  "high",
      property:  "Marina View Tower",
      source:    "Website",
      elapsed:   "15 min",
      status:    "unassigned",
    },
    {
      id:        2,
      name:      "Anna Williams",
      priority:  "medium",
      property:  "Palm Villa",
      source:    "App",
      elapsed:   "32 min",
      status:    "unassigned",
    },
    {
      id:        3,
      name:      "Mohammed Ali",
      priority:  "low",
      property:  "Downtown Apartment",
      source:    "Call",
      elapsed:   "1 hour",
      status:    "unassigned",
    },
    {
      id:        4,
      name:      "Sneha Patil",
      priority:  "high",
      property:  "Andheri 3BHK",
      source:    "Website",
      elapsed:   "2 hours",
      status:    "overdue",
    },
    {
      id:        5,
      name:      "Vikram Singh",
      priority:  "medium",
      property:  "Juhu Penthouse",
      source:    "Whatsapp",
      elapsed:   "3 hours",
      status:    "overdue",
    },
    {
      id:        6,
      name:      "Kavya Reddy",
      priority:  "low",
      property:  "Bandra Studio",
      source:    "App",
      elapsed:   "2 days",
      status:    "stale",
    },
    {
      id:        7,
      name:      "Arjun Nair",
      priority:  "medium",
      property:  "Powai 2BHK",
      source:    "Website",
      elapsed:   "3 days",
      status:    "stale",
    },
  ],
};

// ── Real API (uncomment when backend ready) ────────────────────────────────
export const fetchDashboardData = async () => {
  const { data } = await apiClient.get("/dashboard");
  return data;
};