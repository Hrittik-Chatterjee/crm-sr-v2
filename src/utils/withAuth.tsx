import { Navigate } from "react-router";
import { useGetCurrentUserQuery } from "@/redux/features/auth/authApi";
import type { UserRole } from "@/constants/role";
import type { ComponentType } from "react";

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  requiredRoles?: UserRole | UserRole[]
) {
  return function AuthenticatedComponent(props: P) {
    const { data, isLoading, isError } = useGetCurrentUserQuery();

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (isError || !data?.data) {
      return <Navigate to="/login" replace />;
    }

    // Check if user has required role(s) in their roles array
    if (requiredRoles) {
      const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      const hasRequiredRole = rolesArray.some(role => data.data.roles.includes(role));
      
      if (!hasRequiredRole) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    return <Component {...props} />;
  };
}
