import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

const MENU_WIDTH = 176;
const MENU_HEIGHT = 140;
const MENU_GAP = 6;
const VIEWPORT_PADDING = 8;

const getMenuPosition = (buttonEl) => {
  const rect = buttonEl.getBoundingClientRect();

  let left = rect.right - MENU_WIDTH;
  left = Math.max(VIEWPORT_PADDING, Math.min(left, window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING));

  const spaceBelow = window.innerHeight - rect.bottom;
  const placeAbove = spaceBelow < MENU_HEIGHT;
  const top = placeAbove
    ? Math.max(VIEWPORT_PADDING, rect.top - MENU_HEIGHT - MENU_GAP)
    : rect.bottom + MENU_GAP;

  return { top, left };
};

export default function LeadActionsMenu({ lead, onViewDetails, onChangePriority }) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const updateMenuPosition = useCallback(() => {
    if (!buttonRef.current) return;
    setMenuPosition(getMenuPosition(buttonRef.current));
  }, []);

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

  const handleAction = (action) => (e) => {
    e.stopPropagation();
    setOpen(false);
    action?.(lead);
  };

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
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        border: "1px solid #e2e8f0",
        minWidth: MENU_WIDTH,
        overflow: "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ padding: "8px 14px 6px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #f1f5f9" }}>
        Actions
      </div>

      <button
        onClick={handleAction(onViewDetails)}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 14px", background: "transparent", border: "none", cursor: "pointer", fontSize: 13, color: "#334155", textAlign: "left" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
        View Details
      </button>

      <button
        onClick={handleAction(onChangePriority)}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 14px", background: "transparent", border: "none", cursor: "pointer", fontSize: 13, color: "#334155", textAlign: "left" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
        Change Priority
      </button>
    </div>
  ) : null;

  return (
    <div style={{ display: "inline-block" }}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          if (open) {
            setOpen(false);
            return;
          }
          updateMenuPosition();
          setOpen(true);
        }}
        style={{ padding: 6, borderRadius: 7, border: "none", background: open ? "#f1f5f9" : "transparent", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = "transparent"; }}
      >
        <MoreHorizontal size={16} />
      </button>
      {typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </div>
  );
}
