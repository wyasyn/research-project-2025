import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";
import React from "react";

export default function SupervisorStats() {
  return (
    <section>
      <div>
        <div>
          <span>Total Sessions</span>
          <CalendarCheck className="w-5 h-5" />
        </div>
        <p>124</p>
        <Button variant={"link"} size={"sm"}>
          View More
        </Button>
      </div>
    </section>
  );
}
