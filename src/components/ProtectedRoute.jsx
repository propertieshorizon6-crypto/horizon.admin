import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated     = useAuthStore((s) => s._hasHydrated);

  // Wait until the persist store has rehydrated from storage before deciding.
  // Without this, isAuthenticated is briefly false on every page reload,
  // causing an incorrect redirect to /auth.
  if (!hasHydrated) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}