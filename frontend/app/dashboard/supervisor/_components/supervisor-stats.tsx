import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function SupervisorStats() {
  return (
    <section className="my-4 flex w-full justify-end">
      <div className="flex items-center justify-center flex-col">
        <div className="flex items-center justify-center flex-col">
          <span>Total Sessions</span>
          <CalendarCheck className="w-5 h-5" />
        </div>
        <p className="text-foreground">124</p>
        <Button variant={"link"} size={"sm"} asChild>
          <Link href={"/dashboard/supervisor/attendance"}>View More</Link>
        </Button>
      </div>
    </section>
  );
}
