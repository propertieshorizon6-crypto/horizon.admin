import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_NOTIFICATIONS = [];
export const MOCK_NOTIFICATION_RULES = [];
export const MOCK_DELIVERY_LOGS = [];

const NOTIFICATION_TYPE_LABEL = {
  enquiry_received:   "Inquiry",
  enquiry_responded:  "Inquiry",
  tour_requested:     "Tour",
  tour_confirmed:     "Tour",
  tour_cancelled:     "Tour",
  tour_rescheduled:   "Tour",
  property_approved:  "Property",
  property_rejected:  "Property",
  property_submitted: "Property",
  lead_assigned:      "Lead",
  lead_status_changed:"Lead",
  message_received:   "Message",
  system_alert:       "System",
  export_ready:       "System",
};

const RULE_EVENT_LABEL = {
  enquiry_created:      "Enquiry Created",
  tour_requested:       "Tour Requested",
  tour_confirmed:       "Tour Confirmed",
  tour_cancelled:       "Tour Cancelled",
  property_submitted:   "Property Submitted",
  property_approved:    "Property Approved",
  property_rejected:    "Property Rejected",
  lead_created:         "Lead Created",
  lead_status_changed:  "Lead Status Changed",
  message_received:     "Message Received",
  export_completed:     "Export Completed",
  user_registered:      "User Registered",
};

const RECIPIENT_LABEL = {
  actor:         "Actor",
  agent:         "Agent",
  client:        "Client",
  admin_all:     "Admin",
  manager_all:   "Manager",
  admin_manager: "Admin + Manager",
  custom:        "Custom",
};

const toTitle = (value = "") =>
  value.replace(/[_-]+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());

const formatName = (user = {}) =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || null;

const formatDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const resolveNotificationChannel = (channels = {}) => {
  if (channels.push?.sent || channels.push?.messageId || channels.push?.error) return "push";
  if (channels.email?.sent || channels.email?.messageId || channels.email?.error) return "email";
  return "bell";
};

const mapNotification = (n = {}) => ({
  id:       n._id,
  title:    n.title || "Notification",
  desc:     n.message || "",
  date:     formatDateTime(n.createdAt),
  channel:  resolveNotificationChannel(n.channels),
  type:     NOTIFICATION_TYPE_LABEL[n.type] || toTitle(n.type || "system_alert"),
  read:     Boolean(n.isRead),
  rawType:  n.type || null,
  priority: toTitle(n.priority || "normal"),
  deepLink: n.deepLink?.url || null,
  createdAt:n.createdAt || null,
  readAt:   n.readAt || null,
});

const mapRuleChannels = (channels = {}) => {
  const out = [];
  if (channels.inApp) out.push("bell");
  if (channels.email) out.push("email");
  if (channels.push)  out.push("push");
  return out;
};

const resolveRuleRecipients = (rule = {}) => {
  if (rule.recipientType === "custom") {
    const names = (Array.isArray(rule.customRecipients) ? rule.customRecipients : [])
      .map((r) => typeof r === "string" ? r : formatName(r))
      .filter(Boolean);
    return names.length > 0 ? names : [RECIPIENT_LABEL.custom];
  }
  return [RECIPIENT_LABEL[rule.recipientType] || toTitle(rule.recipientType)];
};

const mapNotificationRule = (rule = {}) => ({
  id:           rule._id,
  name:         rule.name || "Untitled Rule",
  trigger:      RULE_EVENT_LABEL[rule.event] || toTitle(rule.event || ""),
  recipients:   resolveRuleRecipients(rule),
  channels:     mapRuleChannels(rule.channels),
  enabled:      Boolean(rule.isActive),
  event:        rule.event || null,
  recipientType:rule.recipientType || null,
  priority:     rule.priority || "normal",
  description:  rule.description || "",
  createdAt:    rule.createdAt || null,
  updatedAt:    rule.updatedAt || null,
});

const mapDeliveryChannel = (channel = "") => channel === "in_app" ? "bell" : (channel || "bell");

const mapDeliveryLog = (log = {}) => ({
  id:               log._id,
  timestamp:        formatDateTime(log.createdAt || log.sentAt || log.updatedAt),
  notifId:          log.notification?._id || null,
  channel:          mapDeliveryChannel(log.channel),
  rawChannel:       log.channel || null,
  recipient:        log.recipientEmail || formatName(log.recipient) || log.recipient?.email || "Unknown",
  status:           log.status || "pending",
  error:            log.error?.message || null,
  notificationTitle:log.notification?.title || null,
  notificationType: log.notification?.type  || null,
  createdAt:        log.createdAt || null,
});

// ── API Functions ─────────────────────────────────────────────────────────────

export const fetchNotifications = async (params = {}) => {
  const query = { ...params };
  if (typeof query.isRead === "boolean") query.isRead = query.isRead ? "true" : "false";
  const { data } = await apiClient.get("/notifications", { params: query });
  const payload = data?.data ?? {};
  const notifications = (payload.notifications ?? []).map(mapNotification);
  return {
    notifications,
    unreadCount: typeof payload.unreadCount === "number" ? payload.unreadCount : notifications.filter((n) => !n.read).length,
    pagination:  payload.pagination ?? null,
  };
};

export const fetchUnreadNotificationCount = async () => {
  const { data } = await apiClient.get("/notifications/unread-count");
  return data?.data?.count ?? 0;
};

export const markNotificationAsRead = async (notificationId) => {
  const { data } = await apiClient.patch(`/notifications/${notificationId}/read`);
  const n = data?.data?.notification ?? null;
  return n ? mapNotification(n) : null;
};

export const markAllNotificationsAsRead = async () => {
  await apiClient.patch("/notifications/read-all");
  return true;
};

export const fetchNotificationRules = async (params = {}) => {
  const query = { ...params };
  if (typeof query.isActive === "boolean") query.isActive = query.isActive ? "true" : "false";
  const { data } = await apiClient.get("/notifications/rules", { params: query });
  const payload = data?.data ?? {};
  return { rules: (payload.rules ?? []).map(mapNotificationRule), pagination: payload.pagination ?? null };
};

export const createNotificationRule = async (payload) => {
  const { data } = await apiClient.post("/notifications/rules", payload);
  const rule = data?.data?.rule ?? null;
  return rule ? mapNotificationRule(rule) : null;
};

export const updateNotificationRule = async (ruleId, payload) => {
  const { data } = await apiClient.put(`/notifications/rules/${ruleId}`, payload);
  const rule = data?.data?.rule ?? null;
  return rule ? mapNotificationRule(rule) : null;
};

export const deleteNotificationRule = async (ruleId) => {
  await apiClient.delete(`/notifications/rules/${ruleId}`);
  return true;
};

export const fetchDeliveryLogs = async (params = {}) => {
  const { data } = await apiClient.get("/admin/delivery-logs", { params });
  const payload = data?.data ?? {};
  return { logs: (payload.logs ?? []).map(mapDeliveryLog), pagination: payload.pagination ?? null };
};

export const resendDeliveryLogEmail = async (deliveryLogId) => {
  const { data } = await apiClient.post(`/admin/delivery-logs/${deliveryLogId}/resend`);
  const log = data?.data?.deliveryLog ?? null;
  return log ? mapDeliveryLog(log) : null;
};

export const fetchDeliveryHealth = async () => {
  const { data } = await apiClient.get("/admin/delivery-logs/health");
  return data?.data ?? null;
};

export const processDeliveryRetryQueue = async () => {
  const { data } = await apiClient.post("/admin/delivery-logs/process-retry-queue");
  return data?.data ?? null;
};