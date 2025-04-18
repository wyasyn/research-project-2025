import {
  Users,
  Building,
  LayoutDashboard,
  Shield,
  UserRoundCheck,
  ChartPie,
} from "lucide-react";
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

export const supervisorLinks = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={24} aria-hidden="true" />,
    link: "/dashboard/supervisor",
  },
  {
    name: "Attendance",
    icon: <UserRoundCheck size={24} aria-hidden="true" />,
    link: "/dashboard/supervisor/attendance",
  },
  {
    name: "Reports",
    icon: <ChartPie size={24} aria-hidden="true" />,
    link: "/dashboard/supervisor/reports",
  },
  {
    name: "Users",
    icon: <Users size={24} aria-hidden="true" />,
    link: "/dashboard/supervisor/users",
  },
];

export const userLinks = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={24} aria-hidden="true" />,
    link: "/dashboard/users",
  },
];
