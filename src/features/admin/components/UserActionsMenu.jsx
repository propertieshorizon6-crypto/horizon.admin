import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  ShieldCheck,
  UserCog,
  ToggleLeft,
  Trash2,
} from "lucide-react";

const MENU_WIDTH = 198;
const MENU_GAP = 6;
const VIEWPORT_PADDING = 8;

const actionButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "10px 14px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  color: "#000000",
  textAlign: "left",
};

const getMenuPosition = (buttonEl, menuHeight) => {
  const rect = buttonEl.getBoundingClientRect();

  let left = rect.right - MENU_WIDTH;
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING),
  );

  const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
  const shouldPlaceAbove = spaceBelow < menuHeight + MENU_GAP;
  const top = shouldPlaceAbove
    ? Math.max(VIEWPORT_PADDING, rect.top - menuHeight - MENU_GAP)
    : rect.bottom + MENU_GAP;

  return { top, left };
};

function ActionItem({ icon, label, onClick, tone = "default" }) {
  const toneStyle = tone === "danger" ? { color: "#dc2626" } : {};

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...actionButtonStyle, ...toneStyle }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {icon}
      {label}
    </button>
  );
}

export default function UserActionsMenu({
  user,
  currentUserRole = "",
  currentUserId = "",
  onViewDetails,
  onEditUser,
  onChangeRole,
  onChangeStatus,
  onVerifyAgent,
  onDeleteUser,
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const roleKey = String(currentUserRole || "").toLowerCase();
  const isAdmin = roleKey === "admin";
  const isSelf = Boolean(currentUserId) && String(currentUserId) === String(user?.id);
  const canVerifyAgent = user?.role === "Agent" && !isSelf;

  const actionCount = useMemo(
    () =>
      2 +
      (isAdmin && !isSelf ? 1 : 0) +
      (!isSelf ? 1 : 0) +
      (canVerifyAgent ? 1 : 0) +
      (!isSelf ? 1 : 0),
    [isAdmin, isSelf, canVerifyAgent],
  );
  const menuHeight = 34 + actionCount * 40;

  const updateMenuPosition = useCallback(() => {
    if (!buttonRef.current) return;
    setMenuPosition(getMenuPosition(buttonRef.current, menuHeight));
  }, [menuHeight]);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const handleOutsideClick = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      if (buttonRef.current?.contains(e.target)) return;
      setOpen(false);
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    const handleViewportChange = () => updateMenuPosition();

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open, updateMenuPosition]);

  const menu = open && menuPosition ? (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: menuPosition.top,
        left: menuPosition.left,
        zIndex: 2000,
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        border: "1px solid #e2e8f0",
        minWidth: MENU_WIDTH,
        overflow: "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          padding: "8px 14px 6px",
          fontSize: 11,
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        Actions
      </div>

      <ActionItem
        icon={<Eye size={15} color="#64748b" />}
        label="View Details"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
          onViewDetails?.(user);
        }}
      />

      <ActionItem
        icon={<Pencil size={15} color="#64748b" />}
        label="Edit User"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
          onEditUser?.(user);
        }}
      />

      {isAdmin && !isSelf && (
        <ActionItem
          icon={<UserCog size={15} color="#64748b" />}
          label="Change Role"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            onChangeRole?.(user);
          }}
        />
      )}

      {!isSelf && (
        <ActionItem
          icon={<ToggleLeft size={15} color="#64748b" />}
          label="Change Status"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            onChangeStatus?.(user);
          }}
        />
      )}

      {canVerifyAgent && (
        <ActionItem
          icon={<ShieldCheck size={15} color="#16a34a" />}
          label="Verify Agent"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            onVerifyAgent?.(user);
          }}
        />
      )}

      {!isSelf && (
        <ActionItem
          icon={<Trash2 size={15} color="#dc2626" />}
          label="Delete User"
          tone="danger"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            onDeleteUser?.(user);
          }}
        />
      )}
    </div>
  ) : null;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (open) {
            setOpen(false);
            return;
          }
          updateMenuPosition();
          setOpen(true);
        }}
        style={{
          padding: "6px 8px",
          borderRadius: 8,
          border: "none",
          background: open ? "#f1f5f9" : "transparent",
          cursor: "pointer",
          color: "#94a3b8",
          display: "flex",
          alignItems: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = "transparent";
        }}
      >
        <MoreHorizontal size={16} />
      </button>

      {typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </div>
  );
}
