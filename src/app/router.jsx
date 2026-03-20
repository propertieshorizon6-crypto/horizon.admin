// 📁 src/app/router.jsx

import { createBrowserRouter, Navigate } from "react-router-dom";
import Homepage          from "../features/home/pages/Homepage";
import AuthPage             from "../features/auth/pages/AuthPage";
import ForgotPasswordPage  from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage   from "../features/auth/pages/ResetPasswordPage";
import ProtectedRoute    from "../components/ProtectedRoute";
import DashboardLayout   from "../components/layouts/DashboardLayout";
import DashboardPage     from "../features/dashboard/pages/DashboardPage";
import LeadsPage         from "../features/admin/pages/LeadsPage";
import InquiriesPage     from "../features/admin/pages/InquiriesPage";
import TourRequestsPage  from "../features/admin/pages/TourRequestsPage";
import ConversationsPage from "../features/admin/pages/ConversationsPage";
import PropertiesPage    from "../features/admin/pages/PropertiesPage";
import UsersAgentsPage   from "../features/admin/pages/UsersAgentsPage";
import NotificationsPage from "../features/admin/pages/NotificationsPage";
import AuditLogsPage     from "../features/admin/pages/AuditLogsPage";
import SettingsPage      from "../features/settings/pages/SettingsPage"; // ← new

export const router = createBrowserRouter([
  { path: "/",     element: <Homepage /> },
  { path: "/auth",                  element: <AuthPage /> },
  { path: "/auth/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/auth/reset-password",  element: <ResetPasswordPage /> },

  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,           element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard",     element: <DashboardPage />     },
      { path: "leads",         element: <LeadsPage />         },
      { path: "inquiries",     element: <InquiriesPage />     },
      { path: "tour-requests", element: <TourRequestsPage />  },
      { path: "conversations", element: <ConversationsPage /> },
      { path: "listings",      element: <PropertiesPage />    },
      { path: "agents",        element: <UsersAgentsPage />   },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "audit-logs",    element: <AuditLogsPage />     },
      { path: "settings",      element: <SettingsPage />      }, // ← new
      { path: "*",             element: <Navigate to="/admin/dashboard" replace /> },
    ],
  },

  { path: "*", element: <Navigate to="/auth" replace /> },
]);