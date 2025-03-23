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
        "fixed top-0 bottom-0 py-3 border-r bg-secondary flex flex-col gap-14 w-[50px] items-center duration-300 transition-all",
        isOpen ? "left-0" : "-left-[60px]"
      )}
    >
      {children}
    </nav>
  );
}
