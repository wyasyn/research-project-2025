"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsBtn() {
  const router = useRouter();
  return (
    <div className="mt-auto">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Settings"
              onClick={() => router.push("/dashboard/settings")}
            >
              <Settings size={16} aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="px-2 py-1 text-xs">
            Settings
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
