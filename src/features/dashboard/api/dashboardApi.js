// 📁 src/features/dashboard/api/dashboardApi.js

import apiClient from "../../../services/apiClient";

const createEmptyDashboardData = () => ({
  stats: [], leadsSource: [], leadsStatus: [], agentLoad: [], liveAlerts: [], queue: [],
});

export const EMPTY_DASHBOARD_DATA = createEmptyDashboardData();
export const MOCK_DASHBOARD_DATA  = createEmptyDashboardData();

const STATUS_COLORS = { New:"#38bdf8", Assigned:"#f97316", "In Progress":"#1e3a5f", Closed:"#22c55e" };

const toApiData = (r)  => r?.data?.data ?? r?.data ?? {};
const toArray   = (v)  => (Array.isArray(v) ? v : []);
const toNumber  = (v)  => { const p = Number(v); return Number.isFinite(p) ? p : 0; };

const formatPersonName = (p = {}) =>
  `${p?.firstName||""} ${p?.lastName||""}`.trim() || p?.email || "Unknown";

const formatRelativeTime = (d) => {
  if (!d) return "Just now";
  const min = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

const formatElapsed = (d) => {
  if (!d) return "Unknown";
  const diffH = (Date.now() - new Date(d).getTime()) / 3600000;
  if (diffH < 0) return `${Math.ceil(Math.abs(diffH))}h left`;
  if (diffH < 1) return "<1h";
  if (diffH < 24) return `${Math.floor(diffH)}h`;
  return `${Math.floor(diffH/24)}d`;
};

const classifyQueueStatus = (d) => {
  const h = (Date.now() - new Date(d).getTime()) / 3600000;
  if (h >= 72) return "stale";
  if (h >= 24) return "overdue";
  return "unassigned";
};

const classifyPriority = (s) => s === "stale" ? "high" : s === "overdue" ? "medium" : "low";

const dayLabel = (k) => {
  const d = new Date(`${k}T00:00:00`);
  return Number.isNaN(d.getTime()) ? k : d.toLocaleDateString(undefined, { weekday:"short" });
};

const buildTrendMap = (items = []) => {
  const map = new Map();
  items.forEach((i) => { if (i?.date) map.set(i.date, toNumber(i?.count)); });
  return map;
};

const takeLast = (items = [], n = 7) => items.slice(Math.max(0, items.length - n));

const computeDelta = (series = []) => {
  const s = [...series].sort((a,b) => String(a.date).localeCompare(String(b.date)));
  const l = takeLast(s, 2);
  const curr = toNumber(l[l.length-1]?.count);
  const prev = toNumber(l[l.length-2]?.count);
  if (prev <= 0) return { current:curr, pct: curr>0?"100%":"0%", up: curr>=prev };
  return { current:curr, pct:`${Math.round((Math.abs(curr-prev)/prev)*100)}%`, up: curr>=prev };
};

const mapStats = (kpis={}, alerts={}, trends={}) => {
  const ld=computeDelta(toArray(trends.leads));
  const ed=computeDelta(toArray(trends.enquiries));
  const td=computeDelta(toArray(trends.tours));
  return [
    { label:"New Leads Today",   value:ld.current, pct:ld.pct, up:ld.up, icon:"L" },
    { label:"Inquiries Today",   value:ed.current, pct:ed.pct, up:ed.up, icon:"I" },
    { label:"Tour Requests",     value:toNumber(kpis?.tours?.pendingCount??alerts?.counts?.pendingTourConfirmations), pct:td.pct, up:td.up, icon:"T" },
    { label:"Pending Approvals", value:toNumber(alerts?.counts?.pendingApprovals), pct:"0%", up:true, icon:"P" },
    { label:"Unread Alerts",     value:toNumber(alerts?.unreadNotifications), pct:"0%", up:true, icon:"N" },
  ];
};

const mapLeadsSource = (trends={}) => {
  const lm=buildTrendMap(toArray(trends.leads));
  const em=buildTrendMap(toArray(trends.enquiries));
  const tm=buildTrendMap(toArray(trends.tours));
  const dates = Array.from(new Set([...lm.keys(),...em.keys(),...tm.keys()])).sort();
  return takeLast(dates,7).map(d=>({ day:dayLabel(d), App:lm.get(d)||0, Website:em.get(d)||0, Call:tm.get(d)||0, Whatsapp:0 }));
};

const mapLeadsStatus = (kpis={}) => {
  const src = kpis?.leads?.byStatus||{};
  const b   = {New:0, Assigned:0, "In Progress":0, Closed:0};
  Object.entries(src).forEach(([s,c]) => {
    const n = String(s||"").toLowerCase();
    if (n==="new")                                   b.New+=toNumber(c);
    else if (n==="contacted")                        b.Assigned+=toNumber(c);
    else if (["nurturing","qualified"].includes(n))  b["In Progress"]+=toNumber(c);
    else if (["converted","lost","closed"].includes(n)) b.Closed+=toNumber(c);
  });
  return Object.entries(b).map(([name,value])=>({name,value,color:STATUS_COLORS[name]}));
};

const mapAgentLoad = (ap={}) =>
  toArray(ap?.performance)
    .map(i=>({name:formatPersonName(i?.agent), leads:toNumber(i?.leads?.total)}))
    .sort((a,b)=>b.leads-a.leads).slice(0,8);

const mapLiveAlerts = (alerts={}) => {
  const items = [];

  toArray(alerts?.pendingTours).forEach((t,i) => items.push({
    id:`pending-tour-${i}`, type:"tour", action:"Tour requested", source:"website",
    property:t?.property?.title||"Property", person:t?.name||"Unknown",
    time:formatRelativeTime(t?.preferredDate),
    timestamp:new Date(t?.preferredDate||Date.now()).getTime(),
    linkTo:"/admin/tour-requests",
  }));

  toArray(alerts?.overdueTours).forEach((t,i) => items.push({
    id:`overdue-tour-${i}`, type:"tour", action:"Tour follow-up overdue", source:"app",
    property:t?.property?.title||"Property", person:t?.name||"Unknown",
    time:formatRelativeTime(t?.preferredDate),
    timestamp:new Date(t?.preferredDate||Date.now()).getTime(),
    linkTo:"/admin/tour-requests",
  }));

  toArray(alerts?.unansweredEnquiries).forEach((e,i) => items.push({
    id:`unanswered-enquiry-${i}`, type:"message", action:"Enquiry waiting response", source:"website",
    property:e?.property?.title||"Property", person:e?.name||e?.email||"Unknown",
    time:formatRelativeTime(e?.createdAt),
    timestamp:new Date(e?.createdAt||Date.now()).getTime(),
    linkTo:"/admin/inquiries",
  }));

  toArray(alerts?.pendingApprovalProperties).forEach((p,i) => items.push({
    id:`pending-property-${i}`, type:"message", action:"Property pending approval", source:"app",
    property:p?.title||"Property", person:formatPersonName(p?.owner),
    time:formatRelativeTime(p?.createdAt),
    timestamp:new Date(p?.createdAt||Date.now()).getTime(),
    linkTo:"/admin/listings",
  }));

  return items.sort((a,b)=>b.timestamp-a.timestamp).slice(0,8).map(({timestamp,...rest})=>rest);
};

const mapQueue = (alerts={}) => {
  const items=[];

  toArray(alerts?.unansweredEnquiries).forEach((e,i)=>{
    const s=classifyQueueStatus(e?.createdAt);
    items.push({
      id:`queue-enquiry-${i}`,
      rawId:    e?._id||null,     // ← actual _id for API calls
      itemType: "enquiry",
      name:e?.name||e?.email||"Unknown",
      priority:classifyPriority(s),
      property:e?.property?.title||"Property",
      source:"Website", elapsed:formatElapsed(e?.createdAt), status:s,
      sortDate:new Date(e?.createdAt||Date.now()).getTime(),
    });
  });

  toArray(alerts?.pendingTours).forEach((t,i)=>{
    const s=classifyQueueStatus(t?.preferredDate);
    items.push({
      id:`queue-tour-${i}`,
      rawId:    t?._id||null,     // ← actual _id for API calls
      itemType: "tour",
      name:t?.name||"Unknown",
      priority:classifyPriority(s),
      property:t?.property?.title||"Property",
      source:"App", elapsed:formatElapsed(t?.preferredDate), status:s,
      sortDate:new Date(t?.preferredDate||Date.now()).getTime(),
    });
  });

  return items.sort((a,b)=>b.sortDate-a.sortDate).slice(0,20).map(({sortDate,...rest})=>rest);
};

const mapDashboardResponse = (overview={}, trends={}, agentPerformance={}) => {
  const kpis=overview?.kpis||{};
  const alerts=overview?.alerts||{};
  return {
    stats:mapStats(kpis,alerts,trends),
    leadsSource:mapLeadsSource(trends),
    leadsStatus:mapLeadsStatus(kpis),
    agentLoad:mapAgentLoad(agentPerformance),
    liveAlerts:mapLiveAlerts(alerts),
    queue:mapQueue(alerts),
  };
};

export const fetchDashboardData = async () => {
  try {
    const [ovRes,trRes,apRes] = await Promise.all([
      apiClient.get("/admin/dashboard"),
      apiClient.get("/admin/dashboard/trends",{ params:{ days:7 } }),
      apiClient.get("/admin/dashboard/agent-performance",{ params:{ page:1,limit:8 } }),
    ]);
    return mapDashboardResponse(toApiData(ovRes),toApiData(trRes),toApiData(apRes));
  } catch(err) {
    throw err;
  }
};

export default fetchDashboardData;