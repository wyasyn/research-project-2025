"use client";
import React from "react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { BoltIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardRoutes() {
  const router = useRouter();
  return (
    <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
      <BoltIcon size={16} className="opacity-60" aria-hidden="true" />
      <span>Settings</span>
    </DropdownMenuItem>
  );
}
