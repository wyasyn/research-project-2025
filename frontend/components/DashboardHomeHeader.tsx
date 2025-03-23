"use client";

import { PanelRightOpen } from "lucide-react";
import ModeToggle from "./mode-toggle";
import { Button } from "./ui/button";
import { useSidebar } from "@/providers/sidebar-provider";

export default function DashboardHomeHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex justify-between items-center py-4 ">
      <Button
        className="rounded-full"
        variant="ghost"
        size="icon"
        aria-label="Add new item"
        onClick={toggleSidebar}
      >
        <PanelRightOpen size={16} aria-hidden="true" />
      </Button>
      <div className="flex items-center gap-3">
        {/* TODO: Search */}
        <div>search</div>
        <ModeToggle />
      </div>
    </header>
  );
}
