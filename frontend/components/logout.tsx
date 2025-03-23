"use client";

import { LogOutIcon } from "lucide-react";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { logout } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();
  return (
    <DropdownMenuItem
      onClick={async () => {
        await logout();
        router.push("/login");
      }}
    >
      <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
      <span>Logout</span>
    </DropdownMenuItem>
  );
}
