"use client";

import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { CreateSessionDialog } from "./create";

export default function NewSession() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  return (
    <div className="flex items-center justify-end mb-8">
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <CalendarPlus className="mr-2 h-4 w-4" />
        Create Session
      </Button>
      <CreateSessionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
