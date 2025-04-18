import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { adminSidebarLinks, supervisorLinks, userLinks } from "./sidebar-limks";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSidebarLinks(role: string) {
  switch (role) {
    case "admin":
      return adminSidebarLinks;
    case "supervisor":
      return supervisorLinks;
    case "user":
      return userLinks;
    default:
      return null;
  }
}
