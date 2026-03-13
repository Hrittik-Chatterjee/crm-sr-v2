import { adminSidebarItems } from "@/routes/adminSidebarItems";
import { regularUserSidebarItems } from "@/routes/regularUserSidebarItems";
import { role } from "@/constants/role";
import type { ISidebarItem } from "@/types";

export const getSidebarItems = (
  isOnAdminRoute: boolean,
  userRoles?: string[]
): ISidebarItem[] => {
  // Show sidebar based on current route, not user role
  // This allows admins to see regular dashboard when on regular routes
  // and admin dashboard only when on admin routes
  if (isOnAdminRoute) {
    return adminSidebarItems;
  }

  // Filter regular user sidebar items based on roles
  if (userRoles) {
    const hasVideoEditorRole = userRoles.includes(role.videoEditor);
    const hasContentDesignerRole = userRoles.includes(role.contentDesigner);
    const hasContentWriterRole = userRoles.includes(role.contentWriter);

    // If user is ONLY video editor or content designer (not content writer),
    // remove Write Content from sidebar
    if ((hasVideoEditorRole || hasContentDesignerRole) && !hasContentWriterRole) {
      return regularUserSidebarItems.map((section) => ({
        ...section,
        items: section.items.filter((item) => item.url !== "/dashboard/write"),
      }));
    }
  }

  return regularUserSidebarItems;
};
