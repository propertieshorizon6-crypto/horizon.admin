import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated     = useAuthStore((s) => s._hasHydrated);

  
  if (!hasHydrated) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}