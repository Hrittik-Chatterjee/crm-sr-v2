import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import App from "@/App";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { withAuth } from "@/utils/withAuth";
import { role } from "@/constants/role";
import { generateRoutes } from "@/utils/generateRoutes";
import { adminSidebarItems } from "./adminSidebarItems";
import { regularUserSidebarItems } from "./regularUserSidebarItems";

// Lazy load pages for better initial load performance
const Login = lazy(() => import("@/pages/Login"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const EditBusiness = lazy(() => import("@/pages/admin/EditBusiness"));
const EditUser = lazy(() => import("@/pages/admin/EditUser"));

// Create protected layouts
// Common dashboard - all authenticated users (CW, CD, VE)
const ProtectedDashboardLayout = withAuth(DashboardLayout);
// Admin dashboard - only super admin and admin
const AdminDashboardLayout = withAuth(DashboardLayout, [role.superAdmin, role.admin]);

export const router = createBrowserRouter([
  {
    Component: App,
    path: "/",
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
    ],
  },
  {
    Component: ProtectedDashboardLayout,
    path: "/dashboard",
    children: [
      ...generateRoutes(regularUserSidebarItems),
    ],
  },
  {
    Component: AdminDashboardLayout,
    path: "/admin",
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" /> },
      ...generateRoutes(adminSidebarItems),
      // Dynamic route parameters
      { path: "edit-business/:id", Component: EditBusiness },
      { path: "edit-user/:id", Component: EditUser },
    ],
  },
  {
    Component: Login,
    path: "login",
  },
  {
    Component: Unauthorized,
    path: "/unauthorized",
  },
  {
    Component: NotFound,
    path: "*",
  },
]);
