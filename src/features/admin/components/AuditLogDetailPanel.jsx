import { X, ExternalLink } from "lucide-react";
import useAuditLog from "../hooks/useAuditLog";

const toTitle = (value = "") =>
  value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatName = (user = {}) =>
  `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || null;

const formatFullDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const shortId = (id = "") => {
  const str = String(id);
  return str.length > 8 ? `${str.slice(0, 4)}...${str.slice(-4)}` : str;
};

const resolveActionColor = (action = "") => {
  if (/(failed|rejected|deleted|cancelled|suspended|archived)/i.test(action)) {
    return "red";
  }
  if (
    /(created|assigned|changed|updated|confirmed|completed|approved|requested|published|success|activated|reset)/i.test(
      action,
    )
  ) {
    return "dark";
  }
  return "outline";
};

const ACTION_BADGE_STYLES = {
  dark: { background: "#1e293b", color: "#fff", border: "none" },
  outline: { background: "transparent", color: "#475569", border: "1px solid #cbd5e1" },
  red: { background: "#ef4444", color: "#fff", border: "none" },
};

function ActionBadge({ label, color }) {
  const style = ACTION_BADGE_STYLES[color] || ACTION_BADGE_STYLES.outline;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 12px",
        borderRadius: 7,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {label}
    </span>
  );
}

function JsonBlock({ data, label, labelColor }) {
  if (data === null || data === undefined) return null;
  const isEmpty =
    typeof data === "object" && !Array.isArray(data) && Object.keys(data).length === 0;
  if (isEmpty) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <p
        style={{
          margin: "0 0 6px",
          fontSize: 11,
          fontWeight: 700,
          color: labelColor || "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
      <pre
        style={{
          margin: 0,
          padding: "12px 14px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          fontSize: 12,
          color: "#334155",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          overflowX: "auto",
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      style={{
        margin: "0 0 8px",
        fontSize: 11,
        fontWeight: 700,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#f1f5f9", margin: "20px 0" }} />;
}

function SkeletonLine({ width = "100%", height = 14, mb = 8 }) {
  return (
    <div
      style={{
        width,
        height,
        background: "#e2e8f0",
        borderRadius: 6,
        marginBottom: mb,
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

const ENTITY_ROUTE_MAP = {
  lead: "/admin/leads",
  enquiry: "/admin/inquiries",
  tour: "/admin/tour-requests",
  property: "/admin/properties",
  user: "/admin/users",
  conversation: "/admin/conversations",
};

export default function AuditLogDetailPanel({ id, onClose }) {
  const { data: log, isLoading, error } = useAuditLog(id);

  if (!id) return null;

  const actorObj = typeof log?.actor === "object" ? log.actor : {};
  const actorName =
    formatName(actorObj) || (log?.actorRole === "system" ? "System" : "Unknown");
  const actorRole = toTitle(log?.actorRole || "");
  const actorId = actorObj?._id ? String(actorObj._id) : null;

  const actionKey = log?.action || "";
  const actionLabel = toTitle(actionKey);
  const actionColor = resolveActionColor(actionKey);

  const entityType = log?.resource?.type || "";
  const entityId = log?.resource?.id ? String(log.resource.id) : null;
  const entityLabel = toTitle(entityType);

  const summary = log?.resource?.description || null;

  const context = log?.context || null;
  const hasContext =
    context &&
    typeof context === "object" &&
    Object.values(context).some(Boolean);

  const changesBefore = log?.changes?.before ?? null;
  const changesAfter = log?.changes?.after ?? null;
  const hasChanges =
    (changesBefore !== null && changesBefore !== undefined) ||
    (changesAfter !== null && changesAfter !== undefined);

  const logIdShort = log?._id ? `al_${String(log._id).slice(-6)}` : "—";
  const timestamp = formatFullDateTime(log?.createdAt);

  const entityRoute = ENTITY_ROUTE_MAP[entityType];
  const entityHref = entityRoute && entityId ? `${entityRoute}/${entityId}` : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.25)",
          zIndex: 40,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          maxWidth: "100vw",
          background: "#fff",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 32px rgba(15,23,42,0.12)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
              Audit Log Details
            </h2>
            {!isLoading && (
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
                {logIdShort}
                {timestamp ? ` • ${timestamp}` : ""}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 7,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#94a3b8",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.color = "#475569";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {error && (
            <p style={{ color: "#dc2626", fontSize: 13 }}>
              Failed to load audit log details.
            </p>
          )}

          {isLoading ? (
            <div>
              <SkeletonLine width="60%" height={12} mb={6} />
              <SkeletonLine width="80%" height={18} mb={4} />
              <SkeletonLine width="40%" height={12} mb={20} />
              <SkeletonLine width="30%" height={12} mb={6} />
              <SkeletonLine width="55%" height={28} mb={20} />
              <SkeletonLine width="30%" height={12} mb={6} />
              <SkeletonLine width="100%" height={80} mb={0} />
            </div>
          ) : log ? (
            <>
              {/* Actor */}
              <SectionLabel>Actor</SectionLabel>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginBottom: 0,
                }}
              >
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                  {actorName}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b" }}>
                  {actorRole}
                </p>
              </div>

              <Divider />

              {/* Action + Entity */}
              <div style={{ display: "flex", gap: 20, marginBottom: 0 }}>
                <div style={{ flex: 1 }}>
                  <SectionLabel>Action</SectionLabel>
                  <ActionBadge label={actionLabel} color={actionColor} />
                </div>
                <div style={{ flex: 1 }}>
                  <SectionLabel>Entity</SectionLabel>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                        {entityLabel || "—"}
                      </p>
                      {entityId && (
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 11,
                            color: "#94a3b8",
                            fontFamily: "monospace",
                          }}
                        >
                          {shortId(entityId)}
                        </p>
                      )}
                    </div>
                    {entityHref && (
                      <a
                        href={entityHref}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          border: "1px solid #e2e8f0",
                          color: "#64748b",
                          textDecoration: "none",
                          flexShrink: 0,
                        }}
                        title="Open resource"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {summary && (
                <>
                  <Divider />
                  <SectionLabel>Summary</SectionLabel>
                  <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                    {summary}
                  </p>
                </>
              )}

              {hasContext && (
                <>
                  <Divider />
                  <SectionLabel>Metadata</SectionLabel>
                  <pre
                    style={{
                      margin: 0,
                      padding: "12px 14px",
                      background: "#1e293b",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#94a3b8",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                      overflowX: "auto",
                    }}
                  >
                    {JSON.stringify(
                      Object.fromEntries(
                        Object.entries(context).filter(([, v]) => v !== undefined && v !== null && v !== ""),
                      ),
                      null,
                      2,
                    )}
                  </pre>
                </>
              )}

              {hasChanges && (
                <>
                  <Divider />
                  <SectionLabel>State Changes</SectionLabel>
                  <JsonBlock data={changesBefore} label="Before" labelColor="#b45309" />
                  <JsonBlock data={changesAfter} label="After" labelColor="#16a34a" />
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
