import apiClient from "../../../services/apiClient";

const createEmptyDashboardData = () => ({
  stats: [],
  leadsSource: [],
  leadsStatus: [],
  agentLoad: [],
  liveAlerts: [],
  queue: [],
});

export const EMPTY_DASHBOARD_DATA = createEmptyDashboardData();
export const MOCK_DASHBOARD_DATA = createEmptyDashboardData();

const STATUS_COLORS = {
  New: "#38bdf8",
  Assigned: "#f97316",
  "In Progress": "#1e3a5f",
  Closed: "#22c55e",
};

const toApiData = (response) => response?.data?.data ?? response?.data ?? {};
const toArray = (value) => (Array.isArray(value) ? value : []);

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatPersonName = (person = {}) => {
  const firstName = person?.firstName || "";
  const lastName = person?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || person?.email || "Unknown";
};

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return "Just now";

  const timestamp = new Date(dateValue).getTime();
  if (!timestamp) return "Just now";

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const formatElapsed = (dateValue) => {
  if (!dateValue) return "Unknown";

  const timestamp = new Date(dateValue).getTime();
  if (!timestamp) return "Unknown";

  const diffHours = (Date.now() - timestamp) / (1000 * 60 * 60);

  if (diffHours < 0) {
    const hoursLeft = Math.ceil(Math.abs(diffHours));
    return `${hoursLeft}h left`;
  }

  if (diffHours < 1) return "<1h";
  if (diffHours < 24) return `${Math.floor(diffHours)}h`;

  const days = Math.floor(diffHours / 24);
  return `${days}d`;
};

const classifyQueueStatus = (dateValue) => {
  const timestamp = new Date(dateValue).getTime();
  if (!timestamp) return "unassigned";

  const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);

  if (ageHours >= 72) return "stale";
  if (ageHours >= 24) return "overdue";
  return "unassigned";
};

const classifyPriority = (status) => {
  if (status === "stale") return "high";
  if (status === "overdue") return "medium";
  return "low";
};

const dayLabel = (dateKey) => {
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;

  return date.toLocaleDateString(undefined, { weekday: "short" });
};

const buildTrendMap = (items = []) => {
  const map = new Map();

  items.forEach((item) => {
    const key = item?.date;
    if (!key) return;
    map.set(key, toNumber(item?.count));
  });

  return map;
};

const takeLast = (items = [], count = 7) =>
  items.slice(Math.max(0, items.length - count));

const computeDelta = (series = []) => {
  const sorted = [...series].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const lastTwo = takeLast(sorted, 2);

  const current = toNumber(lastTwo[lastTwo.length - 1]?.count);
  const previous = toNumber(lastTwo[lastTwo.length - 2]?.count);

  if (previous <= 0) {
    return {
      current,
      pct: current > 0 ? "100%" : "0%",
      up: current >= previous,
    };
  }

  const change = Math.round((Math.abs(current - previous) / previous) * 100);

  return {
    current,
    pct: `${change}%`,
    up: current >= previous,
  };
};

const mapStats = (kpis = {}, alerts = {}, trends = {}) => {
  const leadDelta = computeDelta(toArray(trends.leads));
  const enquiryDelta = computeDelta(toArray(trends.enquiries));
  const tourDelta = computeDelta(toArray(trends.tours));

  const pendingTours = toNumber(
    kpis?.tours?.pendingCount ?? alerts?.counts?.pendingTourConfirmations,
  );
  const pendingApprovals = toNumber(alerts?.counts?.pendingApprovals);
  const unreadNotifications = toNumber(alerts?.unreadNotifications);

  return [
    {
      label: "New Leads Today",
      value: leadDelta.current,
      pct: leadDelta.pct,
      up: leadDelta.up,
      icon: "L",
    },
    {
      label: "Inquiries Today",
      value: enquiryDelta.current,
      pct: enquiryDelta.pct,
      up: enquiryDelta.up,
      icon: "I",
    },
    {
      label: "Tour Requests",
      value: pendingTours,
      pct: tourDelta.pct,
      up: tourDelta.up,
      icon: "T",
    },
    {
      label: "Pending Approvals",
      value: pendingApprovals,
      pct: "0%",
      up: true,
      icon: "P",
    },
    {
      label: "Unread Alerts",
      value: unreadNotifications,
      pct: "0%",
      up: true,
      icon: "N",
    },
  ];
};

const mapLeadsSource = (trends = {}) => {
  const leadMap = buildTrendMap(toArray(trends.leads));
  const enquiryMap = buildTrendMap(toArray(trends.enquiries));
  const tourMap = buildTrendMap(toArray(trends.tours));

  const allDates = Array.from(
    new Set([...leadMap.keys(), ...enquiryMap.keys(), ...tourMap.keys()]),
  ).sort((a, b) => String(a).localeCompare(String(b)));

  return takeLast(allDates, 7).map((date) => ({
    day: dayLabel(date),
    App: leadMap.get(date) || 0,
    Website: enquiryMap.get(date) || 0,
    Call: tourMap.get(date) || 0,
    Whatsapp: 0,
  }));
};

const mapLeadsStatus = (kpis = {}) => {
  const source = kpis?.leads?.byStatus || {};

  const buckets = {
    New: 0,
    Assigned: 0,
    "In Progress": 0,
    Closed: 0,
  };

  Object.entries(source).forEach(([status, count]) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "new") buckets.New += toNumber(count);
    else if (normalized === "contacted") buckets.Assigned += toNumber(count);
    else if (["nurturing", "qualified"].includes(normalized)) {
      buckets["In Progress"] += toNumber(count);
    } else if (["converted", "lost", "closed"].includes(normalized)) {
      buckets.Closed += toNumber(count);
    }
  });

  return Object.entries(buckets).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name],
  }));
};

const mapAgentLoad = (agentPerformance = {}) =>
  toArray(agentPerformance?.performance)
    .map((item) => ({
      name: formatPersonName(item?.agent),
      leads: toNumber(item?.leads?.total),
    }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 8);

const mapLiveAlerts = (alerts = {}) => {
  const items = [];

  toArray(alerts?.pendingTours).forEach((tour, index) => {
    const when = tour?.preferredDate;

    items.push({
      id: `pending-tour-${index}`,
      type: "tour",
      action: "Tour requested",
      source: "website",
      property: tour?.property?.title || "Property",
      person: tour?.name || "Unknown",
      time: formatRelativeTime(when),
      timestamp: new Date(when || Date.now()).getTime(),
    });
  });

  toArray(alerts?.overdueTours).forEach((tour, index) => {
    const when = tour?.preferredDate;

    items.push({
      id: `overdue-tour-${index}`,
      type: "tour",
      action: "Tour follow-up overdue",
      source: "app",
      property: tour?.property?.title || "Property",
      person: tour?.name || "Unknown",
      time: formatRelativeTime(when),
      timestamp: new Date(when || Date.now()).getTime(),
    });
  });

  toArray(alerts?.unansweredEnquiries).forEach((enquiry, index) => {
    const when = enquiry?.createdAt;

    items.push({
      id: `unanswered-enquiry-${index}`,
      type: "message",
      action: "Enquiry waiting response",
      source: "website",
      property: enquiry?.property?.title || "Property",
      person: enquiry?.name || enquiry?.email || "Unknown",
      time: formatRelativeTime(when),
      timestamp: new Date(when || Date.now()).getTime(),
    });
  });

  toArray(alerts?.pendingApprovalProperties).forEach((property, index) => {
    const when = property?.createdAt;

    items.push({
      id: `pending-property-${index}`,
      type: "message",
      action: "Property pending approval",
      source: "app",
      property: property?.title || "Property",
      person: formatPersonName(property?.owner),
      time: formatRelativeTime(when),
      timestamp: new Date(when || Date.now()).getTime(),
    });
  });

  return items
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 8)
    .map((alert) => {
      const next = { ...alert };
      delete next.timestamp;
      return next;
    });
};

const mapQueue = (alerts = {}) => {
  const queueItems = [];

  toArray(alerts?.unansweredEnquiries).forEach((enquiry, index) => {
    const createdAt = enquiry?.createdAt;
    const status = classifyQueueStatus(createdAt);

    queueItems.push({
      id: `queue-enquiry-${index}`,
      name: enquiry?.name || enquiry?.email || "Unknown",
      priority: classifyPriority(status),
      property: enquiry?.property?.title || "Property",
      source: "Website",
      elapsed: formatElapsed(createdAt),
      status,
      sortDate: new Date(createdAt || Date.now()).getTime(),
    });
  });

  toArray(alerts?.pendingTours).forEach((tour, index) => {
    const preferredDate = tour?.preferredDate;
    const status = classifyQueueStatus(preferredDate);

    queueItems.push({
      id: `queue-tour-${index}`,
      name: tour?.name || "Unknown",
      priority: classifyPriority(status),
      property: tour?.property?.title || "Property",
      source: "App",
      elapsed: formatElapsed(preferredDate),
      status,
      sortDate: new Date(preferredDate || Date.now()).getTime(),
    });
  });

  return queueItems
    .sort((a, b) => b.sortDate - a.sortDate)
    .slice(0, 20)
    .map((item) => {
      const next = { ...item };
      delete next.sortDate;
      return next;
    });
};

const mapDashboardResponse = (overview = {}, trends = {}, agentPerformance = {}) => {
  const kpis = overview?.kpis || {};
  const alerts = overview?.alerts || {};

  return {
    stats: mapStats(kpis, alerts, trends),
    leadsSource: mapLeadsSource(trends),
    leadsStatus: mapLeadsStatus(kpis),
    agentLoad: mapAgentLoad(agentPerformance),
    liveAlerts: mapLiveAlerts(alerts),
    queue: mapQueue(alerts),
  };
};

export const fetchDashboardData = async () => {
  try {
    const [overviewRes, trendsRes, agentPerfRes] = await Promise.all([
      apiClient.get("/admin/dashboard"),
      apiClient.get("/admin/dashboard/trends", { params: { days: 7 } }),
      apiClient.get("/admin/dashboard/agent-performance", {
        params: { page: 1, limit: 8 },
      }),
    ]);

    return mapDashboardResponse(
      toApiData(overviewRes),
      toApiData(trendsRes),
      toApiData(agentPerfRes),
    );
  } catch (error) {
    const details = error?.response?.data?.message || error?.message;
    console.error("Dashboard fetch failed:", details);
    return createEmptyDashboardData();
  }
};

export default fetchDashboardData;
