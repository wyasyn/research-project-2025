import React, { Suspense } from "react";
import { DashboardHeader } from "../../_components/dashboard-header";
import { AttendanceManagement } from "../_components/attendance/management";
import { getAllSessions } from "../_components/attendance";
import { AttendanceSkeleton } from "./AttendanceSkeleton";
import { PaginationControls } from "../_components/PaginationControls";
import NewSession from "../_components/attendance/NewSession";

type SearchParams = Promise<{ page?: string }>;

export default async function AttendanceManagementPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1");
  const { sessions, pagination, error } = await getAllSessions(page);

  if (error) {
    return (
      <main className="p-4 text-center text-red-600">
        <p>⚠️ {error}</p>
      </main>
    );
  }

  if (!sessions || sessions.length === 0 || !pagination) {
    return (
      <main className="p-4 text-center text-muted-foreground">
        <NewSession />
        <p>No sessions found. Please create a new session to get started.</p>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4">
      <DashboardHeader
        heading="Attendance Management"
        text="Create and manage attendance sessions."
      />

      <Suspense fallback={<AttendanceSkeleton />}>
        <AttendanceManagement sessions={sessions} />
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.total_pages}
        />
      </Suspense>
    </main>
  );
}
