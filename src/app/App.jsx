import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { queryClient } from "../lib/queryClient";
import ErrorBoundary from "../components/ErrorBoundary";


export default function App() {
  return (
    <ErrorBoundary>
      <QueryProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
