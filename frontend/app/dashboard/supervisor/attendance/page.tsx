import React from "react";
import { DashboardHeader } from "../../_components/dashboard-header";
import { AttendanceManagement } from "../_components/attendance/management";

export default function page() {
  return (
    <main>
      <DashboardHeader
        heading="Attendance Management"
        text="Create and manage attendance sessions."
      />
      <AttendanceManagement />
    </main>
  );
}
