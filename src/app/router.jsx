import { createBrowserRouter } from "react-router-dom";
import Homepage from "../features/home/pages/Homepage";
// import LoginPage from "@/features/auth/pages/LoginPage";
// import ListingsPage from "@/features/listings/pages/ListingsPage";

export const router = createBrowserRouter([
    {path: "/", element: <Homepage/>}
//   { path: "/login", element: <LoginPage /> },
//   { path: "/listings", element: <ListingsPage /> },
]);
