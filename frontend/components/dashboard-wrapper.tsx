"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/providers/sidebar-provider";

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebar();
  return (
    <div
      className={cn(
        "duration-300 transition-all px-1 md:px-12",
        isOpen ? "ml-[55px]" : ""
      )}
    >
      {children}
    </div>
  );
}
