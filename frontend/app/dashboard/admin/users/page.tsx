import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Suspense } from "react";
import UsersList from "../../_components/admin/UsersData";

export default function page() {
  return (
    <div>
      <Suspense fallback={<LoadingSkeleton />}>
        <UsersList />
      </Suspense>
    </div>
  );
}
