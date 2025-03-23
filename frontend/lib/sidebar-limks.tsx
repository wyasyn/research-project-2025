import { Users, Building, LayoutDashboard, User } from "lucide-react";
export const adminSidebarLinks = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} aria-hidden="true" />,
    link: "/dashboard",
  },
  {
    name: "Organization",
    icon: <Building size={20} aria-hidden="true" />,
    link: "/dashboard/admin/organization",
  },
  {
    name: "Supervisors",
    icon: <User size={20} aria-hidden="true" />,
    link: "/dashboard/admin/supervisors",
  },
  {
    name: "Users",
    icon: <Users size={20} aria-hidden="true" />,
    link: "/dashboard/admin/users",
  },
];
