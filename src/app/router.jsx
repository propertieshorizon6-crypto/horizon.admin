// 📁 src/app/router.jsx

import { createBrowserRouter, Navigate } from "react-router-dom";
import Homepage       from "../features/home/pages/Homepage";
import AuthPage       from "../features/auth/pages/AuthPage";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../components/layouts/DashboardLayout";
import DashboardPage  from "../features/dashboard/pages/DashboardPage";

export const router = createBrowserRouter([
  // Public Routes
  { path: "/",     element: <Homepage /> },
  { path: "/auth", element: <AuthPage /> },

  // Protected Admin Routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      // /admin → /admin/dashboard automatically
      { index: true,       element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      // Add more routes here:
      // { path: "leads",      element: <LeadsPage /> },
      // { path: "listings",   element: <ListingsPage /> },
    ],
  },

  // Fallback
  { path: "*", element: <Navigate to="/auth" replace /> },
]);