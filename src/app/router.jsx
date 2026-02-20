import { createBrowserRouter } from "react-router-dom";

import Homepage from "../features/home/pages/Homepage";
import AuthPage from "../features/auth/pages/AuthPage";

// import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import DashboardLayout from "../components/layouts/DashboardLayout";

export const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <Homepage />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },

  // Admin Protected Routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
    ],
  },
]);