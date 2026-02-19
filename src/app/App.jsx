import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { QueryProvider } from "./providers/QueryProvider.";
import { AuthProvider } from "./providers/AuthProvider";


export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryProvider>
  );
}
