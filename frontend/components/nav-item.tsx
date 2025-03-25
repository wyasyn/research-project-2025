"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

  const isActive = pathname === link;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Home"
            onClick={() => router.push(link)}
            className={cn(
              "duration-300 transition-all",
              isActive
                ? "text-primary hover:text-primary/75"
                : "text-muted-foreground hover:text-foreground/75"
            )}
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
