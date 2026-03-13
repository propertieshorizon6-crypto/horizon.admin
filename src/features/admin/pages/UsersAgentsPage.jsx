import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { Search, ChevronDown, UserPlus, X, AlertCircle, CheckCircle2 } from "lucide-react";
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
const ALLOWED_ROLES = new Set(["Agent", "Manager", "Admin"]);
const ROLE_OPTIONS = ["Agent", "Manager", "Admin"];
const STATUS_OPTIONS = ["Active", "Inactive", "Suspended"];
const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 13,
  boxSizing: "border-box",
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

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
          <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>{title}</h3>
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

  const { data: allUsers = [], isLoading } = useUsers();
  const { data: apiStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: fetchUserStats,
    staleTime: 1000 * 60 * 5,
  });

  const users = useMemo(
    () => allUsers.filter((user) => ALLOWED_ROLES.has(user.role)),
    [allUsers],
  );

  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);
  const [modal, setModal] = useState({ type: "", user: null });
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Agent",
    password: "",
  });
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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
      setActionStatus({ type: "success", message: "User created successfully." });
    },
    onError: (error) =>
      setActionStatus({ type: "error", message: getErrorMessage(error, "Unable to create user.") }),
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

  const stats = useMemo(() => {
    const local = {
      total: users.length,
      active: users.filter((user) => user.status === "Active").length,
      agents: users.filter((user) => user.role === "Agent").length,
      admins: users.filter((user) => user.role === "Admin" || user.role === "Manager").length,
    };
    return {
      total: apiStats?.total ?? local.total,
      active: local.active,
      agents: apiStats?.agents ?? local.agents,
      admins: apiStats?.adminsManagers ?? local.admins,
    };
  }, [users, apiStats]);

  const filteredData = useMemo(() => {
    let data = users;
    if (roleFilter) data = data.filter((user) => user.role === roleFilter);
    if (statusFilter) data = data.filter((user) => user.status === statusFilter);
    if (globalFilter) {
      const query = globalFilter.toLowerCase();
      data = data.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query),
      );
    }
    return data;
  }, [users, roleFilter, statusFilter, globalFilter]);

  const columns = useMemo(() => [
    columnHelper.accessor("name", {
      header: "User",
      cell: (info) => (
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{info.getValue()}</p>
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
              setEditForm({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
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
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (selectedUser) return <UserDetailPage user={selectedUser} onBack={() => setSelectedUser(null)} />;

  if (isLoading) {
    return (
      <div style={{ padding: 28, color: "#64748b", fontSize: 13 }}>
        Loading users...
      </div>
    );
  }

  const closeModal = () => setModal({ type: "", user: null });

  return (
    <div style={{ padding: "28px 24px", minHeight: "100%", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Users & Agents</h1>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Manage team members and their roles</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setCreateForm({ firstName: "", lastName: "", email: "", phone: "", role: "Agent", password: "" });
              setModal({ type: "create", user: null });
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #1e293b", background: "#1e293b", color: "#fff", borderRadius: 8, padding: "8px 12px", fontSize: 13, cursor: "pointer" }}
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
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{value}</p>
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

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
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
      </div>

      {modal.type === "create" && (
        <Modal title="Create User" onClose={closeModal}>
          <form onSubmit={(event) => { event.preventDefault(); createMutation.mutate(createForm); }} style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input required placeholder="First name" value={createForm.firstName} onChange={(event) => setCreateForm((prev) => ({ ...prev, firstName: event.target.value }))} style={inputStyle} />
              <input required placeholder="Last name" value={createForm.lastName} onChange={(event) => setCreateForm((prev) => ({ ...prev, lastName: event.target.value }))} style={inputStyle} />
            </div>
            <input required type="email" placeholder="Email" value={createForm.email} onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))} style={inputStyle} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input placeholder="Phone" value={createForm.phone} onChange={(event) => setCreateForm((prev) => ({ ...prev, phone: event.target.value }))} style={inputStyle} />
              <select value={createForm.role} onChange={(event) => setCreateForm((prev) => ({ ...prev, role: event.target.value }))} style={inputStyle}>
                {ROLE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <input required type="password" placeholder="Password" value={createForm.password} onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))} style={inputStyle} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={closeModal} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={createMutation.isPending} style={{ border: "1px solid #1e293b", background: "#1e293b", color: "#fff", borderRadius: 8, padding: "8px 12px", cursor: createMutation.isPending ? "not-allowed" : "pointer", opacity: createMutation.isPending ? 0.7 : 1 }}>{createMutation.isPending ? "Creating..." : "Create"}</button>
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
            if ((editForm.phone || "").trim() !== (user.phone || "").trim()) payload.phone = editForm.phone.trim();
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
            <input value={editForm.phone} onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))} style={inputStyle} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={closeModal} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={updateMutation.isPending} style={{ border: "1px solid #1e293b", background: "#1e293b", color: "#fff", borderRadius: 8, padding: "8px 12px", cursor: updateMutation.isPending ? "not-allowed" : "pointer", opacity: updateMutation.isPending ? 0.7 : 1 }}>{updateMutation.isPending ? "Saving..." : "Save"}</button>
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
              <button type="submit" disabled={changeRoleMutation.isPending} style={{ border: "1px solid #1e293b", background: "#1e293b", color: "#fff", borderRadius: 8, padding: "8px 12px", cursor: changeRoleMutation.isPending ? "not-allowed" : "pointer", opacity: changeRoleMutation.isPending ? 0.7 : 1 }}>{changeRoleMutation.isPending ? "Updating..." : "Update"}</button>
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
              <button type="submit" disabled={changeStatusMutation.isPending} style={{ border: "1px solid #1e293b", background: "#1e293b", color: "#fff", borderRadius: 8, padding: "8px 12px", cursor: changeStatusMutation.isPending ? "not-allowed" : "pointer", opacity: changeStatusMutation.isPending ? 0.7 : 1 }}>{changeStatusMutation.isPending ? "Updating..." : "Update"}</button>
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
