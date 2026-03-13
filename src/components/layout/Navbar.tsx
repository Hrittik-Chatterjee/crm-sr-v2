import { Link } from "react-router";
import { useLogoutMutation, useGetCurrentUserQuery } from "@/redux/features/auth/authApi";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ModeToggle } from "./ModeToggle";
import { role } from "@/constants/role";

export default function Navbar() {
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();
  const { data } = useGetCurrentUserQuery();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      // Clear stored token (mobile fallback)
      localStorage.removeItem("auth_token");
      toast.success("Logged out successfully", { duration: 1000 });
      navigate("/login");
    } catch (error) {
      // Still clear token and redirect even if API fails
      localStorage.removeItem("auth_token");
      toast.error("Failed to logout", { duration: 1000 });
      navigate("/login");
    }
  };

  // Check if user is admin or super admin
  const isAdmin = data?.data?.roles.includes(role.admin) || data?.data?.roles.includes(role.superAdmin);

  return (
    <div className="flex items-center gap-4">
      {isAdmin && (
        <Link 
          to="/admin/dashboard" 
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Admin Dashboard
        </Link>
      )}
      <ModeToggle />
      <Button variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}
