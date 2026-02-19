import { createBrowserRouter } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import ListingsPage from "@/features/listings/pages/ListingsPage";

export const router = createBrowserRouter([
    {path: "/", element: <HomePage/>}
//   { path: "/login", element: <LoginPage /> },
//   { path: "/listings", element: <ListingsPage /> },
]);
