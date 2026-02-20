import { createBrowserRouter } from "react-router-dom";

import Homepage from "../features/home/pages/Homepage";
import AuthPage from "../features/auth/pages/AuthPage";

// import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardPage from "../features/dashboard/page/DashboardPage";

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
        {/* <AdminLayout /> */}
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