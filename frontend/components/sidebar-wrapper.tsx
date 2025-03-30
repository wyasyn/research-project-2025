"use client";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/providers/sidebar-provider";
import React from "react";

export default function SidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebar();
  return (
    <nav
      className={cn(
        "fixed top-2 bottom-2 py-3 border rounded-lg bg-secondary flex flex-col gap-14 w-[50px] items-center duration-300 transition-all",
        isOpen ? "left-2" : "-left-[60px]"
      )}
    >
      {children}
    </nav>
  );
}
