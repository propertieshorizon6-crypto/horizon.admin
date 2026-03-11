import apiClient from "../../../services/apiClient";

export const MOCK_MODE = false;
export const MOCK_NOTIFICATIONS = [];
export const MOCK_NOTIFICATION_RULES = [];
export const MOCK_DELIVERY_LOGS = [];

const NOTIFICATION_TYPE_LABEL = {
  enquiry_received: "Inquiry",
  enquiry_responded: "Inquiry",
  tour_requested: "Tour",
  tour_confirmed: "Tour",
  tour_cancelled: "Tour",
  tour_rescheduled: "Tour",
  property_approved: "Property",
  property_rejected: "Property",
  property_submitted: "Property",
  lead_assigned: "Lead",
  lead_status_changed: "Lead",
  message_received: "Message",
  system_alert: "System",
  export_ready: "System",
};

const RULE_EVENT_LABEL = {
  enquiry_created: "Enquiry Created",
  tour_requested: "Tour Requested",
  tour_confirmed: "Tour Confirmed",
  tour_cancelled: "Tour Cancelled",
  property_submitted: "Property Submitted",
  property_approved: "Property Approved",
  property_rejected: "Property Rejected",
  lead_created: "Lead Created",
  lead_status_changed: "Lead Status Changed",
  message_received: "Message Received",
  export_completed: "Export Completed",
  user_registered: "User Registered",
};

const RECIPIENT_LABEL = {
  actor: "Actor",
  agent: "Agent",
  client: "Client",
  admin_all: "Admin",
  manager_all: "Manager",
  admin_manager: "Admin + Manager",
  custom: "Custom",
};

const toTitle = (value = "") =>
  value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatName = (user = {}) => {
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return fullName || user.email || null;
};

const formatDateTime = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const resolveNotificationChannel = (channels = {}) => {
  if (channels.push?.sent || channels.push?.messageId || channels.push?.error) {
    return "push";
  }

  if (
    channels.email?.sent ||
    channels.email?.messageId ||
    channels.email?.error
  ) {
    return "email";
  }

  return "bell";
};

const mapNotification = (notification = {}) => ({
  id: notification._id,
  title: notification.title || "Notification",
  desc: notification.message || "",
  date: formatDateTime(notification.createdAt),
  channel: resolveNotificationChannel(notification.channels),
  type:
    NOTIFICATION_TYPE_LABEL[notification.type] ||
    toTitle(notification.type || "system_alert"),
  read: Boolean(notification.isRead),
  rawType: notification.type || null,
  priority: toTitle(notification.priority || "normal"),
  deepLink: notification.deepLink?.url || null,
  createdAt: notification.createdAt || null,
  readAt: notification.readAt || null,
});

const mapRuleChannels = (channels = {}) => {
  const output = [];
  if (channels.inApp) output.push("bell");
  if (channels.email) output.push("email");
  if (channels.push) output.push("push");
  return output;
};

const resolveRuleRecipients = (rule = {}) => {
  if (rule.recipientType === "custom") {
    const recipients = Array.isArray(rule.customRecipients)
      ? rule.customRecipients
      : [];

    const names = recipients
      .map((recipient) =>
        typeof recipient === "string" ? recipient : formatName(recipient),
      )
      .filter(Boolean);

    return names.length > 0 ? names : [RECIPIENT_LABEL.custom];
  }

  return [RECIPIENT_LABEL[rule.recipientType] || toTitle(rule.recipientType)];
};

const mapNotificationRule = (rule = {}) => ({
  id: rule._id,
  name: rule.name || "Untitled Rule",
  trigger: RULE_EVENT_LABEL[rule.event] || toTitle(rule.event || ""),
  recipients: resolveRuleRecipients(rule),
  channels: mapRuleChannels(rule.channels),
  enabled: Boolean(rule.isActive),
  event: rule.event || null,
  recipientType: rule.recipientType || null,
  priority: rule.priority || "normal",
  description: rule.description || "",
  createdAt: rule.createdAt || null,
  updatedAt: rule.updatedAt || null,
});

const mapDeliveryChannel = (channel = "") => {
  if (channel === "in_app") return "bell";
  return channel || "bell";
};

const mapDeliveryLog = (log = {}) => ({
  id: log._id,
  timestamp: formatDateTime(log.createdAt || log.sentAt || log.updatedAt),
  notifId: log.notification?._id || null,
  channel: mapDeliveryChannel(log.channel),
  rawChannel: log.channel || null,
  recipient:
    log.recipientEmail ||
    formatName(log.recipient) ||
    log.recipient?.email ||
    "Unknown",
  status: log.status || "pending",
  error: log.error?.message || null,
  notificationTitle: log.notification?.title || null,
  notificationType: log.notification?.type || null,
  createdAt: log.createdAt || null,
});

const buildNotificationQuery = (params = {}) => {
  const query = { ...params };

  if (typeof query.isRead === "boolean") {
    query.isRead = query.isRead ? "true" : "false";
  }

  return query;
};

const buildRulesQuery = (params = {}) => {
  const query = { ...params };

  if (typeof query.isActive === "boolean") {
    query.isActive = query.isActive ? "true" : "false";
  }

  return query;
};

export const fetchNotifications = async (params = {}) => {
  const { data } = await apiClient.get("/notifications", {
    params: buildNotificationQuery(params),
  });

  const payload = data?.data ?? {};
  const notifications = payload.notifications ?? [];
  const mappedNotifications = notifications.map(mapNotification);
  const unreadCount =
    typeof payload.unreadCount === "number"
      ? payload.unreadCount
      : mappedNotifications.filter((item) => !item.read).length;

  return {
    notifications: mappedNotifications,
    unreadCount,
    pagination: payload.pagination ?? null,
  };
};

export const fetchUnreadNotificationCount = async () => {
  const { data } = await apiClient.get("/notifications/unread-count");
  return data?.data?.count ?? 0;
};

export const markNotificationAsRead = async (notificationId) => {
  const { data } = await apiClient.patch(`/notifications/${notificationId}/read`);
  const notification = data?.data?.notification ?? null;
  return notification ? mapNotification(notification) : null;
};

export const markAllNotificationsAsRead = async () => {
  await apiClient.patch("/notifications/read-all");
  return true;
};

export const createTestNotification = async (payload = {}) => {
  const { data } = await apiClient.post("/notifications/test", payload);
  const notification = data?.data?.notification ?? null;
  return notification ? mapNotification(notification) : null;
};

export const fetchNotificationRules = async (params = {}) => {
  const { data } = await apiClient.get("/notifications/rules", {
    params: buildRulesQuery(params),
  });

  const payload = data?.data ?? {};
  const rules = payload.rules ?? [];

  return {
    rules: rules.map(mapNotificationRule),
    pagination: payload.pagination ?? null,
  };
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
  const logs = payload.logs ?? [];

  return {
    logs: logs.map(mapDeliveryLog),
    pagination: payload.pagination ?? null,
  };
};

export const fetchDeliveryLogStats = async (params = {}) => {
  const { data } = await apiClient.get("/admin/delivery-logs/stats", { params });
  return data?.data ?? [];
};

export const fetchDeliveryHealth = async () => {
  const { data } = await apiClient.get("/admin/delivery-logs/health");
  return data?.data ?? null;
};

export const fetchDeliveryRetryQueue = async (limit = 50) => {
  const { data } = await apiClient.get("/admin/delivery-logs/retry-queue", {
    params: { limit },
  });

  const queue = data?.data ?? [];
  return queue.map(mapDeliveryLog);
};

export const resendDeliveryLogEmail = async (deliveryLogId) => {
  const { data } = await apiClient.post(
    `/admin/delivery-logs/${deliveryLogId}/resend`,
  );

  const log = data?.data?.deliveryLog ?? null;
  return log ? mapDeliveryLog(log) : null;
};

export const processDeliveryRetryQueue = async () => {
  const { data } = await apiClient.post("/admin/delivery-logs/process-retry-queue");
  return data?.data ?? null;
};
