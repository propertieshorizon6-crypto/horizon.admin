import { useState, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { router } from "./router";
import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { queryClient } from "../lib/queryClient";
import ErrorBoundary from "../components/ErrorBoundary";
import SplashScreen from "../components/SplashScreen";


export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <ErrorBoundary>
      <QueryProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <AnimatePresence>
            {showSplash && <SplashScreen />}
          </AnimatePresence>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
