import { useMemo, useState } from "react";
import { Calendar, ChevronDown, Eye, Search } from "lucide-react";
import useAuditLogs from "../hooks/useAuditLogs";

const ACTION_KEYS = [
  "lead_created",
  "lead_assigned",
  "lead_reassigned",
  "lead_status_changed",
  "lead_archived",
  "lead_unarchived",
  "lead_note_added",
  "lead_note_deleted",
  "enquiry_created",
  "enquiry_status_changed",
  "tour_created",
  "tour_confirmed",
  "tour_cancelled",
  "tour_completed",
  "tour_rescheduled",
  "property_created",
  "property_updated",
  "property_submitted",
  "property_approved",
  "property_rejected",
  "property_published",
  "property_unpublished",
  "property_deleted",
  "property_restored",
  "property_featured",
  "property_unfeatured",
  "user_created",
  "user_updated",
  "user_role_changed",
  "user_status_changed",
  "user_suspended",
  "user_activated",
  "user_deleted",
  "conversation_created",
  "conversation_closed",
  "export_requested",
  "export_completed",
  "export_failed",
  "notification_rule_created",
  "notification_rule_updated",
  "notification_rule_deleted",
  "login_success",
  "login_failed",
  "password_changed",
  "password_reset",
];

const RESOURCE_KEYS = [
  "lead",
  "enquiry",
  "tour",
  "property",
  "user",
  "conversation",
  "export",
  "notification_rule",
  "auth",
];

const ROLE_KEYS = ["admin", "manager", "agent", "client", "system"];

const toLabel = (value = "") =>
  value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ACTION_OPTIONS = ACTION_KEYS.map((value) => ({
  value,
  label: toLabel(value),
}));

const RESOURCE_OPTIONS = RESOURCE_KEYS.map((value) => ({
  value,
  label: toLabel(value),
}));

const ROLE_OPTIONS = ROLE_KEYS.map((value) => ({
  value,
  label: toLabel(value),
}));

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

function ActionBadge({ label, color }) {
  const styles = {
    dark: { background: "#1e293b", color: "#fff", border: "none" },
    outline: {
      background: "transparent",
      color: "#475569",
      border: "1px solid #cbd5e1",
    },
    red: { background: "#ef4444", color: "#fff", border: "none" },
  };

  const style = styles[color] || styles.outline;

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

function FilterSelect({ label, options, value, onChange, minWidth = 140 }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          appearance: "none",
          paddingLeft: 14,
          paddingRight: 32,
          paddingTop: 10,
          paddingBottom: 10,
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          fontSize: 13,
          color: value ? "#1e293b" : "#64748b",
          background: "#fff",
          cursor: "pointer",
          outline: "none",
          minWidth,
        }}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#94a3b8",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const queryParams = useMemo(() => {
    const params = { page: 1, limit: 200 };

    if (actionFilter) params.action = actionFilter;
    if (entityFilter) params.resourceType = entityFilter;
    if (dateFrom) params.startDate = dateFrom;
    if (dateTo) params.endDate = dateTo;

    return params;
  }, [actionFilter, entityFilter, dateFrom, dateTo]);

  const { data, isLoading, error } = useAuditLogs(queryParams);

  const logs = useMemo(() => data?.logs ?? [], [data]);
  const remoteTotal = data?.pagination?.total ?? logs.length;

  const filteredLogs = useMemo(() => {
    let result = logs;

    if (roleFilter) {
      result = result.filter((log) => log.actorRoleKey === roleFilter);
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter((log) =>
        [
          log.entityId,
          log.entity,
          log.actor,
          log.summary,
          log.action,
          log.actorRole,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        ),
      );
    }

    return result;
  }, [logs, roleFilter, search]);

  const hasLocalFilter = Boolean(search.trim() || roleFilter);
  const countLabel = hasLocalFilter
    ? `${filteredLogs.length} of ${remoteTotal}`
    : `${remoteTotal}`;

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#f8fafc",
        fontFamily: "system-ui,sans-serif",
        padding: "28px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 22,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
            Audit Logs
          </h1>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
            Track all system activities and changes
          </p>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          padding: "14px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by ID, entity, actor, summary..."
            style={{
              width: "100%",
              paddingLeft: 32,
              paddingRight: 12,
              paddingTop: 10,
              paddingBottom: 10,
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              fontSize: 13,
              color: "#334155",
              outline: "none",
              boxSizing: "border-box",
              background: "#fafafa",
            }}
          />
        </div>

        <FilterSelect
          value={actionFilter}
          onChange={setActionFilter}
          label="All Actions"
          options={ACTION_OPTIONS}
        />
        <FilterSelect
          value={entityFilter}
          onChange={setEntityFilter}
          label="All Entities"
          options={RESOURCE_OPTIONS}
        />
        <FilterSelect
          value={roleFilter}
          onChange={setRoleFilter}
          label="All Roles"
          options={ROLE_OPTIONS}
          minWidth={130}
        />

        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowDatePicker((state) => !state)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingLeft: 14,
              paddingRight: 14,
              paddingTop: 10,
              paddingBottom: 10,
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              fontSize: 13,
              color: dateFrom || dateTo ? "#1e293b" : "#64748b",
              background: "#fff",
              cursor: "pointer",
              outline: "none",
              whiteSpace: "nowrap",
            }}
          >
            <Calendar size={14} color="#94a3b8" />
            {dateFrom || dateTo
              ? `${dateFrom || "Start"} - ${dateTo || "End"}`
              : "From - To"}
          </button>

          {showDatePicker && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 16,
                zIndex: 50,
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  FROM
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 13,
                    outline: "none",
                    color: "#334155",
                  }}
                />
              </div>

              <span style={{ color: "#94a3b8", marginTop: 16 }}>-</span>

              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#94a3b8",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  TO
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 13,
                    outline: "none",
                    color: "#334155",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setShowDatePicker(false);
                }}
                style={{
                  marginTop: 16,
                  padding: "6px 10px",
                  border: "none",
                  borderRadius: 7,
                  background: "#f1f5f9",
                  fontSize: 12,
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                style={{
                  marginTop: 16,
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 7,
                  background: "#1e293b",
                  fontSize: 12,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p style={{ margin: "0 0 12px", color: "#dc2626", fontSize: 12 }}>
          {getErrorMessage(error, "Unable to load audit logs")}
        </p>
      )}

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            {countLabel} Log {filteredLogs.length === 1 ? "Entry" : "Entries"}
          </h2>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              {["Timestamp", "Actor", "Action", "Entity", "Summary", "Details"].map(
                (header) => (
                  <th
                    key={header}
                    style={{
                      padding: "11px 20px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "48px 0",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: 13,
                  }}
                >
                  Loading audit logs...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "48px 0",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: 13,
                  }}
                >
                  No log entries found
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, index) => (
                <tr
                  key={log.id}
                  style={{
                    borderBottom:
                      index < filteredLogs.length - 1 ? "1px solid #f8fafc" : "none",
                    background: "#fff",
                    transition: "background 0.1s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = "#fafafa";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "#fff";
                  }}
                >
                  <td
                    style={{
                      padding: "16px 20px",
                      fontSize: 13,
                      color: "#475569",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {log.timestamp || "-"}
                  </td>

                  <td style={{ padding: "16px 20px" }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {log.actor || "-"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>
                      {log.actorRole || "-"}
                    </p>
                  </td>

                  <td style={{ padding: "16px 20px" }}>
                    <ActionBadge label={log.action || "-"} color={log.color} />
                  </td>

                  <td style={{ padding: "16px 20px" }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      {log.entity || "-"}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 11,
                        color: "#94a3b8",
                        fontFamily: "monospace",
                      }}
                    >
                      {log.entityId || "-"}
                    </p>
                  </td>

                  <td style={{ padding: "16px 20px", fontSize: 13, color: "#475569" }}>
                    {log.summary || "-"}
                  </td>

                  <td style={{ padding: "16px 20px" }}>
                    <button
                      type="button"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 30,
                        height: 30,
                        borderRadius: 7,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "#94a3b8",
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = "#f1f5f9";
                        event.currentTarget.style.color = "#475569";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = "transparent";
                        event.currentTarget.style.color = "#94a3b8";
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

