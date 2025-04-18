import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export default function DashboardLoading() {
  return (
    <Button variant={"ghost"} size={"icon"}>
      <Loader2 className="animate-spin" />
    </Button>
  );
}
