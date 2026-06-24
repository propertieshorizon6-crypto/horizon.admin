import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { Search, ChevronDown, UserPlus, X, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import useUsers from "../hooks/useUsers";
import UserActionsMenu from "../components/UserActionsMenu";
import UserDetailPage from "../components/UserDetailPage";
import {
  createUser as createUserApi,
  updateUser as updateUserApi,
  changeUserRole as changeUserRoleApi,
  changeUserStatus as changeUserStatusApi,
  deleteUser as deleteUserApi,
  verifyAgent as verifyAgentApi,
  fetchUserStats,
} from "../api/usersApi";
import { useAuthStore } from "../../../store/useAuthStore";

const columnHelper = createColumnHelper();
const EMPTY = [];
const ROLE_OPTIONS = ["Agent", "Manager", "Admin"];
const STATUS_OPTIONS = ["Active", "Inactive", "Suspended"];

const DIAL_CODES = [
  { name: "Zambia",                       code: "ZM", dial: "+260" },
  { name: "Zimbabwe",                     code: "ZW", dial: "+263" },
  { name: "South Africa",                 code: "ZA", dial: "+27"  },
  { name: "Nigeria",                      code: "NG", dial: "+234" },
  { name: "Kenya",                        code: "KE", dial: "+254" },
  { name: "Tanzania",                     code: "TZ", dial: "+255" },
  { name: "Uganda",                       code: "UG", dial: "+256" },
  { name: "Ghana",                        code: "GH", dial: "+233" },
  { name: "Ethiopia",                     code: "ET", dial: "+251" },
  { name: "Egypt",                        code: "EG", dial: "+20"  },
  { name: "Morocco",                      code: "MA", dial: "+212" },
  { name: "Tunisia",                      code: "TN", dial: "+216" },
  { name: "Algeria",                      code: "DZ", dial: "+213" },
  { name: "Botswana",                     code: "BW", dial: "+267" },
  { name: "Namibia",                      code: "NA", dial: "+264" },
  { name: "Malawi",                       code: "MW", dial: "+265" },
  { name: "Mozambique",                   code: "MZ", dial: "+258" },
  { name: "Rwanda",                       code: "RW", dial: "+250" },
  { name: "Senegal",                      code: "SN", dial: "+221" },
  { name: "Ivory Coast",                  code: "CI", dial: "+225" },
  { name: "Cameroon",                     code: "CM", dial: "+237" },
  { name: "Angola",                       code: "AO", dial: "+244" },
  { name: "Dem. Rep. of Congo",           code: "CD", dial: "+243" },
  { name: "United States",                code: "US", dial: "+1"   },
  { name: "Canada",                       code: "CA", dial: "+1"   },
  { name: "United Kingdom",               code: "GB", dial: "+44"  },
  { name: "Germany",                      code: "DE", dial: "+49"  },
  { name: "France",                       code: "FR", dial: "+33"  },
  { name: "Italy",                        code: "IT", dial: "+39"  },
  { name: "Spain",                        code: "ES", dial: "+34"  },
  { name: "Netherlands",                  code: "NL", dial: "+31"  },
  { name: "Australia",                    code: "AU", dial: "+61"  },
  { name: "India",                        code: "IN", dial: "+91"  },
  { name: "China",                        code: "CN", dial: "+86"  },
  { name: "United Arab Emirates",         code: "AE", dial: "+971" },
  { name: "Saudi Arabia",                 code: "SA", dial: "+966" },
  { name: "Pakistan",                     code: "PK", dial: "+92"  },
  { name: "Brazil",                       code: "BR", dial: "+55"  },
  { name: "Turkey",                       code: "TR", dial: "+90"  },
  { name: "Russia",                       code: "RU", dial: "+7"   },
];

// Split a stored phone (e.g. "+260971234567") into { dialCode, number }
function parsePhone(phone = "") {
  const sorted = [...DIAL_CODES].sort((a, b) => b.dial.length - a.dial.length);
  for (const { dial } of sorted) {
    if (phone.startsWith(dial)) return { dialCode: dial, number: phone.slice(dial.length) };
  }
  return { dialCode: "+260", number: phone };
}

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 13,
  boxSizing: "border-box",
};

const getErrorMessage = (error, fallback) =>
   error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 14px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, color: "#000000" }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              color: "#64748b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: 14 }}>{children}</div>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const map = {
    Agent: { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
    Manager: { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
    Admin: { bg: "#fef3c7", color: "#b45309", border: "#fde68a" },
  };
  const style = map[role] ?? map.Agent;
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 99,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const key = String(status || "").toLowerCase();
  const map = {
    active: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
    suspended: { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" },
    inactive: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
  };
  const style = map[key] ?? map.inactive;
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 99,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {status}
    </span>
  );
}

export default function UsersAgentsPage() {
  const authUser = useAuthStore((state) => state.user);
  const currentUserRole = String(authUser?.role || "").toLowerCase();
  const currentUserId = authUser?._id || authUser?.id || "";
  const isAdmin = currentUserRole === "admin";
  const queryClient = useQueryClient();

  const [globalFilter, setGlobalFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // debounced
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Debounce the search box before it hits the server.
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(globalFilter.trim()), 400);
    return () => clearTimeout(t);
  }, [globalFilter]);

  // Any server-driven filter change resets to the first page.
  useEffect(() => { setPage(1); }, [searchQuery, roleFilter, statusFilter]);

  const userParams = useMemo(() => ({
    role: roleFilter ? roleFilter.toLowerCase() : undefined,
    status: statusFilter ? statusFilter.toLowerCase() : undefined,
    search: searchQuery || undefined,
    page,
    limit: 10,
  }), [roleFilter, statusFilter, searchQuery, page]);

  const { data, isLoading, isFetching } = useUsers(userParams);
  const users = data?.users ?? EMPTY;
  const pagination = data?.pagination ?? { page: 1, total: 0, pages: 1 };

  const { data: apiStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: fetchUserStats,
    staleTime: 1000 * 60 * 5,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);
  const [modal, setModal] = useState({ type: "", user: null });
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneDialCode: "+260",
    phoneNumber: "",
    role: "Agent",
    password: "",
  });
  const [createErrors, setCreateErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateCreate = (form) => {
    const e = {};
    if (!form.firstName.trim())                       e.firstName = "First name is required";
    else if (form.firstName.trim().length > 50)       e.firstName = "First name cannot exceed 50 characters";
    if (!form.lastName.trim())                        e.lastName  = "Last name is required";
    else if (form.lastName.trim().length > 50)        e.lastName  = "Last name cannot exceed 50 characters";
    if (!form.email.trim())                           e.email     = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Invalid email format";
    if (!form.phoneNumber.trim()) {
      e.phoneNumber = "Phone number is required";
    } else {
      const full = `${form.phoneDialCode}${form.phoneNumber}`;
      if (!/^\+?[1-9]\d{1,14}$/.test(full))          e.phoneNumber = "Invalid phone number";
    }
    if (!form.password)                               e.password  = "Password is required";
    else if (form.password.length < 8)                e.password  = "Must be at least 8 characters";
    else if (form.password.length > 128)              e.password  = "Must not exceed 128 characters";
    else if (!/[a-z]/.test(form.password))            e.password  = "Must contain a lowercase letter";
    else if (!/[A-Z]/.test(form.password))            e.password  = "Must contain an uppercase letter";
    else if (!/[0-9]/.test(form.password))            e.password  = "Must contain a number";
    return e;
  };
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneDialCode: "+260",
    phoneNumber: "",
  });
  const [roleForm, setRoleForm] = useState("Agent");
  const [statusForm, setStatusForm] = useState({ status: "Active", reason: "" });

  const invalidateUserQueries = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["users"] }),
      queryClient.invalidateQueries({ queryKey: ["user-stats"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail"] }),
    ]);

  const createMutation = useMutation({
    mutationFn: createUserApi,
    onSuccess: async () => {
      await invalidateUserQueries();
      setModal({ type: "", user: null });
      setCreateErrors({});
      setActionStatus({ type: "success", message: "User created successfully." });
    },
    onError: (error) => {
      const errBody = error?.response?.data?.error;
      const details = Array.isArray(errBody?.details) ? errBody.details
                    : Array.isArray(errBody?.stack)   ? errBody.stack
                    : null;
      if (details?.length) {
        const fieldErrs = {};
        details.forEach(({ field, message }) => {
          const key = field.replace("body.", "");
          fieldErrs[key] = message;
        });
        setCreateErrors(fieldErrs);
      } else {
        setCreateErrors({ _general: getErrorMessage(error, "Unable to create user.") });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }) => updateUserApi(userId, payload),
    onSuccess: async () => {
      await invalidateUserQueries();
      setModal({ type: "", user: null });
      setActionStatus({ type: "success", message: "User updated successfully." });
    },
    onError: (error) =>
      setActionStatus({ type: "error", message: getErrorMessage(error, "Unable to update user.") }),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => changeUserRoleApi(userId, role),
    onSuccess: async () => {
      await invalidateUserQueries();
      setModal({ type: "", user: null });
      setActionStatus({ type: "success", message: "Role updated successfully." });
    },
    onError: (error) =>
      setActionStatus({ type: "error", message: getErrorMessage(error, "Unable to change role.") }),
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ userId, status, reason }) => changeUserStatusApi(userId, status, reason),
    onSuccess: async () => {
      await invalidateUserQueries();
      setModal({ type: "", user: null });
      setActionStatus({ type: "success", message: "Status updated successfully." });
    },
    onError: (error) =>
      setActionStatus({ type: "error", message: getErrorMessage(error, "Unable to change status.") }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserApi,
    onSuccess: async () => {
      await invalidateUserQueries();
      setModal({ type: "", user: null });
      setActionStatus({ type: "success", message: "User deleted successfully." });
    },
    onError: (error) =>
      setActionStatus({ type: "error", message: getErrorMessage(error, "Unable to delete user.") }),
  });

  const verifyMutation = useMutation({
    mutationFn: verifyAgentApi,
    onSuccess: async () => {
      await invalidateUserQueries();
      setActionStatus({ type: "success", message: "Agent verified successfully." });
    },
    onError: (error) =>
      setActionStatus({ type: "error", message: getErrorMessage(error, "Unable to verify agent.") }),
  });

  // Stats come from the dedicated /admin/users/stats endpoint so the counters
  // stay accurate regardless of which page/filter is showing in the table.
  const stats = useMemo(() => ({
    total: apiStats?.total ?? pagination.total ?? 0,
    active: apiStats?.active ?? 0,
    agents: apiStats?.agents ?? 0,
    admins: apiStats?.adminsManagers ?? 0,
  }), [apiStats, pagination.total]);

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "User",
      cell: (info) => (
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#000000" }}>{info.getValue()}</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>{info.row.original.email}</p>
        </div>
      ),
    }),
    columnHelper.accessor("role", { header: "Role", cell: (info) => <RoleBadge role={info.getValue()} /> }),
    columnHelper.accessor("status", { header: "Status", cell: (info) => <StatusBadge status={info.getValue()} /> }),
    columnHelper.accessor("lastLogin", {
      header: "Last Login",
      cell: (info) => <span style={{ fontSize: 12, color: "#64748b" }}>{info.getValue() ?? "-"}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", width: "100%" }}>
          <UserActionsMenu
            user={row.original}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            onViewDetails={setSelectedUser}
            onEditUser={(user) => {
              const { dialCode, number } = parsePhone(user.phone || "");
              setEditForm({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phoneDialCode: dialCode,
                phoneNumber: number,
              });
              setModal({ type: "edit", user });
            }}
            onChangeRole={(user) => {
              setRoleForm(user.role || "Agent");
              setModal({ type: "role", user });
            }}
            onChangeStatus={(user) => {
              setStatusForm({ status: user.status || "Active", reason: "" });
              setModal({ type: "status", user });
            }}
            onVerifyAgent={(user) => {
              if (!window.confirm(`Verify agent "${user.name}"?`)) return;
              verifyMutation.mutate(user.id);
            }}
            onDeleteUser={(user) => setModal({ type: "delete", user })}
          />
        </div>
      ),
    }),
  ], [currentUserRole, currentUserId, verifyMutation]);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination.pages,
  });

  if (selectedUser) return <UserDetailPage user={selectedUser} onBack={() => setSelectedUser(null)} />;

  if (isLoading) {
    return (
      <div style={{ padding: 28, color: "#64748b", fontSize: 13 }}>
        Loading users...
      </div>
    );
  }

  const closeModal = () => { setModal({ type: "", user: null }); setShowPassword(false); };

  return (
    <div className="p-4 md:p-6 min-h-full" style={{ background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#000000" }}>Users & Agents</h1>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Manage team members and their roles</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setCreateForm({ firstName: "", lastName: "", email: "", phoneDialCode: "+260", phoneNumber: "", role: "Agent", password: "" });
              setCreateErrors({});
              setModal({ type: "create", user: null });
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #2D368E", background: "#2D368E", color: "#fff", borderRadius: 8, padding: "8px 12px", fontSize: 13, cursor: "pointer" }}
          >
            <UserPlus size={14} />
            Add User
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        {[
          ["Total Users", stats.total],
          ["Active", stats.active],
          ["Agents", stats.agents],
          ["Admins / Managers", stats.admins],
        ].map(([label, value]) => (
          <div key={label} style={{ flex: 1, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#000000" }}>{value}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{label}</p>
          </div>
        ))}
      </div>

      {actionStatus && (
        <div style={{ marginBottom: 12, padding: "9px 11px", borderRadius: 8, border: actionStatus.type === "error" ? "1px solid #fecaca" : "1px solid #bbf7d0", background: actionStatus.type === "error" ? "#fef2f2" : "#f0fdf4", color: actionStatus.type === "error" ? "#b91c1c" : "#166534", display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600 }}>
          {actionStatus.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
          {actionStatus.message}
        </div>
      )}

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, marginBottom: 12, display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Search by name/email/role..." style={{ ...inputStyle, paddingLeft: 30 }} />
        </div>
        {[
          { value: roleFilter, set: setRoleFilter, label: "All Roles", opts: ROLE_OPTIONS },
          { value: statusFilter, set: setStatusFilter, label: "Status", opts: STATUS_OPTIONS },
        ].map(({ value, set, label, opts }) => (
          <div key={label} style={{ position: "relative" }}>
            <select value={value} onChange={(event) => set(event.target.value)} style={{ ...inputStyle, minWidth: 120, appearance: "none", paddingRight: 28 }}>
              <option value="">{label}</option>
              {opts.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <ChevronDown size={11} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              {table.getHeaderGroups().map((group) =>
                group.headers.map((header) => (
                  <th key={header.id} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 28, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No users found</td></tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr key={row.id} onClick={() => setSelectedUser(row.original)} style={{ borderBottom: index < table.getRowModel().rows.length - 1 ? "1px solid #f8fafc" : "none", cursor: "pointer" }}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      onClick={cell.column.id === "actions" ? (event) => event.stopPropagation() : undefined}
                      style={{
                        padding: "12px 14px",
                        verticalAlign: "middle",
                        width: cell.column.id === "actions" ? 72 : undefined,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {pagination.pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              {isFetching && <span style={{ marginRight: 8 }}>Updating…</span>}
              Page <strong style={{ color: "#475569" }}>{pagination.page}</strong> of{" "}
              <strong style={{ color: "#475569" }}>{pagination.pages}</strong>
              {" · "}<strong style={{ color: "#475569" }}>{pagination.total}</strong> users
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
                style={{ padding: "5px 14px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, color: "#475569", background: "#fff", cursor: page <= 1 || isFetching ? "not-allowed" : "pointer", opacity: page <= 1 || isFetching ? 0.4 : 1 }}
              >Previous</button>
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  disabled={isFetching}
                  style={{ width: 30, height: 30, borderRadius: 7, fontSize: 12, fontWeight: 700, border: page === i + 1 ? "none" : "1px solid #e2e8f0", background: page === i + 1 ? "#2D368E" : "#fff", color: page === i + 1 ? "#fff" : "#475569", cursor: isFetching ? "not-allowed" : "pointer" }}
                >{i + 1}</button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages || isFetching}
                style={{ padding: "5px 14px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, color: "#475569", background: "#fff", cursor: page >= pagination.pages || isFetching ? "not-allowed" : "pointer", opacity: page >= pagination.pages || isFetching ? 0.4 : 1 }}
              >Next</button>
            </div>
          </div>
        )}
      </div>

      {modal.type === "create" && (
        <Modal title="Create User" onClose={closeModal}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const errs = validateCreate(createForm);
              if (Object.keys(errs).length) { setCreateErrors(errs); return; }
              setCreateErrors({});
              const { phoneDialCode, phoneNumber, ...rest } = createForm;
              createMutation.mutate({
                ...rest,
                phone: phoneNumber ? `${phoneDialCode}${phoneNumber}` : undefined,
              });
            }}
            style={{ display: "grid", gap: 10 }}
          >
            {/* First / Last name */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <input
                  placeholder="First name *"
                  value={createForm.firstName}
                  onChange={(e) => { setCreateForm((p) => ({ ...p, firstName: e.target.value })); setCreateErrors((p) => ({ ...p, firstName: "" })); }}
                  style={{ ...inputStyle, borderColor: createErrors.firstName ? "#fca5a5" : "#e2e8f0" }}
                />
                {createErrors.firstName && <span style={{ fontSize: 11, color: "#b91c1c", marginTop: 3, display: "block" }}>{createErrors.firstName}</span>}
              </div>
              <div>
                <input
                  placeholder="Last name *"
                  value={createForm.lastName}
                  onChange={(e) => { setCreateForm((p) => ({ ...p, lastName: e.target.value })); setCreateErrors((p) => ({ ...p, lastName: "" })); }}
                  style={{ ...inputStyle, borderColor: createErrors.lastName ? "#fca5a5" : "#e2e8f0" }}
                />
                {createErrors.lastName && <span style={{ fontSize: 11, color: "#b91c1c", marginTop: 3, display: "block" }}>{createErrors.lastName}</span>}
              </div>
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email *"
                value={createForm.email}
                onChange={(e) => { setCreateForm((p) => ({ ...p, email: e.target.value })); setCreateErrors((p) => ({ ...p, email: "" })); }}
                style={{ ...inputStyle, borderColor: createErrors.email ? "#fca5a5" : "#e2e8f0" }}
              />
              {createErrors.email && <span style={{ fontSize: 11, color: "#b91c1c", marginTop: 3, display: "block" }}>{createErrors.email}</span>}
            </div>

            {/* Phone with country code */}
            <div>
              <div style={{ display: "flex" }}>
                <select
                  value={createForm.phoneDialCode}
                  onChange={(e) => setCreateForm((p) => ({ ...p, phoneDialCode: e.target.value }))}
                  style={{ ...inputStyle, width: "auto", borderRight: "none", borderRadius: "8px 0 0 8px", background: "#f8fafc", color: "#475569", cursor: "pointer" }}
                >
                  {DIAL_CODES.map((c) => (
                    <option key={c.code + c.dial} value={c.dial}>{c.name} ({c.dial})</option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="Phone number *"
                  value={createForm.phoneNumber}
                  onChange={(e) => { setCreateForm((p) => ({ ...p, phoneNumber: e.target.value.replace(/\D/g, "") })); setCreateErrors((p) => ({ ...p, phoneNumber: "" })); }}
                  style={{ ...inputStyle, borderRadius: "0 8px 8px 0", flex: 1, borderColor: createErrors.phoneNumber ? "#fca5a5" : "#e2e8f0" }}
                />
              </div>
              {createErrors.phoneNumber && <span style={{ fontSize: 11, color: "#b91c1c", marginTop: 3, display: "block" }}>{createErrors.phoneNumber}</span>}
            </div>

            {/* Role */}
            <select value={createForm.role} onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))} style={inputStyle}>
              {ROLE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>

            {/* Password */}
            <div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password *"
                  value={createForm.password}
                  onChange={(e) => { setCreateForm((p) => ({ ...p, password: e.target.value })); setCreateErrors((p) => ({ ...p, password: "" })); }}
                  style={{ ...inputStyle, borderColor: createErrors.password ? "#fca5a5" : "#e2e8f0", paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {createErrors.password
                ? <span style={{ fontSize: 11, color: "#b91c1c", marginTop: 3, display: "block" }}>{createErrors.password}</span>
                : <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, display: "block" }}>Min 8 chars · uppercase · lowercase · number</span>
              }
            </div>

            {/* General API error */}
            {createErrors._general && (
              <div style={{ padding: "8px 10px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={13} />
                {createErrors._general}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={closeModal} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={createMutation.isPending} style={{ border: "1px solid #2D368E", background: "#2D368E", color: "#fff", borderRadius: 8, padding: "8px 12px", cursor: createMutation.isPending ? "not-allowed" : "pointer", opacity: createMutation.isPending ? 0.7 : 1 }}>{createMutation.isPending ? "Creating..." : "Create"}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal.type === "edit" && modal.user && (
        <Modal title="Edit User" onClose={closeModal}>
          <form onSubmit={(event) => {
            event.preventDefault();
            const user = modal.user;
            const payload = {};
            if ((editForm.firstName || "").trim() !== (user.firstName || "").trim()) payload.firstName = editForm.firstName.trim();
            if ((editForm.lastName || "").trim() !== (user.lastName || "").trim()) payload.lastName = editForm.lastName.trim();
            if ((editForm.email || "").trim().toLowerCase() !== (user.email || "").trim().toLowerCase()) payload.email = editForm.email.trim().toLowerCase();
            const fullPhone = editForm.phoneNumber ? `${editForm.phoneDialCode}${editForm.phoneNumber}` : "";
            if (fullPhone !== (user.phone || "")) payload.phone = fullPhone;
            if (!Object.keys(payload).length) {
              setActionStatus({ type: "error", message: "No changes to save." });
              return;
            }
            updateMutation.mutate({ userId: user.id, payload });
          }} style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input required value={editForm.firstName} onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))} style={inputStyle} />
              <input required value={editForm.lastName} onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))} style={inputStyle} />
            </div>
            <input required type="email" value={editForm.email} onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))} style={inputStyle} />

            {/* Phone with country code */}
            <div style={{ display: "flex" }}>
              <select
                value={editForm.phoneDialCode}
                onChange={(event) => setEditForm((prev) => ({ ...prev, phoneDialCode: event.target.value }))}
                style={{ ...inputStyle, width: "auto", borderRight: "none", borderRadius: "8px 0 0 8px", background: "#f8fafc", color: "#475569", cursor: "pointer" }}
              >
                {DIAL_CODES.map((c) => (
                  <option key={c.code + c.dial} value={c.dial}>{c.name} ({c.dial})</option>
                ))}
              </select>
              <input
                type="tel"
                value={editForm.phoneNumber}
                onChange={(event) => setEditForm((prev) => ({ ...prev, phoneNumber: event.target.value.replace(/\D/g, "") }))}
                style={{ ...inputStyle, borderRadius: "0 8px 8px 0", flex: 1 }}
              />
            </div>

            {updateMutation.isError && (
              <div style={{ padding: "8px 10px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={13} />
                {getErrorMessage(updateMutation.error, "Unable to update user.")}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={closeModal} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={updateMutation.isPending} style={{ border: "1px solid #2D368E", background: "#2D368E", color: "#fff", borderRadius: 8, padding: "8px 12px", cursor: updateMutation.isPending ? "not-allowed" : "pointer", opacity: updateMutation.isPending ? 0.7 : 1 }}>{updateMutation.isPending ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal.type === "role" && modal.user && (
        <Modal title="Change Role" onClose={closeModal}>
          <form onSubmit={(event) => {
            event.preventDefault();
            if (roleForm === modal.user.role) {
              setActionStatus({ type: "error", message: "User already has this role." });
              return;
            }
            changeRoleMutation.mutate({ userId: modal.user.id, role: roleForm });
          }} style={{ display: "grid", gap: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>Change role for <strong>{modal.user.name}</strong></p>
            <select value={roleForm} onChange={(event) => setRoleForm(event.target.value)} style={inputStyle}>
              {ROLE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={closeModal} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={changeRoleMutation.isPending} style={{ border: "1px solid #2D368E", background: "#2D368E", color: "#fff", borderRadius: 8, padding: "8px 12px", cursor: changeRoleMutation.isPending ? "not-allowed" : "pointer", opacity: changeRoleMutation.isPending ? 0.7 : 1 }}>{changeRoleMutation.isPending ? "Updating..." : "Update"}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal.type === "status" && modal.user && (
        <Modal title="Change Status" onClose={closeModal}>
          <form onSubmit={(event) => {
            event.preventDefault();
            if (statusForm.status === modal.user.status && !statusForm.reason.trim()) {
              setActionStatus({ type: "error", message: "Select different status or add reason." });
              return;
            }
            changeStatusMutation.mutate({ userId: modal.user.id, status: statusForm.status, reason: statusForm.reason.trim() });
          }} style={{ display: "grid", gap: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>Change status for <strong>{modal.user.name}</strong></p>
            <select value={statusForm.status} onChange={(event) => setStatusForm((prev) => ({ ...prev, status: event.target.value }))} style={inputStyle}>
              {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <textarea rows={3} value={statusForm.reason} onChange={(event) => setStatusForm((prev) => ({ ...prev, reason: event.target.value }))} placeholder="Reason (optional)" style={{ ...inputStyle, resize: "vertical" }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={closeModal} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={changeStatusMutation.isPending} style={{ border: "1px solid #2D368E", background: "#2D368E", color: "#fff", borderRadius: 8, padding: "8px 12px", cursor: changeStatusMutation.isPending ? "not-allowed" : "pointer", opacity: changeStatusMutation.isPending ? 0.7 : 1 }}>{changeStatusMutation.isPending ? "Updating..." : "Update"}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal.type === "delete" && modal.user && (
        <Modal title="Delete User" onClose={closeModal}>
          <form onSubmit={(event) => { event.preventDefault(); deleteMutation.mutate(modal.user.id); }} style={{ display: "grid", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>Delete <strong>{modal.user.name}</strong>? This action cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={closeModal} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={deleteMutation.isPending} style={{ border: "1px solid #dc2626", background: "#dc2626", color: "#fff", borderRadius: 8, padding: "8px 12px", cursor: deleteMutation.isPending ? "not-allowed" : "pointer", opacity: deleteMutation.isPending ? 0.7 : 1 }}>{deleteMutation.isPending ? "Deleting..." : "Delete"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
