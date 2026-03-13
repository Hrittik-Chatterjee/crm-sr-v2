import { lazy } from "react";
import { LayoutDashboard, FolderPlus, Users, UserPlus, FolderCog } from "lucide-react";
import type { ISidebarItem } from "@/types";

const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AddBusiness = lazy(() => import("@/pages/admin/AddBusiness"));
const ManageBusinesses = lazy(() => import("@/pages/admin/ManageBusinesses"));
const AddUser = lazy(() => import("@/pages/admin/AddUser"));
const ManageUsers = lazy(() => import("@/pages/admin/ManageUsers"));

export const adminSidebarItems: ISidebarItem[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Admin Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
        component: AdminDashboard,
      },
    ],
  },
  {
    title: "Business Management",
    items: [
      {
        title: "Add Business",
        url: "/admin/add-business",
        icon: FolderPlus,
        component: AddBusiness,
      },
      {
        title: "Manage Businesses",
        url: "/admin/businesses",
        icon: FolderCog,
        component: ManageBusinesses,
      },
    ],
  },
  {
    title: "User Management",
    items: [
      {
        title: "Add User",
        url: "/admin/add-user",
        icon: UserPlus,
        component: AddUser,
      },
      {
        title: "Manage Users",
        url: "/admin/manage-users",
        icon: Users,
        component: ManageUsers,
      },
    ],
  },
];
