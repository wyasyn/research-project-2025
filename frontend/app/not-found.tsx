import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="flex flex-col justify-center items-center gap-4 p-6 md:p-10">
        <h2 className="text-5xl">Not Found</h2>
        <p>Could not find requested resource</p>

        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
