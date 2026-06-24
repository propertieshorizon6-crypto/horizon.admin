// 📁 src/features/admin/constants/leadsConfig.js

import { Globe, Smartphone, MessageCircle, Phone, Mail, CalendarDays, Link2, MapPin } from "lucide-react";

export const TABS       = ["All", "New", "Assigned", "In Progress", "Closed", "Archived"];
export const STATUSES   = ["New", "Assigned", "In Progress", "Closed", "Archived"];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export const KANBAN_COLS = [
  { status: "New",         label: "New",         color: "#38bdf8", bg: "#f0f9ff", border: "#bae6fd" },
  { status: "Assigned",    label: "Assigned",    color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  { status: "In Progress", label: "In Progress", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  { status: "Closed",      label: "Closed",      color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
  { status: "Archived",    label: "Archived",    color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0" },
];

export const STATUS_STYLE = {
  "New":         { bg: "#e0f2fe", color: "#0369a1" },
  "Assigned":    { bg: "#ede9fe", color: "#6d28d9" },
  "In Progress": { bg: "#fef9c3", color: "#854d0e" },
  "Closed":      { bg: "#dcfce7", color: "#166534" },
  "Archived":    { bg: "#f1f5f9", color: "#64748b" },
};

export const STATUS_DOT = {
  "New":         "#38bdf8",
  "Assigned":    "#f97316",
  "In Progress": "#f59e0b",
  "Closed":      "#22c55e",
  "Archived":    "#94a3b8",
};

export const PRIORITY_STYLE = {
  "Low":    { bg: "#f0fdf4", color: "#16a34a", border: "#86efac" },
  "Medium": { bg: "#fff7ed", color: "#ea580c", border: "#fdba74" },
  "High":   { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  "Urgent": { bg: "#fdf2f8", color: "#9d174d", border: "#f9a8d4" },
};

export const PRIORITY_COLOR = {
  Low:    "#16a34a",
  Medium: "#ea580c",
  High:   "#dc2626",
  Urgent: "#9d174d",
};

export const SOURCE_ICON = { Website: Globe, App: Smartphone, Whatsapp: MessageCircle, Call: Phone };
export const INTENT_ICON = { Inquiry: Mail, Tour: CalendarDays, Call: Phone, Message: MessageCircle };
export const SOURCE_ICON_FALLBACK = Link2;
export const INTENT_ICON_FALLBACK = MapPin;