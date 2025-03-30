"use client";

import { LogOutIcon } from "lucide-react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { deleteTokens } from "@/lib/actions/auth";

export default function Logout() {
  return (
    <DropdownMenuItem
      onClick={async () => {
        await deleteTokens();
      }}
    >
      <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
      <span>Logout</span>
    </DropdownMenuItem>
  );
}
