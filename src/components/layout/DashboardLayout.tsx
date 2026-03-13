import { Outlet } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  useLogoutMutation,
  useGetCurrentUserQuery,
} from "@/redux/features/auth/authApi";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { ModeToggle } from "./ModeToggle";
import { role } from "@/constants/role";

export default function DashboardLayout() {
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();
  const { data } = useGetCurrentUserQuery();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      // Clear stored token (mobile fallback)
      localStorage.removeItem("auth_token");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      // Still clear token and redirect even if API fails
      localStorage.removeItem("auth_token");
      toast.error("Failed to logout");
      navigate("/login");
    }
  };

  // Check if user is admin or super admin
  const isAdmin =
    data?.data?.roles.includes(role.admin) ||
    data?.data?.roles.includes(role.superAdmin);
  const isOnAdminRoute = window.location.pathname.startsWith("/admin");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  href={isOnAdminRoute ? "/admin/dashboard" : "/dashboard"}
                >
                  SR Creative Hub
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2 sm:gap-4 flex-wrap">
            {isAdmin && (
              <>
                {isOnAdminRoute ? (
                  <Link
                    to="/dashboard"
                    className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    View Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/admin/dashboard"
                    className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
            <ModeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs sm:text-sm"
            >
              Logout
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
