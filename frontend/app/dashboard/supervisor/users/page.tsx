import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import React, { Suspense } from "react";
import UsersList from "../../_components/admin/UsersData";

export default function page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <UsersList />
    </Suspense>
  );
}
