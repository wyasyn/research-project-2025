import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getTotalSessions } from "./attendance";

export default async function SupervisorStats() {
  const { totalSessions, error } = await getTotalSessions();
  if (error) {
    return <div>{error}</div>;
  }
  return (
    <section className="my-4 flex w-full justify-end">
      <div className="flex items-center justify-center flex-col">
        <div className="flex items-center justify-center flex-col">
          <span>Total Sessions</span>
          <CalendarCheck className="w-5 h-5" />
        </div>
        <p className="text-foreground">{totalSessions ? totalSessions : 0}</p>
        <Button variant={"link"} size={"sm"} asChild>
          <Link href={"/dashboard/supervisor/attendance"}>View More</Link>
        </Button>
      </div>
    </section>
  );
}
