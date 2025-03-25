import { Users, Building, LayoutDashboard, Shield } from "lucide-react";
export const adminSidebarLinks = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={24} aria-hidden="true" />,
    link: "/dashboard/admin",
  },
  {
    name: "Organization",
    icon: <Building size={24} aria-hidden="true" />,
    link: "/dashboard/admin/organization",
  },
  {
    name: "Supervisors",
    icon: <Shield size={24} aria-hidden="true" />,
    link: "/dashboard/admin/supervisors",
  },
  {
    name: "Users",
    icon: <Users size={24} aria-hidden="true" />,
    link: "/dashboard/admin/users",
  },
];
