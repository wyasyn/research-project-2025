"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { usePathname, useRouter } from "next/navigation";
import { ReactElement } from "react";

export default function NavItem({
  name,
  icon,
  link,
}: {
  name: string;
  icon: ReactElement;
  link: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive =
    link === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(link);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? "default" : "ghost"}
            size="icon"
            aria-label="Home"
            onClick={() => router.push(link)}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="px-2 py-1 text-xs">
          {name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
