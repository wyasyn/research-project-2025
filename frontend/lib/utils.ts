import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, parseISO } from "date-fns";
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

export function formatFriendlyTime(isoString: string): string {
  const date = parseISO(isoString);

  if (isToday(date)) {
    return `Today, ${format(date, "h:mm a")}`;
  }

  if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  }

  return format(date, "MMMM d, yyyy, h:mm a"); // fallback
}

export function formatStartTimeFull(isoTime: string): string {
  const date = new Date(isoTime);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};
