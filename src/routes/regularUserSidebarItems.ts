import { lazy } from "react";
import { LayoutDashboard, PenLine, Building2 } from "lucide-react";
import type { ISidebarItem } from "@/types";

const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const WriteContent = lazy(() => import("@/pages/dashboard/WriteContent"));
const Businesses = lazy(() => import("@/pages/dashboard/Businesses"));

export const regularUserSidebarItems: ISidebarItem[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        component: Dashboard,
      },
      {
        title: "Write Content",
        url: "/dashboard/write",
        icon: PenLine,
        component: WriteContent,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Businesses",
        url: "/dashboard/businesses",
        icon: Building2,
        component: Businesses,
      },
    ],
  },
];
